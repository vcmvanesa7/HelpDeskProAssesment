// src/app/api/paypal/capture-order/route.ts
import { NextResponse } from "next/server";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import connect from "@/lib/db";

import { Order } from "@/schemas/order.schema";
import { Cart } from "@/schemas/cart.schema";
import { Product } from "@/schemas/products/product.schema";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Initializes the PayPal SDK client with sandbox or live credentials.
 */
function paypalClient() {
  const env =
    process.env.PAYPAL_MODE === "sandbox"
      ? new checkoutNodeJssdk.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID!,
          process.env.PAYPAL_SECRET!
        )
      : new checkoutNodeJssdk.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID!,
          process.env.PAYPAL_SECRET!
        );

  return new checkoutNodeJssdk.core.PayPalHttpClient(env);
}

export async function GET(req: Request) {
  try {
    await connect();
    const session = await getServerSession(authOptions);

    /**
     * Require the user to be authenticated.
     */
    if (!session?.user?.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cart?payment=error`
      );
    }

    /**
     * PayPal returns the capture token as a query string param.
     * In Sandbox, this token is ALWAYS present and MUST be used.
     */
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cart?payment=error`
      );
    }

    /**
     * Capture the PayPal order using the token.
     */
    const client = paypalClient();
    const captureReq = new checkoutNodeJssdk.orders.OrdersCaptureRequest(token);
    captureReq.requestBody({});

    const capture = await client.execute(captureReq);

    const purchase = capture.result.purchase_units?.[0];

    /**
     * Sandbox places the amount in two different possible locations.
     */
    const amount =
      purchase?.amount?.value ||
      purchase?.payments?.captures?.[0]?.amount?.value;

    if (!amount) {
      console.error("NO AMOUNT FOUND:", purchase);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cart?payment=error`
      );
    }

    /**
     * Load user cart – this must not be empty.
     */
    const cart = await Cart.findOne({ userId: session.user.id }).lean();

    if (!cart || cart.items.length === 0) {
      console.error("CART EMPTY DURING CAPTURE");
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cart?payment=error`
      );
    }

    /**
     * Build the order items array.
     * Each cart item is enriched with product title and image.
     */
    const orderItems = await Promise.all(
      cart.items.map(async (i) => {
        const product = await Product.findById(i.productId).lean();

        return {
          productId: i.productId.toString(),
          qty: i.qty,
          priceAtAdd: i.priceAtAdd,
          variant: i.variant,
          title: product?.title ?? "Unknown Product",
          image: product?.images?.[0]?.url ?? "/placeholder.png",
        };
      })
    );

    /**
     * Create the order in MongoDB.
     * IMPORTANT: paypalOrderId MUST match the one we search for in /api/orders/[id]
     */
    await Order.create({
      userId: session.user.id,
      paypalOrderId: token,
      items: orderItems,
      total: Number(amount),
      paymentMethod: "paypal",
      status: "paid",
    });

    /**
     * Clear the cart after successful purchase.
     */
    await Cart.findOneAndUpdate({ userId: session.user.id }, { items: [] });

    /**
     * Redirect to success page.
     */
    // Detect locale from the referer or default to "es"
    const referer = req.headers.get("referer") || "";
    const localeMatch = referer.match(/\/(en|es)\//);
    const locale = localeMatch ? localeMatch[1] : "es";

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/${locale}/checkout/success?orderId=${token}`
    );
  } catch (err) {
    console.error("CAPTURE ORDER ERROR:", err);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/cart?payment=error`
    );
  }
}

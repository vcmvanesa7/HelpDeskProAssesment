// src/app/api/paypal/create-order/route.ts
import { NextResponse } from "next/server";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { total } = body;

    if (!total || total <= 0) {
      return NextResponse.json({ error: "Invalid total" }, { status: 400 });
    }

    const client = paypalClient();
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();

    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          description: "KOI Streetwear Order",
          amount: {
            currency_code: "USD",
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: total.toFixed(2),
              },
            },
          },
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_URL}/api/paypal/capture-order`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
      },
    });

    const response = await client.execute(request);

    return NextResponse.json({ id: response.result.id });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json({ error: "PayPal error" }, { status: 500 });
  }
}

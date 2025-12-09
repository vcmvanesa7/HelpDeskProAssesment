import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import connect from "@/lib/db";
import { Cart } from "@/schemas/cart.schema";
import { Product } from "@/schemas/products/product.schema";
import { updateCartSchema } from "@/lib/validators/cart.validator";

async function buildCartResponse(cartDoc: any) {
  if (!cartDoc) return { items: [] };

  const items = await Promise.all(
    cartDoc.items.map(async (i: any) => {
      const product = await Product.findById(i.productId).lean();
      return {
        productId: i.productId.toString(),
        qty: i.qty,
        priceAtAdd: i.priceAtAdd,
        variant: i.variant ?? undefined,
        title: product?.title ?? "Untitled",
        image: product?.images?.[0]?.url ?? "/placeholder.png",
      };
    })
  );

  return { items };
}

export async function PUT(req: Request) {
  try {
    await connect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const validated = await updateCartSchema.validate(body, {
      abortEarly: false,
    });

    const { productId, qty, variant } = validated;

    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      return NextResponse.json({ cart: { items: [] } });
    }

    const item = cart.items.find(
      (i) =>
        i.productId.toString() === productId &&
        i.variant === (variant ?? undefined)
    );

    if (!item) {
      return NextResponse.json({ cart: { items: [] } });
    }

    if (qty === 0) {
      cart.items = cart.items.filter(
        (i) =>
          !(
            i.productId.toString() === productId &&
            i.variant === (variant ?? undefined)
          )
      );
    } else {
      item.qty = qty;
    }

    await cart.save();

    const response = await buildCartResponse(cart);

    return NextResponse.json({ cart: response });
  } catch (err) {
    console.error("Update cart error:", err);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import connect from "@/lib/db";
import { Cart } from "@/schemas/cart.schema";
import { Product } from "@/schemas/products/product.schema";
import { removeFromCartSchema } from "@/lib/validators/cart.validator";

export async function DELETE(req: Request) {
  try {
    await connect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate request body
    const body = await req.json();
    const validated = await removeFromCartSchema.validate(body);
    const { productId, variant } = validated;

    // Fetch user's cart
    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      return NextResponse.json({ cart: { items: [] } });
    }

    // Remove the matching item
    cart.items = cart.items.filter(
      (i) =>
        !(
          i.productId.toString() === productId &&
          i.variant === (variant ?? undefined)
        )
    );

    await cart.save();

    // Rebuild the cart response to match GET output
    const items = await Promise.all(
      cart.items.map(async (i) => {
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

    return NextResponse.json({ cart: { items } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 400 }
    );
  }
}

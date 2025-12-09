import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";

import { Cart } from "@/schemas/cart.schema";
import { Product } from "@/schemas/products/product.schema";

export async function GET() {
  try {
    await connect();
    const session = await getServerSession(authOptions);

    // If no authenticated user, return an empty cart structure
    if (!session?.user?.id) {
      return NextResponse.json({ cart: { items: [] } });
    }

    // Load the cart document from the database
    const cart = await Cart.findOne({ userId: session.user.id }).lean();

    // If user has no cart, return empty cart
    if (!cart) {
      return NextResponse.json({ cart: { items: [] } });
    }

    // Normalize cart items to the DTO shape expected by the client
    // Includes product title and image, resolved manually from Product collection
    const items = await Promise.all(
      cart.items.map(async (i) => {
        const product = await Product.findById(i.productId).lean();

        return {
          productId: i.productId.toString(),
          qty: i.qty,
          priceAtAdd: i.priceAtAdd,
          variant: i.variant ?? undefined,

          // Additional data required by the frontend
          title: product?.title ?? "Untitled",
          image: product?.images?.[0]?.url ?? "/placeholder.png",
        };
      })
    );

    // Always return the same DTO structure
    return NextResponse.json({ cart: { items } });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

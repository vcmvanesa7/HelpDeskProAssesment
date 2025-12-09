import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import connect from "@/lib/db";
import { Cart } from "@/schemas/cart.schema";

export async function DELETE() {
  try {
    await connect();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Clearitems
    const cart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      { items: [] },
      { new: true }
    ).lean();

    //if not exist, empty
    return NextResponse.json({
      cart: cart ? { items: [] } : { items: [] },
    });
  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}

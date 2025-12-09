import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import connect from "@/lib/db";
import { Order } from "@/schemas/order.schema";
import type { ICartItem } from "@/schemas/cart.schema";

export async function POST() {
  await connect();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Determine base URL dynamically
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  /**
   * Fetch cart directly (for testing orders)
   */
  const res = await fetch(`${baseUrl}/api/cart`, {
    cache: "no-store",
  });

  const data = await res.json();
  const cart: { items: ICartItem[] } = data.cart;

  const total = cart.items.reduce(
    (acc, item) => acc + item.qty * item.priceAtAdd,
    0
  );

  const order = await Order.create({
    userId: session.user.id,
    items: cart.items,
    total,
    status: "pending",

    paymentMethod: "paypal",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ order });
}

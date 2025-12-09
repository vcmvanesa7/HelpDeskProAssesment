// src/app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import connect from "@/lib/db";
import { Order } from "@/schemas/order.schema";

/**
 * GET - Returns all orders for admin.
 * Admin role is required.
 */
export async function GET() {
  try {
    await connect();

    const session = await getServerSession(authOptions);

    // Only admin can list orders
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Return latest orders first
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("ADMIN GET Orders Error:", error);

    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }
}

// src/app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Order } from "@/schemas/order.schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Correct type for dynamic API routes.
 * In the App Router, "params" arrives as a Promise and must be awaited.
 */
interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Returns a single order using the PayPal order ID.
 */
export async function GET(req: Request, context: RouteContext) {
  try {
    await connect();

    // "params" is a Promise → MUST be awaited
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    /**
     * Look up order using the PayPal order ID.
     * If your system later adds internal order IDs,
     * you may need to support both.
     */
    const order = await Order.findOne({ paypalOrderId: id }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return the order document
    return NextResponse.json(order);
  } catch (error) {
    console.error("GET Order Error:", error);

    return NextResponse.json(
      { error: "Failed to load order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Allows admin to update shippingStatus.
 * Example payload:
 * { "shippingStatus": "shipped" }
 */
export async function PATCH(req: Request, context: RouteContext) {
  try {
    await connect();

    // Admin authentication required
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // "params" is a Promise → MUST be awaited
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const body = await req.json();
    const { shippingStatus } = body;

    if (
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        shippingStatus
      )
    ) {
      return NextResponse.json(
        { error: "Invalid shipping status" },
        { status: 400 }
      );
    }

    // Update order by paypalOrderId
    const updated = await Order.findOneAndUpdate(
      { paypalOrderId: id },
      { shippingStatus },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Shipping status updated",
      order: updated,
    });
  } catch (error) {
    console.error("PATCH Order Error:", error);

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

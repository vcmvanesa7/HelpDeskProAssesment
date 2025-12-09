import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { Ticket } from "@/schemas/ticket.schema";

export async function GET(req: Request) {
  try {
    await connect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const category = searchParams.get("category") || undefined;
    const assigned = searchParams.get("assigned") || "all";
    // assigned: all | mine | unassigned

    const query: Record<string, any> = {};

    // Filter by status
    if (status) query.status = status;

    // Filter by priority
    if (priority) query.priority = priority;

    // Filter by category
    if (category) query.category = category;

    /**
     * ROLE-BASED VISIBILITY
     */

    // CLIENT — only sees their own tickets
    if (session.user.role === "client") {
      query.createdBy = session.user.id;
    }

    // SUPPORT — advanced visibility
    if (session.user.role === "support") {
      if (assigned === "mine") query.assignedTo = session.user.id;
      else if (assigned === "unassigned") query.assignedTo = null;
      // assigned === "all" => no filter for assignedTo
    }

    // ADMIN — sees everything, no restrictions

    /**
     * QUERY WITH PAGINATION
     */
    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate("createdBy", "name email image")
        .populate("assignedTo", "name email image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Ticket.countDocuments(query),
    ]);

    return NextResponse.json({
      tickets,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("TICKETS GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 400 }
    );
  }
}


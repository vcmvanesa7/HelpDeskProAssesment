import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { Ticket } from "@/schemas/ticket.schema";
import { updateTicketSchema } from "@/lib/validators/ticket.validator";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await ctx.params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const ticket = await Ticket.findById(id)
      .populate("createdBy", "name email image")
      .populate("assignedTo", "name email image");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const creatorId =
      typeof ticket.createdBy === "object" && ticket.createdBy?._id
        ? String(ticket.createdBy._id)
        : String(ticket.createdBy);

    if (session.user.role === "client" && creatorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("TICKET GET ONE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 400 }
    );
  }
}
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await ctx.params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const validated = await updateTicketSchema.validate(body, {
      abortEarly: false,
    });

    const safeUpdate: Record<string, unknown> = { ...validated };

    // Client users cannot change assignment or priority,
    // but they ARE allowed to change the status (to resolved)
    if (session.user.role === "client") {
      delete safeUpdate.assignedTo;
      delete safeUpdate.priority;
    }

    const ticket = await Ticket.findByIdAndUpdate(id, safeUpdate, {
      new: true,
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("TICKET UPDATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 400 }
    );
  }
}

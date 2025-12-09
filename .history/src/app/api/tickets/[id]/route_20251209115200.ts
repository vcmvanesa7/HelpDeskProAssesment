import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { Ticket } from "@/schemas/ticket.schema";
import { updateTicketSchema } from "@/lib/validators/ticket.validator";
import { sendTicketClosedEmail } from "@/lib/mailer";

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
      .populate("assignedTo", "name email image")
      .populate("messages.sender", "name email image");

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
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 400 });
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
    const validated = await updateTicketSchema.validate(body, { abortEarly: false });

    const safeUpdate: Record<string, any> = { ...validated };

    if (session.user.role === "client") {
      delete safeUpdate.assignedTo;
      delete safeUpdate.priority;
    }

    const prev = await Ticket.findById(id).populate("createdBy", "email name");
    if (!prev) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const previousStatus = prev.status;
    const nextStatus = safeUpdate.status;

    Object.assign(prev, safeUpdate);

    if (
      nextStatus &&
      (nextStatus === "resolved" || nextStatus === "closed") &&
      !prev.resolvedAt
    ) {
      prev.resolvedAt = new Date();
    }

    const ticket = await prev.save();

    if (
      previousStatus !== ticket.status &&
      (ticket.status === "resolved" || ticket.status === "closed")
    ) {
      const createdBy: any = ticket.createdBy;
      if (createdBy?.email) {
        await sendTicketClosedEmail(
          createdBy.email,
          ticket._id.toString(),
          ticket.title
        );
      }
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error("TICKET UPDATE ERROR:", err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 400 });
  }
}

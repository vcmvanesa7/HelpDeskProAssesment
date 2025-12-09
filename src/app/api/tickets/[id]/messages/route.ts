import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { Ticket } from "@/schemas/ticket.schema";
import { Types } from "mongoose";
import { sendTicketReplyEmail } from "@/lib/mailer";

export async function POST(
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

    const { message } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(id)
      .populate("createdBy", "email name")
      .populate("assignedTo", "email name");

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Save the message
    ticket.messages?.push({
      sender: new Types.ObjectId(session.user.id),
      message,
      createdAt: new Date(),
    });

    await ticket.save();

    // Determine if the sender is an agent replying to the client
    const senderIsAgent = session.user.role === "support";

    if (senderIsAgent) {
      const client: any = ticket.createdBy;

      if (client?.email) {
        await sendTicketReplyEmail(
          client.email,
          ticket._id.toString(),
          ticket.title,
          message
        );
      }
    }

    // Re-fetch populated for frontend response
    const populated = await Ticket.findById(id)
      .populate("createdBy", "name email image")
      .populate("assignedTo", "name email image")
      .populate("messages.sender", "name email image");

    return NextResponse.json({
      ok: true,
      message: "Message added",
      ticket: populated,
    });
  } catch (err) {
    console.error("MESSAGE ADD ERROR:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

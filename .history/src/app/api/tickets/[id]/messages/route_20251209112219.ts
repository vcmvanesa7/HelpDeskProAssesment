import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { Ticket } from "@/schemas/ticket.schema";
import { Types } from "mongoose";

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

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Push new message
ticket.messages?.push({
  sender: new mongoose.Types.ObjectId(session.user.id),  // ✅ ObjectId
  message,
  createdAt: new Date(),
});


    await ticket.save();

    // Re-fetch with population for frontend
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

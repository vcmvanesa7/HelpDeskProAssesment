import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { Ticket } from "@/schemas/ticket.schema";
import { createTicketSchema } from "@/lib/validators/ticket.validator";
import { sendTicketCreatedEmail } from "@/lib/mailer";

export async function GET(req: Request) {
  // ... TU GET TAL CUAL COMO LO TIENES
}

// NUEVO: CREAR TICKET
export async function POST(req: Request) {
  try {
    await connect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "client") {
      return NextResponse.json(
        { error: "Only clients can create tickets" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validación server-side
    const validated = await createTicketSchema.validate(body, {
      abortEarly: false,
    });

    const ticket = await Ticket.create({
      title: validated.title,
      description: validated.description,
      priority: validated.priority || "medium",
      category: validated.category || "general",
      attachments: validated.attachments || [],
      createdBy: session.user.id,
    });

    // Email al cliente
    if (session.user.email) {
      await sendTicketCreatedEmail(
        session.user.email,
        ticket._id.toString(),
        ticket.title
      );
    }

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    console.error("TICKET CREATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 400 }
    );
  }
}

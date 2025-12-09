import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Ticket } from "@/schemas/ticket.schema";
import { sendEmail } from "@/lib/mailer";

export async function GET(req: Request) {
  try {
    // PROTECT CRON WITH SECRET HEADER
    const secret = req.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    // Time threshold (24 hours)
    const limitDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // FIND tickets with:
    // - open / in_progress
    // - no agent messages
    // - created more than 24h ago
    const tickets = await Ticket.find({
      status: { $in: ["open", "in_progress"] },
      createdAt: { $lte: limitDate },
      $or: [
        { assignedTo: { $ne: null } },
        { assignedTo: null }
      ]
    })
      .populate("createdBy", "email name")
      .populate("assignedTo", "email name");

    let remindersSent = 0;

    for (const tk of tickets) {

      // DOES THE TICKET ALREADY HAVE AN AGENT REPLY?
      const hasAgentReply = tk.messages?.some(
        (msg) => msg.sender?.toString() === tk.assignedTo?.toString()
      );

      if (hasAgentReply) continue;

      // Select email target
      let emailTarget: string | null = null;

      if (tk.assignedTo?.email) {
        emailTarget = tk.assignedTo.email;
      } else {
        // fallback → soporte general
        emailTarget = process.env.SUPPORT_EMAIL || null;
      }

      if (!emailTarget) continue;

      const html = `
        <div style="font-family: Arial; padding:20px;">
          <h2>⏰ Ticket pendiente sin respuesta</h2>
          <p>El siguiente ticket requiere atención:</p>
          <p><strong>${tk.title}</strong></p>
          <p>Creado hace más de 24 horas sin respuesta del agente.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/agent/${tk._id}" 
             style="display:inline-block;margin-top:12px;padding:10px 18px;background:#111;color:white;text-decoration:none;border-radius:6px;">
            Abrir ticket
          </a>
        </div>
      `;

      await sendEmail(emailTarget, "Recordatorio: Ticket sin respuesta", html);
      remindersSent++;
    }

    return NextResponse.json({
      ok: true,
      message: `Reminders sent: ${remindersSent}`,
    });
  } catch (err) {
    console.error("CRON ERROR:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}

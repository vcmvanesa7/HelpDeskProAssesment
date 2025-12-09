// src/lib/mailer.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "HelpDeskPro";

  return transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "HelpDeskPro";

// === TICKET EMAIL HELPERS ===

export async function sendTicketCreatedEmail(
  to: string,
  ticketId: string,
  title: string
) {
  const url = `${APP_URL}/support/${ticketId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <h2 style="text-align:center;font-size:22px;font-weight:700;margin-bottom:16px;color:#111;">
          Ticket creado en ${APP_NAME}
        </h2>

        <p style="font-size:15px;color:#333;line-height:1.6;">
          Hemos recibido tu solicitud de soporte:
        </p>

        <p style="font-size:15px;color:#111;font-weight:600;margin:12px 0;">
          "${title}"
        </p>

        <p style="font-size:14px;color:#555;line-height:1.6;">
          Nuestro equipo de soporte revisará tu caso y te responderá lo antes posible.
        </p>

        <div style="text-align:center;margin-top:24px;">
          <a href="${url}" style="background:#111;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            Ver ticket
          </a>
        </div>

        <p style="font-size:12px;color:#888;margin-top:24px;text-align:center;">
          Gracias por confiar en ${APP_NAME}.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, `[${APP_NAME}] Ticket creado`, html);
}

export async function sendTicketReplyEmail(
  to: string,
  ticketId: string,
  title: string,
  replyMessage: string
) {
  const url = `${APP_URL}/support/${ticketId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <h2 style="text-align:center;font-size:22px;font-weight:700;margin-bottom:16px;color:#111;">
          Nueva respuesta en tu ticket
        </h2>

        <p style="font-size:15px;color:#333;line-height:1.6;">
          Se ha agregado una nueva respuesta al ticket:
        </p>

        <p style="font-size:15px;color:#111;font-weight:600;margin:12px 0;">
          "${title}"
        </p>

        <div style="background:#f7f7f7;border-radius:8px;padding:12px 14px;margin-top:10px;">
          <p style="font-size:14px;color:#333;white-space:pre-line;margin:0;">
            ${replyMessage}
          </p>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <a href="${url}" style="background:#111;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            Ver conversación
          </a>
        </div>

        <p style="font-size:12px;color:#888;margin-top:24px;text-align:center;">
          Equipo de soporte de ${APP_NAME}.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, `[${APP_NAME}] Nueva respuesta en tu ticket`, html);
}

export async function sendTicketClosedEmail(
  to: string,
  ticketId: string,
  title: string
) {
  const url = `${APP_URL}/support/${ticketId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <h2 style="text-align:center;font-size:22px;font-weight:700;margin-bottom:16px;color:#111;">
          Tu ticket ha sido resuelto
        </h2>

        <p style="font-size:15px;color:#333;line-height:1.6;">
          El siguiente ticket ha sido marcado como <strong>resuelto</strong>:
        </p>

        <p style="font-size:15px;color:#111;font-weight:600;margin:12px 0;">
          "${title}"
        </p>

        <div style="text-align:center;margin-top:24px;">
          <a href="${url}" style="background:#111;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">
            Ver ticket
          </a>
        </div>

        <p style="font-size:12px;color:#888;margin-top:24px;text-align:center;">
          Gracias por usar ${APP_NAME}. Si el problema persiste, puedes abrir un nuevo ticket.
        </p>
      </div>
    </div>
  `;

  return sendEmail(to, `[${APP_NAME}] Ticket resuelto`, html);
}

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

// Reusable sender
export async function sendEmail(to: string, subject: string, html: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "KOI Streetwear";

  return transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

// WELCOME FUNCTION
export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:30px;">
      <div style="
        max-width:600px;
        margin:auto;
        background:#ffffff;
        border-radius:12px;
        padding:30px;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);
      ">

        <div style="text-align:center; margin-bottom:20px;">
          <img src="${process.env.NEXT_PUBLIC_APP_URL}/logs/LBlanco.png" height="60" />
        </div>

        <h2 style="text-align:center; font-size:24px; font-weight:700; margin-bottom:20px; color:#111;">
          Welcome to KOI Streetwear
        </h2>

        <p style="font-size:16px; color:#333; line-height:1.6;">
          Hey <strong>${name}</strong> 👋
        </p>

        <p style="font-size:16px; color:#333; line-height:1.6;">
          Thanks for joining <strong>KOI Streetwear</strong>.  
          Get ready for exclusive drops, new releases and premium urban fashion.
        </p>

        <div style="text-align:center; margin-top:30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="
            background:#111;
            color:#fff;
            padding:12px 30px;
            border-radius:8px;
            text-decoration:none;
            font-weight:bold;
            text-transform:uppercase;
            letter-spacing:1px;
          ">
            Visit Store
          </a>
        </div>

        <p style="text-align:center; font-size:14px; color:#555; margin-top:20px;">
          We're happy to have you with us 🖤
        </p>

      </div>

      <p style="text-align:center; font-size:12px; color:#999; margin-top:15px;">
        © ${new Date().getFullYear()} KOI Streetwear. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail(email, "Welcome to KOI Streetwear", html);
}

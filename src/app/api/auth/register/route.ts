// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import * as yup from "yup";
import connect from "@/lib/db";
import { User } from "@/schemas/user.schema";
import { hashPassword } from "@/lib/bcrypt";
import { sendWelcomeEmail } from "@/lib/mailer";

const registerSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    await registerSchema.validate(body, { abortEarly: false });

    await connect();

    // Check if email already exists
    const exists = await User.findOne({ email: body.email });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(body.password);

    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash,
      provider: "credentials",
      role: "client",
    });

    // Send welcome email 
    try {
      await sendWelcomeEmail(
        String(user.email), // to
        String(user.name) // name
      );
    } catch (err) {
      console.warn("Error sending welcome email:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

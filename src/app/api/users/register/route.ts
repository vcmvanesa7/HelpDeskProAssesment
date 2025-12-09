// src/app/api/users/register/route.ts
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { User } from "@/schemas/user.schema";
import { hashPassword } from "@/lib/bcrypt";
import { sendWelcomeEmail } from "@/lib/mailer"; // ← CAMBIO AQUÍ
import { registerSchema } from "@/schemas/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate with Yup on the server
    try {
      await registerSchema.validate(body);
    } catch (vErr: any) {
      return NextResponse.json(
        { error: "Validation failed", details: vErr.errors },
        { status: 400 }
      );
    }

    const { name, email, password } = body;
    await connect();

    const existing = await User.findOne({ email }).lean();
    if (existing)
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      provider: "credentials",
      role: "client",
    });

    // Send KOI welcome email
    try {
      await sendWelcomeEmail(name, email); 
    } catch (mailErr) {
      console.warn("Welcome email failed:", mailErr);
    }

    return NextResponse.json(
      { user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

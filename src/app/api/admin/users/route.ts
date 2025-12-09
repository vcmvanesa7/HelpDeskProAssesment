import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import connect from "@/lib/db";
import { User } from "@/schemas/user.schema";

export async function GET() {
  try {
    await connect();

    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await User.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}

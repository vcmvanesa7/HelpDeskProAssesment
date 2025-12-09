import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Ticket } from "@/schemas/ticket.schema";

export async function GET() {
  try {
    await connect();
    const tickets = await Ticket.find();  // O cualquier consulta necesaria
    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

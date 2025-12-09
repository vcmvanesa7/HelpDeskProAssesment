// src/app/api/admin/agents/route.ts
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { User } from "@/schemas/user.schema";
import { Ticket } from "@/schemas/ticket.schema";

export async function GET() {
  try {
    await connect();

    // obtain all agents
    const agents = await User.find({ role: "support" });

    // Obtain tickets for each agent
    const agentsWithTickets = await Promise.all(
      agents.map(async (agent) => {
        const tickets = await Ticket.find({ assignedTo: agent._id });
        return { agent, tickets };
      })
    );

    return NextResponse.json({ agentsWithTickets });
  } catch (err) {
    console.error("Error fetching agents and tickets:", err);
    return NextResponse.json({ error: "Failed to fetch agents and tickets" }, { status: 500 });
  }
}

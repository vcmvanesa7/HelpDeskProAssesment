// src/services/admin.service.ts
import axios from "axios";

export async function fetchAdminDashboardData() {
  try {
    const [ticketsRes, agentsRes, usersRes] = await Promise.all([
      axios.get("/api/admin/tickets"),
      axios.get("/api/admin/agents"),
      axios.get("/api/admin/users"), // Obtein users data
    ]);

    return {
      tickets: ticketsRes.data.tickets,
      agents: agentsRes.data.agentsWithTickets,
      users: usersRes.data.users,
    };
  } catch (e) {
    console.error("Error fetching admin dashboard data:", e);
    throw new Error("Error fetching admin dashboard data");
  }
}

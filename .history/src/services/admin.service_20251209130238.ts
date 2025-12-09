// src/services/admin.service.ts
import axios from "axios";

export async function fetchAdminDashboardData() {
  try {
    const [ticketsRes, agentsRes, usersRes] = await Promise.all([
      axios.get("/api/admin/tickets"),
      axios.get("/api/admin/agents"),
      axios.get("/api/admin/users"), // Obtener usuarios
    ]);

    return {
      tickets: ticketsRes.data.tickets,
      agents: agentsRes.data.agentsWithTickets,
      users: usersRes.data.users,
    };
  } catch (e) {
    console.error("eRROR:", e);
    throw new Error("Error al cargar los datos del dashboard");
  }
}

// src/services/admin.service.ts
import axios from "axios";

export async function fetchAgentsAndTickets() {
  const { data } = await axios.get("/api/admin/agents");
  return data;
}

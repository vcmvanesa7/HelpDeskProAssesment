import axios from "axios";

/**
 * Ensures NextAuth tokens & cookies are sent automatically
 */
axios.defaults.withCredentials = true;

/**
 * Base URL for local or production API calls
 */
axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/* TYPES */

export interface TicketAttachment {
  url: string;
  public_id?: string | null;
  format?: string | null;
  size?: number | null;
  originalName?: string | null;
}

export interface TicketInput {
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  category?: string;
  attachments?: TicketAttachment[];
}

export interface TicketQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  assigned?: "all" | "mine" | "unassigned";
}

/**
 * GET /api/tickets
 * Auto-handles:
 *  - CLIENT → returns array
 *  - SUPPORT/ADMIN → returns pagination object
 */
export async function fetchTickets(params: TicketQueryOptions = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.priority) query.set("priority", params.priority);
  if (params.category) query.set("category", params.category);
  if (params.assigned) query.set("assigned", params.assigned);

  const { data } = await axios.get(`/api/tickets?${query.toString()}`);

  // CASE 1 → Support/Admin (pagination object)
  if (data?.tickets && Array.isArray(data.tickets)) {
    return {
      tickets: data.tickets,
      page: data.page,
      totalPages: data.totalPages,
      total: data.total,
    };
  }

  // CASE 2 → Client (simple array)
  if (Array.isArray(data)) {
    return {
      tickets: data,
      page: 1,
      totalPages: 1,
      total: data.length,
    };
  }

  // Fallback
  return { tickets: [], page: 1, totalPages: 1, total: 0 };
}

/**
 * GET /api/tickets/:id
 */
export async function fetchTicket(id: string) {
  const { data } = await axios.get(`/api/tickets/${id}`);
  return data;
}

/**
 * POST /api/tickets
 */
export async function createTicket(input: TicketInput) {
  const { data } = await axios.post("/api/tickets", input);
  return data;
}

/**
 * PATCH /api/tickets/:id
 */
export async function updateTicket(
  id: string,
  updates: Partial<TicketInput> | Record<string, unknown>
) {
  const { data } = await axios.patch(`/api/tickets/${id}`, updates);
  return data;
}

/**
 * DELETE /api/tickets/:id
 */
export async function deleteTicket(id: string) {
  const { data } = await axios.delete(`/api/tickets/${id}`);
  return data;
}

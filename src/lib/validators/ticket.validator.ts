import * as yup from "yup";

/**
 * Schema for attachments
 */
const attachmentSchema = yup.object({
  url: yup.string().required("El archivo debe tener una URL válida"),
  public_id: yup.string().nullable(),
  format: yup.string().nullable(),
  size: yup.number().nullable(),
  originalName: yup.string().nullable(),
});

/**
 * CREATE TICKET
 * Used only by the client when creating the ticket.
 */
export const createTicketSchema = yup.object({
  title: yup
    .string()
    .required("El título es obligatorio")
    .max(120, "Máximo 120 caracteres"),

  description: yup
    .string()
    .required("La descripción es obligatoria")
    .max(2000, "Máximo 2000 caracteres"),

  priority: yup.string().oneOf(["low", "medium", "high"]).default("medium"),

  category: yup.string().default("general"),

  attachments: yup.array().of(attachmentSchema).optional(),
});

/**
 * UPDATE TICKET
 * Used by agents, admin, and client with API restrictions.
 */
export const updateTicketSchema = yup.object({
  title: yup.string().max(120).optional(),
  description: yup.string().max(2000).optional(),

  priority: yup.string().oneOf(["low", "medium", "high"]).optional(),

  status: yup
    .string()
    .oneOf(["open", "in_progress", "resolved", "closed"])
    .optional(),

  category: yup.string().optional(),

  attachments: yup.array().of(attachmentSchema).optional(),

  assignedTo: yup.string().nullable().optional(),
});

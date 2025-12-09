"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Paper,
  Select,
  MenuItem,
  Divider,
  Stack,
} from "@mui/material";

import Image from "next/image";

import { fetchTicket, updateTicket } from "@/services/tickets/tickets.service";

const ALL_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
type TicketStatus = (typeof ALL_STATUSES)[number];

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  createdAt: string;
  resolvedAt?: string | null;
  assignedTo?: { _id: string; name?: string } | null;
  createdBy?: { email: string };
  attachments?: { url: string; public_id?: string | null }[];
};

export default function AgentTicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ticketId } = React.use(params);

  const { data: session, status } = useSession();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");

  // Redirect unauthorized
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (session?.user?.role !== "support") router.push("/");
  }, [status, session, router]);

  // Load ticket
  useEffect(() => {
    if (!ticketId) return;

    fetchTicket(ticketId)
      .then((data) => {
        setTicket(data.ticket);
        setNewStatus(data.ticket.status);
      })
      .finally(() => setLoading(false));
  }, [ticketId]);

  const handleStatusUpdate = async () => {
    if (!ticket || !newStatus) return;
    setUpdating(true);

    try {
      const updated = await updateTicket(ticket._id, { status: newStatus });
      setTicket(updated.ticket);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!ticket) return;

    setUpdating(true);

    try {
      const updated = await updateTicket(ticket._id, {
        assignedTo: session!.user!.id,
        status: "in_progress",
      });

      setTicket(updated.ticket);
      setNewStatus(updated.ticket.status);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (!ticket)
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <Typography>Ticket not found.</Typography>
      </Box>
    );

  const isAssignedToMe = ticket.assignedTo?._id === session?.user?.id;

  // priority color system
  const priorityColor =
    ticket.priority === "low"
      ? "success"
      : ticket.priority === "medium"
      ? "warning"
      : "error";

  return (
    <Box sx={{ maxWidth: 950, mx: "auto", mt: 5, px: 2 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button onClick={() => router.back()} sx={{ borderRadius: 2, px: 2 }}>
          ← Back
        </Button>

        <Chip
          label={ticket.status.replace("_", " ")}
          color={
            ticket.status === "open"
              ? "warning"
              : ticket.status === "in_progress"
              ? "info"
              : ticket.status === "resolved"
              ? "success"
              : "default"
          }
          sx={{ fontWeight: 600, textTransform: "capitalize" }}
        />
      </Box>

      {/* TITLE & META */}
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
        {ticket.title}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Chip
          label={`Priority: ${ticket.priority}`}
          color={priorityColor}
          sx={{ textTransform: "capitalize" }}
        />

        <Typography variant="body2" color="text.secondary">
          Created by: {ticket.createdBy?.email}
        </Typography>

        {ticket.assignedTo && (
          <Typography variant="body2" color="text.secondary">
            Assigned to: {ticket.assignedTo.name ?? "(You)"}
          </Typography>
        )}
      </Stack>

      {/* INFO CARD */}
      <Paper sx={{ p: 3, borderRadius: "20px", mb: 4 }}>
        <Typography fontWeight={700} mb={1}>
          Description
        </Typography>
        <Typography sx={{ whiteSpace: "pre-line", mb: 3 }}>
          {ticket.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={700}>Created At</Typography>
        <Typography sx={{ mb: 2 }}>
          {new Date(ticket.createdAt).toLocaleDateString()}
        </Typography>

        <Typography fontWeight={700}>Resolved At</Typography>
        <Typography>
          {ticket.resolvedAt
            ? new Date(ticket.resolvedAt).toLocaleDateString()
            : "—"}
        </Typography>
      </Paper>

      {/* ATTACHMENTS */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: "20px", mb: 4 }}>
          <Typography fontWeight={700} mb={2}>
            Attachments
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            {ticket.attachments.map((img) => (
              <Box
                key={img.public_id}
                sx={{
                  width: "100%",
                  height: 200,
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #ccc",
                }}
              >
                <Image
                  src={img.url}
                  alt="attachment"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* STATUS CONTROL */}
      <Paper sx={{ p: 3, borderRadius: "20px", mb: 4 }}>
        <Typography fontWeight={700} mb={2}>
          Change Status
        </Typography>

        {!ticket.assignedTo && (
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 2 }}
            disabled={updating}
            onClick={handleAssign}
          >
            Take Ticket
          </Button>
        )}

        {isAssignedToMe && (
          <>
            <Select
              fullWidth
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
              sx={{ mb: 2 }}
            >
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.replace("_", " ")}
                </MenuItem>
              ))}
            </Select>

            <Button
              variant="contained"
              fullWidth
              disabled={updating}
              onClick={handleStatusUpdate}
            >
              Update Status
            </Button>
          </>
        )}

        {ticket.status === "closed" && (
          <Typography
            sx={{ textAlign: "center", mt: 2, fontWeight: 700, color: "gray" }}
          >
            This ticket is closed.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

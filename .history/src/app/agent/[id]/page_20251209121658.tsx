"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
  TextField,
} from "@mui/material";

import Image from "next/image";

import { fetchTicket, updateTicket } from "@/services/tickets/tickets.service";

const ALL_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
type TicketStatus = (typeof ALL_STATUSES)[number];

type Message = {
  _id: string;
  sender: { name: string; email: string; image?: string };
  message: string;
  createdAt: string;
};

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  createdAt: string;
  resolvedAt?: string | null;
  assignedTo?: { _id: string; name?: string } | null;
  createdBy?: { email: string; name?: string };
  messages?: Message[];
  attachments?: { url: string; public_id?: string | null }[];
};

export default function AgentTicketDetail({ params }: { params: Promise<{ id: string }> }) {

  const { id: ticketId } = React.use(params);

  const { data: session, status } = useSession();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");

  // chat
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (ticket?.messages) scrollToBottom();
  }, [ticket?.messages]);

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

  // SEND MESSAGE
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      const { data } = await axios.post(
        `/api/tickets/${ticketId}/messages`,
        { message }
      );

      setTicket(data.ticket);
      setMessage("");
    } catch (err) {
      console.error(err);
      alert("Error sending message");
    } finally {
      setSending(false);
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

      {/* TITLE */}
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
        {ticket.title}
      </Typography>

      {/* METADATA */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Chip label={`Priority: ${ticket.priority}`} color={priorityColor} sx={{ textTransform: "capitalize" }} />
        <Typography variant="body2" color="text.secondary">
          Created by: {ticket.createdBy?.email}
        </Typography>
      </Stack>

      {/* DESCRIPTION */}
      <Paper sx={{ p: 3, borderRadius: "20px", mb: 4 }}>
        <Typography fontWeight={700} mb={1}>Description</Typography>
        <Typography sx={{ whiteSpace: "pre-line", mb: 3 }}>{ticket.description}</Typography>
      </Paper>

      {/* ATTACHMENTS */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: "20px", mb: 4 }}>
          <Typography fontWeight={700} mb={2}>Attachments</Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {ticket.attachments.map((img) => (
              <Box key={img.public_id} sx={{ width: 160, height: 160, position: "relative" }}>
                <Image src={img.url} alt="attachment" fill style={{ objectFit: "cover", borderRadius: 8 }} />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* CHAT SECTION */}
      <Paper sx={{ p: 3, mb: 3, maxHeight: 350, overflowY: "auto" }}>
        <Typography fontWeight={700} mb={2}>Conversation</Typography>

        {ticket.messages?.map((msg) => (
          <Box
            key={msg._id}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor:
                msg.sender.email === session?.user?.email ? "#e6f4ff" : "#f5f5f5",
            }}
          >
            <Typography fontWeight={600}>
              {msg.sender.name || msg.sender.email}
            </Typography>

            <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
              {msg.message}
            </Typography>

            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#666" }}>
              {new Date(msg.createdAt).toLocaleString()}
            </Typography>
          </Box>
        ))}

        <div ref={messagesEndRef} />
      </Paper>

      {/* MESSAGE INPUT */}
      {ticket.status !== "resolved" && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={sending || message.trim().length === 0}
            onClick={handleSendMessage}
            sx={{ backgroundColor: "#111", "&:hover": { backgroundColor: "#333" } }}
          >
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </Paper>
      )}

      {/* STATUS CONTROL */}
      <Paper sx={{ p: 3, borderRadius: "20px", mb: 4 }}>
        <Typography fontWeight={700} mb={2}>Change Status</Typography>

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
      </Paper>
    </Box>
  );
}

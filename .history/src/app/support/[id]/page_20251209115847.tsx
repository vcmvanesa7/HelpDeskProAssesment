"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";

import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Paper,
  TextField,
} from "@mui/material";

import { fetchTicket, updateTicket } from "@/services/tickets/tickets.service";
import axios from "axios";

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
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  resolvedAt?: string | null;
  attachments?: { url: string; public_id?: string | null }[];
  createdBy?: { email?: string; name?: string };
  messages?: Message[];
};

export default function TicketDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (ticket?.messages) scrollToBottom();
  }, [ticket?.messages]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (!ticketId || status !== "authenticated") return;

    const load = async () => {
      try {
        const data = await fetchTicket(ticketId);
        setTicket(data.ticket);
      } catch (err) {
        console.error("Error loading ticket:", err);
        toast.error("Error loading ticket");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ticketId, status]);

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
      toast.success("Message sent");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setClosing(true);
      const updated = await updateTicket(ticketId, { status: "resolved" });
      setTicket(updated.ticket);
      toast.success("Ticket closed successfully");
      router.push("/support");
    } catch (error) {
      console.error(error);
      toast.error("Failed to close ticket");
    } finally {
      setClosing(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );

  if (!ticket)
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h6">Ticket not found</Typography>
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      <Button
        onClick={() => router.back()}
        sx={{ mb: 2, border: "1px solid #ccc" }}
      >
        ← Back
      </Button>

      <Typography variant="h4" fontWeight={700} mb={1}>
        {ticket.title}
      </Typography>

      <Chip
        label={ticket.status}
        color={
          ticket.status === "open"
            ? "warning"
            : ticket.status === "in_progress"
            ? "info"
            : ticket.status === "resolved"
            ? "success"
            : "default"
        }
        sx={{ mb: 3 }}
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography fontWeight={600} mb={1}>
          Description
        </Typography>
        <Typography sx={{ whiteSpace: "pre-line" }}>
          {ticket.description}
        </Typography>

        <Box mt={3}>
          <Typography fontWeight={600}>Created At:</Typography>
          <Typography>{new Date(ticket.createdAt).toLocaleString()}</Typography>
        </Box>

        <Box mt={2}>
          <Typography fontWeight={600}>Closed At:</Typography>
          <Typography>
            {ticket.resolvedAt
              ? new Date(ticket.resolvedAt).toLocaleString()
              : "—"}
          </Typography>
        </Box>

        {(ticket.attachments?.length ?? 0) > 0 && (
          <Box mt={3}>
            <Typography fontWeight={600} mb={1}>
              Attachments
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {ticket.attachments?.map((img) => (
                <Box
                  key={img.public_id}
                  sx={{
                    width: 140,
                    height: 140,
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
          </Box>
        )}
      </Paper>

      {/* MESSAGES */}
      <Paper sx={{ p: 3, mb: 3, maxHeight: 400, overflowY: "auto" }}>
        <Typography fontWeight={700} mb={2}>
          Messages
        </Typography>

        {ticket.messages?.map((msg) => (
          <Box
            key={msg._id}
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor:
                msg.sender.email === session?.user?.email
                  ? "#e6f4ff"
                  : "#f5f5f5",
            }}
          >
            <Typography fontWeight={600}>
              {msg.sender.name || msg.sender.email}
            </Typography>

            <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
              {msg.message}
            </Typography>

            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, color: "#666" }}
            >
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
            sx={{
              py: 1.1,
              backgroundColor: "#111",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </Paper>
      )}

      {/* CLOSE TICKET BUTTON — ONLY AGENTS */}
      {session?.user?.role !== "client" && ticket.status !== "resolved" && (
        <Button
          variant="contained"
          fullWidth
          disabled={closing}
          onClick={handleCloseTicket}
          sx={{ backgroundColor: "#111", "&:hover": { backgroundColor: "#333" } }}
        >
          {closing ? "Closing..." : "Close Ticket"}
        </Button>
      )}
    </Box>
  );
}

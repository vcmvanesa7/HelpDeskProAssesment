"use client";

import { useEffect, useState } from "react";
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
} from "@mui/material";

import { fetchTicket, updateTicket } from "@/services/tickets/tickets.service";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  resolvedAt?: string | null;
  attachments?: {
    url: string;
    public_id?: string | null;
  }[];
  createdBy?: {
    email?: string;
  };
};

export default function TicketDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Load ticket data
  useEffect(() => {
    if (!ticketId) return;
    if (status !== "authenticated") return;

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
      {/* BACK BUTTON */}
      <Button
        onClick={() => router.back()}
        sx={{ mb: 2, border: "1px solid #ccc" }}
      >
        ← Back
      </Button>

      {/* HEADER TITLE */}
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

      {/* MAIN DETAILS */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* DESCRIPTION */}
        <Typography fontWeight={600} mb={1}>
          Description
        </Typography>
        <Typography sx={{ whiteSpace: "pre-line" }}>
          {ticket.description}
        </Typography>

        {/* CREATED AT */}
        <Box mt={3}>
          <Typography fontWeight={600}>Created At:</Typography>
          <Typography>
            {new Date(ticket.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        {/* CLOSED AT */}
        <Box mt={2}>
          <Typography fontWeight={600}>Closed At:</Typography>
          <Typography>
            {ticket.resolvedAt
              ? new Date(ticket.resolvedAt).toLocaleDateString()
              : "—"}
          </Typography>
        </Box>

        {/* ATTACHMENTS */}
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

      {/* CLOSE TICKET BUTTON — ONLY FOR AGENTS */}
      {session?.user?.role !== "client" && ticket.status !== "resolved" && (
        <Button
          variant="contained"
          fullWidth
          disabled={closing}
          onClick={handleCloseTicket}
          sx={{
            backgroundColor: "#111",
            "&:hover": { backgroundColor: "#333" },
          }}
        >
          {closing ? "Closing..." : "Close Ticket"}
        </Button>
      )}
    </Box>
  );
}

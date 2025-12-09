"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import {
  Box,
  Button,
  Chip,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";

import { fetchTickets } from "@/services/tickets/tickets.service";

interface Ticket {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  createdBy?: { email?: string };
}

export default function SupportPage() {
  const { data: session, status } = useSession();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const role = session?.user?.role;

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/auth/login";
    }
  }, [status]);

  // Load tickets
  useEffect(() => {
    if (status !== "authenticated") return;

    const load = async () => {
      try {
        const res = await fetchTickets(); // {tickets, total ...}
        setTickets(res.tickets || []);
      } catch (error) {
        console.error("Error loading tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status]);

  if (loading)
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      {/* HEADER */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          My Tickets
        </Typography>

        {role === "client" && (
          <Link href="/support/new" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#111",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              Create Ticket
            </Button>
          </Link>
        )}
      </Box>

      {/* TABLE */}
      <Paper sx={{ overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>

              {role !== "client" && <TableCell>Created By</TableCell>}

              <TableCell>Created At</TableCell>
              <TableCell>Closed At</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets.map((tk) => (
              <TableRow
                key={tk._id}
                hover
                component={Link}
                href={`/support/${tk._id}`}
                sx={{ textDecoration: "none", cursor: "pointer" }}
              >
                <TableCell>{tk.title}</TableCell>

                <TableCell>
                  <Chip
                    label={tk.status}
                    color={
                      tk.status === "open"
                        ? "warning"
                        : tk.status === "in_progress"
                        ? "info"
                        : tk.status === "resolved"
                        ? "success"
                        : "default"
                    }
                    size="small"
                  />
                </TableCell>

                {role !== "client" && (
                  <TableCell>{tk.createdBy?.email}</TableCell>
                )}

                <TableCell>
                  {new Date(tk.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  {tk.resolvedAt
                    ? new Date(tk.resolvedAt).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}

            {tickets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={role !== "client" ? 5 : 4}
                  align="center"
                  sx={{ py: 3 }}
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

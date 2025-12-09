"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// MUI
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
  MenuItem,
  Select,
  Pagination,
} from "@mui/material";

import { fetchTickets, updateTicket } from "@/services/tickets/tickets.service";

type AgentTicket = {
  _id: string;
  title: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdBy: { email: string };
  assignedTo?: { _id: string } | null;
};

type AssignedFilter = "all" | "mine" | "unassigned";

export default function AgentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  // STATE
  const [tickets, setTickets] = useState<AgentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState<AssignedFilter>("mine");

  const [totalPages, setTotalPages] = useState(1);

  /* AUTH + ROLE REDIRECT */
  useEffect(() => {
    if (status === "unauthenticated") router.push(`/${locale}/auth/login`);

    if (session?.user?.role !== "support") router.push(`/${locale}`);
  }, [status, session, locale, router]);

  /* LOAD TICKETS */
  useEffect(() => {
    if (session?.user?.role !== "support") return;

    const load = async () => {
      try {
        setLoading(true);

        const data = await fetchTickets({
          page,
          limit: 10,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          assigned: assignedFilter,
        });

        setTickets(data.tickets);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Agent dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, statusFilter, priorityFilter, assignedFilter, session]);

  /* ACTIONS */

  const handleAssign = async (ticketId: string) => {
    try {
      const updated = await updateTicket(ticketId, {
        assignedTo: session!.user!.id,
        status: "in_progress",
      });

      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? updated.ticket : t))
      );
    } catch (err) {
      console.error(err);
      alert("Error assigning the ticket");
    }
  };

  /* LOADING VIEW */
  if (loading)
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress color="primary" />
      </Box>
    );

  /* MAIN UI */
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 5, px: 2 }}>
      {/* TITLE */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 3,
          letterSpacing: "0.05em",
        }}
      >
        Support Agent Dashboard
      </Typography>

      {/* FILTERS */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: "20px",
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          background: "#fff",
        }}
      >
        {/* STATUS */}
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          displayEmpty
          sx={{ minWidth: 160, borderRadius: 2 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="in_progress">In progress</MenuItem>
          <MenuItem value="resolved">Resolved</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </Select>

        {/* PRIORITY */}
        <Select
          size="small"
          value={priorityFilter}
          sx={{ minWidth: 160, borderRadius: 2 }}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setPage(1);
          }}
          displayEmpty
        >
          <MenuItem value="">All priorities</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>

        {/* ASSIGNED FILTER */}
        <Select
          size="small"
          value={assignedFilter}
          sx={{ minWidth: 180, borderRadius: 2 }}
          onChange={(e) => {
            setAssignedFilter(e.target.value as AssignedFilter);
            setPage(1);
          }}
        >
          <MenuItem value="mine">Assigned to me</MenuItem>
          <MenuItem value="all">All tickets</MenuItem>
          <MenuItem value="unassigned">Unassigned</MenuItem>
        </Select>
      </Paper>

      {/* TABLE */}
      <Paper
        elevation={1}
        sx={{
          overflow: "hidden",
          borderRadius: "18px",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created by</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets.map((tk) => (
              <TableRow key={tk._id} hover>
                {/* TITLE */}
                <TableCell>
                  <Link
                    href={`/agent/${tk._id}`}
                    style={{
                      textDecoration: "none",
                      color: "#111",
                      fontWeight: 600,
                    }}
                  >
                    {tk.title}
                  </Link>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <Chip
                    label={
                      tk.status === "open"
                        ? "Open"
                        : tk.status === "in_progress"
                        ? "In progress"
                        : tk.status === "resolved"
                        ? "Resolved"
                        : "Closed"
                    }
                    size="small"
                    color={
                      tk.status === "open"
                        ? "warning"
                        : tk.status === "in_progress"
                        ? "info"
                        : tk.status === "resolved"
                        ? "success"
                        : "default"
                    }
                  />
                </TableCell>

                {/* PRIORITY */}
                <TableCell sx={{ textTransform: "capitalize" }}>
                  {tk.priority}
                </TableCell>

                {/* CREATED BY */}
                <TableCell>{tk.createdBy?.email}</TableCell>

                {/* ACTIONS */}
                <TableCell>
                  {!tk.assignedTo && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ borderRadius: 2 }}
                      onClick={() => handleAssign(tk._id)}
                    >
                      Take ticket
                    </Button>
                  )}

                  {tk.assignedTo && tk.assignedTo._id === session?.user?.id && (
                    <Typography sx={{ color: "green", fontWeight: 600 }}>
                      Assigned to you
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* PAGINATION */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_e, v) => setPage(v)}
          color="primary"
        />
      </Box>
    </Box>
  );
}

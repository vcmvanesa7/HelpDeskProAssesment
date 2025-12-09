"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";

import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import axios from "axios";

const STATUS_COLORS: Record<string, string> = {
  open: "#F59E0B",
  in_progress: "#3B82F6",
  resolved: "#10B981",
  closed: "#6B7280",
};

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  // FETCH DATA
  useEffect(() => {
    async function load() {
      try {
        const [ticketsRes, agentsRes] = await Promise.all([
          axios.get("/api/admin/tickets"),
          axios.get("/api/admin/agents"),
        ]);

        setTickets(ticketsRes.data.tickets);
        setAgents(agentsRes.data.agents);
      } catch (e) {
        console.error("Admin dashboard error:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /** ---------- STATS ---------- */
  const totalTickets = tickets.length;

  const ticketsByStatus = useMemo(() => {
    const map = new Map<string, number>();

    tickets.forEach((t) => {
      map.set(t.status, (map.get(t.status) ?? 0) + 1);
    });

    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }, [tickets]);

  const ticketsByAgent = useMemo(() => {
    const map = new Map<string, number>();

    tickets.forEach((t) => {
      if (t.assignedTo?.name) {
        map.set(t.assignedTo.name, (map.get(t.assignedTo.name) ?? 0) + 1);
      }
    });

    return Array.from(map.entries()).map(([agent, count]) => ({
      agent,
      count,
    }));
  }, [tickets]);

  const recentTickets = tickets.slice(0, 6);

  const KPI = [
    { label: "Total Tickets", value: totalTickets },
    { label: "Open", value: ticketsByStatus.find((s) => s.status === "open")?.count ?? 0 },
    { label: "In Progress", value: ticketsByStatus.find((s) => s.status === "in_progress")?.count ?? 0 },
    { label: "Resolved", value: ticketsByStatus.find((s) => s.status === "resolved")?.count ?? 0 },
    { label: "Agents", value: agents.length },
  ];

  if (loading) {
    return (
      <Box p={10} display="flex" justifyContent="center">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: 4, py: 6 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, letterSpacing: "0.05em", mb: 4 }}
      >
        HelpDeskPro — Admin Dashboard
      </Typography>

      {/* KPI CARDS */}
      <Grid container spacing={3} mb={4}>
        {KPI.map((card) => (
          <Grid key={card.label} item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: "20px",
                background: "#fff",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "2rem", fontWeight: 800 }}>
                {card.value}
              </Typography>
              <Typography sx={{ fontWeight: 600, opacity: 0.7 }}>
                {card.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CHARTS */}
      <Grid container spacing={3}>
        {/* Tickets by Status */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: "20px", height: 320 }}>
            <Typography fontWeight={700} mb={2}>
              Tickets by Status
            </Typography>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={ticketsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {ticketsByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? "#111"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tickets by Agent */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: "20px", height: 320 }}>
            <Typography fontWeight={700} mb={2}>
              Tickets assigned per Agent
            </Typography>

            {ticketsByAgent.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography>No assigned tickets yet.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketsByAgent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#111" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* RECENT TICKETS */}
      <Grid container spacing={3} mt={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: "20px" }}>
            <Typography fontWeight={700} mb={2}>
              Recent Tickets
            </Typography>

            {recentTickets.length === 0 && (
              <Typography>No recent tickets.</Typography>
            )}

            {recentTickets.map((t) => (
              <Box key={t._id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Box>
                    <Typography fontWeight={600}>{t.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(t.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: STATUS_COLORS[t.status] ?? "#666",
                      textTransform: "capitalize",
                    }}
                  >
                    {t.status.replace("_", " ")}
                  </Typography>
                </Stack>
                <Divider />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

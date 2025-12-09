"use client";

import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, CircularProgress, Stack, Divider } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AgentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [unassignedTickets, setUnassignedTickets] = useState<any[]>([]);

  // FETCH AGENTS AND TICKETS
  useEffect(() => {
    async function load() {
      try {
        const agentsRes = await axios.get("/api/admin/agents");
        const ticketsRes = await axios.get("/api/admin/tickets");

        // Set agents data
        setAgents(agentsRes.data.agentsWithTickets);

        // Get unassigned tickets
        const unassigned = ticketsRes.data.tickets.filter((ticket: any) => !ticket.assignedTo);
        setUnassignedTickets(unassigned);
      } catch (e) {
        console.error("Error fetching agents and tickets:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <Box p={10} display="flex" justifyContent="center">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: 4, py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "0.05em", mb: 4 }}>
        Agents and Assigned Tickets
      </Typography>

      {/* AGENTS LIST */}
      <Grid container spacing={3} mb={4}>
        {agents.map((agent) => (
          <Grid key={agent.agent._id} item xs={12} sm={6} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: "20px",
                background: "#fff",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 700 }}>
                {agent.agent.name}
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                Assigned Tickets: {agent.tickets.length}
              </Typography>

              <Stack direction="row" justifyContent="center" alignItems="center" mt={2}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  {agent.tickets.length > 0
                    ? agent.tickets.map((ticket: any) => (
                        <Box key={ticket._id} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ticket.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ticket.status.replace("_", " ")}
                          </Typography>
                        </Box>
                      ))
                    : "No tickets assigned"}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* UNASSIGNED TICKETS */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: "20px" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Unassigned Tickets
            </Typography>

            {unassignedTickets.length === 0 && (
              <Typography>No unassigned tickets.</Typography>
            )}

            {unassignedTickets.map((ticket) => (
              <Box key={ticket._id}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" py={1}>
                  <Box>
                    <Typography fontWeight={600}>{ticket.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: "#F59E0B", textTransform: "capitalize" }}>
                    Unassigned
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

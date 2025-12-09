"use client";

import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, CircularProgress, Stack, Divider } from "@mui/material";
import { fetchAgentsAndTickets } from "@/services/admin.service"; // nueva función para obtener agentes y tickets
import { GroupRoundedIcon } from "@mui/icons-material";

export default function AdminDashboard() {
  const [agentsData, setAgentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgentsAndTickets() {
      try {
        const data = await fetchAgentsAndTickets();
        setAgentsData(data.agentsWithTickets);
      } catch (err) {
        console.error("Error fetching agents and tickets:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAgentsAndTickets();
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
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Admin Dashboard
      </Typography>

      {/* Agentes y tickets */}
      <Grid container spacing={3} mb={4}>
        {agentsData.map((agentData) => (
          <Grid item xs={12} sm={6} md={3} key={agentData.agent._id}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: "22px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                cursor: "pointer",
                background: "#ffffff",
                transition: "all .25s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "16px",
                  bgcolor: "#F59E0B",
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GroupRoundedIcon sx={{ fontSize: 40 }} />
              </Box>

              <Typography sx={{ fontSize: "1.5rem", fontWeight: 800 }}>
                {agentData.agent.name}
              </Typography>

              <Typography sx={{ fontWeight: 600, opacity: 0.7 }}>
                {agentData.agent.email}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontWeight: 600 }}>Assigned Tickets</Typography>
              {agentData.tickets.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tickets assigned.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {agentData.tickets.map((ticket: any) => (
                    <Typography variant="body2" key={ticket._id}>
                      {ticket.title}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

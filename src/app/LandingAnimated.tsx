"use client";

import { motion } from "framer-motion";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Container,
} from "@mui/material";

import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// Fade up animation
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

// Stagger children animation
const stagger = {
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function LandingAnimated() {
  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh" }}>
      {/* HERO */}
      <Box
        component={motion.section}
        initial="hidden"
        animate="show"
        variants={stagger}
        sx={{
          pt: 14,
          pb: 16,
          background: "linear-gradient(180deg, #111 0%, #333 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <motion.div variants={fadeUp}>
            <Typography variant="h2" fontWeight={800}>
              HelpDeskPro
            </Typography>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Typography
              variant="h6"
              sx={{ mt: 3, opacity: 0.9, maxWidth: 600, mx: "auto" }}
            >
              The modern and efficient platform to manage support tickets,
              resolve issues faster, and deliver exceptional service
              experiences.
            </Typography>
          </motion.div>

          {/* BUTTONS */}
          <motion.div
            variants={fadeUp}
            className="buttons-container"
            style={{
              display: "flex",
              marginTop: 30,
              gap: 16,
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#fff",
                color: "#111",
                fontWeight: 700,
                px: 4,
                "&:hover": { backgroundColor: "#ddd" },
              }}
              href="/auth/register"
            >
              Get Started
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "#fff",
                color: "#fff",
                fontWeight: 700,
                px: 4,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
              href="/auth/login"
            >
              Log In
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Container
        maxWidth="lg"
        sx={{ py: 12 }}
        component={motion.section}
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <Typography
          variant="h3"
          fontWeight={800}
          align="center"
          sx={{ mb: 10 }}
        >
          Why choose HelpDeskPro?
        </Typography>

        <Grid container spacing={5}>
          {/* Feature Cards */}
          {[ 
            { icon: <ChatBubbleOutlineIcon sx={{ fontSize: 50 }} />, title: "Ticket Management", desc: "Create, assign, and resolve tickets with a fast optimized workflow." },
            { icon: <FlashOnIcon sx={{ fontSize: 50 }} />, title: "Speed & Efficiency", desc: "A clean and modern interface designed to boost productivity." },
            { icon: <LockOutlinedIcon sx={{ fontSize: 50 }} />, title: "Roles & Security", desc: "Permissions and dashboards for Admins, Agents, and Clients." },
          ].map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper
                component={motion.div}
                variants={fadeUp}
                elevation={2}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 120 }}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  textAlign: "center",
                }}
              >
                <Box sx={{ mb: 2 }}>{item.icon}</Box>
                <Typography variant="h5" fontWeight={700}>
                  {item.title}
                </Typography>
                <Typography sx={{ mt: 1, opacity: 0.7 }}>
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* HOW IT WORKS */}
      <Box
        sx={{ bgcolor: "#f5f5f5", py: 12 }}
        component={motion.section}
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={800}
            align="center"
            sx={{ mb: 10 }}
          >
            How does it work?
          </Typography>

          <Grid container spacing={6}>
            {[
              {
                title: "1. Client creates a ticket",
                desc: "Describe the issue, attach images, and submit.",
              },
              {
                title: "2. Agent attends it",
                desc: "Agents manage the request and provide updates.",
              },
              {
                title: "3. Ticket is resolved",
                desc: "The user is notified and the ticket is archived.",
              },
            ].map((step, i) => (
              <Grid item xs={12} md={4} textAlign="center" key={i}>
                <motion.div variants={fadeUp}>
                  <Typography variant="h5" fontWeight={700}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ opacity: 0.7, mt: 1 }}>
                    {step.desc}
                  </Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA FINAL */}
      <Box
        sx={{
          py: 12,
          bgcolor: "#111",
          color: "white",
          textAlign: "center",
        }}
        component={motion.section}
        initial="hidden"
        animate="show"
        variants={fadeUp}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
            Ready to improve your IT support?
          </Typography>

          <Typography sx={{ opacity: 0.9, mb: 6 }}>
            Start using HelpDeskPro today and bring your ticket management to
            the next level.
          </Typography>

          <Button
            href="/auth/register"
            size="large"
            variant="contained"
            sx={{
              px: 6,
              py: 1.8,
              backgroundColor: "#fff",
              color: "#111",
              fontWeight: 700,
              "&:hover": { backgroundColor: "#ddd" },
            }}
          >
            Create an Account
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

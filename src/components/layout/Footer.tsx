"use client";

import { Box, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        mt: 10,
        borderTop: "1px solid #e5e5e5",
        backgroundColor: "#fafafa",
        py: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          px: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        {/* Left side */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            HelpDeskPro
          </Typography>

          <Typography variant="body2" sx={{ color: "#555", mt: 0.5 }}>
            Plataforma interna de gestión de soporte técnico.
          </Typography>

          <Typography variant="body2" sx={{ color: "#555", mt: 0.5 }}>
            Caso de desempeño – Be a Codernnn / Next.js
          </Typography>
        </Box>

        {/* Right side */}
        <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
          <Typography variant="body2" sx={{ color: "#444" }}>
            © {new Date().getFullYear()} HelpDeskPro. Todos los derechos
            reservados.
          </Typography>

          <Typography variant="body2" sx={{ color: "#444", mt: 0.5 }}>
            Proyecto académico – Evaluación de desarrollo con Next.js
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

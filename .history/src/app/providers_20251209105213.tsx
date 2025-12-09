"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import { ClientToaster } from "@/components/clientToaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ClientToaster />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}


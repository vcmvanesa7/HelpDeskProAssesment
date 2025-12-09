"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import { CartProvider } from "@/context/cart-context";
import { ClientToaster } from "@/components/clientToaster";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CartProvider>
          <ClientToaster />
          {children}
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

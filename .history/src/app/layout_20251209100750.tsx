import type { Metadata } from "next";
import "@/styles/globals.css";

import MainNavbar from "@/components/layout/MainNavbar";
import Providers from "./providers";
import { ClientToaster } from "@/components/clientToaster";

import { Bebas_Neue, Inter_Tight } from "next/font/google";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "HelpDeskPro",
  description: "Ticket management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${bebas.variable} ${interTight.variable} min-h-screen flex flex-col bg-white`}
      >
        <Providers>
          <MainNavbar />
          <main className="flex-grow">{children}</main>
        </Providers>
        <ClientToaster />
      </body>
    </html>
  );
}

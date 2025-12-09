"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
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

// Tipo mínimo del ticket
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
  const t = useTranslations("Support");

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";

  // ESTADO TIPADO
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const role = session?.user?.role;

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = `/${locale}/auth/login`;
    }
  }, [status, locale]);

  // Load tickets using service
  useEffect(() => {
    if (status !== "authenticated") return;

    const load = async () => {
      try {
        const data = await fetchTickets(); // { tickets, page, totalPages, total }
        setTickets(data.tickets || []); // ← LA SOLUCIÓN
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
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          {t("myTickets")}
        </Typography>

        {role === "client" && (
          <Link
            href={`/${locale}/support/new`}
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#111",
                "&:hover": { backgroundColor: "#333" },
              }}
            >
              {t("newTicket")}
            </Button>
          </Link>
        )}
      </Box>

      <Paper sx={{ overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>{t("table.title")}</TableCell>
              <TableCell>{t("table.status")}</TableCell>

              {role !== "client" && (
                <TableCell>{t("table.createdBy")}</TableCell>
              )}

              <TableCell>{t("table.createdAt")}</TableCell>
              <TableCell>{t("table.closedAt")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tickets.map((tk) => (
              <TableRow
                key={tk._id}
                hover
                component={Link}
                href={`/${locale}/support/${tk._id}`}
                sx={{ textDecoration: "none", cursor: "pointer" }}
              >
                <TableCell>{tk.title}</TableCell>

                <TableCell>
                  <Chip
                    label={t(`status.${tk.status}`)}
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
                  {new Date(tk.createdAt).toLocaleDateString(locale)}
                </TableCell>

                <TableCell>
                  {tk.resolvedAt
                    ? new Date(tk.resolvedAt).toLocaleDateString(locale)
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
                  {t("noTickets")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

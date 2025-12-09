"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import type { OrderType } from "@/types/order";
import { useUpdateShippingStatus } from "@/Hooks/useUpdateShippingStatus";

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderType | null>(null);
  const [loading, setLoading] = useState(true);

  const { updateShippingStatus, loadingId } = useUpdateShippingStatus();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data?.order) setOrder(data.order);
      } catch (err) {
        console.error("Admin load order error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleStatusChange(status: OrderType["shippingStatus"]) {
    if (!order) return;

    const updated = await updateShippingStatus(order._id, status, true);
    if (updated) setOrder(updated);
  }

  if (loading)
    return (
      <Box p={6} textAlign="center">
        <CircularProgress />
      </Box>
    );

  if (!order)
    return (
      <Box p={6} textAlign="center" color="error.main">
        Order not found.
      </Box>
    );

  const statusColor: Record<
    OrderType["shippingStatus"],
    "default" | "warning" | "info" | "success" | "error"
  > = {
    pending: "default",
    processing: "warning",
    shipped: "info",
    delivered: "success",
    cancelled: "error",
  };

  const currentShipping = order.shippingStatus ?? "pending";

  return (
    <Box p={4} maxWidth="900px" mx="auto">
      <Button onClick={() => router.back()} variant="outlined">
        ← Back
      </Button>

      <Typography variant="h4" fontWeight={700} mt={3} mb={2}>
        Order Details — {order.paypalOrderId}
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3, mb: 6 }} elevation={3}>
        <Stack spacing={2}>
          <Typography>
            <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
          </Typography>

          <Typography>
            <strong>Total:</strong> ${order.total.toFixed(2)}
          </Typography>

          <Typography>
            <strong>Payment:</strong> {order.paymentMethod}
          </Typography>

          <Typography>
            <strong>Order Status:</strong> {order.status}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={700}>Shipping:</Typography>
            <Chip
              label={currentShipping.toUpperCase()}
              color={statusColor[currentShipping]}
              variant="filled"
              sx={{ fontWeight: 700, px: 1 }}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              startIcon={<AutorenewIcon />}
              disabled={loadingId === order._id}
              onClick={() => handleStatusChange("processing")}
            >
              {loadingId === order._id ? (
                <CircularProgress size={22} />
              ) : (
                "Processing"
              )}
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="info"
              startIcon={<LocalShippingIcon />}
              disabled={loadingId === order._id}
              onClick={() => handleStatusChange("shipped")}
            >
              {loadingId === order._id ? (
                <CircularProgress size={22} />
              ) : (
                "Mark as Shipped"
              )}
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              disabled={loadingId === order._id}
              onClick={() => handleStatusChange("delivered")}
            >
              {loadingId === order._id ? (
                <CircularProgress size={22} />
              ) : (
                "Delivered"
              )}
            </Button>

            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              disabled={loadingId === order._id}
              onClick={() => handleStatusChange("cancelled")}
            >
              {loadingId === order._id ? (
                <CircularProgress size={22} />
              ) : (
                "Cancel"
              )}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="h5" fontWeight={700} mb={2}>
        Items
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 3 }} elevation={2}>
        {order.items.map((item) => (
          <Box
            key={item.productId}
            sx={{
              display: "flex",
              alignItems: "center",
              py: 2,
              borderBottom: "1px solid #eee",
              "&:last-child": { borderBottom: "none" },
            }}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={70}
              height={70}
              style={{ borderRadius: "8px", objectFit: "cover" }}
            />

            <Box ml={3}>
              <Typography fontWeight={600}>{item.title}</Typography>

              <Typography variant="body2" color="text.secondary">
                Qty: {item.qty} — ${item.priceAtAdd}
              </Typography>

              {item.variant && (
                <Typography variant="body2" color="text.disabled">
                  Variant: {item.variant}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

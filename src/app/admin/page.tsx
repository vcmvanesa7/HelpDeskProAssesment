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

import { formatDate } from "@/utils/formatDate";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalMallRoundedIcon from "@mui/icons-material/LocalMallRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

import { getCategories } from "@/services/products/categories.service";
import { getAllProducts } from "@/services/products/products.service";
import { getAllUsers } from "@/services/user.service";
import { getAdminOrders } from "@/services/orders.adminservice";

import type { IProduct } from "@/schemas/products/product.schema";
import type { ICategory } from "@/schemas/products/category.schema";
import type { IOrder } from "@/schemas/order.schema";
import type { IUser } from "@/schemas/user.schema";

type DashboardData = {
  products: IProduct[];
  categories: ICategory[];
  orders: IOrder[];
  users: IUser[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  shipped: "#0EA5E9",
  delivered: "#10B981",
  cancelled: "#EF4444",
};

export default function AdminDashboard() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData>({
    products: [],
    categories: [],
    orders: [],
    users: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [products, categories, ordersResp, users] = await Promise.all([
          getAllProducts(),
          getCategories(),
          getAdminOrders(),
          getAllUsers(),
        ]);

        setData({
          products: products ?? [],
          categories: categories ?? [],
          orders: ordersResp?.orders ?? [],
          users: users ?? [],
        });
      } catch (e) {
        console.error("Dashboard stats error:", e);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const stats = useMemo(
    () => ({
      products: data.products.length,
      categories: data.categories.length,
      orders: data.orders.length,
      users: data.users.length,
    }),
    [data]
  );

  /** ---------- CHART DATA ---------- */

  // Sales by Month
  // Sales per month (total $ per order.createdAt)
  const salesByMonth = useMemo(() => {
    const map = new Map<string, number>();

    data.orders.forEach((order) => {
      if (!order.createdAt) return;

      // ACTUAL SERVER DATE (UTC)
      const d = new Date(order.createdAt);

      //Convert **correctly** to local month according to user's country
      const year = d.getFullYear();
      const month = d.getMonth();

      const key = `${year}-${month}`;
      const current = map.get(key) ?? 0;
      map.set(key, current + (order.total ?? 0));
    });

    //  Display the month according to the user's language.
    const formatter = (key: string) => {
      const [year, monthIndex] = key.split("-").map(Number);
      const date = new Date(year, monthIndex, 1);

      return date.toLocaleDateString("es-ES", {
        month: "short",
      });
    };

    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, total]) => ({
        month: formatter(key),
        total: Number(total.toFixed(2)),
      }));
  }, [data.orders]);

  // (shippingStatus)
  const ordersByStatus = useMemo(() => {
    const map = new Map<string, number>();

    data.orders.forEach((order) => {
      const status = (order as any).shippingStatus || "pending";
      map.set(status, (map.get(status) ?? 0) + 1);
    });

    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }, [data.orders]);

  // (use product.category como label)
  const productsByCategory = useMemo(() => {
    const map = new Map<string, number>();

    data.products.forEach((product) => {
      const key = (product as any).category || "Uncategorized";
      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [data.products]);

  const cards = [
    {
      label: "Products",
      value: stats.products,
      icon: <Inventory2RoundedIcon sx={{ fontSize: 40 }} />,
      color: "#4F46E5",
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: <CategoryRoundedIcon sx={{ fontSize: 40 }} />,
      color: "#0EA5E9",
      href: "/admin/categories",
    },
    {
      label: "Orders",
      value: stats.orders,
      icon: <LocalMallRoundedIcon sx={{ fontSize: 40 }} />,
      color: "#10B981",
      href: "/admin/orders",
    },
    {
      label: "Users",
      value: stats.users,
      icon: <GroupRoundedIcon sx={{ fontSize: 40 }} />,
      color: "#F59E0B",
      href: "/admin/users",
    },
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
      {/* TOP BAR - RETURN TO STORE */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, letterSpacing: "0.05em" }}
        >
          Admin Dashboard
        </Typography>

        <button
          onClick={() => router.push("/")}
          className="
          px-4 py-2 
          bg-black text-white 
          rounded-lg 
          font-semibold text-sm 
          transition-all
          hover:bg-neutral-800 
          hover:scale-[1.03]
          cursor-pointer
          active:scale-[0.97]
          shadow-sm
        "
        >
          ← Volver a la tienda
        </button>
      </Box>

      {/* TOP STATS */}
      <Grid container spacing={3} mb={4}>
        {cards.map((card) => (
          <Grid key={card.label} item xs={12} sm={6} md={3}>
            <Paper
              elevation={3}
              onClick={() => router.push(card.href)}
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
                  bgcolor: card.color + "1A",
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </Box>

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

      {/* CHARTS ROW 1: Sales + Orders by status */}
      <Grid container spacing={3} mb={4}>
        {/* Sales line chart */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "22px",
              height: 320,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight={700} mb={1}>
              Sales by month
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Total revenue based on orders.
            </Typography>

            <Box sx={{ flex: 1 }}>
              {salesByMonth.length === 0 ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  No sales data yet.
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Total",
                      ]}
                      labelFormatter={(label) => `Mes: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#111111"
                      strokeWidth={2.4}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Orders by status pie chart */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "22px",
              height: 320,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight={700} mb={1}>
              Orders by status
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Distribution of shipping status.
            </Typography>

            <Box sx={{ flex: 1 }}>
              {ordersByStatus.length === 0 ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  No orders yet.
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {ordersByStatus.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] ?? "#111111"}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* CHARTS ROW 2: Products by category + recent orders */}
      <Grid container spacing={3}>
        {/* Products by category */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "22px",
              height: 320,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight={700} mb={1}>
              Products by category
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              How your catalog is distributed.
            </Typography>

            <Box sx={{ flex: 1 }}>
              {productsByCategory.length === 0 ? (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  No products yet.
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#111111" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent orders */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "22px",
              height: 320,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight={700} mb={1}>
              Recent orders
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Last activity in your store.
            </Typography>

            <Box sx={{ flex: 1, overflow: "auto" }}>
              {data.orders.slice(0, 5).map((order) => (
                <Box key={order._id as unknown as string}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                  >
                    <Box key={String(order._id)}>
                      <Typography fontWeight={600} fontSize={14}>
                        {order.paypalOrderId ?? String(order._id)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize={12}
                      >
                        {order.createdAt ? formatDate(order.createdAt) : ""}
                      </Typography>
                    </Box>

                    <Box textAlign="right">
                      <Typography fontWeight={700}>
                        ${order.total?.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 12,
                          textTransform: "capitalize",
                          color:
                            STATUS_COLORS[
                              (order as any).shippingStatus || "pending"
                            ] || "text.secondary",
                        }}
                      >
                        {(order as any).shippingStatus || "pending"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                </Box>
              ))}

              {data.orders.length === 0 && (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  No recent orders.
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

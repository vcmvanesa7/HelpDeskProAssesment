"use client";

import { useEffect, useState, useMemo } from "react";
import type { OrderType } from "@/types/order";
import { useUpdateShippingStatus } from "@/Hooks/useUpdateShippingStatus";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { updateShippingStatus, loadingId } = useUpdateShippingStatus();

  /** Load all admin orders */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/orders/", { cache: "no-store" });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Failed to load admin orders", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /** Update shipping status action */
  async function handleChangeStatus(
    paypalOrderId: string,
    status: OrderType["shippingStatus"]
  ) {
    const updated = await updateShippingStatus(paypalOrderId, status);
    if (!updated) return;

    setOrders((prev) =>
      prev.map((o) => (o.paypalOrderId === updated.paypalOrderId ? updated : o))
    );
  }

  /** Filter & Search */
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) =>
        search.trim()
          ? o.paypalOrderId.toLowerCase().includes(search.toLowerCase())
          : true
      )
      .filter((o) =>
        filterStatus === "all" ? true : o.shippingStatus === filterStatus
      );
  }, [orders, search, filterStatus]);

  /* TOTALS (General / Month / Week) */

  // Memo for today
  const now = useMemo(() => new Date(), []);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Start of week (memoized to remove warning)
  const startOfWeek = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday = start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // TOTAL GENERAL
  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders]);

  // TOTALMONTH
  const totalRevenueMonth = useMemo(() => {
    return filteredOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders, currentMonth, currentYear]);

  // TOTALWEEK
  const totalRevenueWeek = useMemo(() => {
    return filteredOrders
      .filter((o) => new Date(o.createdAt) >= startOfWeek)
      .reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders, startOfWeek]);

  /** Pagination logic */
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    return <div className="p-8 text-neutral-600">Loading orders...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* BACK TO ADMIN DASHBOARD */}
      <Link
        href="/admin"
        className="inline-block px-4 py-2 mb-4 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition text-sm font-medium"
      >
        ← Back to Admin
      </Link>

      <h1 className="text-3xl font-bold mb-4">Orders</h1>

      {/*TOTALS PANEL (General / Month / Week)*/}
      <div className="flex flex-wrap gap-6 mb-6">
        {/* TOTAL GENERAL */}
        <div className="bg-black text-white rounded-xl px-6 py-4 shadow-md">
          <p className="text-lg font-semibold">Total revenue</p>
          <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>

        {/* TOTAL MONTH */}
        <div className="bg-blue-600 text-white rounded-xl px-6 py-4 shadow-md">
          <p className="text-lg font-semibold">This month</p>
          <p className="text-2xl font-bold">${totalRevenueMonth.toFixed(2)}</p>
        </div>

        {/* TOTAL WEEK */}
        <div className="bg-green-600 text-white rounded-xl px-6 py-4 shadow-md">
          <p className="text-lg font-semibold">This week</p>
          <p className="text-2xl font-bold">${totalRevenueWeek.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by PayPal ID..."
          className="px-4 py-2 border rounded-lg w-60"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <select
          className="px-4 py-2 border rounded-lg"
          value={filterStatus}
          onChange={(e) => {
            setPage(1);
            setFilterStatus(e.target.value);
          }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">PayPal ID</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Shipping</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedOrders.map((order) => (
              <tr
                key={order._id}
                className="border-t hover:bg-neutral-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order._id}`}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Link>
                </td>

                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/orders/${order._id}`}>
                    {order.paypalOrderId}
                  </Link>
                </td>

                <td className="px-4 py-3">${order.total.toFixed(2)}</td>

                <td className="px-4 py-3">{order.paymentMethod}</td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3">{order.shippingStatus}</td>

                <td className="px-4 py-3 space-x-2">
                  <button
                    disabled={loadingId === order.paypalOrderId}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                    onClick={() =>
                      handleChangeStatus(order.paypalOrderId, "shipped")
                    }
                  >
                    Mark as shipped
                  </button>

                  <button
                    disabled={loadingId === order.paypalOrderId}
                    className="px-3 py-1 rounded bg-green-600 text-white text-xs"
                    onClick={() =>
                      handleChangeStatus(order.paypalOrderId, "delivered")
                    }
                  >
                    Delivered
                  </button>

                  <button
                    disabled={loadingId === order.paypalOrderId}
                    className="px-3 py-1 rounded bg-red-600 text-white text-xs"
                    onClick={() =>
                      handleChangeStatus(order.paypalOrderId, "cancelled")
                    }
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3 pt-4">
        <button
          disabled={page === 1}
          className="px-3 py-1 bg-neutral-200 rounded disabled:opacity-40"
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span className="px-3 py-1">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          className="px-3 py-1 bg-neutral-200 rounded disabled:opacity-40"
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

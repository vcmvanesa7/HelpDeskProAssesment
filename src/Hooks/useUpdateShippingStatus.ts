"use client";

import { useState } from "react";

export function useUpdateShippingStatus() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  /**
   * updateShippingStatus
   * @param id — Mongo _id (ADMIN) o paypalOrderId (CLIENT)
   * @param status — next status
   * @param isAdmin — if true → PATCH /api/admin/orders/:id
   */
  async function updateShippingStatus(
    id: string,
    status: string,
    isAdmin = false
  ) {
    try {
      setLoadingId(id);

      const url = isAdmin ? `/api/admin/orders/${id}` : `/api/orders/${id}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingStatus: status }),
      });

      const data = await res.json();

      return data.order ?? null;
    } catch (e) {
      console.error("Update status failed", e);
      return null;
    } finally {
      setLoadingId(null);
    }
  }

  return { updateShippingStatus, loadingId };
}

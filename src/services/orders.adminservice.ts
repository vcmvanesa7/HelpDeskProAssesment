// src/services/orders/adminOrders.service.ts
import axios from "axios";
import type { IOrder } from "@/schemas/order.schema";

export async function getAdminOrders(): Promise<{ orders: IOrder[] }> {
  const { data } = await axios.get("/api/admin/orders");
  return data;
}

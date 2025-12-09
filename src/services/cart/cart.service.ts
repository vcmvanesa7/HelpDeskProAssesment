// src/services/cart/cart.service.ts
import axios from "axios";
import type { CartDTO } from "@/types/cart";

// Global configuration for axios to include credentials in requests
axios.defaults.withCredentials = true;

/**
 * BASE URL LOCAL O PRODUCCIÓN
 */
axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/* GET CART */
export async function getCart(): Promise<CartDTO> {
  const { data } = await axios.get<{ cart: CartDTO }>("/api/cart/get");
  return data.cart;
}

/* ADD TO CART */
export async function addToCart(
  productId: string,
  qty: number = 1,
  variant?: string
): Promise<CartDTO> {
  const { data } = await axios.post<{ cart: CartDTO }>("/api/cart/add", {
    productId,
    qty,
    variant,
  });
  return data.cart;
}

/* UPDATE ITEM */
export async function updateCartItem(
  productId: string,
  qty: number,
  variant?: string
): Promise<CartDTO> {
  const { data } = await axios.put<{ cart: CartDTO }>("/api/cart/update", {
    productId,
    qty,
    variant,
  });
  return data.cart;
}

/* REMOVE ITEM */
export async function removeFromCart(
  productId: string,
  variant?: string
): Promise<CartDTO> {
  const { data } = await axios.delete<{ cart: CartDTO }>("/api/cart/remove", {
    data: { productId, variant },
  });
  return data.cart;
}

/* CLEAR CART */
export async function clearCart(): Promise<void> {
  await axios.delete("/api/cart/clear");
}

import type { CartDTO } from "@/types/cart";

/**
 * Evita errores cuando el carrito en localStorage viene corrupto,
 * vacío o con datos incompletos.
 */
export function sanitizeCart(cart: CartDTO | null | undefined): CartDTO {
  if (!cart || typeof cart !== "object" || !Array.isArray(cart.items)) {
    return { items: [] };
  }

  const safeItems = cart.items.filter(
    (item) =>
      item &&
      typeof item.productId === "string" &&
      typeof item.qty === "number" &&
      item.qty > 0
  );

  return { items: safeItems };
}

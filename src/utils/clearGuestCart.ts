export function clearGuestCart() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cart");
  }

  return { items: [] };
}

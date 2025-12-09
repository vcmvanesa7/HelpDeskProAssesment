"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useSession } from "next-auth/react";
import type { CartDTO } from "@/types/cart";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "@/services/cart/cart.service";

import { clearGuestCart } from "@/utils/clearGuestCart";
import { sanitizeCart } from "@/utils/sanitizeCart";

interface AddItemPayload {
  productId: string;
  qty?: number;
  priceAtAdd: number;
  variant?: string;
  title: string;
  image: string;
}

interface CartContextValue {
  cart: CartDTO | null;
  loading: boolean;

  addItem: (payload: AddItemPayload) => Promise<void>;
  updateItem: (
    productId: string,
    qty: number,
    variant?: string
  ) => Promise<void>;
  removeItem: (productId: string, variant?: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const [cart, setCart] = useState<CartDTO | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cuando el usuario INICIA SESIÓN:
   * → Limpiamos el carrito invitado para evitar items viejos.
   */
  useEffect(() => {
    if (session) {
      clearGuestCart();
    }
  }, [session]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // --- USER GUEST (NO SESSION) ---
      if (!session) {
        const local = localStorage.getItem("cart");
        const parsed: CartDTO = local ? JSON.parse(local) : { items: [] };

        const sanitized = sanitizeCart(parsed);
        localStorage.setItem("cart", JSON.stringify(sanitized));
        setCart(sanitized);
        return;
      }

      // --- USER LOGGED ---
      const serverCart = await getCart();
      setCart(serverCart);
    } catch (err) {
      console.error("Cart refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ADD ITEM
  const addItem = useCallback(
    async ({
      productId,
      qty = 1,
      priceAtAdd,
      title,
      image,
      variant,
    }: AddItemPayload) => {
      if (!session) {
        const local = localStorage.getItem("cart");
        const parsed: CartDTO = local ? JSON.parse(local) : { items: [] };

        const existing = parsed.items.find(
          (i) =>
            i.productId === productId &&
            (i.variant ?? null) === (variant ?? null)
        );

        if (existing) {
          existing.qty += qty;
        } else {
          parsed.items.push({
            productId,
            qty,
            priceAtAdd,
            variant: variant ?? undefined,
            title,
            image,
          });
        }

        const sanitized = sanitizeCart(parsed);
        localStorage.setItem("cart", JSON.stringify(sanitized));
        setCart(sanitized);
        return;
      }

      await addToCart(productId, qty, variant);
      await refresh();
    },
    [session, refresh]
  );

  // UPDATE ITEM
  const updateItem = useCallback(
    async (productId: string, qty: number, variant?: string) => {
      if (!session) {
        const local = localStorage.getItem("cart");
        const parsed: CartDTO = local ? JSON.parse(local) : { items: [] };

        if (qty === 0) {
          parsed.items = parsed.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                (i.variant ?? null) === (variant ?? null)
              )
          );
        } else {
          const item = parsed.items.find(
            (i) =>
              i.productId === productId &&
              (i.variant ?? null) === (variant ?? null)
          );
          if (item) item.qty = qty;
        }

        const sanitized = sanitizeCart(parsed);
        localStorage.setItem("cart", JSON.stringify(sanitized));
        setCart(sanitized);
        return;
      }

      await updateCartItem(productId, qty, variant);
      await refresh();
    },
    [session, refresh]
  );

  // REMOVE ITEM
  const removeItem = useCallback(
    async (productId: string, variant?: string) => {
      if (!session) {
        const local = localStorage.getItem("cart");
        const parsed: CartDTO = local ? JSON.parse(local) : { items: [] };

        parsed.items = parsed.items.filter(
          (i) =>
            !(
              i.productId === productId &&
              (i.variant ?? null) === (variant ?? null)
            )
        );

        const sanitized = sanitizeCart(parsed);
        localStorage.setItem("cart", JSON.stringify(sanitized));
        setCart(sanitized);
        return;
      }

      await removeFromCart(productId, variant);
      await refresh();
    },
    [session, refresh]
  );

  // CLEAR CART
  const clear = useCallback(async () => {
    if (!session) {
      const empty = clearGuestCart();
      setCart(empty);
      return;
    }

    await clearCart();
    await refresh();
  }, [session, refresh]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItem,
        updateItem,
        removeItem,
        clear,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

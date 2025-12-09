"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CheckoutButton({ total }: { total: number }) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("checkout");

  async function handleCheckout() {
    try {
      setLoading(true);

      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total }),
      });

      const data = await res.json();

      if (!data?.id) {
        console.error("PayPal: Invalid order response");
        setLoading(false);
        return;
      }

      // Redirect to PayPal
      window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${data.id}`;
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition disabled:bg-neutral-300 disabled:cursor-not-allowed"
    >
      {loading ? t("loading") : t("button")}
    </button>
  );
}

"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { OrderType } from "@/types/order";
import Link from "next/link";
import Image from "next/image";

export default function SuccessPage() {
  const params = useSearchParams();
  const pathname = usePathname();

  // Extract locale from `/es/...` or `/en/...`
  const locale = pathname.split("/")[1] || "es";

  const orderId = params.get("orderId");
  const t = useTranslations("checkoutSuccess");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderType | null>(null);

  useEffect(() => {
    async function load() {
      if (!orderId) return;

      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [orderId]);

  if (loading)
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-neutral-600">
        {t("loading")}
      </div>
    );

  /** IMPORTANT GUARD */
  if (!order || !order.items) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-red-500">
        {t("notFound")}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <h1 className="text-3xl font-extrabold mb-6">{t("thankYou")}</h1>

      {/* MAIN ORDER CARD */}
      <div className="border p-6 rounded-xl shadow-sm bg-white">
        <p>
          <strong>{t("orderId")}:</strong> {order._id}
        </p>

        <p className="mt-2">
          <strong>{t("status")}:</strong> {order.status}
        </p>

        <p className="mt-2">
          <strong>{t("total")}:</strong> ${order.total}
        </p>

        <p className="mt-2">
          <strong>{t("paymentMethod")}:</strong> {order.paymentMethod}
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          {t("placedAt")} {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {/* ITEMS LIST */}
      <h2 className="mt-10 mb-4 text-xl font-bold">{t("itemsTitle")}</h2>

      <div className="space-y-4">
        {order.items.map((item) => (
          <div
            key={item.productId}
            className="p-4 border rounded-lg bg-white flex items-center gap-4"
          >
            <Image
              src={item.image}
              alt={item.title}
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-md border"
            />

            <div>
              <p className="font-semibold">{item.title}</p>

              <p className="text-sm text-neutral-600">
                {t("qty")}: {item.qty} — ${item.priceAtAdd}
              </p>

              {item.variant && (
                <p className="text-sm text-neutral-500">
                  {t("variant")}: {item.variant}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <div className="mt-10 flex flex-col gap-4">
        {/* Main button */}
        <Link
          href={`/${locale}/products`}
          className="px-6 py-3 bg-black text-white rounded-xl font-bold text-center hover:bg-neutral-800 transition"
        >
          {t("continue")}
        </Link>
      </div>
    </div>
  );
}

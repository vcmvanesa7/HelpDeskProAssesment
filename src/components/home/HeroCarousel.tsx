"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function Hero() {
  const t = useTranslations("home.hero");
  const pathname = usePathname();

  // Extract locale from path ("/es", "/en", etc.)
  const locale = pathname.split("/")[1] || "es";

  // Locale-aware URLs
  const productsUrl = `/${locale}/products`;
  const newArrivalsUrl = `/${locale}/products?sort=newest`;

  return (
    <section className="w-full bg-white border-b border-neutral-200">
      <div className="max-w-[1400px] mx-auto px-6 py-14 md:py-20 grid md:grid-cols-2 gap-14 items-center">
        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-500">
            {t("tag")}
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            {t("titleLine1")}
            <span className="block text-koi-orange">{t("titleLine2")}</span>
          </h1>

          <p className="text-sm md:text-base text-neutral-600 max-w-lg">
            {t("description")}
          </p>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={productsUrl}
              className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-900 transition"
            >
              {t("shop")}
            </Link>

            <Link
              href={newArrivalsUrl}
              className="px-6 py-3 rounded-full border border-neutral-900 text-sm font-medium hover:bg-neutral-100 transition"
            >
              {t("newArrivals")}
            </Link>
          </div>

          {/* SELLING POINTS */}
          <div className="flex gap-8 pt-4 text-xs text-neutral-500">
            <div>
              <p className="font-semibold text-neutral-900">
                {t("shippingTitle")}
              </p>
              <p>{t("shippingDesc")}</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">
                {t("qualityTitle")}
              </p>
              <p>{t("qualityDesc")}</p>
            </div>
          </div>
        </motion.div>

        {/* IMAGE BANNER */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg"
        >
          <Image
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1800&auto=format"
            alt="KOI Collection"
            fill
            className="object-cover w-full h-full opacity-90"
          />

          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] rounded-full uppercase tracking-wide">
            {t("badgeNew")}
          </div>

          <div className="absolute bottom-4 right-4 text-xs text-white/80 uppercase tracking-widest">
            {t("badgeDrop")}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import type { IProduct } from "@/schemas/products/product.schema";
import VideoIntro from "@/components/home/VideoIntro";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductCard from "@/components/home/ProductCard";
import BenefitsStrip from "@/components/home/Benefits";
import PromoBanner from "@/components/home/PromoBanner";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function HomePage() {
  const t = useTranslations("home");

  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es"; // fallback seguro

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=8");
        const data = await res.json();

        const items = Array.isArray(data) ? data : data.items || [];
        setProducts(items);
      } catch (err) {
        console.error("Error loading products", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const featured = products.slice(0, 4);
  const latest = products.slice(4, 8);

  return (
    <div className="bg-white text-neutral-900">
      <VideoIntro />

      <HeroCarousel />

      <BenefitsStrip />

      {/* FEATURED */}
      <section className="max-w-[1400px] mx-auto px-6 mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight uppercase">
            {t("featuredTitle")}
          </h2>

          {/* 🔥 Locale-aware link */}
          <Link
            href={`/${locale}/products`}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            {t("featuredViewAll")}
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : featured.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("noProducts")}</p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          >
            {featured.map((p, idx) => (
              <motion.div key={p._id} variants={fadeUp} custom={idx * 0.05}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <PromoBanner />

      {/* LATEST */}
      {!loading && latest.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 mt-16 mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold uppercase">
              {t("latestTitle")}
            </h2>

            {/* 🔥 Locale-aware link with query */}
            <Link
              href={`/${locale}/products?sort=newest`}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {t("latestSeeAll")}
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6"
          >
            {latest.map((p, idx) => (
              <motion.div key={p._id} variants={fadeUp} custom={idx * 0.05}>
                <ProductCard product={p} compact />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}

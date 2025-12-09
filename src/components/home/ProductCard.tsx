"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import type { IProduct } from "@/schemas/products/product.schema";

interface ProductCardProps {
  product: IProduct;
  compact?: boolean;
}

export default function ProductCard({
  product,
  compact = false,
}: ProductCardProps) {
  const t = useTranslations("home.productCard");
  const pathname = usePathname();

  // Extract locale from current URL: /es/... or /en/...
  const locale = pathname.split("/")[1] || "es";

  // Correct locale-aware URL
  const productUrl = `/${locale}/products/${product._id}`;

  const img = product.images?.[0]?.url || "/placeholder.png";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.25 }}
      className="relative group"
    >
      <Link href={productUrl}>
        {/* IMAGE WRAPPER */}
        <div
          className="
            overflow-hidden rounded-3xl relative
            bg-gradient-to-br from-neutral-100 to-neutral-200
            shadow-md group-hover:shadow-xl
            transition-all duration-300
            aspect-[4/5]
            w-full max-h-[480px]
          "
        >
          <Image
            src={img}
            alt={product.title}
            width={500}
            height={500}
            className="
              w-full h-full object-cover rounded-3xl
              group-hover:scale-110 transition-all duration-500
            "
          />

          {/* GLASS LABEL */}
          <div
            className="
              absolute bottom-3 left-3
              px-3 py-1 rounded-full text-xs font-medium
              backdrop-blur-md bg-white/20 text-white
              opacity-0 group-hover:opacity-100 transition-all
            "
          >
            {t("viewDetails")}
          </div>
        </div>

        {/* TEXT */}
        <div className="mt-3 px-1">
          <h3 className="font-semibold text-base tracking-tight text-neutral-900">
            {product.title}
          </h3>

          {!compact && (
            <p className="text-neutral-600 text-sm mt-1 font-medium">
              ${product.price.toFixed(2)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  getProductById,
  getProductsFiltered,
} from "@/services/products/products.service";
import type { IProduct } from "@/schemas/products/product.schema";
import { useCart } from "@/context/cart-context";

export default function ProductPage() {
  const t = useTranslations("product");
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<IProduct[]>([]);

  // UI state
  const [mainImg, setMainImg] = useState("");
  const [zoom, setZoom] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const { addItem } = useCart();

  /** VARIANT STOCK */
  const variantStock = useMemo(() => {
    if (!product) return 0;

    const variant = product.variants?.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    return variant?.stock ?? 0;
  }, [product, selectedColor, selectedSize]);

  const isOutOfStock = variantStock <= 0;

  /* LOAD PRODUCT */
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const p = await getProductById(id);
      setProduct(p);

      const validVariant = p.variants?.find((v) => v.stock > 0);

      setSelectedColor(validVariant?.color || p.colors?.[0] || null);
      setSelectedSize(validVariant?.size || p.sizes?.[0] || null);

      setMainImg(p.images?.[0]?.url || "");

      const r = await getProductsFiltered({
        categoryId: p.categoryId || undefined,
        limit: 12,
      });

      setRelated(r.items.filter((x) => x._id !== p._id));
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading)
    return (
      <div className="h-[50vh] flex items-center justify-center text-neutral-500">
        {t("loading")}
      </div>
    );

  if (!product) return <div>{t("notFound")}</div>;

  /** PRICE */
  const discount = product.discount ?? 0;

  const discountedPrice =
    discount > 0
      ? product.price - product.price * (discount / 100)
      : product.price;

  return (
    <div className="pt-24 pb-28 bg-white text-neutral-900">
      {/* BREADCRUMB */}
      <div className="max-w-[1400px] mx-auto px-6 text-sm text-neutral-500 mb-6">
        <Link href={`/${locale}`} className="hover:text-black">
          {t("breadcrumbHome")}
        </Link>{" "}
        /{" "}
        <Link href={`/${locale}/products`} className="hover:text-black">
          {t("breadcrumbProducts")}
        </Link>{" "}
        / <span className="text-black font-medium">{product.title}</span>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT IMAGES */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-4">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setZoom(true);
                  setMainImg(img.url);
                  setTimeout(() => setZoom(false), 150);
                }}
                className={`w-20 h-20 rounded-lg overflow-hidden border ${
                  mainImg === img.url
                    ? "border-black"
                    : "border-neutral-300 hover:border-black"
                } transition`}
              >
                <Image
                  src={img.url}
                  alt=""
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          <motion.div
            key={mainImg}
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: zoom ? 1.08 : 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full rounded-xl overflow-hidden aspect-[4/5] bg-neutral-100"
          >
            <Image
              src={mainImg}
              alt={product.title}
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* RIGHT SECTION */}
        <div>
          <h1 className="text-3xl font-extrabold">{product.title}</h1>

          <div className="mt-3 flex items-end gap-3">
            <p className="text-2xl font-bold">${discountedPrice.toFixed(2)}</p>
            {discount > 0 && (
              <p className="text-neutral-500 line-through text-lg">
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* STOCK */}
          <p className="mt-2 text-sm text-neutral-500">
            {isOutOfStock
              ? t("outOfStock")
              : t("inStock", { stock: variantStock })}
          </p>

          {/* BRAND */}
          <p className="text-sm mt-1 text-neutral-500">
            {t("brand")}:{" "}
            <span className="text-neutral-800">{product.brand}</span>
          </p>

          {/* DESCRIPTION */}
          <p className="mt-6 text-neutral-700 leading-relaxed">
            {product.description}
          </p>

          {/* COLORS */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold mb-2">{t("colors")}</p>
              <div className="flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColor === c
                        ? "border-black scale-110"
                        : "border-neutral-300 hover:border-black"
                    } transition`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SIZES */}
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold mb-2">{t("sizes")}</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => {
                  const variant = product.variants?.find(
                    (v) => v.color === selectedColor && v.size === s
                  );
                  const stock = variant?.stock ?? 0;
                  const disabled = stock <= 0;

                  return (
                    <button
                      key={s}
                      onClick={() => !disabled && setSelectedSize(s)}
                      disabled={disabled}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                        disabled
                          ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                          : selectedSize === s
                          ? "bg-black text-white"
                          : "border-neutral-300 hover:border-black"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QTY */}
          <div className="mt-6">
            <p className="font-semibold mb-2">{t("quantity")}</p>
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="border border-neutral-300 rounded-lg px-3 py-2"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={async () => {
              await addItem({
                productId: product._id!,
                qty,
                priceAtAdd: discountedPrice,
                variant: `${selectedColor}-${selectedSize}`,
                title: product.title,
                image: product.images?.[0]?.url || "/placeholder.png",
              });

              router.push(`/${locale}/cart`);
            }}
            className={`mt-10 w-full py-4 rounded-xl font-bold uppercase tracking-wide transition ${
              isOutOfStock
                ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            {isOutOfStock ? t("outOfStock") : t("addToCart")}
          </button>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="max-w-[1400px] mx-auto px-6 mt-20">
            <h2 className="text-2xl font-bold mb-6">{t("related")}</h2>

            <div className="flex gap-6 overflow-x-auto pb-4">
              {related.map((p) => (
                <Link
                  key={p._id}
                  href={`/${locale}/products/${p._id}`}
                  className="min-w-[250px] rounded-xl overflow-hidden border border-neutral-200 hover:border-black transition"
                >
                  <div className="relative w-full h-64 bg-neutral-100">
                    <Image
                      src={p.images?.[0]?.url || "/placeholder.png"}
                      alt={p.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-neutral-600">${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        <div className="max-w-[1400px] mx-auto px-6 mt-20">
          <h2 className="text-2xl font-bold mb-3">{t("reviewsTitle")}</h2>

          <div className="flex items-center gap-2">
            <p className="text-xl font-bold">4.8</p>
            <div className="flex text-yellow-500 text-xl">★★★★★</div>
            <p className="text-sm text-neutral-500">
              {t("reviewsCount", { count: 221 })}
            </p>
          </div>

          <p className="mt-4 text-neutral-600">{t("sampleReview")}</p>
        </div>
      </div>
    </div>
  );
}

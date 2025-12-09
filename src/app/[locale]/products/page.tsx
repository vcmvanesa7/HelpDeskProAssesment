"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import ProductCard from "@/components/home/ProductCard";
import type { IProduct } from "@/schemas/products/product.schema";

import {
  getProductsFiltered,
  type ProductsFilters,
} from "@/services/products/products.service";

import { getCategoriesByKind } from "@/services/products/categories.service";
import type { ICategory } from "@/schemas/products/category.schema";

export default function ProductsPage() {
  const t = useTranslations("products");
  const pathname = usePathname();

  /** Extract locale from current path */
  const locale = pathname.split("/")[1] || "es";

  /** Helper to build localized URLs */
  const localized = (path: string) => `/${locale}${path}`;

  /** PRODUCTS */
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  /** PAGINATION */
  const [page, setPage] = useState(1);
  const limit = 12;
  const [pages, setPages] = useState(1);

  /** FILTERS */
  const [sort, setSort] = useState<ProductsFilters["sort"]>("newest");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");

  /** CATEGORIES */
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [collections, setCollections] = useState<ICategory[]>([]);

  /** LOAD ALL CATEGORY TYPES */
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategoriesByKind("category");
      const cols = await getCategoriesByKind("collection");

      setCategories(cats);
      setCollections(cols);
    };

    loadCategories();
  }, []);

  /** LOAD PRODUCTS */
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const { items, pages } = await getProductsFiltered({
          page,
          limit,
          search,
          categoryId,
          collectionId,
          sort,
        });

        setProducts(items);
        setPages(pages);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);

        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    load();
  }, [page, search, sort, categoryId, collectionId]);

  const resetToFirstPage = () => setPage(1);

  /** BREADCRUMB */
  const breadcrumb = categoryId
    ? categories.find((c) => c._id === categoryId)?.name
    : collectionId
    ? collections.find((c) => c._id === collectionId)?.name
    : t("breadcrumbAll");

  return (
    <div className="pt-24 pb-16 bg-white text-neutral-900">
      {/* BREADCRUMB */}
      <div className="max-w-[1400px] mx-auto px-6 text-sm text-neutral-500 mb-4">
        {/* Important → locale-aware Link */}
        <Link href={localized("")} className="hover:text-black transition">
          {t("breadcrumbHome")}
        </Link>{" "}
        / <span className="text-neutral-800 font-medium">{breadcrumb}</span>
      </div>

      {/* HEADER */}
      <div className="max-w-[1400px] mx-auto px-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight uppercase">
          {breadcrumb}
        </h1>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* SEARCH */}
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm w-48"
          />

          {/* CATEGORY */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              resetToFirstPage();
            }}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* COLLECTION */}
          <select
            value={collectionId}
            onChange={(e) => {
              setCollectionId(e.target.value);
              resetToFirstPage();
            }}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">{t("allCollections")}</option>
            {collections.map((col) => (
              <option key={col._id} value={col._id}>
                {col.name}
              </option>
            ))}
          </select>

          {/* SORT */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as ProductsFilters["sort"]);
              resetToFirstPage();
            }}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="newest">{t("sortNewest")}</option>
            <option value="price_asc">{t("sortPriceAsc")}</option>
            <option value="price_desc">{t("sortPriceDesc")}</option>
          </select>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-[1400px] mx-auto px-6">
        {loading ? (
          <p className="text-sm text-neutral-500">{t("loading")}</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-neutral-500">{t("noResults")}</p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                {/* LOCALIZED LINK INSIDE ProductCard */}
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="max-w-[1400px] mx-auto px-6 mt-14 flex justify-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`
              px-4 py-2 rounded-full border-2 text-sm font-bold uppercase
              transition-all
              ${
                page === 1
                  ? "border-neutral-300 text-neutral-300 cursor-default"
                  : "border-black hover:bg-black hover:text-white"
              }
            `}
          >
            {t("paginationPrev")}
          </button>

          {Array.from({ length: pages }).map((_, i) => {
            const num = i + 1;
            return (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`
                  w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center
                  transition-all
                  ${
                    num === page
                      ? "bg-black text-white"
                      : "border border-neutral-300 hover:border-black"
                  }
                `}
              >
                {num}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className={`
              px-4 py-2 rounded-full border-2 text-sm font-bold uppercase
              transition-all
              ${
                page === pages
                  ? "border-neutral-300 text-neutral-300 cursor-default"
                  : "border-black hover:bg-black hover:text-white"
              }
            `}
          >
            {t("paginationNext")}
          </button>
        </div>
      </div>
    </div>
  );
}

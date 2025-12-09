import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

function PromoBanner() {
  const t = useTranslations("home.promo");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";

  return (
    <section id="highlights" className="max-w-[1400px] mx-auto px-6 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950 text-white px-6 py-7 md:px-10 md:py-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-neutral-400">
            {t("tag")}
          </p>

          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm text-neutral-300 max-w-md">
            {t("description")}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {/* FIX: locale-aware link */}
            <Link
              href={`/${locale}/products?tag=duality`}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white text-black text-xs font-medium uppercase tracking-[0.16em] hover:bg-neutral-100 transition"
            >
              {t("explore")}
            </Link>

            <button className="inline-flex items-center px-4 py-2 rounded-full border border-neutral-500 text-xs font-medium uppercase tracking-[0.16em] hover:border-white hover:text-white transition">
              {t("notify")}
            </button>
          </div>
        </div>

        <div className="relative w-full md:w-56 h-40 md:h-44">
          <div className="absolute inset-0 bg-gradient-to-br from-koi-orange/40 via-koi-orange/10 to-transparent rounded-3xl blur-xl" />

          <div className="relative h-full w-full rounded-3xl border border-neutral-700 bg-neutral-900 flex flex-col items-center justify-center gap-1">
            <p className="text-[11px] text-neutral-400 tracking-[0.22em] uppercase">
              {t("sizes")}
            </p>

            <p className="text-sm font-medium">{t("sizesRange")}</p>

            <p className="text-[11px] text-neutral-400 tracking-[0.22em] uppercase mt-3">
              {t("fabric")}
            </p>

            <p className="text-sm font-medium">{t("fabricInfo")}</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default PromoBanner;

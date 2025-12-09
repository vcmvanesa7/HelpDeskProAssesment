"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es"; // fallback seguro

  return (
    <footer className="relative bg-black text-white mt-8 lg:mt-30">
      {/* --- Background Logo --- */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
        <Image
          src="/logs/LBlanco.png"
          alt="KOI Logo Background"
          width={600}
          height={600}
          className="object-contain"
        />
      </div>

      {/* --- Content --- */}
      <div className="relative max-w-[1400px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Column 1 */}
        <div>
          <h4 className="font-semibold text-lg">{t("brandTitle")}</h4>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
            {t("brandDescription")}
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="font-semibold text-lg mb-4">{t("quickLinks")}</h4>
          <ul className="space-y-2 text-neutral-300 text-sm">
            <li>
              <Link
                href={`/${locale}/products`}
                className="hover:text-white transition"
              >
                {t("products")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/about`}
                className="hover:text-white transition"
              >
                {t("about")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/contact`}
                className="hover:text-white transition"
              >
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/support`}
                className="hover:text-white transition"
              >
                {t("support")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="font-semibold text-lg mb-4">{t("policies")}</h4>
          <ul className="space-y-2 text-neutral-300 text-sm">
            <li>
              <Link
                href={`/${locale}/privacy`}
                className="hover:text-white transition"
              >
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/terms`}
                className="hover:text-white transition"
              >
                {t("terms")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/shipping`}
                className="hover:text-white transition"
              >
                {t("shipping")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/returns`}
                className="hover:text-white transition"
              >
                {t("returns")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-neutral-800 text-neutral-500 text-xs py-4 text-center">
        © {new Date().getFullYear()} KOI Streetwear. {t("copyright")}
      </div>
    </footer>
  );
}

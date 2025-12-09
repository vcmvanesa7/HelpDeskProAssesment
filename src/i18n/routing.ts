import { createNavigation } from "next-intl/navigation";

export const locales = ["en", "es"] as const;
export const defaultLocale = "en";

export const { Link, redirect, useRouter, usePathname } = createNavigation({
  locales,
  defaultLocale,
});

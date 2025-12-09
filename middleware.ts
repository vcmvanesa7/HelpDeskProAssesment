import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

//next-intl ---
const intlMiddleware = createIntlMiddleware({
  locales: ["es", "en"],
  defaultLocale: "es",
});

// Wrapper principal ---
export async function middleware(req: NextRequest) {
  // Manejo de idioma primero
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // Dejar que next-auth maneje protección
  return NextResponse.next();
}

//  Next-auth + next-intl matcher ---
export const config = {
  matcher: [
    // Next-intl rutas
    "/((?!_next|.*\\..*|api/auth).*)",

    // Rutas protegidas por next-auth
    "/api/cart/:path*",

    // Rutas locales
    "/(es|en)/:path*",
  ],
};

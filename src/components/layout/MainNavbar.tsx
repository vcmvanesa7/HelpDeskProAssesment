"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AppBar, Toolbar, Box, IconButton, Button, Badge } from "@mui/material";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function MainNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { cart } = useCart();
  const t = useTranslations("Navbar");

  // Extract locale for client-side routes
  const locale = pathname.split("/")[1] || "es";

  const goTo = (path: string) => {
    router.push(`/${locale}${path}`);
  };

  const itemsCount =
    cart?.items?.reduce((acc, item) => acc + (item.qty ?? 0), 0) ?? 0;

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  const isLoggedIn = status === "authenticated";
  const role = (session?.user as any)?.role;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          py: 1.5,
        }}
      >
        {/* LOGO */}
        <Box
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => goTo("")}
        >
          <Image
            src="/logs/Horizontal.png"
            alt="KOI Logo"
            width={75}
            height={30}
            priority
            className="opacity-90 hover:opacity-100 transition"
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* RIGHT SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* CART */}
          <IconButton onClick={() => goTo("/cart")} sx={{ color: "#111" }}>
            <Badge
              badgeContent={itemsCount}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#111",
                  color: "white",
                },
              }}
            >
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* PRODUCTS */}
          <Button
            sx={{
              color: "#111",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
            onClick={() => goTo("/products")}
          >
            {t("products")}
          </Button>

          {/* AUTH */}
          {!isLoggedIn ? (
            <>
              <Button
                onClick={() => goTo("/auth/login")}
                sx={{ color: "#111", fontWeight: 600, textTransform: "none" }}
              >
                {t("login")}
              </Button>

              <Button
                onClick={() => goTo("/auth/register")}
                sx={{
                  bgcolor: "#111",
                  color: "#fff",
                  px: 2.5,
                  borderRadius: "8px",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#333" },
                }}
              >
                {t("register")}
              </Button>
            </>
          ) : (
            <>
              {/* ADMIN PANEL */}
              {role === "admin" && (
                <Button
                  onClick={() => router.push("/admin")}
                  sx={{ textTransform: "none", color: "#111" }}
                >
                  {t("adminPanel")}
                </Button>
              )}

              {/* CLIENT SUPPORT (with locale) */}
              {role === "client" && (
                <Button
                  onClick={() => goTo("/support")}
                  sx={{ textTransform: "none", color: "#111" }}
                >
                  {t("support")}
                </Button>
              )}

              {/* SUPPORT AGENT PANEL (NO locale) */}
              {role === "support" && (
                <Button
                  onClick={() => router.push("/agent")}
                  sx={{
                    textTransform: "none",
                    color: "#111",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {t("supportPanel")}
                </Button>
              )}

              {/* LANGUAGE SWITCHER */}
              <LanguageSwitcher />

              {/* PROFILE */}
              <Button
                onClick={() => goTo("/profile")}
                sx={{
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#111",
                }}
              >
                <AccountCircleIcon sx={{ fontSize: 22 }} />
                {session?.user?.name?.split(" ")[0] ?? t("profile")}
              </Button>

              {/* LOGOUT */}
              <Button
                onClick={handleLogout}
                sx={{ textTransform: "none", color: "#111" }}
              >
                {t("logout")}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

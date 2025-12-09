"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AppBar, Toolbar, Box, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Image from "next/image";

export default function MainNavbar() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const role = (session?.user as any)?.role;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

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
          py: 1.5
        }}
      >
        {/* LOGO */}
        <Box
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => router.push("/")}
        >
          <Image
            src="/logs/LogoH.png"
            alt="Logo"
            width={150}
            height={50}
            priority
            className="opacity-90 hover:opacity-100 transition"
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* RIGHT SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>

          {!isLoggedIn ? (
            <>
              {/* LOGIN */}
              <Button
                onClick={() => router.push("/auth/login")}
                sx={{ color: "#111", fontWeight: 600, textTransform: "none" }}
              >
                Login
              </Button>

              {/* REGISTER */}
              <Button
                onClick={() => router.push("/auth/register")}
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
                Register
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
                  Admin Panel
                </Button>
              )}

              {/* CLIENT SUPPORT */}
              {role === "client" && (
                <Button
                  onClick={() => router.push("/support")}
                  sx={{ textTransform: "none", color: "#111" }}
                >
                  My Tickets
                </Button>
              )}

              {/* SUPPORT AGENT PANEL */}
              {role === "agent" && (
                <Button
                  onClick={() => router.push("/agent")}
                  sx={{
                    textTransform: "none",
                    color: "#111",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Agent Panel
                </Button>
              )}

              {/* PROFILE */}
              <Button
                onClick={() => router.push("/profile")}
                sx={{
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#111",
                }}
              >
                <AccountCircleIcon sx={{ fontSize: 22 }} />
                {session?.user?.name?.split(" ")[0] ?? "Profile"}
              </Button>

              {/* LOGOUT */}
              <Button
                onClick={handleLogout}
                sx={{ textTransform: "none", color: "#111" }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
/
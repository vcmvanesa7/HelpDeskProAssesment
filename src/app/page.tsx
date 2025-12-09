import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import LandingAnimated from "./LandingAnimated";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Redirect según rol
  if (session?.user?.role === "admin") return redirect("/admin");
  if (session?.user?.role === "support") return redirect("/agent");
  if (session?.user?.role === "client") return redirect("/support");

  return <LandingAnimated />;
}

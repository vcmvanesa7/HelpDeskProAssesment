"use client";

import { usePathname, useRouter } from "next/navigation";
import { Select, MenuItem } from "@mui/material";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/");
  const currentLocale = segments[1] || "es";

  const handleChange = (event: any) => {
    const newLocale = event.target.value;

    const updatedSegments = [...segments];
    updatedSegments[1] = newLocale;

    const newPath = updatedSegments.join("/") || `/${newLocale}`;

    router.push(newPath);
  };

  return (
    <Select
      size="small"
      value={currentLocale}
      onChange={handleChange}
      sx={{ height: 36, fontSize: 14 }}
    >
      <MenuItem value="es">ES</MenuItem>
      <MenuItem value="en">EN</MenuItem>
    </Select>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Stack, Button } from "@mui/material";

import CategoryForm from "@/components/products/categories/CategoryForm";
import { createCategory } from "@/services/products/categories.service";
import type { CategoryFormValues } from "@/lib/validators/category.validator";

import { toast } from "sonner";

export default function CreateCategoryPage() {
  const router = useRouter();

  const handleCreate = async (data: CategoryFormValues) => {
    try {
      await createCategory(data);
      toast.success("Category created successfully");
      router.push("/admin/categories");
    } catch {
      toast.error("Error creating category");
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
      {/* HEADER - Back + Title */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Button variant="outlined" onClick={() => router.push("/admin/categories")}>
          ← Back
        </Button>

        <Typography variant="h4" fontWeight={700}>
          Create Category
        </Typography>

        {/* Placeholder to maintain alignment */}
        <Box sx={{ width: 120 }} />
      </Stack>

      {/* FORM (clean, without card wrapper) */}
      <CategoryForm submitAction={handleCreate} />
    </Box>
  );
}

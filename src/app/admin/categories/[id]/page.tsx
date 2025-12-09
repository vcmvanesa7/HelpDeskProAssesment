"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import CategoryForm from "@/components/products/categories/CategoryForm";
import { getCategoryById, updateCategory } from "@/services/products/categories.service";
import type { CategoryFormValues } from "@/lib/validators/category.validator";

import { Box, Typography, Stack, Button } from "@mui/material";
import { toast } from "sonner";

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams();

  const [defaultValues, setDefaultValues] = useState<CategoryFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCategory = async () => {
    try {
      const category = await getCategoryById(id as string);

      setDefaultValues({
        name: category.name,
        description: category.description || "",
        kind: category.kind || "category",
      });
    } catch {
      toast.error("Error loading category");
      router.push("/admin/categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategory();
  }, []);

  const handleUpdate = async (data: CategoryFormValues) => {
    try {
      await updateCategory(id as string, data);
      toast.success("Category updated successfully");
      router.push("/admin/categories");
    } catch {
      toast.error("Error updating category");
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

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
          Edit Category
        </Typography>

        {/* Placeholder for alignment */}
        <Box sx={{ width: 120 }} />
      </Stack>

      <CategoryForm defaultValues={defaultValues!} submitAction={handleUpdate} />
    </Box>
  );
}

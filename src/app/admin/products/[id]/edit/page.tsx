"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import ProductForm from "@/components/products/ProductForm/ProductForm";

import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/products/products.service";

import type { ProductFormValues } from "@/lib/validators/validators";
import {
  CircularProgress,
  Box,
  Stack,
  Button,
  Typography,
  Paper,
} from "@mui/material";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialData, setInitialData] =
    useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load product */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await getProductById(id);

        const mapped: ProductFormValues = {
          title: data.title,
          description: data.description,
          brand: data.brand,
          price: data.price,
          discount: data.discount ?? 0,
          categoryId: data.categoryId,
          collectionId: data.collectionId ?? null,
          colors: data.colors,
          sizes: data.sizes,
          variants: data.variants,
          images: data.images,
          status: data.status,
        };

        setInitialData(mapped);
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  /** Update */
  const handleUpdate = async (data: ProductFormValues) => {
    try {
      await updateProduct(id, data);
      toast.success("Product updated!");
      router.push("/admin/products");
    } catch {
      toast.error("Error updating product");
    }
  };

  /** Delete */
  const handleDelete = async () => {
    toast.warning("Deleting product…", { duration: 900 });

    try {
      await deleteProduct(id);
      toast.success("Product deleted!");
      router.push("/admin/products");
    } catch {
      toast.error("Error deleting product");
    }
  };

  if (loading || !initialData)
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={4} maxWidth="900px" mx="auto">
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Button
          variant="outlined"
          onClick={() => router.push("/admin/products")}
        >
          ← Back to list
        </Button>

        <Button variant="outlined" color="error" onClick={handleDelete}>
          Delete
        </Button>
      </Stack>

      {/* Form */}
      <Paper sx={{ p: 4, borderRadius: 3 }} elevation={2}>
        <Typography variant="h5" fontWeight={700} mb={2}>
          Edit Product
        </Typography>

        <ProductForm
          defaultValues={initialData}
          submitAction={handleUpdate}
          isEdit
        />
      </Paper>
    </Box>
  );
}

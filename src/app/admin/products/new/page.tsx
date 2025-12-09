"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  Stack,
} from "@mui/material";

import ProductForm from "@/components/products/ProductForm/ProductForm";
import { createProduct } from "@/services/products/products.service";
import type { ProductFormValues } from "@/lib/validators/validators";

export default function CreateProductPage() {
  const router = useRouter();

  const handleCreate = async (data: ProductFormValues) => {
    try {
      await createProduct(data);

      toast.success("Product created!");
      router.push("/admin/products");
    } catch {
      toast.error("Error creating product");
    }
  };

  return (
    <Box p={4} maxWidth="900px" mx="auto">
      {/* HEADER + BREADCRUMB */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Create New Product
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Add a new product to your store
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push("/admin/products")}
        >
          Back to Products
        </Button>
      </Stack>

      {/* FORM WRAPPER */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={2}>
          Product Information
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <ProductForm submitAction={handleCreate} />
      </Paper>
    </Box>
  );
}

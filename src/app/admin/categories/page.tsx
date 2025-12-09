"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCategories,
  deleteCategory,
} from "@/services/products/categories.service";

import type { ICategory } from "@/schemas/products/category.schema";

import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  Paper,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      toast.error("Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar categoría?")) return;

    try {
      await deleteCategory(id);
      toast.success("Categoría eliminada");
      loadCategories();
    } catch {
      toast.error("Error eliminando categoría");
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 4 }}>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        
        <Button variant="outlined" onClick={() => router.push("/admin")}>
          ← Volver al Dashboard
        </Button>

        <Typography variant="h4" fontWeight={700}>
          Categorías
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/admin/categories/create")}
        >
          Crear Categoría
        </Button>
      </Stack>

      {/* TABLE LIST */}
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : categories.length === 0 ? (
        <Typography>No hay categorías aún.</Typography>
      ) : (
        <Stack spacing={2}>
          {categories.map((cat) => (
            <Paper
              key={cat._id}
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography fontSize={18} fontWeight={600}>
                  {cat.name}
                </Typography>

                {cat.description && (
                  <Typography fontSize={14} color="text.secondary">
                    {cat.description}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1}>
                <IconButton
                  color="primary"
                  onClick={() => router.push(`/admin/categories/${cat._id}`)}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => handleDelete(cat._id!)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

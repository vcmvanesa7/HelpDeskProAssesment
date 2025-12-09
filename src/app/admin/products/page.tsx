"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import type { IProduct } from "@/schemas/products/product.schema";
import type { ICategory } from "@/schemas/products/category.schema";

import {
  getProductsFiltered,
  deleteProduct,
} from "@/services/products/products.service";

import { getCategories } from "@/services/products/categories.service";

export default function AdminProductsPage() {
  const [items, setItems] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [collections, setCollections] = useState<ICategory[]>([]);

  const [page, setPage] = useState(1);
  const limit = 18;

  const [totalPages, setTotalPages] = useState(1);

  // Load categories & collections only once
  useEffect(() => {
    const loadFilters = async () => {
      const all = await getCategories();
      setCategories(all.filter((c) => c.kind === "category"));
      setCollections(all.filter((c) => c.kind === "collection"));
    };
    loadFilters();
  }, []);

  // Memorized load to avoid warnings
  const load = useCallback(async () => {
    setLoading(true);

    const data = await getProductsFiltered({
      search,
      categoryId: categoryId || undefined,
      collectionId: collectionId || undefined,
      page,
      limit,
    });

    setItems(data.items);
    setTotalPages(data.pages);

    setLoading(false);
  }, [search, categoryId, collectionId, page, limit]);

  useEffect(() => {
    Promise.resolve().then(() => {
      load();
    });
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    load();
  };

  return (
    <Box p={4}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Products</Typography>

        <Button
          variant="contained"
          component={Link}
          href="/admin/products/new"
        >
          + Create Product
        </Button>
      </Stack>

      {/*  FILTROS*/}
      <Stack direction="row" spacing={2} mb={3}>
        {/* Search by name */}
        <TextField
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          label="Search by name"
          fullWidth
        />

        {/* Category filter */}
        <TextField
          select
          label="Category"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          fullWidth
        >
          <MenuItem value="">All</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Collection filter */}
        <TextField
          select
          label="Collection"
          value={collectionId}
          onChange={(e) => {
            setCollectionId(e.target.value);
            setPage(1);
          }}
          fullWidth
        >
          <MenuItem value="">All</MenuItem>
          {collections.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* LISTA DE PRODUCTOS */}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.categoryId}</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>{p.status}</TableCell>

                  <TableCell align="right">
                    <IconButton
                      component={Link}
                      href={`/admin/products/${p._id}/edit`}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => handleDelete(p._id!)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <Stack direction="row" justifyContent="center" mt={3} spacing={2}>
            <Button
              variant="outlined"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <Typography align="center" mt={1}>
              Page {page} of {totalPages}
            </Typography>

            <Button
              variant="outlined"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

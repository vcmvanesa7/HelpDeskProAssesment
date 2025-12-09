// src/services/products/products.service.ts
import axios from "axios";
import type { IProduct } from "@/schemas/products/product.schema";
import type { ProductFormValues } from "@/lib/validators/validators";

/* FILTER TYPES */
export interface ProductsFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  collectionId?: string;
  sort?: "newest" | "price_asc" | "price_desc";
}

/* RESPONSE TYPES */
export interface PaginatedProducts {
  items: IProduct[];
  total: number;
  page: number;
  pages: number;
}

/* GET PRODUCTS WITH FILTERS */
export async function getProductsFiltered(
  filters: ProductsFilters = {}
): Promise<PaginatedProducts> {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.collectionId) params.set("collectionId", filters.collectionId);
  if (filters.sort) params.set("sort", filters.sort);

  const url = `/api/products?${params.toString()}`;

  const { data } = await axios.get<PaginatedProducts>(url);

  return data;
}

/* GET ALL PRODUCTS (NO PAGINATION) */
export async function getAllProducts(): Promise<IProduct[]> {
  const { data } = await axios.get<{ items: IProduct[] }>(
    "/api/products?limit=9999"
  );
  return data.items;
}

/* GET PRODUCT BY ID */
export async function getProductById(id: string): Promise<IProduct> {
  const { data } = await axios.get<IProduct>(`/api/products/${id}`);
  return data;
}

/* CREATE PRODUCT */
export async function createProduct(
  payload: ProductFormValues
): Promise<IProduct> {
  const { data } = await axios.post<IProduct>("/api/products", payload);
  return data;
}

/* UPDATE PRODUCT */
export async function updateProduct(
  id: string,
  payload: ProductFormValues
): Promise<IProduct> {
  const { data } = await axios.put<IProduct>(`/api/products/${id}`, payload);
  return data;
}

/* DELETE PRODUCT */
export async function deleteProduct(
  id: string
): Promise<{ message: string }> {
  const { data } = await axios.delete<{ message: string }>(
    `/api/products/${id}`
  );
  return data;
}

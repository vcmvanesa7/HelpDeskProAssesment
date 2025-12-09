// src/services/products/categories.service.ts
import axios from "axios";
import type { ICategory } from "@/schemas/products/category.schema";
import type { CategoryFormValues } from "@/lib/validators/category.validator";

/** GET all categories & collections */
export async function getCategories() {
  const { data } = await axios.get<ICategory[]>("/api/products/categories");
  return data;
}

/** GET categories filtered by kind ("category" | "collection") */
export async function getCategoriesByKind(kind: "category" | "collection") {
  const { data } = await axios.get<ICategory[]>(
    `/api/products/categories?kind=${kind}`
  );
  return data;
}

/** GET category or collection by ID */
export async function getCategoryById(id: string) {
  const { data } = await axios.get<ICategory>(`/api/products/categories/${id}`);
  return data;
}

/** POST create a new category or collection */
export async function createCategory(payload: CategoryFormValues) {
  const { data } = await axios.post<ICategory>(
    "/api/products/categories",
    payload
  );
  return data;
}

/** PUT update category or collection */
export async function updateCategory(id: string, payload: CategoryFormValues) {
  const { data } = await axios.put<ICategory>(
    `/api/products/categories/${id}`,
    payload
  );
  return data;
}

/** DELETE category or collection */
export async function deleteCategory(id: string) {
  const { data } = await axios.delete<{ message: string }>(
    `/api/products/categories/${id}`
  );
  return data;
}

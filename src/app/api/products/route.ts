// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Product } from "@/schemas/products/product.schema";
import { productSchema } from "@/lib/validators/validators";
import { handleApiError } from "@/lib/handleApiError";
import type { SortOrder } from "mongoose";

export async function GET(req: Request) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 12);

    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const collectionId = searchParams.get("collectionId") || "";
    const sort = searchParams.get("sort") || "newest";

    // Dynamic query
    const query: Record<string, unknown> = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (collectionId) {
      query.collectionId = collectionId;
    }

    // Sorting
    const sortOption: Record<string, SortOrder> =
      sort === "price_asc"
        ? { price: 1 }
        : sort === "price_desc"
        ? { price: -1 }
        : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch products");
  }
}

// POST — Create Product
export async function POST(req: Request) {
  try {
    await connect();

    const body = await req.json();
    const validated = await productSchema.validate(body, { abortEarly: false });

    const clean = (arr: unknown): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter(
        (v): v is string => typeof v === "string" && v.trim() !== ""
      );
    };

    const product = await Product.create({
      ...validated,
      colors: clean(validated.colors),
      sizes: clean(validated.sizes),
      variants: validated.variants,
      images: validated.images,
      collectionId: validated.collectionId || null,
    });

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error, "Failed to create product");
  }
}

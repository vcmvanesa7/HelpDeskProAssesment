// src/app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Product } from "@/schemas/products/product.schema";
import { productSchema } from "@/lib/validators/validators";
import { handleApiError } from "@/lib/handleApiError";
import cloudinary from "@/lib/cloudinary";

// GET /api/products/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await connect();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error, "Failed to load product");
  }
}

// PUT /api/products/:id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await connect();

    const body = await req.json();
    const validated = await productSchema.validate(body, { abortEarly: false });

    const cleanArray = (arr: unknown): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter(
        (v): v is string => typeof v === "string" && v.trim() !== ""
      );
    };

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        ...validated,
        colors: cleanArray(validated.colors),
        sizes: cleanArray(validated.sizes),
        variants: validated.variants,
        images: validated.images,
        collectionId: validated.collectionId || null,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, "Failed to update product");
  }
}

// DELETE /api/products/:id
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await connect();

    // Buscar producto
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    //  ELIMINAR TODAS LAS IMÁGENES DE CLOUDINARY
    for (const img of product.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // ELIMINAR PRODUCTO
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return handleApiError(error, "Failed to delete product");
  }
}

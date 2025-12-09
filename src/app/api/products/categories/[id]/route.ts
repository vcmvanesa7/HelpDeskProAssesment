import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Category } from "@/schemas/products/category.schema";
import { categorySchema } from "@/lib/validators/category.validator";

// GET CATEGORY BY ID
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 

  try {
    await connect();
    const category = await Category.findById(id);
    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Error loading category" },
      { status: 500 }
    );
  }
}

// UPDATE CATEGORY
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connect();

    const body = await req.json();
    const validated = await categorySchema.validate(body, {
      abortEarly: false,
    });

    const slug = validated.name.toLowerCase().replace(/\s+/g, "-");

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        name: validated.name,
        slug,
        description: validated.description || "",
        kind: validated.kind || "category",
      },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { errors: error?.errors ?? ["Error updating category"] },
      { status: 400 }
    );
  }
}

// DELETE CATEGORY
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connect();
    await Category.findByIdAndDelete(id);

    return NextResponse.json({ message: "Categoría eliminada" });
  } catch {
    return NextResponse.json(
      { error: "Error eliminando categoría" },
      { status: 500 }
    );
  }
}

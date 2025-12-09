import { NextResponse } from "next/server";
import connect from "@/lib/db";
import { Category } from "@/schemas/products/category.schema";
import { categorySchema } from "@/lib/validators/category.validator";
import { handleApiError } from "@/lib/handleApiError";

// GET all categories or collections
export async function GET(req: Request) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind"); // "category" | "collection" | null

    const query: Record<string, unknown> = {};

    if (kind === "category" || kind === "collection") {
      query.kind = kind;
    }

    const categories = await Category.find(query).sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (err) {
    return handleApiError(err, "Error loading categories");
  }
}

// CREATE category or collection
export async function POST(req: Request) {
  try {
    await connect();

    const body = await req.json();
    const validated = await categorySchema.validate(body, { abortEarly: false });

    const slug = validated.name.toLowerCase().replace(/\s+/g, "-");

    const category = await Category.create({
      name: validated.name,
      slug,
      description: validated.description || "",
      kind: validated.kind || "category",
    });

    return NextResponse.json(category);
  } catch (err) {
    return handleApiError(err, "Error creating category");
  }
}

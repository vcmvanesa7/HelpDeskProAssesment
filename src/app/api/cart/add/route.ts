import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import mongoose from "mongoose";
import connect from "@/lib/db";

import { Cart } from "@/schemas/cart.schema";
import { Product } from "@/schemas/products/product.schema";
import { addToCartSchema } from "@/lib/validators/cart.validator";

export async function POST(req: Request) {
  try {
    await connect();

    const session = await getServerSession(authOptions);

    const body = await req.json();
    const validated = await addToCartSchema.validate(body, {
      abortEarly: false,
    });

    const { productId, qty, variant } = validated;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Get a product for calculating real price
    const product = await Product.findById(productObjectId).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const discount = product.discount ?? 0;
    const basePrice = product.price;

    const priceAtAdd =
      discount > 0 ? basePrice - basePrice * (discount / 100) : basePrice;

    // serch
    let cart = await Cart.findOne({ userId: session.user.id });

    // if not exist - create
    if (!cart) {
      cart = await Cart.create({
        userId: session.user.id,
        items: [
          {
            productId: productObjectId,
            qty,
            priceAtAdd,
            variant: variant ?? undefined,
          },
        ],
      });

      return NextResponse.json({ cart });
    }

    // Search existent item
    const existing = cart.items.find(
      (i) =>
        i.productId.toString() === productId &&
        i.variant === (variant ?? undefined)
    );

    if (existing) {
      existing.qty += qty;

      // if priceAtAdd === 0
      if (!existing.priceAtAdd || existing.priceAtAdd === 0) {
        existing.priceAtAdd = priceAtAdd;
      }
    } else {
      // New item
      cart.items.push({
        productId: productObjectId,
        qty,
        priceAtAdd,
        variant: variant ?? undefined,
      });
    }

    await cart.save();

    return NextResponse.json({ cart });
  } catch (err) {
    console.error("ADD CART ERROR:", err);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 400 }
    );
  }
}

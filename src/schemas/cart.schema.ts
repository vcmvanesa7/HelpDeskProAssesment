// src/schemas/cart.schema.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  priceAtAdd: number;
  variant?: string;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, default: 1 },
  priceAtAdd: { type: Number, required: true },
  variant: { type: String },
});

const CartSchema: Schema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [CartItemSchema],
}, { timestamps: true });

export const Cart: Model<ICart> = (mongoose.models.Cart as Model<ICart>) || mongoose.model<ICart>("Cart", CartSchema);

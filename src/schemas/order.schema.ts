import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  paypalOrderId: string;

  items: {
    productId: string;
    qty: number;
    priceAtAdd: number;
    variant?: string;
    title: string;
    image: string;
  }[];

  total: number;

  status: "pending" | "paid" | "failed";
  paymentMethod: "paypal" | "testing";

  shippingStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    paypalOrderId: { type: String, required: true },

    items: [
      {
        productId: String,
        qty: Number,
        priceAtAdd: Number,
        variant: String,
        title: String,
        image: String,
      },
    ],

    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["paypal", "testing"],
      required: true,
    },

    shippingStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

import mongoose, { Schema, Model } from "mongoose";

export interface ICategory {
  _id?: string; 
  name: string;
  slug: string;
  description?: string;
  kind: "category" | "collection";
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    kind: {
      type: String,
      enum: ["category", "collection"],
      default: "category",
      required: true,
    },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

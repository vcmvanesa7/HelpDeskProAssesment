import mongoose, { Schema } from "mongoose";

const HeroSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    buttonLabel: { type: String, default: "Shop now" },
    buttonLink: { type: String, default: "/products" },
    image: { type: String, required: true }, // Cloudinary URL
  },
  { timestamps: true }
);

export const Hero = mongoose.models.Hero || mongoose.model("Hero", HeroSchema);

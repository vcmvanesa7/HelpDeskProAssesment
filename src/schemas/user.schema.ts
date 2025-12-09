import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  passwordHash?: string | null; // only for credentials provider
  provider: "credentials" | "google";
  role: "client" | "admin" | "support";

  // Cloudinary image
  image?: {
    url: string | null;
    public_id?: string | null;
  } | null;

  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      default: null, // Google users do not have password
    },

    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },

    role: {
      type: String,
      enum: ["client", "admin", "support"],
      default: "client",
    },

    image: {
      type: {
        url: { type: String, default: null },
        public_id: { type: String, default: null },
      },
      default: {
        url: null,
        public_id: null,
      },
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

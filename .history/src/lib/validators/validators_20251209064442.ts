import * as yup from "yup";

/**
 * Validation schema for profile updates
 */
export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .optional(),

  imageBase64: yup
    .string()
    .nullable()
    .optional()
    .test("is-base64-image", "Invalid image format", (value) => {
      if (!value) return true; // optional field
      return typeof value === "string" && value.startsWith("data:image/");
    }),
});

export type UpdateProfileValues = yup.InferType<typeof updateProfileSchema>;

/**
 * Validation schema for product creation/editing
 */

export const productSchema = yup.object({
  title: yup.string().min(3).max(120).required(),
  description: yup.string().min(10).required(),
  brand: yup.string().required(),

  categoryId: yup.string().required("Category is required"),
  collectionId: yup.string().nullable().optional(),

  price: yup.number().positive().required(),
  discount: yup.number().min(0).max(90).optional(),

  colors: yup
    .array()
    .of(yup.string())
    .min(1, "At least one color is required"),

  sizes: yup
    .array()
    .of(yup.string())
    .min(1, "At least one size is required"),

  variants: yup.array().of(
    yup.object({
      color: yup.string().required(),
      size: yup.string().required(),
      stock: yup.number().min(0).required(),
    })
  ),

  images: yup
    .array()
    .of(
      yup.object({
        url: yup
          .string()
          .required("Image URL is required")
          .url("Invalid URL")
          .test("is-image", "URL must be an image", (value) =>
            /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(value || "")
          ),
        public_id: yup.string().nullable(),
      })
    )
    .min(1, "At least one image is required"),

  status: yup.string().oneOf(["active", "inactive"]).default("active"),
});

export type ProductFormValues = yup.InferType<typeof productSchema>;
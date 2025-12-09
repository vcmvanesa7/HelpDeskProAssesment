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

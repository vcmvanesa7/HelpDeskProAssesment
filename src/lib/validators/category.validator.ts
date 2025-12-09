import * as yup from "yup";

export const categorySchema = yup.object({
  name: yup
    .string()
    .required("The name is required")
    .min(2, "It must have at least 2 characters")
    .max(50, "Maximum 50 characters"),

  description: yup
    .string()
    .nullable()
    .default(null),

  kind: yup
    .mixed<"category" | "collection">()
    .oneOf(["category", "collection"])
    .default("category"),
});

export type CategoryFormValues = yup.InferType<typeof categorySchema>;

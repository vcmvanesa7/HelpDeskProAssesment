import * as yup from "yup";

export const registerSchema = yup.object({
  name: yup.string().required("Name required"),
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().min(6, "Min 6 chars").required("Password required"),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;

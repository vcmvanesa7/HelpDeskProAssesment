// src/services/auth.service.ts
import axios from "axios";
import { RegisterFormValues } from "@/schemas/validations";
import { signIn } from "next-auth/react";

const API_URL = "/api/auth";

export const registerUser = async (data: RegisterFormValues) => {
  try {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data; // { ok: true }
  } catch (error: any) {
    const msg =
      error.response?.data?.error ||
      error.message ||
      "Error al registrar usuario";

    throw new Error(msg);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!res) throw new Error("Error inesperado");
    if (res.error) throw new Error(res.error);

    return { ok: true };
  } catch (error: any) {
    const msg = error.message || "Error al iniciar sesión";
    throw new Error(msg);
  }
};

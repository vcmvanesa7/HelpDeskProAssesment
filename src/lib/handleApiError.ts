import { NextResponse } from "next/server";
import { ValidationErrorShape } from "@/types/api";

export function handleApiError(error: unknown, defaultMessage = "Server error") {
  let message = defaultMessage;

  // Caso 1: error con "errors" (yup, mongoose validation, etc.)
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error
  ) {
    const err = error as ValidationErrorShape;

    // Si errors es array → tomamos el primero
    if (Array.isArray(err.errors)) {
      message = String(err.errors[0] ?? defaultMessage);
    }

    // Si errors es un objeto → aplanamos sus valores
    else if (
      typeof err.errors === "object" &&
      err.errors !== null
    ) {
      const allErrors = Object.values(err.errors)
        .flat()
        .filter((x): x is string => typeof x === "string");

      if (allErrors.length > 0) {
        message = allErrors[0];
      }
    }
  }

  return NextResponse.json({ error: message }, { status: 400 });
}

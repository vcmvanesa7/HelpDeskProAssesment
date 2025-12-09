import * as yup from "yup";

export const addToCartSchema = yup.object({
  productId: yup.string().required(),
  qty: yup.number().min(1).max(10).required(),
  variant: yup.string().nullable(),
});

export const removeFromCartSchema = yup.object({
  productId: yup.string().required(),
  variant: yup.string().nullable(),
});

export const updateCartSchema = yup.object({
  productId: yup.string().required(),
  qty: yup.number().min(1).max(10).required(),
  variant: yup.string().nullable(),
});

export const clearCartSchema = yup.object({
  confirm: yup.boolean().oneOf([true]).required(),
});

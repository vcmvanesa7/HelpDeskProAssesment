"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  categorySchema,
  CategoryFormValues,
} from "@/lib/validators/category.validator";

import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  MenuItem,
} from "@mui/material";

export default function CategoryForm({
  defaultValues,
  submitAction,
}: {
  defaultValues?: CategoryFormValues;
  submitAction: (data: CategoryFormValues) => void;
}) {
  const safeDefaults: CategoryFormValues = {
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
    kind: defaultValues?.kind ?? "category", // ← IMPORTANTÍSIMO
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: yupResolver(categorySchema),
    defaultValues: safeDefaults,
  });

  return (
    <Box sx={{ maxWidth: 500, margin: "0 auto" }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          {defaultValues ? "Edit Category" : "Create Category"}
        </Typography>

        {/* NAME */}
        <TextField
          label="Name"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
        />

        {/* DESCRIPTION */}
        <TextField
          label="Description"
          {...register("description")}
          multiline
          rows={3}
          error={!!errors.description}
          helperText={errors.description?.message}
          fullWidth
        />

        {/* KIND SELECT */}
        <TextField
          label="Type"
          select
          fullWidth
          defaultValue={safeDefaults.kind} // ← ¡SIN ESTO EXPLOTABA!
          {...register("kind")}
          error={!!errors.kind}
          helperText={errors.kind?.message}
        >
          <MenuItem value="category">Category</MenuItem>
          <MenuItem value="collection">Collection</MenuItem>
        </TextField>

        {/* SUBMIT */}
        <Button variant="contained" onClick={handleSubmit(submitAction)}>
          {defaultValues ? "Update" : "Create"}
        </Button>
      </Stack>
    </Box>
  );
}

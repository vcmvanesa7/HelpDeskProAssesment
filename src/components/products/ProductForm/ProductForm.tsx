// @react-compiler-ignore
/* eslint-disable react-hooks/incompatible-library */
"use client";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Image from "next/image";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Resolver } from "react-hook-form";

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { productSchema, ProductFormValues } from "@/lib/validators/validators";

import { getCategories } from "@/services/products/categories.service";
import type { ICategory } from "@/schemas/products/category.schema";
import {
  uploadImage,
  deleteImage,
  type UploadedImage,
} from "@/services/upload.service";

type Props = {
  defaultValues?: ProductFormValues | null;
  submitAction: (data: ProductFormValues) => Promise<void>;
  isEdit?: boolean;
};

const FIXED_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductForm({
  defaultValues,
  submitAction,
  isEdit = false,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: yupResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: defaultValues || {
      title: "",
      description: "",
      brand: "",
      price: 0,
      discount: 0,
      categoryId: "",
      collectionId: null,
      colors: [],
      sizes: [],
      variants: [],
      images: [],
      status: "active",
    },
  });

  const [newColor, setNewColor] = useState("");

  const {
    fields: images,
    append: addImage,
    remove: removeImageField,
  } = useFieldArray({ control, name: "images" });

  const { fields: variants, remove: removeVariantField } = useFieldArray({
    control,
    name: "variants",
  });
  // Estado local derivado de React Hook Form
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  useEffect(() => {
    const subscription = watch((value) => {
      setColors((value.colors as string[] | undefined) ?? []);
      setSizes((value.sizes as string[] | undefined) ?? []);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [collections, setCollections] = useState<ICategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const loadCats = async () => {
      const all = await getCategories();
      setCategories(all.filter((c) => c.kind === "category"));
      setCollections(all.filter((c) => c.kind === "collection"));
      setLoadingCats(false);
    };

    loadCats();
  }, []);

  const handleAddColor = (color: string) => {
    if (!color) return;

    // valida hex
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) return;

    setValue("colors", [...colors, color]);
    setNewColor("");
  };

  const handleAddSize = (size: string) => {
    if (!sizes.includes(size)) {
      setValue("sizes", [...sizes, size]);
    }
  };

  const generateVariants = () => {
    const validColors = colors.filter(
      (c): c is string => typeof c === "string"
    );
    const validSizes = sizes.filter((s): s is string => typeof s === "string");

    const combo = validColors.flatMap((color) =>
      validSizes.map((size) => ({ color, size, stock: 0 }))
    );

    setValue("variants", combo);
  };

  const handleRemoveImage = async (idx: number, publicId: string | null) => {
    if (publicId) {
      await deleteImage(publicId);
    }
    removeImageField(idx);
  };

  const uploadNewImage = async (file: File) => {
    const uploaded: UploadedImage = await uploadImage(file);
    addImage(uploaded);
  };

  const onSubmitAction: SubmitHandler<ProductFormValues> = async (data) => {
    await submitAction(data);
  };

  return (
    <Box maxWidth={800} mx="auto" py={4}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {isEdit ? "Edit Product" : "Create Product"}
      </Typography>

      {loadingCats ? (
        <CircularProgress />
      ) : (
        <Stack spacing={3}>
          {/* TITLE */}
          <TextField
            label="Title"
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
            fullWidth
          />

          {/* DESCRIPTION */}
          <TextField
            label="Description"
            {...register("description")}
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
            fullWidth
          />

          {/* BRAND */}
          <TextField
            label="Brand"
            {...register("brand")}
            error={!!errors.brand}
            helperText={errors.brand?.message}
            fullWidth
          />

          {/* CATEGORY */}
          <TextField
            select
            label="Category"
            {...register("categoryId")}
            error={!!errors.categoryId}
            helperText={errors.categoryId?.message}
            fullWidth
          >
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          {/* COLLECTION */}
          <TextField
            select
            label="Collection"
            {...register("collectionId")}
            fullWidth
          >
            <MenuItem value="">None</MenuItem>
            {collections.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          {/* PRICE */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Price"
              type="number"
              {...register("price")}
              error={!!errors.price}
              helperText={errors.price?.message}
            />
            <TextField
              label="Discount (%)"
              type="number"
              {...register("discount")}
              error={!!errors.discount}
              helperText={errors.discount?.message}
            />
          </Stack>

          {/* COLORS */}
          <div>
            <Typography fontWeight={600} mb={1}>
              Colors
            </Typography>

            <Stack direction="row" spacing={1}>
              {/* Input HEX */}
              <TextField
                placeholder="#000000"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddColor(newColor);
                  }
                }}
                error={
                  newColor.length > 0 &&
                  !/^#([0-9A-F]{3}){1,2}$/i.test(newColor)
                }
                helperText="Press Enter or click Add"
                fullWidth
              />

              {/* Color preview */}
              {newColor && (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    border: "2px solid #ccc",
                    backgroundColor: /^#([0-9A-F]{3}){1,2}$/i.test(newColor)
                      ? newColor
                      : "#fff",
                  }}
                />
              )}

              {/* Botón Agregar */}
              <Button
                variant="outlined"
                onClick={() => handleAddColor(newColor)}
                disabled={!/^#([0-9A-F]{3}){1,2}$/i.test(newColor)}
                sx={{ whiteSpace: "nowrap" }}
              >
                + Add Color
              </Button>
            </Stack>

            {/* Lista de colores */}
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              {colors.map((c, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    backgroundColor: c,
                    border: "2px solid #ddd",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    position: "relative",
                    cursor: "pointer",
                    transition: "0.2s",
                    "&:hover": {
                      borderColor: "#000",
                    },
                  }}
                >
                  {/* Botón eliminar */}
                  <IconButton
                    size="small"
                    onClick={() =>
                      setValue(
                        "colors",
                        colors.filter((x) => x !== c)
                      )
                    }
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      backgroundColor: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      "&:hover": { backgroundColor: "#eee" },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </div>

          {/* SIZES */}
          <div>
            <Typography fontWeight={600}>Sizes</Typography>
            <Stack direction="row" spacing={1}>
              {FIXED_SIZES.map((s) => (
                <Button
                  key={s}
                  variant={sizes.includes(s) ? "contained" : "outlined"}
                  onClick={() => handleAddSize(s)}
                >
                  {s}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" spacing={1} mt={1}>
              {sizes.map((s, i) => (
                <Chip
                  key={i}
                  label={s}
                  onDelete={() =>
                    setValue(
                      "sizes",
                      sizes.filter((x) => x !== s)
                    )
                  }
                />
              ))}
            </Stack>
          </div>

          {/* GENERATE VARIANTS */}
          <Button variant="outlined" onClick={generateVariants}>
            Generate Variants
          </Button>

          {/* VARIANT LIST */}
          {variants.map((v, idx) => (
            <Stack key={v.id} direction="row" spacing={2}>
              <TextField
                label="Color"
                value={v.color}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Size"
                value={v.size}
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Stock"
                type="number"
                {...register(`variants.${idx}.stock` as const)}
              />

              <IconButton onClick={() => removeVariantField(idx)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}

          {/* IMAGES */}
          <Typography fontWeight={600}>Images</Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            {images.map((img, idx) => (
              <Stack key={img.id} spacing={1}>
                <div
                  style={{
                    width: 120,
                    height: 120,
                    overflow: "hidden",
                    borderRadius: 8,
                    border: "1px solid #eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fafafa",
                  }}
                >
                  <Image
                    src={img.url}
                    alt=""
                    width={120}
                    height={120}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>

                <IconButton
                  color="error"
                  onClick={() => handleRemoveImage(idx, img.public_id ?? null)}
                >
                  <DeleteIcon sx={{ fontSize: 22, color: "#b0b0b0" }} />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          <Button variant="outlined" component="label">
            Upload Image
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await uploadNewImage(file);
              }}
            />
          </Button>

          {/* SUBMIT */}
          <Button variant="contained" onClick={handleSubmit(onSubmitAction)}>
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </Stack>
      )}
    </Box>
  );
}

// src/app/profile/page.tsx
"use client";

import {
  Box,
  Button,
  Stack,
  Typography,
  Avatar,
  Modal,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { Resolver } from "react-hook-form";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  updateProfileSchema,
  UpdateProfileValues,
} from "@/lib/validators/validators";
import { updateProfile } from "@/services/user.service";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const t = useTranslations("profile");

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // RHF form using Yup schema type
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileValues>({
    resolver: yupResolver(updateProfileSchema) as Resolver<UpdateProfileValues>,
    defaultValues: { name: "", imageBase64: null },
  });

  /**
   * Load initial session data (name + image)
   */
  useEffect(() => {
    if (!session?.user) return;

    reset({
      name: session.user.name || "",
      imageBase64: null,
    });

    const img =
      typeof session.user.image === "string" ? session.user.image : null;

    setPreview(img);
  }, [session, reset]);

  /**
   * Convert selected file to base64 and store it in the form
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString() || null;
      setPreview(base64);
      setValue("imageBase64", base64);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Submit profile changes to API
   */
  const onSubmit = async (data: UpdateProfileValues) => {
    try {
      setLoading(true);

      const response = await updateProfile(data);
      const updated = response.user;

      toast.success("Profile updated successfully!");

      await update();

      if (updated.image?.url) {
        setPreview(updated.image.url);
      }

      setOpen(false);
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <Typography textAlign="center" mt={5}>
        You must be logged in to view this page.
      </Typography>
    );
  }

  if (!session?.user) {
    return (
      <Typography textAlign="center" mt={5}>
        {t("mustBeLogged")}
      </Typography>
    );
  }

  return (
    <div className="pt-24 pb-28 bg-white text-neutral-900">
      {/* TITLE */}
      <h1 className="max-w-[1400px] mx-auto text-4xl font-extrabold uppercase tracking-tight mb-12">
        {t("title")}
      </h1>

      {/* USER PANEL */}
      <div
        className="
      max-w-[1400px] mx-auto 
      w-full
      rounded-2xl 
      border border-neutral-200 
      bg-neutral-50 
      p-10
      flex flex-col md:flex-row 
      items-center 
      gap-10
    "
      >
        {/* Avatar */}
        <Avatar
          src={preview ?? undefined}
          sx={{
            width: 150,
            height: 150,
            fontSize: 48,
            border: "4px solid #e5e5e5",
          }}
        >
          {session.user.name?.[0]?.toUpperCase()}
        </Avatar>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold uppercase tracking-wide mb-1">
            {session.user.name}
          </h2>

          <p className="text-neutral-600 mb-4">{session.user.email}</p>

          <button
            onClick={() => setOpen(true)}
            className="
            px-6 py-2 
            border-2 border-black 
            rounded-full 
            text-sm font-bold uppercase 
            transition-all
            hover:bg-black hover:text-white
          "
          >
            {t("editProfile")}
          </button>
        </div>
      </div>

      {/* ACTIVITY SECTION */}
      <div className="max-w-[1400px] mx-auto mt-16">
        <h3 className="text-xl font-extrabold uppercase tracking-wide">
          {t("yourActivity")}
        </h3>
        <p className="text-neutral-600 mt-2">{t("soon")}</p>
      </div>

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            backgroundColor: "#fff",
            maxWidth: 420,
            mx: "auto",
            mt: 10,
            p: 4,
            borderRadius: 3,
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          }}
        >
          <Typography
            variant="h6"
            mb={3}
            fontWeight={800}
            sx={{ textTransform: "uppercase", letterSpacing: 1 }}
          >
            {t("modalTitle")}
          </Typography>

          <Stack spacing={3}>
            <Avatar
              src={preview ?? undefined}
              sx={{
                width: 100,
                height: 100,
                mx: "auto",
                fontSize: 36,
                border: "3px solid #eaeaea",
              }}
            />

            <Button
              variant="outlined"
              component="label"
              sx={{
                borderRadius: 10,
                textTransform: "uppercase",
                fontWeight: 700,
                "&:hover": { borderColor: "black", color: "black" },
              }}
            >
              {t("changePhoto")}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            <TextField
              label={t("name")}
              fullWidth
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label={t("email")}
              fullWidth
              value={session.user.email || ""}
              disabled
            />

            <Button
              variant="contained"
              fullWidth
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
              startIcon={loading ? <CircularProgress size={18} /> : null}
              sx={{
                py: 1.4,
                backgroundColor: "black",
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                "&:hover": { backgroundColor: "#222" },
              }}
            >
              {loading ? t("saving") : t("saveChanges")}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}

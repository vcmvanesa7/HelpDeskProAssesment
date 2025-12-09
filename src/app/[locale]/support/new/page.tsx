"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Paper,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";

import { createTicket } from "@/services/tickets/tickets.service";
import { createTicketSchema } from "@/lib/validators/ticket.validator";

import {
  uploadImage,
  deleteImage,
  type UploadedImage,
} from "@/services/upload.service";

import { ValidationError } from "yup";

export default function NewTicketPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();

  const t = useTranslations("Support");
  const locale = pathname.split("/")[1] || "es";

  // Redirect user after hydration
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/login`);
    }
  }, [status, router, locale]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form fields
  const [form, setForm] = useState<{
    title: string;
    description: string;
    category: string;
  }>({
    title: "",
    description: "",
    category: "order_issue",
  });

  // Attachments
  const [attachments, setAttachments] = useState<UploadedImage[]>([]);

  /* Handle input changes */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  /* Upload to Cloudinary */
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadImage(file))
      );
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Error uploading image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* Remove uploaded image */
  const handleRemoveImage = async (publicId: string) => {
    try {
      await deleteImage(publicId);
      setAttachments((prev) =>
        prev.filter((img) => img.public_id !== publicId)
      );
    } catch (err) {
      console.error("DELETE IMAGE ERROR:", err);
      alert("Could not delete image.");
    }
  };

  /* Submit form */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      await createTicketSchema.validate(
        { ...form, attachments },
        { abortEarly: false }
      );

      await createTicket({
        ...form,
        priority: "medium", // default for clients
        attachments,
      });

      router.push(`/${locale}/support`);
    } catch (err) {
      if (err instanceof ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        console.error("CREATE TICKET ERROR:", err);
        alert("Error creating the ticket.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Box sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "700px", mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        {t("createTicket")}
      </Typography>

      <Paper sx={{ p: 3 }}>
        {/* Title */}
        <TextField
          fullWidth
          label={t("fields.title")}
          name="title"
          value={form.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
          sx={{ mb: 3 }}
        />

        {/* Description */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t("fields.description")}
          name="description"
          value={form.description}
          onChange={handleChange}
          error={!!errors.description}
          helperText={errors.description}
          sx={{ mb: 3 }}
        />

        {/* Category */}
        <TextField
          fullWidth
          select
          label={t("fields.category")}
          name="category"
          value={form.category}
          onChange={handleChange}
          sx={{ mb: 3 }}
        >
          <MenuItem value="order_issue">{t("categories.order_issue")}</MenuItem>
          <MenuItem value="payment_issue">
            {t("categories.payment_issue")}
          </MenuItem>
          <MenuItem value="bug_report">{t("categories.bug_report")}</MenuItem>
          <MenuItem value="refund_request">
            {t("categories.refund_request")}
          </MenuItem>
          <MenuItem value="other">{t("categories.other")}</MenuItem>
        </TextField>

        {/* Attachments */}
        <Box sx={{ mb: 3 }}>
          <Typography fontWeight={600} mb={1}>
            {t("fields.attachments")}
            <span style={{ color: "#777", marginLeft: 5 }}>
              ({t("attachmentsHelp")})
            </span>
          </Typography>

          <Button
            variant="outlined"
            component="label"
            disabled={uploading}
            sx={{ mb: 2 }}
          >
            {uploading ? t("uploading") : t("addImages")}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFilesChange}
            />
          </Button>

          {/* Preview */}
          {attachments.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {attachments.map((img) => (
                <Box
                  key={img.public_id}
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Image
                    src={img.url}
                    alt="attachment"
                    fill
                    sizes="100px"
                    style={{ objectFit: "cover" }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(img.public_id!)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.8)",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Submit */}
        <Button
          variant="contained"
          fullWidth
          disabled={loading || uploading}
          sx={{
            py: 1.2,
            backgroundColor: "#111",
            "&:hover": { backgroundColor: "#333" },
          }}
          onClick={handleSubmit}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            t("submit")
          )}
        </Button>
      </Paper>
    </Box>
  );
}

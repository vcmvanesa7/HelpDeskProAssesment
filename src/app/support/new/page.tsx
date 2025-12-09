"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

import { createTicket } from "@/services/tickets/tickets.service";
import { createTicketSchema } from "@/lib/validators/ticket.validator";

import {
  uploadImage,
  deleteImage,
  type UploadedImage,
} from "@/services/upload.service";

import { ValidationError } from "yup";
import { toast } from "sonner";

export default function NewTicketPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "general",
  });

  const [attachments, setAttachments] = useState<UploadedImage[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);

    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadImage(file))
      );

      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (publicId: string) => {
    try {
      await deleteImage(publicId);
      setAttachments((prev) => prev.filter((img) => img.public_id !== publicId));
    } catch (err) {
      console.error("DELETE IMAGE ERROR:", err);
      toast.error("Failed to delete image");
    }
  };

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
        priority: "medium",
        attachments,
      });

      toast.success("Ticket created successfully");
      router.push("/support");
    } catch (err) {
      if (err instanceof ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        console.error("CREATE TICKET ERROR:", err);
        toast.error("Error creating ticket");
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
        Create Support Ticket
      </Typography>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={!!errors.title}
          helperText={errors.title}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={!!errors.description}
          helperText={errors.description}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          select
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          sx={{ mb: 3 }}
        >
          <MenuItem value="general">General Issue</MenuItem>
          <MenuItem value="technical">Technical Problem</MenuItem>
          <MenuItem value="bug">Bug Report</MenuItem>
          <MenuItem value="payment">Payment Issue</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>

        {/* Attachments */}
        <Box sx={{ mb: 3 }}>
          <Typography fontWeight={600} mb={1}>
            Attachments (optional)
          </Typography>

          <Button
            variant="outlined"
            component="label"
            disabled={uploading}
            sx={{ mb: 2 }}
          >
            {uploading ? "Uploading..." : "Add Images"}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFilesChange}
            />
          </Button>

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
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>

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
            "Submit Ticket"
          )}
        </Button>
      </Paper>
    </Box>
  );
}

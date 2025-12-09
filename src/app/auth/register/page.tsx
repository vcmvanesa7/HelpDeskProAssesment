"use client";

import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterFormValues } from "@/schemas/validations";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerUser } from "@/services/auth.service";
import { toast } from "sonner";
import GoogleIcon from "@mui/icons-material/Google";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data);

      toast.success("Registered user. Check your email.");
      router.push(`/${locale}/auth/login`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error registering";
      toast.error(message);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: "auto",
        mt: 8,
        p: 4,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Create an account
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />

          <TextField
            label="Email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />

          <Button type="submit" variant="contained" fullWidth>
            Register
          </Button>

          <Divider>Or continue with</Divider>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Continue with Google
          </Button>

          <Button
            fullWidth
            onClick={() => router.push(`/${locale}/auth/login`)}
          >
            Already have an account?
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

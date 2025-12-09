"use client";

import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import GoogleIcon from "@mui/icons-material/Google";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as yup from "yup";

const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().required("Password required"),
});

type LoginFormValues = yup.InferType<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log("NEXTAUTH RESPONSE:", res);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
    } catch (error) {
      toast.error("Error al iniciar sesión");
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
        Login
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
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
            Login
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

          <Button fullWidth onClick={() => router.push("/auth/register")}>
            Don’t have an account?
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

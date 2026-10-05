import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Alert, Box, Button, Divider, IconButton, InputAdornment, Link, Stack, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { loginWithEmail, loginWithGoogle, resendVerificationEmail } from "../../firebase/auth";
import AuthLayout, { GoogleButton } from "./AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unverified, setUnverified] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Enter a valid email address").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setUnverified(false);
      const result = await loginWithEmail(values.email, values.password);
      setIsLoading(false);
      if (result.success) {
        toast.success(result.message);
        navigate(from, { replace: true });
      } else if (result.error === "email-not-verified") {
        setUnverified(true);
      } else {
        toast.error(result.message);
      }
    },
  });

  const handleResend = async () => {
    setIsLoading(true);
    const result = await resendVerificationEmail(formik.values.email, formik.values.password);
    setIsLoading(false);
    (result.success ? toast.success : toast.error)(result.message);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (result.success) {
      toast.success(result.message);
      navigate(result.isNewUser ? "/dashboard/updateProfile" : from, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Good to see you again. Sign in to your alumni account."
      footer={
        <Typography color="text.secondary">
          New here?{" "}
          <Link component={RouterLink} to="/register" sx={{ fontWeight: 700 }}>
            Create an account
          </Link>
        </Typography>
      }
    >
      <GoogleButton onClick={handleGoogleLogin} disabled={isLoading} />
      <Divider sx={{ my: 3, color: "text.secondary", fontSize: "0.85rem" }}>or with email</Divider>

      {unverified && (
        <Alert
          severity="warning"
          sx={{ mb: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={handleResend} disabled={isLoading}>
              Resend
            </Button>
          }
        >
          Please verify your email first. Check your inbox (and spam) for the link.
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={formik.handleSubmit}>
        <Stack spacing={2.25}>
          <TextField
            fullWidth
            id="email"
            label="Email address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => !s)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.25 }}>
          <Link component={RouterLink} to="/forgotPassword" variant="body2" sx={{ fontWeight: 600 }}>
            Forgot password?
          </Link>
        </Box>
        <Button type="submit" fullWidth size="large" variant="contained" disabled={isLoading} sx={{ mt: 3 }}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Login;

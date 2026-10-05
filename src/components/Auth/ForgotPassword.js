import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Alert, Box, Button, Link, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { resetPassword } from "../../firebase/auth";
import AuthLayout from "./AuthLayout";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Enter a valid email address").required("Email is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await resetPassword(values.email);
      setIsLoading(false);
      if (result.success) {
        setSentTo(values.email);
        formik.resetForm();
      } else {
        toast.error(result.message);
      }
    },
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email you registered with and we'll send you a reset link."
      footer={
        <Link component={RouterLink} to="/login" sx={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <ArrowBackRoundedIcon fontSize="small" /> Back to sign in
        </Link>
      }
    >
      {sentTo && (
        <Alert severity="success" sx={{ mb: 3 }}>
          If an account exists for <strong>{sentTo}</strong>, a reset link is on its way.
        </Alert>
      )}
      <Box component="form" noValidate onSubmit={formik.handleSubmit}>
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
        <Button type="submit" fullWidth size="large" variant="contained" disabled={isLoading} sx={{ mt: 3 }}>
          {isLoading ? "Sending…" : "Send reset link"}
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Signed up with Google? Use “Continue with Google” on the sign-in page instead.
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword;

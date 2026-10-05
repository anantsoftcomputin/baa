import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Alert, Box, Button, Card, IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../../../../contexts/AuthContext";
import { changePassword, hasPasswordProvider } from "../../../../firebase/auth";
import DashboardHeader from "../../../common/DashboardHeader";

/** /dashboard/changePassword */
const ChangePassword = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { old_password: "", new_password: "", confirm_password: "" },
    validationSchema: Yup.object({
      old_password: Yup.string().required("Enter your current password"),
      new_password: Yup.string()
        .min(8, "Use at least 8 characters")
        .notOneOf([Yup.ref("old_password")], "Choose a different password")
        .required("Enter a new password"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password")], "Passwords must match")
        .required("Confirm your new password"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      const result = await changePassword(values.old_password, values.new_password);
      setLoading(false);
      if (result.success) {
        toast.success(result.message);
        navigate("/dashboard/userProfile");
      } else {
        toast.error(result.message);
      }
    },
  });

  const field = (name, label, autoComplete) => ({
    fullWidth: true,
    name,
    label,
    autoComplete,
    type: show ? "text" : "password",
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
  });

  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      <DashboardHeader title="Change password" subtitle="Keep your account secure with a strong, unique password." />
      <Card sx={{ p: { xs: 3, md: 4 } }}>
        {!hasPasswordProvider(currentUser) ? (
          <Alert severity="info">
            You sign in with Google, so there's no BAA password to change. Manage your password in your Google account.
          </Alert>
        ) : (
          <Box component="form" noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                {...field("old_password", "Current password", "current-password")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label={show ? "Hide passwords" : "Show passwords"}>
                        {show ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField {...field("new_password", "New password", "new-password")} />
              <TextField {...field("confirm_password", "Confirm new password", "new-password")} />
            </Stack>
            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button color="inherit" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Updating…" : "Update password"}
              </Button>
            </Stack>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default ChangePassword;

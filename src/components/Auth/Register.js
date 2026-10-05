import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import { registerWithEmail, loginWithGoogle } from "../../firebase/auth";
import AuthLayout, { GoogleButton } from "./AuthLayout";

const CURRENT_YEAR = new Date().getFullYear();

const TERMS = [
  ["Account Registration", "You must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials."],
  ["Membership", "Access to full platform features requires a lifetime membership fee. Payment details and refund policies are available on the membership page."],
  ["User Content", "You retain ownership of content you post but grant BAA a license to use, display, and distribute such content on the platform."],
  ["Privacy", "Your personal information will be handled according to our Privacy Policy. We are committed to protecting your data."],
  ["Acceptable Use", "You agree not to post offensive, defamatory, or illegal content. BAA reserves the right to remove content and suspend accounts that violate these terms."],
  ["Updates", "BAA may update these terms at any time. Continued use of the platform constitutes acceptance of updated terms."],
];

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      batchyear: "",
      password: "",
      confirm_password: "",
      terms_confirmed: false,
    },
    validationSchema: Yup.object({
      username: Yup.string().trim().min(3, "At least 3 characters").required("Your name is required"),
      email: Yup.string().email("Enter a valid email address").required("Email is required"),
      batchyear: Yup.number()
        .typeError("Enter a year, e.g. 2008")
        .integer("Enter a year, e.g. 2008")
        .min(1950, "Enter a year after 1950")
        .max(CURRENT_YEAR, `Enter a year up to ${CURRENT_YEAR}`)
        .required("Batch year is required"),
      password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Please confirm your password"),
      terms_confirmed: Yup.boolean().oneOf([true], "Please accept the terms to continue"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await registerWithEmail(values.email, values.password, values.username.trim(), values.batchyear);
      setIsLoading(false);
      if (result.success) {
        setRegisteredEmail(values.email);
      } else {
        toast.error(result.message);
      }
    },
  });

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (result.success) {
      toast.success(result.message);
      // New Google users haven't told us their batch yet — send them to their profile first.
      navigate(result.isNewUser ? "/dashboard/updateProfile" : "/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  const field = (name, props = {}) => ({
    fullWidth: true,
    id: name,
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
    ...props,
  });

  if (registeredEmail) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One last step to activate your account.">
        <Box sx={{ textAlign: "center", p: 4, borderRadius: 4, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ width: 72, height: 72, mx: "auto", mb: 2, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "rgba(31,91,63,0.1)", color: "secondary.main" }}>
            <MarkEmailReadRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6">Verify your email</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            We sent a verification link to <strong>{registeredEmail}</strong>. Click it, then sign in.
          </Typography>
          <Button variant="contained" size="large" fullWidth sx={{ mt: 3 }} onClick={() => navigate("/login")}>
            Go to sign in
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Didn't get it? Check spam, or use “Resend” on the sign-in page.
          </Typography>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join the association"
      subtitle="Create your free account — it takes less than a minute."
      footer={
        <Typography color="text.secondary">
          Already a member?{" "}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 700 }}>
            Sign in
          </Link>
        </Typography>
      }
    >
      <GoogleButton onClick={handleGoogleSignUp} disabled={isLoading}>
        Sign up with Google
      </GoogleButton>
      <Divider sx={{ my: 3, color: "text.secondary", fontSize: "0.85rem" }}>or with email</Divider>

      <Box component="form" noValidate onSubmit={formik.handleSubmit}>
        <Stack spacing={2.25}>
          <TextField {...field("username")} label="Full name" autoComplete="name" autoFocus />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2.25}>
            <TextField {...field("email")} label="Email address" autoComplete="email" />
            <TextField {...field("batchyear")} label="Batch year" inputProps={{ inputMode: "numeric" }} sx={{ maxWidth: { sm: 150 } }} />
          </Stack>
          <TextField
            {...field("password")}
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
          <TextField
            {...field("confirm_password")}
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
          />
        </Stack>

        <FormControlLabel
          sx={{ mt: 1.5, alignItems: "flex-start", "& .MuiCheckbox-root": { pt: 0.5 } }}
          control={
            <Checkbox
              name="terms_confirmed"
              checked={formik.values.terms_confirmed}
              onChange={formik.handleChange}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" sx={{ pt: 0.75 }}>
              I agree to the{" "}
              <Link component="button" type="button" onClick={() => setTermsOpen(true)} sx={{ fontWeight: 700, verticalAlign: "baseline" }}>
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link component={RouterLink} to="/privacy-policy" target="_blank" sx={{ fontWeight: 700 }}>
                Privacy Policy
              </Link>
            </Typography>
          }
        />
        {formik.touched.terms_confirmed && formik.errors.terms_confirmed && (
          <FormHelperText error>{formik.errors.terms_confirmed}</FormHelperText>
        )}

        <Button type="submit" fullWidth size="large" variant="contained" disabled={isLoading} sx={{ mt: 3 }}>
          {isLoading ? "Creating your account…" : "Create account"}
        </Button>
        <Alert severity="info" icon={false} sx={{ mt: 2, bgcolor: "rgba(43,166,222,0.08)" }}>
          We'll email you a link to verify your address before you can sign in.
        </Alert>
      </Box>

      <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Terms and conditions</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Welcome to Bhavan's Alumni Association (BAA). By registering and using this platform, you agree to the
            following terms and conditions:
          </Typography>
          {TERMS.map(([title, text], i) => (
            <Typography variant="body2" paragraph key={title}>
              <strong>
                {i + 1}. {title}:
              </strong>{" "}
              {text}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button component={RouterLink} to="/terms-and-conditions" target="_blank" sx={{ mr: "auto" }}>
            Read full Terms
          </Button>
          <Button onClick={() => setTermsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              formik.setFieldValue("terms_confirmed", true);
              setTermsOpen(false);
            }}
          >
            I agree
          </Button>
        </DialogActions>
      </Dialog>
    </AuthLayout>
  );
};

export default Register;

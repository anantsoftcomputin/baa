import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { registerWithEmail, loginWithGoogle } from "../../firebase/auth";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import LogoImg from "../images/BAA.png";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleTermsDialogOpen = () => setOpenTermsDialog(true);
  const handleTermsDialogClose = () => setOpenTermsDialog(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirm_password: "",
      username: "",
      batchyear: "",
      terms_confirmed: false,
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
      batchyear: Yup.number()
        .required("Batch year is required")
        .max(
          new Date().getFullYear() - 1,
          `Enter batch year below ${new Date().getFullYear()}`
        ),
      username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .required("Username is required"),
      terms_confirmed: Yup.boolean().oneOf(
        [true],
        "You must accept terms and conditions"
      ),
    }),

    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await registerWithEmail(
        values.email,
        values.password,
        values.username,
        values.batchyear
      );

      if (result.success) {
        toast.success(result.message);
        toast.info("Please check your email to verify your account.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(result.message);
      }
      setIsLoading(false);
    },
  });

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();

    if (result.success) {
      toast.success("Account created successfully!");
      if (result.userProfile?.is_member) {
        navigate("/dashboard");
      } else {
        navigate("/becomemember");
      }
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: (theme) => theme.palette.background.default,
        py: 4,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
            boxShadow: "0 8px 24px rgba(251, 166, 69, 0.3)",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(251,166,69,0.05) 100%)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            '&:hover': {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 32px rgba(251, 166, 69, 0.4)",
            }
          }}
        >
          <Box
            component="img"
            src={LogoImg}
            alt="BAA Logo"
            sx={{
              width: "150px",
              height: "auto",
              filter: "drop-shadow(0 4px 8px rgba(251, 166, 69, 0.2))",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              '&:hover': {
                transform: "scale(1.1) rotate(3deg)",
                filter: "drop-shadow(0 8px 16px rgba(251, 166, 69, 0.4))",
              }
            }}
          />
        </Paper>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
          }}
        >
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="batchyear"
              label="Batch Year"
              name="batchyear"
              type="number"
              value={formik.values.batchyear}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.batchyear && Boolean(formik.errors.batchyear)
              }
              helperText={formik.touched.batchyear && formik.errors.batchyear}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirm_password"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirm_password"
              autoComplete="new-password"
              value={formik.values.confirm_password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirm_password &&
                Boolean(formik.errors.confirm_password)
              }
              helperText={
                formik.touched.confirm_password &&
                formik.errors.confirm_password
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="terms_confirmed"
                  checked={formik.values.terms_confirmed}
                  onChange={formik.handleChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I accept the{" "}
                  <span
                    onClick={handleTermsDialogOpen}
                    style={{
                      color: "#1976d2",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Terms and Conditions
                  </span>
                </Typography>
              }
            />
            {formik.touched.terms_confirmed &&
              formik.errors.terms_confirmed && (
                <Typography color="error" variant="caption" display="block">
                  {formik.errors.terms_confirmed}
                </Typography>
              )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              Sign up with Google
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link
                to="/login"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Already have an account? Log In
              </Link>
            </Box>
          </Box>
        </Paper>

        {/* Terms and Conditions Dialog */}
        <Dialog
          open={openTermsDialog}
          onClose={handleTermsDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Welcome to Bhavan's Alumni Association (BAA). By registering and
              using this platform, you agree to the following terms and
              conditions:
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>1. Account Registration:</strong> You must provide
              accurate and complete information during registration. You are
              responsible for maintaining the confidentiality of your account
              credentials.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>2. Membership:</strong> Access to full platform features
              requires a lifetime membership fee. Payment details and refund
              policies are available on the membership page.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>3. User Content:</strong> You retain ownership of content
              you post but grant BAA a license to use, display, and distribute
              such content on the platform.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>4. Privacy:</strong> Your personal information will be
              handled according to our Privacy Policy. We are committed to
              protecting your data.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>5. Acceptable Use:</strong> You agree not to post
              offensive, defamatory, or illegal content. BAA reserves the right
              to remove content and suspend accounts that violate these terms.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>6. Updates:</strong> BAA may update these terms at any
              time. Continued use of the platform constitutes acceptance of
              updated terms.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTermsDialogClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Register;

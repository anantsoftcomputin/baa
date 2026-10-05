import React, { useState } from "react";
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
  Divider,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginWithEmail, loginWithGoogle } from "../../firebase/auth";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import LogoImg from "../images/BAA.png";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await loginWithEmail(values.email, values.password);
      
      if (result.success) {
        toast.success(result.message);
        navigate("/dashboard");
      } else {
        toast.error(result.message);
      }
      setIsLoading(false);
    },
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    
    if (result.success) {
      toast.success(result.message);
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
    setIsLoading(false);
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: (theme) => theme.palette.background.default,
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
            Log in
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Log In"}
            </Button>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              Sign in with Google
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link
                to="/register"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Link
                to="/forgotPassword"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Forgot Password?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;

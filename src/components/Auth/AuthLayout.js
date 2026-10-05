import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LogoImg from "../images/BAA.png";

const POINTS = [
  "Find and reconnect with your batchmates",
  "Register for reunions and alumni events",
  "Support scholarships and school initiatives",
];

/** Split-screen frame for sign in / register / reset password. */
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, pt: { xs: 8, md: 9.5 } }}>
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        px: { md: 7, lg: 10 },
        py: 8,
        background: (t) => t.custom.inkGradient,
        "&::before": {
          content: '""',
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: "50%",
          right: -200,
          top: -200,
          background: "radial-gradient(circle, rgba(232,133,31,0.5) 0%, rgba(232,133,31,0) 70%)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          left: -180,
          bottom: -220,
          background: "radial-gradient(circle, rgba(124,179,66,0.35) 0%, rgba(124,179,66,0) 70%)",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
        <Box sx={{ width: 84, height: 84, borderRadius: "50%", bgcolor: "#fff", display: "grid", placeItems: "center", mb: 4 }}>
          <Box component="img" src={LogoImg} alt="BAA logo" sx={{ width: "80%" }} />
        </Box>
        <Typography variant="h2" component="p" sx={{ color: "#fff" }}>
          Welcome home, Bhavanite.
        </Typography>
        <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.75)", fontSize: "1.08rem" }}>
          Your alumni network — events, initiatives and old friends — all in one place.
        </Typography>
        <Stack spacing={1.75} sx={{ mt: 5 }}>
          {POINTS.map((p) => (
            <Stack key={p} direction="row" spacing={1.5} alignItems="center">
              <CheckCircleRoundedIcon sx={{ color: "primary.light" }} />
              <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{p}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, sm: 4 }, py: { xs: 5, md: 8 } }}>
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Box component="img" src={LogoImg} alt="" sx={{ display: { xs: "block", md: "none" }, width: 72, mx: "auto", mb: 3 }} />
        <Typography variant="h3" component="h1" sx={{ textAlign: { xs: "center", md: "left" } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 1, mb: 4, textAlign: { xs: "center", md: "left" } }}>
            {subtitle}
          </Typography>
        )}
        {children}
        {footer && <Box sx={{ mt: 4, textAlign: "center" }}>{footer}</Box>}
      </Box>
    </Box>
  </Box>
);

export const GoogleButton = ({ onClick, disabled, children = "Continue with Google" }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    disabled={disabled}
    sx={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1.5,
      py: 1.4,
      borderRadius: 2.5,
      border: "1.5px solid",
      borderColor: "rgba(23,33,46,0.16)",
      bgcolor: "#fff",
      font: "inherit",
      fontWeight: 600,
      fontSize: "0.95rem",
      color: "text.primary",
      cursor: "pointer",
      transition: "border-color .2s ease, background-color .2s ease",
      "&:hover": { borderColor: "rgba(23,33,46,0.35)", bgcolor: "#FAFAFA" },
      "&:disabled": { opacity: 0.6, cursor: "default" },
    }}
  >
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
    {children}
  </Box>
);

export default AuthLayout;

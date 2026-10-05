import React from "react";
import { Box, CircularProgress } from "@mui/material";
import LogoImg from "../images/BAA.png";

/** Branded full-screen loader for route transitions and initial auth checks. */
export const FullPageLoader = ({ minHeight = "100vh" }) => (
  <Box sx={{ minHeight, display: "grid", placeItems: "center", bgcolor: "background.default" }}>
    <Box sx={{ position: "relative", width: 104, height: 104, display: "grid", placeItems: "center" }}>
      <CircularProgress size={104} thickness={1.6} sx={{ position: "absolute", color: "primary.main" }} />
      <Box component="img" src={LogoImg} alt="Loading" sx={{ width: 64, height: "auto" }} />
    </Box>
  </Box>
);

export const InlineLoader = ({ py = 6 }) => (
  <Box sx={{ display: "flex", justifyContent: "center", py }}>
    <CircularProgress size={32} />
  </Box>
);

export default FullPageLoader;

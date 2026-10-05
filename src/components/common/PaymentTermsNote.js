import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link, Typography } from "@mui/material";

/** Consent line shown next to every "pay" button. */
const PaymentTermsNote = ({ light = false, sx }) => {
  const linkSx = { color: light ? "#fff" : "primary.main", fontWeight: 600 };
  return (
    <Typography variant="caption" component="p" sx={{ color: light ? "rgba(255,255,255,0.65)" : "text.secondary", mt: 1.25, textAlign: "center", ...sx }}>
      By paying, you agree to our{" "}
      <Link component={RouterLink} to="/terms-and-conditions" target="_blank" sx={linkSx}>
        Terms &amp; Conditions
      </Link>{" "}
      and{" "}
      <Link component={RouterLink} to="/refund-policy" target="_blank" sx={linkSx}>
        Refund Policy
      </Link>
      . All payments are non-refundable.
    </Typography>
  );
};

export default PaymentTermsNote;

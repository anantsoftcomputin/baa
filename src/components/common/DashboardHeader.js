import React from "react";
import { Box, Typography } from "@mui/material";

/** Page title row used at the top of every dashboard screen. */
const DashboardHeader = ({ title, subtitle, actions, eyebrow }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: { xs: "flex-start", sm: "flex-end" },
      justifyContent: "space-between",
      gap: 2,
      mb: 3,
    }}
  >
    <Box>
      {eyebrow && (
        <Typography variant="overline" color="primary" component="p">
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {actions && <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{actions}</Box>}
  </Box>
);

export default DashboardHeader;

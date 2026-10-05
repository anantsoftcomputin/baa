import React from "react";
import { Box, Typography } from "@mui/material";

/** Eyebrow + serif title + supporting line, used to open every public section. */
const SectionHeader = ({ eyebrow, title, subtitle, align = "center", action, light = false, sx }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", md: action ? "row" : "column" },
      alignItems: { xs: align === "center" ? "center" : "flex-start", md: action ? "flex-end" : align === "center" ? "center" : "flex-start" },
      justifyContent: "space-between",
      gap: 2,
      textAlign: { xs: align, md: action ? "left" : align },
      mb: { xs: 4, md: 6 },
      ...sx,
    }}
  >
    <Box sx={{ maxWidth: 720 }}>
      {eyebrow && (
        <Typography
          variant="overline"
          component="p"
          sx={{
            color: light ? "primary.light" : "primary.main",
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
            "&::before": {
              content: '""',
              width: 22,
              height: 2,
              borderRadius: 2,
              bgcolor: "currentColor",
              display: align === "center" && !action ? "none" : "block",
            },
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h2" component="h2" sx={{ color: light ? "#fff" : "text.primary" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            mt: 2,
            fontSize: { xs: "1rem", md: "1.08rem" },
            color: light ? "rgba(255,255,255,0.78)" : "text.secondary",
            mx: align === "center" && !action ? "auto" : 0,
            maxWidth: 620,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Box>
);

export default SectionHeader;

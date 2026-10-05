import React from "react";
import { Box, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

const EmptyState = ({ icon: Icon = InboxOutlinedIcon, title, description, action, compact = false, sx }) => (
  <Box
    sx={{
      textAlign: "center",
      py: compact ? 4 : { xs: 6, md: 8 },
      px: 3,
      borderRadius: 4,
      border: "1px dashed",
      borderColor: "divider",
      bgcolor: "rgba(255,255,255,0.6)",
      ...sx,
    }}
  >
    <Box
      sx={{
        width: compact ? 48 : 64,
        height: compact ? 48 : 64,
        mx: "auto",
        mb: 2,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(232, 133, 31, 0.1)",
        color: "primary.main",
      }}
    >
      <Icon sx={{ fontSize: compact ? 24 : 30 }} />
    </Box>
    {title && (
      <Typography variant="h6" sx={{ mb: description ? 0.5 : 0 }}>
        {title}
      </Typography>
    )}
    {description && (
      <Typography color="text.secondary" sx={{ maxWidth: 420, mx: "auto" }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 3 }}>{action}</Box>}
  </Box>
);

export default EmptyState;

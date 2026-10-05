import React from "react";
import { Box, Card, Typography } from "@mui/material";

/** Small KPI tile used at the top of admin sections. */
const AdminStat = ({ label, value, icon: Icon, color = "primary.main", onClick, active }) => (
  <Card
    onClick={onClick}
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      cursor: onClick ? "pointer" : "default",
      borderColor: active ? color : "divider",
      boxShadow: active ? (t) => `0 0 0 1px ${t.palette.primary.main} inset` : undefined,
      transition: "border-color .2s ease",
      "&:hover": onClick ? { borderColor: color } : {},
    }}
  >
    {Icon && (
      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: "grid", placeItems: "center", color, bgcolor: "background.default", flexShrink: 0 }}>
        <Icon fontSize="small" />
      </Box>
    )}
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" noWrap component="div">
        {label}
      </Typography>
    </Box>
  </Card>
);

export default AdminStat;

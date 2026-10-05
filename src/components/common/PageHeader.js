import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Breadcrumbs, Container, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

/** Title band for public sub-pages (Events, Blogs, Gallery, …). */
const PageHeader = ({ eyebrow, title, subtitle, crumbs = [], children }) => (
  <Box
    component="header"
    sx={{
      position: "relative",
      overflow: "hidden",
      pt: { xs: 14, md: 18 },
      pb: { xs: 6, md: 9 },
      color: "#fff",
      background: (t) => t.custom.inkGradient,
      "&::before": {
        content: '""',
        position: "absolute",
        width: 520,
        height: 520,
        borderRadius: "50%",
        right: -140,
        top: -220,
        background: "radial-gradient(circle, rgba(232,133,31,0.45) 0%, rgba(232,133,31,0) 70%)",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        width: 420,
        height: 420,
        borderRadius: "50%",
        left: -160,
        bottom: -260,
        background: "radial-gradient(circle, rgba(124,179,66,0.3) 0%, rgba(124,179,66,0) 70%)",
      },
    }}
  >
    <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
      {crumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.5)" }} />}
          sx={{ mb: 2, "& .MuiBreadcrumbs-li": { fontSize: "0.85rem" } }}
        >
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Home
          </Link>
          {crumbs.map((c) =>
            c.to ? (
              <Link key={c.label} component={RouterLink} to={c.to} underline="hover" sx={{ color: "rgba(255,255,255,0.7)" }}>
                {c.label}
              </Link>
            ) : (
              <Typography key={c.label} sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
                {c.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      {eyebrow && (
        <Typography variant="overline" component="p" sx={{ color: "primary.light", mb: 1 }}>
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h1" component="h1" sx={{ maxWidth: 820 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ mt: 2.5, maxWidth: 640, fontSize: { xs: "1rem", md: "1.15rem" }, color: "rgba(255,255,255,0.75)" }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </Container>
  </Box>
);

export default PageHeader;

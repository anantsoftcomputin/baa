import React from "react";
import { Box, Card, Container } from "@mui/material";
import PageHeader from "./PageHeader";

/** Shared layout for Terms / Privacy style pages. */
const LegalPage = ({ title, subtitle, children }) => (
  <>
    <PageHeader eyebrow="Legal" title={title} subtitle={subtitle} crumbs={[{ label: title }]} />
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Card sx={{ p: { xs: 3, md: 6 } }}>
        <Box
          sx={{
            "& h6": { mt: 1, mb: 1.5, fontSize: "1.15rem" },
            "& .MuiTypography-body2": { fontSize: "1rem", color: "text.secondary", lineHeight: 1.8 },
            "& .MuiDivider-root": { my: 4 },
          }}
        >
          {children}
        </Box>
      </Card>
    </Container>
  </>
);

export default LegalPage;

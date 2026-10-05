import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Card, Container, Divider, Grid, Link, Stack, Typography } from "@mui/material";
import PageHeader from "./PageHeader";
import { LEGAL_LAST_UPDATED, LEGAL_PAGES, ORGANISATION } from "../LandingPage/Component/Legal/organisation";
import { scrollToSection } from "../LandingPage/Component/Navbar/Navbar";

/**
 * Layout for the legal documents. `sections` is [{ id, title, content }];
 * section ids double as in-page anchors for the table of contents.
 */
const LegalPage = ({ title, subtitle, intro, sections = [] }) => {
  const { pathname } = useLocation();

  return (
    <>
      <PageHeader eyebrow="Legal" title={title} subtitle={subtitle} crumbs={[{ label: title }]} />
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>
          <Grid item xs={12} md={4} lg={3} sx={{ order: { xs: 2, md: 1 } }}>
            <Stack spacing={3} sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
              {sections.length > 0 && (
                <Card sx={{ p: 2.5, display: { xs: "none", md: "block" } }}>
                  <Typography variant="overline" color="text.secondary">
                    On this page
                  </Typography>
                  <Stack component="ol" spacing={1} sx={{ m: 0, mt: 1, pl: 2.5 }}>
                    {sections.map((s) => (
                      <Typography component="li" variant="body2" key={s.id}>
                        <Link
                          href={`#${s.id}`}
                          underline="hover"
                          color="text.primary"
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection(s.id);
                          }}
                        >
                          {s.title}
                        </Link>
                      </Typography>
                    ))}
                  </Stack>
                </Card>
              )}
              <Card sx={{ p: 2.5 }}>
                <Typography variant="overline" color="text.secondary">
                  Policies
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {LEGAL_PAGES.map((p) => (
                    <Link
                      key={p.path}
                      component={RouterLink}
                      to={p.path}
                      underline="hover"
                      sx={{ fontWeight: pathname === p.path ? 700 : 500, color: pathname === p.path ? "primary.main" : "text.primary" }}
                    >
                      {p.label}
                    </Link>
                  ))}
                  <Link component={RouterLink} to="/contact" underline="hover" color="text.primary">
                    Contact us
                  </Link>
                </Stack>
              </Card>
              <Card sx={{ p: 2.5 }}>
                <Typography variant="overline" color="text.secondary">
                  Operated by
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  {ORGANISATION.legalName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  GSTIN: {ORGANISATION.gstin}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {ORGANISATION.addressLines.map((l) => (
                    <React.Fragment key={l}>
                      {l}
                      <br />
                    </React.Fragment>
                  ))}
                </Typography>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8} lg={9} sx={{ order: { xs: 1, md: 2 } }}>
            <Card sx={{ p: { xs: 3, md: 6 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Last updated: {LEGAL_LAST_UPDATED}
              </Typography>
              {intro && (
                <Box sx={{ mt: 2, "& p": { color: "text.secondary", fontSize: "1.02rem", lineHeight: 1.8, mt: 0, mb: 2 } }}>{intro}</Box>
              )}
              {sections.map((s, i) => (
                <Box key={s.id} id={s.id} component="section" sx={{ scrollMarginTop: 96 }}>
                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    {i + 1}. {s.title}
                  </Typography>
                  <Box
                    sx={{
                      color: "text.secondary",
                      fontSize: "1rem",
                      lineHeight: 1.8,
                      "& p": { mt: 0, mb: 2 },
                      "& ul, & ol": { mt: 0, mb: 2, pl: 3 },
                      "& li": { mb: 0.75 },
                      "& strong": { color: "text.primary" },
                      "& h3": { fontSize: "1.02rem", fontWeight: 700, color: "text.primary", mt: 3, mb: 1 },
                      "& a": { color: "primary.main" },
                    }}
                  >
                    {s.content}
                  </Box>
                </Box>
              ))}
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default LegalPage;

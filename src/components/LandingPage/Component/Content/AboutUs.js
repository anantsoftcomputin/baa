import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import Reveal from "../../../common/Reveal";
import LogoImg from "../../../images/BAA.png";

const PILLARS = [
  { key: "mission", title: "Our Mission", icon: FlagRoundedIcon, color: "#E8851F" },
  { key: "vision", title: "Our Vision", icon: VisibilityRoundedIcon, color: "#1F5B3F" },
  { key: "history", title: "Our History", icon: AutoStoriesRoundedIcon, color: "#2BA6DE" },
];

const FALLBACK = {
  mission: "To keep every Bhavanite connected to each other and to the school — through mentorship, service and celebration.",
  vision: "A thriving, lifelong community of alumni who give back to the institution and to society.",
  history: "Founded by alumni who wanted the friendships made at Bhavan's to last a lifetime.",
};

const AboutUs = ({ aboutusData }) => {
  const data = aboutusData || {};

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
          <Grid item xs={12} md={5}>
            <Reveal>
              <Typography variant="overline" color="primary" component="p" sx={{ mb: 1.5 }}>
                About the association
              </Typography>
              <Typography variant="h2" component="h2">
                A lifelong bond with{" "}
                <Box component="span" sx={{ color: "primary.main", fontStyle: "italic" }}>
                  Bhavan's
                </Box>
              </Typography>
              <Typography sx={{ mt: 3, color: "text.secondary", fontSize: "1.08rem" }}>
                The Bhavan's Alumni Association brings together generations of students from Bhavan's, Vadodara —
                to stay in touch, support one another, and give back to the school community.
              </Typography>
              <Box
                sx={{
                  mt: 5,
                  p: 3,
                  borderRadius: 4,
                  bgcolor: "#fff",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  boxShadow: (t) => t.custom.shadows.sm,
                }}
              >
                <Box component="img" src={LogoImg} alt="" sx={{ width: 76, height: "auto", flexShrink: 0 }} />
                <Typography sx={{ fontFamily: (t) => t.custom.tokens.fontDisplay, fontSize: "1.2rem", fontStyle: "italic", lineHeight: 1.4 }}>
                  “Wherever life takes us, Bhavan's remains home.”
                </Typography>
              </Box>
            </Reveal>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ display: "grid", gap: 2.5 }}>
              {PILLARS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <Reveal key={p.key} delay={i * 120}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2.5,
                        p: { xs: 2.5, md: 3.5 },
                        borderRadius: 4,
                        bgcolor: "#fff",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "box-shadow .25s ease, transform .25s ease",
                        "&:hover": { boxShadow: (t) => t.custom.shadows.md, transform: "translateX(4px)" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          flexShrink: 0,
                          borderRadius: 3,
                          display: "grid",
                          placeItems: "center",
                          color: p.color,
                          bgcolor: `${p.color}17`,
                        }}
                      >
                        <Icon />
                      </Box>
                      <Box>
                        <Typography variant="h5" component="h3" sx={{ mb: 0.75 }}>
                          {p.title}
                        </Typography>
                        <Typography color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                          {data[p.key] || FALLBACK[p.key]}
                        </Typography>
                      </Box>
                    </Box>
                  </Reveal>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutUs;

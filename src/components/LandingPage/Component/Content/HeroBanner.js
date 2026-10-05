import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { getHeroImages } from "../../../../firebase/firestore";
import { useAuth } from "../../../../contexts/AuthContext";
import { scrollToSection } from "../Navbar/Navbar";

const kenBurns = keyframes`
  from { transform: scale(1.04); }
  to   { transform: scale(1.14); }
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: none; }
`;

const DEFAULT_TITLE = "Once a Bhavanite, always family.";
const DEFAULT_SUBTITLE =
  "Reconnect with batchmates, celebrate milestones, and give back to the school that shaped us — all in one place.";

const ROTATE_MS = 7000;

/**
 * Full-bleed hero for the home page. Rotates through the hero images managed in
 * Admin → Website Content; falls back to a branded backdrop when none exist.
 */
const HeroBanner = ({ stats = [] }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let alive = true;
    getHeroImages().then((images) => {
      if (alive) setSlides((images || []).filter((s) => s && s.image));
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[active] || {};

  return (
    <Box
      component="section"
      aria-label="Welcome"
      sx={{
        position: "relative",
        minHeight: { xs: "92vh", md: "100vh" },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        color: "#fff",
        bgcolor: "#101820",
      }}
    >
      {/* Backdrop: rotating photos, or a branded gradient when there are none */}
      {slides.length === 0 && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 600px at 85% 15%, rgba(232,133,31,0.55), transparent 60%), radial-gradient(900px 500px at 10% 90%, rgba(124,179,66,0.35), transparent 60%), radial-gradient(700px 400px at 60% 70%, rgba(43,166,222,0.25), transparent 60%), #101820",
          }}
        />
      )}
      {slides.map((slide, i) => (
        <Box
          key={slide.image + i}
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            opacity: i === active ? 1 : 0,
            transition: "opacity 1.4s ease",
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            animation: i === active ? `${kenBurns} ${ROTATE_MS + 2000}ms ease-out forwards` : "none",
          }}
        />
      ))}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(12,18,26,0.88) 0%, rgba(12,18,26,0.62) 45%, rgba(12,18,26,0.2) 100%), linear-gradient(0deg, rgba(12,18,26,0.7) 0%, rgba(12,18,26,0) 40%)",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pt: { xs: 12, md: 10 }, pb: { xs: 14, md: 12 } }}>
        <Box sx={{ maxWidth: 780 }} key={active}>
          <Typography
            variant="overline"
            component="p"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.5,
              mb: 3,
              borderRadius: 99,
              border: "1px solid rgba(255,255,255,0.25)",
              bgcolor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              animation: `${rise} .7s ease both`,
            }}
          >
            <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main" }} />
            Bhavan's Alumni Association · Vadodara
          </Typography>
          <Typography
            variant="h1"
            component="h1"
            sx={{ color: "#fff", animation: `${rise} .8s .1s ease both`, textWrap: "balance" }}
          >
            {current.title && current.title !== "Bhavan's Alumni Association" ? current.title : DEFAULT_TITLE}
          </Typography>
          <Typography
            sx={{
              mt: 3,
              maxWidth: 600,
              fontSize: { xs: "1.05rem", md: "1.25rem" },
              color: "rgba(255,255,255,0.8)",
              animation: `${rise} .8s .2s ease both`,
            }}
          >
            {current.subtitle && current.subtitle !== "Connecting Alumni, Building Futures"
              ? current.subtitle
              : DEFAULT_SUBTITLE}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 5, animation: `${rise} .8s .3s ease both` }}
          >
            <Button
              size="large"
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => navigate(currentUser ? "/dashboard" : "/register")}
            >
              {currentUser ? "Go to your dashboard" : "Join the community"}
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() => navigate("/events")}
              sx={{
                color: "#fff",
                borderColor: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(6px)",
                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              Explore events
            </Button>
          </Stack>
        </Box>

        {stats.length > 0 && (
          <Box
            sx={{
              mt: { xs: 7, md: 10 },
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", md: `repeat(${stats.length}, minmax(0, 180px))` },
              gap: { xs: 3, md: 5 },
              animation: `${rise} .8s .45s ease both`,
            }}
          >
            {stats.map((s) => (
              <Box key={s.label} sx={{ borderLeft: "2px solid", borderColor: "primary.main", pl: 2 }}>
                <Typography sx={{ fontFamily: (t) => t.custom.tokens.fontDisplay, fontSize: { xs: "1.9rem", md: "2.4rem" }, fontWeight: 600, lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ mt: 0.75, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Container>

      {slides.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: "absolute", zIndex: 2, right: { xs: 88, md: 120 }, bottom: { xs: 38, md: 50 } }}
        >
          {slides.map((_, i) => (
            <Box
              key={i}
              component="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setActive(i)}
              sx={{
                width: i === active ? 28 : 10,
                height: 10,
                borderRadius: 99,
                border: 0,
                p: 0,
                cursor: "pointer",
                bgcolor: i === active ? "primary.main" : "rgba(255,255,255,0.45)",
                transition: "all .3s ease",
              }}
            />
          ))}
        </Stack>
      )}

      <Box
        component="button"
        onClick={() => scrollToSection("about-us")}
        aria-label="Scroll to content"
        sx={{
          position: "absolute",
          zIndex: 2,
          left: "50%",
          bottom: 24,
          transform: "translateX(-50%)",
          display: { xs: "none", md: "grid" },
          placeItems: "center",
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.35)",
          bgcolor: "transparent",
          color: "#fff",
          cursor: "pointer",
          "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
        }}
      >
        <KeyboardArrowDownRoundedIcon />
      </Box>
    </Box>
  );
};

export default HeroBanner;

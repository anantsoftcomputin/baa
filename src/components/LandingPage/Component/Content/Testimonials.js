import React from "react";
import Slider from "react-slick";
import { Box, Container, Rating, Stack, Typography } from "@mui/material";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SectionHeader from "../../../common/SectionHeader";
import UserAvatar from "../../../common/UserAvatar";
import { imageOf } from "../../../../utils/format";

const TestimonialCard = ({ t }) => (
  <Box
    sx={{
      height: "100%",
      mx: 1.25,
      p: { xs: 3, md: 4 },
      borderRadius: 5,
      bgcolor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      gap: 2.5,
    }}
  >
    <FormatQuoteRoundedIcon sx={{ fontSize: 44, color: "primary.main", transform: "scaleX(-1)" }} />
    <Typography
      sx={{
        fontFamily: (theme) => theme.custom.tokens.fontDisplay,
        fontSize: { xs: "1.08rem", md: "1.2rem" },
        lineHeight: 1.55,
        flexGrow: 1,
        color: "rgba(255,255,255,0.92)",
      }}
    >
      {t.testimonial}
    </Typography>
    {Number(t.rating) > 0 && <Rating value={Number(t.rating)} readOnly size="small" />}
    <Stack direction="row" spacing={1.75} alignItems="center">
      <UserAvatar name={t.name} src={imageOf(t)} size={48} />
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{t.name}</Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>
          {[t.designation, t.company, t.graduation_year && `Batch of ${t.graduation_year}`].filter(Boolean).join(" · ")}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const Testimonials = ({ testimonialsData = [] }) => {
  if (testimonialsData.length === 0) return null;

  const settings = {
    dots: true,
    arrows: false,
    infinite: testimonialsData.length > 3,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    slidesToShow: Math.min(3, testimonialsData.length),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1100, settings: { slidesToShow: Math.min(2, testimonialsData.length), infinite: testimonialsData.length > 2 } },
      { breakpoint: 700, settings: { slidesToShow: 1, infinite: testimonialsData.length > 1 } },
    ],
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        background: (theme) => theme.custom.inkGradient,
        position: "relative",
        overflow: "hidden",
        "& .slick-dots": { bottom: -44 },
        "& .slick-dots li button:before": { color: "#fff", opacity: 0.35 },
        "& .slick-dots li.slick-active button:before": { color: "#E8851F", opacity: 1 },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <SectionHeader
          light
          eyebrow="In their words"
          title="What our alumni say"
          subtitle="Stories from Bhavanites across batches and around the world."
        />
        <Box sx={{ mx: -1.25, pb: 4 }}>
          <Slider {...settings}>
            {testimonialsData.map((t, i) => (
              <TestimonialCard key={t.id || i} t={t} />
            ))}
          </Slider>
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials;

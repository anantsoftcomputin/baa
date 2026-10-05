import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Container,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import SchoolIcon from "@mui/icons-material/School";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SectionTitle = ({ children }) => (
  <Typography
    variant="h4"
    className="fadeInUp"
    sx={{
      marginBottom: 6,
      fontWeight: "bold",
      position: "relative",
      color: "#fba645",
      display: "flex",
      alignItems: "center",
      gap: 2,
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-10px",
        left: 0,
        width: "50px",
        height: "3px",
        backgroundColor: "primary.main",
      },
    }}
  >
    <FormatQuoteIcon sx={{ fontSize: 40 }} />
    {children}
  </Typography>
);

const TestimonialCard = ({ testimonial, index }) => (
  <Box sx={{ p: 2, height: "100%" }}>
    <Card
      className="testimonial-card"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(251, 166, 69, 0.1)",
        position: "relative",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "&:hover": {
          transform: "translateY(-15px) scale(1.02)",
          boxShadow: "0 20px 40px rgba(251, 166, 69, 0.3)",
          border: "1px solid rgba(251, 166, 69, 0.3)",
          "& .testimonial-avatar": {
            transform: "scale(1.1) rotate(5deg)",
          },
          "& .quote-icon": {
            transform: "scale(1.2) rotate(15deg)",
            opacity: 0.3,
          },
        },
      }}
    >
      {/* Large Quote Background */}
      <FormatQuoteIcon
        className="quote-icon"
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          fontSize: 120,
          color: "#fba645",
          opacity: 0.1,
          zIndex: 0,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 4, position: "relative", zIndex: 1 }}>
        {/* Avatar and Info Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          {(testimonial.imageUrl || testimonial.image) ? (
            <Avatar
              src={testimonial.imageUrl || testimonial.image}
              alt={testimonial.name}
              className="testimonial-avatar"
              sx={{
                width: 70,
                height: 70,
                border: "3px solid",
                borderColor: "#fba645",
                boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          ) : (
            <Avatar
              className="testimonial-avatar"
              sx={{
                width: 70,
                height: 70,
                background: "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)",
                border: "3px solid rgba(251, 166, 69, 0.3)",
                fontSize: 28,
                fontWeight: "bold",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              {testimonial.name?.[0]}
            </Avatar>
          )}

          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#333",
                mb: 0.5,
              }}
            >
              {testimonial.name}
            </Typography>
            {testimonial.designation && (
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                {testimonial.designation}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Testimonial Text */}
        <Typography
          variant="body1"
          sx={{
            color: "#555",
            lineHeight: 1.8,
            fontStyle: "italic",
            mb: 3,
            position: "relative",
            pl: 2,
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              background: "linear-gradient(180deg, #fba645 0%, #ff8c00 100%)",
              borderRadius: 2,
            },
          }}
        >
          {testimonial.testimonial}
        </Typography>

        {/* Graduation Year Chip */}
        {testimonial.graduation_year && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Chip
              icon={<SchoolIcon />}
              label={`Batch ${testimonial.graduation_year}`}
              sx={{
                background: "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)",
                color: "#fff",
                fontWeight: "bold",
              }}
            />
          </Box>
        )}
      </CardContent>

      {/* Accent Border */}
      <Box
        sx={{
          height: 4,
          background: "linear-gradient(90deg, #fba645 0%, #ff8c00 100%)",
        }}
      />
    </Card>
  </Box>
);

const NextArrow = ({ onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      right: { xs: -10, sm: -30 },
      transform: "translateY(-50%)",
      cursor: "pointer",
      zIndex: 10,
      background: "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)",
      borderRadius: "50%",
      width: 50,
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      "&:hover": {
        transform: "translateY(-50%) scale(1.15)",
        boxShadow: "0 12px 30px rgba(251, 166, 69, 0.6)",
      },
    }}
  >
    <ChevronRight color="#fff" size={28} />
  </Box>
);

const PrevArrow = ({ onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      left: { xs: -10, sm: -30 },
      transform: "translateY(-50%)",
      cursor: "pointer",
      zIndex: 10,
      background: "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)",
      borderRadius: "50%",
      width: 50,
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      "&:hover": {
        transform: "translateY(-50%) scale(1.15)",
        boxShadow: "0 12px 30px rgba(251, 166, 69, 0.6)",
      },
    }}
  >
    <ChevronLeft color="#fff" size={28} />
  </Box>
);

const Testimonials = ({ testimonialsData }) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".testimonial-card").forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [testimonialsData]);

  const settings = {
    dots: true,
    infinite: testimonialsData.length > 3,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots custom-dots",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (!testimonialsData || testimonialsData.length === 0) {
    return (
      <Container sx={{ mt: 8, mb: 8 }}>
        <SectionTitle>Testimonials</SectionTitle>
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            background: "rgba(251, 166, 69, 0.05)",
            borderRadius: 4,
            border: "2px dashed rgba(251, 166, 69, 0.2)",
          }}
        >
          <FormatQuoteIcon
            sx={{ fontSize: 80, color: "#fba645", opacity: 0.3, mb: 2 }}
          />
          <Typography variant="h6" color="textSecondary">
            No testimonials available yet.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      sx={{
        mt: 8,
        mb: 8,
        position: "relative",
        px: { xs: 2, sm: 4 },
        "& .custom-dots": {
          bottom: -50,
          "& li button:before": {
            fontSize: 12,
            color: "#fba645",
            opacity: 0.5,
          },
          "& li.slick-active button:before": {
            color: "#fba645",
            opacity: 1,
          },
        },
      }}
    >
      <SectionTitle>Testimonials</SectionTitle>
      {testimonialsData.length > 3 ? (
        <Slider {...settings}>
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </Slider>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {testimonialsData.map((testimonial, index) => (
            <Box key={index} sx={{ flex: { xs: "1 1 100%", md: "1 1 30%" } }}>
              <TestimonialCard testimonial={testimonial} index={index} />
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Testimonials;

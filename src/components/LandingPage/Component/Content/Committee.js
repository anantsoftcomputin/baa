import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import PeopleIcon from "@mui/icons-material/People";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { keyframes } from "@mui/system";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 800,
  fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
  position: "relative",
  color: "#1A1A1A",
  letterSpacing: "-0.02em",
  textAlign: "center",
  background: "linear-gradient(135deg, #1A1A1A 0%, #FF8C42 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  animation: `${fadeInUp} 1s ease-out`,
}));

const SectionSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: "clamp(1rem, 2vw, 1.2rem)",
  color: "#666",
  textAlign: "center",
  maxWidth: "700px",
  margin: "0 auto",
  marginBottom: theme.spacing(6),
  lineHeight: 1.6,
  animation: `${fadeInUp} 1s ease-out 0.2s both`,
}));

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

const Committee = ({ committeeData }) => {
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

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

    document.querySelectorAll(".committee-card").forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [committeeData]);

  const handleClickOpen = (member) => {
    setSelectedMember(member);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  const sliderSettings = {
    dots: true,
    infinite: committeeData.length > 3,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
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

  if (!committeeData || committeeData.length === 0) {
    return (
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 50%, #FFFFFF 100%)",
        }}
      >
        <Container>
          <SectionTitle variant="h2">
            <PeopleIcon sx={{ fontSize: "inherit" }} />
            Our Committee
          </SectionTitle>
          <SectionSubtitle>
            Meet the dedicated team leading our community
          </SectionSubtitle>
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              background: "rgba(255, 140, 66, 0.05)",
              borderRadius: "24px",
              border: "2px dashed rgba(255, 140, 66, 0.2)",
            }}
          >
            <PeopleIcon
              sx={{ fontSize: 80, color: "#FF8C42", opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" color="textSecondary">
              No committee members listed yet.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      id="committee"
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 50%, #FFFFFF 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: 0,
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(255, 140, 66, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container
        sx={{
          position: "relative",
          px: { xs: 2, sm: 4 },
          "& .custom-dots": {
            bottom: -50,
            "& li button:before": {
              fontSize: 12,
              color: "#FF8C42",
              opacity: 0.5,
            },
            "& li.slick-active button:before": {
              color: "#FF8C42",
              opacity: 1,
            },
          },
        }}
      >
        <SectionTitle variant="h2">
          <PeopleIcon sx={{ fontSize: "inherit" }} />
          Our Committee
        </SectionTitle>
        <SectionSubtitle>
          Meet the dedicated team leading our community
        </SectionSubtitle>

      <Slider {...sliderSettings}>
        {committeeData.map((member, index) => (
          <Box key={index} sx={{ px: 2 }}>
            <Card
              className="committee-card"
              sx={{
                borderRadius: "24px",
                overflow: "hidden",
                background: "#FFFFFF",
                border: "2px solid rgba(255, 140, 66, 0.1)",
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                height: "100%",
                boxShadow: "0 8px 32px rgba(26, 26, 26, 0.08)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "5px",
                  background: "linear-gradient(90deg, #FF8C42 0%, #FFB366 50%, #8B4513 100%)",
                  backgroundSize: "200% auto",
                },
                "&:hover": {
                  transform: "translateY(-12px) scale(1.02)",
                  boxShadow: "0 20px 60px rgba(255, 140, 66, 0.25)",
                  border: "2px solid rgba(255, 140, 66, 0.3)",
                  "& .member-image": {
                    transform: "scale(1.1)",
                  },
                  "& .view-profile-btn": {
                    background: "linear-gradient(135deg, #FFB366 0%, #FF8C42 100%)",
                  },
                },
              }}
            >
              {/* Image Section */}
              <Box sx={{ position: "relative", overflow: "hidden", height: "280px" }}>
                <CardMedia
                  component="img"
                  image={member.imageUrl || member.image}
                  alt={member.name}
                  className="member-image"
                  sx={{
                    objectFit: "cover",
                    height: "100%",
                    width: "100%",
                    transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
                {/* Gradient Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)",
                  }}
                />
              </Box>

              {/* Content Section */}
              <CardContent
                sx={{
                  p: 3,
                  textAlign: "center",
                }}
              >
                {/* Name */}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#1A1A1A",
                    mb: 1,
                    fontSize: "1.3rem",
                  }}
                >
                  {member.name}
                </Typography>

                {/* Position Chip */}
                <Chip
                  label={member.designation || member.position}
                  sx={{
                    mb: 2,
                    background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    px: 1,
                  }}
                />

                {/* Description Preview */}
                {member.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      lineHeight: 1.6,
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.8em",
                    }}
                  >
                    {member.description}
                  </Typography>
                )}

                {/* Divider */}
                <Box
                  sx={{
                    width: "60px",
                    height: "3px",
                    background: "linear-gradient(90deg, #FF8C42 0%, #FFB366 100%)",
                    borderRadius: "2px",
                    margin: "16px auto",
                  }}
                />

                {/* View Profile Button */}
                <Button
                  className="view-profile-btn"
                  variant="contained"
                  onClick={() => handleClickOpen(member)}
                  startIcon={<InfoOutlinedIcon />}
                  sx={{
                    background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                    color: "#fff",
                    borderRadius: "12px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: "0 4px 14px rgba(255, 140, 66, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(255, 140, 66, 0.4)",
                    },
                  }}
                  size="small"
                >
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>

      {/* Enhanced Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: "#FFFFFF",
            border: "2px solid rgba(255, 140, 66, 0.2)",
            overflow: "hidden",
          },
        }}
      >
        {/* Header with Gradient */}
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
            color: "#fff",
            p: 3,
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {selectedMember?.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.95, fontSize: "1.1rem" }}>
                {selectedMember?.designation || selectedMember?.position}
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              sx={{
                color: "#fff",
                background: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  transform: "rotate(90deg)",
                  background: "rgba(255, 255, 255, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {/* Profile Image */}
          {(selectedMember?.imageUrl || selectedMember?.image) && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Avatar
                src={selectedMember.imageUrl || selectedMember.image}
                alt={selectedMember.name}
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid #FF8C42",
                  boxShadow: "0 8px 24px rgba(255, 140, 66, 0.3)",
                }}
              />
            </Box>
          )}

          {/* Description/Bio */}
          {selectedMember?.description && (
            <>
              <Box
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, rgba(255, 140, 66, 0.08) 0%, rgba(255, 179, 102, 0.08) 100%)",
                  border: "1px solid rgba(255, 140, 66, 0.2)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#FF8C42",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    mb: 1.5,
                  }}
                >
                  About
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#555",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  {selectedMember.description}
                </Typography>
              </Box>
              <Divider sx={{ my: 3, borderColor: "rgba(255, 140, 66, 0.2)" }} />
            </>
          )}

          {/* Contact Information */}
          <Typography
            variant="subtitle2"
            sx={{
              color: "#FF8C42",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              mb: 2,
            }}
          >
            Contact Information
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {selectedMember?.email && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2.5,
                  background: "rgba(255, 140, 66, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 140, 66, 0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(255, 140, 66, 0.1)",
                    transform: "translateX(8px)",
                    borderColor: "rgba(255, 140, 66, 0.3)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    boxShadow: "0 4px 12px rgba(255, 140, 66, 0.3)",
                  }}
                >
                  <EmailIcon sx={{ color: "#fff", fontSize: "1.5rem" }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#999", display: "block", fontSize: "0.75rem" }}
                  >
                    Email Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#333" }}>
                    {selectedMember.email}
                  </Typography>
                </Box>
              </Box>
            )}

            {selectedMember?.phone && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2.5,
                  background: "rgba(255, 140, 66, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 140, 66, 0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(255, 140, 66, 0.1)",
                    transform: "translateX(8px)",
                    borderColor: "rgba(255, 140, 66, 0.3)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    boxShadow: "0 4px 12px rgba(255, 140, 66, 0.3)",
                  }}
                >
                  <PhoneIcon sx={{ color: "#fff", fontSize: "1.5rem" }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#999", display: "block", fontSize: "0.75rem" }}
                  >
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#333" }}>
                    {selectedMember.phone}
                  </Typography>
                </Box>
              </Box>
            )}

            {selectedMember?.websites && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2.5,
                  background: "rgba(255, 140, 66, 0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 140, 66, 0.15)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(255, 140, 66, 0.1)",
                    transform: "translateX(8px)",
                    borderColor: "rgba(255, 140, 66, 0.3)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    boxShadow: "0 4px 12px rgba(255, 140, 66, 0.3)",
                  }}
                >
                  <LanguageIcon sx={{ color: "#fff", fontSize: "1.5rem" }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#999", display: "block", fontSize: "0.75rem" }}
                  >
                    Website
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#333" }}>
                    {selectedMember.websites}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, background: "rgba(255, 140, 66, 0.03)" }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
              color: "#fff",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(255, 140, 66, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(255, 140, 66, 0.4)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default Committee;

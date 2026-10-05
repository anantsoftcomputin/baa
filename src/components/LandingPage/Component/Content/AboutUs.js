import React from "react";
import {
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  styled,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { keyframes } from "@mui/system";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
`;

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 800,
  fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
  position: "relative",
  color: "#1A1A1A",
  letterSpacing: "-0.02em",
  textAlign: "center",
  background: "linear-gradient(135deg, #1A1A1A 0%, #FF8C42 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
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

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "360px",
  boxShadow: "0 8px 32px rgba(26, 26, 26, 0.08)",
  borderRadius: "24px",
  background: "linear-gradient(135deg, #FFFFFF 0%, #FFF5EE 100%)",
  border: "2px solid rgba(255, 140, 66, 0.1)",
  transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
  overflow: "hidden",
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
    animation: "shimmer 3s linear infinite",
  },
  "@keyframes shimmer": {
    "0%": { backgroundPosition: "200% center" },
    "100%": { backgroundPosition: "-200% center" },
  },
  "&:hover": {
    transform: "translateY(-12px) scale(1.02)",
    boxShadow: "0 20px 60px rgba(255, 140, 66, 0.25)",
    border: "2px solid rgba(255, 140, 66, 0.4)",
    "& .icon-container": {
      transform: "scale(1.1) rotate(10deg)",
      background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
    },
    "& .card-content": {
      transform: "translateY(-5px)",
    },
  },
  [theme.breakpoints.down("md")]: {
    minHeight: "320px",
  },
}));

const AboutUs = (props) => {
  const sections = [
    {
      title: "Our Mission",
      content: props.aboutusData?.mission || "Loading...",
      icon: TrackChangesIcon,
      color: "#FF8C42",
      gradient: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
    },
    {
      title: "Our Vision",
      content: props.aboutusData?.vision || "Loading...",
      icon: VisibilityIcon,
      color: "#8B4513",
      gradient: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
    },
    {
      title: "Our History",
      content: props.aboutusData?.history || "Loading...",
      icon: MenuBookIcon,
      color: "#FF6B35",
      gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)",
    },
  ];

  return (
    <Box
      id="about-us"
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 50%, #FFFFFF 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "400px",
          background: "radial-gradient(circle at 30% 20%, rgba(255, 140, 66, 0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <SectionTitle variant="h2">About Us</SectionTitle>
        <SectionSubtitle>
          Connecting alumni, fostering growth, and building a legacy of excellence together
        </SectionSubtitle>

        {props.aboutusData ? (
          <Grid container spacing={4}>
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Grid item xs={12} md={4} key={index}>
                  <StyledCard
                    sx={{
                      animation: `${fadeInUp} 0.8s ease-out ${index * 0.2}s both`,
                    }}
                  >
                    <CardContent
                      className="card-content"
                      sx={{
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        height: "100%",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      {/* Icon Container */}
                      <Box
                        className="icon-container"
                        sx={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "20px",
                          background: section.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                          boxShadow: `0 8px 24px ${section.color}40`,
                          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          animation: `${float} 3s ease-in-out infinite`,
                          animationDelay: `${index * 0.3}s`,
                        }}
                      >
                        <IconComponent
                          sx={{
                            fontSize: "2.5rem",
                            color: "#FFFFFF",
                          }}
                        />
                      </Box>

                      {/* Title */}
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: section.color,
                          mb: 2,
                          fontSize: "clamp(1.3rem, 2vw, 1.5rem)",
                        }}
                      >
                        {section.title}
                      </Typography>

                      {/* Divider */}
                      <Box
                        sx={{
                          width: "60px",
                          height: "3px",
                          background: section.gradient,
                          borderRadius: "2px",
                          mb: 3,
                        }}
                      />

                      {/* Content */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#555",
                          lineHeight: 1.8,
                          fontSize: "1rem",
                          flexGrow: 1,
                        }}
                      >
                        {section.content}
                      </Typography>

                      {/* Decorative Element */}
                      <Box
                        sx={{
                          mt: 3,
                          width: "100%",
                          height: "2px",
                          background: `linear-gradient(90deg, transparent 0%, ${section.color}40 50%, transparent 100%)`,
                        }}
                      />
                    </CardContent>
                  </StyledCard>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress
              sx={{
                color: "#FF8C42",
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              }}
              size={60}
              thickness={4}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AboutUs;

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  styled,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
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

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
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

const Achievements = (props) => {
  const achievementsData = props.achievements;
  const [animatedItems, setAnimatedItems] = useState(new Set());

  // Intersection Observer for scroll animations
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

    document.querySelectorAll(".achievement-card").forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [achievementsData]);

  if (!achievementsData || achievementsData.length === 0) {
    return (
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 50%, #FFFFFF 100%)",
        }}
      >
        <Container>
          <SectionTitle variant="h2">
            <EmojiEventsIcon sx={{ fontSize: "inherit" }} />
            Our Achievements
          </SectionTitle>
          <SectionSubtitle>
            Celebrating milestones and excellence in our community
          </SectionSubtitle>
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              background: "rgba(255, 140, 66, 0.05)",
              borderRadius: 4,
              border: "2px dashed rgba(255, 140, 66, 0.2)",
            }}
          >
            <EmojiEventsIcon
              sx={{ fontSize: 80, color: "#FF8C42", opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" color="textSecondary">
              No achievements available at the moment.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      id="achievements"
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 50%, #FFFFFF 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(255, 140, 66, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container sx={{ position: "relative", zIndex: 1 }}>
        <SectionTitle variant="h2">
          <EmojiEventsIcon sx={{ fontSize: "inherit" }} />
          Our Achievements
        </SectionTitle>
        <SectionSubtitle>
          Celebrating milestones and excellence in our community
        </SectionSubtitle>
        <Grid container spacing={4}>
          {achievementsData.map((achievement, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                className="achievement-card"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "24px",
                  overflow: "hidden",
                  background: "#FFFFFF",
                  border: "2px solid rgba(255, 140, 66, 0.1)",
                  transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  opacity: 0,
                  transform: "translateY(30px)",
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
                    animation: `${shimmer} 3s linear infinite`,
                  },
                  "&.animate-in": {
                    opacity: 1,
                    transform: "translateY(0)",
                    transitionDelay: `${index * 0.1}s`,
                  },
                  "&:hover": {
                    transform: "translateY(-12px) scale(1.02)",
                    boxShadow: "0 20px 60px rgba(255, 140, 66, 0.25)",
                    border: "2px solid rgba(255, 140, 66, 0.3)",
                    "& .achievement-image": {
                      transform: "scale(1.15)",
                    },
                    "& .achievement-icon": {
                      transform: "rotate(360deg) scale(1.2)",
                    },
                  },
                }}
              >
                <Box sx={{ position: "relative", overflow: "hidden", height: "220px" }}>
                  {/* Trophy Icon Overlay */}
                  <Box
                    className="achievement-icon"
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      zIndex: 2,
                      background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                      borderRadius: "50%",
                      p: 1.5,
                      boxShadow: "0 8px 24px rgba(255, 140, 66, 0.5)",
                      transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <EmojiEventsIcon sx={{ color: "#fff", fontSize: 32 }} />
                  </Box>

                  {/* Gradient Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%)",
                      zIndex: 1,
                    }}
                  />

                  <CardMedia
                    component="img"
                    height="220"
                    image={achievement.imageUrl || achievement.image}
                    alt={achievement.title}
                    className="achievement-image"
                    sx={{
                      objectFit: "cover",
                      transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: "#1A1A1A",
                      fontSize: "1.1rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "3.3rem",
                    }}
                  >
                    {achievement.title}
                  </Typography>

                  {achievement.date && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                        p: 1,
                        borderRadius: "8px",
                        background: "rgba(255, 140, 66, 0.08)",
                      }}
                    >
                      <CalendarTodayIcon sx={{ fontSize: 16, color: "#FF8C42" }} />
                      <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                        {achievement.date}
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#555",
                      lineHeight: 1.7,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {achievement.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Achievements;

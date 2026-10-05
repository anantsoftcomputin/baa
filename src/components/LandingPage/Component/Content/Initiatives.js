import React, { useState } from "react";
import {
  Card,
  CardContent,
  Container,
  Grid,
  styled,
  Typography,
  Box,
  Chip,
  Button,
  CardMedia,
} from "@mui/material";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
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

const Initiatives = ({ InitiativesData }) => {
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpanded = (index) => {
    setExpandedIds((prev) =>
      prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!InitiativesData || InitiativesData.length === 0) {
    return (
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 50%, #FFFFFF 100%)",
        }}
      >
        <Container>
          <SectionTitle variant="h2">
            <EmojiObjectsIcon sx={{ fontSize: "inherit" }} />
            Our Initiatives
          </SectionTitle>
          <SectionSubtitle>
            Making a difference through impactful community initiatives
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
            <EmojiObjectsIcon
              sx={{ fontSize: 80, color: "#FF8C42", opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" color="textSecondary">
              No initiatives available at the moment.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      id="initiatives"
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 50%, #FFFFFF 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          bottom: 0,
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
          <EmojiObjectsIcon sx={{ fontSize: "inherit" }} />
          Our Initiatives
        </SectionTitle>
        <SectionSubtitle>
          Making a difference through impactful community initiatives
        </SectionSubtitle>

        <Grid container spacing={4}>
          {InitiativesData.map((initiative, index) => {
            const isExpanded = expandedIds.includes(index);
            return (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "24px",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #FFF5EE 100%)",
                  border: "2px solid rgba(255, 140, 66, 0.1)",
                  transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 8px 32px rgba(26, 26, 26, 0.08)",
                  position: "relative",
                  animation: `${fadeInUp} 0.8s ease-out ${index * 0.2}s both`,
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
                  "&:hover": {
                    transform: "translateY(-12px) scale(1.02)",
                    boxShadow: "0 20px 60px rgba(255, 140, 66, 0.25)",
                    border: "2px solid rgba(255, 140, 66, 0.3)",
                    "& .initiative-image": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                {/* Initiative Image */}
                {initiative.imageUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={initiative.imageUrl}
                    alt={initiative.name}
                    className="initiative-image"
                    sx={{
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                  />
                )}

                <CardContent sx={{ p: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  {/* Title */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: "#1A1A1A",
                      fontSize: "1.5rem",
                    }}
                  >
                    {initiative.name}
                  </Typography>

                  {/* Divider */}
                  <Box
                    sx={{
                      width: "60px",
                      height: "3px",
                      background: "linear-gradient(90deg, #FF8C42 0%, #FFB366 100%)",
                      borderRadius: "2px",
                      mb: 3,
                    }}
                  />

                  {/* Purpose */}
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#555",
                      lineHeight: 1.8,
                      mb: 2,
                      flexGrow: 1,
                    }}
                  >
                    {isExpanded ? initiative.purpose : truncateText(initiative.purpose, 150)}
                  </Typography>

                  {/* Read More/Less Button */}
                  {initiative.purpose && initiative.purpose.length > 150 && (
                    <Button
                      size="small"
                      onClick={() => toggleExpanded(index)}
                      endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{
                        alignSelf: "flex-start",
                        mb: 2,
                        color: "#FF8C42",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          background: "rgba(255, 140, 66, 0.1)",
                        },
                      }}
                    >
                      {isExpanded ? "Read Less" : "Read More"}
                    </Button>
                  )}

                  {/* Details Box */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      background: "rgba(255, 140, 66, 0.08)",
                      border: "1px solid rgba(255, 140, 66, 0.15)",
                    }}
                  >
                    {/* Date Range - Only show if dates exist */}
                    {initiative.start_date && initiative.end_date && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: initiative.total_funds_required ? 2 : 0,
                        }}
                      >
                        <DateRangeIcon sx={{ color: "#FF8C42", fontSize: "1.3rem" }} />
                        <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                          <strong>Duration:</strong> {formatDate(initiative.start_date)} - {formatDate(initiative.end_date)}
                        </Typography>
                      </Box>
                    )}

                    {/* Total Cost of Initiative */}
                    {initiative.total_funds_required && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <AttachMoneyIcon sx={{ color: "#FF8C42", fontSize: "1.3rem" }} />
                        <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>
                          <strong>Total Cost of Initiative:</strong> ₹{initiative.total_funds_required?.toLocaleString() || "N/A"}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default Initiatives;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  styled,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShareIcon from "@mui/icons-material/Share";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkIcon from "@mui/icons-material/Link";
import { keyframes } from "@mui/system";
import { toast } from "react-toastify";

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

const Events = ({ eventsData }) => {
  const navigate = useNavigate();
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const slugify = (text) => {
    return text.toLowerCase().replace(/\s+/g, "-");
  };

  const handleKnowMore = (eventId, eventName) => {
    navigate(`/events/${slugify(eventName)}/`, { state: eventId });
  };

  const handleShareClick = (event, eventData) => {
    setShareAnchorEl(event.currentTarget);
    setSelectedEvent(eventData);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
    setSelectedEvent(null);
  };

  const getEventUrl = (event) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/events/${slugify(event.name)}`;
  };

  const handleShare = (platform) => {
    if (!selectedEvent) return;
    
    const eventUrl = getEventUrl(selectedEvent);
    const title = selectedEvent.name;
    const description = selectedEvent.description?.substring(0, 100) || "";

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + " - " + eventUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(eventUrl);
        toast.success("Event link copied to clipboard!");
        handleShareClose();
        return;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      handleShareClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  if (!eventsData || eventsData.length === 0) {
    return (
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 50%, #FFFFFF 100%)",
        }}
      >
        <Container>
          <SectionTitle variant="h2">
            <EventIcon sx={{ fontSize: "inherit" }} />
            Upcoming Events
          </SectionTitle>
          <SectionSubtitle>
            Stay connected with our latest events and activities
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
            <EventIcon
              sx={{ fontSize: 80, color: "#FF8C42", opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" color="textSecondary">
              Currently, there are no upcoming events.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      id="events"
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
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(255, 140, 66, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container sx={{ position: "relative", zIndex: 1 }}>
        <SectionTitle variant="h2">
          <EventIcon sx={{ fontSize: "inherit" }} />
          Upcoming Events
        </SectionTitle>
        <SectionSubtitle>
          Join us for exciting events and networking opportunities
        </SectionSubtitle>

        <Grid container spacing={4}>
          {eventsData.map((event, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#FFFFFF",
                  border: "1px solid rgba(255, 140, 66, 0.15)",
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 10px 40px rgba(26, 26, 26, 0.1)",
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  animation: `${fadeInUp} 0.8s ease-out ${index * 0.15}s both`,
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: "0 20px 60px rgba(255, 140, 66, 0.25)",
                    border: "1px solid rgba(255, 140, 66, 0.4)",
                    "& .event-image": {
                      transform: "scale(1.1)",
                    },
                    "& .event-overlay": {
                      opacity: 0.8,
                    },
                    "& .know-more-btn": {
                      background: "linear-gradient(135deg, #FFB366 0%, #FF8C42 100%)",
                      transform: "translateX(5px)",
                    },
                  },
                }}
              >
                {/* Image Section with Overlay */}
                <Box
                  sx={{
                    position: "relative",
                    height: "280px",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                  }}
                >
                  {event.image || event.imageUrl || event.qr_code ? (
                    <CardMedia
                      component="img"
                      image={event.image || event.imageUrl || event.qr_code}
                      alt={event.name || "Event"}
                      className="event-image"
                      sx={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                        transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, rgba(255, 140, 66, 0.9) 0%, rgba(255, 179, 102, 0.9) 100%)",
                      }}
                    >
                      <EventIcon sx={{ fontSize: 100, color: "rgba(255, 255, 255, 0.5)" }} />
                    </Box>
                  )}
                  
                  {/* Gradient Overlay */}
                  <Box
                    className="event-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)",
                      opacity: 0.6,
                      transition: "opacity 0.4s ease",
                    }}
                  />

                  {/* Share Button */}
                  <IconButton
                    onClick={(e) => handleShareClick(e, event)}
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      color: "#FF8C42",
                      zIndex: 2,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "#FF8C42",
                        color: "#FFF",
                        transform: "scale(1.1) rotate(15deg)",
                      },
                    }}
                  >
                    <ShareIcon />
                  </IconButton>

                  {/* Status Badge */}
                  <Chip
                    icon={<EventIcon />}
                    label="Upcoming"
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                      color: "#FFF",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      boxShadow: "0 4px 12px rgba(255, 140, 66, 0.4)",
                      zIndex: 2,
                    }}
                  />
                </Box>

                {/* Content Section */}
                <CardContent
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: "#1A1A1A",
                      fontSize: "1.5rem",
                      lineHeight: 1.3,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {event.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      lineHeight: 1.7,
                      mb: 3,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flexGrow: 1,
                    }}
                  >
                    {event.description}
                  </Typography>

                  {/* Event Details */}
                  <Box sx={{ mb: 3 }}>
                    {(event.start_date || event.end_date) && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                          color: "#555",
                        }}
                      >
                        <CalendarTodayIcon sx={{ fontSize: 18, color: "#FF8C42" }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatDate(event.start_date)}
                          {event.end_date && event.end_date !== event.start_date && 
                            ` - ${formatDate(event.end_date)}`}
                        </Typography>
                      </Box>
                    )}

                    {(event.start_time || event.end_time) && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                          color: "#555",
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 18, color: "#FF8C42" }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatTime(event.start_time)}
                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                        </Typography>
                      </Box>
                    )}

                    {event.location && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "#555",
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: 18, color: "#FF8C42" }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {event.location}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Action Button */}
                  <Button
                    className="know-more-btn"
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleKnowMore(event.id, event.name)}
                    sx={{
                      background: "linear-gradient(135deg, #FF8C42 0%, #FFB366 100%)",
                      color: "#FFF",
                      py: 1.5,
                      borderRadius: "12px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      boxShadow: "0 4px 14px rgba(255, 140, 66, 0.3)",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      mt: "auto",
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(255, 140, 66, 0.5)",
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Share Menu */}
        <Menu
          anchorEl={shareAnchorEl}
          open={Boolean(shareAnchorEl)}
          onClose={handleShareClose}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              minWidth: 200,
              mt: 1,
            },
          }}
        >
          <MenuItem onClick={() => handleShare("facebook")}>
            <ListItemIcon>
              <FacebookIcon sx={{ color: "#1877F2" }} />
            </ListItemIcon>
            <ListItemText>Facebook</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleShare("twitter")}>
            <ListItemIcon>
              <TwitterIcon sx={{ color: "#1DA1F2" }} />
            </ListItemIcon>
            <ListItemText>Twitter</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleShare("linkedin")}>
            <ListItemIcon>
              <LinkedInIcon sx={{ color: "#0A66C2" }} />
            </ListItemIcon>
            <ListItemText>LinkedIn</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleShare("whatsapp")}>
            <ListItemIcon>
              <WhatsAppIcon sx={{ color: "#25D366" }} />
            </ListItemIcon>
            <ListItemText>WhatsApp</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleShare("copy")}>
            <ListItemIcon>
              <LinkIcon sx={{ color: "#666" }} />
            </ListItemIcon>
            <ListItemText>Copy Link</ListItemText>
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default Events;

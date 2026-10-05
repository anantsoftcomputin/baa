import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  Box,
  styled,
  Divider,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  People,
  Share as ShareIcon,
  EventAvailable,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { getEventById } from "../../../../firebase/firestore";

const EventData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state;

  const [eventData, setEventData] = useState(null);

  const Event = eventData ? [eventData] : [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const event = await getEventById(eventId);
        setEventData(event);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };
    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(":");
    const hour12 = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour12}:${minute} ${ampm}`;
  };

  const handleRegistrations = () => {
    navigate("/login");
  };

  const handleShareEvent = (name, description) => {
    const currentUrl = window.location.href;
    const message = `${name}\n${description}\nCheck out this event: ${currentUrl}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `whatsapp://send?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const BackgroundImage = styled("div")(({ bgImage }) => ({
    width: "100%",
    height: "400px",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.3s ease-in-out",
  }));

  const StyledCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(4),
    boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-10px)",
    },
  }));

  return (
    <>
      <Container sx={{ mt: 2 }}>
        {Event.map((event, index) => (
          <StyledCard key={index}>
            <Grid container>
              <Grid item xs={12}>
                <BackgroundImage bgImage={event.image || event.imageUrl || event.event_banner || 'https://via.placeholder.com/1200x400?text=Event+Banner'} />
              </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ p: 4 }}>
              <Grid item xs={12} md={8}>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    {event.name}
                  </Typography>
                  <Typography variant="body1" paragraph color="textSecondary">
                    {event.description}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={2}>
                    <AccessTime sx={{ mr: 1, color: "#fb9e45" }} />
                    <Typography variant="body2">
                      {formatTime(event.start_time)} -{" "}
                      {formatTime(event.end_time)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <CalendarToday sx={{ mr: 1, color: "#fb9e45" }} />
                    <Typography variant="body2">
                      {formatDate(event.start_date)} -{" "}
                      {formatDate(event.end_date)}
                    </Typography>
                  </Box>
                </CardContent>
              </Grid>
              <Grid item xs={12} md={4} mt={4}>
                <CardMedia
                  component="img"
                  sx={{
                    height: "70%",
                    width: "70%",
                    objectFit: "contain",
                    borderRadius: "8px",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                  }}
                  image={event.qr_code || event.image || event.imageUrl || 'https://via.placeholder.com/300x300?text=QR+Code'}
                  alt={event.title || "Upcoming Event"}
                />
              </Grid>
            </Grid>

            <Grid container sx={{ p: 4 }}>
              <Grid item xs={12} md={8}>
                <CardContent>
                  {event.subevents?.length > 0 && (
                    <>
                      <Divider sx={{ my: 4 }} />
                      <Typography variant="h6" gutterBottom>
                        Event Schedule
                      </Typography>
                      {event.subevents.map((subevent, subIndex) => (
                        <Box key={subIndex} sx={{ mb: 3 }}>
                          <Typography variant="h6">{subevent.name}</Typography>
                          <Box display="flex" alignItems="center" mt={1}>
                            <EventAvailable sx={{ mr: 1, color: "#fb9e45" }} />
                            <Typography variant="body2">
                              {formatDate(subevent.date)}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" mt={1}>
                            <LocationOn sx={{ mr: 1, color: "#fb9e45" }} />
                            <Typography variant="body2">
                              {subevent.location}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" mt={1}>
                            <People sx={{ mr: 1, color: "#fb9e45" }} />
                            <Typography variant="body2">
                              Max Participants: {subevent.max_participants}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </>
                  )}
                </CardContent>
              </Grid>
            </Grid>

            <Grid container justifyContent="flex-end" sx={{ p: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRegistrations}
                sx={{ mr: 2 }}
                size="small"
              >
                Register
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleShareEvent(event.name, event.description)}
                startIcon={<ShareIcon />}
                size="small"
              >
                Share Event
              </Button>
            </Grid>
          </StyledCard>
        ))}
      </Container>
    </>
  );
};

export default EventData;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Button,
  styled,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { getAllEvents } from "../../../../firebase/firestore";
import LogoImg from "../../../images/BAA.png";

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: "bold",
  position: "relative",
  color: "#fba645",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    left: 0,
    width: "50px",
    height: "3px",
    backgroundColor: theme.palette.primary.main,
  },
}));

const Event = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const events = await getAllEvents();
        setEventData(events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slugify = (text) => {
    if (!text) return "event";
    return text.toLowerCase().replace(/\s+/g, "-");
  };

  const handleKnowMore = (eventId, eventName) => {
    navigate(`/events/${slugify(eventName)}/`, { state: eventId });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          position: "relative",
        }}
      >
        <CircularProgress
          size={120}
          sx={{
            position: "absolute",
            zIndex: 0,
          }}
        />

        {/* Logo image */}
        <img
          src={LogoImg}
          alt="Loading Logo"
          style={{
            width: "90px",
            height: "90px",
            position: "relative",
            zIndex: 1,
          }}
        />
      </Box>
    );
  }
  if (!eventData || eventData.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Card
          sx={{ mt: 4, boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)", p: 2 }}
        >
          <Grid container>
            <Grid item xs={12} md={4}>
              <div className="mt-16 container mx-auto px-4 p-2 m-2">
                <p className="text-gray-600">
                  Currently, there are no upcoming events.
                </p>
              </div>
            </Grid>
          </Grid>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <Container sx={{ mt: 4 }}>
        <SectionTitle variant="h4">Upcoming Events</SectionTitle>
        {eventData.map((event, index) => (
          <Card
            key={index}
            sx={{ mt: 4, boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)" }}
          >
            <Grid container>
              <Grid item xs={12} md={4}>
                <CardMedia
                  component="img"
                  height="100%"
                  image={event.image_url || LogoImg}
                  alt={event.title || "Upcoming Event"}
                />
              </Grid>
              <Grid item xs={12} md={8} mt={4}>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {event.description}
                  </Typography>

                  <Grid item xs={12} container justifyContent="flex-end" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleKnowMore(event.id, event.title)}
                    >
                      Know More
                    </Button>
                  </Grid>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Container>
    </>
  );
};

export default Event;

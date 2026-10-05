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
import { getEvents } from "../../../../firebase/firestore";
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

  const fetchData = async (url, setData) => {
    try {
      const response = await ajaxCall(
        url,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "GET",
        },
        8000
      );
      if (response?.status === 200) {
        setData(response?.data || []);
      } else {
        console.error("Fetch error:", response);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchData("events/events/", setEventData);
    setLoading(false);
  }, []);

  const slugify = (text) => {
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
                  image={event.qr_code}
                  alt={event.title || "Upcoming Event"}
                />
              </Grid>
              <Grid item xs={12} md={8} mt={4}>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    {event.name}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {event.description}
                  </Typography>

                  <Grid item xs={12} container justifyContent="flex-end" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleKnowMore(event.id, event.name)}
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

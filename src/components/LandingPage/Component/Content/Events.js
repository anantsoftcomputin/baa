import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Grid } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import SectionHeader from "../../../common/SectionHeader";
import EventCard from "../../../common/EventCard";
import EmptyState from "../../../common/EmptyState";
import Reveal from "../../../common/Reveal";
import { isUpcoming, slugify, toDate } from "../../../../utils/format";

export const eventPath = (event) => `/events/${event.id}/${slugify(event.name || event.title)}`;

/** Upcoming events first (soonest first), then the most recent past ones. */
export const sortEventsForDisplay = (events = []) => {
  const time = (e) => toDate(e.start_date)?.getTime() || 0;
  const upcoming = events.filter((e) => isUpcoming(e)).sort((a, b) => time(a) - time(b));
  const past = events.filter((e) => !isUpcoming(e)).sort((a, b) => time(b) - time(a));
  return [...upcoming, ...past];
};

const Events = ({ eventsData = [], limit = 3 }) => {
  const navigate = useNavigate();
  const events = sortEventsForDisplay(eventsData).slice(0, limit);

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: "#fff" }}>
      <Container maxWidth="lg">
        <SectionHeader
          eyebrow="What's on"
          title="Upcoming events"
          subtitle="Reunions, talks, sports days and celebrations — there's always a reason to come back."
          align="left"
          action={
            <Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/events")}>
              All events
            </Button>
          }
        />
        {events.length === 0 ? (
          <EmptyState
            icon={EventRoundedIcon}
            title="No events scheduled yet"
            description="New events are announced here first. Check back soon!"
          />
        ) : (
          <Grid container spacing={3}>
            {events.map((event, i) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Reveal delay={i * 100} sx={{ height: "100%" }}>
                  <EventCard
                    event={event}
                    onOpen={() => navigate(eventPath(event), { state: event.id })}
                    shareUrl={`${window.location.origin}${eventPath(event)}`}
                  />
                </Reveal>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Events;

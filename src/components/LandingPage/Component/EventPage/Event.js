import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Grid, InputAdornment, Skeleton, Tab, Tabs, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import { getAllEvents } from "../../../../firebase/firestore";
import PageHeader from "../../../common/PageHeader";
import EventCard from "../../../common/EventCard";
import EmptyState from "../../../common/EmptyState";
import Reveal from "../../../common/Reveal";
import { isUpcoming } from "../../../../utils/format";
import { eventPath, sortEventsForDisplay } from "../Content/Events";

/** The public /events page. */
const Event = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllEvents()
      .then((e) => setEvents(sortEventsForDisplay(e || [])))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events.filter((e) => isUpcoming(e));
  const past = events.filter((e) => !isUpcoming(e));
  const q = search.trim().toLowerCase();
  const visible = (tab === "upcoming" ? upcoming : past).filter(
    (e) => !q || `${e.name} ${e.title} ${e.location} ${e.description}`.toLowerCase().includes(q)
  );

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Come back. Catch up. Celebrate."
        subtitle="Reunions, talks, sports meets and more — open to every Bhavanite."
        crumbs={[{ label: "Events" }]}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { sm: "center" },
            gap: 2,
            mb: 4,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab value="upcoming" label={`Upcoming (${upcoming.length})`} />
            <Tab value="past" label={`Past (${past.length})`} />
          </Tabs>
          <TextField
            size="small"
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: "100%", sm: 280 }, mb: { xs: 2, sm: 1 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[0, 1, 2].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={400} />
              </Grid>
            ))}
          </Grid>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={EventRoundedIcon}
            title={q ? "No events match your search" : tab === "upcoming" ? "No upcoming events right now" : "No past events yet"}
            description={tab === "upcoming" && !q ? "New events are announced here first — check back soon." : undefined}
          />
        ) : (
          <Grid container spacing={3}>
            {visible.map((event, i) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Reveal delay={(i % 3) * 80} sx={{ height: "100%" }}>
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
    </>
  );
};

export default Event;

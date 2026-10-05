import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, Grid, Skeleton, Tab, Tabs } from "@mui/material";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { getAllEvents, getMyRegistrations } from "../../../../firebase/firestore";
import DashboardHeader from "../../../common/DashboardHeader";
import EventCard from "../../../common/EventCard";
import EmptyState from "../../../common/EmptyState";
import { isUpcoming } from "../../../../utils/format";
import { sortEventsForDisplay } from "../../../LandingPage/Component/Content/Events";

const STATUS_LABEL = {
  confirmed: { label: "Registered", color: "secondary" },
  pending_payment: { label: "Payment pending", color: "warning" },
};

/** /dashboard/addEvents — browse events (members) and jump to management (admins). */
const EventSection = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    Promise.all([getAllEvents().catch(() => []), currentUser ? getMyRegistrations(currentUser.uid) : []]).then(([e, r]) => {
      setEvents(sortEventsForDisplay(e || []));
      setRegistrations(r || []);
      setLoading(false);
    });
  }, [currentUser]);

  const regByEvent = Object.fromEntries(registrations.map((r) => [r.eventId, r]));
  const lists = {
    upcoming: events.filter((e) => isUpcoming(e)),
    past: events.filter((e) => !isUpcoming(e)),
    mine: events.filter((e) => regByEvent[e.id]),
  };
  const visible = lists[tab];

  return (
    <>
      <DashboardHeader
        title="Events"
        subtitle="Reunions, meetups and celebrations. Register in a couple of taps."
        actions={
          isAdmin && (
            <Button variant="contained" startIcon={<EditCalendarRoundedIcon />} onClick={() => navigate("/dashboard/admin?tab=events")}>
              Manage events
            </Button>
          )
        }
      />
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
          <Tab value="upcoming" label={`Upcoming (${lists.upcoming.length})`} />
          <Tab value="mine" label={`My registrations (${lists.mine.length})`} />
          <Tab value="past" label={`Past (${lists.past.length})`} />
        </Tabs>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[0, 1, 2].map((i) => (
            <Grid item xs={12} sm={6} xl={4} key={i}>
              <Skeleton variant="rounded" height={380} />
            </Grid>
          ))}
        </Grid>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={EventRoundedIcon}
          title={tab === "mine" ? "You haven't registered for any events yet" : tab === "upcoming" ? "No upcoming events" : "No past events"}
          description={tab === "mine" ? "Browse upcoming events and register in a couple of taps." : undefined}
          action={
            tab === "mine" && lists.upcoming.length > 0 ? (
              <Button variant="contained" onClick={() => setTab("upcoming")}>
                See upcoming events
              </Button>
            ) : null
          }
        />
      ) : (
        <Grid container spacing={3}>
          {visible.map((event) => {
            const reg = regByEvent[event.id];
            const status = reg && STATUS_LABEL[reg.status];
            return (
              <Grid item xs={12} sm={6} xl={4} key={event.id}>
                <Box sx={{ position: "relative", height: "100%" }}>
                  <EventCard
                    event={event}
                    onOpen={() => navigate(`/dashboard/event/${event.id}`, { state: event.id })}
                    actionLabel={reg ? "View registration" : isUpcoming(event) ? "Register" : "View"}
                  />
                  {status && (
                    <Chip
                      size="small"
                      label={status.label}
                      color={status.color}
                      sx={{ position: "absolute", top: 50, right: 14, pointerEvents: "none" }}
                    />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
};

export default EventSection;

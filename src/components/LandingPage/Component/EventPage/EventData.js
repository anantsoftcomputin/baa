import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Button, Container, Skeleton, Stack, Typography } from "@mui/material";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import { findEvent } from "../../../../firebase/firestore";
import { useAuth } from "../../../../contexts/AuthContext";
import PageHeader from "../../../common/PageHeader";
import EventDetails from "../../../common/EventDetails";
import EmptyState from "../../../common/EmptyState";
import ShareMenu from "../../../common/ShareMenu";
import { formatDateRange, isUpcoming } from "../../../../utils/format";
import { eventPath } from "../Content/Events";

/**
 * Public event page. Works with `/events/:id/:slug`, legacy `/events/:slug`
 * links (id in router state), and plain slugs shared by people.
 */
const EventData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventName, slug } = useParams();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const stateId = typeof location.state === "string" ? location.state : null;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    findEvent({ id: stateId || eventName, slug: slug || eventName })
      .then((e) => alive && setEvent(e))
      .catch(() => alive && setEvent(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [stateId, eventName, slug]);

  if (loading) {
    return (
      <>
        <PageHeader title={<Skeleton width="55%" sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />} />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="rounded" height={420} />
        </Container>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <PageHeader title="Event not found" crumbs={[{ label: "Events", to: "/events" }, { label: "Not found" }]} />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <EmptyState
            icon={EventRoundedIcon}
            title="We couldn't find that event"
            description="It may have been renamed or removed."
            action={
              <Button variant="contained" onClick={() => navigate("/events")}>
                See all events
              </Button>
            }
          />
        </Container>
      </>
    );
  }

  const upcoming = isUpcoming(event);
  const dashboardPath = `/dashboard/event/${event.id}`;
  const register = () => {
    if (currentUser) navigate(dashboardPath, { state: event.id });
    else navigate("/login", { state: { from: { pathname: dashboardPath } } });
  };

  return (
    <>
      <PageHeader
        eyebrow={upcoming ? "Upcoming event" : "Past event"}
        title={event.name || event.title}
        subtitle={[formatDateRange(event.start_date, event.end_date), event.location].filter(Boolean).join(" · ")}
        crumbs={[{ label: "Events", to: "/events" }, { label: event.name || "Event" }]}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <EventDetails
          event={event}
          aside={
            <Stack spacing={1.25}>
              {upcoming ? (
                <Button size="large" variant="contained" fullWidth onClick={register}>
                  {currentUser ? "Register now" : "Sign in to register"}
                </Button>
              ) : (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.default", textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    This event has ended.
                  </Typography>
                </Box>
              )}
              <ShareMenu
                url={`${window.location.origin}${eventPath(event)}`}
                title={event.name}
                renderTrigger={(open) => (
                  <Button size="large" variant="outlined" fullWidth startIcon={<IosShareRoundedIcon />} onClick={open}>
                    Share event
                  </Button>
                )}
              />
            </Stack>
          }
        />
      </Container>
    </>
  );
};

export default EventData;

import React from "react";
import { Box, Card, Divider, Grid, Stack, Typography } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import ImageBox from "./ImageBox";
import { eventFee } from "./EventCard";
import { formatCurrency, formatDate, formatDateRange, formatTimeRange, imageOf } from "../../utils/format";

const Fact = ({ icon: Icon, label, value }) =>
  value ? (
    <Stack direction="row" spacing={1.75} alignItems="flex-start">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(232,133,31,0.1)",
          color: "primary.main",
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>{value}</Typography>
      </Box>
    </Stack>
  ) : null;

/**
 * Event body shared by the public and dashboard detail pages. `aside` is the
 * call-to-action column (register / sign in).
 */
const EventDetails = ({ event, aside }) => {
  const guestFee = parseFloat(event.guest_amount);
  return (
    <Grid container spacing={{ xs: 4, md: 6 }}>
      <Grid item xs={12} md={8}>
        {imageOf(event) && (
          <ImageBox src={imageOf(event)} alt={event.name} ratio="16 / 9" rounded={5} sx={{ mb: 4, boxShadow: (t) => t.custom.shadows.sm }} />
        )}
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          About this event
        </Typography>
        <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", fontSize: "1.05rem", lineHeight: 1.8 }}>
          {event.description || "Details will be announced soon."}
        </Typography>

        {Array.isArray(event.subevents) && event.subevents.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Schedule
            </Typography>
            <Stack spacing={2}>
              {event.subevents.map((s, i) => (
                <Card key={s.id || i} sx={{ p: 2.5 }}>
                  <Typography variant="h6">{s.name}</Typography>
                  {s.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {s.description}
                    </Typography>
                  )}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.75, sm: 3 }} sx={{ mt: 1.5, color: "text.secondary" }}>
                    {s.date && (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <EventAvailableRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography variant="body2">{formatDate(s.date)}</Typography>
                      </Stack>
                    )}
                    {s.location && (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <PlaceRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography variant="body2">{s.location}</Typography>
                      </Stack>
                    )}
                    {s.max_participants && (
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <GroupsRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography variant="body2">Up to {s.max_participants}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, position: { md: "sticky" }, top: { md: 100 }, boxShadow: (t) => t.custom.shadows.sm }}>
          <Stack spacing={2.25}>
            <Fact icon={CalendarMonthRoundedIcon} label="Date" value={formatDateRange(event.start_date, event.end_date)} />
            <Fact icon={ScheduleRoundedIcon} label="Time" value={formatTimeRange(event.start_time, event.end_time)} />
            <Fact icon={PlaceRoundedIcon} label="Venue" value={event.location} />
            <Fact
              icon={HowToRegRoundedIcon}
              label="Registration closes"
              value={event.registration_deadline ? formatDate(event.registration_deadline) : ""}
            />
          </Stack>
          <Divider sx={{ my: 2.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography color="text.secondary">Fee per alumnus</Typography>
            <Typography variant="h5">{eventFee(event)}</Typography>
          </Stack>
          {guestFee > 0 && (
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Per guest
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatCurrency(guestFee)}
              </Typography>
            </Stack>
          )}
          {aside && <Box sx={{ mt: 2.5 }}>{aside}</Box>}
        </Card>
      </Grid>
    </Grid>
  );
};

export default EventDetails;

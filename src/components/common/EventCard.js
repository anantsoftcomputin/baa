import React from "react";
import { Box, Button, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ImageBox from "./ImageBox";
import ShareMenu from "./ShareMenu";
import { formatCurrency, formatDateRange, formatTimeRange, imageOf, isUpcoming, toDate, truncate } from "../../utils/format";

const DateBadge = ({ value }) => {
  const d = toDate(value);
  if (!d) return null;
  return (
    <Box
      sx={{
        position: "absolute",
        top: 14,
        left: 14,
        width: 58,
        py: 0.75,
        borderRadius: 2.5,
        bgcolor: "rgba(255,255,255,0.95)",
        textAlign: "center",
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
      }}
    >
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: "primary.main", letterSpacing: "0.1em" }}>
        {d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
      </Typography>
      <Typography sx={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1, color: "text.primary" }}>
        {d.getDate()}
      </Typography>
    </Box>
  );
};

export const eventFee = (event) => {
  const n = parseFloat(event?.amount);
  return Number.isFinite(n) && n > 0 ? formatCurrency(n) : "Free";
};

/** Event summary card used on the home page, /events and the dashboard. */
const EventCard = ({ event, onOpen, shareUrl, actionLabel = "View details", compact = false }) => {
  const upcoming = isUpcoming(event);
  const title = event.name || event.title || "Untitled event";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow .25s ease, transform .25s ease",
        "&:hover": { boxShadow: (t) => t.custom.shadows.md, transform: "translateY(-4px)" },
        "&:hover img": { transform: "scale(1.05)" },
      }}
    >
      <CardActionArea onClick={onOpen} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <ImageBox
          src={imageOf(event)}
          alt={title}
          ratio={compact ? "16 / 9" : "16 / 10"}
          icon={EventRoundedIcon}
          imgSx={{ transition: "transform .6s ease" }}
        >
          <DateBadge value={event.start_date} />
          <Chip
            size="small"
            label={upcoming ? "Upcoming" : "Past event"}
            sx={{
              position: "absolute",
              top: 14,
              right: 14,
              bgcolor: upcoming ? "secondary.main" : "rgba(23,33,46,0.7)",
              color: "#fff",
            }}
          />
        </ImageBox>
        <Box sx={{ p: compact ? 2 : 2.5, display: "flex", flexDirection: "column", gap: 1.25, flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontSize: compact ? "1rem" : "1.15rem" }}>
            {title}
          </Typography>
          {!compact && event.description && (
            <Typography variant="body2" color="text.secondary">
              {truncate(event.description, 130)}
            </Typography>
          )}
          <Stack spacing={0.75} sx={{ mt: "auto", pt: 1, color: "text.secondary" }}>
            {(event.start_date || event.end_date) && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="body2">{formatDateRange(event.start_date, event.end_date)}</Typography>
              </Stack>
            )}
            {event.start_time && !compact && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="body2">{formatTimeRange(event.start_time, event.end_time)}</Typography>
              </Stack>
            )}
            {event.location && (
              <Stack direction="row" spacing={1} alignItems="center">
                <PlaceRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="body2" noWrap>
                  {event.location}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </CardActionArea>
      <Box
        sx={{
          px: compact ? 2 : 2.5,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" color={eventFee(event) === "Free" ? "secondary.main" : "text.primary"}>
          {eventFee(event)}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {shareUrl && <ShareMenu url={shareUrl} title={title} />}
          <Button size="small" onClick={onOpen}>
            {actionLabel}
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

export default EventCard;

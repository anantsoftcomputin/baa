import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { isUpcoming, toDate } from "../../../../utils/format";

/** "Upcoming events" side-rail widget. */
const DashboardEvents = ({ eventsData = [] }) => {
  const navigate = useNavigate();
  const time = (e) => toDate(e.start_date)?.getTime() || 0;
  const upcoming = eventsData.filter((e) => isUpcoming(e)).sort((a, b) => time(a) - time(b)).slice(0, 3);

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6">Upcoming events</Typography>
        <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/dashboard/addEvents")}>
          All
        </Button>
      </Stack>
      {upcoming.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No upcoming events right now.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {upcoming.map((e) => {
            const d = toDate(e.start_date);
            return (
              <Stack
                key={e.id}
                direction="row"
                spacing={1.5}
                alignItems="center"
                onClick={() => navigate(`/dashboard/event/${e.id}`, { state: e.id })}
                sx={{ p: 1, mx: -1, borderRadius: 2.5, cursor: "pointer", "&:hover": { bgcolor: "background.default" } }}
              >
                <Box sx={{ width: 48, flexShrink: 0, textAlign: "center", borderRadius: 2, bgcolor: "rgba(232,133,31,0.1)", py: 0.75 }}>
                  <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: "primary.main", letterSpacing: "0.08em" }}>
                    {d ? d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase() : "TBA"}
                  </Typography>
                  <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, lineHeight: 1 }}>{d ? d.getDate() : "–"}</Typography>
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>
                    {e.name || e.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap component="div">
                    {e.location || "Venue TBA"}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Card>
  );
};

export default DashboardEvents;

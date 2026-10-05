import React from "react";
import { Box, Button, Card, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import ImageBox from "./ImageBox";
import { formatCurrency, formatDateRange, imageOf, truncate } from "../../utils/format";

export const fundingProgress = (initiative) => {
  const goal = parseFloat(initiative?.total_funds_required) || 0;
  const raised = parseFloat(initiative?.raised_amount) || 0;
  return { goal, raised, percent: goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0 };
};

const statusColor = {
  active: "secondary",
  completed: "default",
  upcoming: "info",
  planned: "info",
};

/** Initiative summary with funding progress. */
const InitiativeCard = ({ initiative, onSupport, onOpen, supportLabel = "Support this cause" }) => {
  const { goal, raised, percent } = fundingProgress(initiative);
  const status = (initiative.status || "").toLowerCase();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box onClick={onOpen} sx={{ cursor: onOpen ? "pointer" : "default" }}>
        <ImageBox src={imageOf(initiative)} alt={initiative.name} icon={VolunteerActivismRoundedIcon} ratio="16 / 9">
          {status && (
            <Chip
              size="small"
              label={initiative.status}
              color={statusColor[status] || "default"}
              sx={{ position: "absolute", top: 14, left: 14, textTransform: "capitalize", bgcolor: statusColor[status] ? undefined : "rgba(255,255,255,0.92)" }}
            />
          )}
        </ImageBox>
      </Box>
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.25, flexGrow: 1 }}>
        {initiative.category && (
          <Typography variant="overline" color="primary" sx={{ lineHeight: 1.2 }}>
            {initiative.category}
          </Typography>
        )}
        <Typography variant="h6" sx={{ fontSize: "1.15rem", cursor: onOpen ? "pointer" : "default" }} onClick={onOpen}>
          {initiative.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {truncate(initiative.purpose, 150)}
        </Typography>
        {initiative.start_date && (
          <Typography variant="caption" color="text.secondary">
            {formatDateRange(initiative.start_date, initiative.end_date)}
          </Typography>
        )}
        <Box sx={{ mt: "auto", pt: 1.5 }}>
          {goal > 0 && (
            <>
              <LinearProgress variant="determinate" value={percent} />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>{formatCurrency(raised)}</strong>{" "}
                  <Box component="span" sx={{ color: "text.secondary" }}>
                    raised
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of {formatCurrency(goal)}
                </Typography>
              </Stack>
            </>
          )}
          {onSupport && (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              startIcon={<VolunteerActivismRoundedIcon />}
              onClick={onSupport}
              sx={{ mt: 2 }}
              disabled={status === "completed"}
            >
              {status === "completed" ? "Completed" : supportLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default InitiativeCard;

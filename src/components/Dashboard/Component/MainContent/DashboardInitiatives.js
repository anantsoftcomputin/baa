import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, LinearProgress, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { fundingProgress } from "../../../common/InitiativeCard";
import { formatCurrency } from "../../../../utils/format";

/** "Initiatives" side-rail widget with funding progress. */
const DashboardInitiatives = ({ initiativesData = [] }) => {
  const navigate = useNavigate();
  const active = initiativesData.filter((i) => (i.status || "").toLowerCase() !== "completed").slice(0, 3);

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6">Initiatives</Typography>
        <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/dashboard/addInitiatives")}>
          All
        </Button>
      </Stack>
      {active.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No active initiatives right now.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {active.map((i) => {
            const { goal, raised, percent } = fundingProgress(i);
            return (
              <Box
                key={i.id}
                onClick={() => navigate(`/dashboard/addInitiatives/${i.id}`)}
                sx={{ cursor: "pointer", p: 1, mx: -1, borderRadius: 2.5, "&:hover": { bgcolor: "background.default" } }}
              >
                <Typography variant="subtitle2" noWrap>
                  {i.name}
                </Typography>
                {goal > 0 ? (
                  <>
                    <LinearProgress variant="determinate" value={percent} color="secondary" sx={{ mt: 1, height: 6 }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(raised)} of {formatCurrency(goal)} · {percent}%
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary" noWrap component="div">
                    {i.purpose}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Card>
  );
};

export default DashboardInitiatives;

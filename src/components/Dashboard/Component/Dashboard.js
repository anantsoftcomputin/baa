import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import { useAuth } from "../../../contexts/AuthContext";
import { getAllEvents, getAllInitiatives, getBatchYear } from "../../../firebase/firestore";
import Feed from "./MainContent/Feed";
import DashboardEvents from "./MainContent/DashboardEvents";
import DashboardInitiatives from "./MainContent/DashboardInitiatives";
import DashboardUsers from "./MainContent/DashboardUsers";
import { MembershipCard } from "./Membership/Membership";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/** Profile fields that make the directory useful; used for the completeness nudge. */
const PROFILE_FIELDS = ["batchyear", "bio", "job_title", "company", "city", "phone_number", "profile_picture"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { displayName, userProfile } = useAuth();
  const [eventsData, setEventsData] = useState([]);
  const [initiativesData, setInitiativesData] = useState([]);

  useEffect(() => {
    getAllEvents().then((e) => setEventsData(e || [])).catch(() => {});
    getAllInitiatives().then((i) => setInitiativesData(i || [])).catch(() => {});
  }, []);

  const filled = PROFILE_FIELDS.filter((f) => (f === "batchyear" ? getBatchYear(userProfile) : userProfile?.[f] || (f === "profile_picture" && userProfile?.photoURL))).length;
  const completeness = Math.round((filled / PROFILE_FIELDS.length) * 100);

  return (
    <>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          color: "#fff",
          background: (t) => t.custom.inkGradient,
          "&::after": {
            content: '""',
            position: "absolute",
            right: -80,
            top: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,133,31,0.5) 0%, rgba(232,133,31,0) 70%)",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: "primary.light" }}>
              {greeting()}
            </Typography>
            <Typography variant="h3" component="h1" sx={{ color: "#fff" }}>
              Welcome back, {displayName.split(" ")[0]}
            </Typography>
            <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.72)", maxWidth: 520 }}>
              {completeness < 100
                ? `Your profile is ${completeness}% complete. A full profile helps batchmates find you.`
                : "Catch up on what your fellow alumni are sharing."}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
            {completeness < 100 && (
              <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => navigate("/dashboard/updateProfile")}>
                Complete profile
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Groups2RoundedIcon />}
              onClick={() => navigate("/dashboard/batchmates")}
              sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.06)" } }}
            >
              Find batchmates
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Feed />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5} sx={{ position: { lg: "sticky" }, top: { lg: 96 } }}>
            <MembershipCard />
            <DashboardEvents eventsData={eventsData} />
            <DashboardInitiatives initiativesData={initiativesData} />
            <DashboardUsers />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;

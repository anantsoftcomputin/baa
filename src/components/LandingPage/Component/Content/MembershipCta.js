import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Reveal from "../../../common/Reveal";
import { useAuth } from "../../../../contexts/AuthContext";
import { formatCurrency } from "../../../../utils/format";

export const DEFAULT_BENEFITS = [
  "Lifetime access to the alumni directory and batchmate search",
  "Priority registration for reunions and flagship events",
  "A voice in association decisions and initiatives",
  "Mentor — or be mentored by — fellow Bhavanites",
];

/** Lifetime membership call-to-action band on the home page. */
const MembershipCta = ({ fee, benefits }) => {
  const navigate = useNavigate();
  const { currentUser, isMember } = useAuth();
  const list = benefits && benefits.length ? benefits : DEFAULT_BENEFITS;

  const cta = () => {
    if (!currentUser) navigate("/register");
    else navigate("/becomemember");
  };

  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 }, bgcolor: "#fff" }}>
      <Container maxWidth="lg">
        <Reveal>
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: 5, md: 7 },
              p: { xs: 4, md: 7 },
              color: "#fff",
              background: (t) => t.custom.forestGradient,
              "&::after": {
                content: '""',
                position: "absolute",
                width: 460,
                height: 460,
                borderRadius: "50%",
                right: -120,
                top: -180,
                background: "radial-gradient(circle, rgba(232,133,31,0.55) 0%, rgba(232,133,31,0) 70%)",
              },
            }}
          >
            <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="overline" component="p" sx={{ color: "primary.light", mb: 1.5 }}>
                  Lifetime membership
                </Typography>
                <Typography variant="h2" component="h2" sx={{ color: "#fff" }}>
                  Make it official. Stay a Bhavanite for life.
                </Typography>
                <Typography sx={{ mt: 2.5, color: "rgba(255,255,255,0.8)", fontSize: "1.05rem" }}>
                  One-time membership{fee ? ` of ${formatCurrency(fee)}` : ""} supports the association's work and
                  unlocks everything the community has to offer.
                </Typography>
                <Button
                  size="large"
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={cta}
                  disabled={isMember}
                  sx={{ mt: 4, "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.2)", color: "#fff" } }}
                >
                  {isMember ? "You're a lifetime member" : currentUser ? "Become a member" : "Join & become a member"}
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  {list.map((b) => (
                    <Stack
                      key={b}
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <CheckCircleRoundedIcon sx={{ color: "primary.light", mt: 0.25 }} />
                      <Typography sx={{ color: "rgba(255,255,255,0.92)" }}>{b}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
};

export default MembershipCta;

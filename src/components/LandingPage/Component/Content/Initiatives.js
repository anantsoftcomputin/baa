import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Grid } from "@mui/material";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import SectionHeader from "../../../common/SectionHeader";
import InitiativeCard from "../../../common/InitiativeCard";
import EmptyState from "../../../common/EmptyState";
import Reveal from "../../../common/Reveal";
import { useAuth } from "../../../../contexts/AuthContext";

const Initiatives = ({ InitiativesData = [], limit = 3 }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const initiatives = InitiativesData.slice(0, limit);

  const support = (initiative) => {
    const target = `/dashboard/addInitiatives/${initiative.id}`;
    if (currentUser) navigate(target);
    else navigate("/login", { state: { from: { pathname: target } } });
  };

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <SectionHeader
          eyebrow="Giving back"
          title="Initiatives that matter"
          subtitle="Scholarships, school infrastructure and community projects — powered by alumni who care."
        />
        {initiatives.length === 0 ? (
          <EmptyState
            icon={VolunteerActivismRoundedIcon}
            title="New initiatives coming soon"
            description="We're planning our next community projects. Stay tuned."
          />
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {initiatives.map((initiative, i) => (
              <Grid item xs={12} sm={6} md={4} key={initiative.id}>
                <Reveal delay={i * 100} sx={{ height: "100%" }}>
                  <InitiativeCard initiative={initiative} onSupport={() => support(initiative)} />
                </Reveal>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Initiatives;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Skeleton } from "@mui/material";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { getAllInitiatives } from "../../../../firebase/firestore";
import DashboardHeader from "../../../common/DashboardHeader";
import InitiativeCard from "../../../common/InitiativeCard";
import EmptyState from "../../../common/EmptyState";

/** /dashboard/addInitiatives — browse initiatives and contribute. */
const InitiativesSection = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllInitiatives()
      .then((i) => setInitiatives(i || []))
      .catch(() => setInitiatives([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <DashboardHeader
        title="Initiatives"
        subtitle="Community projects powered by alumni. Every contribution counts."
        actions={
          isAdmin && (
            <Button variant="contained" startIcon={<EditNoteRoundedIcon />} onClick={() => navigate("/dashboard/admin?tab=initiatives")}>
              Manage initiatives
            </Button>
          )
        }
      />
      {loading ? (
        <Grid container spacing={3}>
          {[0, 1, 2].map((i) => (
            <Grid item xs={12} sm={6} xl={4} key={i}>
              <Skeleton variant="rounded" height={420} />
            </Grid>
          ))}
        </Grid>
      ) : initiatives.length === 0 ? (
        <EmptyState icon={VolunteerActivismRoundedIcon} title="No initiatives yet" description="New community projects will appear here." />
      ) : (
        <Grid container spacing={3}>
          {initiatives.map((i) => (
            <Grid item xs={12} sm={6} xl={4} key={i.id}>
              <InitiativeCard
                initiative={i}
                onOpen={() => navigate(`/dashboard/addInitiatives/${i.id}`)}
                onSupport={() => navigate(`/dashboard/addInitiatives/${i.id}`)}
                supportLabel="Contribute"
              />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default InitiativesSection;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Stack } from "@mui/material";
import PageHeader from "./PageHeader";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader eyebrow="404" title="This page wandered off." subtitle="The link may be old, or the page may have moved." />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button variant="contained" size="large" onClick={() => navigate("/")}>
            Back to home
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate("/events")}>
            Browse events
          </Button>
        </Stack>
      </Container>
    </>
  );
};

export default NotFound;

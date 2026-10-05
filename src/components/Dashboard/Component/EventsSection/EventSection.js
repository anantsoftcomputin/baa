import React from "react";
import { Box, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AddEvents from "./AddEvents";
import EventTable from "./EventTable";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
  },
});

const EventSection = () => {
  const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));
  const userID = loginInfo?.userId;
  const UserRole = loginInfo?.userRole;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <Container sx={{ mt: 10 }}>
          <EventTable />
          {/* Show form for all authenticated users - adjust role check as needed */}
          <AddEvents userID={userID} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default EventSection;

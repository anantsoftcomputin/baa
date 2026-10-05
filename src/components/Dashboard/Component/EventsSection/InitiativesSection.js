import React from "react";
import { Box, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import AddInitiatives from "./AddInitiatives";
import InitiativesTable from "./InitiativesTable";

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

const InitiativesSection = () => {
  const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));
  const userID = loginInfo?.userId;
  const UserRole = loginInfo?.userRole;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <Container sx={{ mt: 10 }}>
          <InitiativesTable />
          {/* Show form for all authenticated users - adjust role check as needed */}
          <AddInitiatives userID={userID} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default InitiativesSection;

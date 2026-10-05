import React from "react";
import { Box, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import BatchmateTable from "./BatchmateTable";

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

const Batchmate = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <Container sx={{ mt: 10 }}>
          <BatchmateTable />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Batchmate;

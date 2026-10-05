import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import MainContent from "./MainContent/MainContent";
import { getAllEvents } from "../../../firebase/firestore";
import { getAllInitiatives } from "../../../firebase/firestore";

const theme = createTheme({
  palette: {
    primary: {
      main: "#fba645",
      light: "#ffc166",
      dark: "#e89539",
    },
    secondary: {
      main: "#ff8c00",
    },
    background: {
      default: "linear-gradient(135deg, #f5f7fa 0%, #fef9f5 100%)",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(251, 166, 69, 0.15)",
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 16px 48px rgba(251, 166, 69, 0.25)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px",
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 28px",
        },
        contained: {
          boxShadow: "0 4px 12px rgba(251, 166, 69, 0.3)",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(251, 166, 69, 0.4)",
          },
        },
      },
    },
  },
});

const Dashboard = () => {
  const [count, setCount] = useState(0);
  const [eventsData, setEventsData] = useState([]);
  const [initiativesData, setInitiativesData] = useState([]);

  const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));
  const userID = loginInfo?.userId;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getAllEvents();
        setEventsData(events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        const initiatives = await getAllInitiatives();
        setInitiativesData(initiatives || []);
      } catch (error) {
        console.error("Error fetching initiatives:", error);
      }
    };
    fetchInitiatives();
  }, [count]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <MainContent
          eventsData={eventsData}
          initiativesData={initiativesData}
          userID={userID}
          setCount={setCount}
        />
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

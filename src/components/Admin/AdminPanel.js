import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import WebsiteContentManager from "./components/WebsiteContentManager";
import EventsManager from "./components/EventsManager";
import InitiativesManager from "./components/InitiativesManager";
import BlogsManager from "./components/BlogsManager";
import GalleryManager from "./components/GalleryManager";
import TestimonialsManager from "./components/TestimonialsManager";
import CommitteeManager from "./components/CommitteeManager";
import AchievementsManager from "./components/AchievementsManager";
import UserManagement from "./components/UserManagement";
import ContactsManager from "./components/ContactsManager";

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

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const tabComponents = [
    { label: "Website Content", component: <WebsiteContentManager /> },
    { label: "Events", component: <EventsManager /> },
    { label: "Initiatives", component: <InitiativesManager /> },
    { label: "Blogs", component: <BlogsManager /> },
    { label: "Gallery", component: <GalleryManager /> },
    { label: "Testimonials", component: <TestimonialsManager /> },
    { label: "Committee", component: <CommitteeManager /> },
    { label: "Achievements", component: <AchievementsManager /> },
    { label: "Contacts", component: <ContactsManager /> },
    { label: "Users", component: <UserManagement /> },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <Container sx={{ mt: 10 }}>
          <Paper
            elevation={3}
            sx={{
              mt: 2,
              boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 2 }}
              >
                {tabComponents.map((tab, index) => (
                  <Tab key={index} label={tab.label} />
                ))}
              </Tabs>
            </Box>
            <Box sx={{ p: 3 }}>
              {tabComponents[tabValue].component}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AdminPanel;

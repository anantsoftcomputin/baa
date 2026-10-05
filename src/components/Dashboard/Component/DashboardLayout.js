import React, { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";
import Navbar from "./Navbar/Navbar";
import Sidebar from "./SideBar/Sidebar";
import { InlineLoader } from "../../common/Loader";

/** Shell for every /dashboard page: sidebar, top bar, and a padded content area. */
const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggle = () => setDrawerOpen((o) => !o);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar handleDrawerToggle={toggle} />
      <Sidebar drawerOpen={drawerOpen} handleDrawerToggle={toggle} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: { xs: 10, md: 12 }, pb: 6 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Suspense fallback={<InlineLoader py={12} />}>
            <Outlet />
          </Suspense>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

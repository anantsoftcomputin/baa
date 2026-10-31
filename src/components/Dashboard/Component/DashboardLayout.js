import React, { Suspense, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Alert, Box, Button, Container } from "@mui/material";
import Navbar from "./Navbar/Navbar";
import Sidebar from "./SideBar/Sidebar";
import { InlineLoader } from "../../common/Loader";

/** Shell for every /dashboard page: sidebar, top bar, and a padded content area. */
const DashboardLayout = () => {
  const location = useLocation();
  const pendingOrder = localStorage.getItem("baaPendingPaymentOrder");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggle = () => setDrawerOpen((o) => !o);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar handleDrawerToggle={toggle} />
      <Sidebar drawerOpen={drawerOpen} handleDrawerToggle={toggle} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: { xs: 10, md: 12 }, pb: 6 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {pendingOrder && location.pathname !== "/dashboard/payment-result" && (
            <Alert severity="info" sx={{ mb: 3 }} action={
              <Button component={Link} to={`/dashboard/payment-result?orderId=${encodeURIComponent(pendingOrder)}`} color="inherit" size="small">
                Check status
              </Button>
            }>
              You have a recent checkout. Check its status before paying again.
            </Alert>
          )}
          <Suspense fallback={<InlineLoader py={12} />}>
            <Outlet />
          </Suspense>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

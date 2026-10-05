import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Box, Paper } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import { useAuth } from "../../../../contexts/AuthContext";

/** Height of the bar, so pages can leave room for it on phones. */
export const BOTTOM_NAV_HEIGHT = 64;

/** Phone-only tab bar for the public website (hidden from the md breakpoint up). */
const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser } = useAuth();

  const items = [
    { value: "/", label: "Home", icon: <HomeRoundedIcon /> },
    { value: "/events", label: "Events", icon: <EventRoundedIcon /> },
    { value: "/Gallery", label: "Gallery", icon: <PhotoLibraryRoundedIcon /> },
    { value: "/Blogs", label: "Blogs", icon: <ArticleRoundedIcon /> },
    currentUser
      ? { value: "/dashboard", label: "Dashboard", icon: <SpaceDashboardRoundedIcon /> }
      : { value: "/login", label: "Sign in", icon: <PersonRoundedIcon />, also: ["/register", "/forgotPassword"] },
  ];

  const lower = pathname.toLowerCase();
  const active =
    items.find((i) => (i.value === "/" ? pathname === "/" : lower.startsWith(i.value.toLowerCase()) || i.also?.includes(pathname)))
      ?.value || false;

  return (
    <>
      {/* Spacer so the footer isn't hidden behind the bar */}
      <Box sx={{ display: { xs: "block", md: "none" }, height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))` }} />
      <Paper
        component="nav"
        aria-label="Main"
        elevation={0}
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (t) => t.zIndex.appBar,
          borderRadius: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(255,255,255,0.94)",
          backdropFilter: "saturate(180%) blur(16px)",
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        <BottomNavigation
          showLabels
          value={active}
          onChange={(_, value) => {
            navigate(value);
            if (value === pathname) window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          sx={{
            height: BOTTOM_NAV_HEIGHT,
            bgcolor: "transparent",
            "& .MuiBottomNavigationAction-root": { minWidth: 0, px: 0.5, color: "text.secondary" },
            "& .MuiBottomNavigationAction-label": { fontSize: "0.7rem", fontWeight: 600, mt: 0.25 },
            "& .MuiBottomNavigationAction-label.Mui-selected": { fontSize: "0.7rem" },
            "& .Mui-selected": { color: "primary.main" },
            "& .Mui-selected .MuiSvgIcon-root": {
              bgcolor: "rgba(232,133,31,0.14)",
              borderRadius: 99,
              px: 1.75,
              py: 0.25,
              width: "auto",
              boxSizing: "content-box",
            },
          }}
        >
          {items.map((i) => (
            <BottomNavigationAction key={i.value} value={i.value} label={i.label} icon={i.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
};

export default BottomNav;

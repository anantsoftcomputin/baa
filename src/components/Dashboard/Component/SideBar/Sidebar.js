import React from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import DynamicFeedRoundedIcon from "@mui/icons-material/DynamicFeedRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import LogoImg from "../../../images/BAA.png";
import { useAuth } from "../../../../contexts/AuthContext";
import { logout } from "../../../../firebase/auth";
import UserAvatar from "../../../common/UserAvatar";

export const DRAWER_WIDTH = 268;

const MAIN = [
  { text: "Home", icon: SpaceDashboardRoundedIcon, link: "/dashboard", exact: true },
  { text: "Events", icon: EventRoundedIcon, link: "/dashboard/addEvents", also: ["/dashboard/event"] },
  { text: "Initiatives", icon: VolunteerActivismRoundedIcon, link: "/dashboard/addInitiatives" },
  { text: "Batchmates", icon: Groups2RoundedIcon, link: "/dashboard/batchmates" },
  { text: "Following feed", icon: DynamicFeedRoundedIcon, link: "/dashboard/followingPost" },
  { text: "My profile", icon: AccountCircleRoundedIcon, link: "/dashboard/userProfile", exact: true },
  { text: "Membership", icon: WorkspacePremiumRoundedIcon, link: "/dashboard/membership" },
];

const ADMIN = [
  { text: "Admin panel", icon: AdminPanelSettingsRoundedIcon, link: "/dashboard/admin", exact: true },
  { text: "Manage events", icon: EditCalendarRoundedIcon, link: "/dashboard/admin?tab=events", tab: "events" },
  { text: "Website content", icon: WebRoundedIcon, link: "/dashboard/admin?tab=content", tab: "content" },
  { text: "Users", icon: ManageAccountsRoundedIcon, link: "/dashboard/admin?tab=users", tab: "users" },
];

const NavItem = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <ListItemButton
      component={RouterLink}
      to={item.link}
      onClick={onClick}
      selected={active}
      sx={{
        mb: 0.25,
        py: 1,
        px: 1.5,
        color: active ? "primary.dark" : "text.secondary",
        "&.Mui-selected": { bgcolor: "rgba(232,133,31,0.12)", "&:hover": { bgcolor: "rgba(232,133,31,0.16)" } },
        "&:hover": { color: "text.primary" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 38, color: active ? "primary.main" : "inherit" }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 700 : 600, fontSize: "0.92rem" }} />
    </ListItemButton>
  );
};

const SectionLabel = ({ children }) => (
  <Typography variant="overline" sx={{ px: 1.5, pt: 2, pb: 0.5, display: "block", color: "text.secondary", fontSize: "0.66rem" }}>
    {children}
  </Typography>
);

const Sidebar = ({ drawerOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isMember, displayName, photoURL, userProfile, userRole } = useAuth();

  const close = isSmallScreen ? handleDrawerToggle : undefined;
  const tab = new URLSearchParams(location.search).get("tab");

  const isActive = (item) => {
    const path = location.pathname.replace(/\/$/, "");
    if (item.tab) return path === "/dashboard/admin" && tab === item.tab;
    if (item.link === "/dashboard/admin") return path === "/dashboard/admin" && !ADMIN.some((a) => a.tab === tab);
    if (item.exact) return path === item.link;
    return [item.link, ...(item.also || [])].some((p) => path.startsWith(p));
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("loginInfo");
    navigate("/login");
  };

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        component={RouterLink}
        to="/dashboard"
        onClick={close}
        sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2.5, height: 72, textDecoration: "none", flexShrink: 0 }}
      >
        <Box component="img" src={LogoImg} alt="BAA" sx={{ width: 44, height: "auto" }} />
        <Box>
          <Typography sx={{ fontFamily: (t) => t.custom.tokens.fontDisplay, fontWeight: 600, fontSize: "1.1rem", color: "text.primary", lineHeight: 1.1 }}>
            Bhavan's Alumni
          </Typography>
          <Typography sx={{ fontSize: "0.65rem", letterSpacing: "0.16em", fontWeight: 700, color: "primary.main" }}>
            MEMBER PORTAL
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, pb: 2 }}>
        <SectionLabel>Community</SectionLabel>
        <List disablePadding>
          {MAIN.map((item) => (
            <NavItem key={item.text} item={item} active={isActive(item)} onClick={close} />
          ))}
        </List>

        {isAdmin && (
          <>
            <SectionLabel>Administration</SectionLabel>
            <List disablePadding>
              {ADMIN.map((item) => (
                <NavItem key={item.text} item={item} active={isActive(item)} onClick={close} />
              ))}
            </List>
          </>
        )}

        <Divider sx={{ my: 2 }} />
        <List disablePadding>
          <ListItemButton component={RouterLink} to="/" onClick={close} sx={{ py: 1, px: 1.5, color: "text.secondary" }}>
            <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
              <OpenInNewRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Visit website" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
          </ListItemButton>
          <ListItemButton onClick={handleLogout} sx={{ py: 1, px: 1.5, color: "text.secondary" }}>
            <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Sign out" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
          </ListItemButton>
        </List>
      </Box>

      <Box sx={{ p: 1.5, flexShrink: 0 }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          component={RouterLink}
          to="/dashboard/userProfile"
          onClick={close}
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
            textDecoration: "none",
            color: "inherit",
            "&:hover": { borderColor: "primary.light" },
          }}
        >
          <UserAvatar name={displayName} src={photoURL} size={40} />
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {userProfile?.batchyear || userProfile?.school_graduation_year
                ? `Batch of ${userProfile.batchyear || userProfile.school_graduation_year}`
                : userRole}
            </Typography>
          </Box>
          {isMember && <Chip size="small" label="Member" color="secondary" sx={{ height: 22, fontSize: "0.68rem" }} />}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}>
      <Drawer
        variant={isSmallScreen ? "temporary" : "permanent"}
        open={isSmallScreen ? drawerOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "#fff",
          },
        }}
      >
        {content}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

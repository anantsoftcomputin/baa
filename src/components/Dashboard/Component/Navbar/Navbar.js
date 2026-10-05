import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { hasPasswordProvider, logout } from "../../../../firebase/auth";
import UserAvatar from "../../../common/UserAvatar";
import { DRAWER_WIDTH } from "../SideBar/Sidebar";

const TITLES = [
  ["/dashboard/addEvents", "Events"],
  ["/dashboard/event", "Event"],
  ["/dashboard/addInitiatives", "Initiatives"],
  ["/dashboard/batchmates", "Batchmates"],
  ["/dashboard/followingPost", "Following feed"],
  ["/dashboard/userProfile/", "Alumni profile"],
  ["/dashboard/userProfile", "My profile"],
  ["/dashboard/updateProfile", "Edit profile"],
  ["/dashboard/changePassword", "Change password"],
  ["/dashboard/membership", "Membership"],
  ["/dashboard/admin", "Admin panel"],
  ["/dashboard", "Home"],
];

const Navbar = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, displayName, photoURL, isMember, isAdmin, userRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const title = (TITLES.find(([p]) => location.pathname.startsWith(p)) || [null, "Dashboard"])[1];

  const go = (path) => {
    setAnchorEl(null);
    navigate(path);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    localStorage.removeItem("loginInfo");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { lg: `${DRAWER_WIDTH}px` },
        bgcolor: "rgba(251,247,241,0.85)",
        backdropFilter: "saturate(180%) blur(14px)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, gap: 1.5 }}>
        <IconButton
          aria-label="Open navigation"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ display: { lg: "none" } }}
        >
          <MenuRoundedIcon />
        </IconButton>
        <Typography variant="h6" component="p" sx={{ flexGrow: 1, fontSize: { xs: "1rem", md: "1.1rem" } }} noWrap>
          {title}
        </Typography>

        {!isMember && (
          <Chip
            label="Become a member"
            color="primary"
            onClick={() => navigate("/dashboard/membership")}
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          />
        )}
        <Tooltip title="Website home">
          <IconButton onClick={() => navigate("/")} aria-label="Website home">
            <HomeRoundedIcon />
          </IconButton>
        </Tooltip>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Account menu" sx={{ p: 0.5 }}>
          <UserAvatar name={displayName} src={photoURL} size={36} />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{ sx: { minWidth: 240, mt: 1 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2">{displayName}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {currentUser?.email}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 0.75 }}>
              {isMember && <Chip size="small" color="secondary" label="Lifetime member" />}
              {isAdmin && <Chip size="small" label={userRole} />}
            </Box>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => go("/dashboard/userProfile")}>
            <ListItemIcon>
              <AccountCircleRoundedIcon fontSize="small" />
            </ListItemIcon>
            View profile
          </MenuItem>
          <MenuItem onClick={() => go("/dashboard/updateProfile")}>
            <ListItemIcon>
              <EditRoundedIcon fontSize="small" />
            </ListItemIcon>
            Edit profile
          </MenuItem>
          {hasPasswordProvider(currentUser) && (
            <MenuItem onClick={() => go("/dashboard/changePassword")}>
              <ListItemIcon>
                <LockResetRoundedIcon fontSize="small" />
              </ListItemIcon>
              Change password
            </MenuItem>
          )}
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

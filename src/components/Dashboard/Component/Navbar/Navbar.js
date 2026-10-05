import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import LogoImg from "../../../images/BAA.png";

const Navbar = ({ handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const username = userProfile?.username || currentUser?.displayName || "Guest";

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    handleMenuClose();
    navigate("/dashboard/userProfile");
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      const { logout } = await import('../../../../firebase/auth');
      await logout();
      localStorage.removeItem("loginInfo");
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem("loginInfo");
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "white",
        color: "black",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {isSmallScreen && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box
          component="img"
          src={LogoImg}
          alt="BAA Logo"
          sx={{ 
            height: 60,
            transition: 'all 0.3s ease',
            filter: 'drop-shadow(0 4px 8px rgba(251, 166, 69, 0.2))',
            '&:hover': {
              transform: 'scale(1.05)',
              filter: 'drop-shadow(0 6px 12px rgba(251, 166, 69, 0.3))',
            }
          }}
          ml={7}
        />

        <Box display="flex" alignItems="center" mr={4}>
          <IconButton onClick={handleAvatarClick}>
            <Avatar>{username.charAt(0).toUpperCase()}</Avatar>
          </IconButton>
          <Typography
            variant="body1"
            sx={{ ml: 1, cursor: "pointer" }}
            onClick={handleAvatarClick}
          >
            {username}
          </Typography>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              "& .MuiMenuItem-root": {
                display: "flex",
                justifyContent: "space-between",
              },
            },
          }}
        >
          <MenuItem onClick={handleViewProfile}>
            <AccountCircleIcon sx={{ mr: 1 }} />
            <Typography>View Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            <Typography>Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

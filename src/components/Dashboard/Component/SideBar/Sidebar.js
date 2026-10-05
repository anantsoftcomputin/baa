import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Collapse,
} from "@mui/material";
import {
  Home as HomeIcon,
  ExitToApp as LogoutIcon,
  Event as EventIcon,
  Description as ResourcesIcon,
  AdminPanelSettings as AdminIcon,
  ExpandLess,
  ExpandMore,
  EmojiEvents,
  RateReview,
  People as CommitteeIcon,
  Article,
  PhotoLibrary,
} from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Groups3Icon from "@mui/icons-material/Groups3";
import { createTheme } from "@mui/material/styles";
import PeopleIcon from "@mui/icons-material/People";
import { useAuth } from "../../../../contexts/AuthContext";

const drawerWidth = 240;

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

const menuItems = [
  { text: "Home", icon: <HomeIcon />, link: "/dashboard" },
  { text: "Events", icon: <EventIcon />, link: "/dashboard/addEvents" },
  {
    text: "Initiatives",
    icon: <ResourcesIcon />,
    link: "/dashboard/addInitiatives",
  },
  {
    text: "Batchmates",
    icon: <Groups3Icon />,
    link: "/dashboard/batchmates",
  },
  {
    text: "Following Posts",
    icon: <PeopleIcon />,
    link: "/dashboard/followingPost",
  },
  {
    text: "Profile",
    icon: <AccountCircleIcon />,
    link: "/dashboard/userProfile",
  },
];

const Sidebar = ({ drawerOpen, handleDrawerToggle }) => {
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { isAdmin, isSuperuser } = useAuth();
  const [contentOpen, setContentOpen] = useState(false);

  const handleContentClick = () => {
    setContentOpen(!contentOpen);
  };

  const handleLogout = async () => {
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
    <Drawer
      variant={isSmallScreen ? "temporary" : "permanent"}
      open={isSmallScreen ? drawerOpen : true}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #fba645 0%, #ff8c00 100%)",
          color: theme.palette.common.white,
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.link}
            onClick={isSmallScreen ? handleDrawerToggle : null}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {(isAdmin || isSuperuser) && (
          <>
            <ListItem
              button
              onClick={handleContentClick}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText primary="Content Management" />
              {contentOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={contentOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  component={Link}
                  to="/dashboard/admin"
                  onClick={isSmallScreen ? handleDrawerToggle : null}
                  sx={{ pl: 4, "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <AdminIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Admin Panel" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/dashboard/add-achievement"
                  onClick={isSmallScreen ? handleDrawerToggle : null}
                  sx={{ pl: 4, "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <EmojiEvents fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Achievements" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/dashboard/add-testimonial"
                  onClick={isSmallScreen ? handleDrawerToggle : null}
                  sx={{ pl: 4, "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <RateReview fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Testimonials" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/dashboard/add-committee"
                  onClick={isSmallScreen ? handleDrawerToggle : null}
                  sx={{ pl: 4, "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <CommitteeIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Committee" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/dashboard/add-blog"
                  onClick={isSmallScreen ? handleDrawerToggle : null}
                  sx={{ pl: 4, "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <Article fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Blogs" />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/dashboard/add-gallery"
                  onClick={isSmallScreen ? handleDrawerToggle : null}
                  sx={{ pl: 4, "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <PhotoLibrary fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Gallery" />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}
        <ListItem
          button
          key="logout"
          onClick={() => {
            handleLogout();
            if (isSmallScreen) handleDrawerToggle();
          }}
          sx={{
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;

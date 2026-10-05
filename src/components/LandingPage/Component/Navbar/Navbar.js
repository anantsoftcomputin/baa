import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Container,
  Box,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from "@mui/icons-material/Article";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import InfoIcon from "@mui/icons-material/Info";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import ReviewsIcon from "@mui/icons-material/Reviews";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LogoImg from "../../../images/BAA.png";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavValue, setMobileNavValue] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update mobile nav value based on location
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setMobileNavValue(0);
    else if (path === "/events") setMobileNavValue(1);
    else if (path === "/Blogs") setMobileNavValue(2);
    else if (path === "/Gallery") setMobileNavValue(3);
    else if (path === "/login") setMobileNavValue(4);
  }, [location]);

  useEffect(() => {
    const storedSection = localStorage.getItem("selectedSection");
    if (storedSection && location.pathname === "/") {
      scrollToSection(storedSection);
      localStorage.removeItem("selectedSection");
    }
  }, [location.pathname]);

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      localStorage.setItem("selectedSection", sectionId);
      navigate("/");
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 80;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    if (drawerOpen) {
      setDrawerOpen(false);
    }
  };

  const handleMobileNavChange = (event, newValue) => {
    setMobileNavValue(newValue);
    const routes = ["/", "/events", "/Blogs", "/Gallery", "/login"];
    navigate(routes[newValue]);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuSections = [
    {
      title: "Navigation",
      items: [
        { name: "Home", to: "/", icon: <HomeIcon />, action: () => navigate("/") },
        { name: "Events", to: "/events", icon: <EventIcon />, action: () => navigate("/events") },
        { name: "Blogs", to: "/Blogs", icon: <ArticleIcon />, action: () => navigate("/Blogs") },
        { name: "Gallery", to: "/Gallery", icon: <PhotoLibraryIcon />, action: () => navigate("/Gallery") },
      ],
    },
    {
      title: "Discover",
      items: [
        { name: "About Us", to: "about-us", icon: <InfoIcon />, action: () => scrollToSection("about-us") },
        { name: "Achievements", to: "achievements", icon: <EmojiEventsIcon />, action: () => scrollToSection("achievements") },
        { name: "Committee", to: "committee", icon: <GroupsIcon />, action: () => scrollToSection("committee") },
        { name: "Testimonials", to: "testimonials", icon: <ReviewsIcon />, action: () => scrollToSection("testimonials") },
        { name: "Contact", to: "contact-us", icon: <ContactMailIcon />, action: () => scrollToSection("contact-us") },
      ],
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Navigation */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          background: scrolled
            ? "rgba(255, 255, 255, 0.98)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "none" : "1px solid rgba(255, 140, 66, 0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: scrolled
            ? "0 4px 20px rgba(26, 26, 26, 0.08)"
            : "none",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              justifyContent: "space-between",
              py: 1,
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              onClick={() => navigate("/")}
            >
              <img
                src={LogoImg}
                alt="BAA Logo"
                style={{
                  height: isMobile ? "40px" : "50px",
                  marginRight: "12px",
                  filter: "drop-shadow(0 2px 8px rgba(255, 140, 66, 0.2))",
                }}
              />
              {!isMobile && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #FF8C42 0%, #8B4513 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.5px",
                  }}
                >
                  BAA Alumni
                </Typography>
              )}
            </Box>

            {/* Desktop Menu */}
            {!isTablet && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  onClick={() => navigate("/")}
                  sx={{
                    color: location.pathname === "/" ? "#FF8C42" : "#1A1A1A",
                    fontWeight: location.pathname === "/" ? 700 : 500,
                    fontSize: "0.95rem",
                    px: 2,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: location.pathname === "/" ? "60%" : "0%",
                      height: "3px",
                      borderRadius: "3px",
                      background: "linear-gradient(90deg, #FF8C42 0%, #8B4513 100%)",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "60%",
                    },
                  }}
                >
                  Home
                </Button>
                <Button
                  onClick={() => navigate("/events")}
                  sx={{
                    color: location.pathname === "/events" ? "#FF8C42" : "#1A1A1A",
                    fontWeight: location.pathname === "/events" ? 700 : 500,
                    fontSize: "0.95rem",
                    px: 2,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: location.pathname === "/events" ? "60%" : "0%",
                      height: "3px",
                      borderRadius: "3px",
                      background: "linear-gradient(90deg, #FF8C42 0%, #8B4513 100%)",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "60%",
                    },
                  }}
                >
                  Events
                </Button>
                <Button
                  onClick={() => scrollToSection("about-us")}
                  sx={{
                    color: "#1A1A1A",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    px: 2,
                    "&:hover": { color: "#FF8C42" },
                  }}
                >
                  About
                </Button>
                <Button
                  onClick={() => navigate("/Blogs")}
                  sx={{
                    color: location.pathname === "/Blogs" ? "#FF8C42" : "#1A1A1A",
                    fontWeight: location.pathname === "/Blogs" ? 700 : 500,
                    fontSize: "0.95rem",
                    px: 2,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: location.pathname === "/Blogs" ? "60%" : "0%",
                      height: "3px",
                      borderRadius: "3px",
                      background: "linear-gradient(90deg, #FF8C42 0%, #8B4513 100%)",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "60%",
                    },
                  }}
                >
                  Blogs
                </Button>
                <Button
                  onClick={() => navigate("/Gallery")}
                  sx={{
                    color: location.pathname === "/Gallery" ? "#FF8C42" : "#1A1A1A",
                    fontWeight: location.pathname === "/Gallery" ? 700 : 500,
                    fontSize: "0.95rem",
                    px: 2,
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: location.pathname === "/Gallery" ? "60%" : "0%",
                      height: "3px",
                      borderRadius: "3px",
                      background: "linear-gradient(90deg, #FF8C42 0%, #8B4513 100%)",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "60%",
                    },
                  }}
                >
                  Gallery
                </Button>
                <Button
                  onClick={() => scrollToSection("contact-us")}
                  sx={{
                    color: "#1A1A1A",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    px: 2,
                    "&:hover": { color: "#FF8C42" },
                  }}
                >
                  Contact
                </Button>
              </Box>
            )}

            {/* CTA Button & Menu */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {!isMobile && (
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    background: "linear-gradient(135deg, #FF8C42 0%, #E67A2E 100%)",
                    color: "#FFF",
                    px: 3,
                    py: 1,
                    borderRadius: "12px",
                    fontWeight: 600,
                    boxShadow: "0 4px 14px rgba(255, 140, 66, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #FFB366 0%, #FF8C42 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(255, 140, 66, 0.4)",
                    },
                  }}
                  startIcon={<PersonIcon />}
                >
                  Login
                </Button>
              )}

              {isTablet && (
                <IconButton
                  onClick={toggleDrawer}
                  sx={{
                    color: "#1A1A1A",
                    background: "rgba(255, 140, 66, 0.1)",
                    "&:hover": {
                      background: "rgba(255, 140, 66, 0.2)",
                      transform: "rotate(90deg)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {drawerOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 -4px 20px rgba(26, 26, 26, 0.1)",
            pb: "env(safe-area-inset-bottom)",
          }}
        >
          <BottomNavigation
            value={mobileNavValue}
            onChange={handleMobileNavChange}
            showLabels
            sx={{
              height: 70,
              background: "transparent",
              "& .MuiBottomNavigationAction-root": {
                minWidth: "auto",
                padding: "8px 12px",
                color: "#4A4A4A",
                transition: "all 0.3s ease",
                "&.Mui-selected": {
                  color: "#FF8C42",
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.2)",
                  },
                },
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.7rem",
                fontWeight: 600,
                marginTop: "4px",
                "&.Mui-selected": {
                  fontSize: "0.75rem",
                },
              },
            }}
          >
            <BottomNavigationAction
              label="Home"
              icon={
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HomeIcon />
                  {mobileNavValue === 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF8C42 0%, #8B4513 100%)",
                      }}
                    />
                  )}
                </Box>
              }
            />
            <BottomNavigationAction
              label="Events"
              icon={
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EventIcon />
                  {mobileNavValue === 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF8C42 0%, #8B4513 100%)",
                      }}
                    />
                  )}
                </Box>
              }
            />
            <BottomNavigationAction
              label="Blogs"
              icon={
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArticleIcon />
                  {mobileNavValue === 2 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF8C42 0%, #8B4513 100%)",
                      }}
                    />
                  )}
                </Box>
              }
            />
            <BottomNavigationAction
              label="Gallery"
              icon={
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PhotoLibraryIcon />
                  {mobileNavValue === 3 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF8C42 0%, #8B4513 100%)",
                      }}
                    />
                  )}
                </Box>
              }
            />
            <BottomNavigationAction
              label="Login"
              icon={
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonIcon />
                  {mobileNavValue === 4 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -8,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF8C42 0%, #8B4513 100%)",
                      }}
                    />
                  )}
                </Box>
              }
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Side Drawer for Tablet */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: 320,
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 140, 66, 0.05) 100%)",
            backdropFilter: "blur(20px)",
            borderTopLeftRadius: "24px",
            borderBottomLeftRadius: "24px",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Drawer Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={LogoImg}
                alt="BAA Logo"
                style={{ height: "40px", marginRight: "12px" }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #FF8C42 0%, #8B4513 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Menu
              </Typography>
            </Box>
            <IconButton onClick={toggleDrawer} sx={{ color: "#1A1A1A" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Menu Sections */}
          {menuSections.map((section, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#8B4513",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  ml: 2,
                  mb: 1,
                  display: "block",
                }}
              >
                {section.title}
              </Typography>
              <List>
                {section.items.map((item, index) => (
                  <ListItem
                    button
                    key={index}
                    onClick={() => {
                      item.action();
                      toggleDrawer();
                    }}
                    sx={{
                      borderRadius: "12px",
                      mb: 0.5,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(139, 69, 19, 0.05) 100%)",
                        transform: "translateX(8px)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "#FF8C42", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        color: "#1A1A1A",
                      }}
                    />
                  </ListItem>
                ))}
              </List>
              {idx < menuSections.length - 1 && (
                <Divider sx={{ my: 2, borderColor: "rgba(255, 140, 66, 0.2)" }} />
              )}
            </Box>
          ))}

          {/* Login Button in Drawer */}
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              navigate("/login");
              toggleDrawer();
            }}
            sx={{
              mt: 2,
              background: "linear-gradient(135deg, #FF8C42 0%, #E67A2E 100%)",
              color: "#FFF",
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(255, 140, 66, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #FFB366 0%, #FF8C42 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(255, 140, 66, 0.4)",
              },
            }}
            startIcon={<PersonIcon />}
          >
            Login / Register
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;

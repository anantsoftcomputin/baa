import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LogoImg from "../../../images/BAA.png";
import { useAuth } from "../../../../contexts/AuthContext";
import UserAvatar from "../../../common/UserAvatar";

/** `section` items scroll to an anchor on the home page; `to` items are routes. */
export const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "About", section: "about-us" },
  { label: "Events", to: "/events" },
  { label: "Initiatives", section: "initiatives" },
  { label: "Gallery", to: "/Gallery" },
  { label: "Blogs", to: "/Blogs" },
  { label: "Contact", to: "/contact" },
];

const AUTH_PAGES = ["/login", "/register", "/forgotPassword"];

export const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 72;
  window.scrollTo({ top, behavior: "smooth" });
  return true;
};

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, displayName, photoURL } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAuthPage = AUTH_PAGES.includes(location.pathname);
  const solid = scrolled || isAuthPage || drawerOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const go = (item) => {
    setDrawerOpen(false);
    if (item.section) {
      if (location.pathname === "/") {
        scrollToSection(item.section);
      } else {
        navigate("/", { state: { scrollTo: item.section } });
      }
      return;
    }
    navigate(item.to);
    if (item.to === location.pathname) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (item) =>
    item.to &&
    (item.to === "/" ? location.pathname === "/" : location.pathname.toLowerCase().startsWith(item.to.toLowerCase()));

  const linkColor = solid ? "text.primary" : "#fff";

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: solid ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: solid ? "saturate(180%) blur(16px)" : "none",
          borderBottom: "1px solid",
          borderColor: solid ? "divider" : "transparent",
          transition: "background-color .3s ease, border-color .3s ease",
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 2 }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: "flex", alignItems: "center", gap: 1.25, textDecoration: "none", mr: "auto" }}
            >
              <Box
                sx={{
                  width: { xs: 44, md: 50 },
                  height: { xs: 44, md: 50 },
                  borderRadius: "50%",
                  bgcolor: "#fff",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: solid ? "none" : "0 4px 14px rgba(0,0,0,0.18)",
                  flexShrink: 0,
                }}
              >
                <Box component="img" src={LogoImg} alt="BAA logo" sx={{ width: "82%", height: "auto" }} />
              </Box>
              <Box sx={{ lineHeight: 1 }}>
                <Typography
                  sx={{
                    fontFamily: (t) => t.custom.tokens.fontDisplay,
                    fontWeight: 600,
                    fontSize: { xs: "1.05rem", md: "1.2rem" },
                    color: linkColor,
                    lineHeight: 1.1,
                    transition: "color .3s ease",
                  }}
                >
                  Bhavan's Alumni
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.18em",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: solid ? "primary.main" : "rgba(255,255,255,0.75)",
                  }}
                >
                  Association · Vadodara
                </Typography>
              </Box>
            </Box>

            {isDesktop && (
              <Box component="nav" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {NAV_ITEMS.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => go(item)}
                    sx={{
                      color: linkColor,
                      px: 1.75,
                      fontWeight: 600,
                      position: "relative",
                      opacity: isActive(item) ? 1 : 0.86,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: 14,
                        right: 14,
                        bottom: 4,
                        height: 2,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        transform: isActive(item) ? "scaleX(1)" : "scaleX(0)",
                        transition: "transform .25s ease",
                      },
                      "&:hover": { bgcolor: "transparent", opacity: 1, "&::after": { transform: "scaleX(1)" } },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {currentUser ? (
                <Button
                  variant="contained"
                  onClick={() => navigate("/dashboard")}
                  startIcon={<UserAvatar name={displayName} src={photoURL} size={24} />}
                  sx={{ pl: 1.25, display: { xs: "none", sm: "inline-flex" } }}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate("/login")}
                    sx={{ color: linkColor, display: { xs: "none", sm: "inline-flex" } }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/register")}
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ display: { xs: "none", sm: "inline-flex" } }}
                  >
                    Join BAA
                  </Button>
                </>
              )}
              {!isDesktop && (
                <IconButton
                  aria-label={drawerOpen ? "Close menu" : "Open menu"}
                  onClick={() => setDrawerOpen((o) => !o)}
                  sx={{ color: linkColor, ml: 0.5 }}
                >
                  {drawerOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="top"
        open={drawerOpen && !isDesktop}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { pt: { xs: 9, md: 11 }, pb: 3, borderRadius: "0 0 24px 24px" } }}
      >
        <Container>
          <List sx={{ py: 0 }}>
            {NAV_ITEMS.map((item) => (
              <ListItemButton key={item.label} onClick={() => go(item)} selected={!!isActive(item)} sx={{ py: 1.25 }}>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: "1.05rem" }}
                />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          {currentUser ? (
            <Button fullWidth size="large" variant="contained" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Button size="large" variant="outlined" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button size="large" variant="contained" onClick={() => navigate("/register")}>
                Join BAA
              </Button>
            </Box>
          )}
        </Container>
      </Drawer>
    </>
  );
};

export default Navbar;

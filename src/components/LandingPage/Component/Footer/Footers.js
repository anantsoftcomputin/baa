import React, { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Divider, Grid, IconButton, Link, Stack, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { getWebsiteContent } from "../../../../firebase/firestore";
import LogoImg from "../../../images/BAA.png";
import { CONTACT_FALLBACK } from "../ContactUs/ContactUs";
import { scrollToSection } from "../Navbar/Navbar";
import { externalUrl } from "../../../../utils/format";
import { LEGAL_PAGES, ORGANISATION } from "../Legal/organisation";

const FooterLink = ({ to, section, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const onClick = (e) => {
    if (!section) return;
    e.preventDefault();
    if (location.pathname === "/") scrollToSection(section);
    else navigate("/", { state: { scrollTo: section } });
  };
  return (
    <Link
      component={RouterLink}
      to={to || "/"}
      onClick={onClick}
      underline="none"
      sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", "&:hover": { color: "#fff" } }}
    >
      {children}
    </Link>
  );
};

const ColumnTitle = ({ children }) => (
  <Typography sx={{ color: "#fff", fontWeight: 700, mb: 2, fontSize: "0.95rem" }}>{children}</Typography>
);

const Footers = () => {
  const [footer, setFooter] = useState({});
  const [contact, setContact] = useState(CONTACT_FALLBACK);

  useEffect(() => {
    Promise.all([getWebsiteContent("footer").catch(() => null), getWebsiteContent("contact").catch(() => null)]).then(
      ([f, c]) => {
        setFooter(f || {});
        if (c) setContact({ ...CONTACT_FALLBACK, ...Object.fromEntries(Object.entries(c).filter(([, v]) => v)) });
      }
    );
  }, []);

  const socials = [
    { key: "facebook_link", icon: <FacebookIcon />, label: "Facebook" },
    { key: "instagram_link", icon: <InstagramIcon />, label: "Instagram" },
    { key: "linkedin_link", icon: <LinkedInIcon />, label: "LinkedIn" },
    { key: "youtube_link", icon: <YouTubeIcon />, label: "YouTube" },
  ].filter((s) => footer[s.key]);

  return (
    <Box component="footer" sx={{ bgcolor: "#0F1720", color: "rgba(255,255,255,0.7)", pt: { xs: 8, md: 10 }, pb: 4 }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 5, md: 6 }}>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
              <Box sx={{ width: 52, height: 52, borderRadius: "50%", bgcolor: "#fff", display: "grid", placeItems: "center" }}>
                <Box component="img" src={LogoImg} alt="" sx={{ width: "82%" }} />
              </Box>
              <Box>
                <Typography sx={{ color: "#fff", fontFamily: (t) => t.custom.tokens.fontDisplay, fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.1 }}>
                  Bhavan's Alumni
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.18em", fontWeight: 700, color: "primary.light" }}>
                  ASSOCIATION · VADODARA
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ maxWidth: 340, fontSize: "0.95rem" }}>
              {footer.about_text ||
                "Fostering lifelong connections among alumni, supporting current students, and promoting the welfare of our alma mater."}
            </Typography>
            {socials.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                {socials.map((s) => (
                  <IconButton
                    key={s.key}
                    component="a"
                    href={externalUrl(footer[s.key])}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.08)", "&:hover": { bgcolor: "primary.main" } }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Stack>
            )}
          </Grid>
          <Grid item xs={6} md={2}>
            <ColumnTitle>Explore</ColumnTitle>
            <Stack spacing={1.25}>
              <FooterLink section="about-us">About us</FooterLink>
              <FooterLink to="/events">Events</FooterLink>
              <FooterLink section="initiatives">Initiatives</FooterLink>
              <FooterLink to="/Gallery">Gallery</FooterLink>
              <FooterLink to="/Blogs">Blogs</FooterLink>
            </Stack>
          </Grid>
          <Grid item xs={6} md={2}>
            <ColumnTitle>Members</ColumnTitle>
            <Stack spacing={1.25}>
              <FooterLink to="/login">Sign in</FooterLink>
              <FooterLink to="/register">Join BAA</FooterLink>
              <FooterLink to="/dashboard/membership">Membership</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <ColumnTitle>Legal</ColumnTitle>
            <Stack spacing={1.25}>
              {LEGAL_PAGES.map((p) => (
                <FooterLink key={p.path} to={p.path}>
                  {p.label}
                </FooterLink>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <ColumnTitle>Reach us</ColumnTitle>
            <Stack spacing={1.75}>
              <Stack direction="row" spacing={1.5}>
                <PlaceRoundedIcon fontSize="small" sx={{ color: "primary.light", mt: 0.25 }} />
                <Typography sx={{ fontSize: "0.95rem", whiteSpace: "pre-line" }}>{contact.address}</Typography>
              </Stack>
              {contact.email && (
                <Stack direction="row" spacing={1.5}>
                  <MailOutlineRoundedIcon fontSize="small" sx={{ color: "primary.light", mt: 0.25 }} />
                  <Link href={`mailto:${contact.email}`} underline="hover" sx={{ color: "inherit", fontSize: "0.95rem", wordBreak: "break-all" }}>
                    {contact.email}
                  </Link>
                </Stack>
              )}
              {contact.phone && (
                <Stack direction="row" spacing={1.5}>
                  <PhoneRoundedIcon fontSize="small" sx={{ color: "primary.light", mt: 0.25 }} />
                  <Link href={`tel:${String(contact.phone).replace(/\s/g, "")}`} underline="hover" sx={{ color: "inherit", fontSize: "0.95rem" }}>
                    {contact.phone}
                  </Link>
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 5 }} />
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ fontSize: "0.85rem" }}>
          <Typography sx={{ fontSize: "inherit" }}>
            © {new Date().getFullYear()} {footer.copyright_text || `${ORGANISATION.legalName}. All rights reserved.`}
          </Typography>
          <Typography sx={{ fontSize: "inherit", color: "rgba(255,255,255,0.55)" }}>GSTIN: {ORGANISATION.gstin}</Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footers;

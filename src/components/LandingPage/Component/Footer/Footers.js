import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { getWebsiteContent } from "../../../../firebase/firestore";

const FooterLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.primary,
  display: "block",
  marginBottom: theme.spacing(1),
  "&:hover": {
    color: theme.palette.secondary.main,
    textDecoration: "underline",
  },
}));

const Footers = () => {
  const [footerData, setFooterData] = useState([]);
  const [contactData, setContactData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [footer, contact] = await Promise.all([
          getWebsiteContent("footer"),
          getWebsiteContent("contact")
        ]);
        setFooterData(footer || {});
        setContactData(contact || {});
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        py: 6,
        mt: 4,
        mb: 4,
        borderTop: `1px solid ${(theme) => theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              About Us
            </Typography>
            <Typography variant="body2" color="text.primary">
              Bhavans Alumni Association is dedicated to fostering lifelong
              connections among alumni, supporting current students, and
              promoting the welfare of our alma mater.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.primary">
              {contactData.address}
            </Typography>
            <Typography variant="body2" color="text.primary">
              Email : {contactData.email}
            </Typography>
            <Typography variant="body2" color="text.primary">
              Phone : {contactData.phone}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/events">Events</FooterLink>
            <FooterLink to="/Terms">Terms and Conditions</FooterLink>
            <FooterLink to="/Privacy">Privacy</FooterLink>
            <FooterLink to="/login">Login</FooterLink>
          </Grid>
        </Grid>
        <Box mt={5} textAlign="center">
          <Typography variant="body2" color="text.primary">
            {new Date().getFullYear()} {footerData.copyright_text}
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <a
              href={footerData.facebook_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ margin: "0 8px" }}
            >
              <IconButton aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
            </a>
            <a
              href={footerData.instagram_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ margin: "0 8px" }}
            >
              <IconButton aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
            </a>
            <a
              href={footerData.linkedin_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ margin: "0 8px" }}
            >
              <IconButton aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </a>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footers;

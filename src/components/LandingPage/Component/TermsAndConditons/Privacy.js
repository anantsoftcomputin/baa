import React from "react";
import {
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  styled,
  Divider,
} from "@mui/material";

const Terms = () => {
  const StyledCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(4),
    boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.3s ease-in-out",
  }));

  return (
    <>
      <Container sx={{ mt: 2 }}>
        <StyledCard>
          <Grid container spacing={4} sx={{ p: 4 }}>
            <Grid item xs={12}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Privacy Policy
                </Typography>
                <Typography variant="body1" paragraph color="textSecondary">
                  This Privacy Policy explains how we collect, use, and share
                  your personal information when you use our website. Your
                  privacy is important to us, and we are committed to protecting
                  your information.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>
                  Information Collection
                </Typography>
                <Typography variant="body2" paragraph>
                  1. We collect information that you provide directly to us,
                  such as when you create an account, fill out a form, or
                  contact customer support.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. We may also collect information automatically, such as your
                  IP address, browser type, and the pages you visit on our site.
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Cookies and similar tracking technologies may be used to
                  collect and track information to improve our website and
                  services.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>
                  Use of Information
                </Typography>
                <Typography variant="body2" paragraph>
                  1. The information we collect is used to provide, maintain,
                  and improve our services, including customer support.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. We may use your information to send you updates,
                  newsletters, or promotional materials that may interest you.
                  You can opt out at any time.
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Your information may be used for research and analysis to
                  better understand our users and improve the website's
                  functionality.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>
                  Sharing of Information
                </Typography>
                <Typography variant="body2" paragraph>
                  1. We do not sell or share your personal information with
                  third parties for marketing purposes without your consent.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. We may share your information with service providers who
                  assist us in operating the website and delivering services.
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Your information may be disclosed if required by law, or to
                  protect our rights, safety, or the security of our users.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>
                  Data Security
                </Typography>
                <Typography variant="body2" paragraph>
                  1. We implement appropriate security measures to protect your
                  information against unauthorized access, disclosure, or
                  destruction.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. However, no method of transmission over the internet or
                  electronic storage is 100% secure. We cannot guarantee the
                  absolute security of your data.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>
                  Changes to This Policy
                </Typography>
                <Typography variant="body2" paragraph>
                  1. We may update this Privacy Policy from time to time. We
                  will notify you of any changes by posting the new policy on
                  our website.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. It is your responsibility to review this Privacy Policy
                  periodically to stay informed about our practices.
                </Typography>
              </CardContent>
            </Grid>
          </Grid>
        </StyledCard>
      </Container>
    </>
  );
};

export default Terms;

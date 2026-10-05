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
                  Terms and Conditions
                </Typography>
                <Typography variant="body1" paragraph color="textSecondary">
                  These are the terms and conditions for using our website.
                  Please read them carefully before proceeding. By accessing or
                  using our website, you agree to be bound by these terms.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>
                  General Conditions
                </Typography>
                <Typography variant="body2" paragraph>
                  1. You must be at least 18 years old to use our service.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. The content provided on our site is for informational
                  purposes only and may change without notice.
                </Typography>
                <Typography variant="body2" paragraph>
                  3. We reserve the right to modify or discontinue any service
                  without prior notice.
                </Typography>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>
                  User Responsibilities
                </Typography>
                <Typography variant="body2" paragraph>
                  1. You are responsible for maintaining the confidentiality of
                  your account.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. You agree not to misuse the website, including unauthorized
                  access or tampering.
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

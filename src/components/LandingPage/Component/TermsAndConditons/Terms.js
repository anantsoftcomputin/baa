import React from "react";
import { Divider, Typography } from "@mui/material";
import LegalPage from "../../../common/LegalPage";

const Terms = () => {
  return (
    <LegalPage title="Terms and Conditions" subtitle="Please read these terms before using the BAA website.">
      <Typography variant="body1" paragraph color="textSecondary">
        These are the terms and conditions for using our website. Please read them carefully before proceeding. By
        accessing or using our website, you agree to be bound by these terms.
      </Typography>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>
        General Conditions
      </Typography>
      <Typography variant="body2" paragraph>
        1. You must be at least 18 years old to use our service.
      </Typography>
      <Typography variant="body2" paragraph>
        2. The content provided on our site is for informational purposes only and may change without notice.
      </Typography>
      <Typography variant="body2" paragraph>
        3. We reserve the right to modify or discontinue any service without prior notice.
      </Typography>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" gutterBottom>
        User Responsibilities
      </Typography>
      <Typography variant="body2" paragraph>
        1. You are responsible for maintaining the confidentiality of your account.
      </Typography>
      <Typography variant="body2" paragraph>
        2. You agree not to misuse the website, including unauthorized access or tampering.
      </Typography>
    </LegalPage>
  );
};

export default Terms;

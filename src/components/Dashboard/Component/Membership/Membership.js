import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Alert, Box, Button, Card, Chip, Grid, Stack, Typography } from "@mui/material";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { getMembershipSettings, DEFAULT_MEMBERSHIP_FEE } from "../../../../firebase/firestore";
import { paymentErrorMessage, startPayment } from "../../../../firebase/payments";
import { logMembershipPurchaseCompleted, logMembershipPurchaseInitiated } from "../../../../firebase/analytics";
import { DEFAULT_BENEFITS } from "../../../LandingPage/Component/Content/MembershipCta";
import DashboardHeader from "../../../common/DashboardHeader";
import PaymentTermsNote from "../../../common/PaymentTermsNote";
import { formatCurrency, formatDate } from "../../../../utils/format";

/** Shared purchase hook so the side card and the full page behave identically. */
const useMembershipPurchase = () => {
  const { currentUser, displayName, refreshUserProfile } = useAuth();
  const [settings, setSettings] = useState({ amount: DEFAULT_MEMBERSHIP_FEE, benefits: null });
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    getMembershipSettings().then(setSettings).catch(() => {});
  }, []);

  const purchase = async () => {
    setPaying(true);
    logMembershipPurchaseInitiated();
    try {
      const result = await startPayment({
        purpose: "membership",
        prefill: { name: displayName, email: currentUser?.email || "" },
      });
      if (result.status === "paid") {
        logMembershipPurchaseCompleted("membership");
        await refreshUserProfile();
        toast.success("Welcome! You're now a lifetime member.");
      }
    } catch (error) {
      console.error("Membership payment error:", error);
      toast.error(paymentErrorMessage(error));
    } finally {
      setPaying(false);
    }
  };

  return { settings, paying, purchase };
};

/** Compact card for the dashboard side rail. */
export const MembershipCard = () => {
  const navigate = useNavigate();
  const { isMember, userProfile } = useAuth();
  const { settings, paying, purchase } = useMembershipPurchase();

  if (isMember) {
    return (
      <Card sx={{ p: 2.5, background: (t) => t.custom.forestGradient, color: "#fff", border: 0 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <VerifiedRoundedIcon sx={{ color: "primary.light", fontSize: 32 }} />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Lifetime member</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
              {userProfile?.membershipDate ? `Since ${formatDate(userProfile.membershipDate)}` : "Thank you for your support"}
            </Typography>
          </Box>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2.5, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", bgcolor: "rgba(232,133,31,0.1)" }} />
      <WorkspacePremiumRoundedIcon color="primary" sx={{ fontSize: 32 }} />
      <Typography variant="h6" sx={{ mt: 1 }}>
        Become a lifetime member
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        One payment of <strong>{formatCurrency(settings.amount)}</strong> — yours for life.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={purchase} disabled={paying}>
          {paying ? "Opening…" : "Join now"}
        </Button>
        <Button onClick={() => navigate("/dashboard/membership")}>Learn more</Button>
      </Stack>
      <PaymentTermsNote sx={{ textAlign: "left" }} />
    </Card>
  );
};

/** /dashboard/membership (also reached via /becomemember). */
const Membership = () => {
  const navigate = useNavigate();
  const { isMember, userProfile, isAdmin } = useAuth();
  const { settings, paying, purchase } = useMembershipPurchase();
  const benefits = settings.benefits?.length ? settings.benefits : DEFAULT_BENEFITS;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <DashboardHeader
        eyebrow="Membership"
        title="Lifetime membership"
        subtitle="Support the association and stay part of the Bhavan's family for life."
        actions={
          isAdmin && (
            <Button variant="outlined" onClick={() => navigate("/dashboard/admin?tab=membership")}>
              Change fee
            </Button>
          )
        }
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: { xs: 3, md: 4 }, height: "100%" }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              What membership includes
            </Typography>
            <Stack spacing={1.75}>
              {benefits.map((b) => (
                <Stack key={b} direction="row" spacing={1.5} alignItems="flex-start">
                  <CheckCircleRoundedIcon color="secondary" sx={{ mt: 0.2 }} />
                  <Typography>{b}</Typography>
                </Stack>
              ))}
            </Stack>
            <Alert severity="info" sx={{ mt: 4 }}>
              Questions about membership or offline payment? Reach the committee via the Contact page.
            </Alert>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              p: { xs: 3, md: 4 },
              height: "100%",
              color: "#fff",
              border: 0,
              background: (t) => (isMember ? t.custom.forestGradient : t.custom.inkGradient),
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isMember ? (
              <>
                <VerifiedRoundedIcon sx={{ fontSize: 48, color: "primary.light" }} />
                <Typography variant="h4" sx={{ mt: 2, color: "#fff" }}>
                  You're a lifetime member
                </Typography>
                <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>
                  {userProfile?.membershipDate ? `Member since ${formatDate(userProfile.membershipDate)}.` : ""} Thank you for supporting the
                  association.
                </Typography>
                {userProfile?.paymentDetails?.paymentId && (
                  <Chip
                    label={`Receipt: ${userProfile.paymentDetails.paymentId}`}
                    sx={{ mt: 3, alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.12)", color: "#fff" }}
                  />
                )}
              </>
            ) : (
              <>
                <Chip label="One-time payment" sx={{ alignSelf: "flex-start", bgcolor: "rgba(232,133,31,0.2)", color: "primary.light" }} />
                <Typography sx={{ mt: 3, fontFamily: (t) => t.custom.tokens.fontDisplay, fontSize: "3.25rem", fontWeight: 600, lineHeight: 1 }}>
                  {formatCurrency(settings.amount)}
                </Typography>
                <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>Lifetime access · no renewals</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button size="large" variant="contained" fullWidth onClick={purchase} disabled={paying} sx={{ mt: 4 }}>
                  {paying ? "Opening secure checkout…" : "Become a member"}
                </Button>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 1.5, color: "rgba(255,255,255,0.6)" }}>
                  <LockRoundedIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">Secure payment via Razorpay</Typography>
                </Stack>
                <PaymentTermsNote light />
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Membership;

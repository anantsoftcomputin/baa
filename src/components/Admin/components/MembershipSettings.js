import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Alert, Box, Button, Card, CircularProgress, Grid, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { DEFAULT_MEMBERSHIP_FEE, getUsersByYear, getWebsiteContent, updateWebsiteContent } from "../../../firebase/firestore";
import { logAdminAction } from "../../../firebase/analytics";
import { DEFAULT_BENEFITS } from "../../LandingPage/Component/Content/MembershipCta";
import { formatCurrency, formatDate } from "../../../utils/format";
import AdminStat from "./AdminStat";

/**
 * Lifetime membership settings (`websiteContent/membership`).
 * The payment server reads the fee from here, so a change applies to the next purchase.
 */
const MembershipSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState({ amount: DEFAULT_MEMBERSHIP_FEE, benefits: DEFAULT_BENEFITS, updatedAt: null });
  const [amount, setAmount] = useState(String(DEFAULT_MEMBERSHIP_FEE));
  const [benefits, setBenefits] = useState(DEFAULT_BENEFITS.join("\n"));
  const [members, setMembers] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getWebsiteContent("membership").catch(() => null), getUsersByYear().catch(() => [])]).then(([m, users]) => {
      const fee = Number(m?.amount) > 0 ? Number(m.amount) : DEFAULT_MEMBERSHIP_FEE;
      const list = Array.isArray(m?.benefits) && m.benefits.length ? m.benefits : DEFAULT_BENEFITS;
      setSaved({ amount: fee, benefits: list, updatedAt: m?.updatedAt || null });
      setAmount(String(fee));
      setBenefits(list.join("\n"));
      setMembers(users.filter((u) => u.is_member).length);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    const fee = parseFloat(amount);
    if (!Number.isFinite(fee) || fee < 1) {
      setError("Enter a fee of at least ₹1.");
      return;
    }
    if (fee > 1000000) {
      setError("That looks too high. Enter the fee in rupees, e.g. 2500.");
      return;
    }
    const list = benefits
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      const rounded = Math.round(fee * 100) / 100;
      await updateWebsiteContent("membership", { amount: rounded, benefits: list });
      logAdminAction("update", "website_content", "membership");
      setSaved({ amount: rounded, benefits: list, updatedAt: new Date() });
      setAmount(String(rounded));
      toast.success(`Membership fee set to ${formatCurrency(rounded)}`);
    } catch (e) {
      console.error("Error saving membership settings:", e);
      toast.error("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  const changed = parseFloat(amount) !== saved.amount || benefits.trim() !== saved.benefits.join("\n").trim();

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5">Membership</Typography>
        <Typography variant="body2" color="text.secondary">
          Set the lifetime membership fee and the benefits listed on the website.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <AdminStat label="Current lifetime membership fee" value={formatCurrency(saved.amount)} icon={WorkspacePremiumRoundedIcon} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AdminStat
            label="Lifetime members"
            value={members ?? "–"}
            icon={GroupsRoundedIcon}
            color="secondary.main"
            onClick={() => navigate("/dashboard/admin?tab=users")}
          />
        </Grid>
      </Grid>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              Membership fee
            </Typography>
            <TextField
              label="Lifetime membership fee"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^\d.]/g, ""));
                setError("");
              }}
              error={!!error}
              helperText={error || "One-time amount in rupees. Applies to new purchases; existing members are not affected."}
              inputProps={{ inputMode: "decimal", "aria-label": "Lifetime membership fee" }}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              sx={{ maxWidth: 360 }}
              fullWidth
            />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              Benefits shown on the website
            </Typography>
            <TextField
              label="Benefits (one per line)"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              multiline
              minRows={4}
              fullWidth
            />
          </Box>
          <Alert severity="info">
            The fee is shown on the home page and the Membership page, and is charged by the payment server at checkout.
            {saved.updatedAt ? ` Last changed ${formatDate(saved.updatedAt)}.` : ""}
          </Alert>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="contained" onClick={save} disabled={saving || !changed}>
              {saving ? "Saving…" : "Save membership settings"}
            </Button>
            <Button endIcon={<OpenInNewRoundedIcon />} onClick={() => window.open("/dashboard/membership", "_blank", "noopener")}>
              Preview membership page
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default MembershipSettings;

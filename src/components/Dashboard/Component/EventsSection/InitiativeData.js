import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { getInitiativeById, getMyContributions } from "../../../../firebase/firestore";
import { paymentErrorMessage, startPayment } from "../../../../firebase/payments";
import ImageBox from "../../../common/ImageBox";
import EmptyState from "../../../common/EmptyState";
import { fundingProgress } from "../../../common/InitiativeCard";
import { formatCurrency, formatDate, formatDateRange, imageOf } from "../../../../utils/format";

const PRESETS = [500, 1000, 2500, 5000];

/** /dashboard/addInitiatives/:InitiativeId — initiative details and contributions. */
const InitiativeData = () => {
  const { InitiativeId } = useParams();
  const navigate = useNavigate();
  const { currentUser, displayName, userProfile } = useAuth();
  const [initiative, setInitiative] = useState(null);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    const [i, contributions] = await Promise.all([
      getInitiativeById(InitiativeId).catch(() => null),
      currentUser ? getMyContributions(currentUser.uid) : [],
    ]);
    setInitiative(i);
    setMine((contributions || []).filter((c) => c.initiativeId === InitiativeId));
  }, [InitiativeId, currentUser]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const contribute = async () => {
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value < 1) {
      toast.error("Please enter an amount of at least ₹1.");
      return;
    }
    setPaying(true);
    try {
      const result = await startPayment({
        purpose: "initiative",
        refId: InitiativeId,
        amount: value,
        prefill: { name: displayName, email: currentUser?.email || "", contact: userProfile?.phone_number || "" },
      });
      if (result.status === "paid") {
        toast.success("Thank you for your contribution!");
        setAmount("");
        await load();
      }
    } catch (error) {
      toast.error(paymentErrorMessage(error));
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <>
        <Skeleton width={300} height={48} />
        <Skeleton variant="rounded" height={420} sx={{ mt: 2 }} />
      </>
    );
  }

  if (!initiative) {
    return (
      <EmptyState
        icon={VolunteerActivismRoundedIcon}
        title="Initiative not found"
        action={
          <Button variant="contained" onClick={() => navigate("/dashboard/addInitiatives")}>
            Back to initiatives
          </Button>
        }
      />
    );
  }

  const { goal, raised, percent } = fundingProgress(initiative);
  const completed = (initiative.status || "").toLowerCase() === "completed";
  const myTotal = mine.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  return (
    <>
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/dashboard/addInitiatives")} color="inherit" sx={{ mb: 2 }}>
        All initiatives
      </Button>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        {initiative.category && <Chip size="small" label={initiative.category} />}
        {initiative.status && <Chip size="small" label={initiative.status} color={completed ? "default" : "secondary"} sx={{ textTransform: "capitalize" }} />}
      </Stack>
      <Typography variant="h3" component="h1" sx={{ mb: 4 }}>
        {initiative.name}
      </Typography>

      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid item xs={12} md={7}>
          {imageOf(initiative) && <ImageBox src={imageOf(initiative)} alt={initiative.name} ratio="16 / 9" rounded={5} sx={{ mb: 4 }} />}
          <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>
            Why it matters
          </Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", fontSize: "1.05rem", lineHeight: 1.8 }}>
            {initiative.purpose || "Details coming soon."}
          </Typography>
          {initiative.start_date && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Runs {formatDateRange(initiative.start_date, initiative.end_date)}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, position: { md: "sticky" }, top: { md: 100 } }}>
            {goal > 0 ? (
              <>
                <Typography sx={{ fontFamily: (t) => t.custom.tokens.fontDisplay, fontSize: "2.2rem", fontWeight: 600, lineHeight: 1 }}>
                  {formatCurrency(raised)}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  raised of {formatCurrency(goal)} goal
                </Typography>
                <LinearProgress variant="determinate" value={percent} color="secondary" sx={{ mt: 2, height: 10 }} />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {percent}% funded
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {initiative.contributors_count || 0} contributor{initiative.contributors_count === 1 ? "" : "s"}
                  </Typography>
                </Stack>
              </>
            ) : (
              <Typography variant="h6">Support this initiative</Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {completed ? (
              <Typography color="text.secondary">This initiative has been completed. Thank you to everyone who contributed!</Typography>
            ) : (
              <>
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Choose an amount
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                  {PRESETS.map((p) => (
                    <Chip
                      key={p}
                      label={formatCurrency(p)}
                      onClick={() => setAmount(String(p))}
                      color={String(p) === amount ? "primary" : "default"}
                      variant={String(p) === amount ? "filled" : "outlined"}
                    />
                  ))}
                </Stack>
                <TextField
                  fullWidth
                  label="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                  inputProps={{ inputMode: "decimal" }}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                />
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="secondary"
                  startIcon={<VolunteerActivismRoundedIcon />}
                  onClick={contribute}
                  disabled={paying || !amount}
                  sx={{ mt: 2 }}
                >
                  {paying ? "Opening secure checkout…" : `Contribute${amount ? ` ${formatCurrency(amount)}` : ""}`}
                </Button>
                <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center" sx={{ mt: 1.25, color: "text.secondary" }}>
                  <LockRoundedIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">Secure payment via Razorpay</Typography>
                </Stack>
              </>
            )}

            {mine.length > 0 && (
              <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: "background.default" }}>
                <Typography variant="subtitle2">Your contributions: {formatCurrency(myTotal)}</Typography>
                {mine.slice(0, 5).map((c) => (
                  <Typography key={c.id} variant="caption" color="text.secondary" component="div">
                    {formatCurrency(c.amount)} · {formatDate(c.createdAt)}
                  </Typography>
                ))}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default InitiativeData;

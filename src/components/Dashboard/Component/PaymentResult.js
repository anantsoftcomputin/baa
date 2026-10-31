import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { verifyPaymentOrder, paymentErrorMessage } from "../../../firebase/payments";
import { useAuth } from "../../../contexts/AuthContext";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") || localStorage.getItem("baaPendingPaymentOrder");
  const { refreshUserProfile } = useAuth();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const check = useCallback(async () => {
    if (!orderId) { setError("No payment order was found."); return; }
    setBusy(true);
    setError("");
    try {
      const payment = await verifyPaymentOrder(orderId);
      setResult(payment);
      if (["paid", "failed", "test_paid"].includes(payment.status)) {
        if (localStorage.getItem("baaPendingPaymentOrder") === orderId) localStorage.removeItem("baaPendingPaymentOrder");
        if (payment.status === "paid" && payment.purpose === "membership") await refreshUserProfile();
      }
    } catch (err) { setError(paymentErrorMessage(err)); }
    finally { setBusy(false); }
  }, [orderId, refreshUserProfile]);
  useEffect(() => { check(); }, [check]);
  const paid = result?.status === "paid";
  const tested = result?.status === "test_paid";
  const failed = result?.status === "failed";
  const destination = result?.purpose === "membership" ? "/dashboard/membership" :
    result?.purpose === "initiative" ? `/dashboard/addInitiatives/${encodeURIComponent(result.refId)}` : "/dashboard/addEvents";
  return (
    <Box sx={{ maxWidth: 640, mx: "auto", py: 5 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {tested ? "Test payment completed" : paid ? "Payment received" : failed ? "Payment not completed" : "Checking your payment"}
      </Typography>
      {busy && <CircularProgress size={28} sx={{ my: 2 }} />}
      {error && <Alert severity="warning" sx={{ my: 2 }}>{error}</Alert>}
      {result && <Alert severity={paid ? "success" : (failed || tested) ? "info" : "warning"} sx={{ my: 2 }}>
        {tested ? "CCAvenue test checkout succeeded. No money was processed and no membership, event registration or contribution was credited." : paid ? "Your payment is confirmed and your account has been updated." : failed ?
          "CCAvenue reports that this payment was unsuccessful or cancelled." :
          "Confirmation is still pending. Check again before making another payment."}
      </Alert>}
      {orderId && <Typography variant="body2" sx={{ mb: 3, overflowWrap: "anywhere" }}>Order reference: {orderId}</Typography>}
      <Stack direction="row" spacing={2}>
        {!paid && !tested && orderId && <Button variant="contained" disabled={busy} onClick={check}>Check again</Button>}
        <Button component={Link} to={destination}>{paid || tested ? "Continue" : "Back to dashboard"}</Button>
      </Stack>
    </Box>
  );
}

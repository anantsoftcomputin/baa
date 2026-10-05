import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  cancelRegistration,
  eventRegistrationTotal,
  findEvent,
  getMyRegistration,
  registerForEvent,
} from "../../../../firebase/firestore";
import { paymentErrorMessage, startPayment } from "../../../../firebase/payments";
import { logEventRegistered } from "../../../../firebase/analytics";
import EventDetails from "../../../common/EventDetails";
import EmptyState from "../../../common/EmptyState";
import ShareMenu from "../../../common/ShareMenu";
import PaymentTermsNote from "../../../common/PaymentTermsNote";
import { formatCurrency, formatDateRange, isUpcoming, toDate } from "../../../../utils/format";
import { eventPath } from "../../../LandingPage/Component/Content/Events";

const MAX_GUESTS = 10;

const RegisterDialog = ({ open, onClose, event, onSubmit, busy }) => {
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    if (open) setGuests([]);
  }, [open]);

  const total = eventRegistrationTotal(event, guests.filter((g) => g.name.trim()).length);
  const guestFee = parseFloat(event.guest_amount) || 0;

  const setGuest = (i, key, value) => setGuests((list) => list.map((g, idx) => (idx === i ? { ...g, [key]: value } : g)));

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Register for {event.name}
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, mt: 0.5 }}>
          {formatDateRange(event.start_date, event.end_date)}
          {event.location ? ` · ${event.location}` : ""}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle1">Bringing guests?</Typography>
            <Typography variant="body2" color="text.secondary">
              {guestFee > 0 ? `${formatCurrency(guestFee)} per guest` : "Family and friends are welcome."}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              aria-label="Remove guest"
              onClick={() => setGuests((g) => g.slice(0, -1))}
              disabled={guests.length === 0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <RemoveRoundedIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>{guests.length}</Typography>
            <IconButton
              aria-label="Add guest"
              onClick={() => setGuests((g) => [...g, { name: "", phone: "" }])}
              disabled={guests.length >= MAX_GUESTS}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
        {guests.length > 0 && (
          <Stack spacing={1.5} sx={{ mt: 2.5 }}>
            {guests.map((g, i) => (
              <Stack key={i} direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField size="small" label={`Guest ${i + 1} name`} value={g.name} onChange={(e) => setGuest(i, "name", e.target.value)} fullWidth required />
                <TextField size="small" label="Phone (optional)" value={g.phone} onChange={(e) => setGuest(i, "phone", e.target.value)} fullWidth inputProps={{ inputMode: "tel" }} />
              </Stack>
            ))}
            <Typography variant="caption" color="text.secondary">
              Guests without a name aren't counted.
            </Typography>
          </Stack>
        )}
        <Divider sx={{ my: 2.5 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="h5">{total > 0 ? formatCurrency(total) : "Free"}</Typography>
        </Stack>
        {total > 0 && <PaymentTermsNote sx={{ textAlign: "left" }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={() => onSubmit(guests)} disabled={busy}>
          {busy ? "Please wait…" : total > 0 ? `Continue to pay ${formatCurrency(total)}` : "Confirm registration"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/** /dashboard/event/:eventName — event details with registration. */
const EventData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventName } = useParams();
  const { currentUser, userProfile, displayName } = useAuth();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const stateId = typeof location.state === "string" ? location.state : null;

  const loadRegistration = useCallback(
    async (ev) => setRegistration(ev && currentUser ? await getMyRegistration(ev.id, currentUser.uid) : null),
    [currentUser]
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    findEvent({ id: stateId || eventName, slug: eventName })
      .then(async (ev) => {
        if (!alive) return;
        setEvent(ev);
        await loadRegistration(ev);
      })
      .catch(() => alive && setEvent(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [stateId, eventName, loadRegistration]);

  const pay = async (registrationId) => {
    const result = await startPayment({
      purpose: "event",
      refId: registrationId,
      prefill: { name: displayName, email: currentUser?.email || "", contact: userProfile?.phone_number || "" },
    });
    if (result.status === "paid") {
      toast.success("Payment received — you're registered!");
    } else {
      toast.info("Payment not completed. You can finish it any time from this page.");
    }
  };

  const handleRegister = async (guests) => {
    setBusy(true);
    try {
      const { id, free } = await registerForEvent(event, { uid: currentUser.uid, username: displayName, email: currentUser.email }, { guests });
      logEventRegistered(event.id, event.name);
      setDialogOpen(false);
      if (free) {
        toast.success("You're registered! See you there.");
      } else {
        await pay(id);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error?.code?.startsWith("functions/") ? paymentErrorMessage(error) : "Registration failed. Please try again.");
    } finally {
      await loadRegistration(event);
      setBusy(false);
    }
  };

  const handleCompletePayment = async () => {
    setBusy(true);
    try {
      await pay(registration.id);
    } catch (error) {
      toast.error(paymentErrorMessage(error));
    } finally {
      await loadRegistration(event);
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel your registration for this event?")) return;
    setBusy(true);
    try {
      await cancelRegistration(registration.id);
      toast.success("Registration cancelled.");
      setRegistration(null);
    } catch (error) {
      toast.error("Couldn't cancel. Please contact the organisers.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <>
        <Skeleton width={260} height={48} />
        <Skeleton variant="rounded" height={420} sx={{ mt: 2 }} />
      </>
    );
  }

  if (!event) {
    return (
      <EmptyState
        icon={EventRoundedIcon}
        title="Event not found"
        description="It may have been renamed or removed."
        action={
          <Button variant="contained" onClick={() => navigate("/dashboard/addEvents")}>
            Back to events
          </Button>
        }
      />
    );
  }

  const upcoming = isUpcoming(event);
  const deadline = toDate(event.registration_deadline);
  const closed = deadline && deadline.setHours(23, 59, 59, 999) < Date.now();

  const aside = (() => {
    if (registration?.status === "confirmed") {
      return (
        <Stack spacing={1.5}>
          <Alert icon={<CheckCircleRoundedIcon />} severity="success">
            You're registered{registration.guest_count ? ` with ${registration.guest_count} guest${registration.guest_count > 1 ? "s" : ""}` : ""}.
            {registration.payment_status === "paid" && ` Paid ${formatCurrency(registration.amount_paid || registration.total_amount)}.`}
          </Alert>
          {registration.payment_status !== "paid" && upcoming && (
            <Button color="inherit" onClick={handleCancel} disabled={busy}>
              Cancel registration
            </Button>
          )}
        </Stack>
      );
    }
    if (registration?.status === "pending_payment") {
      return (
        <Stack spacing={1.25}>
          <Alert severity="warning">Your spot is reserved — complete payment of {formatCurrency(registration.total_amount)} to confirm.</Alert>
          <Button size="large" variant="contained" onClick={handleCompletePayment} disabled={busy}>
            {busy ? "Opening checkout…" : "Complete payment"}
          </Button>
          <PaymentTermsNote sx={{ mt: 0 }} />
          <Button color="inherit" onClick={handleCancel} disabled={busy}>
            Cancel registration
          </Button>
        </Stack>
      );
    }
    if (!upcoming) return <Alert severity="info">This event has ended.</Alert>;
    if (closed) return <Alert severity="info">Registration has closed.</Alert>;
    return (
      <Button size="large" variant="contained" fullWidth onClick={() => setDialogOpen(true)} disabled={busy}>
        Register now
      </Button>
    );
  })();

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/dashboard/addEvents")} color="inherit">
          All events
        </Button>
        <ShareMenu url={`${window.location.origin}${eventPath(event)}`} title={event.name} size="medium" />
      </Stack>
      <Typography variant="overline" color="primary" component="p">
        {upcoming ? "Upcoming event" : "Past event"}
      </Typography>
      <Typography variant="h3" component="h1" sx={{ mb: 4 }}>
        {event.name || event.title}
      </Typography>
      <EventDetails event={event} aside={aside} />
      <RegisterDialog open={dialogOpen} onClose={() => setDialogOpen(false)} event={event} onSubmit={handleRegister} busy={busy} />
    </>
  );
};

export default EventData;

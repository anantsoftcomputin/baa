import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { toast } from "react-toastify";
import { getAllEvents, createEvent, updateEvent, deleteEvent, getEventRegistrations } from "../../../firebase/firestore";
import { uploadEventImage } from "../../../firebase/storage";
import { formatCurrency, formatDate, imageOf, isUpcoming } from "../../../utils/format";
import { logAdminAction } from "../../../firebase/analytics";

const EMPTY = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  location: "",
  registration_deadline: "",
  amount: "",
  guest_amount: "",
  imageFile: null,
};

const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const downloadCsv = (event, rows) => {
  const header = ["Name", "Email", "Guests", "Guest names", "Status", "Payment", "Amount", "Registered on"];
  const lines = rows.map((r) =>
    [
      r.username,
      r.email,
      r.guest_count || 0,
      (r.guests || []).map((g) => [g.name, g.phone].filter(Boolean).join(" ")).join("; "),
      r.status,
      r.payment_status,
      r.amount_paid || r.total_amount || 0,
      formatDate(r.createdAt),
    ]
      .map(csvCell)
      .join(",")
  );
  const blob = new Blob([[header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(event.name || "event").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-registrations.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const RegistrationsDialog = ({ event, onClose }) => {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!event) return;
    setRows(null);
    getEventRegistrations(event.id)
      .then(setRows)
      .catch(() => {
        toast.error("Couldn't load registrations");
        setRows([]);
      });
  }, [event]);

  const confirmed = (rows || []).filter((r) => r.status === "confirmed");
  const headcount = confirmed.reduce((n, r) => n + 1 + (r.guest_count || 0), 0);
  const collected = confirmed.reduce((n, r) => n + (r.payment_status === "paid" ? Number(r.amount_paid || r.total_amount) || 0 : 0), 0);

  return (
    <Dialog open={!!event} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Registrations — {event?.name}</DialogTitle>
      <DialogContent dividers>
        {rows === null ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <Chip label={`${confirmed.length} confirmed`} color="secondary" />
              <Chip label={`${headcount} expected attendees`} />
              <Chip label={`${rows.length - confirmed.length} awaiting payment`} color="warning" variant="outlined" />
              {collected > 0 && <Chip label={`${formatCurrency(collected)} collected`} variant="outlined" />}
            </Stack>
            <Box sx={{ height: 420 }}>
              <DataGrid
                rows={rows}
                density="compact"
                columns={[
                  { field: "username", headerName: "Name", flex: 1, minWidth: 140 },
                  { field: "email", headerName: "Email", flex: 1.2, minWidth: 180 },
                  { field: "guest_count", headerName: "Guests", width: 80 },
                  {
                    field: "status",
                    headerName: "Status",
                    width: 150,
                    renderCell: (p) => (
                      <Chip
                        size="small"
                        label={p.value === "confirmed" ? (p.row.payment_status === "paid" ? "Paid" : "Confirmed") : "Payment pending"}
                        color={p.value === "confirmed" ? "secondary" : "warning"}
                      />
                    ),
                  },
                  { field: "total_amount", headerName: "Amount", width: 110, valueFormatter: (value) => (value ? formatCurrency(value) : "Free") },
                ]}
                disableRowSelectionOnClick
              />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button startIcon={<DownloadRoundedIcon />} disabled={!rows?.length} onClick={() => downloadCsv(event, rows)}>
          Export CSV
        </Button>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [registrationsFor, setRegistrationsFor] = useState(null);
  const [formData, setFormData] = useState(EMPTY);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      setEvents(await getAllEvents());
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    }
    setLoading(false);
  };

  const handleOpenDialog = (event = null) => {
    setEditingEvent(event);
    setFormData(
      event
        ? {
            ...EMPTY,
            ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, event[k] ?? EMPTY[k]])),
            name: event.name || event.title || "",
            amount: event.amount ? String(event.amount) : "",
            guest_amount: event.guest_amount ? String(event.guest_amount) : "",
            imageFile: null,
          }
        : EMPTY
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.start_date) {
      toast.error("Name and start date are required.");
      return;
    }
    const badDate = ["start_date", "end_date", "registration_deadline"].find(
      (k) => formData[k] && !/^\d{4}-\d{2}-\d{2}$/.test(formData[k])
    );
    if (badDate) {
      toast.error("Please enter valid dates (use the date picker).");
      return;
    }
    if (formData.end_date && formData.end_date < formData.start_date) {
      toast.error("End date can't be before the start date.");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = imageOf(editingEvent) || "";
      if (formData.imageFile) {
        imageUrl = await uploadEventImage(editingEvent?.id || "new", formData.imageFile);
      }

      const eventData = {
        name: formData.name.trim(),
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        registration_deadline: formData.registration_deadline,
        amount: toNumber(formData.amount),
        guest_amount: toNumber(formData.guest_amount),
        image: imageUrl,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        logAdminAction("update", "event", editingEvent.id);
        toast.success("Event updated");
      } else {
        const { id } = await createEvent(eventData);
        logAdminAction("create", "event", id);
        toast.success("Event created");
      }
      handleCloseDialog();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    }
    setSaving(false);
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.name}"? Registrations will remain in the database.`)) return;
    setLoading(true);
    try {
      await deleteEvent(event.id);
      logAdminAction("delete", "event", event.id);
      toast.success("Event deleted");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
    setLoading(false);
  };

  const columns = [
    { field: "name", headerName: "Event", flex: 1.4, minWidth: 200, valueGetter: (value, row) => value || row.title },
    { field: "start_date", headerName: "Date", width: 130, valueFormatter: (value) => formatDate(value) },
    { field: "location", headerName: "Venue", flex: 1, minWidth: 140 },
    { field: "amount", headerName: "Fee", width: 100, valueFormatter: (value) => (Number(value) > 0 ? formatCurrency(value) : "Free") },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      sortable: false,
      renderCell: (p) => <Chip size="small" label={isUpcoming(p.row) ? "Upcoming" : "Past"} color={isUpcoming(p.row) ? "secondary" : "default"} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      align: "right",
      renderCell: (params) => (
        <Box>
          <Tooltip title="Registrations">
            <IconButton size="small" onClick={() => setRegistrationsFor(params.row)}>
              <HowToRegRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row)}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5">Events</Typography>
          <Typography variant="body2" color="text.secondary">
            Create events, set fees, and see who's coming.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => handleOpenDialog()}>
          New event
        </Button>
      </Stack>

      <Box sx={{ height: 520 }}>
        <DataGrid rows={events} columns={columns} loading={loading} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingEvent ? "Edit event" : "New event"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Event name" name="name" value={formData.name} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline minRows={4} />
            </Grid>
            {[
              ["start_date", "Start date", "date"],
              ["end_date", "End date", "date"],
              ["start_time", "Start time", "time"],
              ["end_time", "End time", "time"],
            ].map(([name, label, type]) => (
              <Grid item xs={12} sm={6} key={name}>
                <TextField fullWidth label={label} name={name} type={type} value={formData[name]} onChange={handleChange} InputLabelProps={{ shrink: true }} required={name === "start_date"} />
              </Grid>
            ))}
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label="Venue" name="location" value={formData.location} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Registration closes" name="registration_deadline" type="date" value={formData.registration_deadline} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fee per alumnus"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                helperText="Leave empty for a free event"
                inputProps={{ inputMode: "decimal" }}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fee per guest"
                name="guest_amount"
                value={formData.guest_amount}
                onChange={handleChange}
                helperText="Optional"
                inputProps={{ inputMode: "decimal" }}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="outlined" component="label" startIcon={<CloudUploadRoundedIcon />}>
                  {imageOf(editingEvent) ? "Replace banner image" : "Upload banner image"}
                  <input hidden type="file" accept="image/*" onChange={(e) => setFormData((f) => ({ ...f, imageFile: e.target.files[0] }))} />
                </Button>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {formData.imageFile ? formData.imageFile.name : imageOf(editingEvent) ? "Current image kept" : "No image yet"}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? "Saving…" : editingEvent ? "Save changes" : "Create event"}
          </Button>
        </DialogActions>
      </Dialog>

      <RegistrationsDialog event={registrationsFor} onClose={() => setRegistrationsFor(null)} />
    </Box>
  );
};

export default EventsManager;

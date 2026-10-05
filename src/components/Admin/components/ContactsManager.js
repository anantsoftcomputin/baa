import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import ForwardToInboxRoundedIcon from "@mui/icons-material/ForwardToInboxRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import { toast } from "react-toastify";
import { getContactSubmissions, updateContactStatus, deleteContactSubmission } from "../../../firebase/firestore";
import AdminStat from "./AdminStat";
import { formatDate, toDate } from "../../../utils/format";

export const GROUPS = {
  general: "General inquiry",
  membership: "Membership",
  events: "Events",
  alumni: "Alumni relations",
  support: "Website support",
};

const STATUSES = [
  { value: "new", label: "New", color: "error" },
  { value: "contacted", label: "Contacted", color: "warning" },
  { value: "resolved", label: "Resolved", color: "success" },
];


const Detail = ({ label, children }) =>
  children ? (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </Typography>
      <Typography sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>{children}</Typography>
    </Box>
  ) : null;

/** Messages sent through the website's contact form. */
const ContactsManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setContacts(await getContactSubmissions());
    } catch (e) {
      console.error("Error fetching contacts:", e);
      toast.error("Couldn't load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const count = (s) => contacts.filter((c) => (c.status || "new") === s).length;
    return { total: contacts.length, new: count("new"), contacted: count("contacted"), resolved: count("resolved") };
  }, [contacts]);

  const setStatus = async (contact, status) => {
    const before = contact.status;
    setContacts((list) => list.map((c) => (c.id === contact.id ? { ...c, status } : c)));
    setViewing((v) => (v && v.id === contact.id ? { ...v, status } : v));
    try {
      await updateContactStatus(contact.id, status);
    } catch (e) {
      setContacts((list) => list.map((c) => (c.id === contact.id ? { ...c, status: before } : c)));
      toast.error("Couldn't update the status");
    }
  };

  const remove = async () => {
    const c = confirmDelete;
    try {
      await deleteContactSubmission(c.id);
      setContacts((list) => list.filter((x) => x.id !== c.id));
      setViewing(null);
      toast.success("Message deleted");
    } catch (e) {
      toast.error("Couldn't delete the message");
    } finally {
      setConfirmDelete(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = contacts.filter((c) => {
    if (statusFilter !== "all" && (c.status || "new") !== statusFilter) return false;
    if (groupFilter !== "all" && (c.group || "general") !== groupFilter) return false;
    if (!q) return true;
    return [c.name, c.email, c.phone, c.message, c.address].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const columns = [
    {
      field: "name",
      headerName: "From",
      flex: 1,
      minWidth: 200,
      renderCell: (p) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: (p.row.status || "new") === "new" ? 800 : 600 }} noWrap>
            {p.value || "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {p.row.email}
          </Typography>
        </Box>
      ),
    },
    { field: "group", headerName: "Topic", width: 150, valueGetter: (value) => GROUPS[value || "general"] || value },
    { field: "message", headerName: "Message", flex: 1.6, minWidth: 220, valueGetter: (value) => value || "—" },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (p) => (
        <Select
          size="small"
          value={p.row.status || "new"}
          onChange={(e) => setStatus(p.row, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          inputProps={{ "aria-label": "Status" }}
          sx={{ fontSize: "0.85rem", minWidth: 128 }}
        >
          {STATUSES.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              <Chip size="small" label={s.label} color={s.color} sx={{ pointerEvents: "none" }} />
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: "createdAt",
      headerName: "Received",
      width: 120,
      valueGetter: (value) => toDate(value)?.getTime() || 0,
      valueFormatter: (value) => (value ? formatDate(value) : "—"),
    },
    {
      field: "actions",
      headerName: "",
      width: 96,
      sortable: false,
      align: "right",
      renderCell: (p) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" aria-label={`View message from ${p.row.name}`} onClick={() => setViewing(p.row)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" aria-label={`Delete message from ${p.row.name}`} onClick={() => setConfirmDelete(p.row)}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5">Messages</Typography>
        <Typography variant="body2" color="text.secondary">
          Messages sent through the website's contact form.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={6} md={3}>
          <AdminStat label="All messages" value={stats.total} icon={MailRoundedIcon} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
        </Grid>
        <Grid item xs={6} md={3}>
          <AdminStat label="New" value={stats.new} icon={FiberNewRoundedIcon} color="error.main" active={statusFilter === "new"} onClick={() => setStatusFilter("new")} />
        </Grid>
        <Grid item xs={6} md={3}>
          <AdminStat label="Contacted" value={stats.contacted} icon={ForwardToInboxRoundedIcon} color="warning.main" active={statusFilter === "contacted"} onClick={() => setStatusFilter("contacted")} />
        </Grid>
        <Grid item xs={6} md={3}>
          <AdminStat label="Resolved" value={stats.resolved} icon={TaskAltRoundedIcon} color="success.main" active={statusFilter === "resolved"} onClick={() => setStatusFilter("resolved")} />
        </Grid>
      </Grid>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search name, email, phone or message…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select size="small" label="Topic" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} sx={{ minWidth: 190 }}>
          <MenuItem value="all">All topics</MenuItem>
          {Object.entries(GROUPS).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataGrid
        autoHeight
        rows={filtered}
        columns={columns}
        loading={loading}
        rowHeight={60}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableRowSelectionOnClick
        localeText={{ noRowsLabel: contacts.length ? "No messages match these filters" : "No messages yet" }}
        sx={{ "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" } }}
      />

      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        {viewing && (
          <>
            <DialogTitle>
              Message from {viewing.name}
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
                {GROUPS[viewing.group || "general"] || viewing.group} · {formatDate(viewing.createdAt) || "—"}
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Detail label="Message">{viewing.message || "(no message)"}</Detail>
                <Detail label="Email">{viewing.email}</Detail>
                <Detail label="Phone">{viewing.phone}</Detail>
                <Detail label="City / address">{viewing.address}</Detail>
                <TextField select size="small" label="Status" value={viewing.status || "new"} onChange={(e) => setStatus(viewing, e.target.value)} sx={{ maxWidth: 200 }}>
                  {STATUSES.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </TextField>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button color="error" onClick={() => setConfirmDelete(viewing)} sx={{ mr: "auto" }}>
                Delete
              </Button>
              {viewing.email && (
                <Button
                  variant="contained"
                  startIcon={<ReplyRoundedIcon />}
                  href={`mailto:${viewing.email}?subject=${encodeURIComponent("Re: your message to the BAA Alumni Association")}`}
                  onClick={() => (viewing.status || "new") === "new" && setStatus(viewing, "contacted")}
                >
                  Reply by email
                </Button>
              )}
              <Button onClick={() => setViewing(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this message?</DialogTitle>
        <DialogContent>
          <DialogContentText>The message from {confirmDelete?.name} will be permanently deleted.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={remove}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactsManager;

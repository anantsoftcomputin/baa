import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import { toast } from "react-toastify";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../contexts/AuthContext";
import { getBatchYear, getUsersByYear } from "../../../firebase/firestore";
import { logAdminAction } from "../../../firebase/analytics";
import UserAvatar from "../../common/UserAvatar";
import AdminStat from "./AdminStat";
import { formatDate, toDate } from "../../../utils/format";

const ROLES = ["User", "Admin", "Superuser"];
const roleColor = { Superuser: "error", Admin: "warning" };
const isAdminRole = (r) => r === "Admin" || r === "Superuser";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const exportCsv = (users) => {
  const header = ["Name", "Email", "Batch", "Role", "Member", "Email verified", "Phone", "City", "Company", "Joined"];
  const lines = users.map((u) =>
    [u.username, u.email, getBatchYear(u), u.userRole || "User", u.is_member ? "Yes" : "No", u.emailVerified ? "Yes" : "No", u.phone_number, u.city, u.company, formatDate(u.createdAt)]
      .map(csvCell)
      .join(",")
  );
  const blob = new Blob([[header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `baa-members-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { isSuperuser, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch everyone and sort here: a database orderBy would silently drop
      // profiles that have no createdAt field.
      const all = await getUsersByYear();
      all.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
      setUsers(all);
    } catch (e) {
      console.error("Error fetching users:", e);
      toast.error("Couldn't load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: users.length,
      members: users.filter((u) => u.is_member).length,
      admins: users.filter((u) => isAdminRole(u.userRole)).length,
      verified: users.filter((u) => u.emailVerified).length,
    }),
    [users]
  );

  const q = search.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && (u.userRole || "User") !== roleFilter) return false;
    if (memberFilter === "members" && !u.is_member) return false;
    if (memberFilter === "non-members" && u.is_member) return false;
    if (!q) return true;
    return [u.username, u.email, getBatchYear(u), u.company, u.city, u.phone_number].filter(Boolean).join(" ").toLowerCase().includes(q);
  });

  const original = editing && users.find((u) => u.id === editing.id);
  const isSelf = editing?.id === currentUser?.uid;

  const save = async () => {
    setSaving(true);
    try {
      const updates = {};
      if (!!editing.is_member !== !!original.is_member) {
        updates.is_member = !!editing.is_member;
        updates.membershipDate = editing.is_member ? serverTimestamp() : null;
      }
      if (isSuperuser && !isSelf && (editing.userRole || "User") !== (original.userRole || "User")) {
        updates.userRole = editing.userRole;
      }
      if (Object.keys(updates).length === 0) {
        setEditing(null);
        setSaving(false);
        return;
      }
      await updateDoc(doc(db, "users", editing.id), updates);
      logAdminAction("update", "user", editing.id);
      toast.success("User updated");
      setEditing(null);
      load();
    } catch (e) {
      console.error("Error updating user:", e);
      toast.error(e?.code === "permission-denied" ? "You don't have permission to make that change." : "Couldn't update the user.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const user = confirmDelete;
    try {
      await deleteDoc(doc(db, "users", user.id));
      logAdminAction("delete", "user", user.id);
      toast.success("Profile deleted");
      setUsers((list) => list.filter((u) => u.id !== user.id));
    } catch (e) {
      toast.error("Couldn't delete the profile.");
    } finally {
      setConfirmDelete(null);
    }
  };

  const canDelete = (u) => u.id !== currentUser?.uid && (isSuperuser || !isAdminRole(u.userRole));

  const columns = [
    {
      field: "username",
      headerName: "Member",
      flex: 1.3,
      minWidth: 220,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <UserAvatar user={p.row} size={34} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
              {p.value || "—"}
              {p.row.id === currentUser?.uid ? " (you)" : ""}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {p.row.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { field: "batch", headerName: "Batch", width: 90, valueGetter: (_, row) => getBatchYear(row) || "" },
    {
      field: "userRole",
      headerName: "Role",
      width: 120,
      valueGetter: (value) => value || "User",
      renderCell: (p) => <Chip size="small" label={p.value} color={roleColor[p.value] || "default"} />,
    },
    {
      field: "is_member",
      headerName: "Member",
      width: 95,
      type: "boolean",
      renderCell: (p) => (p.value ? <CheckCircleRoundedIcon color="secondary" fontSize="small" /> : <RemoveCircleOutlineRoundedIcon sx={{ color: "text.disabled" }} fontSize="small" />),
    },
    {
      field: "emailVerified",
      headerName: "Verified",
      width: 95,
      type: "boolean",
      renderCell: (p) => (p.value ? <CheckCircleRoundedIcon color="success" fontSize="small" /> : <RemoveCircleOutlineRoundedIcon sx={{ color: "text.disabled" }} fontSize="small" />),
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 120,
      valueGetter: (value) => toDate(value)?.getTime() || 0,
      valueFormatter: (value) => (value ? formatDate(value) : "—"),
    },
    {
      field: "actions",
      headerName: "",
      width: 130,
      sortable: false,
      align: "right",
      renderCell: (p) => (
        <Box>
          <Tooltip title="View profile">
            <IconButton size="small" aria-label="View profile" onClick={() => navigate(`/dashboard/userProfile/${p.row.id}`)}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit role & membership">
            <IconButton size="small" aria-label={`Edit ${p.row.username || "user"}`} onClick={() => setEditing({ ...p.row, userRole: p.row.userRole || "User" })}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={canDelete(p.row) ? "Delete profile" : "Can't delete this account"}>
            <span>
              <IconButton size="small" color="error" aria-label={`Delete ${p.row.username || "user"}`} disabled={!canDelete(p.row)} onClick={() => setConfirmDelete(p.row)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h5">Users</Typography>
          <Typography variant="body2" color="text.secondary">
            Grant membership{isSuperuser ? ", change roles" : ""} and manage member profiles.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
          Export CSV
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={6} md={3}>
          <AdminStat label="All users" value={stats.total} icon={GroupsRoundedIcon} onClick={() => { setRoleFilter("all"); setMemberFilter("all"); }} />
        </Grid>
        <Grid item xs={6} md={3}>
          <AdminStat label="Lifetime members" value={stats.members} icon={WorkspacePremiumRoundedIcon} color="secondary.main" active={memberFilter === "members"} onClick={() => setMemberFilter(memberFilter === "members" ? "all" : "members")} />
        </Grid>
        <Grid item xs={6} md={3}>
          <AdminStat label="Admins & superusers" value={stats.admins} icon={AdminPanelSettingsRoundedIcon} color="warning.main" />
        </Grid>
        <Grid item xs={6} md={3}>
          <AdminStat label="Verified emails" value={stats.verified} icon={MarkEmailReadRoundedIcon} color="info.main" />
        </Grid>
      </Grid>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search name, email, batch, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select size="small" label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">All roles</MenuItem>
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Membership" value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} sx={{ minWidth: 170 }}>
          <MenuItem value="all">Everyone</MenuItem>
          <MenuItem value="members">Members only</MenuItem>
          <MenuItem value="non-members">Non-members</MenuItem>
        </TextField>
      </Stack>

      <DataGrid
        autoHeight
        rows={filtered}
        columns={columns}
        loading={loading}
        rowHeight={60}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        disableRowSelectionOnClick
        localeText={{ noRowsLabel: "No users match these filters" }}
        sx={{ "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" } }}
      />

      <Dialog open={!!editing} onClose={() => !saving && setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit user</DialogTitle>
        <DialogContent dividers>
          {editing && (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <UserAvatar user={editing} size={44} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>{editing.username || "—"}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{editing.email}</Typography>
                </Box>
              </Stack>
              <TextField
                select
                label="Role"
                value={editing.userRole}
                onChange={(e) => setEditing({ ...editing, userRole: e.target.value })}
                disabled={!isSuperuser || isSelf}
                helperText={!isSuperuser ? "Only a Superuser can change roles." : isSelf ? "You can't change your own role." : "Admins can manage content; Superusers can also change roles."}
              >
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={<Switch checked={!!editing.is_member} onChange={(e) => setEditing({ ...editing, is_member: e.target.checked })} />}
                label={editing.is_member ? "Lifetime member" : "Not a member"}
              />
              {original?.is_member && !editing.is_member && (
                <Typography variant="caption" color="warning.main">
                  This removes the member badge. Fees are not refunded through this screen.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete this profile?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDelete?.username || confirmDelete?.email}'s profile will be removed from the directory. Their sign-in account itself
            can only be removed from the Firebase console (Authentication).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={remove}>Delete profile</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

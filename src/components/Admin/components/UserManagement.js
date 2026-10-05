import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormHelperText,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../contexts/AuthContext";

const UserManagement = () => {
  const { isSuperuser, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    members: 0,
    admins: 0,
    verified: 0,
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchQuery, roleFilter, memberFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      calculateStats(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      members: data.filter((u) => u.is_member).length,
      admins: data.filter((u) => u.userRole === "Admin" || u.userRole === "Superuser").length,
      verified: data.filter((u) => u.emailVerified).length,
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.batchyear?.toString().includes(searchQuery)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.userRole === roleFilter);
    }

    // Member filter
    if (memberFilter === "members") {
      filtered = filtered.filter((user) => user.is_member === true);
    } else if (memberFilter === "non-members") {
      filtered = filtered.filter((user) => !user.is_member);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenDialog = (user) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);
      const original = users.find((u) => u.id === editingUser.id) || {};
      const updates = { is_member: !!editingUser.is_member };
      if (updates.is_member && !original.is_member) updates.membershipDate = serverTimestamp();
      // Only Superusers may change roles (enforced by the security rules too).
      if (isSuperuser && (editingUser.userRole || "User") !== (original.userRole || "User")) {
        updates.userRole = editingUser.userRole;
      }
      await updateDoc(doc(db, "users", editingUser.id), updates);
      toast.success("User updated successfully!");
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (
      !window.confirm(
        `Delete the profile of "${username}"? This removes them from the directory but does not delete their sign-in account (do that in the Firebase console).`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, "users", userId));
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Superuser":
        return "error";
      case "Admin":
        return "warning";
      default:
        return "default";
    }
  };

  const columns = [
    {
      field: "username",
      headerName: "Username",
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar src={params.row.photoURL} sx={{ width: 32, height: 32 }}>
            {params.value?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Typography variant="body2" fontWeight="bold">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailIcon sx={{ fontSize: 18, color: "#1976d2" }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "batchyear",
      headerName: "Batch Year",
      width: 100,
      align: "center",
    },
    {
      field: "userRole",
      headerName: "Role",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || "User"}
          color={getRoleColor(params.value)}
          size="small"
          icon={params.value === "Admin" || params.value === "Superuser" ? <AdminIcon /> : <PersonIcon />}
        />
      ),
    },
    {
      field: "is_member",
      headerName: "Member",
      width: 100,
      align: "center",
      renderCell: (params) => (
        params.value ? (
          <CheckCircleIcon sx={{ color: "success.main" }} />
        ) : (
          <CancelIcon sx={{ color: "error.main" }} />
        )
      ),
    },
    {
      field: "emailVerified",
      headerName: "Verified",
      width: 100,
      align: "center",
      renderCell: (params) => (
        params.value ? (
          <CheckCircleIcon sx={{ color: "success.main" }} />
        ) : (
          <CancelIcon sx={{ color: "error.main" }} />
        )
      ),
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 120,
      renderCell: (params) => {
        if (!params.value) return "N/A";
        const date = params.value?.toDate ? params.value.toDate() : new Date(params.value);
        return date.toLocaleDateString();
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit User">
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              onClick={() => handleDeleteUser(params.row.id, params.row.username)}
              disabled={params.row.userRole === "Superuser" || params.row.id === currentUser?.uid}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(160deg, #17212E 0%, #0E1620 100%)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="white">
                    Total Users
                  </Typography>
                </Box>
                <GroupIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.3)" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #E8851F 0%, #D9611A 100%)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats.members}
                  </Typography>
                  <Typography variant="body2" color="white">
                    Members
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.3)" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #2BA6DE 0%, #1F7FB0 100%)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats.admins}
                  </Typography>
                  <Typography variant="body2" color="white">
                    Admins
                  </Typography>
                </Box>
                <AdminIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.3)" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #1F5B3F 0%, #143D2A 100%)" }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats.verified}
                  </Typography>
                  <Typography variant="body2" color="white">
                    Verified
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 48, color: "rgba(255,255,255,0.3)" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by username, email, or batch year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Role Filter</InputLabel>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} label="Role Filter">
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Superuser">Superuser</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Membership</InputLabel>
              <Select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} label="Membership">
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="members">Members Only</MenuItem>
                <MenuItem value="non-members">Non-Members</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredUsers}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={loading}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Username"
              value={editingUser?.username || ""}
              disabled
              fullWidth
            />
            <TextField
              label="Email"
              value={editingUser?.email || ""}
              disabled
              fullWidth
            />
            <FormControl fullWidth disabled={!isSuperuser}>
              <InputLabel>Role</InputLabel>
              <Select
                value={editingUser?.userRole || "User"}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, userRole: e.target.value })
                }
                label="Role"
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Superuser">Superuser</MenuItem>
              </Select>
              {!isSuperuser && <FormHelperText>Only a Superuser can change roles.</FormHelperText>}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Membership Status</InputLabel>
              <Select
                value={editingUser?.is_member ? "member" : "non-member"}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    is_member: e.target.value === "member",
                  })
                }
                label="Membership Status"
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="non-member">Non-Member</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
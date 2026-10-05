import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import {
  getContactSubmissions,
  updateContactStatus,
  deleteContactSubmission,
} from "../../../firebase/firestore";
import { toast } from "react-toastify";

const ContactsManager = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    resolved: 0,
    byGroup: {},
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contacts, searchQuery, statusFilter, groupFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await getContactSubmissions();
      setContacts(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      new: data.filter((c) => c.status === "new").length,
      contacted: data.filter((c) => c.status === "contacted").length,
      resolved: data.filter((c) => c.status === "resolved").length,
      byGroup: {},
    };

    data.forEach((contact) => {
      const group = contact.group || "general";
      stats.byGroup[group] = (stats.byGroup[group] || 0) + 1;
    });

    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...contacts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone?.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((contact) => contact.status === statusFilter);
    }

    // Group filter
    if (groupFilter !== "all") {
      filtered = filtered.filter((contact) => (contact.group || "general") === groupFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await updateContactStatus(contactId, newStatus);
      toast.success("Status updated successfully");
      fetchContacts();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContactSubmission(contactId);
        toast.success("Contact deleted successfully");
        fetchContacts();
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast.error("Failed to delete contact");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "error";
      case "contacted":
        return "warning";
      case "resolved":
        return "success";
      default:
        return "default";
    }
  };

  const getGroupColor = (group) => {
    const colors = {
      general: "#757575",
      membership: "#1976d2",
      events: "#f57c00",
      alumni: "#7b1fa2",
      support: "#388e3c",
    };
    return colors[group] || "#757575";
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PersonIcon sx={{ mr: 1, color: "#fba645" }} />
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <EmailIcon sx={{ mr: 1, color: "#1976d2", fontSize: 18 }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PhoneIcon sx={{ mr: 1, color: "#388e3c", fontSize: 18 }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "address",
      headerName: "Address",
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || ""}>
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "group",
      headerName: "Group",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || "general"}
          size="small"
          icon={<GroupIcon />}
          sx={{
            backgroundColor: getGroupColor(params.value || "general"),
            color: "#fff",
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <FormControl size="small" fullWidth>
          <Select
            value={params.value || "new"}
            onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
            sx={{ fontSize: "0.875rem" }}
          >
            <MenuItem value="new">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PendingIcon sx={{ mr: 1, fontSize: 18 }} />
                New
              </Box>
            </MenuItem>
            <MenuItem value="contacted">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmailIcon sx={{ mr: 1, fontSize: 18 }} />
                Contacted
              </Box>
            </MenuItem>
            <MenuItem value="resolved">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckCircleIcon sx={{ mr: 1, fontSize: 18 }} />
                Resolved
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 150,
      valueGetter: (params) => {
        if (params?.seconds) {
          return new Date(params.seconds * 1000).toLocaleDateString();
        }
        return "N/A";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="#fba645">
        Contact Submissions
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
            }}
          >
            <CardContent>
              <Typography variant="h3" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2">Total Contacts</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "#fff",
            }}
          >
            <CardContent>
              <Typography variant="h3" fontWeight="bold">
                {stats.new}
              </Typography>
              <Typography variant="body2">New Submissions</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #fba645 0%, #f76b1c 100%)",
              color: "#fff",
            }}
          >
            <CardContent>
              <Typography variant="h3" fontWeight="bold">
                {stats.contacted}
              </Typography>
              <Typography variant="body2">Contacted</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "#fff",
            }}
          >
            <CardContent>
              <Typography variant="h3" fontWeight="bold">
                {stats.resolved}
              </Typography>
              <Typography variant="body2">Resolved</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Group Statistics */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Contacts by Group
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
          {Object.entries(stats.byGroup).map(([group, count]) => (
            <Chip
              key={group}
              label={`${group}: ${count}`}
              icon={<GroupIcon />}
              sx={{
                backgroundColor: getGroupColor(group),
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1rem",
                padding: "10px",
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: "#fba645" }} />
          <Typography variant="h6" fontWeight="bold">
            Filters
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or phone..."
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Group</InputLabel>
              <Select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                label="Group"
              >
                <MenuItem value="all">All Groups</MenuItem>
                <MenuItem value="general">General Inquiry</MenuItem>
                <MenuItem value="membership">Membership</MenuItem>
                <MenuItem value="events">Events</MenuItem>
                <MenuItem value="alumni">Alumni Relations</MenuItem>
                <MenuItem value="support">Support</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        <DataGrid
          rows={filteredContacts}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          autoHeight
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#fef9f5",
              fontWeight: "bold",
              borderBottom: "2px solid #fba645",
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default ContactsManager;

import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Paper,
  createTheme,
  CircularProgress,
} from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import ajaxCall from "../../../helpers/ajaxCall";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
  },
});

const InitialData = {
  name: "",
  purpose: "",
  start_date: "",
  end_date: "",
  total_funds_required: "",
  funds_deadline: "",
  status: "",
  current_funds: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AddInitiatives = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(InitialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("purpose", formData.purpose);
    formDataToSend.append("start_date", formData.start_date);
    formDataToSend.append("end_date", formData.end_date);
    formDataToSend.append(
      "total_funds_required",
      formData.total_funds_required
    );
    formDataToSend.append("funds_deadline", formData.funds_deadline);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("current_funds", formData.current_funds);
    formDataToSend.append("created_at", formData.created_at);
    formDataToSend.append("updated_at", formData.updated_at);

    try {
      const response = await ajaxCall(
        `initiatives/initiatives/`,
        {
          method: "POST",
          body: formDataToSend,
        },
        8000
      );
      if ([200, 201].includes(response.status)) {
        toast.success("Initiatives Created Successfully");
        setFormData(InitialData);
      } else {
        toast.error("Some Problem Occurred. Please try again.");
      }
    } catch (error) {
      toast.error("Some Problem Occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
        }}
      >
        <Typography variant="h5">Add Initiatives</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Name"
                name="name"
                value={formData.name}
                size="small"
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                name="purpose"
                value={formData.purpose}
                size="small"
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel id="purpose-label">Status</InputLabel>
                <Select
                  labelId="purpose-label"
                  name="status"
                  value={formData.status}
                  size="small"
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="PLANNED">Planned</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Total Funds Required"
                name="total_funds_required"
                type="number"
                value={formData.total_funds_required}
                size="small"
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={formData.start_date}
                size="small"
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="end_date"
                type="date"
                value={formData.end_date}
                size="small"
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Deadline of Funds Requirement"
                name="funds_deadline"
                type="date"
                value={formData.funds_deadline}
                size="small"
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Registration Deadline"
                name="status"
                type="date"
                value={formData.status}
                size="small"
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} container justifyContent="flex-end">
              {loading ? (
                <CircularProgress sx={{ ml: "auto" }} />
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  onClick={handleSubmit}
                  size="large"
                  sx={{
                    background: "linear-gradient(135deg, #1976d2 0%, #0288d1 100%)",
                    color: "#fff",
                    px: 4,
                    py: 1.5,
                    fontWeight: "bold",
                    borderRadius: "50px",
                    boxShadow: "0 8px 20px rgba(25, 118, 210, 0.4)",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    "&:hover": {
                      transform: "translateY(-3px) scale(1.05)",
                      boxShadow: "0 12px 30px rgba(25, 118, 210, 0.6)",
                    },
                  }}
                >
                  Submit Initiative
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddInitiatives;

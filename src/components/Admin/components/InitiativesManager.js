import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { 
  getAllInitiatives, 
  createInitiative, 
  updateInitiative, 
  deleteInitiative 
} from '../../../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/config';

const InitiativesManager = () => {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    category: '',
    start_date: '',
    end_date: '',
    total_funds_required: '',
    status: 'Active',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const data = await getAllInitiatives();
      setInitiatives(data);
    } catch (error) {
      toast.error('Failed to fetch initiatives');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (initiative = null) => {
    if (initiative) {
      setEditingInitiative(initiative);
      setFormData({
        name: initiative.name || '',
        purpose: initiative.purpose || '',
        category: initiative.category || '',
        start_date: initiative.start_date || '',
        end_date: initiative.end_date || '',
        total_funds_required: initiative.total_funds_required || '',
        status: initiative.status || 'Active',
        imageUrl: initiative.imageUrl || ''
      });
    } else {
      setEditingInitiative(null);
      setFormData({
        name: '',
        purpose: '',
        category: '',
        start_date: '',
        end_date: '',
        total_funds_required: '',
        status: 'Active',
        imageUrl: ''
      });
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInitiative(null);
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl;

    try {
      setUploading(true);
      const storageRef = ref(storage, `initiatives/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.purpose) {
        toast.error('Name and purpose are required');
        return;
      }

      setUploading(true);
      const imageUrl = await uploadImage();
      const dataToSave = { ...formData, imageUrl };

      if (editingInitiative) {
        await updateInitiative(editingInitiative.id, dataToSave);
        toast.success('Initiative updated successfully');
      } else {
        await createInitiative(dataToSave);
        toast.success('Initiative added successfully');
      }

      handleCloseDialog();
      fetchInitiatives();
    } catch (error) {
      toast.error('Failed to save initiative');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this initiative?')) {
      try {
        await deleteInitiative(id);
        toast.success('Initiative deleted successfully');
        fetchInitiatives();
      } catch (error) {
        toast.error('Failed to delete initiative');
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'start_date', headerName: 'Start Date', width: 120 },
    { field: 'end_date', headerName: 'End Date', width: 120 },
    { field: 'total_funds_required', headerName: 'Funding', width: 120 },
    { 
      field: 'purpose', 
      headerName: 'Purpose', 
      width: 250,
      renderCell: (params) => (
        <div style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {params.value}
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            size="small"
            onClick={() => handleOpenDialog(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Initiatives
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Initiative
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={initiatives}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            disableSelectionOnClick
            sx={{ minHeight: 400 }}
          />
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInitiative ? 'Edit Initiative' : 'Add Initiative'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Initiative Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Purpose"
              fullWidth
              required
              multiline
              rows={4}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
            <TextField
              label="Category"
              fullWidth
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              helperText="e.g., Education, Healthcare, Environment"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Total Funds Required"
                fullWidth
                type="number"
                value={formData.total_funds_required}
                onChange={(e) => setFormData({ ...formData, total_funds_required: e.target.value })}
                helperText="e.g., 50000 (amount in ₹)"
              />
              <TextField
                label="Status"
                fullWidth
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                helperText="e.g., Active, Completed, Planned"
              />
            </Box>
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="initiative-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="initiative-image-upload">
                <Button variant="outlined" component="span" fullWidth>
                  {imageFile ? imageFile.name : 'Upload Image'}
                </Button>
              </label>
              {formData.imageUrl && !imageFile && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={formData.imageUrl}
                    alt="Current"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={uploading}>
            {uploading ? <CircularProgress size={24} /> : editingInitiative ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InitiativesManager;

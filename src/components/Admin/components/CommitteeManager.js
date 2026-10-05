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
  Typography,
  CircularProgress,
  Avatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { 
  getCommitteeMembers, 
  addCommitteeMember, 
  updateCommitteeMember, 
  deleteCommitteeMember 
} from '../../../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/config';

const CommitteeManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    description: '',
    imageUrl: '',
    order: 0
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getCommitteeMembers();
      setMembers(data);
    } catch (error) {
      toast.error('Failed to fetch committee members');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        position: member.position || '',
        email: member.email || '',
        phone: member.phone || '',
        description: member.description || '',
        imageUrl: member.imageUrl || '',
        order: member.order || 0
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        position: '',
        email: '',
        phone: '',
        description: '',
        imageUrl: '',
        order: members.length
      });
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMember(null);
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
      const storageRef = ref(storage, `committee/${Date.now()}_${imageFile.name}`);
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
      if (!formData.name || !formData.position) {
        toast.error('Name and position are required');
        return;
      }

      setUploading(true);
      const imageUrl = await uploadImage();
      const dataToSave = { ...formData, imageUrl };

      if (editingMember) {
        await updateCommitteeMember(editingMember.id, dataToSave);
        toast.success('Committee member updated successfully');
      } else {
        await addCommitteeMember(dataToSave);
        toast.success('Committee member added successfully');
      }

      handleCloseDialog();
      fetchMembers();
    } catch (error) {
      toast.error('Failed to save committee member');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this committee member?')) {
      try {
        await deleteCommitteeMember(id);
        toast.success('Committee member deleted successfully');
        fetchMembers();
      } catch (error) {
        toast.error('Failed to delete committee member');
      }
    }
  };

  const columns = [
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 80,
      renderCell: (params) => (
        <Avatar src={params.value} alt={params.row.name} sx={{ width: 40, height: 40 }} />
      )
    },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'position', headerName: 'Position', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'order', headerName: 'Order', width: 100 },
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
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Committee Members
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Member
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={members}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            disableSelectionOnClick
            sx={{ minHeight: 400 }}
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMember ? 'Edit Committee Member' : 'Add Committee Member'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Position"
              fullWidth
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText="Brief bio or description"
            />
            <TextField
              label="Display Order"
              type="number"
              fullWidth
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              helperText="Lower numbers appear first"
            />
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span" fullWidth>
                  {imageFile ? imageFile.name : 'Upload Image'}
                </Button>
              </label>
              {formData.imageUrl && !imageFile && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Avatar
                    src={formData.imageUrl}
                    alt="Current"
                    sx={{ width: 100, height: 100, margin: '0 auto' }}
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
            {uploading ? <CircularProgress size={24} /> : editingMember ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommitteeManager;

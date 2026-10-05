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
  Avatar,
  Rating
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { 
  getTestimonials, 
  addTestimonial, 
  updateTestimonial, 
  deleteTestimonial 
} from '../../../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/config';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    company: '',
    testimonial: '',
    rating: 5,
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (error) {
      toast.error('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name || '',
        designation: testimonial.designation || '',
        company: testimonial.company || '',
        testimonial: testimonial.testimonial || '',
        rating: testimonial.rating || 5,
        imageUrl: testimonial.imageUrl || ''
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        name: '',
        designation: '',
        company: '',
        testimonial: '',
        rating: 5,
        imageUrl: ''
      });
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTestimonial(null);
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
      const storageRef = ref(storage, `testimonials/${Date.now()}_${imageFile.name}`);
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
      if (!formData.name || !formData.testimonial) {
        toast.error('Name and testimonial are required');
        return;
      }

      setUploading(true);
      const imageUrl = await uploadImage();
      const dataToSave = { ...formData, imageUrl };

      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, dataToSave);
        toast.success('Testimonial updated successfully');
      } else {
        await addTestimonial(dataToSave);
        toast.success('Testimonial added successfully');
      }

      handleCloseDialog();
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to save testimonial');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial(id);
        toast.success('Testimonial deleted successfully');
        fetchTestimonials();
      } catch (error) {
        toast.error('Failed to delete testimonial');
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
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'designation', headerName: 'Designation', width: 180 },
    { field: 'company', headerName: 'Company', width: 150 },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 150,
      renderCell: (params) => <Rating value={params.value || 0} readOnly size="small" />
    },
    { 
      field: 'testimonial', 
      headerName: 'Testimonial', 
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
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Testimonials
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Testimonial
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={testimonials}
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
          {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
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
              label="Designation"
              fullWidth
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
            <TextField
              label="Company"
              fullWidth
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <TextField
              label="Testimonial"
              fullWidth
              required
              multiline
              rows={4}
              value={formData.testimonial}
              onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
            />
            <Box>
              <Typography component="legend" sx={{ mb: 1 }}>Rating</Typography>
              <Rating
                value={formData.rating}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, rating: newValue || 0 });
                }}
              />
            </Box>
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="testimonial-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="testimonial-image-upload">
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
            {uploading ? <CircularProgress size={24} /> : editingTestimonial ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestimonialsManager;

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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, CloudUpload } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { 
  getGalleryImages, 
  addGalleryImage, 
  updateGalleryImage, 
  deleteGalleryImage,
  getAllEvents
} from '../../../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/config';

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    batch: '',
    eventId: '',
    eventName: '',
    imageUrl: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchImages();
    fetchEvents();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getGalleryImages();
      setImages(data);
    } catch (error) {
      toast.error('Failed to fetch gallery images');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleOpenDialog = (image = null) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        title: image.title || '',
        description: image.description || '',
        category: image.category || '',
        batch: image.batch || '',
        eventId: image.eventId || '',
        eventName: image.eventName || '',
        imageUrl: image.imageUrl || ''
      });
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        batch: '',
        eventId: '',
        eventName: '',
        imageUrl: ''
      });
    }
    setImageFiles([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingImage(null);
    setImageFiles([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(files);
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return formData.imageUrl ? [formData.imageUrl] : [];

    try {
      setUploading(true);
      const uploadPromises = imageFiles.map(async (file) => {
        const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title) {
        toast.error('Title is required');
        return;
      }

      if (imageFiles.length === 0 && !formData.imageUrl) {
        toast.error('Please upload at least one image');
        return;
      }

      setUploading(true);
      const imageUrls = await uploadImages();

      // If editing, only one image
      if (editingImage) {
        const dataToSave = { 
          ...formData, 
          imageUrl: imageUrls[0] || formData.imageUrl 
        };
        await updateGalleryImage(editingImage.id, dataToSave);
        toast.success('Gallery image updated successfully');
      } else {
        // For new images, create multiple entries if multiple images
        const uploadPromises = imageUrls.map((imageUrl, index) => {
          const dataToSave = {
            title: imageFiles.length > 1 ? `${formData.title} ${index + 1}` : formData.title,
            description: formData.description,
            category: formData.category,
            batch: formData.batch,
            eventId: formData.eventId,
            eventName: formData.eventName,
            imageUrl
          };
          return addGalleryImage(dataToSave);
        });

        await Promise.all(uploadPromises);
        toast.success(`${imageUrls.length} image(s) added successfully`);
      }

      handleCloseDialog();
      fetchImages();
    } catch (error) {
      toast.error('Failed to save gallery image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteGalleryImage(id);
        toast.success('Gallery image deleted successfully');
        fetchImages();
      } catch (error) {
        toast.error('Failed to delete gallery image');
      }
    }
  };

  const columns = [
    {
      field: 'imageUrl',
      headerName: 'Preview',
      width: 120,
      renderCell: (params) => (
        <img 
          src={params.value} 
          alt={params.row.title}
          style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    { field: 'title', headerName: 'Title', width: 180 },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'batch', headerName: 'Batch', width: 100 },
    { field: 'eventName', headerName: 'Event', width: 150 },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 200,
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
            Gallery
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Image
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={images}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            disableSelectionOnClick
            rowHeight={80}
            sx={{ minHeight: 400 }}
          />
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingImage ? 'Edit Gallery Image' : 'Add Gallery Images'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              helperText={!editingImage && imageFiles.length > 1 ? "Will be numbered for multiple images" : ""}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Category"
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  helperText="e.g., Events, Campus"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Batch"
                  fullWidth
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  helperText="e.g., 2020, 2021-2025"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Event (Optional)</InputLabel>
                  <Select
                    value={formData.eventId}
                    onChange={(e) => {
                      const selectedEvent = events.find(ev => ev.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        eventId: e.target.value,
                        eventName: selectedEvent?.name || ''
                      });
                    }}
                    label="Event (Optional)"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {events.map((event) => (
                      <MenuItem key={event.id} value={event.id}>
                        {event.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="gallery-image-upload"
                type="file"
                multiple={!editingImage}
                onChange={handleImageChange}
              />
              <label htmlFor="gallery-image-upload">
                <Button 
                  variant="outlined" 
                  component="span" 
                  fullWidth
                  startIcon={<CloudUpload />}
                >
                  {imageFiles.length > 0 
                    ? `${imageFiles.length} image(s) selected` 
                    : editingImage 
                    ? 'Change Image' 
                    : 'Upload Images (Multiple)'}
                </Button>
              </label>
              
              {imageFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Selected files:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {imageFiles.map((file, index) => (
                      <Chip 
                        key={index} 
                        label={file.name} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {formData.imageUrl && imageFiles.length === 0 && (
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
            {uploading ? <CircularProgress size={24} /> : editingImage ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GalleryManager;

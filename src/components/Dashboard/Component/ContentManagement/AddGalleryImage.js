import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebase/config";

const AddGalleryImage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    try {
      const imageRef = ref(storage, `gallery/${Date.now()}_${formData.image.name}`);
      await uploadBytes(imageRef, formData.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "gallery"), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image: imageUrl,
        createdAt: serverTimestamp(),
      });

      toast.success("Image added to gallery!");
      setFormData({ title: "", description: "", category: "", image: null });
    } catch (error) {
      console.error("Error adding gallery image:", error);
      toast.error("Failed to add image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        maxWidth: 800, 
        mx: "auto",
        mt: 10,
        mb: 4,
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(25, 118, 210, 0.15)",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: "#1976d2", fontWeight: 700 }}>
        Add Gallery Image
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Events, Campus, Alumni Meet"
          required
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mb: 2 }}
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </Button>
        
        {formData.image && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Selected: {formData.image.name}
            </Typography>
            <img 
              src={URL.createObjectURL(formData.image)} 
              alt="Preview" 
              style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px" }}
            />
          </Box>
        )}
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: "50px",
            background: "linear-gradient(135deg, #1976d2 0%, #0288d1 100%)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(25, 118, 210, 0.4)",
            },
          }}
        >
          {loading ? <CircularProgress size={24} /> : "Add to Gallery"}
        </Button>
      </Box>
    </Paper>
  );
};

export default AddGalleryImage;

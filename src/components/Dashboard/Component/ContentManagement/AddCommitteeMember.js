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

const AddCommitteeMember = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    description: "",
    order: "",
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
    setLoading(true);

    try {
      let imageUrl = "";
      
      if (formData.image) {
        const imageRef = ref(storage, `committee/${Date.now()}_${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "committee"), {
        name: formData.name,
        position: formData.position,
        email: formData.email,
        phone: formData.phone || "",
        description: formData.description || "",
        order: parseInt(formData.order) || 0,
        image: imageUrl,
        createdAt: serverTimestamp(),
      });

      toast.success("Committee member added successfully!");
      setFormData({ name: "", position: "", email: "", phone: "", description: "", order: "", image: null });
    } catch (error) {
      console.error("Error adding committee member:", error);
      toast.error("Failed to add committee member");
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
        Add Committee Member
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Phone (Optional)"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Bio / Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={4}
          placeholder="Enter a brief biography or description of the committee member..."
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Display Order"
          name="order"
          type="number"
          value={formData.order}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mb: 2 }}
        >
          Upload Photo
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </Button>
        
        {formData.image && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selected: {formData.image.name}
          </Typography>
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
          {loading ? <CircularProgress size={24} /> : "Add Member"}
        </Button>
      </Box>
    </Paper>
  );
};

export default AddCommitteeMember;

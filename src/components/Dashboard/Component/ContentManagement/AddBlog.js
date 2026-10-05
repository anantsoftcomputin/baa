import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../../firebase/config";

const AddBlog = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    tags: "",
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
        const imageRef = ref(storage, `blogs/${Date.now()}_${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      await addDoc(collection(db, "blogs"), {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        tags: tagsArray,
        image: imageUrl,
        createdAt: serverTimestamp(),
        views: 0,
      });

      toast.success("Blog added successfully!");
      setFormData({ title: "", content: "", author: "", tags: "", image: null });
    } catch (error) {
      console.error("Error adding blog:", error);
      toast.error("Failed to add blog");
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
        Add Blog Post
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
          label="Content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          multiline
          rows={8}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Tags (comma separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="alumni, events, news"
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mb: 2 }}
        >
          Upload Cover Image
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
          {loading ? <CircularProgress size={24} /> : "Publish Blog"}
        </Button>
      </Box>
    </Paper>
  );
};

export default AddBlog;

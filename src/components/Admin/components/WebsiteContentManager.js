import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast } from "react-toastify";
import {
  getWebsiteContent,
  updateWebsiteContent,
} from "../../../firebase/firestore";
import { uploadWebsiteImage } from "../../../firebase/storage";

const WebsiteContentManager = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aboutUs, setAboutUs] = useState({
    mission: "",
    vision: "",
    history: "",
  });
  const [heroImages, setHeroImages] = useState([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const aboutData = await getWebsiteContent("aboutUs");
      const heroData = await getWebsiteContent("heroImages");
      
      if (aboutData) setAboutUs(aboutData);
      if (heroData?.images) setHeroImages(heroData.images);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    }
    setLoading(false);
  };

  const handleAboutUsUpdate = async () => {
    setLoading(true);
    try {
      await updateWebsiteContent("aboutUs", aboutUs);
      toast.success("About Us section updated successfully!");
    } catch (error) {
      console.error("Error updating About Us:", error);
      toast.error("Failed to update content");
    }
    setLoading(false);
  };

  const handleHeroImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadWebsiteImage("hero", file);
      const newHeroImage = {
        image: url,
        title: "Bhavan's Alumni Association",
        subtitle: "Connecting Alumni, Building Futures",
      };

      const updatedImages = [...heroImages, newHeroImage];
      setHeroImages(updatedImages);

      await updateWebsiteContent("heroImages", { images: updatedImages });
      toast.success("Hero image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading hero image:", error);
      toast.error("Failed to upload image");
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Website Content Management
      </Typography>

      {/* About Us Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            About Us Section
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mission"
                multiline
                rows={4}
                value={aboutUs.mission}
                onChange={(e) =>
                  setAboutUs({ ...aboutUs, mission: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vision"
                multiline
                rows={4}
                value={aboutUs.vision}
                onChange={(e) =>
                  setAboutUs({ ...aboutUs, vision: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="History"
                multiline
                rows={4}
                value={aboutUs.history}
                onChange={(e) =>
                  setAboutUs({ ...aboutUs, history: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleAboutUsUpdate}
                disabled={loading}
              >
                Update About Us
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Hero Images Section */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            Hero Banner Images
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="hero-image-upload"
              type="file"
              onChange={handleHeroImageUpload}
            />
            <label htmlFor="hero-image-upload">
              <Button
                variant="outlined"
                component="span"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload Hero Image"}
              </Button>
            </label>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {heroImages.map((hero, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <img
                      src={hero.image}
                      alt={hero.title}
                      style={{ width: "100%", height: "150px", objectFit: "cover" }}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {hero.title}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default WebsiteContentManager;

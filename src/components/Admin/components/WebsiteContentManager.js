import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import { toast } from "react-toastify";
import { getWebsiteContent, updateWebsiteContent } from "../../../firebase/firestore";
import { uploadWebsiteImage } from "../../../firebase/storage";
import { logAdminAction } from "../../../firebase/analytics";

const Panel = ({ title, description, children, defaultExpanded }) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    sx={{ border: "1px solid", borderColor: "divider", borderRadius: "14px !important", mb: 2, "&::before": { display: "none" }, boxShadow: "none" }}
  >
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 3 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 3, pb: 3 }}>{children}</AccordionDetails>
  </Accordion>
);

const useSection = (key, defaults) => {
  const [value, setValue] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const save = async (data = value, message = "Saved") => {
    setSaving(true);
    try {
      await updateWebsiteContent(key, data);
      logAdminAction("update", "website_content", key);
      toast.success(message);
    } catch (e) {
      console.error(`Error saving ${key}:`, e);
      toast.error("Couldn't save. Please try again.");
    }
    setSaving(false);
  };
  const field = (name, label, props = {}) => (
    <TextField fullWidth label={label} value={value[name] ?? ""} onChange={(e) => setValue((v) => ({ ...v, [name]: e.target.value }))} {...props} />
  );
  return { value, setValue, saving, save, field };
};

const WebsiteContentManager = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const about = useSection("aboutUs", { mission: "", vision: "", history: "" });
  const hero = useSection("heroImages", { images: [] });
  const contact = useSection("contact", { address: "", email: "", phone: "", grievance_officer: "" });
  const footer = useSection("footer", { about_text: "", copyright_text: "", facebook_link: "", instagram_link: "", linkedin_link: "", youtube_link: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const [a, h, c, f] = await Promise.all(["aboutUs", "heroImages", "contact", "footer"].map((k) => getWebsiteContent(k).catch(() => null)));
        if (a) about.setValue((v) => ({ ...v, ...a }));
        if (h?.images) hero.setValue({ images: h.images });
        if (c) contact.setValue((v) => ({ ...v, ...c }));
        if (f) footer.setValue((v) => ({ ...v, ...f }));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strip = ({ updatedAt, ...rest }) => rest;

  const images = hero.value.images || [];
  const setImages = (next) => hero.setValue({ images: next });

  const uploadHero = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadWebsiteImage("hero", file);
      const next = [...images, { image: url, title: "", subtitle: "" }];
      setImages(next);
      await hero.save({ images: next }, "Hero image added");
    } catch (error) {
      console.error("Error uploading hero image:", error);
      toast.error("Failed to upload image");
    }
    setUploading(false);
  };

  const updateSlide = (i, key, val) => setImages(images.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));
  const moveSlide = (i, delta) => {
    const next = [...images];
    const [item] = next.splice(i, 1);
    next.splice(i + delta, 0, item);
    setImages(next);
  };
  const removeSlide = async (i) => {
    if (!window.confirm("Remove this hero image from the home page?")) return;
    const next = images.filter((_, idx) => idx !== i);
    setImages(next);
    await hero.save({ images: next }, "Hero image removed");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Website content</Typography>
        <Typography variant="body2" color="text.secondary">
          Everything here appears on the public website. Changes go live as soon as you save.
        </Typography>
      </Box>

      <Panel title="Hero banner" description="Full-screen photos at the top of the home page. They rotate automatically." defaultExpanded>
        <Button variant="contained" component="label" startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadRoundedIcon />} disabled={uploading}>
          {uploading ? "Uploading…" : "Add hero image"}
          <input hidden type="file" accept="image/*" onChange={uploadHero} />
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          Landscape photos at least 1920px wide look best.
        </Typography>
        {images.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 3 }}>
            No hero images yet — the home page shows a branded backdrop until you add one.
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {images.map((slide, i) => (
              <Grid item xs={12} md={6} key={slide.image + i}>
                <Card sx={{ p: 0 }}>
                  <Box component="img" src={slide.image} alt="" sx={{ width: "100%", height: 170, objectFit: "cover" }} />
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    <TextField size="small" label="Headline (optional)" value={slide.title || ""} onChange={(e) => updateSlide(i, "title", e.target.value)} />
                    <TextField size="small" label="Subtitle (optional)" value={slide.subtitle || ""} onChange={(e) => updateSlide(i, "subtitle", e.target.value)} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Slide {i + 1} of {images.length}
                      </Typography>
                      <Box>
                        <Tooltip title="Move earlier">
                          <span>
                            <IconButton size="small" disabled={i === 0} onClick={() => moveSlide(i, -1)}>
                              <ArrowUpwardRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Move later">
                          <span>
                            <IconButton size="small" disabled={i === images.length - 1} onClick={() => moveSlide(i, 1)}>
                              <ArrowDownwardRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton size="small" color="error" onClick={() => removeSlide(i)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {images.length > 0 && (
          <Button variant="outlined" sx={{ mt: 2 }} disabled={hero.saving} onClick={() => hero.save({ images }, "Hero banner saved")}>
            Save headlines & order
          </Button>
        )}
      </Panel>

      <Panel title="About us" description="Mission, vision and history on the home page.">
        <Stack spacing={2}>
          {about.field("mission", "Mission", { multiline: true, minRows: 3 })}
          {about.field("vision", "Vision", { multiline: true, minRows: 3 })}
          {about.field("history", "History", { multiline: true, minRows: 3 })}
          <Box>
            <Button variant="contained" disabled={about.saving} onClick={() => about.save(strip(about.value), "About us updated")}>
              Save about us
            </Button>
          </Box>
        </Stack>
      </Panel>

      <Panel
        title="Contact details"
        description="Shown on the Contact page, in the footer and in the Privacy Policy, Terms and Refund Policy. Payment gateways require a working email and phone."
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {contact.field("email", "Email", { type: "email" })}
          </Grid>
          <Grid item xs={12} sm={6}>
            {contact.field("phone", "Phone")}
          </Grid>
          <Grid item xs={12}>
            {contact.field("address", "Address", {
              multiline: true,
              minRows: 2,
              helperText: "Leave empty to use the registered address from the GST certificate.",
            })}
          </Grid>
          <Grid item xs={12} sm={6}>
            {contact.field("grievance_officer", "Grievance Officer (name)", {
              helperText: "Named in the Privacy Policy and Terms, as required by Indian IT and data-protection rules.",
            })}
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" disabled={contact.saving} onClick={() => contact.save(strip(contact.value), "Contact details updated")}>
              Save contact details
            </Button>
          </Grid>
        </Grid>
      </Panel>

      <Panel title="Footer & social links" description="Footer text and social media profiles. Leave a link empty to hide its icon.">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {footer.field("about_text", "Footer description", { multiline: true, minRows: 2 })}
          </Grid>
          <Grid item xs={12}>
            {footer.field("copyright_text", "Copyright line", { placeholder: "Bhavan's Alumni Association, Vadodara. All rights reserved." })}
          </Grid>
          {[
            ["facebook_link", "Facebook URL"],
            ["instagram_link", "Instagram URL"],
            ["linkedin_link", "LinkedIn URL"],
            ["youtube_link", "YouTube URL"],
          ].map(([k, label]) => (
            <Grid item xs={12} sm={6} key={k}>
              {footer.field(k, label)}
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" disabled={footer.saving} onClick={() => footer.save(strip(footer.value), "Footer updated")}>
              Save footer
            </Button>
          </Grid>
        </Grid>
      </Panel>
    </Box>
  );
};

export default WebsiteContentManager;

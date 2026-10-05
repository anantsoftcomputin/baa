import React, { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { toast } from "react-toastify";
import { submitFeedback } from "../../../../firebase/firestore";

const EMPTY = { name: "", email: "", mobile: "", feedback: "" };

const FeedbackForm = ({ open, handleClose }) => {
  const [form, setForm] = useState(EMPTY);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await submitFeedback(form);
      toast.success("Thank you for your feedback!");
      setForm(EMPTY);
      handleClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ pr: 7 }}>
          Share your feedback
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
            Tell us what's working and what we could do better.
          </Typography>
          <IconButton onClick={handleClose} aria-label="Close" sx={{ position: "absolute", right: 12, top: 12 }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" name="name" value={form.name} onChange={onChange} required fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} required fullWidth />
              <TextField label="Mobile" name="mobile" type="tel" value={form.mobile} onChange={onChange} fullWidth />
            </Stack>
            <TextField label="Your feedback" name="feedback" value={form.feedback} onChange={onChange} required fullWidth multiline minRows={4} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Sending…" : "Send feedback"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default FeedbackForm;

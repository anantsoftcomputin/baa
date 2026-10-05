import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { submitFeedback } from "../../../../firebase/firestore";

const FeedbackForm = ({ open, handleClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      email,
      mobile,
      feedback,
    };

    try {
      setIsLoading(true);
      await submitFeedback(data);
      toast.success("Feedback submitted successfully. Thank you!");
      setName("");
      setEmail("");
      setMobile("");
      setFeedback("");
      handleClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Submit Feedback</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="small"
            required
          />
          <TextField
            label="Mobile Number"
            type="tel"
            fullWidth
            margin="normal"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            size="small"
            required
          />
          <TextField
            label="Feedback"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            size="small"
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} size="small">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isLoading}
          size="small"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackForm;

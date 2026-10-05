import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Typography,
  Grid,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { sharePost } from "../../../../../firebase/firestore";

const PostShare = ({ postId, userId, shareCounts }) => {
  const [open, setOpen] = useState(false);
  const [shareCount, setShareCount] = useState(shareCounts?.length || 0);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleShare = async (platform) => {
    const message = `Check out this post: ${window.location.href}`;

    try {
      let shareUrl = "";
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (platform === "WHATSAPP") {
        shareUrl = isMobile
          ? `whatsapp://send?text=${encodeURIComponent(message)}`
          : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(shareUrl, "_blank");
      } else if (platform === "FACEBOOK") {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          window.location.href
        )}&quote=${encodeURIComponent(message)}`;
        window.open(shareUrl, "_blank");
      }

      const response = await sharePost(postId, userId, platform);

      if (response) {
        console.log("Post shared successfully!");
        setShareCount((prevCount) => prevCount + 1);
      } else {
        console.log("Error sharing the post");
      }
    } catch (error) {
      console.log("Error sharing the post");
    }

    setOpen(false);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClickOpen}>
        <ShareIcon />
        {shareCount > 0 && <span>{shareCount}</span>}
      </IconButton>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Share this post via:</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item>
              <IconButton
                color="primary"
                onClick={() => handleShare("FACEBOOK")}
              >
                <FacebookIcon fontSize="large" />
                <Typography variant="body2" style={{ marginLeft: 8 }}>
                  FACEBOOK
                </Typography>
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                color="success"
                onClick={() => handleShare("WHATSAPP")}
              >
                <WhatsAppIcon fontSize="large" />
                <Typography variant="body2" style={{ marginLeft: 8 }}>
                  WHATSAPP
                </Typography>
              </IconButton>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostShare;

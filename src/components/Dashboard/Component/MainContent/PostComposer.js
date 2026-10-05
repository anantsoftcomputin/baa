import React, { useRef, useState } from "react";
import { Box, Button, Card, IconButton, Stack, TextField, Typography } from "@mui/material";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { toast } from "react-toastify";
import { useAuth } from "../../../../contexts/AuthContext";
import { createPost } from "../../../../firebase/firestore";
import { uploadPostImage } from "../../../../firebase/storage";
import { logPostCreated } from "../../../../firebase/analytics";
import UserAvatar from "../../../common/UserAvatar";

const MAX_IMAGE_MB = 10;

const PostComposer = ({ onPosted }) => {
  const { currentUser, displayName, photoURL } = useAuth();
  const fileInputRef = useRef(null);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [posting, setPosting] = useState(false);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Images must be smaller than ${MAX_IMAGE_MB} MB.`);
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setPosting(true);
    try {
      const imageUrl = image ? await uploadPostImage(currentUser.uid, image) : null;
      const { id } = await createPost({
        content: content.trim(),
        image_url: imageUrl,
        user_id: currentUser.uid,
        username: displayName,
        userPhoto: photoURL || null,
      });
      logPostCreated(id);
      toast.success("Posted!");
      setContent("");
      clearImage();
      onPosted && onPosted();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Couldn't publish your post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card component="form" onSubmit={submit} sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" spacing={1.5}>
        <UserAvatar name={displayName} src={photoURL} size={44} />
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={10}
          placeholder={`What's new, ${displayName.split(" ")[0]}? Share an update with fellow alumni…`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          inputProps={{ maxLength: 5000, "aria-label": "Write a post" }}
          variant="standard"
          InputProps={{ disableUnderline: true, sx: { fontSize: "1rem", pt: 1.25 } }}
        />
      </Stack>
      {preview && (
        <Box sx={{ position: "relative", mt: 2, ml: { sm: 7 }, borderRadius: 3, overflow: "hidden", maxWidth: 420 }}>
          <Box component="img" src={preview} alt="Selected" sx={{ width: "100%", maxHeight: 320, objectFit: "cover" }} />
          <IconButton
            size="small"
            onClick={clearImage}
            aria-label="Remove image"
            sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(0,0,0,0.6)", color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          size="small"
          startIcon={<AddPhotoAlternateRoundedIcon sx={{ color: "secondary.main" }} />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ color: "text.secondary" }}
        >
          Photo
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={pickImage} />
        <Stack direction="row" spacing={1.5} alignItems="center">
          {content.length > 4500 && (
            <Typography variant="caption" color="text.secondary">
              {5000 - content.length} left
            </Typography>
          )}
          <Button type="submit" variant="contained" disabled={posting || (!content.trim() && !image)}>
            {posting ? "Posting…" : "Post"}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

export default PostComposer;

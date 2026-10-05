import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { toast } from "react-toastify";
import { deletePost, updatePost } from "../../../../firebase/firestore";
import UserAvatar from "../../../common/UserAvatar";
import PostLike from "./Like-comment-share/PostLike";
import PostComment from "./Like-comment-share/PostComment";
import PostShare from "./Like-comment-share/PostShare";
import { timeAgo } from "../../../../utils/format";

/** A single post in the feed. */
const PostCard = ({ post, currentUserId, isAdmin, onDeleted, authorOverride }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(Math.max(0, Number(post.commentsCount) || 0));
  const [content, setContent] = useState(post.content || "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content || "");

  const authorId = post.user_id || post.author;
  const author = authorOverride || { username: post.username, profile_picture: post.userPhoto };
  const isOwner = authorId && authorId === currentUserId;

  const handleDelete = async () => {
    setMenuAnchor(null);
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      await deletePost(post.id);
      toast.success("Post deleted");
      onDeleted && onDeleted(post.id);
    } catch (e) {
      toast.error("Couldn't delete the post.");
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updatePost(post.id, draft.trim());
      setContent(draft.trim());
      setEditing(false);
      toast.success("Post updated");
    } catch (e) {
      toast.error("Couldn't update the post.");
    }
  };

  return (
    <Card>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: { xs: 2, sm: 2.5 }, pt: 2.25 }}>
        <Link component={RouterLink} to={authorId ? `/dashboard/userProfile/${authorId}` : "#"} underline="none">
          <UserAvatar user={author} name={author.username} size={44} />
        </Link>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Link
            component={RouterLink}
            to={authorId ? `/dashboard/userProfile/${authorId}` : "#"}
            underline="hover"
            sx={{ fontWeight: 700, color: "text.primary", display: "block" }}
            noWrap
          >
            {author.username || "Alumnus"}
          </Link>
          <Typography variant="caption" color="text.secondary">
            {timeAgo(post.createdAt || post.created_at)}
            {post.updatedAt && post.createdAt && post.updatedAt.seconds - post.createdAt.seconds > 60 ? " · edited" : ""}
          </Typography>
        </Box>
        {(isOwner || isAdmin) && (
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Post options">
            <MoreHorizRoundedIcon />
          </IconButton>
        )}
      </Stack>

      {content && (
        <Typography sx={{ px: { xs: 2, sm: 2.5 }, pt: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "0.98rem" }}>
          {content}
        </Typography>
      )}

      {post.image_url && (
        <Box sx={{ mt: 1.75, bgcolor: "background.default" }}>
          <Box component="img" src={post.image_url} alt="" loading="lazy" sx={{ width: "100%", maxHeight: 560, objectFit: "cover" }} />
        </Box>
      )}

      <Stack direction="row" spacing={0.5} sx={{ px: { xs: 1, sm: 1.5 }, py: 0.75, mt: post.image_url ? 0 : 1 }}>
        <PostLike postId={post.id} userId={currentUserId} initialCount={post.likesCount} />
        <Button
          size="small"
          onClick={() => setCommentsOpen((o) => !o)}
          startIcon={<ChatBubbleOutlineRoundedIcon />}
          sx={{ color: commentsOpen ? "primary.main" : "text.secondary" }}
        >
          {commentCount > 0 ? commentCount : "Comment"}
        </Button>
        <PostShare postId={post.id} userId={currentUserId} initialCount={post.sharesCount} postContent={content} />
      </Stack>

      <PostComment postId={post.id} userId={currentUserId} open={commentsOpen} onCountChange={setCommentCount} />

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        {isOwner && (
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              setDraft(content);
              setEditing(true);
            }}
          >
            <ListItemIcon>
              <EditRoundedIcon fontSize="small" />
            </ListItemIcon>
            Edit post
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteOutlineRoundedIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete post
        </MenuItem>
      </Menu>

      <Dialog open={editing} onClose={() => setEditing(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            inputProps={{ maxLength: 5000 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={!draft.trim() && !post.image_url}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default PostCard;

import React, { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Collapse, IconButton, InputAdornment, Link, Skeleton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { toast } from "react-toastify";
import { addComment, deleteComment, getComments } from "../../../../../firebase/firestore";
import { logPostCommented } from "../../../../../firebase/analytics";
import { useAuth } from "../../../../../contexts/AuthContext";
import UserAvatar from "../../../../common/UserAvatar";
import { timeAgo } from "../../../../../utils/format";

const Comment = ({ c, canDelete, onDelete, onReply, isReply }) => (
  <Stack direction="row" spacing={1.25} sx={{ pl: isReply ? 5 : 0 }}>
    <UserAvatar name={c.username} src={c.userPhoto} size={isReply ? 28 : 32} />
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Box sx={{ bgcolor: "background.default", borderRadius: 3, px: 1.75, py: 1 }}>
        <Link
          component={RouterLink}
          to={`/dashboard/userProfile/${c.userId}`}
          underline="hover"
          sx={{ fontWeight: 700, fontSize: "0.85rem", color: "text.primary" }}
        >
          {c.username || "Alumnus"}
        </Link>
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {c.content}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pl: 1.5, mt: 0.25 }}>
        <Typography variant="caption" color="text.secondary">
          {timeAgo(c.createdAt)}
        </Typography>
        {!isReply && (
          <Link
            component="button"
            variant="caption"
            underline="hover"
            onClick={() => onReply(c)}
            sx={{ fontWeight: 700, color: "text.secondary" }}
          >
            Reply
          </Link>
        )}
        {canDelete && (
          <Tooltip title="Delete comment">
            <IconButton size="small" onClick={() => onDelete(c)} sx={{ p: 0.25 }}>
              <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  </Stack>
);

/** Inline comment thread for a post. The post card owns the toggle button and count. */
const PostComment = ({ postId, userId, open, onCountChange }) => {
  const { userProfile, displayName, photoURL, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getComments(postId);
      setComments(list || []);
      onCountChange && onCountChange(list?.length || 0);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const submit = async (e) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const username = userProfile?.username || displayName;
      await addComment(postId, userId, content, username, replyTo?.id || null, photoURL || null);
      logPostCommented(postId);
      setText("");
      setReplyTo(null);
      await load();
    } catch (error) {
      toast.error("Couldn't post your comment. Please try again.");
    }
    setSending(false);
  };

  const remove = async (c) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(c.id, postId);
      await load();
    } catch (error) {
      toast.error("Couldn't delete the comment.");
    }
  };

  const topLevel = comments.filter((c) => !c.parentCommentId);
  const repliesOf = (id) => comments.filter((c) => c.parentCommentId === id);
  const canDelete = (c) => c.userId === userId || isAdmin;

  return (
    <Collapse in={open} unmountOnExit>
      <Box sx={{ px: { xs: 2, sm: 2.5 }, pb: 2.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        {loading && comments.length === 0 ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={48} />
            <Skeleton variant="rounded" height={48} width="80%" />
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {topLevel.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No comments yet — start the conversation.
              </Typography>
            )}
            {topLevel.map((c) => (
              <Stack key={c.id} spacing={1}>
                <Comment c={c} canDelete={canDelete(c)} onDelete={remove} onReply={setReplyTo} />
                {repliesOf(c.id).map((r) => (
                  <Comment key={r.id} c={r} isReply canDelete={canDelete(r)} onDelete={remove} />
                ))}
              </Stack>
            ))}
          </Stack>
        )}

        <Box component="form" onSubmit={submit} sx={{ mt: 2 }}>
          {replyTo && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Replying to <strong>{replyTo.username}</strong>
              </Typography>
              <IconButton size="small" onClick={() => setReplyTo(null)} sx={{ p: 0.25 }}>
                <CloseRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          )}
          <Stack direction="row" spacing={1.25} alignItems="center">
            <UserAvatar name={displayName} src={photoURL} size={32} />
            <TextField
              size="small"
              fullWidth
              placeholder={replyTo ? "Write a reply…" : "Write a comment…"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              inputProps={{ maxLength: 2000 }}
              InputProps={{
                sx: { borderRadius: 99, bgcolor: "background.default" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" size="small" color="primary" disabled={!text.trim() || sending} aria-label="Post comment">
                      <SendRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Box>
      </Box>
    </Collapse>
  );
};

export default PostComment;

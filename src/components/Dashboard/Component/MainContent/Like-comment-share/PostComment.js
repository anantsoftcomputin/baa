import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
  Divider,
  Paper,
  Avatar,
  Box,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import { addComment, getComments } from "../../../../../firebase/firestore";
import { useAuth } from "../../../../../contexts/AuthContext";

const PostComment = ({ postId, userId, commentCounts }) => {
  const { userProfile } = useAuth();
  const initialData = {
    content: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    post: postId,
    user: userId,
  };

  const [open, setOpen] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [comment, setComment] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasComments, setHasComments] = useState(true);
  const [commentCount, setCommentCount] = useState(commentCounts?.length || 0);
  const [replyTo, setReplyTo] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCommentChange = (e) => {
    setComment((prevComment) => ({
      ...prevComment,
      content: e.target.value,
      updated_at: new Date().toISOString(),
    }));
  };

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const comments = await getComments(postId);
      setCommentsList(comments || []);
      setHasComments(comments?.length > 0);
      setCommentCount(comments?.length || 0);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
    setIsLoading(false);
  }, [postId]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [fetchComments, open]);

  const handleSubmitComment = async () => {
    if (comment.content.trim() === "") return;
    setIsSubmitting(true);

    try {
      const username = userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Anonymous';
      
      // Optimistic update - add comment to UI immediately
      const tempComment = {
        id: 'temp-' + Date.now(),
        content: comment.content,
        username: username,
        userId: userId,
        parentCommentId: replyTo?.id || null,
        createdAt: new Date()
      };
      
      setCommentsList(prev => [...prev, tempComment]);
      setCommentCount(prev => prev + 1);
      setHasComments(true);
      
      setComment((prev) => ({
        ...prev,
        content: "",
      }));
      setReplyTo(null);
      
      // Actually save to Firebase in background
      await addComment(postId, userId, comment.content, username, replyTo?.id || null);
      
      // Refresh to get real data with timestamps
      setTimeout(() => fetchComments(), 500);
    } catch (error) {
      console.error("Error submitting comment:", error);
      // Revert optimistic update on error
      fetchComments();
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClickOpen}>
        <CommentIcon />
        {commentCount}
      </IconButton>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          fontWeight: 600,
          color: '#1976d2'
        }}>
          Comments {commentCount > 0 && `(${commentCount})`}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : hasComments ? (
            <List sx={{ mb: 2 }}>
              {commentsList.filter(c => !c.parentCommentId).map((comment, index) => (
                <Box key={comment.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      px: 0,
                      py: 1.5,
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        mr: 1.5, 
                        width: 36, 
                        height: 36,
                        bgcolor: '#1976d2',
                        fontSize: '0.9rem'
                      }}
                    >
                      {comment.username?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ 
                        bgcolor: '#f5f5f5', 
                        borderRadius: 2, 
                        p: 1.5,
                        position: 'relative'
                      }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#1976d2',
                            mb: 0.5
                          }}
                        >
                          {comment.username || 'Anonymous'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#333' }}>
                          {comment.content}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<ReplyIcon />}
                        onClick={() => setReplyTo(comment)}
                        sx={{ 
                          mt: 0.5, 
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          color: '#1976d2'
                        }}
                      >
                        Reply
                      </Button>
                      
                      {/* Nested Replies */}
                      {commentsList.filter(r => r.parentCommentId === comment.id).length > 0 && (
                        <Box sx={{ ml: 4, mt: 1 }}>
                          {commentsList.filter(r => r.parentCommentId === comment.id).map(reply => (
                            <Box key={reply.id} sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Avatar 
                                  sx={{ 
                                    mr: 1, 
                                    width: 28, 
                                    height: 28,
                                    bgcolor: '#0288d1',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {reply.username?.charAt(0).toUpperCase() || 'A'}
                                </Avatar>
                                <Box sx={{ 
                                  bgcolor: '#e3f2fd', 
                                  borderRadius: 2, 
                                  p: 1,
                                  flex: 1
                                }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      fontWeight: 600,
                                      color: '#0288d1',
                                      display: 'block',
                                      mb: 0.3
                                    }}
                                  >
                                    {reply.username || 'Anonymous'}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#333', fontSize: '0.85rem' }}>
                                    {reply.content}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                  {index < commentsList.filter(c => !c.parentCommentId).length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                No comments yet. Be the first to comment!
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {replyTo && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1, 
                p: 1, 
                bgcolor: '#e3f2fd', 
                borderRadius: 1 
              }}>
                <Typography variant="caption" sx={{ flex: 1, color: '#1976d2' }}>
                  Replying to {replyTo.username}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setReplyTo(null)}
                  sx={{ p: 0.5 }}
                >
                  ✕
                </IconButton>
              </Box>
            )}
            <TextField
              size="small"
              fullWidth
              placeholder={replyTo ? `Reply to ${replyTo.username}...` : "Write a comment..."}
              value={comment.content}
              onChange={handleCommentChange}
              multiline
              maxRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#f9f9f9',
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      <IconButton
                        onClick={handleSubmitComment}
                        disabled={!comment.content.trim()}
                        sx={{
                          bgcolor: '#1976d2',
                          color: 'white',
                          '&:hover': {
                            bgcolor: '#1565c0',
                          },
                          '&:disabled': {
                            bgcolor: '#e0e0e0',
                            color: '#9e9e9e',
                          },
                          p: 1
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostComment;

import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { toggleLike, checkUserLiked } from "../../../../../firebase/firestore";

const PostLike = ({ postId, userId, likeCounts }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likeCounts?.length || 0);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (userId && postId) {
        const liked = await checkUserLiked(postId, userId);
        setIsLiked(liked);
      }
    };
    checkLikeStatus();
  }, [postId, userId]);

  const handleLikeClick = async () => {
    try {
      await toggleLike(postId, userId, isLiked);
      
      if (isLiked) {
        setLikeCount((prevCount) => prevCount - 1);
        setIsLiked(false);
      } else {
        setLikeCount((prevCount) => prevCount + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <IconButton
      size="small"
      onClick={handleLikeClick}
      sx={{
        color: isLiked ? '#d32f2f' : '#757575',
        '&:hover': {
          color: '#d32f2f',
          bgcolor: 'rgba(211, 47, 47, 0.08)'
        }
      }}
    >
      {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      <span style={{ marginLeft: 4, fontSize: '0.9rem' }}>{likeCount}</span>
    </IconButton>
  );
};

export default PostLike;

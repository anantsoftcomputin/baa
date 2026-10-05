import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { toast } from "react-toastify";
import { toggleLike, checkUserLiked } from "../../../../../firebase/firestore";
import { logPostLiked } from "../../../../../firebase/analytics";

const PostLike = ({ postId, userId, initialCount = 0 }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(Math.max(0, Number(initialCount) || 0));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (userId && postId) {
      checkUserLiked(postId, userId).then((liked) => alive && setIsLiked(liked));
    }
    return () => {
      alive = false;
    };
  }, [postId, userId]);

  const handleClick = async () => {
    if (busy || !userId) return;
    const next = !isLiked;
    // Optimistic update, rolled back on failure.
    setBusy(true);
    setIsLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      await toggleLike(postId, userId, !next);
      if (next) logPostLiked(postId);
    } catch (error) {
      setIsLiked(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error("Couldn't update your like. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="small"
      onClick={handleClick}
      aria-pressed={isLiked}
      startIcon={isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
      sx={{ color: isLiked ? "#D93A3A" : "text.secondary", "&:hover": { bgcolor: "rgba(217,58,58,0.08)" } }}
    >
      {count > 0 ? count : "Like"}
    </Button>
  );
};

export default PostLike;

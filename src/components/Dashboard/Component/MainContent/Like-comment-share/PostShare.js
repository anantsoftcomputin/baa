import React, { useState } from "react";
import { Button } from "@mui/material";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import { sharePost } from "../../../../../firebase/firestore";
import { logPostShared } from "../../../../../firebase/analytics";
import ShareMenu from "../../../../common/ShareMenu";

const PostShare = ({ postId, userId, initialCount = 0, postContent = "" }) => {
  const [count, setCount] = useState(Math.max(0, Number(initialCount) || 0));

  const onShared = async (platform) => {
    setCount((c) => c + 1);
    logPostShared(postId);
    try {
      await sharePost(postId, userId, platform);
    } catch (_) {
      setCount((c) => Math.max(0, c - 1));
    }
  };

  const title = postContent ? `"${postContent.slice(0, 80)}" — on the BAA alumni portal` : "A post on the BAA alumni portal";

  return (
    <ShareMenu
      url={`${window.location.origin}/dashboard`}
      title={title}
      onShared={onShared}
      renderTrigger={(open) => (
        <Button size="small" onClick={open} startIcon={<IosShareRoundedIcon />} sx={{ color: "text.secondary" }}>
          {count > 0 ? count : "Share"}
        </Button>
      )}
    />
  );
};

export default PostShare;

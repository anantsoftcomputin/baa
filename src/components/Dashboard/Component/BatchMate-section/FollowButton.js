import React, { useState } from "react";
import { Button } from "@mui/material";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { toast } from "react-toastify";
import { useAuth } from "../../../../contexts/AuthContext";
import { toggleFollow } from "../../../../firebase/firestore";
import { logUserFollowed, logUserUnfollowed } from "../../../../firebase/analytics";

/** Follow / Following toggle. Calls `onChange(isFollowing)` after a successful write. */
const FollowButton = ({ targetId, size = "small", fullWidth = false, onChange }) => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const following = (userProfile?.following || []).includes(targetId);

  if (!currentUser || currentUser.uid === targetId) return null;

  const toggle = async (e) => {
    e.stopPropagation();
    setBusy(true);
    try {
      await toggleFollow(currentUser.uid, targetId, following);
      if (following) logUserUnfollowed(targetId);
      else logUserFollowed(targetId);
      await refreshUserProfile();
      onChange && onChange(!following);
    } catch (error) {
      toast.error("Couldn't update follow status. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size={size}
      fullWidth={fullWidth}
      variant={following ? "outlined" : "contained"}
      color={following ? "inherit" : "primary"}
      startIcon={following ? <CheckRoundedIcon /> : <PersonAddAlt1RoundedIcon />}
      onClick={toggle}
      disabled={busy}
      sx={following ? { borderColor: "divider", color: "text.secondary" } : undefined}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;

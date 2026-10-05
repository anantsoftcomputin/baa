import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { getUserProfile } from "../../../../firebase/firestore";
import { logProfileViewed } from "../../../../firebase/analytics";
import { FullPageLoader } from "../../../common/Loader";
import EmptyState from "../../../common/EmptyState";
import ProfileView from "./ProfileView";

/** /dashboard/userProfile/:UserId — another member's profile. */
const CheckUser = () => {
  const { UserId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    let alive = true;
    setProfile(undefined);
    getUserProfile(UserId)
      .then((p) => {
        if (!alive) return;
        setProfile(p);
        if (p) logProfileViewed(UserId);
      })
      .catch(() => alive && setProfile(null));
    return () => {
      alive = false;
    };
  }, [UserId]);

  if (UserId === currentUser?.uid) return <Navigate to="/dashboard/userProfile" replace />;
  if (profile === undefined) return <FullPageLoader minHeight="50vh" />;
  if (!profile) {
    return (
      <EmptyState
        icon={PersonSearchRoundedIcon}
        title="Profile not found"
        description="This member may have left the community."
        action={
          <Button variant="contained" onClick={() => navigate("/dashboard/batchmates")}>
            Browse batchmates
          </Button>
        }
      />
    );
  }
  return <ProfileView profile={profile} isOwn={false} />;
};

export default CheckUser;

import React from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { FullPageLoader } from "../../../common/Loader";
import ProfileView from "./ProfileView";

/** /dashboard/userProfile — the signed-in member's own profile. */
const Profile = () => {
  const { currentUser, userProfile } = useAuth();
  if (!userProfile) return <FullPageLoader minHeight="50vh" />;
  return <ProfileView profile={{ ...userProfile, id: currentUser.uid, email: userProfile.email || currentUser.email }} isOwn />;
};

export default Profile;

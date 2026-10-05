import React from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { FullPageLoader } from "../../../common/Loader";
import ProfileForm from "./ProfileForm";

/** /dashboard/updateProfile */
const UserProfile = () => {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading || !currentUser) return <FullPageLoader minHeight="50vh" />;
  return <ProfileForm userID={currentUser.uid} userProfileData={userProfile || {}} />;
};

export default UserProfile;

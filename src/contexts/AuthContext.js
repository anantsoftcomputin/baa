import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile, updateUserProfile } from "../firebase/firestore";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

/** Email/password accounts must verify their address; Google accounts are always verified. */
const isVerified = (user) =>
  user.emailVerified || !user.providerData.some((p) => p.providerId === "password");

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user && isVerified(user)) {
            setCurrentUser(user);
            let profile = await getUserProfile(user.uid);
            // A first-time Google sign-in creates the profile in parallel with this
            // listener, so give it a moment to appear before giving up.
            for (let attempt = 0; !profile && attempt < 4; attempt += 1) {
              await new Promise((r) => setTimeout(r, 700));
              profile = await getUserProfile(user.uid);
            }
            setUserProfile(profile);

            // Keep the stored flag in sync once the user has clicked the verification link.
            if (profile && user.emailVerified && profile.emailVerified === false) {
              updateUserProfile(user.uid, { emailVerified: true }).catch(() => {});
            }
          } else {
            // Signed out, or a freshly registered account that hasn't verified yet.
            setCurrentUser(null);
            setUserProfile(null);
          }
        } catch (err) {
          console.error("Error in auth state change:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Auth state error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        return profile;
      } catch (err) {
        console.error("Error refreshing user profile:", err);
      }
    }
    return null;
  }, [currentUser]);

  const role = userProfile?.userRole || "User";

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    refreshUserProfile,
    isAuthenticated: !!currentUser,
    isMember: userProfile?.is_member || false,
    userRole: role,
    isAdmin: role === "Admin" || role === "Superuser",
    isSuperuser: role === "Superuser",
    displayName:
      userProfile?.username || currentUser?.displayName || currentUser?.email?.split("@")[0] || "Member",
    photoURL: userProfile?.profile_picture || userProfile?.photoURL || currentUser?.photoURL || "",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

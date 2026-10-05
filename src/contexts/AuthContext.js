import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile } from "../firebase/firestore";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (user) {
            // User is signed in
            setCurrentUser(user);
            
            // Fetch user profile from Firestore
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
          } else {
            // User is signed out
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
      (error) => {
        console.error("Auth state error:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const refreshUserProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (err) {
        console.error("Error refreshing user profile:", err);
      }
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    refreshUserProfile,
    isAuthenticated: !!currentUser,
    isMember: userProfile?.is_member || false,
    userRole: userProfile?.userRole || "User",
    isAdmin: userProfile?.userRole === "Admin" || userProfile?.userRole === "Superuser",
    isSuperuser: userProfile?.userRole === "Superuser"
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

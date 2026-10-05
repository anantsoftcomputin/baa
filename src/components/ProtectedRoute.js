import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullPageLoader } from "./common/Loader";

/** Requires a signed-in (and, for email accounts, verified) user. */
export const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

/** Requires a lifetime member; others are sent to the membership page. */
export const MemberRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!userProfile?.is_member) return <Navigate to="/becomemember" replace />;
  return children;
};

/** Requires an Admin or Superuser. The security rules enforce the same on the server. */
export const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader minHeight="60vh" />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

/** Sign-in / register pages: signed-in users go to where they were heading (or the dashboard). */
export const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (currentUser) {
    return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
  }
  return children;
};

const routes = { ProtectedRoute, MemberRoute, AdminRoute, PublicRoute };

export default routes;

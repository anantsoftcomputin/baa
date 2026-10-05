import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "./theme";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute, PublicRoute } from "./components/ProtectedRoute";
import { FullPageLoader } from "./components/common/Loader";
import Navbar from "./components/LandingPage/Component/Navbar/Navbar";
import Footers from "./components/LandingPage/Component/Footer/Footers";
import BottomNav from "./components/LandingPage/Component/Navbar/BottomNav";
import LandingPage from "./components/LandingPage/LandingPage";
import NotFound from "./components/common/NotFound";

// Public pages (split into their own chunks)
const Event = lazy(() => import("./components/LandingPage/Component/EventPage/Event"));
const EventData = lazy(() => import("./components/LandingPage/Component/EventPage/EventData"));
const ContactPage = lazy(() =>
  import("./components/LandingPage/Component/ContactUs/ContactUs").then((m) => ({ default: m.ContactPage }))
);
const Blogs = lazy(() => import("./components/LandingPage/Component/Blogs/Blog"));
const BlogDetails = lazy(() => import("./components/LandingPage/Component/Blogs/BlogDetails"));
const Gallery = lazy(() => import("./components/LandingPage/Component/Gallery/Gallery"));
const Terms = lazy(() => import("./components/LandingPage/Component/TermsAndConditons/Terms"));
const Privacy = lazy(() => import("./components/LandingPage/Component/TermsAndConditons/Privacy"));
const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Auth/Register"));
const ForgotPassword = lazy(() => import("./components/Auth/ForgotPassword"));

// Member dashboard
const DashboardLayout = lazy(() => import("./components/Dashboard/Component/DashboardLayout"));
const Dashboard = lazy(() => import("./components/Dashboard/Component/Dashboard"));
const EventSection = lazy(() => import("./components/Dashboard/Component/EventsSection/EventSection"));
const DashboardEventData = lazy(() => import("./components/Dashboard/Component/EventsSection/EventData"));
const InitiativesSection = lazy(() => import("./components/Dashboard/Component/EventsSection/InitiativesSection"));
const DashboardInitiativesData = lazy(() => import("./components/Dashboard/Component/EventsSection/InitiativeData"));
const Profile = lazy(() => import("./components/Dashboard/Component/UserProfile/Profile"));
const UserProfile = lazy(() => import("./components/Dashboard/Component/UserProfile/UserProfile"));
const CheckUser = lazy(() => import("./components/Dashboard/Component/UserProfile/CheckUser"));
const ChangePassword = lazy(() => import("./components/Dashboard/Component/UserProfile/ChangePassword"));
const Batchmate = lazy(() => import("./components/Dashboard/Component/BatchMate-section/Batchmate"));
const PostsByFollowing = lazy(() => import("./components/Dashboard/Component/MainContent/PostsByFollowing"));
const Membership = lazy(() => import("./components/Dashboard/Component/Membership/Membership"));
const AdminPanel = lazy(() => import("./components/Admin/AdminPanel"));

const AUTH_PATHS = ["/login", "/register", "/forgotPassword"];

/** Scroll to the top on navigation (but not when a page asked to scroll to a section). */
const ScrollToTop = () => {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (!state?.scrollTo) window.scrollTo(0, 0);
  }, [pathname, state]);
  return null;
};

const PublicLayout = () => {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<FullPageLoader minHeight="70vh" />}>
          <Outlet />
        </Suspense>
      </main>
      {!AUTH_PATHS.includes(location.pathname) && <Footers />}
      <BottomNav />
    </>
  );
};

/** Old content-management URLs now open the matching Admin Panel section. */
const adminRedirect = (tab) => <Navigate to={`/dashboard/admin?tab=${tab}`} replace />;

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer position="top-center" autoClose={3500} newestOnTop theme="light" />
        <ScrollToTop />
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/becomemember" element={<Navigate to="/dashboard/membership" replace />} />

            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<Event />} />
              <Route path="/events/:eventName/:slug?" element={<EventData />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgotPassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/Blogs" element={<Blogs />} />
              <Route path="/Blogs/:BlogId" element={<BlogDetails />} />
              <Route path="/Gallery" element={<Gallery />} />
              <Route path="/Terms" element={<Terms />} />
              <Route path="/Privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="addEvents" element={<EventSection />} />
              <Route path="event/:eventName/*" element={<DashboardEventData />} />
              <Route path="followingPost" element={<PostsByFollowing />} />
              <Route path="addInitiatives" element={<InitiativesSection />} />
              <Route path="addInitiatives/:InitiativeId" element={<DashboardInitiativesData />} />
              <Route path="userProfile" element={<Profile />} />
              <Route path="userProfile/:UserId" element={<CheckUser />} />
              <Route path="updateProfile" element={<UserProfile />} />
              <Route path="changePassword" element={<ChangePassword />} />
              <Route path="batchmates" element={<Batchmate />} />
              <Route path="membership" element={<Membership />} />
              <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              <Route path="add-achievement" element={adminRedirect("achievements")} />
              <Route path="add-testimonial" element={adminRedirect("testimonials")} />
              <Route path="add-committee" element={adminRedirect("committee")} />
              <Route path="add-blog" element={adminRedirect("blogs")} />
              <Route path="add-gallery" element={adminRedirect("gallery")} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

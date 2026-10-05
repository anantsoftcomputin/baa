import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import CssBaseline from "@mui/material/CssBaseline";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, MemberRoute, AdminRoute, PublicRoute } from "./components/ProtectedRoute";
//landing page components
import Navbar from "./components/LandingPage/Component/Navbar/Navbar";
import LandingPage from "./components/LandingPage/LandingPage";
import Event from "./components/LandingPage/Component/EventPage/Event";
import EventData from "./components/LandingPage/Component/EventPage/EventData";
import Contact from "./components/LandingPage/Component/ContactUs/ContactUs";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Footers from "./components/LandingPage/Component/Footer/Footers";
import Blogs from "./components/LandingPage/Component/Blogs/Blog";
import Gallery from "./components/LandingPage/Component/Gallery/Gallery";
import Terms from "./components/LandingPage/Component/TermsAndConditons/Terms";
import Privacy from "./components/LandingPage/Component/TermsAndConditons/Privacy";
// dashboard components
import Dashboard from "./components/Dashboard/Component/Dashboard";
import AdminNavbar from "./components/Dashboard/Component/Navbar/Navbar";
import AdminSidebar from "./components/Dashboard/Component/SideBar/Sidebar";
import Profile from "./components/Dashboard/Component/UserProfile/Profile";
import UserProfile from "./components/Dashboard/Component/UserProfile/UserProfile";
import EventSection from "./components/Dashboard/Component/EventsSection/EventSection";
import InitiativesSection from "./components/Dashboard/Component/EventsSection/InitiativesSection";
import Batchmate from "./components/Dashboard/Component/BatchMate-section/Batchmate";
import CheckUser from "./components/Dashboard/Component/UserProfile/CheckUser";
import DashboardEventData from "./components/Dashboard/Component/EventsSection/EventData";
import DashboardInitiativesData from "./components/Dashboard/Component/EventsSection/InitiativeData";
import BlogDetails from "./components/LandingPage/Component/Blogs/BlogDetails";
import PostsByFollowing from "./components/Dashboard/Component/MainContent/PostsByFollowing";
import ChangePassword from "./components/Dashboard/Component/UserProfile/ChangePassword";
import DashboardTwo from "./components/Dashboard/Component/DashboardTwo";
import HeroBanner from "./components/LandingPage/Component/Content/HeroBanner";
import AdminPanel from "./components/Admin/AdminPanel";
import AddAchievement from "./components/Dashboard/Component/ContentManagement/AddAchievement";
import AddTestimonial from "./components/Dashboard/Component/ContentManagement/AddTestimonial";
import AddCommitteeMember from "./components/Dashboard/Component/ContentManagement/AddCommitteeMember";
import AddBlog from "./components/Dashboard/Component/ContentManagement/AddBlog";
import AddGalleryImage from "./components/Dashboard/Component/ContentManagement/AddGalleryImage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF8C42", // Vibrant Orange
      light: "#FFB366",
      dark: "#E67A2E",
      contrastText: "#1A1A1A",
    },
    secondary: {
      main: "#8B4513", // Rich Brown
      light: "#A0522D",
      dark: "#5C2E0A",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A", // Deep Black
      secondary: "#4A4A4A",
    },
    error: {
      main: "#D32F2F",
    },
    warning: {
      main: "#FF8C42",
    },
    info: {
      main: "#8B4513",
    },
    success: {
      main: "#2E7D32",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "3.5rem",
      letterSpacing: "-0.02em",
      color: "#1A1A1A",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.75rem",
      letterSpacing: "-0.01em",
      color: "#1A1A1A",
    },
    h3: {
      fontWeight: 600,
      fontSize: "2.25rem",
      color: "#1A1A1A",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.75rem",
      color: "#1A1A1A",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
      color: "#4A4A4A",
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    "none",
    "0px 2px 8px rgba(255, 140, 66, 0.08)",
    "0px 4px 16px rgba(255, 140, 66, 0.12)",
    "0px 8px 24px rgba(139, 69, 19, 0.15)",
    "0px 12px 32px rgba(26, 26, 26, 0.12)",
    "0px 16px 40px rgba(255, 140, 66, 0.2)",
    ...Array(19).fill("0px 20px 48px rgba(26, 26, 26, 0.15)"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 32px",
          fontSize: "1rem",
          fontWeight: 600,
          boxShadow: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0px 8px 24px rgba(255, 140, 66, 0.25)",
            transform: "translateY(-2px)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #FF8C42 0%, #E67A2E 100%)",
          color: "#FFFFFF",
          "&:hover": {
            background: "linear-gradient(135deg, #FFB366 0%, #FF8C42 100%)",
          },
        },
        outlined: {
          borderColor: "#FF8C42",
          color: "#FF8C42",
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
            borderColor: "#E67A2E",
            backgroundColor: "rgba(255, 140, 66, 0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0px 4px 20px rgba(26, 26, 26, 0.08)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "1px solid rgba(255, 140, 66, 0.1)",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0px 16px 48px rgba(255, 140, 66, 0.2)",
            borderColor: "rgba(255, 140, 66, 0.3)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0px 4px 16px rgba(26, 26, 26, 0.06)",
        },
        elevation2: {
          boxShadow: "0px 8px 24px rgba(26, 26, 26, 0.08)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 16px rgba(26, 26, 26, 0.08)",
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
        filled: {
          background: "linear-gradient(135deg, #FF8C42 0%, #E67A2E 100%)",
          color: "#FFFFFF",
        },
      },
    },
  },
});

function App() {
  const location = useLocation();
  const hideFooterPaths = [
    "/login",
    "/register",
    "/dashboard",
    "/forgotPassword",
  ];

  const hideBanner = ["/login", "/register", "/forgotPassword"];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const Layout = () => {
    return (
      <>
        <Navbar />
        {!hideBanner.includes(location.pathname) && <HeroBanner />}
        <Outlet />
        {!hideFooterPaths.includes(location.pathname) && <Footers />}
      </>
    );
  };

  const AdminLayout = () => {
    return (
      <>
        <AdminNavbar handleDrawerToggle={handleDrawerToggle} />
        <AdminSidebar
          drawerOpen={drawerOpen}
          handleDrawerToggle={handleDrawerToggle}
        />
        <Outlet />
      </>
    );
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <ToastContainer theme="colored" position="top-center" autoClose={3000} />
        <CssBaseline />
        <Routes>
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<Event />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events/:eventName" element={<EventData />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/Blogs" element={<Blogs />} />
            <Route path="/Blogs/:BlogId" element={<BlogDetails />} />
            <Route path="/Gallery" element={<Gallery />} />
            <Route path="/forgotPassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/Terms" element={<Terms />} />
            <Route path="/Privacy" element={<Privacy />} />
          </Route>

          <Route path="/dashboard" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="/dashboard/addEvents" element={<EventSection />} />
            <Route
              path="/dashboard/followingPost"
              element={<PostsByFollowing />}
            />
            <Route
              path="/dashboard/event/:eventName"
              element={<DashboardEventData />}
            />
            <Route
              path="/dashboard/addInitiatives"
              element={<InitiativesSection />}
            />
            <Route
              path="/dashboard/addInitiatives/:InitiativeId"
              element={<DashboardInitiativesData />}
            />
            <Route path="/dashboard/userProfile" element={<Profile />} />
            <Route path="/dashboard/updateProfile" element={<UserProfile />} />
            <Route
              path="/dashboard/changePassword"
              element={<ChangePassword />}
            />
            <Route
              path="/dashboard/userProfile/:UserId"
              element={<CheckUser />}
            />
            <Route path="/dashboard/batchmates" element={<Batchmate />} />
            <Route path="/dashboard/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/dashboard/add-achievement" element={<AdminRoute><AddAchievement /></AdminRoute>} />
            <Route path="/dashboard/add-testimonial" element={<AdminRoute><AddTestimonial /></AdminRoute>} />
            <Route path="/dashboard/add-committee" element={<AdminRoute><AddCommitteeMember /></AdminRoute>} />
            <Route path="/dashboard/add-blog" element={<AdminRoute><AddBlog /></AdminRoute>} />
            <Route path="/dashboard/add-gallery" element={<AdminRoute><AddGalleryImage /></AdminRoute>} />
          </Route>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

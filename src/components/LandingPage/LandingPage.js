import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import AboutUs from "./Component/Content/AboutUs";
import Achievements from "./Component/Content/Achievements";
import Testimonials from "./Component/Content/Testimonials";
import ContactUs from "./Component/ContactUs/ContactUs";
import Events from "./Component/Content/Events";
import Committee from "./Component/Content/Committee";
import Initiatives from "./Component/Content/Initiatives";
import Gallery from "./Component/Gallery/Gallery";
import Blogs from "./Component/Blogs/Blog";
import { useNavigate } from "react-router-dom";
import FeedbackForm from "./Component/Feedback/FeedbackForm";
import LogoImg from "../images/BAA.png";
import { 
  getWebsiteContent, 
  getAchievements, 
  getTestimonials, 
  getCommitteeMembers,
  getBlogs,
  getGalleryImages
} from "../../firebase/firestore";
import { getAllEvents, getAllInitiatives } from "../../firebase/firestore";

const LandingPage = () => {
  const navigate = useNavigate();
  const [aboutusData, setAboutusData] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [testimonialsData, setTestimonialsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [InitiativesData, setInitiativesData] = useState([]);
  const [committeeData, setCommitteeData] = useState([]);
  const [blogsData, setBlogsData] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [aboutUs, achievements, testimonials, events, initiatives, committee, blogs, gallery] = await Promise.all([
          getWebsiteContent("aboutUs"),
          getAchievements(),
          getTestimonials(),
          getAllEvents(),
          getAllInitiatives(),
          getCommitteeMembers(),
          getBlogs(),
          getGalleryImages()
        ]);
        
        setAboutusData(aboutUs || {});
        setAchievements(achievements || []);
        setTestimonialsData(testimonials || []);
        setEventsData(events || []);
        setInitiativesData(initiatives || []);
        setCommitteeData(committee || []);
        setBlogsData(blogs || []);
        setGalleryData(gallery || []);
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleFeedbackOpen = () => {
    setIsFeedbackOpen(true);
  };

  const handleFeedbackClose = () => {
    setIsFeedbackOpen(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          position: "relative",
        }}
      >
        <CircularProgress size={120} sx={{ position: "absolute", zIndex: 0 }} />
        <img
          src={LogoImg}
          alt="Loading Logo"
          style={{
            width: "90px",
            height: "90px",
            position: "relative",
            zIndex: 1,
          }}
        />
      </Box>
    );
  }

  const handleLifetimeMembershipClick = () => {
    navigate("/register");
  };

  return (
    <>
      <div id="about-us">
        <AboutUs aboutusData={aboutusData} />
      </div>
      <div id="events">
        <Events eventsData={eventsData} />
      </div>
      <div id="initiatives">
        <Initiatives InitiativesData={InitiativesData} />
      </div>
      <div id="committee">
        <Committee committeeData={committeeData} />
      </div>
      <div id="achievements">
        <Achievements achievements={achievements} />
      </div>
      <div id="testimonials">
        <Testimonials testimonialsData={testimonialsData} />
      </div>
      <div id="gallery">
        <Gallery galleryData={galleryData} />
      </div>
      <div id="blogs">
        <Blogs blogsData={blogsData} />
      </div>
      <div id="contact-us">
        <ContactUs />
      </div>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          textAlign: "center",
          padding: "16px 20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleLifetimeMembershipClick}
          sx={{
            fontSize: "14px",
            padding: "9px 30px",
            marginRight: "20px",
            borderRadius: "25px",
            background: "rgb(241 169 75)",
            color: "#fff",
            fontWeight: "bold",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
            transition: "all 0.4s ease",
            "&:hover": {
              background: "rgb(241 169 75)",
              transform: "scale(1.05)",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
            },
            "&:focus": {
              outline: "none",
              boxShadow: "0 0 15px rgba(33, 150, 243, 0.6)",
            },
          }}
        >
          Become A Lifetime Member
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={handleFeedbackOpen}
          sx={{
            fontSize: "14px",
            padding: "9px 30px",
            borderRadius: "25px",
            textTransform: "none",
            background: "rgb(75 169 241)",
            color: "#fff",
            fontWeight: "bold",
            position: "fixed",
            right: "20px",
            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
            transition: "all 0.4s ease",
            "&:hover": {
              background: "rgb(75 169 241)",
              transform: "scale(1.05)",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
            },
            "&:focus": {
              outline: "none",
              boxShadow: "0 0 15px rgba(33, 150, 243, 0.6)",
            },
          }}
        >
          <ThumbUpAltIcon style={{ verticalAlign: "middle", marginRight: 4 }} />{" "}
          Feedback
        </Button>
      </Box>

      <FeedbackForm open={isFeedbackOpen} handleClose={handleFeedbackClose} />
    </>
  );
};

export default LandingPage;

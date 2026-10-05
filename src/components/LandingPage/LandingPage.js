import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Fab, Tooltip } from "@mui/material";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import HeroBanner from "./Component/Content/HeroBanner";
import AboutUs from "./Component/Content/AboutUs";
import Events from "./Component/Content/Events";
import Initiatives from "./Component/Content/Initiatives";
import MembershipCta from "./Component/Content/MembershipCta";
import Committee from "./Component/Content/Committee";
import Achievements from "./Component/Content/Achievements";
import Testimonials from "./Component/Content/Testimonials";
import { GalleryPreview } from "./Component/Gallery/Gallery";
import { BlogPreview } from "./Component/Blogs/Blog";
import ContactUs from "./Component/ContactUs/ContactUs";
import FeedbackForm from "./Component/Feedback/FeedbackForm";
import { scrollToSection } from "./Component/Navbar/Navbar";
import {
  getWebsiteContent,
  getAchievements,
  getTestimonials,
  getCommitteeMembers,
  getBlogs,
  getGalleryImages,
  getAllEvents,
  getAllInitiatives,
  getMembershipSettings,
} from "../../firebase/firestore";
import { isUpcoming } from "../../utils/format";

const safe = (promise, fallback) => promise.catch(() => fallback);

const LandingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState({
    about: null,
    achievements: [],
    testimonials: [],
    events: [],
    initiatives: [],
    committee: [],
    blogs: [],
    gallery: [],
    membership: null,
  });
  const [loaded, setLoaded] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    // Each section degrades independently if its query fails.
    Promise.all([
      safe(getWebsiteContent("aboutUs"), null),
      safe(getAchievements(), []),
      safe(getTestimonials(), []),
      safe(getAllEvents(), []),
      safe(getAllInitiatives(), []),
      safe(getCommitteeMembers(), []),
      safe(getBlogs(), []),
      safe(getGalleryImages(), []),
      safe(getMembershipSettings(), null),
    ]).then(([about, achievements, testimonials, events, initiatives, committee, blogs, gallery, membership]) => {
      if (!alive) return;
      setData({ about, achievements, testimonials, events, initiatives, committee, blogs, gallery, membership });
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Arriving from another page via a "section" nav link: scroll once content has rendered.
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!loaded || !target) return;
    const t = setTimeout(() => {
      scrollToSection(target);
      navigate(".", { replace: true, state: null });
    }, 60);
    return () => clearTimeout(t);
  }, [loaded, location.state, navigate]);

  const stats = loaded
    ? [
        { value: data.events.filter((e) => isUpcoming(e)).length || data.events.length, label: data.events.some((e) => isUpcoming(e)) ? "Upcoming events" : "Events hosted" },
        { value: data.initiatives.length, label: "Community initiatives" },
        { value: data.committee.length, label: "Committee members" },
        { value: data.gallery.length, label: "Shared memories" },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <>
      <HeroBanner stats={stats} />
      <div id="about-us">
        <AboutUs aboutusData={data.about} />
      </div>
      <div id="events">
        <Events eventsData={data.events} />
      </div>
      <div id="initiatives">
        <Initiatives InitiativesData={data.initiatives} />
      </div>
      <div id="membership">
        <MembershipCta fee={data.membership?.amount} benefits={data.membership?.benefits} />
      </div>
      <div id="committee">
        <Committee committeeData={data.committee} />
      </div>
      <div id="achievements">
        <Achievements achievements={data.achievements} />
      </div>
      <div id="testimonials">
        <Testimonials testimonialsData={data.testimonials} />
      </div>
      <div id="gallery">
        <GalleryPreview galleryData={data.gallery} />
      </div>
      <div id="blogs">
        <BlogPreview blogsData={data.blogs} />
      </div>
      <div id="contact-us">
        <ContactUs />
      </div>

      <Tooltip title="Share feedback" placement="left">
        <Fab
          color="secondary"
          aria-label="Share feedback"
          onClick={() => setFeedbackOpen(true)}
          sx={{ position: "fixed", right: { xs: 16, md: 28 }, bottom: { xs: "calc(80px + env(safe-area-inset-bottom))", md: 28 }, zIndex: 1200 }}
        >
          <RateReviewRoundedIcon />
        </Fab>
      </Tooltip>
      <FeedbackForm open={feedbackOpen} handleClose={() => setFeedbackOpen(false)} />
    </>
  );
};

export default LandingPage;

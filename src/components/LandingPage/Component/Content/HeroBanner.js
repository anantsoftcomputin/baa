import React, { useEffect, useState } from "react";
import { Box, Button, Container, Typography, useMediaQuery, useTheme } from "@mui/material";
import { styled, keyframes } from "@mui/system";
import { getHeroImages } from "../../../../firebase/firestore";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

// Animations
const kenBurns = keyframes`
  0% {
    transform: scale(1) translateX(0);
  }
  50% {
    transform: scale(1.15) translateX(-5%);
  }
  100% {
    transform: scale(1) translateX(0);
  }
`;

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const HeroSection = styled(Box)(({ theme }) => ({
  height: "100vh",
  minHeight: "600px",
  display: "flex",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  background: "#1A1A1A",
  [theme.breakpoints.down("md")]: {
    minHeight: "500px",
    height: "calc(100vh - 70px)", // Account for bottom nav
  },
}));

const BackgroundImage = styled("div")(({ bgImage }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  zIndex: 0,
  animation: `${kenBurns} 25s ease-in-out infinite alternate`,
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `
      linear-gradient(135deg, 
        rgba(26, 26, 26, 0.85) 0%, 
        rgba(139, 69, 19, 0.65) 40%,
        rgba(255, 140, 66, 0.4) 100%
      )
    `,
  },
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  position: "relative",
  zIndex: 2,
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.down("md")]: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: "clamp(2.5rem, 8vw, 5rem)",
  lineHeight: 1.1,
  color: "#FFFFFF",
  marginBottom: theme.spacing(3),
  textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  animation: `${fadeInUp} 1s ease-out`,
  letterSpacing: "-0.02em",
  background: "linear-gradient(135deg, #FFFFFF 0%, #FFB366 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundSize: "200% auto",
  animation: `${shimmer} 3s linear infinite, ${fadeInUp} 1s ease-out`,
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
  color: "rgba(255, 255, 255, 0.95)",
  marginBottom: theme.spacing(5),
  maxWidth: "700px",
  textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)",
  animation: `${fadeInUp} 1s ease-out 0.2s both`,
  lineHeight: 1.6,
  fontWeight: 400,
  [theme.breakpoints.down("md")]: {
    marginBottom: theme.spacing(4),
  },
}));

const CTAButton = styled(Button)(({ theme }) => ({
  padding: "16px 40px",
  fontSize: "1.1rem",
  fontWeight: 700,
  borderRadius: "16px",
  textTransform: "none",
  background: "linear-gradient(135deg, #FF8C42 0%, #E67A2E 100%)",
  color: "#FFFFFF",
  boxShadow: "0 8px 24px rgba(255, 140, 66, 0.4)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeInUp} 1s ease-out 0.4s both`,
  border: "2px solid transparent",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #FFB366 0%, #FF8C42 100%)",
    opacity: 0,
    transition: "opacity 0.4s ease",
  },
  "&:hover": {
    transform: "translateY(-4px) scale(1.02)",
    boxShadow: "0 12px 32px rgba(255, 140, 66, 0.5)",
    "&::before": {
      opacity: 1,
    },
  },
  "&:active": {
    transform: "translateY(-2px) scale(0.98)",
  },
  "& .MuiButton-endIcon": {
    transition: "transform 0.3s ease",
  },
  "&:hover .MuiButton-endIcon": {
    transform: "translateX(6px)",
  },
  [theme.breakpoints.down("md")]: {
    padding: "14px 32px",
    fontSize: "1rem",
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  padding: "16px 40px",
  fontSize: "1.1rem",
  fontWeight: 700,
  borderRadius: "16px",
  textTransform: "none",
  color: "#FFFFFF",
  border: "2px solid rgba(255, 255, 255, 0.5)",
  backdropFilter: "blur(10px)",
  background: "rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  animation: `${fadeInUp} 1s ease-out 0.5s both`,
  "&:hover": {
    background: "rgba(255, 255, 255, 0.2)",
    border: "2px solid rgba(255, 255, 255, 0.8)",
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
  },
  [theme.breakpoints.down("md")]: {
    padding: "14px 32px",
    fontSize: "1rem",
  },
}));

const ScrollIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: "40px",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1),
  color: "#FFFFFF",
  opacity: 0.8,
  animation: `${fadeInUp} 1s ease-out 0.8s both`,
  cursor: "pointer",
  transition: "opacity 0.3s ease",
  "&:hover": {
    opacity: 1,
  },
  [theme.breakpoints.down("md")]: {
    display: "none", // Hide on mobile
  },
}));

const MouseIcon = styled(Box)({
  width: "26px",
  height: "42px",
  border: "2px solid #FFFFFF",
  borderRadius: "20px",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    top: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "8px",
    background: "#FFFFFF",
    borderRadius: "4px",
    animation: "scroll 1.5s infinite",
  },
  "@keyframes scroll": {
    "0%": {
      opacity: 1,
      transform: "translateX(-50%) translateY(0)",
    },
    "100%": {
      opacity: 0,
      transform: "translateX(-50%) translateY(16px)",
    },
  },
});

const HeroBanner = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [heroImages, setHeroImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const images = await getHeroImages();
        setHeroImages(images);
      } catch (error) {
        console.error("Error fetching hero images:", error);
        setHeroImages([]);
      }
    };
    fetchData();
  }, []);

  const scrollToContent = () => {
    const element = document.getElementById("about-us");
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {heroImages.map((heroimg, index) => (
        <HeroSection key={index}>
          <BackgroundImage bgImage={heroimg.image} />
          <ContentWrapper>
            <Box sx={{ maxWidth: "900px" }}>
              <MainTitle variant="h1">
                {heroimg.title || "Building Connections, Creating Futures"}
              </MainTitle>
              <Subtitle variant="h5">
                {heroimg.subtitle || "Join thousands of alumni in a thriving community dedicated to growth, networking, and lifelong success"}
              </Subtitle>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <CTAButton
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/register")}
                >
                  Join Our Community
                </CTAButton>
                <OutlinedButton
                  variant="outlined"
                  size="large"
                  onClick={() => scrollToContent()}
                >
                  Discover More
                </OutlinedButton>
              </Box>
            </Box>
          </ContentWrapper>
          <ScrollIndicator onClick={scrollToContent}>
            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: "1px" }}>
              SCROLL
            </Typography>
            <MouseIcon />
          </ScrollIndicator>
        </HeroSection>
      ))}
    </>
  );
};

export default HeroBanner;

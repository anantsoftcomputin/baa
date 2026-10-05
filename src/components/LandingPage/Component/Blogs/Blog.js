import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  styled,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { getBlogs } from "../../../../firebase/firestore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: "bold",
  position: "relative",
  color: "#fba645",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    left: 0,
    width: "50px",
    height: "3px",
    backgroundColor: theme.palette.primary.main,
  },
}));

const Blogs = ({ blogsData: initialBlogsData = [] }) => {
  const navigate = useNavigate();
  const [blogData, setblogData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use prop data if provided, otherwise fetch
    if (initialBlogsData && initialBlogsData.length > 0) {
      setblogData(initialBlogsData);
      setLoading(false);
    } else {
      const fetchData = async () => {
        try {
          const blogs = await getBlogs();
          setblogData(blogs || []);
        } catch (error) {
          console.error("Error fetching blogs:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [initialBlogsData]);

  useEffect(() => {
    // Scroll animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".scroll-animate").forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [blogData]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, mb: 4, textAlign: "center" }}>
        <Box className="animate-pulse">
          <Typography variant="h4" sx={{ color: "#fba645" }}>
            Loading Blogs...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!blogData || blogData.length === 0) {
    return (
      <Container sx={{ mt: 4, mb: 4 }}>
        <SectionTitle variant="h4" className="animate-fade-in-down">
          Blogs
        </SectionTitle>
        <Typography variant="body1" className="animate-fade-in-up delay-200">
          No Blogs available at the moment.
        </Typography>
      </Container>
    );
  }

  const handleKnowMore = (BlogId) => {
    navigate(`/Blogs/${BlogId}`);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Recently";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Container sx={{ mt: 4, mb: 4 }}>
        <SectionTitle 
          variant="h4" 
          className="animate-fade-in-down"
          sx={{
            textAlign: { xs: "center", md: "left" },
            fontSize: { xs: "2rem", md: "2.5rem" }
          }}
        >
          Latest Blogs
        </SectionTitle>
        <Grid container spacing={3}>
          {blogData.map((Blog, index) => (
            <Grid item xs={12} sm={6} md={4} key={Blog.id || index}>
              <Card
                className="scroll-animate glass-morph"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  padding: 0,
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(251, 166, 69, 0.15)",
                  background: "rgba(255, 255, 255, 0.95)",
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "&:hover": {
                    transform: "translateY(-12px) scale(1.02)",
                    boxShadow: "0 20px 60px rgba(251, 166, 69, 0.3)",
                  },
                }}
              >
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={Blog.imageUrl || Blog.image || "https://via.placeholder.com/400x200?text=Blog"}
                    alt={Blog.title}
                    sx={{
                      transition: "transform 0.6s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)",
                      px: 2,
                      py: 0.5,
                      borderRadius: "20px",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
                      New
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: "3.6em",
                    }}
                  >
                    {Blog.title}
                  </Typography>
                  
                  <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    {Blog.tags && Blog.tags.slice(0, 3).map((tag, i) => (
                      <Chip 
                        key={i}
                        label={tag} 
                        size="small" 
                        sx={{ 
                          backgroundColor: "rgba(251, 166, 69, 0.1)",
                          color: "#fba645",
                          fontWeight: 600,
                          fontSize: "0.7rem"
                        }} 
                      />
                    ))}
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      minHeight: "4.5em",
                    }}
                  >
                    {Blog.content?.substring(0, 120)}...
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: 2, color: "text.secondary" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PersonIcon fontSize="small" />
                      <Typography variant="caption">{Blog.author || "Admin"}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="caption">{formatDate(Blog.createdAt)}</Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleKnowMore(Blog.id)}
                    sx={{
                      py: 1.2,
                      borderRadius: "50px",
                      background: "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)",
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 4px 12px rgba(251, 166, 69, 0.3)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(251, 166, 69, 0.4)",
                      },
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Blogs;

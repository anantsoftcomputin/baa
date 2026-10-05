import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Container,
  styled,
  Typography,
  Tabs,
  Tab,
  Box,
  Grid,
  Dialog,
  IconButton,
  CircularProgress,
  Chip,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CategoryIcon from "@mui/icons-material/Category";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import { getGalleryImages } from "../../../../firebase/firestore";

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

const Gallery = ({ galleryData: initialGalleryData = [] }) => {
  const [galleryData, setGalleryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [filterType, setFilterType] = useState("category"); // category, batch, event
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openLightbox, setOpenLightbox] = useState(false);

  useEffect(() => {
    // Use prop data if provided, otherwise fetch
    if (initialGalleryData && initialGalleryData.length > 0) {
      setGalleryData(initialGalleryData);
      setLoading(false);
    } else {
      const fetchGalleryData = async () => {
        try {
          setLoading(true);
          const images = await getGalleryImages();
          setGalleryData(images);
        } catch (error) {
          console.error("Error fetching gallery:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchGalleryData();
    }
  }, [initialGalleryData]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".gallery-item").forEach((item) => {
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, [galleryData]);

  const handleFilterTypeChange = (event, newFilterType) => {
    if (newFilterType !== null) {
      setFilterType(newFilterType);
      // Reset filters when changing filter type
      setSelectedCategory("all");
      setSelectedBatch("all");
      setSelectedEvent("all");
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenLightbox(true);
  };

  const handleCloseLightbox = () => {
    setOpenLightbox(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  // Extract unique categories, batches, and events
  const categories = [
    ...new Set(galleryData.map((item) => item.category).filter(Boolean)),
  ];
  
  const batches = [
    ...new Set(galleryData.map((item) => item.batch).filter(Boolean)),
  ].sort();
  
  const events = [
    ...new Set(galleryData.map((item) => item.eventName).filter(Boolean)),
  ];

  // Apply filters based on filter type
  let filteredImages = galleryData;
  
  if (filterType === "category" && selectedCategory !== "all") {
    filteredImages = filteredImages.filter((item) => item.category === selectedCategory);
  } else if (filterType === "batch" && selectedBatch !== "all") {
    filteredImages = filteredImages.filter((item) => item.batch === selectedBatch);
  } else if (filterType === "event" && selectedEvent !== "all") {
    filteredImages = filteredImages.filter((item) => item.eventName === selectedEvent);
  }

  return (
    <>
      <Container sx={{ mt: 8, mb: 8 }}>
        <SectionTitle variant="h4" className="fadeInUp">
          Gallery
        </SectionTitle>

        {/* Filter Type Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterTypeChange}
            sx={{
              '& .MuiToggleButton-root': {
                px: 3,
                py: 1,
                fontWeight: 600,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #fba645 0%, #ff8c00 100%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8c00 0%, #fba645 100%)',
                  },
                },
              },
            }}
          >
            <ToggleButton value="category">
              <CategoryIcon sx={{ mr: 1 }} />
              Category
            </ToggleButton>
            <ToggleButton value="batch">
              <SchoolIcon sx={{ mr: 1 }} />
              Batch
            </ToggleButton>
            <ToggleButton value="event">
              <EventIcon sx={{ mr: 1 }} />
              Event
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Category Filters */}
        {filterType === "category" && (
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Chip
              label="All"
              onClick={() => setSelectedCategory("all")}
              sx={{
                background:
                  selectedCategory === "all"
                    ? "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)"
                    : "rgba(251, 166, 69, 0.1)",
                color: selectedCategory === "all" ? "#fff" : "#fba645",
                fontWeight: "bold",
                px: 2,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  transform: "translateY(-3px) scale(1.05)",
                  boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
                },
              }}
              icon={<CategoryIcon />}
            />
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setSelectedCategory(category)}
                sx={{
                  background:
                    selectedCategory === category
                      ? "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)"
                      : "rgba(251, 166, 69, 0.1)",
                  color: selectedCategory === category ? "#fff" : "#fba645",
                  fontWeight: "bold",
                  px: 2,
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.05)",
                    boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Batch Filters */}
        {filterType === "batch" && (
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Chip
              label="All Batches"
              onClick={() => setSelectedBatch("all")}
              sx={{
                background:
                  selectedBatch === "all"
                    ? "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)"
                    : "rgba(251, 166, 69, 0.1)",
                color: selectedBatch === "all" ? "#fff" : "#fba645",
                fontWeight: "bold",
                px: 2,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  transform: "translateY(-3px) scale(1.05)",
                  boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
                },
              }}
              icon={<SchoolIcon />}
            />
            {batches.map((batch) => (
              <Chip
                key={batch}
                label={batch}
                onClick={() => setSelectedBatch(batch)}
                sx={{
                  background:
                    selectedBatch === batch
                      ? "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)"
                      : "rgba(251, 166, 69, 0.1)",
                  color: selectedBatch === batch ? "#fff" : "#fba645",
                  fontWeight: "bold",
                  px: 2,
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.05)",
                    boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Event Filters */}
        {filterType === "event" && (
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Chip
              label="All Events"
              onClick={() => setSelectedEvent("all")}
              sx={{
                background:
                  selectedEvent === "all"
                    ? "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)"
                    : "rgba(251, 166, 69, 0.1)",
                color: selectedEvent === "all" ? "#fff" : "#fba645",
                fontWeight: "bold",
                px: 2,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                "&:hover": {
                  transform: "translateY(-3px) scale(1.05)",
                  boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
                },
              }}
              icon={<EventIcon />}
            />
            {events.map((event) => (
              <Chip
                key={event}
                label={event}
                onClick={() => setSelectedEvent(event)}
                sx={{
                  background:
                    selectedEvent === event
                      ? "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)"
                      : "rgba(251, 166, 69, 0.1)",
                  color: selectedEvent === event ? "#fff" : "#fba645",
                  fontWeight: "bold",
                  px: 2,
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.05)",
                    boxShadow: "0 8px 20px rgba(251, 166, 69, 0.4)",
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Loading State */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton
                  variant="rectangular"
                  height={280}
                  sx={{
                    borderRadius: 4,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{ mt: 1, animation: "pulse 1.5s ease-in-out 0.2s infinite" }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{ animation: "pulse 1.5s ease-in-out 0.4s infinite" }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {filteredImages.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item.id || index}>
                <Card
                  className="gallery-item"
                  onClick={() => handleImageClick(item)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(251, 166, 69, 0.1)",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    opacity: 0,
                    transform: "translateY(30px)",
                    "&.animate-in": {
                      opacity: 1,
                      transform: "translateY(0)",
                      transitionDelay: `${index * 0.1}s`,
                    },
                    "&:hover": {
                      transform: "translateY(-15px) scale(1.03)",
                      boxShadow: "0 20px 40px rgba(251, 166, 69, 0.3)",
                      border: "1px solid rgba(251, 166, 69, 0.3)",
                      "& .gallery-image": {
                        transform: "scale(1.15)",
                      },
                      "& .gallery-overlay": {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      image={item.imageUrl || item.image}
                      alt={item.title}
                      className="gallery-image"
                      sx={{
                        height: 280,
                        objectFit: "cover",
                        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    />
                    <Box
                      className="gallery-overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)",
                        opacity: 0,
                        transition: "opacity 0.4s ease",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#fff",
                          fontWeight: "bold",
                          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                        }}
                      >
                        Click to view
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        color: "#333",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title}
                    </Typography>
                    {item.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                    {item.category && (
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{
                          mt: 1,
                          background:
                            "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!loading && filteredImages.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              opacity: 0.7,
            }}
          >
            <Typography variant="h6" color="textSecondary">
              No images found in this category
            </Typography>
          </Box>
        )}
      </Container>

      {/* Lightbox Modal */}
      <Dialog
        open={openLightbox}
        onClose={handleCloseLightbox}
        maxWidth="lg"
        PaperProps={{
          sx: {
            background: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(251, 166, 69, 0.2)",
            borderRadius: 4,
            maxWidth: "90vw",
            maxHeight: "90vh",
          },
        }}
      >
        <IconButton
          onClick={handleCloseLightbox}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "#fff",
            background: "rgba(251, 166, 69, 0.8)",
            zIndex: 1,
            "&:hover": {
              background: "rgba(251, 166, 69, 1)",
              transform: "rotate(90deg) scale(1.1)",
            },
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <CloseIcon />
        </IconButton>
        {selectedImage && (
          <Box sx={{ p: 3 }}>
            <img
              src={selectedImage.imageUrl || selectedImage.image}
              alt={selectedImage.title}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: "16px",
              }}
            />
            <Box sx={{ mt: 3, color: "#fff", textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {selectedImage.title}
              </Typography>
              {selectedImage.description && (
                <Typography variant="body1" sx={{ color: "#ccc" }}>
                  {selectedImage.description}
                </Typography>
              )}
              {selectedImage.category && (
                <Chip
                  label={selectedImage.category}
                  sx={{
                    mt: 2,
                    background:
                      "linear-gradient(135deg, #fba645 0%, #ff8c00 100%)",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </Dialog>
    </>
  );
};

export default Gallery;

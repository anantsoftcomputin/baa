import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Grid,
  TextField,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { Add as AddIcon } from "@mui/icons-material";
import { AddPhotoAlternate as UploadIcon } from "@mui/icons-material";
import { useAuth } from "../../../../contexts/AuthContext";
import { createPost, getAllPosts, getPopularPosts } from "../../../../firebase/firestore";
import { uploadPostImage } from "../../../../firebase/storage";
import PostLike from "./Like-comment-share/PostLike";
import PostComment from "./Like-comment-share/PostComment";
import PostShare from "./Like-comment-share/PostShare";
import DashboardEvents from "./DashboardEvents";
import DashboardInitiatives from "./DashboardInitiatives";
import DashboardUsers from "./DashboardUsers";
import Membership from "../Membership/Membership";

const MainContent = ({ userID, eventsData, initiativesData, setCount }) => {
  const { currentUser, userProfile } = useAuth();
  const initialData = {
    images: [],
    likes: [],
    comments: [],
    shares: [],
    content: "",
    created_at: new Date().toISOString(),
    allow_likes: true,
    allow_comments: true,
    allow_sharing: true,
    author: currentUser?.uid,
    category: 1,
  };
  const fileInputRef = useRef(null);
  const [gettingData, setGettingData] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [postData, setPostData] = useState(initialData);
  const [refreshData, setRefreshData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [tabValue, setTabValue] = useState(1);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const images = e.target.files;
    setPostData((prevFormData) => ({
      ...prevFormData,
      images: images,
    }));
  };

  const handleIconClick = (e) => {
    e?.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const fetchRecentPosts = async () => {
    setIsLoading(true);
    try {
      const posts = await getAllPosts();
      const sortedData = posts.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setGettingData(sortedData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    }
    setIsLoading(false);
  };

  // for popular this week
  const fetchPopularPosts = async () => {
    setIsLoading(true);
    try {
      const posts = await getPopularPosts();
      setPopularPosts(posts);
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      toast.error("Failed to load popular posts");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (tabValue === 1) {
      fetchRecentPosts();
    } else if (tabValue === 2) {
      fetchPopularPosts();
    }
  }, [tabValue, refreshData]);

  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if content and images are empty
    if (!postData.content && postData.images.length === 0) {
      setValidationError("Please add content or upload an image.");
      return;
    }

    // Clear the validation error if the form is valid
    setValidationError("");

    try {
      setIsLoading(true);
      
      let imageUrl = null;
      
      // Upload image if exists
      if (postData.images.length > 0) {
        imageUrl = await uploadPostImage(currentUser.uid, postData.images[0]);
      }

      // Create post in Firestore
      await createPost({
        content: postData.content,
        image_url: imageUrl,
        user_id: currentUser.uid,
      });

      toast.success("Post Created Successfully");
      setRefreshData((prev) => !prev);
      setPostData({
        images: [],
        content: "",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    let past;
    
    // Handle Firebase Timestamp objects
    if (timestamp?.toDate) {
      past = timestamp.toDate();
    } else if (timestamp?.seconds) {
      past = new Date(timestamp.seconds * 1000);
    } else {
      past = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(past.getTime())) {
      return 'Just now';
    }
    
    const diffInMs = now - past;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  const renderPosts = (posts) => (
    <>
      {posts.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>
          No posts available
        </Typography>
      ) : (
        posts.map((data, index) => (
          <Card key={index} sx={{ display: "flex", mb: 2 }}>
            {data.image_url && (
              <CardMedia
                component="img"
                sx={{ width: 160 }}
                image={data.image_url}
                alt="Post image"
              />
            )}
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Avatar sx={{ mr: 1 }}>
                    {data.username ? data.username.charAt(0).toUpperCase() : "A"}
                  </Avatar>
                  <Typography variant="subtitle1">
                    {data.username || "Anonymous"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ ml: 1, color: "text.primary" }}
                  >
                    {timeAgo(data?.created_at)}
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  {data.content}
                </Typography>
              </CardContent>
              <CardActions>
                <PostLike
                  postId={data.id}
                  userId={currentUser?.uid}
                  likeCounts={data.likes || []}
                />
                <PostComment
                  postId={data.id}
                  userId={currentUser?.uid}
                  commentCounts={data.comments || []}
                />
                <PostShare
                  postId={data.id}
                  userId={currentUser?.uid}
                  shareCounts={data.shares || []}
                  postContent={data.content}
                />
              </CardActions>
            </Box>
          </Card>
        ))
      )}
    </>
  );

  return (
    <Container sx={{ mt: 10 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              name="content"
              value={postData.content}
              onChange={handleChange}
              placeholder="Add Post"
              sx={{ mb: 2, backgroundColor: "white" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {postData.images.length > 0 ? (
                      <>
                        <img
                          src={URL.createObjectURL(postData.images[0])}
                          alt="Uploaded"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                        <IconButton
                          onClick={() =>
                            setPostData((prev) => ({ ...prev, images: [] }))
                          }
                          color="primary"
                          component="span"
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton
                        onClick={handleIconClick}
                        color="primary"
                        component="span"
                      >
                        <UploadIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              name="images"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {validationError && (
              <Box sx={{ color: "red", mb: 2 }}>{validationError}</Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                type="submit"
                size="small"
              >
                Add Post
              </Button>
            </Box>
          </form>

          {isLoading ? (
            <Button variant="contained" color="primary" fullWidth disabled>
              <CircularProgress />
            </Button>
          ) : (
            <Paper
              sx={{ p: 2, boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)" }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ mb: 2 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Recent Thread" value={1} />
                <Tab label="Popular This Week" value={2} />
              </Tabs>

              {tabValue === 1 && renderPosts(gettingData)}
              {tabValue === 2 && renderPosts(popularPosts)}
            </Paper>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Membership />
          <DashboardEvents eventsData={eventsData} />
          <DashboardInitiatives
            initiativesData={initiativesData}
            setCount={setCount}
          />
          <DashboardUsers />
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainContent;

import React, { useEffect, useState } from "react";
import ajaxCall from "../../../helpers/ajaxCall";
import {
  Container,
  Grid,
  Paper,
  Card,
  Box,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  Link,
} from "@mui/material";
import Breadcrumb from "../../../Ul/Breadcrumb";

const PostsByFollowing = () => {
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const fetchData = async (url, setData) => {
    try {
      const response = await ajaxCall(
        url,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("loginInfo"))?.accessToken
            }`,
          },
          method: "GET",
        },
        8000
      );
      if (response?.status === 200) {
        setData(response?.data || []);
      } else {
        console.error("Fetch error:", response);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchData("profiles/following", setFollowing);
    fetchData("posts/post-get", setPosts);
  }, []);

  useEffect(() => {
    if (following?.following?.length > 0 && posts.length > 0) {
      const followingIds = following?.following?.map((user) => user.id);

      const filtered = posts.filter((post) => {
        if (post.author && post.author.id) {
          return followingIds.includes(post.author.id);
        }
        return false;
      });
      setFilteredPosts(filtered);
    }
  }, [following?.following, posts]);

  return (
    <Box sx={{ display: "flex" }}>
      <Container sx={{ mt: 10 }}>
        <Grid item xs={12} md={8}>
          <Breadcrumb title="Following User Posts" main="Dashboard" mb={2} />
          <Paper
            sx={{ p: 2, boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)", mt: 2 }}
          >
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card key={post.id} sx={{ display: "flex", mb: 2 }}>
                  {post.images && post.images.length > 0 && (
                    <Box sx={{ display: "flex" }}>
                      {post.images.map((imageData, index) => (
                        <CardMedia
                          key={index}
                          component="img"
                          sx={{ width: 160 }}
                          image={imageData.image}
                          alt={post.title}
                        />
                      ))}
                    </Box>
                  )}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
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
                          {post.author?.username
                            ? post.author?.username.charAt(0).toUpperCase()
                            : "A"}
                        </Avatar>
                        <Typography variant="subtitle1">
                          <Link
                            to={`/dashboard/userProfile/${post.author.id}`}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            {post.author?.username}
                          </Link>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, color: "text.primary" }}
                        >
                          {post.category?.name} •{" "}
                          {new Date(post?.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {post.title}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {post.content}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              ))
            ) : (
              <Typography variant="body1" align="center">
                No posts from following users.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Container>
    </Box>
  );
};

export default PostsByFollowing;

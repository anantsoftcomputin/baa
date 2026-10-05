import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Grid,
  Avatar,
  Typography,
  Divider,
  Paper,
  Button,
  Container,
  Card,
  IconButton,
  Tabs,
  Tab,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CallIcon from "@mui/icons-material/Call";
import PlaylistAddCheckCircleIcon from "@mui/icons-material/PlaylistAddCheckCircle";
import ajaxCall from "../../../helpers/ajaxCall";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f51b5",
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
  },
});

const CheckUser = () => {
  const { UserId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followData, setfollowData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);

  const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));

  const fetchData = useCallback(
    async (url, setData) => {
      try {
        const response = await ajaxCall(
          url,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${loginInfo?.accessToken}`,
            },
            method: "GET",
          },
          8000
        );
        if (response?.status === 200) {
          setData(response?.data || []);
        } else {
          console.error("Fetch error:", response);
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Network error:", error);
        toast.error("Network error occurred");
      } finally {
        setLoading(false);
      }
    },
    [loginInfo?.accessToken]
  );

  useEffect(() => {
    fetchData(`profiles/user-profile/${UserId}/`, setUserProfileData);
    fetchData(`profiles/following/`, setfollowData);
  }, [UserId, fetchData]);

  useEffect(() => {
    if (followData && Array.isArray(followData.following)) {
      const isCurrentUserFollowing = followData.following.some(
        (user) => user.id === parseInt(UserId)
      );
      setIsFollowing(isCurrentUserFollowing);
    }
  }, [followData, UserId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFollow = async (e) => {
    e.preventDefault();
    const formData = { user_to_follow: UserId };
    const formDataToSend = JSON.stringify(formData);

    try {
      const response = await ajaxCall(
        `profiles/follow/`,
        {
          method: "POST",
          body: formDataToSend,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginInfo?.accessToken}`,
          },
        },
        8000
      );
      if ([200, 201].includes(response.status)) {
        toast.success("Following Successfully");
        setIsFollowing(true);
      } else {
        toast.error("Some Problem Occurred. Please try again.");
      }
    } catch (error) {
      toast.error("Some Problem Occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!userProfileData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h6">User profile not found</Typography>
      </Box>
    );
  }

  const {
    qr_code,
    profile_picture,
    bio,
    linkedin_profile,
    twitter_profile,
    facebook_profile,
    Education,
    degree,
    birth_date,
    phone_number,
    school_graduation_year,
    year_of_graduation,
    company,
    company_address,
    job_title,
    company_portfolio,
    company_website,
    alternative_email,
    industry,
    publications,
    achievements,
    skills,
    city,
    country,
    interests,
    postal_code,
    state,
    street_address,
    make_it_public,
    user: { username },
  } = userProfileData;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <Container sx={{ mt: 10 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4} textAlign="center">
              <Card
                elevation={4}
                sx={{
                  padding: 1,
                  boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
                }}
              >
                <Avatar
                  alt={username}
                  src={profile_picture}
                  sx={{
                    width: 130,
                    height: 130,
                    margin: "auto",
                  }}
                />
                <Typography variant="h6" mt={2}>
                  {username}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {job_title || "Add Job-Title"} | Batch of{" "}
                  {school_graduation_year}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Alumni Number : {userProfileData.user.id}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="center" gap={2}>
                  <IconButton href={linkedin_profile} target="_blank">
                    <LinkedInIcon fontSize="medium" color="primary" />
                  </IconButton>
                  <IconButton href={twitter_profile} target="_blank">
                    <TwitterIcon fontSize="medium" color="primary" />
                  </IconButton>
                  <IconButton href={facebook_profile} target="_blank">
                    <FacebookIcon fontSize="medium" color="primary" />
                  </IconButton>
                </Box>
              </Card>
              {qr_code ? (
                <Card
                  sx={{
                    marginTop: 2,
                    padding: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      height: "40%",
                      width: "40%",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    image={qr_code}
                    alt="QR Code"
                  />
                </Card>
              ) : (
                ""
              )}
              <Grid>
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  color={isFollowing ? "inherit" : "primary"}
                  size="small"
                  onClick={handleFollow}
                  sx={{ mt: 2 }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={8}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                  boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
                }}
              >
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "grey.50",
                  }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      "& .MuiTab-root": {
                        minHeight: "64px",
                        textTransform: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        px: 3,
                        "&.Mui-selected": {
                          color: "primary.main",
                          fontWeight: 600,
                        },
                      },
                      "& .MuiTabs-indicator": {
                        height: 3,
                        borderRadius: "3px 3px 0 0",
                      },
                    }}
                  >
                    <Tab
                      icon={<LibraryBooksIcon sx={{ mb: 0.5 }} />}
                      iconPosition="start"
                      label="Bio"
                    />
                    <Tab
                      icon={<CallIcon sx={{ mb: 0.5 }} />}
                      iconPosition="start"
                      label="Contact Info"
                    />
                    <Tab
                      icon={<WorkIcon sx={{ mb: 0.5 }} />}
                      iconPosition="start"
                      label="Company Info"
                    />
                    <Tab
                      icon={<PlaylistAddCheckCircleIcon sx={{ mb: 0.5 }} />}
                      iconPosition="start"
                      label="Additional Info"
                    />
                  </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                  {tabValue === 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                            color: "primary.main",
                          }}
                        >
                          <LibraryBooksIcon size="small" /> Bio
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                          <Typography variant="body1" paragraph>
                            {bio || "No bio available"}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Birth Date
                              </Typography>
                              <Typography variant="body1">
                                {birth_date}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                School Graduation Year
                              </Typography>
                              <Typography variant="body1">
                                {school_graduation_year}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                            color: "primary.main",
                          }}
                        >
                          <SchoolIcon size="small" /> Education
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Degree
                              </Typography>
                              <Typography variant="body1">
                                {Education
                                  ? `${Education}, ${degree}`
                                  : "No education details available"}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Graduation Year
                              </Typography>
                              <Typography variant="body1">
                                {year_of_graduation || "N/A"}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    </Box>
                  )}

                  {make_it_public
                    ? tabValue === 1 && (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Typography
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              color: "primary.main",
                            }}
                          >
                            <CallIcon size="small" /> Contact Information
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                >
                                  Email
                                </Typography>
                                <Typography variant="body1">
                                  {userProfileData.user.email}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                >
                                  Alternative Email
                                </Typography>
                                <Typography variant="body1">
                                  {alternative_email}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                >
                                  Phone
                                </Typography>
                                <Typography variant="body1">
                                  {phone_number}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                >
                                  Address
                                </Typography>
                                <Typography variant="body1">
                                  {[
                                    street_address,
                                    city,
                                    state,
                                    country,
                                    postal_code,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Box>
                      )
                    : tabValue === 1 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            User made it private
                          </Typography>
                        </Box>
                      )}

                  {tabValue === 2 && (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "primary.main",
                        }}
                      >
                        <WorkIcon size="small" /> Company Information
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Company
                            </Typography>
                            <Typography variant="body1">{company}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Job Title
                            </Typography>
                            <Typography variant="body1">{job_title}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Industry
                            </Typography>
                            <Typography variant="body1">{industry}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Company Address
                            </Typography>
                            <Typography variant="body1">
                              {company_address}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Button
                              variant="outlined"
                              color="primary"
                              href={company_website}
                              target="_blank"
                              fullWidth
                              size="small"
                            >
                              Visit Website
                            </Button>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Button
                              variant="outlined"
                              color="primary"
                              href={company_portfolio}
                              target="_blank"
                              size="small"
                              fullWidth
                            >
                              View Portfolio
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  )}

                  {tabValue === 3 && (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Typography
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "primary.main",
                        }}
                      >
                        <PlaylistAddCheckCircleIcon size="small" /> Additional
                        Information
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Interests
                            </Typography>
                            <Typography variant="body1">{interests}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Skills
                            </Typography>
                            <Typography variant="body1">{skills}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Achievements
                            </Typography>
                            <Typography variant="body1">
                              {achievements}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Publications
                            </Typography>
                            <Typography variant="body1">
                              {publications}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CheckUser;

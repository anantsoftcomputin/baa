import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PlaylistAddCheckCircleIcon from "@mui/icons-material/PlaylistAddCheckCircle";
import CallIcon from "@mui/icons-material/Call";
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

const Profile = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [userProfileData, setUserProfileData] = useState(null);
  const [editField, setEditField] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [makeItPrivate, setMakeItPrivate] = useState(false);

  const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));
  const userID = loginInfo?.userId;

  const handleChangePassword = () => {
    navigate("/dashboard/changePassword");
  };

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
    // Temporarily disabled old API call
    // TODO: Migrate to Firebase
    console.warn("Profile data fetching disabled - needs Firebase migration");
    
    // Set mock data to prevent errors with all required fields
    setUserProfileData({
      profile_picture: "",
      first_name: loginInfo?.userName || "User",
      last_name: "",
      mobile_number: "",
      email: loginInfo?.userEmail || "",
      make_it_public: false,
      bio: "",
      linkedin_profile: "",
      twitter_profile: "",
      facebook_profile: "",
      Education: "",
      degree: "",
      birth_date: "",
      phone_number: "",
      school_graduation_year: "",
      year_of_graduation: "",
      company: "",
      company_address: "",
      job_title: "",
      company_portfolio: "",
      company_website: "",
      alternative_email: "",
      industry: "",
      industry_category: "",
      publications: "",
      achievements: "",
      skills: "",
      city: "",
      country: "",
      interests: "",
      postal_code: "",
      state: "",
      street_address: "",
      terms_confirmed: false,
      user: {
        username: loginInfo?.userName || "User"
      }
    });
    
    // fetchData(`profiles/user-profile/user/${userID}/`, (data) => {
    //   setUserProfileData(data);
    //   setMakeItPrivate(data.make_it_public);
    // });
  }, [userID, loginInfo]);

  if (!userProfileData) return null;

  const {
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
    industry_category,
    publications,
    achievements,
    skills,
    city,
    country,
    interests,
    postal_code,
    state,
    street_address,
    terms_confirmed,
    user: { username },
  } = userProfileData;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditClick = (field, nested = null) => {
    const fieldValue = nested
      ? userProfileData[nested][field]
      : userProfileData[field];
    setEditField((prev) => ({ ...prev, [field]: fieldValue }));
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setEditField((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = async (field, nested = null) => {
    try {
      const updateData = nested
        ? { [nested]: { [field]: editField[field] } }
        : { [field]: editField[field] };
      const response = await ajaxCall(
        `profiles/user-profile/${userProfileData.id}/`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("loginInfo"))?.accessToken
            }`,
          },
          method: "PATCH",
          body: JSON.stringify(updateData),
        },
        8000
      );

      if (response?.status === 200) {
        setUserProfileData((prev) => ({
          ...prev,
          [nested ? nested : field]: nested
            ? { ...prev[nested], [field]: editField[field] }
            : editField[field],
        }));
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        console.error("Update error:", response);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleCheckboxChange = async (event) => {
    const newValue = !makeItPrivate; // Toggle the value
    setMakeItPrivate(newValue);

    try {
      const response = await ajaxCall(
        `profiles/user-profile/${userProfileData.id}/`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginInfo?.accessToken}`,
          },
          method: "PATCH",
          body: JSON.stringify({ make_it_public: newValue }), // Use the new value directly
        },
        8000
      );

      if (response?.status === 200) {
        toast.success("Privacy setting updated successfully!");
        setUserProfileData((prev) => ({
          ...prev,
          make_it_public: newValue,
        }));
      } else {
        console.error("Update error:", response);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

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
                  sx={{ width: 130, height: 130, margin: "auto" }}
                />
                {isEditing && editField.username !== undefined ? (
                  <Box
                    sx={{
                      mt: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      value={editField.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                    />
                    <IconButton
                      color="primary"
                      onClick={() => handleSaveClick("username", "user")}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">
                      {userProfileData.user.username}
                    </Typography>
                    <IconButton>
                      <EditIcon
                        onClick={() => handleEditClick("username", "user")}
                      />
                    </IconButton>
                  </Box>
                )}

                <Typography variant="body1" color="textSecondary">
                  {job_title || "N/A"} | Batch of{" "}
                  {school_graduation_year || "N/A"}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Alumni Number : {userID}
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
                      {/* Bio Section */}
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
                          {isEditing && editField.bio !== undefined ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <TextField
                                fullWidth
                                value={editField.bio}
                                onChange={(e) =>
                                  handleInputChange("bio", e.target.value)
                                }
                              />
                              <IconButton
                                color="primary"
                                onClick={() => handleSaveClick("bio")}
                              >
                                <SaveIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography variant="body1" paragraph>
                                {bio || "N/A"}
                              </Typography>
                              <IconButton
                                onClick={() => handleEditClick("bio")}
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>
                          )}
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Birth Date
                              </Typography>
                              {isEditing &&
                              editField.birth_date !== undefined ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    type="date"
                                    value={editField.birth_date}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "birth_date",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handleSaveClick("birth_date")
                                    }
                                  >
                                    <SaveIcon />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <Typography variant="body1">
                                    {birth_date || "N/A"}
                                  </Typography>
                                  <IconButton
                                    onClick={() =>
                                      handleEditClick("birth_date")
                                    }
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Box>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                School Graduation Year
                              </Typography>
                              {isEditing &&
                              editField.school_graduation_year !== undefined ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    value={editField.school_graduation_year}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "school_graduation_year",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handleSaveClick("school_graduation_year")
                                    }
                                  >
                                    <SaveIcon />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <Typography variant="body1">
                                    {school_graduation_year || "N/A"}
                                  </Typography>
                                  <IconButton
                                    onClick={() =>
                                      handleEditClick("school_graduation_year")
                                    }
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>

                      {/* Education Section */}
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
                              {isEditing && editField.degree !== undefined ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    value={editField.degree}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "degree",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleSaveClick("degree")}
                                  >
                                    <SaveIcon />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <Typography variant="body1">
                                    {Education
                                      ? `${Education || "N/A"}, ${
                                          degree || "N/A"
                                        }`
                                      : "N/A"}
                                  </Typography>
                                  <IconButton
                                    onClick={() => handleEditClick("degree")}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Box>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Graduation Year
                              </Typography>
                              {isEditing &&
                              editField.year_of_graduation !== undefined ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    value={editField.year_of_graduation}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "year_of_graduation",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handleSaveClick("year_of_graduation")
                                    }
                                  >
                                    <SaveIcon />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <Typography variant="body1">
                                    {year_of_graduation || "N/A"}
                                  </Typography>
                                  <IconButton
                                    onClick={() =>
                                      handleEditClick("year_of_graduation")
                                    }
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                      {/* Display terms confirmed status */}
                      {terms_confirmed && (
                        <Box>
                          <Typography
                            color="success.main"
                            display="flex"
                            alignItems="center"
                          >
                            <DoneAllIcon style={{ marginRight: 4 }} />
                            Terms verified by you
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Contact Info Tab */}
                  {tabValue === 1 && (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
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
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={makeItPrivate}
                              checked={makeItPrivate}
                              onChange={handleCheckboxChange}
                              color="primary"
                            />
                          }
                          label="Make it Public"
                        />
                      </Box>

                      <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Email
                            </Typography>
                            {isEditing && editField.email !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.email}
                                  onChange={(e) =>
                                    handleInputChange("email", e.target.value)
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleSaveClick("email", "user")
                                  }
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {userProfileData.user.email}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() =>
                                      handleEditClick("email", "user")
                                    }
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Alternative Email
                            </Typography>
                            {isEditing &&
                            editField.alternative_email !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.alternative_email}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "alternative_email",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleSaveClick("alternative_email")
                                  }
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {alternative_email || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() =>
                                      handleEditClick("alternative_email")
                                    }
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Phone
                            </Typography>
                            {isEditing &&
                            editField.phone_number !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.phone_number}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "phone_number",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleSaveClick("phone_number")
                                  }
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {phone_number || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() =>
                                      handleEditClick("phone_number")
                                    }
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Address
                            </Typography>
                            {isEditing && editField.address !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.address}
                                  onChange={(e) =>
                                    handleInputChange("address", e.target.value)
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSaveClick("address")}
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
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
                                <IconButton>
                                  <EditIcon
                                    onClick={() => handleEditClick("address")}
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
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
                            {isEditing && editField.company !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.company}
                                  onChange={(e) =>
                                    handleInputChange("company", e.target.value)
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSaveClick("company")}
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {company || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() => handleEditClick("company")}
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Job Title
                            </Typography>
                            {isEditing && editField.job_title !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.job_title}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "job_title",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSaveClick("job_title")}
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {job_title || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() => handleEditClick("job_title")}
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Industry
                            </Typography>
                            {isEditing && editField.industry !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.industry}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "industry",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSaveClick("industry")}
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {industry || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() => handleEditClick("industry")}
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Industry Category
                            </Typography>
                            {isEditing &&
                            editField.industry_category !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.industry_category}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "industry_category",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleSaveClick("industry_category")
                                  }
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {industry_category || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() =>
                                      handleEditClick("industry_category")
                                    }
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Company Address
                            </Typography>
                            {isEditing &&
                            editField.company_address !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.company_address}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "company_address",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleSaveClick("company_address")
                                  }
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {company_address || "N/A"}
                                </Typography>

                                <IconButton>
                                  <EditIcon
                                    onClick={() =>
                                      handleEditClick("company_address")
                                    }
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Button
                              variant="outlined"
                              color="primary"
                              href={company_website || "N/A"}
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
                              href={company_portfolio || "N/A"}
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
                            {isEditing && editField.interests !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.interests}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "interests",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSaveClick("interests")}
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {interests || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() => handleEditClick("interests")}
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Skills
                            </Typography>
                            {isEditing && editField.skills !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.skills}
                                  onChange={(e) =>
                                    handleInputChange("skills", e.target.value)
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSaveClick("skills")}
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <>
                                <Typography variant="body1">
                                  {skills || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() => handleEditClick("skills")}
                                  />
                                </IconButton>
                              </>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Achievements
                            </Typography>
                            {isEditing &&
                            editField.achievements !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.achievements}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "achievements",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleSaveClick("achievements")
                                  }
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {achievements || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() =>
                                      handleEditClick("achievements")
                                    }
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Publications
                            </Typography>
                            {isEditing &&
                            editField.publications !== undefined ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  value={editField.publications}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "publications",
                                      e.target.value
                                    )
                                  }
                                />
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleSaveClick("publications")
                                  }
                                >
                                  <SaveIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography variant="body1">
                                  {publications || "N/A"}
                                </Typography>
                                <IconButton>
                                  <EditIcon
                                    onClick={() =>
                                      handleEditClick("publications")
                                    }
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                    }}
                  >
                    <Button
                      color="primary"
                      onClick={handleChangePassword}
                      sx={{
                        textTransform: "none",
                        px: 3,
                      }}
                      variant="contained"
                      size="small"
                    >
                      Change Password
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;

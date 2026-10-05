import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  Container,
  Paper,
  createTheme,
  Tabs,
  Tab,
} from "@mui/material";
import { toast } from "react-toastify";
import ajaxCall from "../../../helpers/ajaxCall";
import Breadcrumb from "../../../Ul/Breadcrumb";
import { useNavigate } from "react-router-dom";

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

const tabLabels = [
  "Personal Information",
  "Address",
  "Education",
  "Professional Information",
  "Social Media",
  "Privacy Settings",
  "Additional Information",
];

const ProfileForm = ({ userID }) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [userProfileData, setUserProfileData] = useState({});

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
        setData(response.data);
      } else {
        console.error("Fetch error:", response);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchData(`profiles/user-profile/user/${userID}/`, setUserProfileData);
  }, [userID]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ajaxCall(
          `profiles/user-profile/${userID}/`,
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
          setUserProfileData(response?.data || []);
        } else {
          console.error("Fetch error:", response);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    };
    fetchData();
  }, [userID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserProfileData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setUserProfileData((prevData) => ({ ...prevData, [name]: checked }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setUserProfileData((prevData) => ({ ...prevData, [name]: files[0] }));
      if (errors[name]) {
        setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(userProfileData).forEach((key) => {
      if (userProfileData[key] !== null && userProfileData[key] !== undefined) {
        if (key === "school_graduation_year") {
          formDataToSend.append(key, parseInt(userProfileData[key], 10));
        } else if (
          key === "profile_picture" ||
          key === "company_portfolio" ||
          key === "qr_code"
        ) {
          if (userProfileData[key] instanceof File) {
            formDataToSend.append(key, userProfileData[key]);
          }
        } else {
          formDataToSend.append(key, userProfileData[key]);
        }
      }
    });

    try {
      const response = await ajaxCall(
        `profiles/user-profile/${userProfileData.id}/`,
        {
          method: "PATCH",
          body: formDataToSend,
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("loginInfo"))?.accessToken
            }`,
          },
        },
        8000
      );
      if ([200, 201].includes(response.status)) {
        toast.success("Profile Updated Successfully");
        navigate("/dashboard/userProfile");
        setErrors({});
      } else {
        if (response.data && typeof response.data === "object") {
          setErrors(response.data);
          toast.error("Please correct the errors in the form.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const renderTabContent = (tab) => {
    switch (tab) {
      case 0:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="School Graduation Year"
                name="school_graduation_year"
                InputLabelProps={{ shrink: true }}
                value={userProfileData.school_graduation_year || ""}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                label="Birth Date"
                name="birth_date"
                value={userProfileData.birth_date || ""}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={userProfileData.phone_number || ""}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Alternative Email"
                name="alternative_email"
                value={userProfileData.alternative_email || ""}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={userProfileData.bio || ""}
                onChange={handleChange}
                size="small"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="file"
                label="Profile Picture"
                name="profile_picture"
                InputLabelProps={{ shrink: true }}
                onChange={handleFileChange}
                size="small"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Street Address"
                name="street_address"
                value={userProfileData.street_address}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={userProfileData.city}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={userProfileData.state}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={userProfileData.country}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postal_code"
                value={userProfileData.postal_code}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Education"
                name="Education"
                value={userProfileData.Education}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Degree"
                name="degree"
                value={userProfileData.degree}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Major"
                name="major"
                value={userProfileData.major}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Year of Graduation"
                name="year_of_graduation"
                value={userProfileData.year_of_graduation}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={userProfileData.company}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Company Address"
                name="company_address"
                value={userProfileData.company_address}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Company Website"
                name="company_website"
                value={userProfileData.company_website}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Job Title"
                name="job_title"
                value={userProfileData.job_title}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Industry"
                name="industry"
                value={userProfileData.industry}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="file"
                InputLabelProps={{ shrink: true }}
                label="Company Portfolio"
                name="company_portfolio"
                onChange={handleFileChange}
                size="small"
              />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                name="linkedin_profile"
                value={userProfileData.linkedin_profile}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Twitter"
                name="twitter_profile"
                value={userProfileData.twitter_profile}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Facebook"
                name="facebook_profile"
                value={userProfileData.facebook_profile}
                onChange={handleChange}
                size="small"
              />
            </Grid>
          </Grid>
        );
      case 5:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Mentorship Areas"
                name="mentorship_areas"
                value={userProfileData.mentorship_areas}
                onChange={handleChange}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={userProfileData.is_mentor}
                    onChange={handleCheckboxChange}
                    size="small"
                    name="is_mentor"
                  />
                }
                label="Is Mentor"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={userProfileData.show_email}
                    onChange={handleCheckboxChange}
                    size="small"
                    name="show_email"
                  />
                }
                label="Show Email"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={userProfileData.show_phone}
                    onChange={handleCheckboxChange}
                    size="small"
                    name="show_phone"
                  />
                }
                label="Show Phone"
              />
            </Grid>
          </Grid>
        );
      case 6:
        return (
          <Grid container spacing={2} mt={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Interest"
                name="interests"
                value={userProfileData.interests}
                size="small"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Skills"
                name="skills"
                value={userProfileData.skills}
                size="small"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Achievements"
                name="achievements"
                value={userProfileData.achievements}
                size="small"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Publications"
                name="publications"
                value={userProfileData.publications}
                size="small"
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Container sx={{ mt: 10 }}>
      <Box>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            backgroundColor: theme.palette.background.paper,
            boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
          }}
        >
          <Breadcrumb title="Update Profile" main="Dashboard" />
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Profile form tabs"
          >
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
          <Box sx={{ mt: 3 }}>{renderTabContent(activeTab)}</Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 3,
            }}
          >
            {activeTab < tabLabels.length - 1 && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => setActiveTab((prevTab) => prevTab + 1)}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
        <Grid item xs={12} container justifyContent="center" mt={4}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfileForm;

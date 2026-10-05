import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Container,
  Grid,
  styled,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Fade,
  Zoom,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import SendIcon from "@mui/icons-material/Send";
import GroupIcon from "@mui/icons-material/Group";
import HeroBanner from "../Content/HeroBanner";
import { getHeroImages, submitContactForm } from "../../../../firebase/firestore";

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: "bold",
  position: "relative",
  color: "#fba645",
  fontSize: "2.5rem",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    left: 0,
    width: "80px",
    height: "4px",
    background: "linear-gradient(90deg, #fba645 0%, #f76b1c 100%)",
    borderRadius: "2px",
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "20px",
  boxShadow: "0 10px 40px rgba(251, 166, 69, 0.15)",
  background: "linear-gradient(135deg, #ffffff 0%, #fef9f5 100%)",
  border: "1px solid rgba(251, 166, 69, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 15px 50px rgba(251, 166, 69, 0.25)",
    transform: "translateY(-5px)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#fef9f5",
    },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "0 0 0 3px rgba(251, 166, 69, 0.1)",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(251, 166, 69, 0.2)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#fba645",
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: "12px 40px",
  fontSize: "1rem",
  fontWeight: "bold",
  background: "linear-gradient(135deg, #fba645 0%, #f76b1c 100%)",
  color: "#fff",
  boxShadow: "0 6px 20px rgba(251, 166, 69, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #f76b1c 0%, #fba645 100%)",
    boxShadow: "0 8px 25px rgba(251, 166, 69, 0.4)",
    transform: "translateY(-2px)",
  },
}));

const StyledIframe = styled("iframe")(({ theme }) => ({
  border: 0,
  width: "100%",
  height: "300px",
  [theme.breakpoints.up("md")]: {
    height: "400px",
  },
  borderRadius: theme.shape.borderRadius,
}));

const ContactUs = () => {
  const imageHide = ["/"];
  const location = useLocation();

  const [heroImages, setHeroImages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    group: "general",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const images = await getHeroImages();
        setHeroImages(images);
      } catch (error) {
        console.error("Error fetching hero images:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await submitContactForm(formData);
      toast.success("Thank you for contacting us! We'll get back to you soon.");
      setFormData({ name: "", email: "", address: "", phone: "", group: "general" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Some Problem Occurred. Please try again.");
    }
  };

  return (
    <>
      {!imageHide.includes(location.pathname) && (
        <HeroBanner heroImages={heroImages} />
      )}
      <Container sx={{ mt: 8, mb: 8 }}>
        <Fade in timeout={800}>
          <Box>
            <SectionTitle variant="h3" align="center" gutterBottom>
              Get In Touch
            </SectionTitle>
            <Typography
              variant="h6"
              align="center"
              color="textSecondary"
              sx={{ mb: 6, maxWidth: "600px", mx: "auto" }}
            >
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Zoom in timeout={1000}>
              <StyledPaper elevation={3}>
                <form onSubmit={handleSubmit}>
                  <StyledTextField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#fba645" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StyledTextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#fba645" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StyledTextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: "#fba645" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <StyledTextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 2 }}>
                          <HomeIcon sx={{ color: "#fba645" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ "&.Mui-focused": { color: "#fba645" } }}>
                      Contact Group
                    </InputLabel>
                    <Select
                      name="group"
                      value={formData.group}
                      onChange={handleChange}
                      label="Contact Group"
                      startAdornment={
                        <InputAdornment position="start">
                          <GroupIcon sx={{ color: "#fba645" }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: "12px",
                        backgroundColor: "#fff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(251, 166, 69, 0.2)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(251, 166, 69, 0.4)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#fba645",
                          boxShadow: "0 0 0 3px rgba(251, 166, 69, 0.1)",
                        },
                      }}
                    >
                      <MenuItem value="general">General Inquiry</MenuItem>
                      <MenuItem value="membership">Membership</MenuItem>
                      <MenuItem value="events">Events</MenuItem>
                      <MenuItem value="alumni">Alumni Relations</MenuItem>
                      <MenuItem value="support">Support</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ mt: 3, textAlign: "center" }}>
                    <SubmitButton
                      type="submit"
                      variant="contained"
                      size="large"
                      endIcon={<SendIcon />}
                    >
                      Send Message
                    </SubmitButton>
                  </Box>
                </form>
              </StyledPaper>
            </Zoom>
          </Grid>
          <Grid item xs={12} md={6}>
            <Zoom in timeout={1200}>
              <Box>
                <StyledIframe
                  src={
                    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14882.181992377934!2d73.16385965!3d22.33736295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc438ffffffff%3A0x9983a37a832dd134!2sBhavan's%20School%2C%20Vadodara!5e0!3m2!1sen!2sin!4v1694430824557!5m2!1sen!2sin"
                  }
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <Box sx={{ mt: 3 }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: "20px",
                      background: "linear-gradient(135deg, #fba645 0%, #f76b1c 100%)",
                      color: "#fff",
                      boxShadow: "0 8px 25px rgba(251, 166, 69, 0.3)",
                    }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Contact Information
                    </Typography>
                    <Box sx={{ mt: 2, display: "flex", alignItems: "center", mb: 1.5 }}>
                      <EmailIcon sx={{ mr: 2 }} />
                      <Typography>contact@baa.com</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                      <PhoneIcon sx={{ mr: 2 }} />
                      <Typography>+91 1234567890</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <HomeIcon sx={{ mr: 2, mt: 0.5 }} />
                      <Typography>
                        Bhavan's School, Vadodara<br />
                        Gujarat, India
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Zoom>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ContactUs;

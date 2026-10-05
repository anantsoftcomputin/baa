import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Container,
  CardMedia,
  CircularProgress,
  Divider,
  Paper,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { createTheme, styled } from "@mui/material/styles";
import { getAllEvents } from "../../../../firebase/firestore";
import ajaxCall from "../../../helpers/ajaxCall";
import Breadcrumb from "../../../Ul/Breadcrumb";
import { toast } from "react-toastify";
import {
  AccessTime,
  CalendarToday,
  EventAvailable,
  LocationOn,
  People,
  Share as ShareIcon,
} from "@mui/icons-material";

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

const formatTime = (timeString) => {
  const [hour, minute] = timeString.split(":");
  return new Date(0, 0, 0, hour, minute).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const BackgroundImage = styled("div")(({ bgImage }) => ({
  width: "100%",
  height: "400px",
  backgroundImage: `url(${bgImage})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s ease-in-out",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
  borderRadius: "12px",
  overflow: "hidden",
  transition: "transform 0.3s ease-in-out",
}));

const steps = [
  "Event Registration",
  "Sub Event Registration",
  "Accompanying Guests",
];

const EventData = () => {
  const location = useLocation();
  const eventId = location.state;
  const [eventData, setEventData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [subEvents, setSubEvents] = useState([]);
  const [selectedSubEvents, setSelectedSubEvents] = useState([]);
  const [guestsCount, setGuestsCount] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);

  const [formData, setFormData] = useState({
    registration_date: new Date().toISOString(),
    total_amount: "",
    payment_status: "PENDING",
    full_event_access: true,
    event: "",
    alumni: JSON.parse(localStorage.getItem("loginInfo"))?.userId,
    subevent_registrations: [],
    guests: [],
  });

  const fetchData = useCallback(async () => {
    try {
      const events = await getAllEvents();
      setEventData(events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (eventData.length > 0) {
      const event = eventData.find((item) => item.id === Number(eventId));
      setSelectedEvent(event);
      setSubEvents(event?.subevents || []);
      setTotalAmount(event?.amount || 0);
    }
  }, [eventData, eventId]);

  const handleRegistrations = useCallback(() => {
    setOpenDialog(true);
    setActiveStep(0);
    setSelectedSubEvents([]);
    setGuestsCount({});
    setTotalAmount(selectedEvent?.amount || 0);
    setFormData((prevFormData) => ({
      ...prevFormData,
      payment_status: "COMPLETED",
      event: selectedEvent.id,
      total_amount: selectedEvent?.amount || 0,
    }));
  }, [selectedEvent]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setActiveStep(0);
    setFormData((prevFormData) => ({
      ...prevFormData,
      subevent_registrations: [],
      guests: [],
    }));
  }, []);

  const calculateTotalAmount = useCallback(
    (selectedSubEvents, guestsCount) => {
      let amount = selectedEvent?.amount || 0;
      selectedSubEvents.forEach((subEventId) => {
        const subEvent = subEvents.find((sub) => sub.id === subEventId);
        const alumniPrice = parseFloat(subEvent.pricing[0].alumni_price);
        const guestPrice = parseFloat(subEvent.pricing[0].guest_price);
        const guestCount = parseInt(guestsCount[subEventId] || 0);

        amount += alumniPrice + guestPrice * guestCount;
      });
      setTotalAmount(amount);
      setFormData((prevData) => ({
        ...prevData,
        total_amount: amount.toFixed(2),
      }));
    },
    [selectedEvent, subEvents]
  );

  const handleSubEventSelection = useCallback(
    (subEventId, isChecked) => {
      const updatedSelectedSubEvents = isChecked
        ? [...selectedSubEvents, subEventId]
        : selectedSubEvents.filter((id) => id !== subEventId);
      setSelectedSubEvents(updatedSelectedSubEvents);

      calculateTotalAmount(updatedSelectedSubEvents, guestsCount);
    },
    [selectedSubEvents, calculateTotalAmount, guestsCount]
  );

  const handleGuestChange = useCallback(
    (subEventId, count) => {
      setGuestsCount((prevCount) => ({
        ...prevCount,
        [subEventId]: count,
      }));

      const newTotalGuests = Object.values({
        ...guestsCount,
        [subEventId]: count,
      }).reduce((sum, count) => sum + parseInt(count || 0), 0);
      setTotalGuests(newTotalGuests);

      setFormData((prevFormData) => {
        const updatedSubEventRegistrations =
          prevFormData.subevent_registrations.map((reg) =>
            reg.subevent === subEventId
              ? { ...reg, num_guests: parseInt(count || 0) }
              : reg
          );

        return {
          ...prevFormData,
          subevent_registrations: updatedSubEventRegistrations,
          guests: Array(newTotalGuests)
            .fill({})
            .map(() => ({ name: "", phone: "", image: null })),
        };
      });

      calculateTotalAmount(selectedSubEvents, {
        ...guestsCount,
        [subEventId]: count,
      });
    },
    [guestsCount, calculateTotalAmount, selectedSubEvents]
  );

  const handleGuestInfoChange = useCallback((index, field, value) => {
    setFormData((prevData) => {
      const updatedGuests = [...prevData.guests];
      updatedGuests[index] = {
        ...updatedGuests[index],
        [field]: field === "image" ? value : value,
      };
      return { ...prevData, guests: updatedGuests };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "guests" && key !== "subevent_registrations") {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append(
        "subevent_registrations",
        JSON.stringify(formData.subevent_registrations)
      );

      formData.guests.forEach((guest, index) => {
        formDataToSend.append(`guests[${index}]name`, guest.name);
        formDataToSend.append(`guests[${index}]phone`, guest.phone);
        if (guest.image instanceof File) {
          formDataToSend.append(
            `guests[${index}]image`,
            guest.image,
            guest.image.name
          );
        }
      });

      const response = await ajaxCall(
        "events/registrations/",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("loginInfo"))?.accessToken
            }`,
          },
          method: "POST",
          body: formDataToSend,
        },
        8000
      );

      if (response?.status === 201) {
        toast.success("Registration Completed Successfully");
        handleCloseDialog();
      } else {
        console.error("Registration API response:", response);
        toast.error("Registration Failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration Failed");
    }
  }, [formData, handleCloseDialog]);

  const loadScript = useCallback((src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const handlePay = useCallback(async () => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const response = await ajaxCall(
        "accounts/payment/initiate/",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("loginInfo"))?.accessToken
            }`,
          },
          method: "POST",
          body: JSON.stringify({
            amount: totalAmount,
            category_id: 1,
            event_id: selectedEvent.id,
          }),
        },
        8000
      );

      if (!response || !response.data || !response.data.order_id) {
        toast.error("Payment system is currently unavailable. Please contact support.");
        return;
      }

      const order = response.data;

      const options = {
        key: process.env.REACT_APP_RAZOR_PAY_KEY,
        amount: totalAmount * 100,
        currency: "INR",
        name: "Your Company Name",
        description: "Event Registration",
        order_id: order.order_id,
        handler: async function (response) {
          try {
            const result = await ajaxCall(
              "accounts/payment/success/",
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${
                    JSON.parse(localStorage.getItem("loginInfo"))?.accessToken
                  }`,
                },
                method: "POST",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
              8000
            );

            if (result?.status === 200) {
              await handleSubmit();
            } else {
              console.error("Payment success API response:", result);
              toast.error("Payment failed. Please try again.");
            }
          } catch (error) {
            console.error("Error in payment handler:", error);
            toast.error(
              "An unexpected error occurred during the payment process."
            );
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("loginInfo"))?.username,
        },
        theme: {
          color: "#61dafb",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
    }
  }, [totalAmount, selectedEvent, handleSubmit, loadScript]);

  const handleShareEvent = useCallback((description) => {
    const currentUrl = window.location.href;
    const message = `Check out this event: ${currentUrl}\n${description}`;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const whatsappUrl = isMobile
      ? `whatsapp://send?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  }, []);

  const handleNext = useCallback(() => {
    setActiveStep((prevStep) => prevStep + 1);
  }, []);

  const handleBack = useCallback(
    () => setActiveStep((prevStep) => prevStep - 1),
    []
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 10 }}>
      <Box>
        <Breadcrumb title="Event" main="Dashboard" />
        <StyledCard>
          <Paper
            elevation={3}
            sx={{
              backgroundColor: theme.palette.background.paper,
              boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
            }}
          >
            <CardContent>
              {isLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight="300px"
                >
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Grid container>
                    <Grid item xs={12} mb={2}>
                      <BackgroundImage bgImage={selectedEvent.event_banner} />
                    </Grid>
                  </Grid>
                  <Grid container spacing={4} sx={{ p: 4 }}>
                    <Grid item xs={12} md={8}>
                      <CardContent>
                        <Typography variant="h4" gutterBottom>
                          {selectedEvent.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          paragraph
                          color="textSecondary"
                        >
                          {selectedEvent.description}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={2}>
                          <AccessTime sx={{ mr: 1, color: "#fb9e45" }} />
                          <Typography variant="body2">
                            {formatTime(selectedEvent.start_time)} -{" "}
                            {formatTime(selectedEvent.end_time)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mt={1}>
                          <CalendarToday sx={{ mr: 1, color: "#fb9e45" }} />
                          <Typography variant="body2">
                            {formatDate(selectedEvent.start_date)} -{" "}
                            {formatDate(selectedEvent.end_date)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Grid>
                    <Grid item xs={12} md={4} mt={4}>
                      <CardMedia
                        component="img"
                        sx={{
                          height: "70%",
                          width: "70%",
                          objectFit: "contain",
                          borderRadius: "8px",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                        }}
                        image={selectedEvent.qr_code}
                        alt={selectedEvent.title || "Upcoming Event"}
                      />
                    </Grid>
                  </Grid>

                  <Grid container sx={{ p: 4 }}>
                    <Grid item xs={12} md={8}>
                      <CardContent>
                        {selectedEvent.subevents?.length > 0 && (
                          <>
                            <Divider sx={{ my: 4 }} />
                            <Typography variant="h6" gutterBottom>
                              Event Schedule
                            </Typography>
                            {selectedEvent.subevents.map(
                              (subevent, subIndex) => (
                                <Box key={subIndex} sx={{ mb: 3 }}>
                                  <Typography variant="h6">
                                    {subevent.name}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    {subevent.description}
                                  </Typography>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mt={1}
                                  >
                                    <EventAvailable
                                      sx={{ mr: 1, color: "#fb9e45" }}
                                    />
                                    <Typography variant="body2">
                                      {formatDate(subevent.date)}
                                    </Typography>
                                  </Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mt={1}
                                  >
                                    <LocationOn
                                      sx={{ mr: 1, color: "#fb9e45" }}
                                    />
                                    <Typography variant="body2">
                                      {subevent.location}
                                    </Typography>
                                  </Box>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mt={1}
                                  >
                                    <People sx={{ mr: 1, color: "#fb9e45" }} />
                                    <Typography variant="body2">
                                      Max Participants:{" "}
                                      {subevent.max_participants}
                                    </Typography>
                                  </Box>
                                </Box>
                              )
                            )}
                          </>
                        )}
                      </CardContent>
                    </Grid>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    container
                    justifyContent="flex-end"
                    mt={2}
                    mb={3}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleRegistrations}
                      sx={{ mr: 2 }}
                    >
                      Register
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<ShareIcon />}
                      size="small"
                      onClick={() =>
                        handleShareEvent(selectedEvent.description)
                      }
                      sx={{ mr: 2 }}
                    >
                      Share Event
                    </Button>
                  </Grid>
                </>
              )}
            </CardContent>
          </Paper>
        </StyledCard>
      </Box>

      {/* Updated Dialog for Registration */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Register for Event</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form>
            {activeStep === 0 && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Event"
                    value={selectedEvent?.name || ""}
                    InputProps={{
                      readOnly: true,
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    value={formData.total_amount}
                    InputProps={{
                      readOnly: true,
                    }}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <>
                {subEvents.map((subEvent) => (
                  <Grid key={subEvent.id} mt={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedSubEvents.includes(subEvent.id)}
                          onChange={(e) =>
                            handleSubEventSelection(
                              subEvent.id,
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Select Event"
                    />
                    <Typography variant="subtitle1" gutterBottom>
                      Event : {subEvent.name}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Num Guests"
                          name={`subEventGuests_${subEvent.id}`}
                          type="number"
                          size="small"
                          onChange={(e) =>
                            handleGuestChange(subEvent.id, e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Alumni Price"
                          value={subEvent.pricing[0]?.alumni_price || ""}
                          InputProps={{
                            readOnly: true,
                          }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Guest Price"
                          value={subEvent.pricing[0]?.guest_price || ""}
                          InputProps={{
                            readOnly: true,
                          }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </>
            )}

            {activeStep === 2 && totalGuests > 0 && (
              <>
                {formData.guests.map((guest, index) => (
                  <Grid container spacing={2} sx={{ mt: 2 }} key={index}>
                    <Grid item xs={12}>
                      <Typography variant="h6">Guest {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={guest.name}
                        onChange={(e) =>
                          handleGuestInfoChange(index, "name", e.target.value)
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={guest.phone}
                        onChange={(e) =>
                          handleGuestInfoChange(index, "phone", e.target.value)
                        }
                        type="number"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleGuestInfoChange(
                            index,
                            "image",
                            e.target.files[0]
                          )
                        }
                      />
                    </Grid>
                  </Grid>
                ))}
              </>
            )}
          </form>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleBack}
              sx={{ mt: 1, mr: 1 }}
              disabled={activeStep === 0}
              size="small"
            >
              Back
            </Button>
            <Typography variant="h6">Total: {totalAmount}</Typography>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handlePay : handleNext}
              sx={{ mt: 1, mr: 1 }}
              size="small"
            >
              {activeStep === steps.length - 1 ? "Pay" : "Next"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default EventData;

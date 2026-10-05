import React, { useCallback, useEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  Grid,
  FormControl,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "../../../../contexts/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../firebase/config";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

const steps = [
  "Event Registration",
  "Sub Event Registration",
  "Accompanying Guests",
];

const DashboardEvents = ({ eventsData }) => {
  const { currentUser, userProfile } = useAuth();
  const [eventregistrationsData, seteventRegistrationsData] = useState([]);
  
  // Temporary compatibility for old payment code
  const loginInfo = {
    accessToken: null,
    username: userProfile?.username || currentUser?.displayName
  };

  const isUserRegistered = eventregistrationsData.some(
    (registration) => registration.userId === currentUser?.uid
  );

  const initialData = {
    registration_date: new Date().toISOString(),
    total_amount: "",
    payment_status: "PENDING",
    full_event_access: true,
    event: "",
    alumni: currentUser?.uid,
    subevent_registrations: [],
    guests: [],
  };

  const [formData, setFormData] = useState(initialData);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [subEvents, setSubEvents] = useState([]);
  const [selectedSubEvents, setSelectedSubEvents] = useState([]);
  const [guestsCount, setGuestsCount] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [count, setCount] = useState(0);

  // TODO: Implement Firebase event registrations fetch
  // const fetchData = async () => { ... };

  useEffect(() => {
    // TODO: Fetch event registrations from Firebase
    // fetchData("events/registrations-get/", seteventRegistrationsData);
  }, [count]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setActiveStep(0);
    setFormData(initialData);
    setTotalGuests(0);
  });

  const handleOpenDialog = (event) => {
    setSelectedEvent(event);
    setSubEvents(event.subevents || []);
    setOpenDialog(true);
    setGuestsCount({});
    setSelectedSubEvents([]);
    setTotalAmount(event.price || 0);
    setFormData({ ...initialData, event: event.id });
  };

  const handleSubEventSelection = (subEventId, isChecked) => {
    const updatedSelectedSubEvents = isChecked
      ? [...selectedSubEvents, subEventId]
      : selectedSubEvents.filter((id) => id !== subEventId);
    setSelectedSubEvents(updatedSelectedSubEvents);

    calculateTotalAmount(updatedSelectedSubEvents, guestsCount);
  };

  const calculateTotalAmount = (selectedSubEvents, guestsCount) => {
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
  };

  const handleGuestChange = (subEventId, count) => {
    const updatedGuestsCount = { ...guestsCount, [subEventId]: count };
    setGuestsCount(updatedGuestsCount);

    const newTotalGuests = Object.values(updatedGuestsCount).reduce(
      (sum, count) => sum + parseInt(count || 0),
      0
    );
    setTotalGuests(newTotalGuests);

    calculateTotalAmount(selectedSubEvents, updatedGuestsCount);

    const updatedSubEventRegistrations = selectedSubEvents.map(
      (subEventId) => ({
        subevent: subEventId,
        num_guests: parseInt(updatedGuestsCount[subEventId] || 0),
        amount_paid: "0.00",
        attended: false,
      })
    );

    setFormData((prevData) => ({
      ...prevData,
      subevent_registrations: updatedSubEventRegistrations,
      guests: Array(newTotalGuests)
        .fill({})
        .map(() => ({ name: "", phone: "", image: null })),
    }));
  };

  const handleGuestInfoChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedGuests = [...prevData.guests];
      updatedGuests[index] = {
        ...updatedGuests[index],
        [field]: field === "image" ? value : value,
      };
      return { ...prevData, guests: updatedGuests };
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => setActiveStep((prevStep) => prevStep - 1);

  const handleSubmit = useCallback(async () => {
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("event", formData.event);
      formDataToSend.append("alumni", formData.alumni);
      formDataToSend.append("total_amount", formData.total_amount);
      formDataToSend.append(
        "payment_status",
        (formData.payment_status = "COMPLETED")
      );
      formDataToSend.append("full_event_access", formData.full_event_access);
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
      // TODO: Implement Firebase event registration
      console.log("Registration data:", formData);
      toast.info("Event registration coming soon with Firebase");
      handleCloseDialog();
      
      /* Old API call - to be replaced with Firebase
      const response = await ajaxCall(
        "events/registrations/",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${loginInfo?.accessToken}`,
          },
          method: "POST",
          body: formDataToSend,
        },
        8000
      );

      if (response?.status === 201) {
        setCount(1);
        toast.success("Registration Completed Successfully");
        handleCloseDialog();
      } else {
        console.error("Registration API response:", response);
        toast.error("Registration Failed");
      }
      */
    } catch (error) {
      console.error("Error during registration:", error);
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

    // TODO: Implement Firebase payment integration
    toast.info("Payment integration coming soon with Firebase");
    return;
    
    /* Old payment API - fully commented out
    try {
      const response = await ajaxCall(
        "accounts/payment/initiate/",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginInfo?.accessToken}`,
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
                  Authorization: `Bearer ${loginInfo?.accessToken}`,
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
          name: loginInfo?.username,
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
    */
  }, [totalAmount, selectedEvent, handleSubmit, loadScript]);

  return (
    <>
      <Paper
        sx={{ p: 2, mb: 3, boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)" }}
      >
        <Typography variant="h6" gutterBottom>
          Upcoming Events
        </Typography>
        <List>
          {eventsData.map((event) => (
            <ListItem
              key={event.id}
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <ListItemText
                primary={event.name}
                secondary={`${event.start_date} to ${event.end_date}`}
              />
              <Button
                variant="contained"
                onClick={() => handleOpenDialog(event)}
                size="small"
                disabled={isUserRegistered}
              >
                {isUserRegistered ? (
                  "Registered"
                ) : (
                  <>
                    <CurrencyRupeeIcon
                      style={{ fontSize: 16, verticalAlign: "middle" }}
                    />
                    Pay
                  </>
                )}
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>

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
                  <FormControl fullWidth required>
                    <TextField
                      label="Event"
                      value={selectedEvent?.name || ""}
                      InputProps={{
                        readOnly: true,
                      }}
                      size="small"
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    name="total_amount"
                    value={totalAmount}
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
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total Amount: {totalAmount}
                </Typography>
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
    </>
  );
};

export default DashboardEvents;

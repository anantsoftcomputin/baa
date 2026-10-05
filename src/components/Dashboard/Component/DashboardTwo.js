import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useMediaQuery,
} from "@mui/material";
import ajaxCall from "../../helpers/ajaxCall";
import DashboardImg from "../../images/DashboardTwo.png";

const DashboardTwo = () => {
  const amount = 2500;
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const loginInfo = JSON.parse(localStorage.getItem("loginInfo"));

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setLoading(true);

    // Simulate a 2-second delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    const body = {
      amount: amount,
    };

    const response = await ajaxCall(
      "accounts/member/initiate/",
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginInfo?.accessToken}`,
        },
        method: "POST",
        body: JSON.stringify(body),
      },
      8000
    );

    if (!response || !response.data || !response.data.order_id) {
      toast.error("Payment system is currently unavailable. Please try again later or contact support.");
      setLoading(false);
      return;
    }

    const order = response.data;

    const options = {
      key: process.env.REACT_APP_RAZOR_PAY_KEY,
      amount: amount * 100,
      currency: "INR",
      description: "Lifetime Membership",
      order_id: order.order_id,
      handler: async function (response) {
        const data = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };

        const result = await ajaxCall(
          "accounts/member/success/",
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${loginInfo?.accessToken}`,
            },
            method: "POST",
            body: JSON.stringify(data),
          },
          8000
        );
        if (result?.status === 200) {
          navigate("/dashboard");
          toast.success("Payment Successful");
        } else {
          toast.error("Payment Failed");
        }
      },
      theme: {
        color: "#61dafb",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
    setLoading(false);
    setOpenDialog(false);
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${DashboardImg})`,
          backgroundRepeat: "no-repeat",
          height: "100%",
          width: "100%",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(2px)",
          zIndex: 2,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 3,
          padding: isMobile ? theme.spacing(2) : 0,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{
            padding: isMobile ? "10px 20px" : "5px 20px",
            fontSize: isMobile ? "15px" : "15px",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            whiteSpace: "nowrap",
          }}
        >
          Become a Lifetime Member
        </Button>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullScreen={isMobile}
        disableEscapeKeyDown
        disableBackdropClick
      >
        <DialogTitle>Become a Lifetime Member</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Your membership amount is ₹{amount}.
          </Typography>
          <Typography variant="body2">
            Would you like to proceed with the payment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handlePay} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Pay Now"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardTwo;

import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Button,
} from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../../../firebase/config";

const DashboardUsers = () => {
  const [userProfileData, setUserProfileData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, limit(10));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserProfileData(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleViewAllClick = () => {
    navigate("/dashboard/batchmates");
  };

  return (
    <Paper sx={{ p: 2, boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)" }}>
      <Typography variant="h6" gutterBottom>
        People You May Know
      </Typography>
      <List>
        {userProfileData.slice(0, 3).map((data) => (
          <ListItem key={data.id}>
            <ListItemAvatar>
              <Avatar sx={{ mr: 1 }}>
                {data.username
                  ? data.username.charAt(0).toUpperCase()
                  : data.email?.charAt(0).toUpperCase() || "A"}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={data.username || data.email || "User"}
              secondary={
                data.school_graduation_year
                  ? `Batch of ${data.school_graduation_year}`
                  : null
              }
            />
            <ListItemText primary={data.phone_number || ""} />
          </ListItem>
        ))}
      </List>
      <Box textAlign="center" sx={{ mt: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleViewAllClick}
          size="small"
        >
          <RemoveRedEyeIcon sx={{ mr: 1 }} /> View All
        </Button>
      </Box>
    </Paper>
  );
};

export default DashboardUsers;

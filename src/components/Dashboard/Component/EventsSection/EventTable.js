import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  CircularProgress,
  CardContent,
  Paper,
  createTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getAllEvents } from "../../../../firebase/firestore";

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

const EventTable = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      headerName: "Name",
      field: "name",
      width: 250,
      renderCell: (params) => {
        const eventId = params?.row?.id;
        const eventName = params?.row?.name;
        return eventId ? (
          <Typography
            component="span"
            onClick={() => handleKnowMore(eventId, eventName)}
            style={{ cursor: "pointer", color: theme.palette.primary.main }}
          >
            {eventName}
          </Typography>
        ) : (
          " - "
        );
      },
    },
    { headerName: "Start Date", field: "start_date", width: 170 },
    { headerName: "End Date", field: "end_date", width: 170 },
    { headerName: "Description", field: "description", width: 500 },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const events = await getAllEvents();
        setEventData(events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const rows = eventData.map((event, index) => ({
    id: event.id || index,
    ...event,
  }));

  const slugify = (text) => {
    return text.toLowerCase().replace(/\s+/g, "-");
  };

  const handleKnowMore = (eventId, eventName) => {
    navigate(`/dashboard/event/${slugify(eventName)}/`, { state: eventId });
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: theme.palette.background.paper,
          mt: 2,
          boxShadow: "0 4px 8px rgba(251, 166, 69, 0.5)",
        }}
      >
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : eventData?.length > 0 ? (
            <Box sx={{ height: "100%", width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                disableColumnFilter
                disableDensitySelector
                getRowClassName={(params) =>
                  params.indexRelativeToCurrentPage % 2 === 0
                    ? "evenRow"
                    : "oddRow"
                }
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
              />
            </Box>
          ) : (
            <Typography
              color="error"
              sx={{ mt: 2 }}
              align="center"
              variant="h6"
              component="div"
            >
              No Events Available !!
            </Typography>
          )}
        </CardContent>
      </Paper>
    </>
  );
};

export default EventTable;

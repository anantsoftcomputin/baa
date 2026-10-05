import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Typography,
  Box,
  CircularProgress,
  CardContent,
  Paper,
  createTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getAllInitiatives } from "../../../../firebase/firestore";

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

const InitiativesTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [InitiativesData, setInitiativesData] = useState([]);

  const columns = [
    {
      headerName: "Name",
      field: "name",
      width: 250,
      renderCell: (params) => {
        const InitiativeId = params?.row?.id;
        const name = params?.row?.name;
        return InitiativeId ? (
          <Link
            to={`/dashboard/addInitiatives/${InitiativeId}`}
            style={{ textDecoration: "none" }}
          >
            {name}
          </Link>
        ) : (
          " - "
        );
      },
    },
    {
      headerName: "Description",
      field: "purpose",
      width: 450,
    },
    {
      headerName: "Total Funds Required",
      field: "total_funds_required",
      width: 250,
    },
    {
      headerName: "Total Funds Raised",
      field: "current_funds",
      width: 250,
    },
  ];

  useEffect(() => {
    const fetchInitiatives = async () => {
      setIsLoading(true);
      try {
        const initiatives = await getAllInitiatives();
        setInitiativesData(initiatives || []);
      } catch (error) {
        console.error("Error fetching initiatives:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitiatives();
  }, []);

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
          ) : InitiativesData?.length > 0 ? (
            <Box sx={{ height: "100%", width: "100%" }}>
              <DataGrid
                rows={InitiativesData}
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
              No Initiatives Available !!
            </Typography>
          )}
        </CardContent>
      </Paper>
    </>
  );
};

export default InitiativesTable;

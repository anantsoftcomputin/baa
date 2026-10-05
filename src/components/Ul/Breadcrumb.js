import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";

const Breadcrumb = ({ title, middle, middleUrl, main }) => {
  return (
    <>
      <Typography variant="h5">{title}</Typography>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 1 }}>
        <Link
          to="/Dashboard"
          style={{ textDecoration: "none", color: "black" }}
        >
          {main}
        </Link>
        {middle && (
          <Link
            to={`/${middleUrl}`}
            style={{ textDecoration: "none", color: "black" }}
          >
            {middle}
          </Link>
        )}
        <Typography color="primary">{title}</Typography>
      </Breadcrumbs>
    </>
  );
};

export default Breadcrumb;

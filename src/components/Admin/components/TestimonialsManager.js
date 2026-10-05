import React from "react";
import { Rating } from "@mui/material";
import ContentManager from "./ContentManager";
import { getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial } from "../../../firebase/firestore";

const config = {
  title: "Testimonials",
  singular: "Testimonial",
  description: "Quotes shown in “What our alumni say” on the home page.",
  storageFolder: "testimonials",
  api: { list: getTestimonials, create: addTestimonial, update: updateTestimonial, remove: deleteTestimonial },
  fields: [
    { name: "name", label: "Name", required: true, grid: 6 },
    { name: "graduation_year", label: "Batch year", grid: 6 },
    { name: "designation", label: "Designation", grid: 6 },
    { name: "company", label: "Company", grid: 6 },
    { name: "testimonial", label: "Testimonial", type: "textarea", required: true },
    { name: "rating", label: "Rating", type: "rating", default: 5 },
  ],
  columns: [
    { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
    { field: "graduation_year", headerName: "Batch", width: 90 },
    { field: "designation", headerName: "Designation", flex: 1, minWidth: 140 },
    { field: "rating", headerName: "Rating", width: 140, renderCell: (p) => <Rating value={Number(p.value) || 0} readOnly size="small" /> },
    { field: "testimonial", headerName: "Testimonial", flex: 2, minWidth: 220 },
  ],
  searchKeys: ["name", "designation", "company", "testimonial", "graduation_year"],
};

const TestimonialsManager = () => <ContentManager config={config} />;

export default TestimonialsManager;

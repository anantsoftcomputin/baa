import React from "react";
import { Chip } from "@mui/material";
import ContentManager from "./ContentManager";
import { getAllInitiatives, createInitiative, updateInitiative, deleteInitiative } from "../../../firebase/firestore";
import { formatCurrency, formatDate } from "../../../utils/format";

const STATUS = ["Active", "Upcoming", "Completed"];

const config = {
  title: "Initiatives",
  singular: "Initiative",
  description: "Community projects members can read about and contribute to.",
  storageFolder: "initiatives",
  api: { list: getAllInitiatives, create: createInitiative, update: updateInitiative, remove: deleteInitiative },
  fields: [
    { name: "name", label: "Initiative name", required: true },
    { name: "purpose", label: "Purpose", type: "textarea", required: true },
    { name: "category", label: "Category", grid: 6, helperText: "e.g. Education, Infrastructure" },
    {
      name: "status",
      label: "Status",
      type: "select",
      grid: 6,
      default: "Active",
      options: STATUS.map((s) => ({ value: s, label: s })),
      // Match older free-text values like "active" to the dropdown.
      read: (i) => STATUS.find((s) => s.toLowerCase() === String(i.status || "").toLowerCase()) || (i.status ? i.status : "Active"),
    },
    { name: "start_date", label: "Start date", type: "date", grid: 6 },
    {
      name: "end_date",
      label: "End date",
      type: "date",
      grid: 6,
      validate: (v, form) => (v && form.start_date && v < form.start_date ? "End date is before the start date" : ""),
    },
    { name: "total_funds_required", label: "Funding goal", type: "number", prefix: "₹", grid: 6, helperText: "Leave empty if there's no target" },
  ],
  columns: [
    { field: "name", headerName: "Name", flex: 1.4, minWidth: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (p) => (p.value ? <Chip size="small" label={p.value} color={String(p.value).toLowerCase() === "completed" ? "default" : "secondary"} /> : null),
    },
    { field: "start_date", headerName: "Starts", width: 120, valueFormatter: (value) => formatDate(value) || "" },
    { field: "total_funds_required", headerName: "Goal", width: 120, valueFormatter: (value) => (Number(value) > 0 ? formatCurrency(value) : "—") },
    { field: "raised_amount", headerName: "Raised", width: 120, valueFormatter: (value) => (Number(value) > 0 ? formatCurrency(value) : "—") },
  ],
  searchKeys: ["name", "purpose", "category", "status"],
};

const InitiativesManager = () => <ContentManager config={config} />;

export default InitiativesManager;

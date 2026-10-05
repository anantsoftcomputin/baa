import React from "react";
import ContentManager from "./ContentManager";
import { getAchievements, addAchievement, updateAchievement, deleteAchievement } from "../../../firebase/firestore";
import { formatDate } from "../../../utils/format";

const config = {
  title: "Achievements",
  singular: "Achievement",
  description: "Milestones shown in the Achievements section of the home page.",
  storageFolder: "achievements",
  api: { list: getAchievements, create: addAchievement, update: updateAchievement, remove: deleteAchievement },
  fields: [
    { name: "title", label: "Title", required: true },
    { name: "category", label: "Category", helperText: "e.g. Academics, Sports, Community", grid: 6 },
    { name: "date", label: "Date", type: "date", grid: 6 },
    { name: "description", label: "Description", type: "textarea", required: true },
  ],
  columns: [
    { field: "title", headerName: "Title", flex: 1.4, minWidth: 200 },
    { field: "category", headerName: "Category", width: 140 },
    { field: "date", headerName: "Date", width: 130, valueFormatter: (value) => formatDate(value) || value || "" },
    { field: "description", headerName: "Description", flex: 2, minWidth: 220 },
  ],
  searchKeys: ["title", "category", "description"],
  sortRows: (a, b) => String(b.date || "").localeCompare(String(a.date || "")),
};

const AchievementsManager = () => <ContentManager config={config} />;

export default AchievementsManager;

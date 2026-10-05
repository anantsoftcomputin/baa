import React from "react";
import ContentManager from "./ContentManager";
import { getCommitteeMembers, addCommitteeMember, updateCommitteeMember, deleteCommitteeMember } from "../../../firebase/firestore";

const config = {
  title: "Committee",
  singular: "Committee member",
  description: "Office-bearers shown in “Meet the committee”. Lower display order appears first.",
  storageFolder: "committee",
  api: { list: getCommitteeMembers, create: addCommitteeMember, update: updateCommitteeMember, remove: deleteCommitteeMember },
  fields: [
    { name: "name", label: "Name", required: true, grid: 8 },
    { name: "order", label: "Display order", type: "number", grid: 4, helperText: "1 = first" },
    // Older records used `designation`.
    { name: "position", label: "Position", required: true, read: (m) => m.position || m.designation, grid: 6 },
    { name: "email", label: "Email", type: "email", grid: 6 },
    { name: "phone", label: "Phone", grid: 6 },
    { name: "websites", label: "Website", grid: 6 },
    { name: "description", label: "About", type: "textarea" },
  ],
  columns: [
    { field: "order", headerName: "#", width: 60 },
    { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
    { field: "position", headerName: "Position", flex: 1, minWidth: 150, valueGetter: (value, row) => value || row.designation },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "phone", headerName: "Phone", width: 140 },
  ],
  searchKeys: ["name", "position", "designation", "email"],
};

const CommitteeManager = () => <ContentManager config={config} />;

export default CommitteeManager;

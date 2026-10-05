import React from "react";
import ContentManager from "./ContentManager";
import { getGalleryImages, addGalleryImage, updateGalleryImage, deleteGalleryImage, getAllEvents } from "../../../firebase/firestore";
import { formatDate } from "../../../utils/format";

let eventNames = {};

const loadEventOptions = async () => {
  const events = await getAllEvents();
  eventNames = Object.fromEntries(events.map((e) => [e.id, e.name || e.title || "Event"]));
  return events.map((e) => ({ value: e.id, label: `${e.name || e.title || "Event"}${e.start_date ? ` · ${formatDate(e.start_date)}` : ""}` }));
};

const config = {
  title: "Gallery",
  singular: "Photo",
  description: "Photos on the Gallery page. Select several files at once to upload a batch.",
  storageFolder: "gallery",
  api: { list: getGalleryImages, create: addGalleryImage, update: updateGalleryImage, remove: deleteGalleryImage },
  imageRequired: true,
  multipleUpload: true,
  numberTitles: "title",
  extraOptions: { eventId: loadEventOptions },
  fields: [
    { name: "title", label: "Title", required: true },
    { name: "category", label: "Category", grid: 4, helperText: "e.g. Events, Campus" },
    { name: "batch", label: "Batch", grid: 4, helperText: "e.g. 2008" },
    {
      name: "eventId",
      label: "Event (optional)",
      type: "select",
      allowEmpty: true,
      grid: 4,
      // Keep the event's name alongside its id so the public filter can show it.
      write: (form) => {
        if (!form.eventId) return { eventName: "" };
        const name = eventNames[form.eventId];
        return name ? { eventName: name } : {}; // unknown (deleted) event: keep the stored name
      },
      missingLabel: () => "Event no longer listed",
    },
    { name: "description", label: "Description", type: "textarea", rows: 3 },
  ],
  columns: [
    { field: "title", headerName: "Title", flex: 1.2, minWidth: 180 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "batch", headerName: "Batch", width: 90 },
    { field: "eventName", headerName: "Event", flex: 1, minWidth: 150 },
  ],
  searchKeys: ["title", "category", "batch", "eventName", "description"],
};

const GalleryManager = () => <ContentManager config={config} />;

export default GalleryManager;

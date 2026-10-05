import React from "react";
import ContentManager from "./ContentManager";
import { getBlogs, addBlog, updateBlog, deleteBlog } from "../../../firebase/firestore";
import { formatDate } from "../../../utils/format";

const config = {
  title: "Blogs",
  singular: "Blog post",
  description: "Stories published on the Blogs page and the home page.",
  storageFolder: "blogs",
  api: { list: getBlogs, create: addBlog, update: updateBlog, remove: deleteBlog },
  fields: [
    { name: "title", label: "Title", required: true },
    { name: "author", label: "Author", grid: 6 },
    { name: "category", label: "Category", grid: 6 },
    { name: "tags", label: "Tags", type: "tags", helperText: "Separate with commas, e.g. Reunion, Stories" },
    { name: "content", label: "Content", type: "textarea", rows: 10, required: true, helperText: "Leave a blank line between paragraphs." },
  ],
  columns: [
    { field: "title", headerName: "Title", flex: 1.5, minWidth: 220 },
    { field: "author", headerName: "Author", width: 150 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "createdAt", headerName: "Published", width: 130, valueFormatter: (value) => formatDate(value) },
  ],
  searchKeys: ["title", "author", "category", "tags", "content"],
};

const BlogsManager = () => <ContentManager config={config} />;

export default BlogsManager;

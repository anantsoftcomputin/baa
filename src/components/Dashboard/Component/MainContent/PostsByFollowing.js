import React from "react";
import Feed from "./Feed";
import DashboardHeader from "../../../common/DashboardHeader";
import { Box } from "@mui/material";

/** /dashboard/followingPost — the feed, opened on the "Following" tab. */
const PostsByFollowing = () => (
  <Box sx={{ maxWidth: 720, mx: "auto" }}>
    <DashboardHeader title="Following feed" subtitle="Updates from the alumni you follow." />
    <Feed initialTab="following" showComposer={false} />
  </Box>
);

export default PostsByFollowing;

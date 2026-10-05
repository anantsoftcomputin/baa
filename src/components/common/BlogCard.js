import React from "react";
import { Box, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ImageBox from "./ImageBox";
import UserAvatar from "./UserAvatar";
import { formatDate, imageOf, truncate } from "../../utils/format";

/** Short reading-time estimate (200 wpm). */
export const readingTime = (text) => Math.max(1, Math.round(String(text || "").split(/\s+/).length / 200));

const BlogCard = ({ blog, onOpen }) => {
  const tags = Array.isArray(blog.tags) ? blog.tags : blog.category ? [blog.category] : [];
  return (
    <Card
      sx={{
        height: "100%",
        transition: "box-shadow .25s ease, transform .25s ease",
        "&:hover": { boxShadow: (t) => t.custom.shadows.md, transform: "translateY(-4px)" },
        "&:hover img": { transform: "scale(1.05)" },
      }}
    >
      <CardActionArea onClick={onOpen} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <ImageBox src={imageOf(blog)} alt={blog.title} icon={ArticleRoundedIcon} imgSx={{ transition: "transform .6s ease" }} />
        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.25, flexGrow: 1 }}>
          {tags.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {tags.slice(0, 2).map((t) => (
                <Chip key={t} label={t} size="small" sx={{ bgcolor: "rgba(232,133,31,0.1)", color: "primary.dark" }} />
              ))}
            </Stack>
          )}
          <Typography variant="h6" sx={{ fontSize: "1.15rem" }}>
            {blog.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {truncate(blog.content, 140)}
          </Typography>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: "auto", pt: 1 }}>
            <UserAvatar name={blog.author || "BAA"} size={30} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {blog.author || "BAA Editorial"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(blog.createdAt) || "Recently"} · {readingTime(blog.content)} min read
              </Typography>
            </Box>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default BlogCard;

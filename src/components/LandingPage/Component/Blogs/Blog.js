import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, Container, Grid, InputAdornment, Skeleton, Stack, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { getBlogs } from "../../../../firebase/firestore";
import PageHeader from "../../../common/PageHeader";
import SectionHeader from "../../../common/SectionHeader";
import BlogCard from "../../../common/BlogCard";
import EmptyState from "../../../common/EmptyState";
import Reveal from "../../../common/Reveal";

const tagsOf = (b) => (Array.isArray(b.tags) ? b.tags : b.category ? [b.category] : []);

/** Home-page teaser with the latest posts. */
export const BlogPreview = ({ blogsData = [], limit = 3 }) => {
  const navigate = useNavigate();
  const blogs = blogsData.slice(0, limit);
  if (blogs.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <SectionHeader
          eyebrow="Stories"
          title="From the blog"
          subtitle="News, reflections and stories from the Bhavan's community."
          align="left"
          action={
            <Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/Blogs")}>
              All stories
            </Button>
          }
        />
        <Grid container spacing={3}>
          {blogs.map((blog, i) => (
            <Grid item xs={12} sm={6} md={4} key={blog.id}>
              <Reveal delay={i * 100} sx={{ height: "100%" }}>
                <BlogCard blog={blog} onOpen={() => navigate(`/Blogs/${blog.id}`)} />
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

/** The /Blogs page. */
const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("all");

  useEffect(() => {
    getBlogs()
      .then((b) => setBlogs(b || []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const tags = useMemo(() => [...new Set(blogs.flatMap(tagsOf))].slice(0, 12), [blogs]);
  const q = search.trim().toLowerCase();
  const visible = blogs.filter(
    (b) =>
      (tag === "all" || tagsOf(b).includes(tag)) &&
      (!q || `${b.title} ${b.content} ${b.author}`.toLowerCase().includes(q))
  );

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Stories from our community"
        subtitle="News from the association, reflections from alumni, and updates from campus."
        crumbs={[{ label: "Blogs" }]}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        {blogs.length > 0 && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} sx={{ mb: 4 }}>
            <TextField
              size="small"
              placeholder="Search stories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: "100%", md: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            {tags.length > 0 && (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {["all", ...tags].map((t) => (
                  <Chip
                    key={t}
                    label={t === "all" ? "All" : t}
                    onClick={() => setTag(t)}
                    color={tag === t ? "primary" : "default"}
                    variant={tag === t ? "filled" : "outlined"}
                    sx={{ bgcolor: tag === t ? undefined : "#fff" }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {[0, 1, 2].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={360} />
              </Grid>
            ))}
          </Grid>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={ArticleRoundedIcon}
            title={blogs.length ? "No stories match your search" : "No stories yet"}
            description={blogs.length ? "Try another keyword or tag." : "Check back soon for news and stories."}
          />
        ) : (
          <Grid container spacing={3}>
            {visible.map((blog, i) => (
              <Grid item xs={12} sm={6} md={4} key={blog.id}>
                <Reveal delay={(i % 3) * 80} sx={{ height: "100%" }}>
                  <BlogCard blog={blog} onOpen={() => navigate(`/Blogs/${blog.id}`)} />
                </Reveal>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default Blogs;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Container, Divider, Grid, Skeleton, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import { getBlogById, getBlogs } from "../../../../firebase/firestore";
import PageHeader from "../../../common/PageHeader";
import ImageBox from "../../../common/ImageBox";
import UserAvatar from "../../../common/UserAvatar";
import ShareMenu from "../../../common/ShareMenu";
import BlogCard, { readingTime } from "../../../common/BlogCard";
import EmptyState from "../../../common/EmptyState";
import { formatDate, imageOf } from "../../../../utils/format";

const BlogDetails = () => {
  const { BlogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [more, setMore] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([getBlogById(BlogId).catch(() => null), getBlogs().catch(() => [])]).then(([b, all]) => {
      if (!alive) return;
      setBlog(b);
      setMore((all || []).filter((x) => x.id !== BlogId).slice(0, 3));
      setLoading(false);
      window.scrollTo(0, 0);
    });
    return () => {
      alive = false;
    };
  }, [BlogId]);

  if (loading) {
    return (
      <>
        <PageHeader title={<Skeleton width="60%" sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />} />
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Skeleton variant="rounded" height={380} />
          <Skeleton sx={{ mt: 3 }} />
          <Skeleton />
          <Skeleton width="80%" />
        </Container>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <PageHeader title="Story not found" crumbs={[{ label: "Blogs", to: "/Blogs" }, { label: "Not found" }]} />
        <Container maxWidth="md" sx={{ py: 8 }}>
          <EmptyState
            icon={ArticleRoundedIcon}
            title="We couldn't find that story"
            description="It may have been moved or removed."
            action={
              <Button variant="contained" onClick={() => navigate("/Blogs")}>
                Browse all stories
              </Button>
            }
          />
        </Container>
      </>
    );
  }

  const tags = Array.isArray(blog.tags) ? blog.tags : blog.category ? [blog.category] : [];

  return (
    <>
      <PageHeader
        eyebrow={tags[0] || "Story"}
        title={blog.title}
        crumbs={[{ label: "Blogs", to: "/Blogs" }, { label: "Story" }]}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 4 }}>
          <UserAvatar name={blog.author || "BAA"} size={44} />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{blog.author || "BAA Editorial"}</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {formatDate(blog.createdAt) || "Recently"} · {readingTime(blog.content)} min read
            </Typography>
          </Box>
        </Stack>
      </PageHeader>

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        {imageOf(blog) && (
          <ImageBox
            src={imageOf(blog)}
            alt={blog.title}
            ratio="16 / 9"
            rounded={5}
            sx={{ mb: { xs: 4, md: 6 }, mt: { xs: -2, md: -4 }, boxShadow: (t) => t.custom.shadows.md }}
          />
        )}
        <Typography
          component="div"
          sx={{
            fontSize: { xs: "1.05rem", md: "1.15rem" },
            lineHeight: 1.85,
            color: "text.primary",
            whiteSpace: "pre-line",
            "&::first-letter": {
              fontFamily: (t) => t.custom.tokens.fontDisplay,
              float: "left",
              fontSize: "3.6rem",
              lineHeight: 0.9,
              pr: 1.25,
              pt: 0.75,
              color: "primary.main",
            },
          }}
        >
          {blog.content || blog.text}
        </Typography>

        <Divider sx={{ my: 5 }} />
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {tags.map((t) => (
              <Chip key={t} label={t} variant="outlined" />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={RouterLink} to="/Blogs" startIcon={<ArrowBackRoundedIcon />}>
              All stories
            </Button>
            <ShareMenu url={window.location.href} title={blog.title} size="medium" />
          </Stack>
        </Stack>
      </Container>

      {more.length > 0 && (
        <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 10 }, borderTop: "1px solid", borderColor: "divider" }}>
          <Container maxWidth="lg">
            <Typography variant="h3" component="h2" sx={{ mb: 4 }}>
              More stories
            </Typography>
            <Grid container spacing={3}>
              {more.map((b) => (
                <Grid item xs={12} sm={6} md={4} key={b.id}>
                  <BlogCard blog={b} onOpen={() => navigate(`/Blogs/${b.id}`)} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}
    </>
  );
};

export default BlogDetails;

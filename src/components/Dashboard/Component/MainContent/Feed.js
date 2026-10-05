import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Card, Skeleton, Stack, Tab, Tabs } from "@mui/material";
import DynamicFeedRoundedIcon from "@mui/icons-material/DynamicFeedRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import { getAllPosts, getPopularPosts, getPostsByUsers, getUserProfile } from "../../../../firebase/firestore";
import EmptyState from "../../../common/EmptyState";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";

const authorCache = new Map();

/** Older posts only stored the author's uid; look up names/photos once per author. */
const withAuthors = async (posts) => {
  const missing = [...new Set(posts.filter((p) => !p.username && (p.user_id || p.author)).map((p) => p.user_id || p.author))].filter(
    (id) => typeof id === "string" && !authorCache.has(id)
  );
  await Promise.all(
    missing.map((id) =>
      getUserProfile(id)
        .then((u) => authorCache.set(id, u || {}))
        .catch(() => authorCache.set(id, {}))
    )
  );
  return posts.map((p) => {
    if (p.username) return p;
    const u = authorCache.get(p.user_id || p.author) || {};
    return { ...p, username: u.username || u.email?.split("@")[0], userPhoto: u.profile_picture || u.photoURL };
  });
};

const PostSkeleton = () => (
  <Card sx={{ p: 2.5 }}>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Skeleton variant="circular" width={44} height={44} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton width="40%" />
        <Skeleton width="20%" />
      </Box>
    </Stack>
    <Skeleton sx={{ mt: 2 }} />
    <Skeleton width="85%" />
  </Card>
);

/**
 * The social feed. `initialTab` lets /dashboard/followingPost open on "Following".
 */
const Feed = ({ initialTab = "recent", showComposer = true }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const following = userProfile?.following || [];
  const followingKey = following.join(",");

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      let list;
      if (tab === "popular") list = await getPopularPosts();
      else if (tab === "following") list = await getPostsByUsers(followingKey ? followingKey.split(",") : []);
      else list = await getAllPosts();
      setPosts(await withAuthors(list || []));
    } catch (e) {
      console.error("Error loading feed:", e);
      setError(true);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [tab, followingKey]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <Stack spacing={2.5}>
      {showComposer && <PostComposer onPosted={() => (tab === "recent" ? setRefreshKey((k) => k + 1) : setTab("recent"))} />}

      <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
          <Tab value="recent" label="Recent" />
          <Tab value="popular" label="Popular" />
          <Tab value="following" label={`Following${following.length ? ` (${following.length})` : ""}`} />
        </Tabs>
      </Box>

      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : error ? (
        <EmptyState
          icon={DynamicFeedRoundedIcon}
          title="Couldn't load posts"
          description="Check your connection and try again."
          action={<Button onClick={load}>Retry</Button>}
        />
      ) : posts.length === 0 ? (
        tab === "following" ? (
          <EmptyState
            icon={DynamicFeedRoundedIcon}
            title={following.length ? "No posts from people you follow yet" : "You're not following anyone yet"}
            description="Find batchmates and follow them to see their updates here."
            action={
              <Button variant="contained" onClick={() => navigate("/dashboard/batchmates")}>
                Find batchmates
              </Button>
            }
          />
        ) : (
          <EmptyState icon={DynamicFeedRoundedIcon} title="No posts yet" description="Be the first to share something with the community!" />
        )
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUser?.uid}
            isAdmin={isAdmin}
            onDeleted={(id) => setPosts((list) => list.filter((p) => p.id !== id))}
          />
        ))
      )}
    </Stack>
  );
};

export default Feed;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, Skeleton, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { getBatchYear, getRecentUsers, getUsersByYear } from "../../../../firebase/firestore";
import UserAvatar from "../../../common/UserAvatar";

/** "People you may know": batchmates first, then other recent members. */
const DashboardUsers = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [people, setPeople] = useState(null);
  const myYear = getBatchYear(userProfile);

  useEffect(() => {
    let alive = true;
    const following = new Set(userProfile?.following || []);
    Promise.all([myYear ? getUsersByYear(myYear).catch(() => []) : [], getRecentUsers(12).catch(() => [])]).then(([batch, recent]) => {
      if (!alive) return;
      const seen = new Set();
      const list = [...batch, ...recent].filter((u) => {
        if (u.id === currentUser?.uid || following.has(u.id) || seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });
      setPeople(list.slice(0, 4));
    });
    return () => {
      alive = false;
    };
  }, [currentUser?.uid, myYear, userProfile?.following]);

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6">People you may know</Typography>
      </Stack>
      {people === null ? (
        <Stack spacing={1.5}>
          {[0, 1, 2].map((i) => (
            <Stack key={i} direction="row" spacing={1.5} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton width="60%" />
            </Stack>
          ))}
        </Stack>
      ) : people.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No suggestions right now.
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {people.map((u) => (
            <Stack
              key={u.id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              onClick={() => navigate(`/dashboard/userProfile/${u.id}`)}
              sx={{ p: 1, mx: -1, borderRadius: 2.5, cursor: "pointer", "&:hover": { bgcolor: "background.default" } }}
            >
              <UserAvatar user={u} size={40} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {u.username || u.email?.split("@")[0] || "Alumnus"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {getBatchYear(u) ? `Batch of ${getBatchYear(u)}` : u.job_title || "BAA member"}
                  {getBatchYear(u) && String(getBatchYear(u)) === String(myYear) ? " · your batch" : ""}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
      <Button fullWidth variant="outlined" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/dashboard/batchmates")} sx={{ mt: 2 }}>
        Browse directory
      </Button>
    </Card>
  );
};

export default DashboardUsers;

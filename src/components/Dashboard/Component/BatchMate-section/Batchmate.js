import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Pagination,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { useAuth } from "../../../../contexts/AuthContext";
import { getBatchYear, getUsersByYear } from "../../../../firebase/firestore";
import { logSearch } from "../../../../firebase/analytics";
import DashboardHeader from "../../../common/DashboardHeader";
import EmptyState from "../../../common/EmptyState";
import UserAvatar from "../../../common/UserAvatar";
import FollowButton from "./FollowButton";

const PAGE_SIZE = 24;

const PersonCard = ({ person, onOpen, isSelf }) => {
  const year = getBatchYear(person);
  const work = [person.job_title, person.company].filter(Boolean).join(" at ");
  const place = [person.city, person.country].filter(Boolean).join(", ");
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: "box-shadow .2s ease", "&:hover": { boxShadow: (t) => t.custom.shadows.md } }}>
      <CardActionArea onClick={onOpen} sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <UserAvatar user={person} size={72} />
        <Typography variant="subtitle1" sx={{ mt: 1.5, fontWeight: 700 }} noWrap>
          {person.username || person.email?.split("@")[0] || "Alumnus"}
          {isSelf && " (you)"}
        </Typography>
        {year && <Chip size="small" label={`Batch of ${year}`} sx={{ mt: 0.75, bgcolor: "rgba(232,133,31,0.1)", color: "primary.dark" }} />}
        <Stack spacing={0.5} sx={{ mt: 1.5, color: "text.secondary", width: "100%" }}>
          {work && (
            <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center">
              <WorkOutlineRoundedIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" noWrap>
                {work}
              </Typography>
            </Stack>
          )}
          {place && (
            <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center">
              <PlaceOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" noWrap>
                {place}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardActionArea>
      {!isSelf && (
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <FollowButton targetId={person.id} fullWidth />
        </Box>
      )}
    </Card>
  );
};

/** /dashboard/batchmates — searchable alumni directory. */
const Batchmate = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [people, setPeople] = useState(null);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [page, setPage] = useState(1);
  const myYear = getBatchYear(userProfile);

  useEffect(() => {
    getUsersByYear()
      .then((u) => setPeople(u || []))
      .catch(() => setPeople([]));
  }, []);

  const years = useMemo(
    () => [...new Set((people || []).map(getBatchYear).filter(Boolean).map(String))].sort((a, b) => b.localeCompare(a)),
    [people]
  );

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!people) return [];
    return people
      .filter((p) => year === "all" || String(getBatchYear(p)) === year)
      .filter(
        (p) =>
          !q ||
          [p.username, p.email, p.company, p.job_title, p.city, p.industry, p.skills, String(getBatchYear(p) || "")]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
      )
      .sort((a, b) => (a.username || "").localeCompare(b.username || ""));
  }, [people, year, q]);

  useEffect(() => setPage(1), [q, year]);

  useEffect(() => {
    if (q.length >= 3) {
      const t = setTimeout(() => logSearch(q, "users"), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <DashboardHeader
        title="Batchmates"
        subtitle={people ? `${people.length} alumni in the directory` : "Find and reconnect with fellow alumni."}
      />
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, company, city or skill"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField select size="small" label="Batch" value={year} onChange={(e) => setYear(e.target.value)} sx={{ minWidth: 160 }}>
            <MenuItem value="all">All batches</MenuItem>
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
          {myYear && (
            <Chip
              label="My batch"
              color={year === String(myYear) ? "primary" : "default"}
              variant={year === String(myYear) ? "filled" : "outlined"}
              onClick={() => setYear(year === String(myYear) ? "all" : String(myYear))}
            />
          )}
        </Stack>
      </Card>

      {people === null ? (
        <Grid container spacing={2.5}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={i}>
              <Skeleton variant="rounded" height={240} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Groups2RoundedIcon} title="No alumni found" description="Try a different name or batch year." />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {visible.map((p) => (
              <Grid item xs={12} sm={6} md={4} xl={3} key={p.id}>
                <PersonCard person={p} isSelf={p.id === currentUser?.uid} onOpen={() => navigate(p.id === currentUser?.uid ? "/dashboard/userProfile" : `/dashboard/userProfile/${p.id}`)} />
              </Grid>
            ))}
          </Grid>
          {pageCount > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
            </Stack>
          )}
        </>
      )}
    </>
  );
};

export default Batchmate;

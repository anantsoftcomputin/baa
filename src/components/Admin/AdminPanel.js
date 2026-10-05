import React from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Card, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, TextField, useMediaQuery, useTheme } from "@mui/material";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import WebsiteContentManager from "./components/WebsiteContentManager";
import EventsManager from "./components/EventsManager";
import InitiativesManager from "./components/InitiativesManager";
import BlogsManager from "./components/BlogsManager";
import GalleryManager from "./components/GalleryManager";
import TestimonialsManager from "./components/TestimonialsManager";
import CommitteeManager from "./components/CommitteeManager";
import AchievementsManager from "./components/AchievementsManager";
import UserManagement from "./components/UserManagement";
import ContactsManager from "./components/ContactsManager";
import FeedbackManager from "./components/FeedbackManager";
import DashboardHeader from "../common/DashboardHeader";

export const ADMIN_TABS = [
  { key: "content", label: "Website content", icon: WebRoundedIcon, component: WebsiteContentManager },
  { key: "events", label: "Events", icon: EventRoundedIcon, component: EventsManager },
  { key: "initiatives", label: "Initiatives", icon: VolunteerActivismRoundedIcon, component: InitiativesManager },
  { key: "blogs", label: "Blogs", icon: ArticleRoundedIcon, component: BlogsManager },
  { key: "gallery", label: "Gallery", icon: PhotoLibraryRoundedIcon, component: GalleryManager },
  { key: "testimonials", label: "Testimonials", icon: FormatQuoteRoundedIcon, component: TestimonialsManager },
  { key: "committee", label: "Committee", icon: GroupsRoundedIcon, component: CommitteeManager },
  { key: "achievements", label: "Achievements", icon: EmojiEventsRoundedIcon, component: AchievementsManager },
  { key: "contacts", label: "Messages", icon: MailRoundedIcon, component: ContactsManager },
  { key: "feedback", label: "Feedback", icon: RateReviewRoundedIcon, component: FeedbackManager },
  { key: "users", label: "Users", icon: ManageAccountsRoundedIcon, component: UserManagement },
];

/** /dashboard/admin?tab=<key> — the content management system. */
const AdminPanel = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [params, setParams] = useSearchParams();
  const current = ADMIN_TABS.find((t) => t.key === params.get("tab")) || ADMIN_TABS[0];
  const Current = current.component;

  const select = (key) => setParams(key === ADMIN_TABS[0].key ? {} : { tab: key });

  return (
    <>
      <DashboardHeader eyebrow="Administration" title="Admin panel" subtitle="Manage the public website, events and members." />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "232px 1fr" }, gap: 3, alignItems: "start" }}>
        {isDesktop ? (
          <Card sx={{ p: 1, position: "sticky", top: 96 }}>
            <List disablePadding>
              {ADMIN_TABS.map((t) => {
                const Icon = t.icon;
                const active = t.key === current.key;
                return (
                  <ListItemButton
                    key={t.key}
                    selected={active}
                    onClick={() => select(t.key)}
                    sx={{
                      py: 1,
                      mb: 0.25,
                      "&.Mui-selected": { bgcolor: "rgba(232,133,31,0.12)", color: "primary.dark" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: active ? "primary.main" : "text.secondary" }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t.label} primaryTypographyProps={{ fontWeight: active ? 700 : 600, fontSize: "0.9rem" }} />
                  </ListItemButton>
                );
              })}
            </List>
          </Card>
        ) : (
          <TextField select size="small" label="Section" value={current.key} onChange={(e) => select(e.target.value)}>
            {ADMIN_TABS.map((t) => (
              <MenuItem key={t.key} value={t.key}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
        )}
        <Card sx={{ p: { xs: 2, md: 3 }, minWidth: 0 }}>
          <Current key={current.key} />
        </Card>
      </Box>
    </>
  );
};

export default AdminPanel;

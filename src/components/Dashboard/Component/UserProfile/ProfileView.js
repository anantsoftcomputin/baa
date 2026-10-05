import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import FacebookIcon from "@mui/icons-material/Facebook";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import DynamicFeedRoundedIcon from "@mui/icons-material/DynamicFeedRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { hasPasswordProvider } from "../../../../firebase/auth";
import { getBatchYear, getPostsByUser, updateUserProfile } from "../../../../firebase/firestore";
import { uploadProfilePicture } from "../../../../firebase/storage";
import UserAvatar from "../../../common/UserAvatar";
import EmptyState from "../../../common/EmptyState";
import PostCard from "../MainContent/PostCard";
import FollowButton from "../BatchMate-section/FollowButton";
import { externalUrl, formatDate } from "../../../../utils/format";

const listOf = (value) =>
  (Array.isArray(value) ? value : String(value || "").split(","))
    .map((s) => String(s).trim())
    .filter(Boolean);

const Detail = ({ label, value }) =>
  value ? (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </Typography>
      <Typography sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>{value}</Typography>
    </Box>
  ) : null;

const Section = ({ title, children }) => (
  <Card sx={{ p: { xs: 2.5, md: 3 } }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      {title}
    </Typography>
    {children}
  </Card>
);

const ChipList = ({ items, color }) => (
  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
    {items.map((s) => (
      <Chip key={s} label={s} size="small" color={color} variant="outlined" />
    ))}
  </Stack>
);

/**
 * Profile page body. `isOwn` shows edit controls and private details;
 * otherwise contact details respect the member's privacy settings.
 */
const ProfileView = ({ profile, isOwn, onProfileChange }) => {
  const navigate = useNavigate();
  const { currentUser, refreshUserProfile } = useAuth();
  const fileRef = useRef(null);
  const [tab, setTab] = useState("about");
  const [posts, setPosts] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [followers, setFollowers] = useState((profile.followers || []).length);

  useEffect(() => {
    setFollowers((profile.followers || []).length);
  }, [profile.followers]);

  useEffect(() => {
    let alive = true;
    setPosts(null);
    getPostsByUser(profile.id)
      .then((p) => alive && setPosts(p.map((x) => ({ ...x, username: x.username || profile.username, userPhoto: x.userPhoto || profile.profile_picture || profile.photoURL }))))
      .catch(() => alive && setPosts([]));
    return () => {
      alive = false;
    };
  }, [profile.id, profile.username, profile.profile_picture, profile.photoURL]);

  const changePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Please choose an image under 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadProfilePicture(currentUser.uid, file);
      await updateUserProfile(currentUser.uid, { profile_picture: url });
      const fresh = await refreshUserProfile();
      onProfileChange && fresh && onProfileChange(fresh);
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error("Couldn't upload the photo.");
    } finally {
      setUploading(false);
    }
  };

  const year = getBatchYear(profile);
  const name = profile.username || profile.email?.split("@")[0] || "Alumnus";
  const headline = [profile.job_title, profile.company].filter(Boolean).join(" at ");
  const place = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");
  const showEmail = isOwn || profile.show_email;
  const showPhone = isOwn || profile.show_phone;
  const email = showEmail ? profile.email : "";
  const phone = showPhone ? profile.phone_number : "";
  const socials = [
    { key: "linkedin_profile", icon: <LinkedInIcon />, label: "LinkedIn" },
    { key: "twitter_profile", icon: <XIcon />, label: "X / Twitter" },
    { key: "facebook_profile", icon: <FacebookIcon />, label: "Facebook" },
    { key: "company_website", icon: <LanguageRoundedIcon />, label: "Website" },
  ].filter((s) => profile[s.key]);
  const skills = listOf(profile.skills);
  const interests = listOf(profile.interests);
  const mentorAreas = listOf(profile.mentorship_areas);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Card sx={{ mb: 3 }}>
        <Box
          sx={{
            height: { xs: 120, md: 170 },
            background: (t) => t.custom.inkGradient,
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              right: -60,
              top: -140,
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,133,31,0.55) 0%, rgba(232,133,31,0) 70%)",
            },
          }}
        />
        <Box sx={{ px: { xs: 2.5, md: 4 }, pb: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems="flex-start">
            <Box sx={{ position: "relative", mt: { xs: -6, md: -8 }, flexShrink: 0 }}>
              <UserAvatar user={profile} name={name} size={128} sx={{ border: "4px solid #fff", boxShadow: (t) => t.custom.shadows.sm }} />
              {isOwn && (
                <>
                  <Tooltip title="Change photo">
                    <IconButton
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      aria-label="Change profile photo"
                      sx={{ position: "absolute", right: 2, bottom: 2, bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
                      size="small"
                    >
                      {uploading ? <CircularProgress size={18} color="inherit" /> : <PhotoCameraRoundedIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={changePhoto} />
                </>
              )}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0, pt: { md: 2 } }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h4" component="h1">
                  {name}
                </Typography>
                {profile.is_member && (
                  <Tooltip title="Lifetime member">
                    <VerifiedRoundedIcon color="secondary" />
                  </Tooltip>
                )}
                {profile.is_mentor && <Chip size="small" color="info" label="Mentor" />}
              </Stack>
              {headline && <Typography color="text.secondary">{headline}</Typography>}
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ mt: 1, color: "text.secondary" }}>
                {year && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <SchoolOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">Batch of {year}</Typography>
                  </Stack>
                )}
                {place && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{place}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0, pt: { md: 2 } }}>
              {isOwn ? (
                <>
                  <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => navigate("/dashboard/updateProfile")}>
                    Edit profile
                  </Button>
                  {hasPasswordProvider(currentUser) && (
                    <Tooltip title="Change password">
                      <IconButton onClick={() => navigate("/dashboard/changePassword")} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <LockResetRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              ) : (
                <>
                  <FollowButton targetId={profile.id} size="medium" onChange={(now) => setFollowers((n) => Math.max(0, n + (now ? 1 : -1)))} />
                  {email && (
                    <Button variant="outlined" startIcon={<MailOutlineRoundedIcon />} href={`mailto:${email}`}>
                      Email
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={4} sx={{ mt: 3 }}>
            {[
              ["Posts", posts ? posts.length : "–"],
              ["Followers", followers],
              ["Following", (profile.following || []).length],
            ].map(([label, value]) => (
              <Box key={label}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2 }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
        <Box sx={{ px: { xs: 1, md: 2.5 }, borderTop: "1px solid", borderColor: "divider" }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab value="about" label="About" />
            <Tab value="posts" label="Posts" />
          </Tabs>
        </Box>
      </Card>

      {tab === "about" ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Section title="About">
                {profile.bio ? (
                  <Typography sx={{ whiteSpace: "pre-line" }}>{profile.bio}</Typography>
                ) : (
                  <Typography color="text.secondary">{isOwn ? "Add a short bio so batchmates know what you're up to." : "No bio yet."}</Typography>
                )}
                {(skills.length > 0 || interests.length > 0) && (
                  <Stack spacing={2} sx={{ mt: 3 }}>
                    {skills.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Skills
                        </Typography>
                        <ChipList items={skills} color="primary" />
                      </Box>
                    )}
                    {interests.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Interests
                        </Typography>
                        <ChipList items={interests} color="secondary" />
                      </Box>
                    )}
                  </Stack>
                )}
              </Section>

              {(profile.job_title || profile.company || profile.industry || profile.company_address || profile.company_portfolio) && (
                <Section title="Work">
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Detail label="Role" value={profile.job_title} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Detail label="Company" value={profile.company} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Detail label="Industry" value={[profile.industry, profile.industry_category].filter(Boolean).join(" · ")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Detail label="Office" value={profile.company_address} />
                    </Grid>
                    <Grid item xs={12}>
                      <Detail label="Portfolio" value={profile.company_portfolio} />
                    </Grid>
                  </Grid>
                </Section>
              )}

              {(profile.degree || profile.major || profile.year_of_graduation || profile.Education) && (
                <Section title="Education">
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Detail label="School" value={year ? `Bhavan's, Vadodara · ${year}` : "Bhavan's, Vadodara"} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Detail
                        label="Higher education"
                        value={[profile.degree, profile.major].filter(Boolean).join(", ") + (profile.year_of_graduation ? ` (${profile.year_of_graduation})` : "")}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Detail label="More" value={profile.Education} />
                    </Grid>
                  </Grid>
                </Section>
              )}

              {(profile.achievements || profile.publications) && (
                <Section title="Achievements & publications">
                  <Stack spacing={2}>
                    <Detail label="Achievements" value={profile.achievements} />
                    <Detail label="Publications" value={profile.publications} />
                  </Stack>
                </Section>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Section title="Contact">
                <Stack spacing={1.5}>
                  {email && (
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <MailOutlineRoundedIcon fontSize="small" color="primary" />
                      <Link href={`mailto:${email}`} underline="hover" sx={{ wordBreak: "break-all" }}>
                        {email}
                      </Link>
                    </Stack>
                  )}
                  {phone && (
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <PhoneRoundedIcon fontSize="small" color="primary" />
                      <Link href={`tel:${phone}`} underline="hover">
                        {phone}
                      </Link>
                    </Stack>
                  )}
                  {isOwn && profile.alternative_email && <Detail label="Alternate email" value={profile.alternative_email} />}
                  {isOwn && <Detail label="Address" value={[profile.street_address, profile.city, profile.state, profile.postal_code, profile.country].filter(Boolean).join(", ")} />}
                  {isOwn && <Detail label="Birthday" value={formatDate(profile.birth_date)} />}
                  {!email && !phone && !isOwn && (
                    <Typography variant="body2" color="text.secondary">
                      {name} keeps contact details private. Follow them to stay in touch.
                    </Typography>
                  )}
                  {isOwn && (
                    <Typography variant="caption" color="text.secondary">
                      Others see your email {profile.show_email ? "✓" : "✗"} and phone {profile.show_phone ? "✓" : "✗"} — change this in Edit profile.
                    </Typography>
                  )}
                </Stack>
              </Section>

              {socials.length > 0 && (
                <Section title="Links">
                  <Stack spacing={1}>
                    {socials.map((s) => (
                      <Button
                        key={s.key}
                        href={externalUrl(profile[s.key])}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={s.icon}
                        sx={{ justifyContent: "flex-start", color: "text.primary" }}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </Stack>
                </Section>
              )}

              {profile.is_mentor && (
                <Section title="Mentorship">
                  <Typography variant="body2" color="text.secondary" sx={{ mb: mentorAreas.length ? 1.5 : 0 }}>
                    {isOwn ? "You're listed as a mentor." : `${name} is open to mentoring fellow alumni.`}
                  </Typography>
                  {mentorAreas.length > 0 && <ChipList items={mentorAreas} color="info" />}
                </Section>
              )}
            </Stack>
          </Grid>
        </Grid>
      ) : posts === null ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <EmptyState icon={DynamicFeedRoundedIcon} title={isOwn ? "You haven't posted yet" : `${name} hasn't posted yet`} />
      ) : (
        <Stack spacing={2.5} sx={{ maxWidth: 720, mx: "auto" }}>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={currentUser?.uid} onDeleted={(id) => setPosts((list) => list.filter((x) => x.id !== id))} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ProfileView;

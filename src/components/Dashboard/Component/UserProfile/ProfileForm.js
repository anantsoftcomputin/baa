import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import { getBatchYear, updateUserProfile } from "../../../../firebase/firestore";
import { uploadProfilePicture } from "../../../../firebase/storage";
import { logProfileUpdated } from "../../../../firebase/analytics";
import DashboardHeader from "../../../common/DashboardHeader";
import UserAvatar from "../../../common/UserAvatar";

const CURRENT_YEAR = new Date().getFullYear();

const TEXT_FIELDS = [
  "username",
  "bio",
  "birth_date",
  "job_title",
  "company",
  "industry",
  "company_website",
  "company_address",
  "company_portfolio",
  "degree",
  "major",
  "year_of_graduation",
  "phone_number",
  "alternative_email",
  "street_address",
  "city",
  "state",
  "country",
  "postal_code",
  "linkedin_profile",
  "twitter_profile",
  "facebook_profile",
  "skills",
  "interests",
  "achievements",
  "publications",
  "mentorship_areas",
];

const asText = (v) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v));

const Section = ({ title, description, children }) => (
  <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={8}>
        {children}
      </Grid>
    </Grid>
  </Card>
);

/** Edit-profile form. Writes only the member's own, non-privileged fields. */
const ProfileForm = ({ userID, userProfileData }) => {
  const navigate = useNavigate();
  const { refreshUserProfile, currentUser } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState(() => {
    const initial = Object.fromEntries(TEXT_FIELDS.map((f) => [f, asText(userProfileData[f])]));
    initial.username = initial.username || currentUser?.displayName || "";
    initial.batchyear = asText(getBatchYear(userProfileData));
    initial.is_mentor = !!userProfileData.is_mentor;
    initial.show_email = !!userProfileData.show_email;
    initial.show_phone = !!userProfileData.show_phone;
    return initial;
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.username.trim() || form.username.trim().length < 3) next.username = "Please enter your name (at least 3 characters).";
    const y = parseInt(form.batchyear, 10);
    if (form.batchyear && (!Number.isFinite(y) || y < 1950 || y > CURRENT_YEAR)) next.batchyear = `Enter a year between 1950 and ${CURRENT_YEAR}.`;
    if (!form.batchyear) next.batchyear = "Batch year helps batchmates find you.";
    if (form.alternative_email && !/^\S+@\S+\.\S+$/.test(form.alternative_email)) next.alternative_email = "Enter a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("Please choose an image under 10 MB.");
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const updates = Object.fromEntries(TEXT_FIELDS.map((f) => [f, (form[f] || "").trim()]));
      updates.batchyear = parseInt(form.batchyear, 10) || null;
      updates.is_mentor = form.is_mentor;
      updates.show_email = form.show_email;
      updates.show_phone = form.show_phone;
      if (photo) updates.profile_picture = await uploadProfilePicture(userID, photo);
      await updateUserProfile(userID, updates);
      logProfileUpdated();
      await refreshUserProfile();
      toast.success("Profile saved");
      navigate("/dashboard/userProfile");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tf = (name, label, props = {}) => (
    <TextField
      fullWidth
      name={name}
      label={label}
      value={form[name] ?? ""}
      onChange={set(name)}
      error={!!errors[name]}
      helperText={errors[name] || props.helperText}
      {...props}
    />
  );

  return (
    <Box component="form" onSubmit={save} sx={{ maxWidth: 1000, mx: "auto" }}>
      <DashboardHeader
        title="Edit profile"
        subtitle="A complete profile helps batchmates recognise and reach you."
        actions={
          <>
            <Button color="inherit" onClick={() => navigate("/dashboard/userProfile")}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      />

      <Stack spacing={3}>
        <Section title="Basics" description="How you appear across the portal.">
          <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
            <UserAvatar user={userProfileData} name={form.username} src={preview || undefined} size={88} />
            <Box>
              <Button variant="outlined" startIcon={<PhotoCameraRoundedIcon />} onClick={() => fileRef.current?.click()}>
                {preview || userProfileData.profile_picture || userProfileData.photoURL ? "Change photo" : "Upload photo"}
              </Button>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.75 }}>
                JPG or PNG, up to 10 MB.
              </Typography>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
            </Box>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              {tf("username", "Full name", { required: true })}
            </Grid>
            <Grid item xs={12} sm={4}>
              {tf("batchyear", "Batch year", { required: true, inputProps: { inputMode: "numeric" } })}
            </Grid>
            <Grid item xs={12}>
              {tf("bio", "Bio", { multiline: true, minRows: 3, helperText: "A few lines about you — what you do, what you're into." })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("birth_date", "Birthday", { type: "date", InputLabelProps: { shrink: true } })}
            </Grid>
          </Grid>
        </Section>

        <Section title="Work" description="Help alumni find you for opportunities and mentorship.">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {tf("job_title", "Job title")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("company", "Company")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("industry", "Industry")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("company_website", "Company website")}
            </Grid>
            <Grid item xs={12}>
              {tf("company_address", "Office address")}
            </Grid>
            <Grid item xs={12}>
              {tf("company_portfolio", "Portfolio / about your work", { multiline: true, minRows: 2 })}
            </Grid>
          </Grid>
        </Section>

        <Section title="Education" description="Studies after Bhavan's.">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              {tf("degree", "Degree")}
            </Grid>
            <Grid item xs={12} sm={4}>
              {tf("major", "Major / specialisation")}
            </Grid>
            <Grid item xs={12} sm={3}>
              {tf("year_of_graduation", "Year", { inputProps: { inputMode: "numeric" } })}
            </Grid>
          </Grid>
        </Section>

        <Section title="Contact" description="Your address is only visible to you. Choose below whether others see your email and phone.">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {tf("phone_number", "Phone", { inputProps: { inputMode: "tel" } })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("alternative_email", "Alternate email", { type: "email" })}
            </Grid>
            <Grid item xs={12}>
              {tf("street_address", "Street address")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("city", "City")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("state", "State")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("country", "Country")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("postal_code", "Postal code")}
            </Grid>
          </Grid>
          <Stack sx={{ mt: 2 }}>
            <FormControlLabel control={<Switch checked={form.show_email} onChange={set("show_email")} />} label="Show my email to other members" />
            <FormControlLabel control={<Switch checked={form.show_phone} onChange={set("show_phone")} />} label="Show my phone number to other members" />
          </Stack>
        </Section>

        <Section title="Links">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {tf("linkedin_profile", "LinkedIn URL")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("twitter_profile", "X / Twitter URL")}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("facebook_profile", "Facebook URL")}
            </Grid>
          </Grid>
        </Section>

        <Section title="Interests & achievements" description="Separate skills and interests with commas.">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {tf("skills", "Skills", { placeholder: "e.g. Marketing, Python, Public speaking" })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {tf("interests", "Interests", { placeholder: "e.g. Cricket, Photography" })}
            </Grid>
            <Grid item xs={12}>
              {tf("achievements", "Achievements", { multiline: true, minRows: 2 })}
            </Grid>
            <Grid item xs={12}>
              {tf("publications", "Publications", { multiline: true, minRows: 2 })}
            </Grid>
          </Grid>
        </Section>

        <Section title="Mentorship" description="Offer guidance to students and younger alumni.">
          <FormControlLabel control={<Switch checked={form.is_mentor} onChange={set("is_mentor")} />} label="I'm open to mentoring" />
          {form.is_mentor && <Box sx={{ mt: 2 }}>{tf("mentorship_areas", "Areas you can help with", { placeholder: "e.g. Careers in finance, Studying abroad" })}</Box>}
        </Section>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={() => navigate("/dashboard/userProfile")}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" size="large" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ProfileForm;

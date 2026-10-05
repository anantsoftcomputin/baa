import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Box, Button, Card, Container, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { getWebsiteContent, submitContactForm } from "../../../../firebase/firestore";
import PageHeader from "../../../common/PageHeader";
import SectionHeader from "../../../common/SectionHeader";
import Reveal from "../../../common/Reveal";

export const CONTACT_FALLBACK = {
  email: "contact@baa.com",
  phone: "+91 1234567890",
  address: "Bhavan's School, Vadodara, Gujarat, India",
};

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14882.181992377934!2d73.16385965!3d22.33736295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc438ffffffff%3A0x9983a37a832dd134!2sBhavan's%20School%2C%20Vadodara!5e0!3m2!1sen!2sin!4v1694430824557!5m2!1sen!2sin";

const GROUPS = [
  { value: "general", label: "General inquiry" },
  { value: "membership", label: "Membership" },
  { value: "events", label: "Events" },
  { value: "alumni", label: "Alumni relations" },
  { value: "support", label: "Website support" },
];

const EMPTY = { name: "", email: "", phone: "", address: "", group: "general", message: "" };

const InfoRow = ({ icon: Icon, label, value, href }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start">
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 3,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(232,133,31,0.12)",
        color: "primary.main",
      }}
    >
      <Icon fontSize="small" />
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </Typography>
      <Typography
        component={href ? "a" : "p"}
        href={href}
        sx={{ display: "block", fontWeight: 600, color: "text.primary", textDecoration: "none", whiteSpace: "pre-line", "&:hover": href ? { color: "primary.main" } : {} }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

/**
 * Contact form + details. Rendered as a section on the home page and as the
 * standalone /contact page (`page` prop).
 */
const ContactUs = ({ page = false }) => {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [contact, setContact] = useState(CONTACT_FALLBACK);

  useEffect(() => {
    getWebsiteContent("contact")
      .then((c) => c && setContact({ ...CONTACT_FALLBACK, ...Object.fromEntries(Object.entries(c).filter(([, v]) => v)) }))
      .catch(() => {});
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitContactForm(form);
      toast.success("Thanks for reaching out! We'll get back to you soon.");
      setForm(EMPTY);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const body = (
    <Grid container spacing={{ xs: 4, md: 5 }}>
      <Grid item xs={12} md={7}>
        <Reveal>
          <Card sx={{ p: { xs: 3, md: 4.5 }, boxShadow: (t) => t.custom.shadows.sm }}>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Send us a message
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              We usually reply within a couple of working days.
            </Typography>
            <Box component="form" onSubmit={onSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Full name" name="name" value={form.name} onChange={onChange} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} required fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone" name="phone" value={form.phone} onChange={onChange} required fullWidth inputProps={{ inputMode: "tel" }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select label="Topic" name="group" value={form.group} onChange={onChange} fullWidth>
                    {GROUPS.map((g) => (
                      <MenuItem key={g.value} value={g.value}>
                        {g.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField label="City / address" name="address" value={form.address} onChange={onChange} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Message" name="message" value={form.message} onChange={onChange} fullWidth multiline minRows={4} />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" size="large" endIcon={<SendRoundedIcon />} disabled={sending} sx={{ mt: 3 }}>
                {sending ? "Sending…" : "Send message"}
              </Button>
            </Box>
          </Card>
        </Reveal>
      </Grid>
      <Grid item xs={12} md={5}>
        <Reveal delay={120}>
          <Stack spacing={3}>
            <Stack spacing={2.5} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, bgcolor: "#fff", border: "1px solid", borderColor: "divider" }}>
              <InfoRow icon={MailOutlineRoundedIcon} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
              <InfoRow icon={PhoneRoundedIcon} label="Phone" value={contact.phone} href={`tel:${String(contact.phone).replace(/\s/g, "")}`} />
              <InfoRow icon={PlaceRoundedIcon} label="Address" value={contact.address} />
            </Stack>
            <Box
              component="iframe"
              title="Map to Bhavan's School, Vadodara"
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              sx={{ width: "100%", height: 280, border: 0, borderRadius: 4, filter: "saturate(0.85)" }}
            />
          </Stack>
        </Reveal>
      </Grid>
    </Grid>
  );

  if (page) {
    return (
      <>
        <PageHeader
          eyebrow="Contact"
          title="We'd love to hear from you"
          subtitle="Questions about membership, events or volunteering? Drop us a line."
          crumbs={[{ label: "Contact" }]}
        />
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          {body}
        </Container>
      </>
    );
  }

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="Get in touch" title="Contact us" subtitle="Questions about membership, events or volunteering? Drop us a line." />
        {body}
      </Container>
    </Box>
  );
};

export const ContactPage = () => <ContactUs page />;

export default ContactUs;

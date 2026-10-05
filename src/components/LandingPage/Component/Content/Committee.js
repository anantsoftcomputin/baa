import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SectionHeader from "../../../common/SectionHeader";
import EmptyState from "../../../common/EmptyState";
import ImageBox from "../../../common/ImageBox";
import Reveal from "../../../common/Reveal";
import { externalUrl, imageOf } from "../../../../utils/format";

const ContactRow = ({ icon: Icon, href, children }) => (
  <Stack
    direction="row"
    spacing={1.5}
    alignItems="center"
    component="a"
    href={href}
    target={href?.startsWith("http") ? "_blank" : undefined}
    rel="noopener noreferrer"
    sx={{
      textDecoration: "none",
      color: "text.primary",
      p: 1.25,
      borderRadius: 2,
      "&:hover": { bgcolor: "rgba(232,133,31,0.08)" },
    }}
  >
    <Icon sx={{ color: "primary.main" }} fontSize="small" />
    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
      {children}
    </Typography>
  </Stack>
);

const Committee = ({ committeeData = [] }) => {
  const [selected, setSelected] = useState(null);
  const role = (m) => m.designation || m.position || "";

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: "#fff" }}>
      <Container maxWidth="lg">
        <SectionHeader
          eyebrow="Leadership"
          title="Meet the committee"
          subtitle="The volunteers who keep our alumni community running, year after year."
        />
        {committeeData.length === 0 ? (
          <EmptyState icon={GroupsRoundedIcon} title="Committee details coming soon" />
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {committeeData.map((member, i) => (
              <Grid item xs={6} sm={4} md={3} key={member.id || i}>
                <Reveal delay={(i % 4) * 80} sx={{ height: "100%" }}>
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(member)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(member)}
                    sx={{
                      cursor: "pointer",
                      height: "100%",
                      outline: "none",
                      "&:hover img, &:focus-visible img": { transform: "scale(1.05)", filter: "none" },
                    }}
                  >
                    <ImageBox
                      src={imageOf(member)}
                      alt={member.name}
                      ratio="4 / 5"
                      rounded={4}
                      icon={PersonRoundedIcon}
                      imgSx={{ transition: "transform .5s ease, filter .5s ease", filter: "saturate(0.9)" }}
                    />
                    <Box sx={{ pt: 1.75, px: 0.5 }}>
                      <Typography variant="h6" sx={{ fontSize: { xs: "0.98rem", md: "1.08rem" } }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                        {role(member)}
                      </Typography>
                    </Box>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <DialogContent sx={{ p: 0 }}>
            <IconButton
              onClick={() => setSelected(null)}
              aria-label="Close"
              sx={{ position: "absolute", top: 12, right: 12, zIndex: 1, bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "#fff" } }}
            >
              <CloseRoundedIcon />
            </IconButton>
            <Grid container>
              <Grid item xs={12} sm={5}>
                <ImageBox
                  src={imageOf(selected)}
                  alt={selected.name}
                  ratio="4 / 5"
                  icon={PersonRoundedIcon}
                  sx={{ height: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={7}>
                <Box sx={{ p: { xs: 3, sm: 4 } }}>
                  <Typography variant="overline" color="primary">
                    {role(selected)}
                  </Typography>
                  <Typography variant="h3" component="h3" sx={{ mb: 2 }}>
                    {selected.name}
                  </Typography>
                  {selected.description && (
                    <Typography color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-line" }}>
                      {selected.description}
                    </Typography>
                  )}
                  <Stack spacing={0.5}>
                    {selected.email && (
                      <ContactRow icon={MailOutlineRoundedIcon} href={`mailto:${selected.email}`}>
                        {selected.email}
                      </ContactRow>
                    )}
                    {selected.phone && (
                      <ContactRow icon={PhoneRoundedIcon} href={`tel:${selected.phone}`}>
                        {selected.phone}
                      </ContactRow>
                    )}
                    {selected.websites && (
                      <ContactRow icon={LanguageRoundedIcon} href={externalUrl(selected.websites)}>
                        {selected.websites}
                      </ContactRow>
                    )}
                  </Stack>
                  <Button onClick={() => setSelected(null)} sx={{ mt: 2 }}>
                    Close
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
};

export default Committee;

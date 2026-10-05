import React from "react";
import { Box, Card, Chip, Container, Grid, Typography } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import SectionHeader from "../../../common/SectionHeader";
import EmptyState from "../../../common/EmptyState";
import ImageBox from "../../../common/ImageBox";
import Reveal from "../../../common/Reveal";
import { formatDate, imageOf, truncate } from "../../../../utils/format";

const Achievements = ({ achievements = [] }) => (
  <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.default" }}>
    <Container maxWidth="lg">
      <SectionHeader
        eyebrow="Proud moments"
        title="Achievements"
        subtitle="Milestones from our alumni and the association — celebrated together."
      />
      {achievements.length === 0 ? (
        <EmptyState icon={EmojiEventsRoundedIcon} title="Achievements will appear here" />
      ) : (
        <Grid container spacing={3}>
          {achievements.map((a, i) => (
            <Grid item xs={12} sm={6} md={4} key={a.id || i}>
              <Reveal delay={(i % 3) * 100} sx={{ height: "100%" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <ImageBox src={imageOf(a)} alt={a.title} icon={EmojiEventsRoundedIcon} ratio="16 / 10">
                    {a.category && (
                      <Chip
                        label={a.category}
                        size="small"
                        sx={{ position: "absolute", left: 14, top: 14, bgcolor: "rgba(255,255,255,0.92)" }}
                      />
                    )}
                  </ImageBox>
                  <Box sx={{ p: 2.5, display: "flex", gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(232,133,31,0.12)",
                        color: "primary.main",
                      }}
                    >
                      <EmojiEventsRoundedIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: "1.05rem" }}>
                        {a.title}
                      </Typography>
                      {a.date && (
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(a.date) || a.date}
                        </Typography>
                      )}
                      {a.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {truncate(a.description, 160)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Reveal>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  </Box>
);

export default Achievements;

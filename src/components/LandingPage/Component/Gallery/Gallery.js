import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  IconButton,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { getGalleryImages } from "../../../../firebase/firestore";
import PageHeader from "../../../common/PageHeader";
import SectionHeader from "../../../common/SectionHeader";
import EmptyState from "../../../common/EmptyState";
import Reveal from "../../../common/Reveal";
import { imageOf } from "../../../../utils/format";

const FILTERS = [
  { key: "category", label: "Category", field: "category" },
  { key: "batch", label: "Batch", field: "batch" },
  { key: "event", label: "Event", field: "eventName" },
];

/** CSS-columns masonry: keeps each photo's natural aspect ratio. */
const Masonry = ({ items, onOpen }) => (
  <Box sx={{ columnCount: { xs: 1, sm: 2, md: 3 }, columnGap: "16px" }}>
    {items.map((item, i) => (
      <Box
        key={item.id || i}
        role="button"
        tabIndex={0}
        aria-label={`Open ${item.title || "photo"}`}
        onClick={() => onOpen(i)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(i)}
        sx={{
          breakInside: "avoid",
          mb: 2,
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          cursor: "zoom-in",
          bgcolor: "#F3EADF",
          "& img": { width: "100%", height: "auto", transition: "transform .6s ease" },
          "&:hover img, &:focus-visible img": { transform: "scale(1.04)" },
          "&:hover .caption, &:focus-visible .caption": { opacity: 1, transform: "none" },
        }}
      >
        <img src={imageOf(item)} alt={item.title || "Gallery photo"} loading="lazy" />
        {(item.title || item.category) && (
          <Box
            className="caption"
            sx={{
              position: "absolute",
              inset: "auto 0 0 0",
              p: 2,
              pt: 6,
              color: "#fff",
              background: "linear-gradient(180deg, transparent, rgba(12,18,26,0.85))",
              opacity: { xs: 1, md: 0 },
              transform: { xs: "none", md: "translateY(8px)" },
              transition: "all .3s ease",
            }}
          >
            {item.title && <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>}
            {item.category && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {item.category}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    ))}
  </Box>
);

export const Lightbox = ({ items, index, onClose, onIndex }) => {
  const open = index !== null && index >= 0;
  const item = open ? items[index] : null;

  const step = useCallback(
    (delta) => onIndex((index + delta + items.length) % items.length),
    [index, items.length, onIndex]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none", m: 1, maxWidth: "96vw" } }}
      BackdropProps={{ sx: { bgcolor: "rgba(10,14,20,0.92)" } }}
    >
      {item && (
        <Box sx={{ position: "relative", color: "#fff", textAlign: "center" }}>
          <IconButton
            onClick={onClose}
            aria-label="Close"
            sx={{ position: "fixed", top: 16, right: 16, color: "#fff", bgcolor: "rgba(255,255,255,0.1)" }}
          >
            <CloseRoundedIcon />
          </IconButton>
          {items.length > 1 && (
            <>
              <IconButton
                onClick={() => step(-1)}
                aria-label="Previous"
                sx={{ position: "fixed", left: 16, top: "50%", color: "#fff", bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <ChevronLeftRoundedIcon />
              </IconButton>
              <IconButton
                onClick={() => step(1)}
                aria-label="Next"
                sx={{ position: "fixed", right: 16, top: "50%", color: "#fff", bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <ChevronRightRoundedIcon />
              </IconButton>
            </>
          )}
          <Box
            component="img"
            src={imageOf(item)}
            alt={item.title || ""}
            sx={{ maxWidth: "88vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 2, mx: "auto" }}
          />
          <Box sx={{ mt: 2 }}>
            {item.title && <Typography variant="h6">{item.title}</Typography>}
            {item.description && <Typography sx={{ color: "rgba(255,255,255,0.7)", maxWidth: 640, mx: "auto" }}>{item.description}</Typography>}
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
              {index + 1} / {items.length}
            </Typography>
          </Box>
        </Box>
      )}
    </Dialog>
  );
};

/** Home-page teaser: a handful of photos and a link to the full gallery. */
export const GalleryPreview = ({ galleryData = [], limit = 6 }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(null);
  const items = galleryData.filter((g) => imageOf(g)).slice(0, limit);
  if (items.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: "#fff" }}>
      <Container maxWidth="lg">
        <SectionHeader
          eyebrow="Memories"
          title="From the gallery"
          subtitle="Moments from reunions, events and campus life."
          align="left"
          action={
            <Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/Gallery")}>
              Full gallery
            </Button>
          }
        />
        <Reveal>
          <Masonry items={items} onOpen={setIndex} />
        </Reveal>
      </Container>
      <Lightbox items={items} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </Box>
  );
};

/** The /Gallery page. */
const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("category");
  const [value, setValue] = useState("all");
  const [index, setIndex] = useState(null);

  useEffect(() => {
    getGalleryImages()
      .then((images) => setItems((images || []).filter((g) => imageOf(g))))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const field = FILTERS.find((f) => f.key === filterType).field;
  const options = useMemo(
    () => [...new Set(items.map((i) => i[field]).filter(Boolean))].sort(),
    [items, field]
  );
  const visible = value === "all" ? items : items.filter((i) => String(i[field]) === String(value));

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Moments worth keeping"
        subtitle="Photographs from reunions, events and decades of campus life."
        crumbs={[{ label: "Gallery" }]}
      />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        {items.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={filterType}
                onChange={(_, v) => {
                  if (v) {
                    setFilterType(v);
                    setValue("all");
                  }
                }}
                sx={{ bgcolor: "#fff", "& .MuiToggleButton-root": { px: 2, textTransform: "none", fontWeight: 600 } }}
              >
                {FILTERS.map((f) => (
                  <ToggleButton key={f.key} value={f.key}>
                    {f.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {["all", ...options].map((o) => (
                  <Chip
                    key={o}
                    label={o === "all" ? "All" : o}
                    onClick={() => setValue(o)}
                    color={value === o ? "primary" : "default"}
                    variant={value === o ? "filled" : "outlined"}
                    sx={{ bgcolor: value === o ? undefined : "#fff" }}
                  />
                ))}
              </Stack>
            </Stack>
          </Box>
        )}

        {loading ? (
          <Box sx={{ columnCount: { xs: 1, sm: 2, md: 3 }, columnGap: "16px" }}>
            {[260, 180, 320, 220, 280, 200].map((h, i) => (
              <Skeleton key={i} variant="rounded" height={h} sx={{ mb: 2, breakInside: "avoid" }} />
            ))}
          </Box>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={PhotoLibraryRoundedIcon}
            title={items.length ? "No photos match this filter" : "The gallery is empty for now"}
            description={items.length ? "Try a different category." : "Photos will appear here once they're uploaded."}
          />
        ) : (
          <Masonry items={visible} onOpen={setIndex} />
        )}
      </Container>
      <Lightbox items={visible} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
};

export default Gallery;

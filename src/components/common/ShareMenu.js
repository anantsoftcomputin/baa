import React, { useState } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { toast } from "react-toastify";

export const shareTargets = (url, title) => ({
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
});

const OPTIONS = [
  { key: "whatsapp", label: "WhatsApp", icon: <WhatsAppIcon sx={{ color: "#25D366" }} /> },
  { key: "facebook", label: "Facebook", icon: <FacebookIcon sx={{ color: "#1877F2" }} /> },
  { key: "x", label: "X (Twitter)", icon: <XIcon /> },
  { key: "linkedin", label: "LinkedIn", icon: <LinkedInIcon sx={{ color: "#0A66C2" }} /> },
  { key: "copy", label: "Copy link", icon: <LinkRoundedIcon /> },
];

/**
 * Share button + menu. Uses the native share sheet on phones when available.
 * `onShared(platform)` lets callers record the share (e.g. post share counts).
 */
const ShareMenu = ({ url, title = "", onShared, size = "small", sx, renderTrigger }) => {
  const [anchor, setAnchor] = useState(null);

  const open = async (e) => {
    e.stopPropagation();
    const isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && navigator.share) {
      try {
        await navigator.share({ title, url });
        onShared && onShared("NATIVE");
      } catch (_) {
        /* user dismissed the share sheet */
      }
      return;
    }
    setAnchor(e.currentTarget);
  };

  const pick = async (key) => {
    setAnchor(null);
    if (key === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch (_) {
        toast.error("Couldn't copy the link");
        return;
      }
    } else {
      window.open(shareTargets(url, title)[key], "_blank", "noopener,noreferrer,width=640,height=560");
    }
    onShared && onShared(key.toUpperCase());
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger(open)
      ) : (
        <Tooltip title="Share">
          <IconButton size={size} onClick={open} aria-label="Share" sx={sx}>
            <IosShareRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} onClick={(e) => e.stopPropagation()}>
        {OPTIONS.map((o) => (
          <MenuItem key={o.key} onClick={() => pick(o.key)}>
            <ListItemIcon>{o.icon}</ListItemIcon>
            <ListItemText>{o.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ShareMenu;

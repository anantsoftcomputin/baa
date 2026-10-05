import React from "react";
import { Avatar } from "@mui/material";
import { initials } from "../../utils/format";

const palette = ["#E8851F", "#1F5B3F", "#2BA6DE", "#7CB342", "#B5523B", "#5E4FA2"];

const colorFor = (seed = "") => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
};

/** Avatar that shows the user's photo or coloured initials. */
const UserAvatar = ({ user, name, src, size = 40, sx, ...rest }) => {
  const label = name || user?.username || user?.email || "";
  const image = src || user?.profile_picture || user?.photoURL || user?.userPhoto || "";
  return (
    <Avatar
      src={image || undefined}
      alt={label}
      sx={{ width: size, height: size, fontSize: size * 0.38, bgcolor: colorFor(label), ...sx }}
      {...rest}
    >
      {initials(label)}
    </Avatar>
  );
};

export default UserAvatar;

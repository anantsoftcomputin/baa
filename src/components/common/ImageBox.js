import React, { useState } from "react";
import { Box } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

/**
 * Image with a fixed aspect ratio and a branded placeholder when the source is
 * missing or fails to load.
 */
const ImageBox = ({ src, alt = "", ratio = "16 / 10", icon: Icon = ImageOutlinedIcon, rounded = 0, sx, imgSx, children }) => {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <Box
      sx={{
        position: "relative",
        aspectRatio: ratio,
        overflow: "hidden",
        borderRadius: rounded,
        background: "linear-gradient(135deg, #F3EADF 0%, #FBF7F1 60%, #EAF3E2 100%)",
        ...sx,
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...imgSx }}
        />
      ) : (
        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(232,133,31,0.45)" }}>
          <Icon sx={{ fontSize: 44 }} />
        </Box>
      )}
      {children}
    </Box>
  );
};

export default ImageBox;

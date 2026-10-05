import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

/**
 * Fades its children in when they scroll into view. Purely decorative: content
 * is rendered immediately and stays visible if IntersectionObserver is missing.
 */
const Reveal = ({ children, delay = 0, as = "div", sx, ...rest }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      component={as}
      className={`reveal${visible ? " is-visible" : ""}`}
      sx={{ transitionDelay: `${delay}ms`, ...sx }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default Reveal;

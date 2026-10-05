import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, ButtonBase, Typography } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useAuth } from "../../../../contexts/AuthContext";
import UserAvatar from "../../../common/UserAvatar";

/** Height of the dock and the gap below it, so pages can leave room on phones. */
export const BOTTOM_NAV_HEIGHT = 64;
export const BOTTOM_NAV_GAP = 12;

/**
 * Phone-only floating dock for the public website (hidden from the md breakpoint up).
 * A highlight slides to the active tab; the dock tucks away while scrolling down
 * and returns when scrolling up.
 */
const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, displayName, photoURL } = useAuth();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  const items = [
    { to: "/", label: "Home", icon: HomeRoundedIcon },
    { to: "/events", label: "Events", icon: EventRoundedIcon },
    { to: "/Gallery", label: "Gallery", icon: PhotoLibraryRoundedIcon },
    { to: "/Blogs", label: "Blogs", icon: ArticleRoundedIcon },
    currentUser
      ? { to: "/dashboard", label: "You", avatar: true }
      : { to: "/login", label: "Sign in", icon: PersonRoundedIcon, also: ["/register", "/forgotPassword"] },
  ];

  const lower = pathname.toLowerCase();
  const activeIndex = items.findIndex((i) =>
    i.to === "/" ? pathname === "/" : lower.startsWith(i.to.toLowerCase()) || (i.also || []).includes(pathname)
  );

  // Auto-hide on scroll down, reveal on scroll up or near the top.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80 || delta < -6) setHidden(false);
      else if (delta > 6) setHidden(true);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setHidden(false), [pathname]);

  const go = (to) => {
    if (to === pathname) window.scrollTo({ top: 0, behavior: "smooth" });
    else navigate(to);
  };

  return (
    <>
      {/* Spacer so the footer's last lines aren't covered by the dock */}
      <Box
        aria-hidden
        sx={{ display: { xs: "block", md: "none" }, height: `calc(${BOTTOM_NAV_HEIGHT + BOTTOM_NAV_GAP * 2}px + env(safe-area-inset-bottom))`, bgcolor: "#0F1720" }}
      />
      <Box
        component="nav"
        aria-label="Main"
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          left: BOTTOM_NAV_GAP,
          right: BOTTOM_NAV_GAP,
          bottom: `calc(${BOTTOM_NAV_GAP}px + env(safe-area-inset-bottom))`,
          zIndex: (t) => t.zIndex.appBar,
          transform: hidden ? `translateY(calc(100% + ${BOTTOM_NAV_GAP * 2}px))` : "none",
          transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: `repeat(${items.length}, 1fr)`,
            height: BOTTOM_NAV_HEIGHT,
            maxWidth: 520,
            mx: "auto",
            px: 0.75,
            borderRadius: "22px",
            bgcolor: "rgba(17, 25, 35, 0.86)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 12px 32px rgba(10, 15, 22, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Sliding highlight behind the active tab */}
          {activeIndex >= 0 && (
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: 6,
                bottom: 6,
                left: 6,
                width: `calc((100% - 12px) / ${items.length})`,
                transform: `translateX(${activeIndex * 100}%)`,
                transition: "transform .4s cubic-bezier(.3,1.3,.5,1)",
                display: "grid",
                placeItems: "center",
                pointerEvents: "none",
              }}
            >
              <Box
                sx={{
                  width: "88%",
                  height: "100%",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, rgba(232,133,31,0.32) 0%, rgba(232,133,31,0.16) 100%)",
                  border: "1px solid rgba(246,176,98,0.35)",
                  boxShadow: "0 0 18px rgba(232,133,31,0.25)",
                }}
              />
            </Box>
          )}

          {items.map((item, i) => {
            const active = i === activeIndex;
            const Icon = item.icon;
            return (
              <ButtonBase
                key={item.to}
                onClick={() => go(item.to)}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  flexDirection: "column",
                  gap: 0.25,
                  borderRadius: "16px",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                  transition: "color .25s ease, transform .15s ease",
                  "&:active": { transform: "scale(0.92)" },
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {item.avatar ? (
                  <UserAvatar
                    name={displayName}
                    src={photoURL}
                    size={26}
                    sx={{ border: "2px solid", borderColor: active ? "primary.light" : "rgba(255,255,255,0.35)", fontSize: 11 }}
                  />
                ) : (
                  <Icon sx={{ fontSize: 24, color: active ? "primary.light" : "inherit", transition: "transform .3s ease", transform: active ? "translateY(-1px)" : "none" }} />
                )}
                <Typography component="span" sx={{ fontSize: "0.66rem", fontWeight: active ? 700 : 600, letterSpacing: "0.02em", lineHeight: 1.2 }}>
                  {item.label}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export default BottomNav;

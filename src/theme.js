import { createTheme, alpha } from "@mui/material/styles";

/**
 * Design tokens. Colours come from the BAA logo: saffron, leaf green, sky blue
 * and the deep green of "VADODARA", set on warm ink and cream.
 */
export const tokens = {
  saffron: "#E8851F",
  saffronDark: "#C46A0E",
  saffronLight: "#F6B062",
  forest: "#1F5B3F",
  forestDark: "#143D2A",
  leaf: "#7CB342",
  sky: "#2BA6DE",
  ink: "#17212E",
  inkSoft: "#2A3646",
  slate: "#5B6676",
  cream: "#FBF7F1",
  sand: "#F3EADF",
  line: "rgba(23, 33, 46, 0.09)",
  fontDisplay: "'Fraunces', 'Georgia', serif",
  fontBody: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const shadows = {
  xs: "0 1px 2px rgba(23, 33, 46, 0.06)",
  sm: "0 1px 3px rgba(23, 33, 46, 0.06), 0 6px 16px rgba(23, 33, 46, 0.05)",
  md: "0 4px 12px rgba(23, 33, 46, 0.06), 0 16px 40px rgba(23, 33, 46, 0.08)",
  lg: "0 24px 64px rgba(23, 33, 46, 0.16)",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: tokens.saffron,
      light: tokens.saffronLight,
      dark: tokens.saffronDark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: tokens.forest,
      light: "#2E7A56",
      dark: tokens.forestDark,
      contrastText: "#FFFFFF",
    },
    info: { main: tokens.sky },
    success: { main: "#2E8B57" },
    warning: { main: "#D99A1E" },
    error: { main: "#C8412E" },
    background: {
      default: tokens.cream,
      paper: "#FFFFFF",
    },
    text: {
      primary: tokens.ink,
      secondary: tokens.slate,
    },
    divider: tokens.line,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: tokens.fontBody,
    h1: { fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)", lineHeight: 1.05, letterSpacing: "-0.02em" },
    h2: { fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, letterSpacing: "-0.015em" },
    h3: { fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: "clamp(1.6rem, 3vw, 2.25rem)", lineHeight: 1.15, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, fontSize: "1.5rem", lineHeight: 1.25, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.3 },
    h6: { fontWeight: 700, fontSize: "1.0625rem", lineHeight: 1.35 },
    subtitle1: { fontWeight: 600, lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, fontSize: "0.875rem" },
    body1: { fontSize: "1rem", lineHeight: 1.65 },
    body2: { fontSize: "0.9rem", lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
    overline: { fontWeight: 700, letterSpacing: "0.14em", fontSize: "0.72rem", lineHeight: 1.6 },
    caption: { fontSize: "0.78rem", lineHeight: 1.5 },
  },
  custom: {
    tokens,
    shadows,
    gradient: `linear-gradient(135deg, ${tokens.saffron} 0%, #D9611A 100%)`,
    forestGradient: `linear-gradient(135deg, ${tokens.forest} 0%, ${tokens.forestDark} 100%)`,
    inkGradient: `linear-gradient(160deg, ${tokens.ink} 0%, #0E1620 100%)`,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.cream },
        "::selection": { background: alpha(tokens.saffron, 0.25) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "9px 20px",
          transition: "background-color .2s ease, box-shadow .2s ease, transform .2s ease, border-color .2s ease",
        },
        sizeLarge: { padding: "13px 28px", fontSize: "1rem", borderRadius: 12 },
        sizeSmall: { padding: "5px 12px", fontSize: "0.82rem" },
        containedPrimary: {
          "&:hover": { backgroundColor: tokens.saffronDark, boxShadow: `0 8px 20px ${alpha(tokens.saffron, 0.3)}` },
        },
        containedSecondary: {
          "&:hover": { boxShadow: `0 8px 20px ${alpha(tokens.forest, 0.3)}` },
        },
        outlined: { borderWidth: 1.5, "&:hover": { borderWidth: 1.5 } },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { transition: "background-color .2s ease, color .2s ease" } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: 16 },
        outlined: { borderColor: tokens.line },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: `1px solid ${tokens.line}`,
          boxShadow: shadows.xs,
          overflow: "hidden",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 20, "&:last-child": { paddingBottom: 20 } } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        sizeSmall: { fontSize: "0.75rem" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(23, 33, 46, 0.16)" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(23, 33, 46, 0.32)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 1.5 },
        },
      },
    },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiInputLabel: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20, boxShadow: shadows.lg },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontWeight: 700, fontSize: "1.2rem", padding: "20px 24px 8px" } },
    },
    MuiDialogActions: { styleOverrides: { root: { padding: "12px 24px 20px" } } },
    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: 14, boxShadow: shadows.md, border: `1px solid ${tokens.line}` },
      },
    },
    MuiMenuItem: { styleOverrides: { root: { borderRadius: 8, margin: "2px 6px", fontSize: "0.92rem" } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: tokens.ink, fontSize: "0.78rem", borderRadius: 8, padding: "6px 10px" },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: { height: 3, borderRadius: 3 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, minHeight: 44, fontSize: "0.92rem" },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 8, backgroundColor: alpha(tokens.saffron, 0.14) },
        bar: { borderRadius: 99 },
      },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiSkeleton: { styleOverrides: { rounded: { borderRadius: 14 } } },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.line}`,
          borderRadius: 14,
          backgroundColor: "#FFFFFF",
          "& .MuiDataGrid-columnHeaders": { backgroundColor: tokens.cream },
          "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 },
        },
      },
    },
  },
});

export default theme;

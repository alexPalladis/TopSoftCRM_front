import { createContext, useContext, useState, useMemo } from "react";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  GlobalStyles,
} from "@mui/material";

const ThemeContext = createContext(null);

export function useThemeMode() {
  return useContext(ThemeContext);
}

const darkGlobalStyles = (
  <GlobalStyles
    styles={{
      // ── Body base ─────────────────────────────────────────────────────────
      body: { color: "#e6edf3", background: "#0d1117" },

      // ── MUI components ────────────────────────────────────────────────────
      ".MuiPaper-root": {
        background: "#161b22 !important",
        borderColor: "#30363d !important",
      },
      ".MuiDialog-paper": {
        background: "#161b22 !important",
        borderColor: "#30363d !important",
      },
      ".MuiDrawer-paper": {
        background: "#161b22 !important",
        borderColor: "#30363d !important",
      },
      ".MuiDivider-root": { borderColor: "#30363d !important" },
      ".MuiInputLabel-root": { color: "#8b949e !important" },
      ".MuiInputBase-input": { color: "#e6edf3 !important" },
      ".MuiSelect-icon": { color: "#8b949e !important" },
      ".MuiOutlinedInput-notchedOutline": { borderColor: "#30363d !important" },
      ".MuiMenu-paper, .MuiPopover-paper": {
        background: "#161b22 !important",
        border: "0.5px solid #30363d !important",
      },
      ".MuiMenuItem-root": {
        color: "#e6edf3 !important",
        "&:hover": { background: "#1f2937 !important" },
      },
      ".MuiAutocomplete-paper": {
        background: "#161b22 !important",
        border: "0.5px solid #30363d !important",
      },
      ".MuiAutocomplete-option": {
        color: "#e6edf3 !important",
        "&:hover": { background: "#1f2937 !important" },
      },
      ".MuiCheckbox-root": { color: "#8b949e !important" },
      ".MuiCheckbox-root.Mui-checked": { color: "#58a6ff !important" },
      ".MuiTab-root": { color: "#8b949e !important" },
      ".MuiTab-root.Mui-selected": { color: "#58a6ff !important" },
      ".MuiTabs-indicator": { background: "#58a6ff !important" },
      ".MuiTooltip-tooltip": {
        background: "#1c2128 !important",
        border: "0.5px solid #30363d !important",
        color: "#e6edf3 !important",
      },
      ".MuiTypography-root": { color: "inherit" },

      // ── Tables ────────────────────────────────────────────────────────────
      "table td": {
        color: "#e6edf3 !important",
        borderBottom: "0.5px solid #30363d !important",
      },
      "table th": {
        color: "#8b949e !important",
        borderBottom: "0.5px solid #30363d !important",
        background: "#1c2128 !important",
      },
      "table tr:nth-of-type(odd) td": { background: "#161b22 !important" },
      "table tr:nth-of-type(even) td": { background: "#0d1117 !important" },

      // ── Scrollbar ─────────────────────────────────────────────────────────
      "*::-webkit-scrollbar": { width: "6px", height: "6px" },
      "*::-webkit-scrollbar-track": { background: "#0d1117" },
      "*::-webkit-scrollbar-thumb": {
        background: "#30363d",
        borderRadius: "3px",
      },

      // ══════════════════════════════════════════════════════════════════════
      // Inline-style overrides — these catch sx={{ color: "#111827" }} etc.
      // Browser computes hex → rgb, so we match on rgb() strings.
      // ══════════════════════════════════════════════════════════════════════

      // Text colors
      // #111827 (primary text — headings, labels, table cells)
      "[style*='color: rgb(17, 24, 39)']": { color: "#e6edf3 !important" },
      "[style*='color: rgb(17,24,39)']": { color: "#e6edf3 !important" },

      // #374151 (secondary text)
      "[style*='color: rgb(55, 65, 81)']": { color: "#c9d1d9 !important" },
      "[style*='color: rgb(55,65,81)']": { color: "#c9d1d9 !important" },

      // #6b7280 (muted text)
      "[style*='color: rgb(107, 114, 128)']": { color: "#8b949e !important" },
      "[style*='color: rgb(107,114,128)']": { color: "#8b949e !important" },

      // #9ca3af (placeholder/hint text)
      "[style*='color: rgb(156, 163, 175)']": { color: "#6e7681 !important" },
      "[style*='color: rgb(156,163,175)']": { color: "#6e7681 !important" },

      // #4b5563
      "[style*='color: rgb(75, 85, 99)']": { color: "#c9d1d9 !important" },

      // Backgrounds
      // #ffffff
      "[style*='background: rgb(255, 255, 255)']": {
        background: "#161b22 !important",
      },
      "[style*='background-color: rgb(255, 255, 255)']": {
        background: "#161b22 !important",
      },
      "[style*='background: white']": { background: "#161b22 !important" },

      // #f8f9fb (page bg)
      "[style*='background: rgb(248, 249, 251)']": {
        background: "#0d1117 !important",
      },
      "[style*='background-color: rgb(248, 249, 251)']": {
        background: "#0d1117 !important",
      },

      // #f9fafb
      "[style*='background: rgb(249, 250, 251)']": {
        background: "#161b22 !important",
      },
      "[style*='background-color: rgb(249, 250, 251)']": {
        background: "#161b22 !important",
      },

      // #fafafa (table stripe)
      "[style*='background: rgb(250, 250, 250)']": {
        background: "#1c2128 !important",
      },
      "[style*='background-color: rgb(250, 250, 250)']": {
        background: "#1c2128 !important",
      },

      // Borders
      "[style*='border: 0.5px solid rgb(229, 231, 235)']": {
        border: "0.5px solid #30363d !important",
      },
      "[style*='border-bottom: 0.5px solid rgb(229, 231, 235)']": {
        borderBottom: "0.5px solid #30363d !important",
      },
      "[style*='border-right: 0.5px solid rgb(229, 231, 235)']": {
        borderRight: "0.5px solid #30363d !important",
      },
      "[style*='border-top: 0.5px solid rgb(229, 231, 235)']": {
        borderTop: "0.5px solid #30363d !important",
      },
      "[style*='border-left: 0.5px solid']": {
        borderLeftColor: "#30363d !important",
      },
      "[style*='border-color: rgb(229, 231, 235)']": {
        borderColor: "#30363d !important",
      },

      // ── MuiTypography with hardcoded sx colors ─────────────────────────────
      // This is the key fix for titles/headings — they use sx fontWeight+color
      "h1, h2, h3, h4, h5, h6": { color: "#e6edf3 !important" },

      // Catch page titles rendered as p/span with dark color
      "p[style*='color: rgb(17, 24, 39)']": { color: "#e6edf3 !important" },
      "span[style*='color: rgb(17, 24, 39)']": { color: "#e6edf3 !important" },
      "div[style*='color: rgb(17, 24, 39)']": { color: "#e6edf3 !important" },
    }}
  />
);

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem("colorMode") || "light",
  );

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("colorMode", next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: { default: "#f8f9fb", paper: "#ffffff" },
                primary: { main: "#1f6feb" },
                divider: "#e5e7eb",
              }
            : {
                background: { default: "#0d1117", paper: "#161b22" },
                primary: { main: "#58a6ff" },
                divider: "#30363d",
                text: {
                  primary: "#e6edf3",
                  secondary: "#8b949e",
                },
              }),
        },
        shape: { borderRadius: 8 },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          allVariants: {
            // Let color cascade from parent in dark mode
            color: "inherit",
          },
        },
        components: {
          MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
          MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none" } } },
          MuiAppBar: { styleOverrides: { root: { backgroundImage: "none" } } },
          MuiDialog: { styleOverrides: { paper: { backgroundImage: "none" } } },
          MuiTypography: {
            styleOverrides: {
              root: {
                // Don't override color in dark mode — let GlobalStyles handle it
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {mode === "dark" && darkGlobalStyles}
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

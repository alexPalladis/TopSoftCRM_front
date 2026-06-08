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
      // ── TextField / Input backgrounds — ALL states ───────────────────────────
      ".MuiOutlinedInput-root": {
        backgroundColor: "#1c2128 !important",
        color: "#e6edf3 !important",
      },
      ".MuiOutlinedInput-root.Mui-disabled": {
        backgroundColor: "#161b22 !important",
      },
      ".MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
        borderColor: "#21262d !important",
      },
      ".MuiInputBase-input": {
        color: "#e6edf3 !important",
        "-webkit-text-fill-color": "#e6edf3 !important",
      },
      ".MuiInputBase-input.Mui-disabled": {
        color: "#8b949e !important",
        "-webkit-text-fill-color": "#8b949e !important",
      },
      // Hardcoded background #fff in sx props inside CustomerFormPage subscriptions
      "[style*='background: rgb(255, 255, 255)'] .MuiOutlinedInput-root": {
        backgroundColor: "#1c2128 !important",
      },
      // Hardcoded background overrides on OutlinedInput root itself
      ".MuiOutlinedInput-root[style*='background']": {
        backgroundColor: "#1c2128 !important",
      },
      // Catch the specific subscription fields that set background directly
      // on the MuiOutlinedInput-root via sx={{ "& .MuiOutlinedInput-root": { background: "#fff" } }}
      ".MuiOutlinedInput-root[class*='MuiOutlinedInput']": {
        backgroundColor: "#1c2128 !important",
      },
      // pointer-events fix — disabled inputs must not block clicks on parent
      ".MuiOutlinedInput-root.Mui-disabled": {
        pointerEvents: "none",
      },
      // number input fields in commission tables (plain HTML input, not MUI)
      "input[type='number']": {
        backgroundColor: "#1c2128 !important",
        color: "#e6edf3 !important",
        borderColor: "#30363d !important",
      },
      "input[type='date']": {
        backgroundColor: "#1c2128 !important",
        color: "#e6edf3 !important",
        colorScheme: "dark",
      },
      "input[type='text'], input[type='password'], input[type='email']": {
        backgroundColor: "transparent !important",
      },
      // FormControl Select background
      ".MuiSelect-select": {
        backgroundColor: "transparent !important",
      },
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
      ".MuiChip-root": {
        borderColor: "#30363d !important",
      },
      ".MuiTypography-root": { color: "#e6edf3 !important" },
      // ── pointer-events fix — overlays blocking clicks ─────────────────────────
      ".MuiOutlinedInput-root.Mui-disabled *": {
        pointerEvents: "none !important",
        cursor: "default !important",
      },
      // Ensure enabled inputs are always clickable
      ".MuiOutlinedInput-root:not(.Mui-disabled)": {
        pointerEvents: "auto !important",
        cursor: "text !important",
      },
      ".MuiSelect-root:not(.Mui-disabled)": {
        pointerEvents: "auto !important",
        cursor: "pointer !important",
      },
      // ── Table row backgrounds — catch tr inline styles ────────────────────────
      "tr[style*='background: rgb(255, 255, 255)']": {
        background: "#161b22 !important",
      },
      "tr[style*='background-color: rgb(255, 255, 255)']": {
        background: "#161b22 !important",
      },
      "tr[style*='background: white']": {
        background: "#161b22 !important",
      },
      // Active subscription rows (#fff) — override specifically
      "tr[style*='background: rgb(255, 255, 255)'] td": {
        background: "#161b22 !important",
      },
      // f3f4f6 row borders in subscription table
      "[style*='border-bottom: 0.5px solid rgb(243, 244, 246)']": {
        borderBottom: "0.5px solid #21262d !important",
      },
      "[style*='border-bottom: 1.5px solid rgb(229, 231, 235)']": {
        borderBottom: "1.5px solid #30363d !important",
      },

      // ── ALL Typography — cascade from body color ───────────────────────────
      // This is the main fix: MuiTypography renders as <p>/<span>/<h*>
      // and inherits color from body (#e6edf3) unless overridden inline.
      // The inline-style overrides below handle sx={{ color: "#..." }} cases.
      "p, span, div, label, td, th, li": {
        color: "inherit",
      },

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
      // Inline-style overrides — catch sx={{ color: "#..." }} hardcoded values
      // Browser computes hex → rgb(), so we match on rgb() strings.
      // ══════════════════════════════════════════════════════════════════════

      // #111827 — primary text (page titles, headings, strong labels)
      "[style*='color: rgb(17, 24, 39)']": { color: "#e6edf3 !important" },
      "[style*='color: rgb(17,24,39)']": { color: "#e6edf3 !important" },
      "p[style*='color: rgb(17, 24, 39)']": { color: "#e6edf3 !important" },
      "span[style*='color: rgb(17, 24, 39)']": { color: "#e6edf3 !important" },
      "div[style*='color: rgb(17, 24, 39)']": { color: "#e6edf3 !important" },

      // #374151 — secondary text
      "[style*='color: rgb(55, 65, 81)']": { color: "#c9d1d9 !important" },
      "[style*='color: rgb(55,65,81)']": { color: "#c9d1d9 !important" },
      "p[style*='color: rgb(55, 65, 81)']": { color: "#c9d1d9 !important" },
      "span[style*='color: rgb(55, 65, 81)']": { color: "#c9d1d9 !important" },

      // #4b5563
      "[style*='color: rgb(75, 85, 99)']": { color: "#c9d1d9 !important" },
      "[style*='color: rgb(75,85,99)']": { color: "#c9d1d9 !important" },

      // #6b7280 — muted text
      "[style*='color: rgb(107, 114, 128)']": { color: "#8b949e !important" },
      "[style*='color: rgb(107,114,128)']": { color: "#8b949e !important" },
      "p[style*='color: rgb(107, 114, 128)']": { color: "#8b949e !important" },

      // #9ca3af — placeholder/hint/subtitle text
      "[style*='color: rgb(156, 163, 175)']": { color: "#6e7681 !important" },
      "[style*='color: rgb(156,163,175)']": { color: "#6e7681 !important" },
      "p[style*='color: rgb(156, 163, 175)']": { color: "#6e7681 !important" },
      "span[style*='color: rgb(156, 163, 175)']": {
        color: "#6e7681 !important",
      },

      // ── Headings ──────────────────────────────────────────────────────────
      "h1, h2, h3, h4, h5, h6": { color: "#e6edf3 !important" },

      // ── Backgrounds ───────────────────────────────────────────────────────
      "[style*='background: rgb(255, 255, 255)']": {
        background: "#161b22 !important",
      },
      "[style*='background-color: rgb(255, 255, 255)']": {
        background: "#161b22 !important",
      },
      "[style*='background: white']": { background: "#161b22 !important" },
      "[style*='background: rgb(248, 249, 251)']": {
        background: "#0d1117 !important",
      },
      "[style*='background-color: rgb(248, 249, 251)']": {
        background: "#0d1117 !important",
      },
      "[style*='background: rgb(249, 250, 251)']": {
        background: "#161b22 !important",
      },
      "[style*='background-color: rgb(249, 250, 251)']": {
        background: "#161b22 !important",
      },
      "[style*='background: rgb(250, 250, 250)']": {
        background: "#1c2128 !important",
      },
      "[style*='background-color: rgb(250, 250, 250)']": {
        background: "#1c2128 !important",
      },

      // ── Borders ───────────────────────────────────────────────────────────
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

      // ── Chip status colors — keep them visible in dark mode ───────────────
      // Active/Yes (green)
      "[style*='background: rgb(220, 252, 231)']": {
        background: "#14532d !important",
      },
      "[style*='background-color: rgb(220, 252, 231)']": {
        background: "#14532d !important",
      },
      // Inactive/No (red)
      "[style*='background: rgb(254, 226, 226)']": {
        background: "#7f1d1d !important",
      },
      "[style*='background-color: rgb(254, 226, 226)']": {
        background: "#7f1d1d !important",
      },
      // Pending (yellow)
      "[style*='background: rgb(254, 243, 199)']": {
        background: "#78350f !important",
      },
      "[style*='background-color: rgb(254, 243, 199)']": {
        background: "#78350f !important",
      },
      // Done (green light)
      "[style*='background: rgb(220, 252, 231)']": {
        background: "#14532d !important",
      },

      // Green chip text
      "[style*='color: rgb(22, 101, 52)']": { color: "#86efac !important" },
      "[style*='color: rgb(22,101,52)']": { color: "#86efac !important" },
      // Red chip text
      "[style*='color: rgb(153, 27, 27)']": { color: "#fca5a5 !important" },
      "[style*='color: rgb(153,27,27)']": { color: "#fca5a5 !important" },
      // Yellow chip text
      "[style*='color: rgb(217, 119, 6)']": { color: "#fcd34d !important" },
      "[style*='color: rgb(217,119,6)']": { color: "#fcd34d !important" },
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
          MuiPaper: {
            styleOverrides: { root: { backgroundImage: "none" } },
          },
          MuiDrawer: {
            styleOverrides: { paper: { backgroundImage: "none" } },
          },
          MuiAppBar: {
            styleOverrides: { root: { backgroundImage: "none" } },
          },
          MuiDialog: {
            styleOverrides: { paper: { backgroundImage: "none" } },
          },
          MuiTypography: {
            styleOverrides: { root: {} },
          },
          // ── TextField / Input dark mode fix ──────────────────────────────────
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                ...(mode === "dark" && {
                  backgroundColor: "#1c2128",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#30363d",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#58a6ff",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#58a6ff",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#161b22",
                  },
                  "& .MuiInputBase-input": {
                    color: "#e6edf3",
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#8b949e",
                    WebkitTextFillColor: "#8b949e",
                  },
                }),
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                ...(mode === "dark" && {
                  color: "#8b949e",
                  "&.Mui-focused": { color: "#58a6ff" },
                  "&.Mui-disabled": { color: "#6e7681" },
                }),
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                ...(mode === "dark" && {
                  backgroundColor: "#1c2128",
                }),
              },
            },
          },
          MuiAutocomplete: {
            styleOverrides: {
              inputRoot: {
                ...(mode === "dark" && {
                  backgroundColor: "#1c2128",
                }),
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

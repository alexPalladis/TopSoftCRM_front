import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  Box,
  Typography,
  InputBase,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import HubIcon from "@mui/icons-material/Hub";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { customersApi } from "../../services/customers";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";
import { subdealersApi } from "../../services/subdealers";

const SEARCH_SCOPES = {
  ADMIN: ["customers", "dealers", "networks", "subdealers"],
  NETWORK: ["customers", "dealers", "subdealers"],
  DEALER: ["customers", "subdealers"],
  SUBDEALER: ["customers"],
};

const SCOPE_META = {
  customers: {
    label: "Πελάτες",
    icon: <PeopleIcon sx={{ fontSize: 15 }} />,
    color: "#3b82f6",
  },
  dealers: {
    label: "Dealers",
    icon: <StoreIcon sx={{ fontSize: 15 }} />,
    color: "#22c55e",
  },
  networks: {
    label: "Networks",
    icon: <HubIcon sx={{ fontSize: 15 }} />,
    color: "#8b5cf6",
  },
  subdealers: {
    label: "Sub-dealers",
    icon: <PersonIcon sx={{ fontSize: 15 }} />,
    color: "#f59e0b",
  },
};

const LIST_PATHS = {
  customers: "/customers",
  dealers: "/dealers",
  networks: "/networks",
  subdealers: "/subdealers",
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * GlobalSearch
 *
 * Props:
 *   open    — boolean, controlled by AdminLayout
 *   onClose — () => void, called to close
 *
 * The Cmd+K / Ctrl+K keyboard shortcut is handled HERE and calls onClose/open
 * via the onOpenRequest callback.
 *
 * Props:
 *   open          — boolean
 *   onClose       — () => void
 *   onOpenRequest — () => void  (called when Ctrl+K is pressed)
 */
export default function GlobalSearch({ open, onClose, onOpenRequest }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 280);
  const scopes = SEARCH_SCOPES[user?.role] ?? ["customers"];

  // ── Global Ctrl+K listener ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onOpenRequest?.();
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, onOpenRequest]);

  // ── Focus input when dialog opens ────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // ── Search ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;

    const search = async () => {
      setLoading(true);
      try {
        const params = { search: debouncedQuery, size: 4, page: 0 };
        const promises = scopes.map(async (scope) => {
          try {
            let res;
            if (scope === "customers") res = await customersApi.getAll(params);
            if (scope === "dealers") res = await dealersApi.getAll(params);
            if (scope === "networks") res = await networksApi.getAll(params);
            if (scope === "subdealers")
              res = await subdealersApi.getAll(params);
            return (res?.data?.content ?? []).map((c) => ({
              id: c.id,
              scope,
              primary: c.eponymia,
              secondary: `ΑΦΜ: ${c.afm}${c.city ? ` · ${c.city}` : ""}`,
              active: c.active,
            }));
          } catch {
            return [];
          }
        });
        const all = (await Promise.all(promises)).flat();
        if (!cancelled) {
          setResults(all);
          setActiveIdx(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results[activeIdx]) goTo(results[activeIdx]);
  };

  const goTo = useCallback(
    (item) => {
      navigate(LIST_PATHS[item.scope]);
      onClose();
    },
    [navigate, onClose],
  );

  // Group results by scope
  const grouped = scopes.reduce((acc, scope) => {
    const items = results.filter((r) => r.scope === scope);
    if (items.length) acc[scope] = items;
    return acc;
  }, {});

  const isEmpty =
    debouncedQuery.length >= 2 && !loading && results.length === 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "0.5px solid #e5e7eb",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          overflow: "hidden",
          mt: "10vh",
          mx: "auto",
          alignSelf: "flex-start",
        },
      }}
      BackdropProps={{ sx: { background: "rgba(0,0,0,0.35)" } }}
    >
      {/* Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          borderBottom: "0.5px solid #e5e7eb",
        }}
      >
        <SearchIcon
          sx={{ fontSize: 20, color: "#9ca3af", mr: 1.5, flexShrink: 0 }}
        />
        <InputBase
          inputRef={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Αναζήτηση πελατών, dealers, networks..."
          fullWidth
          sx={{
            fontSize: 15,
            color: "#111827",
            "& input::placeholder": { color: "#9ca3af" },
          }}
        />
        {loading && (
          <CircularProgress
            size={16}
            sx={{ color: "#9ca3af", ml: 1, flexShrink: 0 }}
          />
        )}
        <Box
          sx={{
            border: "0.5px solid #e5e7eb",
            borderRadius: 0.8,
            px: 0.8,
            fontSize: 10,
            color: "#9ca3af",
            fontFamily: "monospace",
            lineHeight: 1.8,
            ml: 1.5,
            flexShrink: 0,
          }}
        >
          ESC
        </Box>
      </Box>

      {/* Results */}
      <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
        {query.length < 2 && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <KeyboardIcon
              sx={{
                fontSize: 32,
                color: "#e5e7eb",
                mb: 1,
                display: "block",
                mx: "auto",
              }}
            />
            <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
              Πληκτρολογήστε τουλάχιστον 2 χαρακτήρες
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#d1d5db", mt: 0.5 }}>
              ΑΦΜ, επωνυμία, πόλη...
            </Typography>
          </Box>
        )}

        {isEmpty && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
              Δεν βρέθηκαν αποτελέσματα για «{query}»
            </Typography>
          </Box>
        )}

        {Object.entries(grouped).map(([scope, items], groupIdx) => {
          const meta = SCOPE_META[scope];
          return (
            <Box key={scope}>
              {groupIdx > 0 && <Divider />}
              <Box
                sx={{
                  px: 2,
                  pt: 1.5,
                  pb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                <Box sx={{ color: meta.color, display: "flex" }}>
                  {meta.icon}
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {meta.label}
                </Typography>
              </Box>
              {items.map((item) => {
                const flatIdx = results.indexOf(item);
                const isActive = flatIdx === activeIdx;
                return (
                  <Box
                    key={item.id}
                    onClick={() => goTo(item)}
                    onMouseEnter={() => setActiveIdx(flatIdx)}
                    sx={{
                      px: 2,
                      py: 1.2,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isActive ? "#eff6ff" : "transparent",
                      transition: "background 0.1s",
                      "&:hover": { background: "#f8faff" },
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 500, color: "#111827" }}
                      >
                        {item.primary}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11, color: "#9ca3af", mt: 0.2 }}
                      >
                        {item.secondary}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {item.active === false && (
                        <Chip
                          label="Ανενεργός"
                          size="small"
                          sx={{
                            fontSize: 10,
                            height: 18,
                            background: "#fee2e2",
                            color: "#991b1b",
                          }}
                        />
                      )}
                      {isActive && (
                        <ArrowForwardIcon
                          sx={{ fontSize: 14, color: "#9ca3af" }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>

      {/* Footer hints */}
      {results.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: "0.5px solid #e5e7eb",
            display: "flex",
            gap: 2,
          }}
        >
          {[
            ["↑↓", "πλοήγηση"],
            ["↵", "άνοιγμα"],
            ["Esc", "κλείσιμο"],
          ].map(([key, label]) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Box
                sx={{
                  border: "0.5px solid #e5e7eb",
                  borderRadius: 0.8,
                  px: 0.8,
                  fontSize: 10,
                  color: "#6b7280",
                  fontFamily: "monospace",
                  lineHeight: 1.8,
                }}
              >
                {key}
              </Box>
              <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Dialog>
  );
}

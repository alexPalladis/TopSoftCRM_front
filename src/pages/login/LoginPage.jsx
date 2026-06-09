import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { getRoleFromId } from "../../utils/roleUtils";

const darkField = {
  "& .MuiOutlinedInput-root": {
    color: "#e6edf3",
    backgroundColor: "#161b22", // ← add this
    "& fieldset": { borderColor: "#30363d" },
    "&:hover fieldset": { borderColor: "#6e7681" },
    "&.Mui-focused fieldset": { borderColor: "#1f6feb" },
    "&.Mui-error fieldset": { borderColor: "#f85149" },
    // ── Kill browser autofill blue/yellow flash ──
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 100px #161b22 inset",
      WebkitTextFillColor: "#e6edf3",
      caretColor: "#e6edf3",
      borderRadius: "inherit",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: "0 0 0 100px #161b22 inset",
      WebkitTextFillColor: "#e6edf3",
    },
    "& input:-webkit-autofill:hover": {
      WebkitBoxShadow: "0 0 0 100px #161b22 inset",
      WebkitTextFillColor: "#e6edf3",
    },
  },
  "& .MuiInputLabel-root": { color: "#7d8590" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1f6feb" },
  "& .MuiInputLabel-root.Mui-error": { color: "#f85149" },
  "& .MuiFormHelperText-root": { color: "#f85149", marginLeft: 0 },
};
function validate(form) {
  const errors = {};
  if (!form.username.trim()) errors.username = "Το username είναι υποχρεωτικό";
  if (!form.password) errors.password = "Το password είναι υποχρεωτικό";
  if (!form.id) {
    errors.id = "Το ID είναι υποχρεωτικό";
  } else if (form.id.length !== 8) {
    errors.id = "Το ID πρέπει να είναι ακριβώς 8 ψηφία";
  } else if (!getRoleFromId(form.id)) {
    errors.id = "Μη έγκυρο ID — ο πρώτος αριθμός πρέπει να είναι 0, 1, 2 ή 3";
  }
  return errors;
}

// Flat-top hexagon points helper
function hex(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

// Build the full hex grid data
function buildHexGrid() {
  const R = 36; // hex radius (center to vertex)
  const cols = 18;
  const rows = 14;
  const hexes = [];

  // Accent positions (col, row) — these will be highlighted
  const accents = new Set([
    "2,2",
    "5,1",
    "8,3",
    "11,2",
    "14,1",
    "3,5",
    "6,4",
    "9,2",
    "12,4",
    "15,3",
    "1,7",
    "4,7",
    "7,6",
    "10,5",
    "13,6",
    "2,9",
    "5,8",
    "8,8",
    "11,7",
    "14,8",
    "3,11",
    "6,10",
    "9,10",
    "12,9",
    "1,12",
    "7,12",
    "10,11",
    "13,11",
  ]);

  const w = R * Math.sqrt(3);
  const h = R * 2;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const cx = col * w + (row % 2 === 1 ? w / 2 : 0) + 40;
      const cy = row * h * 0.75 + 50;
      const key = `${col},${row}`;
      const isAccent = accents.has(key);
      hexes.push({ cx, cy, isAccent, key });
    }
  }
  return { hexes, R };
}

// Connections between accent hex centers
const ACCENT_CONNECTIONS = [
  ["2,2", "5,1"],
  ["5,1", "8,3"],
  ["8,3", "11,2"],
  ["11,2", "14,1"],
  ["2,2", "3,5"],
  ["5,1", "6,4"],
  ["8,3", "9,2"],
  ["9,2", "12,4"],
  ["11,2", "12,4"],
  ["3,5", "6,4"],
  ["6,4", "9,2"],
  ["6,4", "7,6"],
  ["9,2", "10,5"],
  ["12,4", "13,6"],
  ["3,5", "4,7"],
  ["6,4", "7,6"],
  ["7,6", "10,5"],
  ["10,5", "13,6"],
  ["4,7", "5,8"],
  ["7,6", "8,8"],
  ["10,5", "11,7"],
  ["13,6", "14,8"],
  ["5,8", "6,10"],
  ["8,8", "9,10"],
  ["11,7", "10,11"],
  ["14,8", "13,11"],
  ["6,10", "7,12"],
  ["9,10", "10,11"],
  ["10,11", "13,11"],
  ["1,7", "2,9"],
  ["2,9", "3,11"],
  ["3,11", "1,12"],
];

function HexBackground() {
  const { hexes, R } = buildHexGrid();

  // Map key → center coords for drawing connections
  const centerMap = {};
  hexes.forEach(({ cx, cy, key }) => {
    centerMap[key] = { cx, cy };
  });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1100 900"
    >
      <defs>
        {/* Right fade — strong, to make room for the login card */}
        <linearGradient id="hFadeR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="30%" stopColor="#0a0f1a" stopOpacity="0" />
          <stop offset="68%" stopColor="#0a0f1a" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0a0f1a" stopOpacity="1" />
        </linearGradient>
        {/* Top + bottom vignette */}
        <linearGradient id="hFadeV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0f1a" stopOpacity="1" />
          <stop offset="8%" stopColor="#0a0f1a" stopOpacity="0" />
          <stop offset="92%" stopColor="#0a0f1a" stopOpacity="0" />
          <stop offset="100%" stopColor="#0a0f1a" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Background fill */}
      <rect width="1100" height="900" fill="#0a0f1a" />

      {/* Connection lines between accent hexes */}
      <g stroke="#6366f1" strokeWidth="0.7" opacity="0.22" fill="none">
        {ACCENT_CONNECTIONS.map(([a, b], i) => {
          const A = centerMap[a];
          const B = centerMap[b];
          if (!A || !B) return null;
          return <line key={i} x1={A.cx} y1={A.cy} x2={B.cx} y2={B.cy} />;
        })}
      </g>

      {/* All hexagons */}
      {hexes.map(({ cx, cy, isAccent, key }) => (
        <polygon
          key={key}
          points={hex(cx, cy, R - 1.5)}
          fill={isAccent ? "#0f1535" : "#0c1020"}
          stroke={isAccent ? "#4f46e5" : "#161c30"}
          strokeWidth={isAccent ? "0.7" : "0.4"}
          opacity={isAccent ? 1 : 0.7}
        />
      ))}

      {/* Accent dot at center of each accent hex */}
      {hexes
        .filter((h) => h.isAccent)
        .map(({ cx, cy, key }) => (
          <g key={`dot-${key}`}>
            <circle cx={cx} cy={cy} r="3.5" fill="#6366f1" opacity="0.85" />
            <circle
              cx={cx}
              cy={cy}
              r="7"
              fill="none"
              stroke="#6366f1"
              strokeWidth="0.6"
              opacity="0.3"
            />
          </g>
        ))}

      {/* Fade overlays */}
      <rect width="1100" height="900" fill="url(#hFadeR)" />
      <rect width="1100" height="900" fill="url(#hFadeV)" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "", id: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "id") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 8);
      setForm((prev) => ({ ...prev, id: digitsOnly }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    setFieldErrors({});
    setServerError("");
    try {
      await login(form.username, form.password, form.id);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "";
      if (msg.includes("ανενεργός")) {
        setServerError(
          "Ο λογαριασμός σας είναι ανενεργός. Επικοινωνήστε με τον διαχειριστή.",
        );
      } else {
        setServerError("Λανθασμένα στοιχεία εισόδου");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0a0f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <HexBackground />

      <Card
        sx={{
          width: 400,
          position: "relative",
          zIndex: 1,
          background: "rgba(15,21,35,0.88)",
          backdropFilter: "blur(16px)",
          border: "0.5px solid rgba(99,102,241,0.25)",
          borderRadius: 3,
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(99,102,241,0.1)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 4 }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                background: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 18,
                color: "#fff",
                fontFamily: "monospace",
              }}
            >
              T
            </Box>
            <Box>
              <Typography
                sx={{
                  color: "#e6edf3",
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: 1.2,
                }}
              >
                TopSoft CRM
              </Typography>
              <Typography sx={{ color: "#7d8590", fontSize: 12 }}>
                Διαχειριστικό portal
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="h5"
            sx={{ color: "#e6edf3", fontWeight: 600, mb: 0.5 }}
          >
            Είσοδος
          </Typography>
          <Typography sx={{ color: "#7d8590", fontSize: 13, mb: 3 }}>
            Συνδεθείτε με τα στοιχεία σας
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              size="small"
              error={!!fieldErrors.username}
              helperText={fieldErrors.username || " "}
              sx={{ mb: 1, ...darkField }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              size="small"
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || " "}
              sx={{ mb: 1, ...darkField }}
            />
            <TextField
              fullWidth
              label="ID (8 ψηφία)"
              name="id"
              value={form.id}
              onChange={handleChange}
              size="small"
              error={!!fieldErrors.id}
              helperText={fieldErrors.id || " "}
              inputProps={{
                inputMode: "numeric",
                maxLength: 8,
                style: { fontFamily: "monospace", letterSpacing: "0.15em" },
              }}
              sx={{ mb: 3, ...darkField }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: "#4f46e5",
                py: 1.2,
                fontWeight: 600,
                "&:hover": { background: "#6366f1" },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "ΕΙΣΟΔΟΣ"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

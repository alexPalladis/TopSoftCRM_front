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
  Chip,
  Stack,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { getRoleFromId } from "../../utils/roleUtils";

const darkField = {
  "& .MuiOutlinedInput-root": {
    color: "#e6edf3",
    "& fieldset": { borderColor: "#30363d" },
    "&:hover fieldset": { borderColor: "#6e7681" },
    "&.Mui-focused fieldset": { borderColor: "#1f6feb" },
    "&.Mui-error fieldset": { borderColor: "#f85149" },
  },
  "& .MuiInputLabel-root": { color: "#7d8590" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1f6feb" },
  "& .MuiInputLabel-root.Mui-error": { color: "#f85149" },
  "& .MuiFormHelperText-root": {
    color: "#f85149",
    fontSize: 11,
    marginLeft: 0,
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "", id: "" });
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
    id: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const detectedRole = getRoleFromId(form.id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation ανά πεδίο
    const fe = { username: "", password: "", id: "" };
    if (!form.username) fe.username = "Συμπλήρωσε το username";
    if (!form.password) fe.password = "Συμπλήρωσε το password";
    if (!form.id) fe.id = "Συμπλήρωσε τον κωδικό ID";
    else if (form.id.length !== 8)
      fe.id = "Το ID πρέπει να είναι ακριβώς 8 ψηφία";
    else if (!detectedRole)
      fe.id = "Μη έγκυρο ID — ο πρώτος αριθμός πρέπει να είναι 0, 1, 2 ή 3";

    if (fe.username || fe.password || fe.id) {
      setFieldErrors(fe);
      return;
    }

    setLoading(true);
    try {
      await login(form.username, form.password, form.id);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Λάθος στοιχεία εισόδου");
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    ADMIN: "error",
    NETWORK: "primary",
    DEALER: "success",
    SUBDEALER: "warning",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
        backgroundSize: "32px 32px",
      }}
    >
      <Card
        sx={{
          width: 400,
          background: "#161b22",
          border: "0.5px solid #30363d",
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
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
                background: "#1f6feb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 18,
                color: "#fff",
                fontFamily: "monospace",
                flexShrink: 0,
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

          {/* Γενικό error (λάθος credentials) */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                fontSize: 13,
                background: "#2d1a1a",
                color: "#f85149",
                border: "0.5px solid #f8514933",
                "& .MuiAlert-icon": { color: "#f85149" },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              size="small"
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              sx={{ mb: 2, ...darkField }}
              autoComplete="username"
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              size="small"
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              sx={{ mb: 2, ...darkField }}
              autoComplete="current-password"
            />

            {/* ID */}
            <TextField
              fullWidth
              label="ID (8ψήφιος)"
              name="id"
              value={form.id}
              onChange={handleChange}
              size="small"
              error={!!fieldErrors.id}
              helperText={fieldErrors.id}
              sx={{ mb: 1, ...darkField }}
              inputProps={{
                maxLength: 8,
                style: { fontFamily: "monospace", letterSpacing: "0.1em" },
              }}
              autoComplete="off"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: "#1f6feb",
                py: 1.2,
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 1.5,
                "&:hover": { background: "#388bfd" },
                "&.Mui-disabled": {
                  background: "#1f6feb55",
                  color: "#ffffff88",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Είσοδος →"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

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
  },
  "& .MuiInputLabel-root": { color: "#7d8590" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1f6feb" },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "", id: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const detectedRole = getRoleFromId(form.id);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.id) {
      setError("Συμπλήρωσε όλα τα πεδία");
      return;
    }
    if (!detectedRole) {
      setError("Μη έγκυρο ID — ο πρώτος αριθμός πρέπει να είναι 0, 1, 2 ή 3");
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

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              size="small"
              sx={{ mb: 2, ...darkField }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              size="small"
              sx={{ mb: 2, ...darkField }}
            />
            <TextField
              fullWidth
              label="ID (8ψήφιος)"
              name="id"
              value={form.id}
              onChange={handleChange}
              size="small"
              sx={{ mb: 1, ...darkField }}
              inputProps={{ maxLength: 8, style: { fontFamily: "monospace" } }}
            />

            <Box sx={{ mb: 3, minHeight: 28 }}>
              {detectedRole ? (
                <Chip
                  label={`Ρόλος: ${detectedRole}`}
                  color={roleColors[detectedRole]}
                  size="small"
                  sx={{ fontSize: 11 }}
                />
              ) : form.id.length > 0 ? (
                <Typography sx={{ fontSize: 12, color: "#f85149" }}>
                  Μη αναγνωρίσιμο ID
                </Typography>
              ) : (
                <Typography sx={{ fontSize: 12, color: "#7d8590" }}>
                  0=Admin · 1=Network · 2=Dealer · 3=SubDealer
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: "#1f6feb",
                py: 1.2,
                fontWeight: 600,
                "&:hover": { background: "#388bfd" },
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

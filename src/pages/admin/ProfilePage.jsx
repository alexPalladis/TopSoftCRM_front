import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Avatar,
  Divider,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from "../../context/AuthContext";
import { FormSection, FormField } from "../../components/shared/EntityForm";
import api from "../../services/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [passForm, setPassForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passErrors, setPassErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassForm((p) => ({ ...p, [name]: value }));
    if (passErrors[name]) setPassErrors((p) => ({ ...p, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSave = async () => {
    // ── Client-side validation ──────────────────────────────────────
    const errors = {};
    if (!passForm.current) errors.current = "Υποχρεωτικό";
    if (!passForm.newPass) errors.newPass = "Υποχρεωτικό";
    if (passForm.newPass.length < 6)
      errors.newPass = "Τουλάχιστον 6 χαρακτήρες";
    if (passForm.newPass !== passForm.confirm)
      errors.confirm = "Τα passwords δεν ταιριάζουν";
    if (Object.keys(errors).length > 0) {
      setPassErrors(errors);
      return;
    }

    // ── API call ────────────────────────────────────────────────────
    setLoading(true);
    setApiError("");
    try {
      await api.patch("/profile/password", {
        currentPassword: passForm.current,
        newPassword: passForm.newPass,
      });
      setSaved(true);
      setPassForm({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      // Show the server message (e.g. "Λάθος τρέχον password") if available
      setApiError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Σφάλμα αλλαγής password",
      );
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "AD";

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography
        sx={{ fontSize: 20, fontWeight: 700, color: "#111827", mb: 3 }}
      >
        Προφίλ
      </Typography>

      {/* ── User info card ─────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb", mb: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: "#dbeafe",
              color: "#1d4ed8",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography
              sx={{ fontSize: 17, fontWeight: 600, color: "#111827" }}
            >
              {user?.username}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
              <Typography
                sx={{ fontSize: 12, color: "#6b7280", letterSpacing: "0.05em" }}
              >
                {user?.role}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          {[
            { label: "ID", value: user?.id },
            { label: "Username", value: user?.username },
            { label: "Ρόλος", value: user?.role },
          ].map((row) => (
            <Box key={row.label} sx={{ display: "flex" }}>
              <Typography sx={{ fontSize: 12, color: "#9ca3af", width: 100 }}>
                {row.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#111827",
                  fontFamily: row.label === "ID" ? "monospace" : "inherit",
                }}
              >
                {row.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* ── Change password card ───────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <LockIcon sx={{ fontSize: 18, color: "#6b7280" }} />
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            Αλλαγή password
          </Typography>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {saved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Το password άλλαξε επιτυχώς!
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <FormSection>
          <FormField
            label="Τρέχον password"
            name="current"
            type="password"
            value={passForm.current}
            onChange={handleChange}
            error={passErrors.current}
            required
          />
          <FormField
            label="Νέο password"
            name="newPass"
            type="password"
            value={passForm.newPass}
            onChange={handleChange}
            error={passErrors.newPass}
            required
          />
          <FormField
            label="Επιβεβαίωση νέου password"
            name="confirm"
            type="password"
            value={passForm.confirm}
            onChange={handleChange}
            error={passErrors.confirm}
            required
          />
        </FormSection>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={16} sx={{ color: "white" }} />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={loading}
            sx={{
              background: "#1f6feb",
              borderRadius: 2,
              fontWeight: 600,
              "&:hover": { background: "#1a5fd6" },
            }}
          >
            {loading ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

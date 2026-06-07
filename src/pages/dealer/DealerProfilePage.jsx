/**
 * ProfilePage for DEALER and SUBDEALER roles.
 *
 * Displays:
 *  - User info (id, username, role)
 *  - Referral code box (prominent, copy-to-clipboard)
 *  - Change password form
 *
 * The referral code is fetched from GET /api/referral-codes/my.
 * This is the code the Dealer/SubDealer hands to their customers
 * when they register in the invoicing app (τιμολογιέρα).
 *
 * Usage: used as ProfilePage for DEALER and SUBDEALER roles.
 * The ADMIN role uses src/pages/admin/ProfilePage.jsx which has no referral code.
 *
 * To wire it up, update src/App.jsx to use RolePage:
 *   <Route path="profile" element={
 *     <RolePage pages={{
 *       ADMIN:     AdminProfilePage,
 *       NETWORK:   AdminProfilePage,   // Network has no referral code
 *       DEALER:    DealerProfilePage,
 *       SUBDEALER: DealerProfilePage,
 *     }} />
 *   } />
 */
import { useState, useEffect } from "react";
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
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { useAuth } from "../../context/AuthContext";
import { FormSection, FormField } from "../../components/shared/EntityForm";
import api from "../../services/api";
import { referralCodeApi } from "../../services/commissions";

const roleColors = {
  DEALER: "#22c55e",
  SUBDEALER: "#f59e0b",
};

export default function DealerProfilePage() {
  const { user } = useAuth();

  // ── Referral code ─────────────────────────────────────────────────────────
  const [referralCode, setReferralCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    referralCodeApi
      .getMy()
      .then((res) => setReferralCode(res.data.code || ""))
      .catch(() => setReferralCode(""))
      .finally(() => setLoadingCode(false));
  }, []);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Change password ───────────────────────────────────────────────────────
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
      setApiError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Σφάλμα αλλαγής password",
      );
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "??";
  const dotColor = roleColors[user?.role] || "#6b7280";

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
                  background: dotColor,
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
            { label: "ID", value: user?.id, mono: true },
            { label: "Username", value: user?.username, mono: false },
            { label: "Ρόλος", value: user?.role, mono: false },
          ].map((row) => (
            <Box key={row.label} sx={{ display: "flex" }}>
              <Typography sx={{ fontSize: 12, color: "#9ca3af", width: 100 }}>
                {row.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#111827",
                  fontFamily: row.mono ? "monospace" : "inherit",
                }}
              >
                {row.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* ── Referral code card ─────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb", mb: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <QrCodeIcon sx={{ fontSize: 18, color: "#6b7280" }} />
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            Κωδικός Παραπομπής
          </Typography>
        </Box>
        <Divider sx={{ mb: 2.5 }} />

        <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1.5 }}>
          Δώστε αυτόν τον κωδικό στους πελάτες σας για να καταχωρηθούν κάτω από
          τον λογαριασμό σας.
        </Typography>

        {loadingCode ? (
          <CircularProgress size={20} />
        ) : referralCode ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                px: 3,
                py: 1.5,
                background: "#f0fdf4",
                border: "1.5px solid #86efac",
                borderRadius: 2,
                fontFamily: "monospace",
                fontSize: 22,
                fontWeight: 700,
                color: "#166534",
                letterSpacing: "0.15em",
                userSelect: "all",
              }}
            >
              {referralCode}
            </Box>
            <Tooltip title={copied ? "Αντιγράφηκε!" : "Αντιγραφή"}>
              <IconButton
                onClick={handleCopy}
                size="small"
                sx={{
                  background: copied ? "#dcfce7" : "#f3f4f6",
                  color: copied ? "#16a34a" : "#374151",
                  "&:hover": { background: "#e5e7eb" },
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {copied && (
              <Chip
                label="Αντιγράφηκε!"
                size="small"
                sx={{ background: "#dcfce7", color: "#166534", fontSize: 11 }}
              />
            )}
          </Box>
        ) : (
          <Alert severity="warning" sx={{ fontSize: 12 }}>
            Δεν έχει εκχωρηθεί κωδικός παραπομπής ακόμα. Επικοινωνήστε με τον
            διαχειριστή.
          </Alert>
        )}
      </Paper>

      {/* ── Change password card ───────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <LockIcon sx={{ fontSize: 18, color: "#6b7280" }} />
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            Αλλαγή Password
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

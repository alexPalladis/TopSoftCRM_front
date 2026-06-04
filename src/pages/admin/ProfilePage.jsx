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
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from "../../context/AuthContext";
import { FormSection, FormField } from "../../components/shared/EntityForm";

export default function ProfilePage() {
  const { user } = useAuth();
  const [passForm, setPassForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passErrors, setPassErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassForm((p) => ({ ...p, [name]: value }));
    if (passErrors[name]) setPassErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSave = () => {
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
    console.log("Change password:", passForm);
    setSaved(true);
    setPassForm({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "AD";

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography
        sx={{ fontSize: 20, fontWeight: 700, color: "#111827", mb: 3 }}
      >
        Προφίλ
      </Typography>

      {/* User info card */}
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
                sx={{
                  fontSize: 12,
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                }}
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

      {/* Change password */}
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

        <FormSection title="">
          <FormField
            name="current"
            label="Τρέχον password"
            value={passForm.current}
            onChange={handleChange}
            error={passErrors.current}
            required
            type="password"
            size={12}
          />
          <FormField
            name="newPass"
            label="Νέο password"
            value={passForm.newPass}
            onChange={handleChange}
            error={passErrors.newPass}
            required
            type="password"
            size={6}
          />
          <FormField
            name="confirm"
            label="Επιβεβαίωση"
            value={passForm.confirm}
            onChange={handleChange}
            error={passErrors.confirm}
            required
            type="password"
            size={6}
          />
        </FormSection>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ background: "#1f6feb", "&:hover": { background: "#1a5fd6" } }}
          >
            Αποθήκευση
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

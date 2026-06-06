import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { subdealersApi } from "../../services/subdealers";
import { useAuth } from "../../context/AuthContext";

const PRODUCTS = [
  { id: 1, description: "Συνδρομή εφαρμογής", defaultPrice: 120 },
  { id: 2, description: "Ενεργός Πάροχος ΗΤ", defaultPrice: 100 },
  { id: 3, description: "Σύνδεση POS", defaultPrice: 50 },
  { id: 4, description: "Άδεια mobile App", defaultPrice: 100 },
  { id: 5, description: "Σύνδεση WooCommerce", defaultPrice: 200 },
  { id: 6, description: "Ενεργά SMS", defaultPrice: 30 },
  { id: 7, description: "Ενεργά email", defaultPrice: 20 },
  { id: 8, description: "Ψηφιακό Πελατολόγιο", defaultPrice: 50 },
];

// Required fields — no dealerId here because it's auto-set from the logged-in dealer
const required = [
  "afm",
  "eponymia",
  "epaggelma",
  "doy",
  "address",
  "city",
  "tk",
  "phoneFixed",
  "phoneMobile",
  "email",
];

function validate(form, isEdit) {
  const errors = {};
  required.forEach((f) => {
    if (!form[f]) errors[f] = "Υποχρεωτικό πεδίο";
  });
  if (form.afm && form.afm.length !== 9)
    errors.afm = "Το ΑΦΜ πρέπει να είναι 9 ψηφία";
  if (form.tk && form.tk.length !== 5)
    errors.tk = "Ο ΤΚ πρέπει να είναι 5 ψηφία";
  if (form.email && !/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Μη έγκυρο email";
  if (!isEdit) {
    if (!form.username) errors.username = "Υποχρεωτικό πεδίο";
    if (!form.password) errors.password = "Υποχρεωτικό πεδίο";
    if (form.password && form.password.length < 6)
      errors.password = "Τουλάχιστον 6 χαρακτήρες";
    if (form.password !== form.passwordConfirm)
      errors.passwordConfirm = "Τα passwords δεν ταιριάζουν";
  }
  return errors;
}

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

function Field({ label, req, error, children }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          color: error ? "#ef4444" : "#374151",
          mb: 0.5,
          fontWeight: 500,
        }}
      >
        {label}
        {req && <span style={{ color: "#ef4444" }}> *</span>}
      </Typography>
      {children}
      {error && (
        <Typography sx={{ fontSize: 11, color: "#ef4444", mt: 0.3 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default function DealerSubDealerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = !!id;

  const [form, setForm] = useState({
    afm: "",
    eponymia: "",
    nomimosEkprosopos: "",
    epaggelma: "",
    doy: "",
    address: "",
    city: "",
    tk: "",
    phoneFixed: "",
    phoneMobile: "",
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const [commissions, setCommissions] = useState(
    PRODUCTS.map((p) => ({
      productId: p.id,
      description: p.description,
      percentage: "",
      salePrice: p.defaultPrice,
    })),
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [taxisLoading, setTaxisLoading] = useState(false);

  // Load existing subdealer when editing
  useEffect(() => {
    if (!isEdit) return;
    setPageLoading(true);
    subdealersApi
      .getById(id)
      .then((res) => {
        const s = res.data;
        setForm({
          afm: s.afm || "",
          eponymia: s.eponymia || "",
          nomimosEkprosopos: s.nomimosEkprosopos || "",
          epaggelma: s.epaggelma || "",
          doy: s.doy || "",
          address: s.address || "",
          city: s.city || "",
          tk: s.tk || "",
          phoneFixed: s.phoneFixed || "",
          phoneMobile: s.phoneMobile || "",
          email: s.email || "",
          username: s.username || "",
          password: "",
          passwordConfirm: "",
        });
      })
      .catch(() => setGlobalError("Σφάλμα φόρτωσης sub-dealer"))
      .finally(() => setPageLoading(false));
  }, [id, isEdit]);

  const handleChange = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setGlobalError("");
  };

  // Mock TAXIS lookup — replace with real API when available
  const handleTaxis = async () => {
    if (!form.afm || form.afm.length !== 9) {
      setErrors((p) => ({ ...p, afm: "Εισάγετε 9ψήφιο ΑΦΜ πρώτα" }));
      return;
    }
    setTaxisLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setForm((p) => ({
        ...p,
        eponymia: "ΔΟΚΙΜΑΣΤΙΚΗ ΕΠΙΧΕΙΡΗΣΗ ΑΕ",
        doy: "ΙΒ ΑΘΗΝΩΝ",
        epaggelma: "ΕΜΠΟΡΙΟ",
        address: "ΕΡΜΟΥ 12",
        city: "ΑΘΗΝΑ",
        tk: "10563",
      }));
    } catch {
      setErrors((p) => ({ ...p, afm: "Σφάλμα αναζήτησης TAXIS" }));
    } finally {
      setTaxisLoading(false);
    }
  };

  const handleCommissionChange = (i, field, value) => {
    setCommissions((prev) =>
      prev.map((c, idx) => {
        if (idx !== i) return c;
        const updated = { ...c, [field]: value };
        if (field === "percentage" && value !== "") {
          updated.salePrice = (
            PRODUCTS[i].defaultPrice *
            (1 - parseFloat(value) / 100)
          ).toFixed(2);
        }
        return updated;
      }),
    );
  };

  const handleSubmit = async () => {
    const errs = validate(form, isEdit);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      // dealerId is always the logged-in dealer — never selectable by the dealer user
      const payload = { ...form, dealerId: user.id };
      if (isEdit) await subdealersApi.update(id, payload);
      else await subdealersApi.create(payload);
      setSubmitted(true);
      setTimeout(() => navigate("/subdealers"), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || "Σφάλμα κατά την αποθήκευση";
      if (
        msg.toLowerCase().includes("afm") ||
        msg.toLowerCase().includes("υπάρχει")
      )
        setErrors({ afm: "Υπάρχει ήδη sub-dealer με αυτό το ΑΦΜ" });
      else setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
    "& .MuiInputBase-input": { py: "8px", px: "12px" },
  };
  const thStyle = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 500,
    borderBottom: "0.5px solid #e5e7eb",
    background: "#fafafa",
    whiteSpace: "nowrap",
  };

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/subdealers")}
            sx={{ color: "#6b7280", minWidth: 0 }}
          >
            Πίσω
          </Button>
          <Box>
            <Typography
              sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}
            >
              {isEdit ? "Διόρθωση Sub-dealer" : "Νέος Sub-dealer"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
              {isEdit
                ? `ID: ${id}`
                : "Καταχώρηση νέου sub-dealer στο δίκτυό σας"}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("/subdealers")}
            sx={{ borderColor: "#e5e7eb", color: "#6b7280" }}
          >
            Άκυρο
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSubmit}
            sx={{ background: "#1f6feb", "&:hover": { background: "#1a5fd6" } }}
          >
            {loading ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </Stack>
      </Box>

      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Ο sub-dealer {isEdit ? "ενημερώθηκε" : "καταχωρήθηκε"} επιτυχώς!
        </Alert>
      )}
      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}
      {Object.keys(errors).length > 0 && !globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Παρακαλώ συμπλήρωσε όλα τα υποχρεωτικά πεδία σωστά.
        </Alert>
      )}

      <Stack spacing={2}>
        {/* ===== ΣΤΟΙΧΕΙΑ ΕΠΙΧΕΙΡΗΣΗΣ ===== */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
        >
          <SectionTitle>Στοιχεία επιχείρησης</SectionTitle>
          <Grid container spacing={2}>
            {isEdit && (
              <Grid item xs={12} md={3}>
                <Field label="ID">
                  <TextField
                    fullWidth
                    size="small"
                    value={id}
                    disabled
                    sx={{
                      ...inputSx,
                      "& .MuiInputBase-input": {
                        fontFamily: "monospace",
                        py: "8px",
                        px: "12px",
                      },
                    }}
                  />
                </Field>
              </Grid>
            )}

            {/* ΑΦΜ + TAXIS */}
            <Grid item xs={12} md={4}>
              <Field label="ΑΦΜ" req error={errors.afm}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={form.afm}
                    onChange={(e) =>
                      handleChange(
                        "afm",
                        e.target.value.replace(/\D/g, "").slice(0, 9),
                      )
                    }
                    placeholder="123456789"
                    error={!!errors.afm}
                    disabled={isEdit}
                    inputProps={{
                      maxLength: 9,
                      style: { fontFamily: "monospace" },
                    }}
                    sx={inputSx}
                  />
                  <Tooltip title="Αυτόματη αναζήτηση από TAXIS (GSIS)">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleTaxis}
                      disabled={taxisLoading || isEdit}
                      sx={{
                        minWidth: 44,
                        px: 1,
                        borderColor: "#e5e7eb",
                        color: "#374151",
                      }}
                    >
                      {taxisLoading ? <CircularProgress size={14} /> : "TAXIS"}
                    </Button>
                  </Tooltip>
                </Box>
              </Field>
            </Grid>

            <Grid item xs={12} md={8}>
              <Field label="Επωνυμία" req error={errors.eponymia}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.eponymia}
                  onChange={(e) => handleChange("eponymia", e.target.value)}
                  error={!!errors.eponymia}
                  sx={inputSx}
                />
              </Field>
            </Grid>

            <Grid item xs={12} md={5}>
              <Field label="Νόμιμος εκπρόσωπος">
                <TextField
                  fullWidth
                  size="small"
                  value={form.nomimosEkprosopos}
                  onChange={(e) =>
                    handleChange("nomimosEkprosopos", e.target.value)
                  }
                  sx={inputSx}
                />
              </Field>
            </Grid>

            {/*
              NO dealer selector here — the dealerId is always the logged-in dealer (user.id).
              This is the key difference from the Admin SubDealerFormPage.
              We show a read-only info chip instead so the dealer knows who owns this subdealer.
            */}
            <Grid item xs={12} md={4}>
              <Field label="Dealer">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: 36,
                    px: 1.5,
                    borderRadius: 1.5,
                    border: "0.5px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}
                  >
                    {user?.username || user?.id}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#9ca3af", ml: 1 }}>
                    (λογαριασμός σας)
                  </Typography>
                </Box>
              </Field>
            </Grid>

            <Grid item xs={12} md={3}>
              <Field label="Επάγγελμα" req error={errors.epaggelma}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.epaggelma}
                  onChange={(e) => handleChange("epaggelma", e.target.value)}
                  error={!!errors.epaggelma}
                  sx={inputSx}
                />
              </Field>
            </Grid>

            <Grid item xs={12} md={3}>
              <Field label="Δ.Ο.Υ." req error={errors.doy}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.doy}
                  onChange={(e) => handleChange("doy", e.target.value)}
                  error={!!errors.doy}
                  sx={inputSx}
                />
              </Field>
            </Grid>
          </Grid>
        </Paper>

        {/* ===== ΕΠΙΚΟΙΝΩΝΙΑ ===== */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
        >
          <SectionTitle>Διεύθυνση & Επικοινωνία</SectionTitle>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field label="Διεύθυνση" req error={errors.address}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  error={!!errors.address}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={3}>
              <Field label="Πόλη" req error={errors.city}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  error={!!errors.city}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={3}>
              <Field label="Τ.Κ." req error={errors.tk}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.tk}
                  onChange={(e) =>
                    handleChange(
                      "tk",
                      e.target.value.replace(/\D/g, "").slice(0, 5),
                    )
                  }
                  error={!!errors.tk}
                  inputProps={{
                    maxLength: 5,
                    style: { fontFamily: "monospace" },
                  }}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Τηλέφωνο σταθερό" req error={errors.phoneFixed}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.phoneFixed}
                  onChange={(e) => handleChange("phoneFixed", e.target.value)}
                  error={!!errors.phoneFixed}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Τηλέφωνο κινητό" req error={errors.phoneMobile}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.phoneMobile}
                  onChange={(e) => handleChange("phoneMobile", e.target.value)}
                  error={!!errors.phoneMobile}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Email" req error={errors.email}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={!!errors.email}
                  sx={inputSx}
                />
              </Field>
            </Grid>
          </Grid>
        </Paper>

        {/* ===== ΣΤΟΙΧΕΙΑ ΕΙΣΟΔΟΥ ===== */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
        >
          <SectionTitle>Στοιχεία εισόδου</SectionTitle>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Field label="Username" req={!isEdit} error={errors.username}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  error={!!errors.username}
                  disabled={isEdit}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                label={
                  isEdit ? "Νέο password (κενό = δεν αλλάζει)" : "Password"
                }
                req={!isEdit}
                error={errors.password}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  error={!!errors.password}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                label="Επιβεβαίωση password"
                req={!isEdit}
                error={errors.passwordConfirm}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  value={form.passwordConfirm}
                  onChange={(e) =>
                    handleChange("passwordConfirm", e.target.value)
                  }
                  error={!!errors.passwordConfirm}
                  sx={inputSx}
                />
              </Field>
            </Grid>
          </Grid>
        </Paper>

        {/* ===== ΠΡΟΜΗΘΕΙΕΣ ===== */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "0.5px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 3, py: 2, borderBottom: "0.5px solid #e5e7eb" }}>
            <SectionTitle>Προμήθειες</SectionTitle>
            <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: -1 }}>
              Οι τιμές πώλησης υπολογίζονται αυτόματα από τον τιμοκατάλογο · Το
              % μπορεί να διορθωθεί χειροκίνητα
            </Typography>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Περιγραφή</th>
                  <th style={{ ...thStyle, width: 220 }}>
                    Προμήθεια επί τελικής τιμής %
                  </th>
                  <th style={{ ...thStyle, width: 160, textAlign: "right" }}>
                    Τιμή Πώλησης
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, i) => (
                  <tr
                    key={c.productId}
                    style={{ borderBottom: "0.5px solid #f3f4f6" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        color: "#9ca3af",
                        fontFamily: "monospace",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: 13,
                        color: "#111827",
                      }}
                    >
                      {c.description}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TextField
                          size="small"
                          type="number"
                          value={c.percentage}
                          onChange={(e) =>
                            handleCommissionChange(
                              i,
                              "percentage",
                              e.target.value,
                            )
                          }
                          placeholder="0"
                          inputProps={{
                            min: 0,
                            max: 100,
                            step: 0.1,
                            style: {
                              width: 70,
                              textAlign: "center",
                              fontFamily: "monospace",
                              padding: "6px 8px",
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                          }}
                        />
                        <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
                          %
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#111827",
                          fontFamily: "monospace",
                        }}
                      >
                        €{Number(c.salePrice).toFixed(2)}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
                        από τιμοκατάλογο
                      </Typography>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}

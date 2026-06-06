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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Chip,
  Switch,
  Tooltip,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { customersApi } from "../../services/customers";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";
import { subdealersApi } from "../../services/subdealers";

const PRODUCTS = [
  { id: 1, description: "Συνδρομή εφαρμογής", type: "DATE", defaultCost: 120 },
  { id: 2, description: "Ενεργός Πάροχος ΗΤ", type: "DATE", defaultCost: 100 },
  { id: 3, description: "Σύνδεση POS", type: "DATE", defaultCost: 50 },
  { id: 4, description: "Άδεια mobile App", type: "DATE", defaultCost: 100 },
  { id: 5, description: "Σύνδεση WooCommerce", type: "DATE", defaultCost: 200 },
  { id: 6, description: "Ενεργά SMS", type: "QUANTITY", defaultCost: 30 },
  { id: 7, description: "Ενεργά email", type: "QUANTITY", defaultCost: 20 },
  { id: 8, description: "Ψηφιακό Πελατολόγιο", type: "DATE", defaultCost: 50 },
];

const initialForm = {
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
  active: true,
  networkId: "",
  dealerId: "",
  subDealerId: "",
};

const initialSubscriptions = PRODUCTS.map((p) => ({
  productId: p.id,
  description: p.description,
  type: p.type,
  active: false,
  expiryDate: "",
  quantity: "",
  cost: p.defaultCost,
}));

const required = [
  "afm",
  "eponymia",
  "epaggelma",
  "doy",
  "address",
  "city",
  "tk",
  "phoneMobile",
  "email",
  "dealerId",
];

function validate(form) {
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
        mt: 0.5,
      }}
    >
      {children}
    </Typography>
  );
}

function Field({ label, required, error, children }) {
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
        {required && <span style={{ color: "#ef4444" }}> *</span>}
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

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState(initialForm);
  const [subscriptions, setSubs] = useState(initialSubscriptions);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [taxisLoading, setTaxisLoading] = useState(false);

  const [dealers, setDealers] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [subDealers, setSubDealers] = useState([]);

  // Load dropdowns
  useEffect(() => {
    dealersApi
      .getAll({ size: 100 })
      .then((r) => setDealers(r.data.content))
      .catch(() => {});
    networksApi
      .getAll({ size: 100 })
      .then((r) => setNetworks(r.data.content))
      .catch(() => {});
  }, []);

  // Load subdealers when dealer changes
  useEffect(() => {
    if (!form.dealerId) {
      setSubDealers([]);
      return;
    }
    subdealersApi
      .getAll({ dealerId: form.dealerId, size: 100 })
      .then((r) => setSubDealers(r.data.content))
      .catch(() => setSubDealers([]));
  }, [form.dealerId]);

  // ── Load existing customer for edit — fields AND subscriptions ───────────────
  // Runs both requests in parallel so we don't double the load time.
  useEffect(() => {
    if (!isEdit) return;
    setPageLoading(true);

    Promise.all([customersApi.getById(id), customersApi.getSubscriptions(id)])
      .then(([customerRes, subsRes]) => {
        const c = customerRes.data;
        setForm({
          afm: c.afm || "",
          eponymia: c.eponymia || "",
          nomimosEkprosopos: c.nomimosEkprosopos || "",
          epaggelma: c.epaggelma || "",
          doy: c.doy || "",
          address: c.address || "",
          city: c.city || "",
          tk: c.tk || "",
          phoneFixed: c.phoneFixed || "",
          phoneMobile: c.phoneMobile || "",
          email: c.email || "",
          active: c.active ?? true,
          networkId: c.networkId || "",
          dealerId: c.dealerId || "",
          subDealerId: c.subDealerId || "",
        });

        // Merge real subscription data with full PRODUCTS list.
        // Every product row is always shown — inactive ones have active:false.
        const apiSubs = subsRes.data ?? [];
        setSubs(
          PRODUCTS.map((p) => {
            const found = apiSubs.find((s) => s.productId === p.id);
            return {
              productId: p.id,
              description: p.description,
              type: p.type,
              active: found?.active ?? false,
              expiryDate: found?.expiryDate ?? "",
              quantity: found?.quantity ?? "",
              cost: found?.cost ?? p.defaultCost,
            };
          }),
        );
      })
      .catch(() => setGlobalError("Σφάλμα φόρτωσης πελάτη"))
      .finally(() => setPageLoading(false));
  }, [id, isEdit]);

  const handleChange = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    setGlobalError("");
  };

  // TAXIS lookup — mock, will connect to real API
  const handleTaxisSearch = async () => {
    if (!form.afm || form.afm.length !== 9) {
      setErrors((p) => ({ ...p, afm: "Εισάγετε 9ψήφιο ΑΦΜ πρώτα" }));
      return;
    }
    setTaxisLoading(true);
    try {
      // TODO: Σύνδεση με GSIS myAADE API
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

  const handleSubChange = (i, field, value) => {
    setSubs((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    );
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        networkId: form.networkId || null,
        subDealerId: form.subDealerId || null,
      };
      if (isEdit) {
        await customersApi.update(id, payload);
      } else {
        await customersApi.create(payload);
      }
      setSubmitted(true);
      setTimeout(() => navigate("/customers"), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || "Σφάλμα κατά την αποθήκευση";
      if (
        msg.toLowerCase().includes("afm") ||
        msg.toLowerCase().includes("υπάρχει")
      ) {
        setErrors({ afm: "Υπάρχει ήδη πελάτης με αυτό το ΑΦΜ" });
      } else {
        setGlobalError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
    "& .MuiInputBase-input": { py: "8px", px: "12px" },
  };

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* ── Header ── */}
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
            onClick={() => navigate("/customers")}
            sx={{ color: "#6b7280", minWidth: 0 }}
          >
            Πίσω
          </Button>
          <Box>
            <Typography
              sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}
            >
              {isEdit ? "Επεξεργασία πελάτη" : "Νέος πελάτης"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
              {isEdit ? `ID: ${id}` : "Καταχώρηση νέου πελάτη"}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("/customers")}
            sx={{ borderColor: "#e5e7eb", color: "#6b7280" }}
          >
            Άκυρο
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            disabled={loading}
            onClick={handleSubmit}
            sx={{ background: "#1f6feb", "&:hover": { background: "#1a5fd6" } }}
          >
            {loading ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </Stack>
      </Box>

      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Ο πελάτης {isEdit ? "ενημερώθηκε" : "καταχωρήθηκε"} επιτυχώς!
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

      <Stack spacing={2.5}>
        {/* ── Στοιχεία επιχείρησης ── */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
        >
          <SectionTitle>Στοιχεία επιχείρησης</SectionTitle>
          <Grid container spacing={2}>
            {/* AFM + TAXIS */}
            <Grid item xs={12} md={4}>
              <Field label="ΑΦΜ" required error={errors.afm}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={form.afm}
                    onChange={(e) => handleChange("afm", e.target.value)}
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
                      onClick={handleTaxisSearch}
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
              <Field label="Επωνυμία" required error={errors.eponymia}>
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

            <Grid item xs={12} md={3}>
              <Field label="Επάγγελμα" required error={errors.epaggelma}>
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

            <Grid item xs={12} md={4}>
              <Field label="Δ.Ο.Υ." required error={errors.doy}>
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

        {/* ── Διεύθυνση & Επικοινωνία ── */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
        >
          <SectionTitle>Διεύθυνση & Επικοινωνία</SectionTitle>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field label="Διεύθυνση" required error={errors.address}>
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
              <Field label="Πόλη" required error={errors.city}>
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
              <Field label="Τ.Κ." required error={errors.tk}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.tk}
                  onChange={(e) => handleChange("tk", e.target.value)}
                  error={!!errors.tk}
                  inputProps={{ maxLength: 5 }}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Τηλέφωνο σταθερό">
                <TextField
                  fullWidth
                  size="small"
                  value={form.phoneFixed}
                  onChange={(e) => handleChange("phoneFixed", e.target.value)}
                  sx={inputSx}
                />
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field
                label="Τηλέφωνο κινητό"
                required
                error={errors.phoneMobile}
              >
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
              <Field label="Email" required error={errors.email}>
                <TextField
                  fullWidth
                  size="small"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  error={!!errors.email}
                  sx={inputSx}
                />
              </Field>
            </Grid>
          </Grid>
        </Paper>

        {/* ── Ανάθεση & Κατάσταση ── */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
        >
          <SectionTitle>Ανάθεση & Κατάσταση</SectionTitle>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Field label="Network">
                <FormControl fullWidth size="small">
                  <Select
                    value={form.networkId}
                    displayEmpty
                    onChange={(e) => handleChange("networkId", e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        fontSize: 13,
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>— Κανένα —</em>
                    </MenuItem>
                    {networks.map((n) => (
                      <MenuItem key={n.id} value={n.id}>
                        {n.eponymia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Dealer" required error={errors.dealerId}>
                <FormControl fullWidth size="small" error={!!errors.dealerId}>
                  <Select
                    value={form.dealerId}
                    displayEmpty
                    onChange={(e) => {
                      handleChange("dealerId", e.target.value);
                      handleChange("subDealerId", "");
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        fontSize: 13,
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>— Επιλογή —</em>
                    </MenuItem>
                    {dealers.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.eponymia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Field>
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Sub-dealer">
                <FormControl fullWidth size="small">
                  <Select
                    value={form.subDealerId}
                    displayEmpty
                    disabled={!form.dealerId}
                    onChange={(e) =>
                      handleChange("subDealerId", e.target.value)
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        fontSize: 13,
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>— Κανένας —</em>
                    </MenuItem>
                    {subDealers.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.eponymia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Field>
            </Grid>
            <Grid item xs={12} md={3}>
              <Field label="Ενεργός">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    height: 36,
                  }}
                >
                  <Switch
                    checked={form.active}
                    onChange={(e) => handleChange("active", e.target.checked)}
                    size="small"
                  />
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: form.active ? "#16a34a" : "#9ca3af",
                      fontWeight: form.active ? 600 : 400,
                    }}
                  >
                    {form.active ? "Ναι" : "Όχι"}
                  </Typography>
                </Box>
              </Field>
            </Grid>
          </Grid>
        </Paper>

        {/* ── Ενεργοποιημένα Προϊόντα ── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "0.5px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 1.8,
              borderBottom: "0.5px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}
            >
              Ενεργοποιημένα Προϊόντα
            </Typography>
            <Tooltip title="Ενημερώνονται αυτόματα από την τιμολογιέρα · Μόνο το Κόστος μπορεί να αλλαχτεί χειροκίνητα">
              <InfoOutlinedIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
            </Tooltip>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "#",
                    "Περιγραφή",
                    "Ενεργοποιημένο",
                    "Ημερ. Λήξης / Ποσότητα",
                    "Κόστος (€)",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: h === "Κόστος (€)" ? "right" : "left",
                        fontSize: 11,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 500,
                        borderBottom: "0.5px solid #e5e7eb",
                        background: "#fafafa",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s, i) => (
                  <tr
                    key={s.productId}
                    style={{
                      borderBottom: "0.5px solid #f3f4f6",
                      background: s.active ? "#f0fdf4" : "transparent",
                    }}
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
                        fontWeight: s.active ? 600 : 400,
                      }}
                    >
                      {s.description}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Switch
                          checked={s.active}
                          onChange={(e) =>
                            handleSubChange(i, "active", e.target.checked)
                          }
                          size="small"
                          sx={{
                            "& .Mui-checked + .MuiSwitch-track": {
                              backgroundColor: "#16a34a !important",
                            },
                            "& .Mui-checked .MuiSwitch-thumb": {
                              color: "#16a34a",
                            },
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: s.active ? "#16a34a" : "#9ca3af",
                            fontWeight: s.active ? 600 : 400,
                          }}
                        >
                          {s.active ? "Ναι" : "Όχι"}
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      {s.type === "DATE" ? (
                        <TextField
                          size="small"
                          type="date"
                          value={s.expiryDate}
                          onChange={(e) =>
                            handleSubChange(i, "expiryDate", e.target.value)
                          }
                          disabled={!s.active}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            width: 160,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                              fontSize: 12,
                              background: s.active ? "#fff" : "#f9fafb",
                            },
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <TextField
                            size="small"
                            type="number"
                            value={s.quantity}
                            onChange={(e) =>
                              handleSubChange(i, "quantity", e.target.value)
                            }
                            disabled={!s.active}
                            inputProps={{
                              min: 0,
                              style: { width: 80, fontFamily: "monospace" },
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 1.5,
                                fontSize: 12,
                                background: s.active ? "#fff" : "#f9fafb",
                              },
                            }}
                          />
                          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                            {s.productId === 6 ? "SMS" : "email"}
                          </Typography>
                        </Box>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      <TextField
                        size="small"
                        type="number"
                        value={s.cost}
                        onChange={(e) =>
                          handleSubChange(i, "cost", e.target.value)
                        }
                        inputProps={{
                          min: 0,
                          step: 0.01,
                          style: {
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: 600,
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <Typography
                              sx={{ fontSize: 12, color: "#9ca3af", mr: 0.3 }}
                            >
                              €
                            </Typography>
                          ),
                        }}
                        sx={{
                          width: 110,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            fontSize: 13,
                          },
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          <Box
            sx={{
              px: 3,
              py: 1.5,
              background: "#fafafa",
              borderTop: "0.5px solid #e5e7eb",
            }}
          >
            <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
              Τα ενεργοποιημένα προϊόντα ενημερώνονται αυτόματα από την
              τιμολογιέρα · Μόνο η στήλη "Κόστος" μπορεί να αλλαχτεί χειροκίνητα
            </Typography>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}

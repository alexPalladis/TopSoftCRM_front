import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import {
  FormSection,
  FormField,
  FormSelect,
  FormSwitch,
} from "../../components/shared/EntityForm";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";

const initialForm = {
  afm: "",
  eponymia: "",
  nomimos_ekprosopos: "",
  epaggelma: "",
  doy: "",
  address: "",
  city: "",
  tk: "",
  phone_fixed: "",
  phone_mobile: "",
  email: "",
  username: "",
  password: "",
  password_confirm: "",
  network_id: "",
  active: true,
};

const requiredFields = [
  "afm",
  "eponymia",
  "epaggelma",
  "doy",
  "address",
  "city",
  "tk",
  "phone_mobile",
  "email",
  "username",
  "password",
];

function validate(form) {
  const errors = {};
  requiredFields.forEach((f) => {
    if (!form[f]) errors[f] = "Υποχρεωτικό πεδίο";
  });
  if (form.afm && form.afm.length !== 9)
    errors.afm = "Το ΑΦΜ πρέπει να είναι 9 ψηφία";
  if (form.tk && form.tk.length !== 5)
    errors.tk = "Ο ΤΚ πρέπει να είναι 5 ψηφία";
  if (form.email && !/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Μη έγκυρο email";
  if (form.password && form.password.length < 6)
    errors.password = "Τουλάχιστον 6 χαρακτήρες";
  if (form.password !== form.password_confirm)
    errors.password_confirm = "Τα passwords δεν ταιριάζουν";
  return errors;
}

export default function NewDealerPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [networks, setNetworks] = useState([
    { value: "", label: "— Ανεξάρτητος —" },
  ]);

  useEffect(() => {
    networksApi
      .getAll({ size: 100, active: true })
      .then((res) =>
        setNetworks([
          { value: "", label: "— Ανεξάρτητος —" },
          ...res.data.content.map((n) => ({ value: n.id, label: n.eponymia })),
        ]),
      )
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await dealersApi.create({
        afm: form.afm,
        eponymia: form.eponymia,
        nomimosEkprosopos: form.nomimos_ekprosopos,
        epaggelma: form.epaggelma,
        doy: form.doy,
        address: form.address,
        city: form.city,
        tk: form.tk,
        phoneFixed: form.phone_fixed || null,
        phoneMobile: form.phone_mobile,
        email: form.email,
        username: form.username,
        password: form.password,
        networkId: form.network_id || null,
        active: form.active,
      });
      setSubmitted(true);
      setTimeout(() => navigate("/dealers"), 1500);
    } catch (err) {
      setErrors({
        general: err.response?.data?.error || "Σφάλμα κατά την αποθήκευση",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
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
            onClick={() => navigate("/dealers")}
            sx={{ color: "#6b7280", minWidth: 0 }}
          >
            Πίσω
          </Button>
          <Box>
            <Typography
              sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}
            >
              Νέος dealer
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
              Καταχώρηση νέου dealer
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("/dealers")}
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
          Ο dealer καταχωρήθηκε επιτυχώς!
        </Alert>
      )}
      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}
      {!errors.general && Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Παρακαλώ συμπλήρωσε όλα τα υποχρεωτικά πεδία σωστά.
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
      >
        <FormSection title="Στοιχεία επιχείρησης">
          <FormField
            name="afm"
            label="ΑΦΜ"
            value={form.afm}
            onChange={handleChange}
            error={errors.afm}
            required
            inputProps={{ maxLength: 9 }}
            size={4}
          />
          <FormField
            name="eponymia"
            label="Επωνυμία"
            value={form.eponymia}
            onChange={handleChange}
            error={errors.eponymia}
            required
            size={8}
          />
          <FormField
            name="nomimos_ekprosopos"
            label="Νόμιμος εκπρόσωπος"
            value={form.nomimos_ekprosopos}
            onChange={handleChange}
            size={6}
          />
          <FormField
            name="epaggelma"
            label="Επάγγελμα"
            value={form.epaggelma}
            onChange={handleChange}
            error={errors.epaggelma}
            required
            size={3}
          />
          <FormField
            name="doy"
            label="Δ.Ο.Υ."
            value={form.doy}
            onChange={handleChange}
            error={errors.doy}
            required
            size={3}
          />
        </FormSection>
        <FormSection title="Διεύθυνση & Επικοινωνία">
          <FormField
            name="address"
            label="Διεύθυνση"
            value={form.address}
            onChange={handleChange}
            error={errors.address}
            required
            size={8}
          />
          <FormField
            name="tk"
            label="Τ.Κ."
            value={form.tk}
            onChange={handleChange}
            error={errors.tk}
            required
            size={4}
            inputProps={{ maxLength: 5 }}
          />
          <FormField
            name="city"
            label="Πόλη"
            value={form.city}
            onChange={handleChange}
            error={errors.city}
            required
            size={4}
          />
          <FormField
            name="phone_fixed"
            label="Τηλέφωνο σταθερό"
            value={form.phone_fixed}
            onChange={handleChange}
            size={4}
          />
          <FormField
            name="phone_mobile"
            label="Κινητό"
            value={form.phone_mobile}
            onChange={handleChange}
            error={errors.phone_mobile}
            required
            size={4}
          />
          <FormField
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required
            size={6}
            type="email"
          />
        </FormSection>
        <FormSection title="Στοιχεία εισόδου">
          <FormField
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            required
            size={4}
          />
          <FormField
            name="password"
            label="Password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
            size={4}
            type="password"
          />
          <FormField
            name="password_confirm"
            label="Επιβεβαίωση password"
            value={form.password_confirm}
            onChange={handleChange}
            error={errors.password_confirm}
            required
            size={4}
            type="password"
          />
        </FormSection>
        <FormSection title="Δίκτυο">
          <FormSelect
            name="network_id"
            label="Network"
            value={form.network_id}
            onChange={handleChange}
            size={6}
            options={networks}
          />
        </FormSection>
        <FormSection title="Κατάσταση">
          <FormSwitch
            name="active"
            label="Ενεργός dealer"
            value={form.active}
            onChange={handleChange}
          />
        </FormSection>
      </Paper>
    </Box>
  );
}

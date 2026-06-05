import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Stack,
  CircularProgress,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
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

const mockCommissions = PRODUCTS.map((p, i) => ({
  ...p,
  percentage: [8, 6, 5, 6, 4, 3, 3, 5][i],
  salePrice: (p.defaultPrice * (1 - [8, 6, 5, 6, 4, 3, 3, 5][i] / 100)).toFixed(
    2,
  ),
}));

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", py: 0.8, borderBottom: "0.5px solid #f3f4f6" }}>
      <Typography
        sx={{ fontSize: 12, color: "#9ca3af", width: 180, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#111827" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function SubDealerViewDialog({ subdealer, open, onClose }) {
  if (!subdealer) return null;

  const thStyle = {
    padding: "8px 12px",
    textAlign: "left",
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 500,
    borderBottom: "0.5px solid #e5e7eb",
    background: "#fafafa",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: "0.5px solid #e5e7eb" } }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              background: "#fef3c7",
              color: "#d97706",
              width: 40,
              height: 40,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {subdealer.eponymia?.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}
            >
              {subdealer.eponymia}
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}
            >
              ID: {subdealer.id}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 1,
              }}
            >
              Στοιχεία επιχείρησης
            </Typography>
            <DetailRow label="ID" value={subdealer.id} />
            <DetailRow label="ΑΦΜ" value={subdealer.afm} />
            <DetailRow label="Επωνυμία" value={subdealer.eponymia} />
            <DetailRow
              label="Νόμιμος εκπρόσωπος"
              value={subdealer.nomimosEkprosopos}
            />
            <DetailRow label="Επάγγελμα" value={subdealer.epaggelma} />
            <DetailRow label="Δ.Ο.Υ." value={subdealer.doy} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                mb: 1,
              }}
            >
              Επικοινωνία
            </Typography>
            <DetailRow label="Διεύθυνση" value={subdealer.address} />
            <DetailRow label="Πόλη" value={subdealer.city} />
            <DetailRow label="Τ.Κ." value={subdealer.tk} />
            <DetailRow label="Σταθερό" value={subdealer.phoneFixed} />
            <DetailRow label="Κινητό" value={subdealer.phoneMobile} />
            <DetailRow label="Email" value={subdealer.email} />
          </Grid>

          {/* Προμήθειες — read only */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 1.5 }} />
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Προμήθειες
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LockIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
                <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                  Μόνο προβολή
                </Typography>
              </Box>
            </Box>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Περιγραφή</th>
                  <th style={{ ...thStyle, width: 200 }}>Προμήθεια %</th>
                  <th style={{ ...thStyle, width: 160, textAlign: "right" }}>
                    Τιμή Πώλησης
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockCommissions.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "0.5px solid #f3f4f6",
                      background: "#fafafa",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: 12,
                        color: "#9ca3af",
                        fontFamily: "monospace",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      {c.description}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <Chip
                        label={`${c.percentage}%`}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 20,
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        textAlign: "right",
                        fontSize: 13,
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      €{c.salePrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "0.5px solid #e5e7eb" }}>
        <Button size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
          Κλείσιμο
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DealerSubDealersPage() {
  const { user } = useAuth();

  const [subDealers, setSubDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const PER_PAGE = 10;

  const fetchSubDealers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        dealerId: user?.id, // ΜΟΝΟ sub-dealers αυτού του dealer
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
      };
      const res = await subdealersApi.getAll(params);
      setSubDealers(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCity, user]);

  useEffect(() => {
    fetchSubDealers();
  }, [fetchSubDealers]);

  const cities = [...new Set(subDealers.map((s) => s.city).filter(Boolean))];

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
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            Sub-dealer
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {total} εγγραφές — μόνο δικοί σας sub-dealers
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, borderRadius: 2, border: "0.5px solid #e5e7eb" }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Αναζήτηση ΑΦΜ, επωνυμία..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ width: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Πόλη</InputLabel>
            <Select
              value={filterCity}
              label="Πόλη"
              onChange={(e) => {
                setFilterCity(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Όλες</MenuItem>
              {cities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {(search || filterCity) && (
            <Button
              size="small"
              onClick={() => {
                setSearch("");
                setFilterCity("");
                setPage(0);
              }}
              sx={{ color: "#9ca3af", fontSize: 12 }}
            >
              Καθαρισμός ✕
            </Button>
          )}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "0.5px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["ΑΦΜ", "Επωνυμία", "Πόλη", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 500,
                        borderBottom: "0.5px solid #e5e7eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subDealers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      Δεν βρέθηκαν εγγραφές
                    </td>
                  </tr>
                ) : (
                  subDealers.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: "0.5px solid #f3f4f6",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      onClick={() => {
                        setSelected(s);
                        setDialogOpen(true);
                      }}
                    >
                      <td
                        style={{
                          padding: "11px 16px",
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {s.afm}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              background: "#fef3c7",
                              color: "#d97706",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {s.eponymia?.charAt(0)}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {s.eponymia}
                          </Typography>
                        </Box>
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {s.city}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Tooltip title="Προβολή">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(s);
                              setDialogOpen(true);
                            }}
                            sx={{
                              color: "#9ca3af",
                              "&:hover": { color: "#1f6feb" },
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        )}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "0.5px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
            {total === 0
              ? "0"
              : `${page * PER_PAGE + 1}–${Math.min((page + 1) * PER_PAGE, total)}`}{" "}
            από {total} εγγραφές
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {[...Array(totalPages)].map((_, i) => (
              <Box
                key={i}
                onClick={() => setPage(i)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: page === i ? 600 : 400,
                  background: page === i ? "#1f6feb" : "transparent",
                  color: page === i ? "#fff" : "#6b7280",
                  border: "0.5px solid",
                  borderColor: page === i ? "#1f6feb" : "#e5e7eb",
                }}
              >
                {i + 1}
              </Box>
            ))}
          </Stack>
        </Box>
      </Paper>

      <SubDealerViewDialog
        subdealer={selected}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}

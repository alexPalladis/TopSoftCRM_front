import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { dealersApi } from "../../services/dealers";
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

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", py: 0.8, borderBottom: "0.5px solid #f3f4f6" }}>
      <Typography
        sx={{ fontSize: 12, color: "#9ca3af", width: 160, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#111827" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function DealerViewDialog({ dealer, open, onClose, onEdit }) {
  if (!dealer) return null;

  // Mock commissions — θα έρθουν από API
  const commissions = PRODUCTS.map((p, i) => ({
    ...p,
    percentage: [15, 10, 12, 10, 8, 5, 5, 10][i],
    salePrice: (
      p.defaultPrice *
      (1 - [15, 10, 12, 10, 8, 5, 5, 10][i] / 100)
    ).toFixed(2),
  }));

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
              background: "#dbeafe",
              color: "#1d4ed8",
              width: 40,
              height: 40,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {dealer.eponymia?.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}
            >
              {dealer.eponymia}
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}
            >
              ID: {dealer.id}
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
            <DetailRow label="ΑΦΜ" value={dealer.afm} />
            <DetailRow label="Επωνυμία" value={dealer.eponymia} />
            <DetailRow
              label="Νόμιμος εκπρόσωπος"
              value={dealer.nomimosEkprosopos}
            />
            <DetailRow label="Επάγγελμα" value={dealer.epaggelma} />
            <DetailRow label="Δ.Ο.Υ." value={dealer.doy} />
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
            <DetailRow label="Διεύθυνση" value={dealer.address} />
            <DetailRow label="Πόλη" value={dealer.city} />
            <DetailRow label="Τ.Κ." value={dealer.tk} />
            <DetailRow label="Σταθερό" value={dealer.phoneFixed} />
            <DetailRow label="Κινητό" value={dealer.phoneMobile} />
            <DetailRow label="Email" value={dealer.email} />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ mb: 1.5 }} />
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
              Προμήθειες
            </Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["#", "Περιγραφή", "Προμήθεια %", "Τιμή Πώλησης"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          fontSize: 11,
                          color: "#9ca3af",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontWeight: 500,
                          borderBottom: "0.5px solid #e5e7eb",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: "0.5px solid #f3f4f6" }}
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
                        color: "#111827",
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
                          background: "#eff6ff",
                          color: "#1d4ed8",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
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
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "0.5px solid #e5e7eb",
          justifyContent: "space-between",
        }}
      >
        <Button size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
          Κλείσιμο
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {
            onClose();
            onEdit(dealer);
          }}
          sx={{ background: "#1f6feb", "&:hover": { background: "#1a5fd6" } }}
        >
          Διόρθωση
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function NetworkDealersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dealers, setDealers] = useState([]);
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

  const fetchDealers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        networkId: user?.id, // ΜΟΝΟ dealers αυτού του network
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
      };
      const res = await dealersApi.getAll(params);
      setDealers(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCity, user]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  const cities = [...new Set(dealers.map((d) => d.city).filter(Boolean))];

  const handleEdit = (dealer) => {
    navigate(`/dealers/${dealer.id}/edit`);
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
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            Dealer
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {total} εγγραφές — μόνο του δικτύου σας
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dealers/new")}
          sx={{
            background: "#1f6feb",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { background: "#1a5fd6" },
          }}
        >
          Νέος dealer
        </Button>
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
                  {["ΑΦΜ", "Επωνυμία", "Πόλη", "Σύνολο Sub-dealer", ""].map(
                    (h) => (
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
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {dealers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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
                  dealers.map((d) => (
                    <tr
                      key={d.id}
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
                          padding: "11px 16px",
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {d.afm}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {d.eponymia?.charAt(0)}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {d.eponymia}
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
                        {d.city}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Chip
                          label={d.totalSubDealers || 0}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 22,
                            background: "#ede9fe",
                            color: "#6d28d9",
                            fontFamily: "monospace",
                            fontWeight: 600,
                          }}
                        />
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Tooltip title="Προβολή">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected(d);
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
                        <Tooltip title="Διόρθωση">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(d)}
                            sx={{
                              color: "#9ca3af",
                              "&:hover": { color: "#f59e0b" },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
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

      <DealerViewDialog
        dealer={selected}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onEdit={handleEdit}
      />
    </Box>
  );
}

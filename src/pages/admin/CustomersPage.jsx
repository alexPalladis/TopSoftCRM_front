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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { customersApi } from "../../services/customers";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";

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

function CustomerDialog({ customer, open, onClose }) {
  if (!customer) return null;
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
          alignItems: "center",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
            {customer.eponymia}
          </Typography>
          <Typography
            sx={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}
          >
            ID: {customer.id} · ΑΦΜ: {customer.afm}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={customer.active ? "Ενεργός" : "Ανενεργός"}
            size="small"
            icon={customer.active ? <CheckCircleIcon /> : <CancelIcon />}
            sx={{
              background: customer.active ? "#dcfce7" : "#fee2e2",
              color: customer.active ? "#166534" : "#991b1b",
              fontSize: 11,
            }}
          />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 1,
              }}
            >
              Στοιχεία επιχείρησης
            </Typography>
            <DetailRow label="Επωνυμία" value={customer.eponymia} />
            <DetailRow
              label="Νόμιμος εκπρόσωπος"
              value={customer.nomimosEkprosopos}
            />
            <DetailRow label="Επάγγελμα" value={customer.epaggelma} />
            <DetailRow label="Δ.Ο.Υ." value={customer.doy} />
            <DetailRow label="ΑΦΜ" value={customer.afm} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 1,
              }}
            >
              Επικοινωνία
            </Typography>
            <DetailRow label="Διεύθυνση" value={customer.address} />
            <DetailRow label="Πόλη" value={customer.city} />
            <DetailRow label="Τ.Κ." value={customer.tk} />
            <DetailRow label="Σταθερό" value={customer.phoneFixed} />
            <DetailRow label="Κινητό" value={customer.phoneMobile} />
            <DetailRow label="Email" value={customer.email} />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 1,
              }}
            >
              Δίκτυο πωλήσεων
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <DetailRow label="Network" value={customer.networkName} />
              </Grid>
              <Grid item xs={4}>
                <DetailRow label="Dealer" value={customer.dealerName} />
              </Grid>
              <Grid item xs={4}>
                <DetailRow label="Sub-dealer" value={customer.subDealerName} />
              </Grid>
            </Grid>
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

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterDealer, setFilterDealer] = useState("");
  const [filterNetwork, setFilterNetwork] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [networks, setNetworks] = useState([]);
  const PER_PAGE = 10;

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

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
        ...(filterDealer && { dealerId: filterDealer }),
        ...(filterNetwork && { networkId: filterNetwork }),
        ...(filterActive !== "" && { active: filterActive }),
      };
      const res = await customersApi.getAll(params);
      setCustomers(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCity, filterDealer, filterNetwork, filterActive]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id) => {
    if (!window.confirm("Διαγραφή πελάτη;")) return;
    try {
      await customersApi.delete(id);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || "Σφάλμα διαγραφής");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterCity("");
    setFilterDealer("");
    setFilterNetwork("");
    setFilterActive("");
    setPage(0);
  };
  const hasFilters =
    search ||
    filterCity ||
    filterDealer ||
    filterNetwork ||
    filterActive !== "";

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
            Πελάτες
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {total} εγγραφές
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/customers/new")}
          sx={{
            background: "#1f6feb",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { background: "#1a5fd6" },
          }}
        >
          Νέος πελάτης
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
        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          alignItems="center"
          useFlexGap
        >
          <TextField
            size="small"
            placeholder="Αναζήτηση ΑΦΜ, επωνυμία..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ width: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
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
              {[...new Set(customers.map((c) => c.city).filter(Boolean))].map(
                (c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Dealer</InputLabel>
            <Select
              value={filterDealer}
              label="Dealer"
              onChange={(e) => {
                setFilterDealer(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Όλοι</MenuItem>
              {dealers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.eponymia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Network</InputLabel>
            <Select
              value={filterNetwork}
              label="Network"
              onChange={(e) => {
                setFilterNetwork(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Όλα</MenuItem>
              {networks.map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.eponymia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Ενεργός</InputLabel>
            <Select
              value={filterActive}
              label="Ενεργός"
              onChange={(e) => {
                setFilterActive(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">Όλοι</MenuItem>
              <MenuItem value="true">Ναι</MenuItem>
              <MenuItem value="false">Όχι</MenuItem>
            </Select>
          </FormControl>
          {hasFilters && (
            <Button
              size="small"
              onClick={clearFilters}
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
                  {[
                    "ΑΦΜ",
                    "Επωνυμία",
                    "Πόλη",
                    "Dealer",
                    "Network",
                    "Ενεργός",
                    "",
                  ].map((h) => (
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
                {customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
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
                  customers.map((c) => (
                    <tr
                      key={c.id}
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
                        {c.afm}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#111827",
                        }}
                      >
                        {c.eponymia}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {c.city}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {c.dealerName || "—"}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {c.networkName || "—"}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Chip
                          label={c.active ? "Ναι" : "Όχι"}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 22,
                            background: c.active ? "#dcfce7" : "#fee2e2",
                            color: c.active ? "#166534" : "#991b1b",
                          }}
                        />
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Tooltip title="Προβολή">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected(c);
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
                            onClick={() => navigate(`/customers/${c.id}/edit`)}
                            sx={{
                              color: "#9ca3af",
                              "&:hover": { color: "#f59e0b" },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Διαγραφή">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(c.id)}
                            sx={{
                              color: "#9ca3af",
                              "&:hover": { color: "#ef4444" },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
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

      <CustomerDialog
        customer={selected}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}

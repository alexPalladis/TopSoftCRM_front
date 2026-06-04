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
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
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

function NetworkDialog({ network, open, onClose }) {
  if (!network) return null;
  const commissions = [
    { product: "Συνδρομή εφαρμογής", percentage: 5, sale_price: 102 },
    { product: "Ενεργός Πάροχος ΗΤ", percentage: 4, sale_price: 90 },
    { product: "Σύνδεση POS", percentage: 4, sale_price: 44 },
    { product: "Άδεια mobile App", percentage: 3, sale_price: 90 },
    { product: "Σύνδεση WooCommerce", percentage: 3, sale_price: 184 },
    { product: "Ενεργά SMS", percentage: 2, sale_price: 28.5 },
    { product: "Ενεργά email", percentage: 2, sale_price: 19 },
    { product: "Ψηφιακό Πελατολόγιο", percentage: 3, sale_price: 45 },
  ];
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
              background: "#ede9fe",
              color: "#6d28d9",
              width: 40,
              height: 40,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {network.eponymia?.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              sx={{ fontSize: 16, fontWeight: 600, color: "#111827" }}
            >
              {network.eponymia}
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace" }}
            >
              ID: {network.id} · {network.username}
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
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                mb: 1,
              }}
            >
              Στοιχεία επιχείρησης
            </Typography>
            <DetailRow label="Επωνυμία" value={network.eponymia} />
            <DetailRow
              label="Νόμιμος εκπρόσωπος"
              value={network.nomimosEkprosopos}
            />
            <DetailRow label="Επάγγελμα" value={network.epaggelma} />
            <DetailRow label="Δ.Ο.Υ." value={network.doy} />
            <DetailRow label="ΑΦΜ" value={network.afm} />
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
            <DetailRow label="Διεύθυνση" value={network.address} />
            <DetailRow label="Πόλη" value={network.city} />
            <DetailRow label="Τ.Κ." value={network.tk} />
            <DetailRow label="Σταθερό" value={network.phoneFixed} />
            <DetailRow label="Κινητό" value={network.phoneMobile} />
            <DetailRow label="Email" value={network.email} />
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
                mb: 1.5,
              }}
            >
              Προμήθειες ανά προϊόν
            </Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {[
                    "Περιγραφή",
                    "Προμήθεια επί τελικής τιμής %",
                    "Τιμή Πώλησης",
                  ].map((h) => (
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
                  ))}
                </tr>
              </thead>
              <tbody>
                {commissions.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "0.5px solid #f3f4f6" }}>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      {row.product}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <Chip
                        label={`${row.percentage}%`}
                        size="small"
                        sx={{
                          fontSize: 11,
                          height: 20,
                          background: "#ede9fe",
                          color: "#6d28d9",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "#111827",
                        fontFamily: "monospace",
                        fontWeight: 500,
                      }}
                    >
                      €{row.sale_price.toFixed(2)}
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
        <Button
          size="small"
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ background: "#1f6feb", "&:hover": { background: "#1a5fd6" } }}
        >
          Διόρθωση
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function NetworksPage() {
  const navigate = useNavigate();
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const PER_PAGE = 10;

  const fetchNetworks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await networksApi.getAll({
        page,
        size: PER_PAGE,
        ...(search && { search }),
      });
      setNetworks(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  const handleDelete = async (id, totalDealers) => {
    if (totalDealers > 0) {
      alert("Δεν μπορεί να διαγραφεί — έχει dealers");
      return;
    }
    if (!window.confirm("Διαγραφή network;")) return;
    try {
      await networksApi.delete(id);
      fetchNetworks();
    } catch (err) {
      alert(err.response?.data?.error || "Σφάλμα διαγραφής");
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
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            Network
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {total} εγγραφές
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/networks/new")}
          sx={{
            background: "#1f6feb",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { background: "#1a5fd6" },
          }}
        >
          Νέο network
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
        <TextField
          size="small"
          placeholder="Αναζήτηση ΑΦΜ, επωνυμία..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
              </InputAdornment>
            ),
          }}
        />
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
                  {["ΑΦΜ", "Επωνυμία", "Πόλη", "Σύνολο dealer", ""].map((h) => (
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
                {networks.length === 0 ? (
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
                  networks.map((n) => (
                    <tr
                      key={n.id}
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
                        {n.afm}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              background: "#ede9fe",
                              color: "#6d28d9",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {n.eponymia?.charAt(0)}
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {n.eponymia}
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
                        {n.city}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Chip
                          label={n.totalDealers || 0}
                          size="small"
                          sx={{
                            fontSize: 11,
                            height: 20,
                            background: "#dbeafe",
                            color: "#1e40af",
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
                              setSelected(n);
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
                            onClick={() => navigate(`/networks/${n.id}/edit`)}
                            sx={{
                              color: "#9ca3af",
                              "&:hover": { color: "#f59e0b" },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            n.totalDealers > 0
                              ? "Έχει dealers — δεν μπορεί να διαγραφεί"
                              : "Διαγραφή"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              disabled={n.totalDealers > 0}
                              onClick={() => handleDelete(n.id, n.totalDealers)}
                              sx={{
                                color: "#9ca3af",
                                "&:hover": { color: "#ef4444" },
                                "&.Mui-disabled": { opacity: 0.3 },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </span>
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

      <NetworkDialog
        network={selected}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}

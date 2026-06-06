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
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { dealersApi } from "../../services/dealers";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

export default function DealersPage() {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSnack, setErrorSnack] = useState("");
  const PER_PAGE = 10;

  const fetchDealers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
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
  }, [page, search, filterCity]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  const handleDelete = (id) => setDeleteTarget(id);

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await dealersApi.delete(deleteTarget);
      setDeleteTarget(null);
      fetchDealers();
    } catch (err) {
      setDeleteTarget(null);
      setErrorSnack(err.response?.data?.error || "Σφάλμα διαγραφής");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cities = [...new Set(dealers.map((d) => d.city).filter(Boolean))];

  return (
    <>
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
            <Typography
              sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}
            >
              Dealer
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
              {total} εγγραφές
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
            ΠΡΟΣΘΗΚΗ DEALER
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
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
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
                          <Tooltip title="Διόρθωση">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/dealers/${d.id}/edit`)}
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
                              d.totalCustomers > 0
                                ? "Δεν μπορεί να διαγραφεί — έχει πελάτες"
                                : "Διαγραφή"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={d.totalCustomers > 0}
                                onClick={() => handleDelete(d.id)}
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
      </Box>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Διαγραφή dealer"
        message="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον dealer; Η ενέργεια δεν αναιρείται."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <Snackbar
        open={!!errorSnack}
        autoHideDuration={4000}
        onClose={() => setErrorSnack("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorSnack("")}
          sx={{ width: "100%" }}
        >
          {errorSnack}
        </Alert>
      </Snackbar>
    </>
  );
}

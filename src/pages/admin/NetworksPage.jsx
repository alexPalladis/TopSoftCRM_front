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
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { networksApi } from "../../services/networks";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

export default function NetworksPage() {
  const navigate = useNavigate();
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSnack, setErrorSnack] = useState("");
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

  const handleDelete = (id) => setDeleteTarget(id);

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await networksApi.delete(deleteTarget);
      setDeleteTarget(null);
      fetchNetworks();
    } catch (err) {
      setDeleteTarget(null);
      setErrorSnack(err.response?.data?.error || "Σφάλμα διαγραφής");
    } finally {
      setDeleteLoading(false);
    }
  };

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
            ΠΡΟΣΘΗΚΗ NETWORK
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
                    {["ΑΦΜ", "Επωνυμία", "Πόλη", "Σύνολο dealer", ""].map(
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
                              height: 22,
                              background: "#dbeafe",
                              color: "#1e40af",
                              fontFamily: "monospace",
                              fontWeight: 600,
                            }}
                          />
                        </td>
                        <td style={{ padding: "11px 16px" }}>
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
                                ? "Δεν μπορεί να διαγραφεί — έχει dealers"
                                : "Διαγραφή"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={n.totalDealers > 0}
                                onClick={() => handleDelete(n.id)}
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
        title="Διαγραφή network"
        message="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το network; Η ενέργεια δεν αναιρείται."
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

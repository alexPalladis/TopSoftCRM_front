import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { subdealersApi } from "../../services/subdealers";

export default function SubDealersPage() {
  const navigate = useNavigate();
  const [subDealers, setSubDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  const fetchSubDealers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
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
  }, [page, search, filterCity]);

  useEffect(() => {
    fetchSubDealers();
  }, [fetchSubDealers]);

  const handleDelete = async (id, totalCustomers) => {
    if (totalCustomers > 0) {
      alert(
        "Δεν μπορεί να διαγραφεί — υπάρχουν πελάτες που ανήκουν σε αυτόν τον sub-dealer",
      );
      return;
    }
    if (!window.confirm("Διαγραφή sub-dealer;")) return;
    try {
      await subdealersApi.delete(id);
      fetchSubDealers();
    } catch (err) {
      alert(err.response?.data?.error || "Σφάλμα διαγραφής");
    }
  };

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
            {total} εγγραφές
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/subdealers/new")}
          sx={{
            background: "#1f6feb",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { background: "#1a5fd6" },
          }}
        >
          ΠΡΟΣΘΗΚΗ SUB-DEALER
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
                        <Tooltip title="Διόρθωση">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/subdealers/${s.id}/edit`)}
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
                            s.totalCustomers > 0
                              ? "Δεν μπορεί να διαγραφεί — έχει πελάτες"
                              : "Διαγραφή"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              disabled={s.totalCustomers > 0}
                              onClick={() =>
                                handleDelete(s.id, s.totalCustomers)
                              }
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
  );
}

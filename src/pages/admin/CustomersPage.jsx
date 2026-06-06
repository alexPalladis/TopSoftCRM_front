import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Snackbar,
} from "@mui/material";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import ReassignSubDealerDialog from "../../components/shared/ReassignSubDealerDialog";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { customersApi } from "../../services/customers";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";

const PER_PAGE = 10;

export default function CustomersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Filter & pagination state ──────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterDealer, setFilterDealer] = useState("");
  const [filterNetwork, setFilterNetwork] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [page, setPage] = useState(0);

  // ── Delete state ───────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorSnack, setErrorSnack] = useState("");

  // ── Reassign state ─────────────────────────────────────────────────────────
  const [reassignTarget, setReassignTarget] = useState(null);
  const [reassignOpen, setReassignOpen] = useState(false);

  // ── Dropdown reference data ────────────────────────────────────────────────
  const { data: dealersData } = useQuery({
    queryKey: ["dealers", "dropdown"],
    queryFn: () => dealersApi.getAll({ size: 100 }),
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data.content,
  });
  const dealers = dealersData ?? [];

  const { data: networksData } = useQuery({
    queryKey: ["networks", "dropdown"],
    queryFn: () => networksApi.getAll({ size: 100 }),
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data.content,
  });
  const networks = networksData ?? [];

  // ── Main customers list ────────────────────────────────────────────────────
  const {
    data: customersData,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: [
      "customers",
      { page, search, filterCity, filterDealer, filterNetwork, filterActive },
    ],
    queryFn: () =>
      customersApi.getAll({
        page,
        size: PER_PAGE,
        ...(search && { search }),
        ...(filterCity && { city: filterCity }),
        ...(filterDealer && { dealerId: filterDealer }),
        ...(filterNetwork && { networkId: filterNetwork }),
        ...(filterActive !== "" && { active: filterActive }),
      }),
    placeholderData: (prev) => prev,
    select: (res) => res.data,
  });

  const customers = customersData?.content ?? [];
  const total = customersData?.totalElements ?? 0;
  const totalPages = customersData?.totalPages ?? 0;

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await customersApi.delete(deleteTarget);
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "customers"] });
    } catch (err) {
      setDeleteTarget(null);
      setErrorSnack(err.response?.data?.error || "Σφάλμα διαγραφής");
    } finally {
      setDeleteLoading(false);
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
  const cities = [...new Set(customers.map((c) => c.city).filter(Boolean))];

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
              Πελάτες
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
              {total} εγγραφές{isFetching && !isLoading ? " · ανανέωση..." : ""}
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
            ΠΡΟΣΘΗΚΗ ΠΕΛΑΤΗ
          </Button>
        </Box>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Σφάλμα φόρτωσης δεδομένων
          </Alert>
        )}

        {/* Filters */}
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
                {cities.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
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

        {/* Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "0.5px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
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
                        Δεν βρέθηκαν πελάτες
                      </td>
                    </tr>
                  ) : (
                    customers.map((c, i) => (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom:
                            i < customers.length - 1
                              ? "0.5px solid #f3f4f6"
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "11px 16px",
                            fontSize: 13,
                            fontFamily: "monospace",
                            color: "#374151",
                          }}
                        >
                          {c.afm}
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {c.eponymia}
                          </Typography>
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
                            fontSize: 13,
                            color: "#374151",
                          }}
                        >
                          {c.dealerName || "—"}
                        </td>
                        <td
                          style={{
                            padding: "11px 16px",
                            fontSize: 13,
                            color: "#374151",
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
                          <Tooltip title="Αλλαγή Sub-dealer">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setReassignTarget(c);
                                setReassignOpen(true);
                              }}
                              sx={{
                                color: "#9ca3af",
                                "&:hover": { color: "#1d4ed8" },
                              }}
                            >
                              <SwapHorizIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Διόρθωση">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/customers/${c.id}/edit`)
                              }
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
                              onClick={() => setDeleteTarget(c.id)}
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

          {/* Pagination */}
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
        title="Διαγραφή πελάτη"
        message="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον πελάτη; Η ενέργεια δεν αναιρείται."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <ReassignSubDealerDialog
        customer={reassignTarget}
        open={reassignOpen}
        onClose={() => {
          setReassignOpen(false);
          setReassignTarget(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["customers"] });
        }}
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

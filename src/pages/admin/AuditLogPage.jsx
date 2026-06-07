import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import api from "../../services/api";

const PER_PAGE = 20;

const ACTION_OPTIONS = [
  { value: "CREATE", label: "Δημιουργία" },
  { value: "UPDATE", label: "Ενημέρωση" },
  { value: "DELETE", label: "Διαγραφή" },
  { value: "REASSIGN", label: "Μεταφορά" },
  { value: "LOGIN", label: "Είσοδος" },
];

const ENTITY_OPTIONS = [
  { value: "CUSTOMER", label: "Πελάτης" },
  { value: "DEALER", label: "Dealer" },
  { value: "NETWORK", label: "Network" },
  { value: "SUBDEALER", label: "SubDealer" },
  { value: "COMMISSION", label: "Προμήθεια" },
];

const actionColors = {
  CREATE: { bg: "#dcfce7", color: "#166534" },
  UPDATE: { bg: "#dbeafe", color: "#1e40af" },
  DELETE: { bg: "#fee2e2", color: "#991b1b" },
  REASSIGN: { bg: "#fef3c7", color: "#b45309" },
  LOGIN: { bg: "#f3e8ff", color: "#6d28d9" },
};

const roleColors = {
  ADMIN: { bg: "#fee2e2", color: "#991b1b" },
  NETWORK: { bg: "#ede9fe", color: "#6d28d9" },
  DEALER: { bg: "#dbeafe", color: "#1e40af" },
  SUBDEALER: { bg: "#fef3c7", color: "#d97706" },
  SYSTEM: { bg: "#f3f4f6", color: "#374151" },
};

const thStyle = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 11,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontWeight: 500,
  borderBottom: "0.5px solid #e5e7eb",
  background: "#fafafa",
  whiteSpace: "nowrap",
};

export default function AuditLogPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntityType, setFilterEntityType] = useState("");

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("size", PER_PAGE);
      if (filterDateFrom) params.set("dateFrom", filterDateFrom);
      if (filterDateTo) params.set("dateTo", filterDateTo);
      if (filterAction) params.set("action", filterAction);
      if (filterEntityType) params.set("entityType", filterEntityType);

      const res = await api.get(`/audit-logs?${params}`);
      setRows(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης audit log");
    } finally {
      setLoading(false);
    }
  }, [page, filterDateFrom, filterDateTo, filterAction, filterEntityType]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const handleFilter = (setter) => (val) => {
    setter(val);
    setPage(0);
  };

  const clearFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterAction("");
    setFilterEntityType("");
    setPage(0);
  };

  const hasFilters =
    filterDateFrom || filterDateTo || filterAction || filterEntityType;

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
            Audit Log
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {total} εγγραφές — ποιος έκανε τι και πότε
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, border: "0.5px solid #e5e7eb", borderRadius: 2 }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          <TextField
            label="Από"
            type="date"
            size="small"
            value={filterDateFrom}
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            onChange={(e) => handleFilter(setFilterDateFrom)(e.target.value)}
            sx={{ minWidth: 155 }}
          />
          <TextField
            label="Έως"
            type="date"
            size="small"
            value={filterDateTo}
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            onChange={(e) => handleFilter(setFilterDateTo)(e.target.value)}
            sx={{ minWidth: 155 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Ενέργεια</InputLabel>
            <Select
              value={filterAction}
              label="Ενέργεια"
              onChange={(e) => handleFilter(setFilterAction)(e.target.value)}
            >
              <MenuItem value="">Όλες</MenuItem>
              {ACTION_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Τύπος entity</InputLabel>
            <Select
              value={filterEntityType}
              label="Τύπος entity"
              onChange={(e) =>
                handleFilter(setFilterEntityType)(e.target.value)
              }
            >
              <MenuItem value="">Όλα</MenuItem>
              {ENTITY_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {hasFilters && (
            <Tooltip title="Καθαρισμός φίλτρων">
              <IconButton size="small" onClick={clearFilters}>
                <FilterListOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          border: "0.5px solid #e5e7eb",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Ημερομηνία</th>
                  <th style={thStyle}>Χρήστης</th>
                  <th style={thStyle}>Ρόλος</th>
                  <th style={thStyle}>Ενέργεια</th>
                  <th style={thStyle}>Τύπος</th>
                  <th style={thStyle}>Entity</th>
                  <th style={thStyle}>Περιγραφή</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: 32,
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 13,
                      }}
                    >
                      Δεν βρέθηκαν εγγραφές
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => {
                    const ac = actionColors[r.action] || {
                      bg: "#f3f4f6",
                      color: "#374151",
                    };
                    const rc = roleColors[r.actorRole] || roleColors.SYSTEM;
                    return (
                      <tr
                        key={r.id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 14px",
                            fontSize: 11,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.createdAt?.slice(0, 16).replace("T", " ")}
                        </td>
                        <td
                          style={{
                            padding: "8px 14px",
                            fontSize: 13,
                            color: "#111827",
                          }}
                        >
                          {r.actorName || r.actorId}
                        </td>
                        <td style={{ padding: "8px 14px" }}>
                          <Chip
                            size="small"
                            label={r.actorRole}
                            sx={{
                              background: rc.bg,
                              color: rc.color,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 14px" }}>
                          <Chip
                            size="small"
                            label={r.action}
                            sx={{
                              background: ac.bg,
                              color: ac.color,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "8px 14px",
                            fontSize: 12,
                            color: "#6b7280",
                          }}
                        >
                          {r.entityType}
                        </td>
                        <td
                          style={{
                            padding: "8px 14px",
                            fontSize: 12,
                            color: "#374151",
                          }}
                        >
                          {r.entityName || r.entityId || "—"}
                        </td>
                        <td
                          style={{
                            padding: "8px 14px",
                            fontSize: 12,
                            color: "#6b7280",
                          }}
                        >
                          {r.description || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: "4px 12px",
              cursor: page === 0 ? "default" : "pointer",
              opacity: page === 0 ? 0.4 : 1,
            }}
          >
            ← Προηγούμενη
          </button>
          <Typography sx={{ fontSize: 13, color: "#6b7280" }}>
            Σελίδα {page + 1} / {totalPages}
          </Typography>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: "4px 12px",
              cursor: page >= totalPages - 1 ? "default" : "pointer",
              opacity: page >= totalPages - 1 ? 0.4 : 1,
            }}
          >
            Επόμενη →
          </button>
        </Box>
      )}
    </Box>
  );
}

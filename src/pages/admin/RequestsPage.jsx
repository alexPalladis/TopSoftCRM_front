import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
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
  Divider,
  Avatar,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { ticketsApi } from "../../services/tickets";
import { useAuth } from "../../context/AuthContext";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";
import { subdealersApi } from "../../services/subdealers";
import TablePagination from "../../components/shared/TablePagination";
import TicketViewDialog from "../../components/shared/TicketViewDialog";

const PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Σε εκκρεμότητα" },
  { value: "DONE", label: "Ολοκληρώθηκε" },
];

const ENTITY_OPTIONS = [
  { value: "NETWORK", label: "Network" },
  { value: "DEALER", label: "Dealer" },
  { value: "SUBDEALER", label: "SubDealer" },
];

const entityColors = {
  ADMIN: { bg: "#fee2e2", color: "#991b1b" },
  NETWORK: { bg: "#ede9fe", color: "#6d28d9" },
  DEALER: { bg: "#dbeafe", color: "#1e40af" },
  SUBDEALER: { bg: "#fef3c7", color: "#d97706" },
};

const entityLabels = {
  ADMIN: "Admin",
  NETWORK: "Network",
  DEALER: "Dealer",
  SUBDEALER: "SubDealer",
};

function formatFrom(type, name) {
  return `${entityLabels[type] || type}, ${name || "—"}`;
}

// ─── Form Dialog ───────────────────────────────────────────────────────────────
function TicketFormDialog({ open, onClose, onSaved, ticket, currentUser }) {
  const isEdit = !!ticket;
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    toType: "",
    toId: "",
    subject: "",
    body: "",
    status: "PENDING",
  });
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ticket) {
      setForm({
        date:
          ticket.createdAt?.slice(0, 10) ||
          new Date().toISOString().slice(0, 10),
        toType: ticket.toType || "",
        toId: ticket.toId || "",
        subject: ticket.subject || "",
        body: ticket.body || "",
        status: ticket.status || "PENDING",
      });
    } else {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        toType: "",
        toId: "",
        subject: "",
        body: "",
        status: "PENDING",
      });
    }
    setErrors({});
  }, [ticket, open]);

  useEffect(() => {
    if (!form.toType) {
      setOptions([]);
      if (!isEdit) setForm((p) => ({ ...p, toId: "" }));
      return;
    }
    const load = async () => {
      try {
        let res;
        if (form.toType === "NETWORK")
          res = await networksApi.getAll({ size: 200 });
        if (form.toType === "DEALER")
          res = await dealersApi.getAll({ size: 500 });
        if (form.toType === "SUBDEALER")
          res = await subdealersApi.getAll({ size: 500 });
        setOptions(res?.data?.content ?? []);
      } catch {
        setOptions([]);
      }
    };
    load();
  }, [form.toType, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.toType) e.toType = "Υποχρεωτικό";
    if (!form.toId) e.toId = "Υποχρεωτικό";
    if (!form.subject) e.subject = "Υποχρεωτικό";
    if (!form.body) e.body = "Υποχρεωτικό";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        fromType: "ADMIN",
        fromId: currentUser?.id,
        toType: form.toType,
        toId: form.toId,
        subject: form.subject,
        body: form.body,
      };
      if (isEdit) await ticketsApi.update(ticket.id, payload);
      else await ticketsApi.create(payload);
      onSaved();
    } catch (err) {
      setErrors({ global: err.response?.data?.error || "Σφάλμα αποθήκευσης" });
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: "0.5px solid #e5e7eb" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
          {isEdit ? "Επεξεργασία αιτήματος" : "Νέο αίτημα"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {errors.global && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.global}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography
              sx={{
                fontSize: 12,
                color: errors.toType ? "#ef4444" : "#374151",
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Αίτημα προς (τύπος) <span style={{ color: "#ef4444" }}>*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              value={form.toType}
              error={!!errors.toType}
              sx={inputSx}
              onChange={(e) => {
                setForm((p) => ({ ...p, toType: e.target.value, toId: "" }));
                setErrors((p) => ({ ...p, toType: "" }));
              }}
            >
              {ENTITY_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              sx={{
                fontSize: 12,
                color: errors.toId ? "#ef4444" : "#374151",
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Επωνυμία <span style={{ color: "#ef4444" }}>*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              value={form.toId}
              error={!!errors.toId}
              disabled={!form.toType}
              sx={inputSx}
              onChange={(e) => {
                setForm((p) => ({ ...p, toId: e.target.value }));
                setErrors((p) => ({ ...p, toId: "" }));
              }}
            >
              {options.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.eponymia}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <Typography
              sx={{
                fontSize: 12,
                color: errors.subject ? "#ef4444" : "#374151",
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Θέμα <span style={{ color: "#ef4444" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={form.subject}
              error={!!errors.subject}
              sx={inputSx}
              onChange={(e) => {
                setForm((p) => ({ ...p, subject: e.target.value }));
                setErrors((p) => ({ ...p, subject: "" }));
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography
              sx={{
                fontSize: 12,
                color: errors.body ? "#ef4444" : "#374151",
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Αίτημα <span style={{ color: "#ef4444" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              size="small"
              value={form.body}
              error={!!errors.body}
              sx={inputSx}
              onChange={(e) => {
                setForm((p) => ({ ...p, body: e.target.value }));
                setErrors((p) => ({ ...p, body: "" }));
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "0.5px solid #e5e7eb" }}>
        <Button size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
          Άκυρο
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          sx={{ background: "#1f6feb", "&:hover": { background: "#1a5fd6" } }}
        >
          {loading ? "Αποθήκευση..." : isEdit ? "Αποθήκευση" : "Αποστολή"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RequestsPage() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  // ── Filters — all passed to backend, no client-side filtering ──────────────
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [viewTicket, setViewTicket] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formTicket, setFormTicket] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // ── Server-side fetch — filters go as query params ─────────────────────────
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size: PER_PAGE,
        ...(filterStatus && { status: filterStatus }),
        ...(filterDateFrom && { dateFrom: filterDateFrom }),
        ...(filterDateTo && { dateTo: filterDateTo }),
      };
      const res = await ticketsApi.getAll(params);
      setTickets(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterDateFrom, filterDateTo]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset page when filter changes
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setPage(0);
  };

  const handleComplete = async (id) => {
    try {
      await ticketsApi.complete(id);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "DONE" } : t)),
      );
      setViewOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || "Σφάλμα");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Διαγραφή αιτήματος;")) return;
    try {
      await ticketsApi.delete(id);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.error || "Σφάλμα");
    }
  };

  const hasFilters = filterStatus || filterDateFrom || filterDateTo;
  const pendingCount = tickets.filter((t) => t.status === "PENDING").length;

  const thStyle = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 500,
    borderBottom: "0.5px solid #e5e7eb",
    whiteSpace: "nowrap",
    background: "#fafafa",
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}
            >
              Αιτήματα
            </Typography>
            {pendingCount > 0 && (
              <Chip
                label={`${pendingCount} εκκρεμή`}
                size="small"
                sx={{ background: "#fee2e2", color: "#991b1b", fontSize: 11 }}
              />
            )}
          </Box>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            {total} σύνολο εγγραφών
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormTicket(null);
            setFormOpen(true);
          }}
          sx={{
            background: "#1f6feb",
            "&:hover": { background: "#1a5fd6" },
            fontWeight: 600,
          }}
        >
          Νέο αίτημα
        </Button>
      </Box>

      {/* Filters — server-side */}
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
            label="Από ημερομηνία"
            type="date"
            size="small"
            value={filterDateFrom}
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            onChange={(e) =>
              handleFilterChange(setFilterDateFrom)(e.target.value)
            }
            sx={{ minWidth: 165 }}
          />
          <TextField
            label="Έως ημερομηνία"
            type="date"
            size="small"
            value={filterDateTo}
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            onChange={(e) =>
              handleFilterChange(setFilterDateTo)(e.target.value)
            }
            sx={{ minWidth: 165 }}
          />
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel>Κατάσταση</InputLabel>
            <Select
              value={filterStatus}
              label="Κατάσταση"
              onChange={(e) =>
                handleFilterChange(setFilterStatus)(e.target.value)
              }
            >
              <MenuItem value="">Όλα</MenuItem>
              {STATUS_OPTIONS.map((o) => (
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

      {/* Table */}
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
                <tr>
                  <th style={thStyle}>Ημερομηνία</th>
                  <th style={thStyle}>Αίτημα από</th>
                  <th style={thStyle}>Αίτημα προς</th>
                  <th style={thStyle}>Θέμα</th>
                  <th style={thStyle}>Κατάσταση</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 32,
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 13,
                      }}
                    >
                      Δεν βρέθηκαν αιτήματα
                    </td>
                  </tr>
                ) : (
                  tickets.map((t, idx) => {
                    const fromC =
                      entityColors[t.fromType] || entityColors.ADMIN;
                    const toC = entityColors[t.toType] || entityColors.ADMIN;
                    return (
                      <tr
                        key={t.id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 16px",
                            fontSize: 12,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.createdAt?.slice(0, 10)}
                        </td>
                        <td style={{ padding: "8px 16px" }}>
                          <Chip
                            size="small"
                            label={formatFrom(t.fromType, t.fromName)}
                            sx={{
                              background: fromC.bg,
                              color: fromC.color,
                              fontSize: 11,
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 16px" }}>
                          <Chip
                            size="small"
                            label={formatFrom(t.toType, t.toName)}
                            sx={{
                              background: toC.bg,
                              color: toC.color,
                              fontSize: 11,
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "8px 16px",
                            fontSize: 13,
                            color: "#111827",
                            maxWidth: 300,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 260,
                            }}
                          >
                            {t.subject}
                          </Typography>
                        </td>
                        <td style={{ padding: "8px 16px" }}>
                          <Chip
                            size="small"
                            label={
                              t.status === "PENDING"
                                ? "Εκκρεμεί"
                                : "Ολοκληρώθηκε"
                            }
                            icon={
                              t.status === "PENDING" ? (
                                <PendingIcon />
                              ) : (
                                <CheckCircleIcon />
                              )
                            }
                            sx={{
                              background:
                                t.status === "PENDING" ? "#fef3c7" : "#dcfce7",
                              color:
                                t.status === "PENDING" ? "#b45309" : "#166534",
                              fontSize: 11,
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "4px 16px",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Tooltip title="Προβολή">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setViewTicket(t);
                                setViewOpen(true);
                              }}
                              sx={{ color: "#6b7280" }}
                            >
                              <Avatar
                                sx={{
                                  width: 22,
                                  height: 22,
                                  background: "#f3f4f6",
                                  color: "#374151",
                                  fontSize: 12,
                                }}
                              >
                                👁
                              </Avatar>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Επεξεργασία">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setFormTicket(t);
                                setFormOpen(true);
                              }}
                              sx={{ color: "#6b7280" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Διαγραφή">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(t.id)}
                              sx={{ color: "#ef4444" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        perPage={PER_PAGE}
        onPageChange={setPage}
        standalone
      />

      <TicketViewDialog
        ticket={viewTicket}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        onComplete={handleComplete}
      />
      <TicketFormDialog
        open={formOpen}
        ticket={formTicket}
        currentUser={user}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          fetchTickets();
        }}
      />
    </Box>
  );
}

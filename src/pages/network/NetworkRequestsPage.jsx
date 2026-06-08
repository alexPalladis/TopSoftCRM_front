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
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import { ticketsApi } from "../../services/tickets";
import { useAuth } from "../../context/AuthContext";
import { dealersApi } from "../../services/dealers";
import { subdealersApi } from "../../services/subdealers";
import { networksApi } from "../../services/networks";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Σε εκκρεμότητα" },
  { value: "DONE", label: "Ολοκληρώθηκε" },
];

const ENTITY_OPTIONS = [
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

function formatEntity(type, name) {
  return `${entityLabels[type] || type}, ${name || "—"}`;
}

// ─── View Dialog (unchanged) ──────────────────────────────────
function TicketViewDialog({ ticket, open, onClose, onComplete, canAct }) {
  if (!ticket) return null;
  const fromColors = entityColors[ticket.fromType] || entityColors.NETWORK;
  const toColors = entityColors[ticket.toType] || entityColors.NETWORK;

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
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            {ticket.subject}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            {ticket.createdAt?.slice(0, 10)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={
              ticket.status === "PENDING" ? "Σε εκκρεμότητα" : "Ολοκληρώθηκε"
            }
            size="small"
            icon={
              ticket.status === "PENDING" ? (
                <PendingIcon />
              ) : (
                <CheckCircleIcon />
              )
            }
            sx={{
              background: ticket.status === "PENDING" ? "#fef3c7" : "#dcfce7",
              color: ticket.status === "PENDING" ? "#d97706" : "#166534",
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
        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
          {[
            {
              label: "Αίτημα από",
              colors: fromColors,
              name: ticket.fromName,
              type: ticket.fromType,
            },
            {
              label: "Αίτημα προς",
              colors: toColors,
              name: ticket.toName,
              type: ticket.toType,
            },
          ].map((side, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                background: "#f9fafb",
                border: "0.5px solid #e5e7eb",
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  mb: 0.8,
                }}
              >
                {side.label}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 26,
                    height: 26,
                    background: side.colors.bg,
                    color: side.colors.color,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {side.name?.charAt(0)}
                </Avatar>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 500, color: "#111827" }}
                >
                  {formatEntity(side.type, side.name)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            background: "#f9fafb",
            border: "0.5px solid #e5e7eb",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              mb: 1,
            }}
          >
            Αίτημα
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
            {ticket.body}
          </Typography>
        </Box>
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
        {canAct && ticket.status === "PENDING" && (
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => onComplete(ticket.id)}
            sx={{ background: "#16a34a", "&:hover": { background: "#15803d" } }}
          >
            Ολοκλήρωση
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Form Dialog (unchanged) ──────────────────────────────────
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
      return;
    }
    const fetch = async () => {
      try {
        let res;
        if (form.toType === "NETWORK") res = await networksApi.getLookup();
        if (form.toType === "DEALER") res = await dealersApi.getLookup();
        if (form.toType === "SUBDEALER") res = await subdealersApi.getLookup();
        setOptions(res.data.map((e) => ({ value: e.id, label: e.eponymia })));
      } catch {}
    };
    fetch();
  }, [form.toType]);

  const validate = () => {
    const e = {};
    if (!form.toType) e.toType = "Υποχρεωτικό";
    if (!form.toId) e.toId = "Υποχρεωτικό";
    if (!form.subject) e.subject = "Υποχρεωτικό";
    if (!form.body) e.body = "Υποχρεωτικό";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        fromType: currentUser?.role || "NETWORK",
        fromId: currentUser?.id,
        toType: form.toType,
        toId: form.toId,
        subject: form.subject,
        body: form.body,
        status: form.status,
      };
      if (isEdit) await ticketsApi.update(ticket.id, payload);
      else await ticketsApi.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Σφάλμα αποθήκευσης");
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
          pb: 1,
        }}
      >
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
          {isEdit ? "Διόρθωση αιτήματος" : "Νέο αίτημα"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{ fontSize: 12, color: "#374151", mb: 0.5, fontWeight: 500 }}
            >
              Ημερομηνία
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{
                ...inputSx,
                "& .MuiOutlinedInput-root": {
                  background: "#fff",
                  color: "#111827",
                  borderRadius: 1.5,
                  fontSize: 13,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              sx={{ fontSize: 12, color: "#374151", mb: 0.5, fontWeight: 500 }}
            >
              Κατάσταση
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                sx={{ borderRadius: 1.5, fontSize: 13 }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography
              sx={{
                fontSize: 12,
                color: errors.toType ? "#ef4444" : "#374151",
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Αίτημα προς <span style={{ color: "#ef4444" }}>*</span>
            </Typography>
            <FormControl fullWidth size="small" error={!!errors.toType}>
              <Select
                value={form.toType}
                displayEmpty
                sx={{ borderRadius: 1.5, fontSize: 13 }}
                onChange={(e) => {
                  setForm((p) => ({ ...p, toType: e.target.value, toId: "" }));
                  setErrors((p) => ({ ...p, toType: "" }));
                }}
              >
                <MenuItem value="">
                  <em>— Επιλογή —</em>
                </MenuItem>
                {ENTITY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.toType && (
              <Typography sx={{ fontSize: 11, color: "#ef4444", mt: 0.3 }}>
                {errors.toType}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={7}>
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
            <FormControl
              fullWidth
              size="small"
              disabled={!form.toType}
              error={!!errors.toId}
            >
              <Select
                value={form.toId}
                displayEmpty
                sx={{ borderRadius: 1.5, fontSize: 13 }}
                onChange={(e) => {
                  setForm((p) => ({ ...p, toId: e.target.value }));
                  setErrors((p) => ({ ...p, toId: "" }));
                }}
              >
                <MenuItem value="">
                  <em>
                    {form.toType ? "— Επιλογή —" : "— Επιλέξτε τύπο πρώτα —"}
                  </em>
                </MenuItem>
                {options.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.toId && (
              <Typography sx={{ fontSize: 11, color: "#ef4444", mt: 0.3 }}>
                {errors.toId}
              </Typography>
            )}
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
          {loading ? "Αποστολή..." : isEdit ? "Αποθήκευση" : "Αποστολή"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const PER_PAGE = 10;

export default function NetworkRequestsPage() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  // ── Filters — all sent to the backend, no client-side filtering ───────────
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [viewTicket, setViewTicket] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [formTicket, setFormTicket] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  /*
   * fetchTickets passes all active filters as query params to the backend.
   * The backend (TicketRepository.findByEntityFiltered) handles:
   *   - ownership filter (fromId OR toId = current user)
   *   - status filter
   *   - date range filter
   *   - pagination
   *
   * Pagination numbers shown to the user are now correct because totalElements
   * comes from the already-filtered database count, not the raw total.
   */
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

  // Reset to page 0 whenever a filter changes so we don't land on a
  // non-existent page (e.g. was on page 3, filter returns only 1 page)
  const handleFilterChange = (setter) => (value) => {
    setter(value);
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

  const clearFilters = () => {
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setPage(0);
  };

  const hasFilters = filterStatus || filterDateFrom || filterDateTo;

  // pendingCount is derived from the current (filtered or unfiltered) results.
  // When no status filter is active it reflects the true pending count on screen.
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
                label={`${pendingCount} σε εκκρεμότητα`}
                size="small"
                sx={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Typography sx={{ fontSize: 13, color: "#9ca3af" }}>
            Αιτήματα που στείλατε ή σας απευθύνονται
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormTicket(null);
            setFormOpen(true);
          }}
          sx={{
            background: "#1f6feb",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { background: "#1a5fd6" },
          }}
        >
          ΝΕΟ ΑΙΤΗΜΑ
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters — values go to backend, not JS array.filter() */}
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
            label="Από ημερομηνία"
            type="date"
            value={filterDateFrom}
            onChange={(e) =>
              handleFilterChange(setFilterDateFrom)(e.target.value)
            }
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                background: "#fff",
                color: "#111827",
                borderRadius: 1.5,
              },
            }}
          />
          <TextField
            size="small"
            label="Έως ημερομηνία"
            type="date"
            value={filterDateTo}
            onChange={(e) =>
              handleFilterChange(setFilterDateTo)(e.target.value)
            }
            slotProps={{
              inputLabel: { shrink: true },
              input: { notched: true },
            }}
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                background: "#fff",
                color: "#111827",
                borderRadius: 1.5,
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel>Κατάσταση</InputLabel>
            <Select
              value={filterStatus}
              label="Κατάσταση"
              sx={{ borderRadius: 1.5 }}
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
                  <th style={thStyle}>Αίτημα</th>
                  <th style={thStyle}>Κατάσταση</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
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
                  tickets.map((t) => {
                    const isMine = t.fromId === user?.id;
                    return (
                      <tr
                        key={t.id}
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
                            fontSize: 12,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.createdAt?.slice(0, 10)}
                        </td>
                        <td
                          style={{
                            padding: "11px 16px",
                            fontSize: 12,
                            color: "#374151",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatEntity(t.fromType, t.fromName)}
                          {isMine && (
                            <Chip
                              label="εγώ"
                              size="small"
                              sx={{
                                ml: 0.5,
                                fontSize: 10,
                                height: 16,
                                background: "#ede9fe",
                                color: "#6d28d9",
                              }}
                            />
                          )}
                        </td>
                        <td
                          style={{
                            padding: "11px 16px",
                            fontSize: 12,
                            color: "#374151",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatEntity(t.toType, t.toName)}
                        </td>
                        <td style={{ padding: "11px 16px", maxWidth: 160 }}>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#111827",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 160,
                            }}
                          >
                            {t.subject}
                          </Typography>
                        </td>
                        <td style={{ padding: "11px 16px", maxWidth: 200 }}>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#6b7280",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 200,
                            }}
                          >
                            {t.body}
                          </Typography>
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <Chip
                            label={
                              t.status === "PENDING"
                                ? "Σε εκκρεμότητα"
                                : "Ολοκληρώθηκε"
                            }
                            size="small"
                            sx={{
                              fontSize: 11,
                              height: 22,
                              background:
                                t.status === "PENDING" ? "#fef3c7" : "#dcfce7",
                              color:
                                t.status === "PENDING" ? "#d97706" : "#166534",
                            }}
                          />
                        </td>
                        <td
                          style={{ padding: "11px 16px", whiteSpace: "nowrap" }}
                        >
                          <Tooltip title="Προβολή">
                            <IconButton
                              size="small"
                              sx={{
                                color: "#9ca3af",
                                "&:hover": { color: "#1f6feb" },
                              }}
                              onClick={() => {
                                setViewTicket({ ...t, isMine });
                                setViewOpen(true);
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          {isMine && (
                            <>
                              <Tooltip title="Διόρθωση">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#9ca3af",
                                    "&:hover": { color: "#f59e0b" },
                                  }}
                                  onClick={() => {
                                    setFormTicket(t);
                                    setFormOpen(true);
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Διαγραφή">
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: "#9ca3af",
                                    "&:hover": { color: "#ef4444" },
                                  }}
                                  onClick={() => handleDelete(t.id)}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
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

      <TicketViewDialog
        ticket={viewTicket}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        onComplete={handleComplete}
        canAct={viewTicket?.toId === user?.id}
      />
      <TicketFormDialog
        ticket={formTicket}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchTickets}
        currentUser={user}
      />
    </Box>
  );
}

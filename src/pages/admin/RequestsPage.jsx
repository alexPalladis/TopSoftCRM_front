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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PendingIcon from "@mui/icons-material/Pending";
import { ticketsApi } from "../../services/tickets";
import { useAuth } from "../../context/AuthContext";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";
import { subdealersApi } from "../../services/subdealers";

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

function formatEntityLabel(type, name) {
  return `${entityLabels[type] || type}, ${name}`;
}

function TicketDialog({ ticket, open, onClose, onStatusChange }) {
  if (!ticket) return null;
  const fromColors = entityColors[ticket.fromType] || entityColors.ADMIN;
  const toColors = entityColors[ticket.toType] || entityColors.ADMIN;
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
            {ticket.createdAt}
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
          <Box
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
              Αίτημα από
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  background: fromColors.bg,
                  color: fromColors.color,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {ticket.fromName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 500, color: "#111827" }}
                >
                  {formatEntityLabel(ticket.fromType, ticket.fromName)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#9ca3af",
              fontSize: 18,
            }}
          >
            →
          </Box>
          <Box
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
              Αίτημα προς
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  background: toColors.bg,
                  color: toColors.color,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {ticket.toName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 500, color: "#111827" }}
                >
                  {formatEntityLabel(ticket.toType, ticket.toName)}
                </Typography>
              </Box>
            </Box>
          </Box>
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
        {ticket.status === "PENDING" && (
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => onStatusChange(ticket.id)}
            sx={{ background: "#16a34a", "&:hover": { background: "#15803d" } }}
          >
            Ολοκλήρωση
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function NewTicketDialog({ open, onClose, onCreated, currentUser }) {
  const [toType, setToType] = useState("");
  const [toId, setToId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toType) {
      setOptions([]);
      setToId("");
      return;
    }
    const fetch = async () => {
      try {
        let res;
        if (toType === "NETWORK") res = await networksApi.getAll({ size: 100 });
        if (toType === "DEALER") res = await dealersApi.getAll({ size: 100 });
        if (toType === "SUBDEALER")
          res = await subdealersApi.getAll({ size: 100 });
        setOptions(
          res.data.content.map((e) => ({ value: e.id, label: e.eponymia })),
        );
      } catch {}
    };
    fetch();
  }, [toType]);

  const handleSubmit = async () => {
    if (!toType || !toId || !subject || !body) return;
    setLoading(true);
    try {
      await ticketsApi.create({
        fromType: currentUser?.role,
        fromId: currentUser?.id,
        toType,
        toId,
        subject,
        body,
      });
      onCreated();
      onClose();
      setToType("");
      setToId("");
      setSubject("");
      setBody("");
    } catch (err) {
      alert(err.response?.data?.error || "Σφάλμα αποστολής");
    } finally {
      setLoading(false);
    }
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
        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
          Νέο αίτημα
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Αίτημα προς</InputLabel>
            <Select
              value={toType}
              label="Αίτημα προς"
              onChange={(e) => {
                setToType(e.target.value);
                setToId("");
              }}
            >
              <MenuItem value="NETWORK">Network</MenuItem>
              <MenuItem value="DEALER">Dealer</MenuItem>
              <MenuItem value="SUBDEALER">SubDealer</MenuItem>
            </Select>
          </FormControl>
          {toType && (
            <FormControl size="small" fullWidth>
              <InputLabel>Επωνυμία</InputLabel>
              <Select
                value={toId}
                label="Επωνυμία"
                onChange={(e) => setToId(e.target.value)}
              >
                {options.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            size="small"
            fullWidth
            label="Θέμα"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <TextField
            fullWidth
            label="Αίτημα"
            multiline
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            size="small"
          />
        </Stack>
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
          {loading ? "Αποστολή..." : "Αποστολή"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function RequestsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const PER_PAGE = 10;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ticketsApi.getAll({ page, size: PER_PAGE });
      setTickets(res.data.content);
      setTotal(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch {
      setError("Σφάλμα φόρτωσης δεδομένων");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleStatusChange = async (id) => {
    try {
      await ticketsApi.complete(id);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "DONE" } : t)),
      );
      setDialogOpen(false);
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

  const filtered = tickets.filter((t) => {
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchFrom = !filterDateFrom || t.createdAt >= filterDateFrom;
    const matchTo = !filterDateTo || t.createdAt <= filterDateTo + "T23:59:59";
    return matchStatus && matchFrom && matchTo;
  });

  const pendingCount = tickets.filter((t) => t.status === "PENDING").length;

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
            {total} εγγραφές
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewOpen(true)}
          sx={{
            background: "#1f6feb",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { background: "#1a5fd6" },
          }}
        >
          Νέο αίτημα
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
            label="Από ημερομηνία"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                color: "#111827",
                background: "#fff",
              },
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: "invert(0)",
                opacity: 0.6,
                cursor: "pointer",
              },
            }}
          />

          <TextField
            size="small"
            label="Έως ημερομηνία"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 170,
              "& .MuiOutlinedInput-root": {
                color: "#111827",
                background: "#fff",
              },
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: "invert(0)",
                opacity: 0.6,
                cursor: "pointer",
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Κατάσταση</InputLabel>
            <Select
              value={filterStatus}
              label="Κατάσταση"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">Όλα</MenuItem>
              <MenuItem value="PENDING">Σε εκκρεμότητα</MenuItem>
              <MenuItem value="DONE">Ολοκληρώθηκε</MenuItem>
            </Select>
          </FormControl>
          {(filterStatus || filterDateFrom || filterDateTo) && (
            <Button
              size="small"
              onClick={() => {
                setFilterStatus("");
                setFilterDateFrom("");
                setFilterDateTo("");
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
                  {[
                    "Ημερομηνία",
                    "Αίτημα από",
                    "Αίτημα προς",
                    "Θέμα",
                    "Αίτημα",
                    "Κατάσταση",
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
                {filtered.length === 0 ? (
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
                  filtered.map((t) => (
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
                        {t.createdAt?.slice(0, 16).replace("T", " ")}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 12,
                          color: "#374151",
                        }}
                      >
                        {formatEntityLabel(t.fromType, t.fromName)}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 12,
                          color: "#374151",
                        }}
                      >
                        {formatEntityLabel(t.toType, t.toName)}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#111827",
                          maxWidth: 160,
                        }}
                      >
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
                      <td
                        style={{
                          padding: "11px 16px",
                          fontSize: 12,
                          color: "#6b7280",
                          maxWidth: 200,
                        }}
                      >
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
                      <td style={{ padding: "11px 16px" }}>
                        <Tooltip title="Προβολή">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelected(t);
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
                        {t.status === "PENDING" && (
                          <Tooltip title="Ολοκλήρωση">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(t.id)}
                              sx={{
                                color: "#9ca3af",
                                "&:hover": { color: "#16a34a" },
                              }}
                            >
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Διαγραφή">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(t.id)}
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

      <TicketDialog
        ticket={selected}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStatusChange={handleStatusChange}
      />
      <NewTicketDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={fetchTickets}
        currentUser={user}
      />
    </Box>
  );
}

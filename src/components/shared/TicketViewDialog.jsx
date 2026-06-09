import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";

/**
 * TicketViewDialog — shared across ALL roles
 *
 * Uses MUI theme tokens (color: "text.primary" etc.) so it works
 * correctly in both light and dark mode without any extra work.
 *
 * Props:
 *   ticket   — ticket object
 *   open     — boolean
 *   onClose  — () => void
 *   onComplete — (id) => void   (mark as done)
 *   canAct   — boolean          (show the complete button)
 */

const entityLabels = {
  ADMIN: "Admin",
  NETWORK: "Network",
  DEALER: "Dealer",
  SUBDEALER: "SubDealer",
};

// Role accent colors — only used for the Avatar, not backgrounds
const avatarColors = {
  ADMIN: { bg: "error.light", color: "error.dark" },
  NETWORK: { bg: "secondary.light", color: "secondary.dark" },
  DEALER: { bg: "primary.light", color: "primary.dark" },
  SUBDEALER: { bg: "warning.light", color: "warning.dark" },
};

function EntityCard({ label, type, name }) {
  const av = avatarColors[type] || avatarColors.DEALER;
  return (
    <Box
      sx={{
        flex: 1,
        border: "0.5px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 1.5,
        bgcolor: "background.default",
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          mb: 0.8,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          sx={{
            width: 26,
            height: 26,
            bgcolor: av.bg,
            color: av.color,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {name?.charAt(0) ?? "?"}
        </Avatar>
        <Typography
          sx={{ fontSize: 12, fontWeight: 500, color: "text.primary" }}
        >
          {entityLabels[type]
            ? `${entityLabels[type]}, ${name || "—"}`
            : name || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TicketViewDialog({
  ticket,
  open,
  onClose,
  onComplete,
  canAct,
}) {
  if (!ticket) return null;

  const isPending = ticket.status === "PENDING";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, border: "0.5px solid", borderColor: "divider" },
      }}
    >
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            sx={{ fontSize: 15, fontWeight: 600, color: "text.primary" }}
          >
            {ticket.subject}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.2 }}>
            {ticket.createdAt?.slice(0, 16).replace("T", " ")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip
            label={isPending ? "Σε εκκρεμότητα" : "Ολοκληρώθηκε"}
            size="small"
            icon={isPending ? <PendingIcon /> : <CheckCircleIcon />}
            sx={{
              background: isPending ? "#fef3c7" : "#dcfce7",
              color: isPending ? "#d97706" : "#166534",
              fontSize: 11,
            }}
          />
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <DialogContent sx={{ pt: 2.5 }}>
        {/* From / To cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
          <EntityCard
            label="Αίτημα από"
            type={ticket.fromType}
            name={ticket.fromName}
          />
          <EntityCard
            label="Αίτημα προς"
            type={ticket.toType}
            name={ticket.toName}
          />
        </Box>

        {/* Body */}
        <Box
          sx={{
            border: "0.5px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            bgcolor: "background.default",
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              mb: 1,
            }}
          >
            Αίτημα
          </Typography>
          <Typography
            sx={{ fontSize: 13, color: "text.primary", lineHeight: 1.7 }}
          >
            {ticket.body}
          </Typography>
        </Box>
      </DialogContent>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "0.5px solid",
          borderColor: "divider",
          justifyContent: "space-between",
        }}
      >
        <Button
          size="small"
          onClick={onClose}
          sx={{ color: "text.secondary", textTransform: "none" }}
        >
          Κλείσιμο
        </Button>
        {canAct && isPending && (
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => {
              onComplete(ticket.id);
              onClose();
            }}
            sx={{
              background: "#16a34a",
              textTransform: "none",
              "&:hover": { background: "#15803d" },
            }}
          >
            Ολοκλήρωση
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

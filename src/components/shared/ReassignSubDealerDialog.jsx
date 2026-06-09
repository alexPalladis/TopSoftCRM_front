import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { subdealersApi } from "../../services/subdealers";
import { customersApi } from "../../services/customers";
import { useAuth } from "../../context/AuthContext";

/**
 * ReassignSubDealerDialog
 *
 * Reusable dialog for reassigning a customer to a different sub-dealer.
 * Used by both CustomersPage (admin) and DealerCustomersPage (dealer).
 *
 * Props:
 *   customer  — { id, eponymia, dealerId, subDealerId }
 *   open      — boolean
 *   onClose   — () => void
 *   onSuccess — () => void  (called after successful save so the list refreshes)
 *
 * NOTE: We intentionally avoid MUI InputLabel + Select inside a Dialog.
 * The floating label system requires specific notch/shrink coordination
 * that breaks reliably when the Select has a pre-filled value on open.
 * A plain <label> above the Select is simpler, cleaner, and never breaks.
 */
export default function ReassignSubDealerDialog({
  customer,
  open,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [subdealers, setSubdealers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !customer) return;

    setSelectedId(customer.subDealerId || "");
    setError("");

    const fetchSubdealers = async () => {
      setLoadingList(true);
      try {
        const res = await subdealersApi.getAll({
          dealerId: customer.dealerId,
          size: 100,
        });
        setSubdealers(res.data.content ?? []);
      } catch {
        setError("Σφάλμα φόρτωσης sub-dealers");
      } finally {
        setLoadingList(false);
      }
    };

    fetchSubdealers();
  }, [open, customer]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await customersApi.reassign(customer.id, {
        subDealerId: selectedId || null,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Σφάλμα κατά την αλλαγή sub-dealer",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: "0.5px solid #e5e7eb" } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SwapHorizIcon sx={{ color: "#1d4ed8", fontSize: 20 }} />
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            Αλλαγή Sub-dealer
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 0.5 }}>
          {customer.eponymia}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loadingList ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box>
            {/* Plain label above — never overlaps the value */}
            <Typography
              component="label"
              htmlFor="reassign-sd-select"
              sx={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "#6b7280",
                mb: 0.75,
                letterSpacing: "0.02em",
              }}
            >
              Sub-dealer
            </Typography>

            <Select
              id="reassign-sd-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              fullWidth
              size="small"
              displayEmpty
              sx={{
                fontSize: 14,
                borderRadius: 1.5,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e5e7eb",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9ca3af",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1f6feb",
                  borderWidth: "1px",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 260, borderRadius: 2, mt: 0.5 },
                },
              }}
            >
              {/* Placeholder shown when nothing is selected */}
              {!selectedId && (
                <MenuItem value="" disabled>
                  <em style={{ color: "#9ca3af" }}>Επιλέξτε sub-dealer...</em>
                </MenuItem>
              )}

              {/* Only admin can remove the subdealer link entirely */}
              {isAdmin && (
                <MenuItem value="">
                  <em style={{ color: "#6b7280" }}>— Χωρίς sub-dealer —</em>
                </MenuItem>
              )}

              {subdealers.map((sd) => (
                <MenuItem key={sd.id} value={sd.id}>
                  {sd.eponymia}
                </MenuItem>
              ))}

              {subdealers.length === 0 && (
                <MenuItem disabled>
                  <em style={{ color: "#9ca3af" }}>Δεν υπάρχουν sub-dealers</em>
                </MenuItem>
              )}
            </Select>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "0.5px solid #e5e7eb" }}>
        <Button
          size="small"
          onClick={onClose}
          sx={{
            color: "#6b7280",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": { background: "#f3f4f6" },
          }}
        >
          Άκυρο
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={saving || loadingList}
          onClick={handleSave}
          sx={{
            background: "#1f6feb",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { background: "#1a5fd6", boxShadow: "none" },
          }}
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

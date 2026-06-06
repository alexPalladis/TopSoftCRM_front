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
  FormControl,
  InputLabel,
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

      <DialogContent sx={{ pt: 2 }}>
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
          <FormControl fullWidth size="small">
            <InputLabel id="reassign-sd-label">Sub-dealer</InputLabel>
            <Select
              labelId="reassign-sd-label"
              value={selectedId}
              label="Sub-dealer"
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {/* Only admin can clear the subdealer link */}
              {isAdmin && (
                <MenuItem value="">
                  <em>— Χωρίς sub-dealer —</em>
                </MenuItem>
              )}
              {subdealers.map((sd) => (
                <MenuItem key={sd.id} value={sd.id}>
                  {sd.eponymia}
                </MenuItem>
              ))}
              {subdealers.length === 0 && (
                <MenuItem disabled>Δεν υπάρχουν sub-dealers</MenuItem>
              )}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "0.5px solid #e5e7eb" }}>
        <Button size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
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
            "&:hover": { background: "#1a5fd6" },
          }}
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

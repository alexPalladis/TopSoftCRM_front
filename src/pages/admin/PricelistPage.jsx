import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Tabs,
  Tab,
  Autocomplete,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { commissionsApi } from "../../services/commissions";
import { dealersApi } from "../../services/dealers";
import { networksApi } from "../../services/networks";

const PRODUCTS = [
  { id: 1, description: "Συνδρομή εφαρμογής" },
  { id: 2, description: "Ενεργός Πάροχος ΗΤ" },
  { id: 3, description: "Σύνδεση POS" },
  { id: 4, description: "Άδεια mobile App" },
  { id: 5, description: "Σύνδεση WooCommerce" },
  { id: 6, description: "Ενεργά SMS" },
  { id: 7, description: "Ενεργά email" },
  { id: 8, description: "Ψηφιακό Πελατολόγιο" },
];

// Sentinel IDs for global defaults (stored in commissions table)
const NETWORK_DEFAULT_ID = "00000010";
const DEALER_DEFAULT_ID = "00000020";

const emptyRows = () =>
  PRODUCTS.map((p) => ({
    productId: p.id,
    description: p.description,
    percentage: "",
    salePrice: "",
  }));

// ─── Reusable editable price table ───────────────────────────────────────────
function PriceTable({ title, color, data, onChange, onSave, saving, loading }) {
  const thStyle = {
    padding: "10px 16px",
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

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "0.5px solid #e5e7eb",
        overflow: "hidden",
        mb: 3,
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.8,
          borderBottom: "0.5px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: color + "10",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
          {title}
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={
            saving ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          disabled={saving || loading}
          onClick={onSave}
          sx={{
            background: color,
            "&:hover": { background: color, filter: "brightness(0.9)" },
            fontWeight: 600,
          }}
        >
          {saving ? "Αποθήκευση..." : "Αποθήκευση"}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Περιγραφή</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Προμήθεια %</th>
                <th style={{ ...thStyle, textAlign: "center" }}>
                  Τιμή Πώλησης €
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={row.productId}
                  style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                >
                  <td
                    style={{
                      padding: "8px 16px",
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    {row.description}
                  </td>
                  <td style={{ padding: "6px 16px", textAlign: "center" }}>
                    <TextField
                      size="small"
                      type="number"
                      value={row.percentage}
                      onChange={(e) =>
                        onChange(i, "percentage", e.target.value)
                      }
                      inputProps={{
                        min: 0,
                        max: 100,
                        step: 0.01,
                        style: { textAlign: "center", width: 80 },
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                    />
                  </td>
                  <td style={{ padding: "6px 16px", textAlign: "center" }}>
                    <TextField
                      size="small"
                      type="number"
                      value={row.salePrice}
                      onChange={(e) => onChange(i, "salePrice", e.target.value)}
                      inputProps={{
                        min: 0,
                        step: 0.01,
                        style: { textAlign: "center", width: 80 },
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Paper>
  );
}

// ─── Tab 0: Global defaults ───────────────────────────────────────────────────
function GlobalTab({ successMsg, setSuccessMsg }) {
  const [loadingNetwork, setLoadingNetwork] = useState(true);
  const [loadingDealer, setLoadingDealer] = useState(true);
  const [error, setError] = useState("");
  const [savingNetwork, setSavingNetwork] = useState(false);
  const [savingDealer, setSavingDealer] = useState(false);

  const [networkData, setNetworkData] = useState(emptyRows());
  const [dealerData, setDealerData] = useState(emptyRows());

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  useEffect(() => {
    commissionsApi
      .getByEntity("NETWORK", NETWORK_DEFAULT_ID)
      .then((res) => {
        const apiRows = res.data.commissions ?? [];
        setNetworkData(
          PRODUCTS.map((p) => {
            const found = apiRows.find((c) => c.productId === p.id);
            return {
              productId: p.id,
              description: p.description,
              percentage:
                found?.percentage != null ? String(found.percentage) : "",
              salePrice:
                found?.salePrice != null ? String(found.salePrice) : "",
            };
          }),
        );
      })
      .catch(() => setError("Σφάλμα φόρτωσης τιμοκαταλόγου Network"))
      .finally(() => setLoadingNetwork(false));

    commissionsApi
      .getByEntity("DEALER", DEALER_DEFAULT_ID)
      .then((res) => {
        const apiRows = res.data.commissions ?? [];
        setDealerData(
          PRODUCTS.map((p) => {
            const found = apiRows.find((c) => c.productId === p.id);
            return {
              productId: p.id,
              description: p.description,
              percentage:
                found?.percentage != null ? String(found.percentage) : "",
              salePrice:
                found?.salePrice != null ? String(found.salePrice) : "",
            };
          }),
        );
      })
      .catch(() => setError("Σφάλμα φόρτωσης τιμοκαταλόγου Dealer"))
      .finally(() => setLoadingDealer(false));
  }, []);

  const handleNetworkChange = (i, field, value) =>
    setNetworkData((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );

  const handleDealerChange = (i, field, value) =>
    setDealerData((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );

  const saveNetwork = async () => {
    setSavingNetwork(true);
    try {
      await commissionsApi.save({
        entityType: "NETWORK",
        entityId: NETWORK_DEFAULT_ID,
        commissions: networkData.map((r) => ({
          productId: r.productId,
          percentage: r.percentage !== "" ? parseFloat(r.percentage) : null,
          salePrice: r.salePrice !== "" ? parseFloat(r.salePrice) : null,
        })),
      });
      showSuccess("Τιμοκατάλογος Network αποθηκεύτηκε.");
    } catch {
      setError("Σφάλμα αποθήκευσης Network");
    } finally {
      setSavingNetwork(false);
    }
  };

  const saveDealer = async () => {
    setSavingDealer(true);
    try {
      await commissionsApi.save({
        entityType: "DEALER",
        entityId: DEALER_DEFAULT_ID,
        commissions: dealerData.map((r) => ({
          productId: r.productId,
          percentage: r.percentage !== "" ? parseFloat(r.percentage) : null,
          salePrice: r.salePrice !== "" ? parseFloat(r.salePrice) : null,
        })),
      });
      showSuccess("Τιμοκατάλογος Dealer αποθηκεύτηκε.");
    } catch {
      setError("Σφάλμα αποθήκευσης Dealer");
    } finally {
      setSavingDealer(false);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <PriceTable
        title="Τιμοκατάλογος Network (προεπιλογή για νέα Networks)"
        color="#3b82f6"
        data={networkData}
        onChange={handleNetworkChange}
        onSave={saveNetwork}
        saving={savingNetwork}
        loading={loadingNetwork}
      />
      <PriceTable
        title="Τιμοκατάλογος Dealer (προεπιλογή για νέους Dealers)"
        color="#22c55e"
        data={dealerData}
        onChange={handleDealerChange}
        onSave={saveDealer}
        saving={savingDealer}
        loading={loadingDealer}
      />
    </>
  );
}

// ─── Tab 1/2: Per-entity override ────────────────────────────────────────────
function EntityOverrideTab({ entityType, color, label }) {
  const [entities, setEntities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tableData, setTableData] = useState(emptyRows());
  const [loadingEnt, setLoadingEnt] = useState(true);
  const [loadingTbl, setLoadingTbl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load entity list once
  useEffect(() => {
    const fetchFn =
      entityType === "NETWORK"
        ? () => networksApi.getAll({ size: 200 })
        : () => dealersApi.getAll({ size: 500 });

    fetchFn()
      .then((res) => setEntities(res.data.content ?? []))
      .catch(() => setError(`Σφάλμα φόρτωσης λίστας ${label}`))
      .finally(() => setLoadingEnt(false));
  }, [entityType, label]);

  // Load commissions when entity is selected
  const loadCommissions = useCallback(
    async (entity) => {
      if (!entity) {
        setTableData(emptyRows());
        return;
      }
      setLoadingTbl(true);
      setError("");
      try {
        const res = await commissionsApi.getByEntity(entityType, entity.id);
        const apiRows = res.data.commissions ?? [];
        setTableData(
          PRODUCTS.map((p) => {
            const found = apiRows.find((c) => c.productId === p.id);
            return {
              productId: p.id,
              description: p.description,
              percentage:
                found?.percentage != null ? String(found.percentage) : "",
              salePrice:
                found?.salePrice != null ? String(found.salePrice) : "",
            };
          }),
        );
      } catch {
        setError("Σφάλμα φόρτωσης τιμοκαταλόγου");
      } finally {
        setLoadingTbl(false);
      }
    },
    [entityType],
  );

  const handleSelect = (entity) => {
    setSelected(entity);
    loadCommissions(entity);
  };

  const handleChange = (i, field, value) =>
    setTableData((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await commissionsApi.save({
        entityType,
        entityId: selected.id,
        commissions: tableData.map((r) => ({
          productId: r.productId,
          percentage: r.percentage !== "" ? parseFloat(r.percentage) : null,
          salePrice: r.salePrice !== "" ? parseFloat(r.salePrice) : null,
        })),
      });
      setSuccess(`Αποθηκεύτηκε για ${selected.eponymia}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Σφάλμα αποθήκευσης");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "0.5px solid #e5e7eb", borderRadius: 2 }}
      >
        <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 1 }}>
          Επιλέξτε {label} για να δείτε / τροποποιήσετε τον τιμοκατάλογό του
        </Typography>
        {loadingEnt ? (
          <CircularProgress size={20} />
        ) : (
          <Autocomplete
            options={entities}
            getOptionLabel={(o) => `${o.eponymia} (${o.id})`}
            value={selected}
            onChange={(_, v) => handleSelect(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder={`Αναζήτηση ${label}...`}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            )}
            sx={{ maxWidth: 500 }}
          />
        )}
      </Paper>

      {selected && (
        <PriceTable
          title={`${label}: ${selected.eponymia}`}
          color={color}
          data={tableData}
          onChange={handleChange}
          onSave={handleSave}
          saving={saving}
          loading={loadingTbl}
        />
      )}

      {!selected && !loadingEnt && (
        <Typography sx={{ color: "#9ca3af", fontSize: 13, mt: 2 }}>
          Επιλέξτε {label} για να εμφανιστεί ο τιμοκατάλογος.
        </Typography>
      )}
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PricelistPage() {
  const [tab, setTab] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography
        sx={{ fontSize: 20, fontWeight: 700, color: "#111827", mb: 3 }}
      >
        Τιμοκατάλογος
      </Typography>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            fontSize: 13,
            textTransform: "none",
            fontWeight: 500,
          },
          "& .Mui-selected": { color: "#1f6feb" },
          "& .MuiTabs-indicator": { background: "#1f6feb" },
        }}
      >
        <Tab label="Προεπιλογές (Global)" />
        <Tab label="Override ανά Network" />
        <Tab label="Override ανά Dealer" />
      </Tabs>

      {tab === 0 && (
        <GlobalTab successMsg={successMsg} setSuccessMsg={setSuccessMsg} />
      )}
      {tab === 1 && (
        <EntityOverrideTab
          entityType="NETWORK"
          color="#3b82f6"
          label="Network"
        />
      )}
      {tab === 2 && (
        <EntityOverrideTab entityType="DEALER" color="#22c55e" label="Dealer" />
      )}
    </Box>
  );
}

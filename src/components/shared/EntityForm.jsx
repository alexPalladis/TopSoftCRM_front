import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";

export function FormSection({ title, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: "#6b7280",
          letterSpacing: "0.06em",
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );
}

export function FormField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  size = 6,
  multiline,
  rows,
  inputProps,
  disabled,
}) {
  return (
    <Grid item xs={12} md={size}>
      <TextField
        fullWidth
        size="small"
        label={label + (required ? " *" : "")}
        name={name}
        value={value || ""}
        onChange={onChange}
        error={!!error}
        helperText={error}
        type={type}
        multiline={multiline}
        rows={rows}
        disabled={disabled}
        inputProps={inputProps}
        sx={{
          "& .MuiFormHelperText-root": { fontSize: 11 },
        }}
      />
    </Grid>
  );
}

export function FormSelect({
  name,
  label,
  value,
  onChange,
  error,
  required,
  size = 6,
  options,
  disabled,
}) {
  return (
    <Grid item xs={12} md={size}>
      <FormControl fullWidth size="small" error={!!error}>
        <InputLabel>{label + (required ? " *" : "")}</InputLabel>
        <Select
          name={name}
          value={value || ""}
          label={label + (required ? " *" : "")}
          onChange={onChange}
          disabled={disabled}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {error && (
          <Typography sx={{ fontSize: 11, color: "#d32f2f", mt: 0.3, ml: 1.5 }}>
            {error}
          </Typography>
        )}
      </FormControl>
    </Grid>
  );
}

export function FormSwitch({ name, label, value, onChange, size = 12 }) {
  return (
    <Grid item xs={12} md={size}>
      <FormControlLabel
        control={
          <Switch
            name={name}
            checked={!!value}
            onChange={(e) =>
              onChange({ target: { name, value: e.target.checked } })
            }
            size="small"
          />
        }
        label={
          <Typography sx={{ fontSize: 13, color: "#374151" }}>
            {label}
          </Typography>
        }
      />
    </Grid>
  );
}

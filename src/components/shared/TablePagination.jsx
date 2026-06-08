import { Box, Stack, Typography } from "@mui/material";

/**
 * Shared pagination bar — used at the bottom of ALL table pages.
 *
 * Two layout modes:
 *  - inline (default): renders inside a Paper's bottom border bar
 *    (total count left, page numbers right)
 *  - standalone: renders below the Paper with centered prev/page/next
 *    (used for wide tables like Commissions that can't fit the bar inside)
 *
 * Props:
 *   page         – current 0-based page index
 *   totalPages   – total number of pages from backend
 *   total        – total number of records (for "X–Y από Z" label)
 *   perPage      – records per page (for range calculation)
 *   onPageChange – callback (newPage: number) => void
 *   standalone   – boolean, default false
 */
export default function TablePagination({
  page,
  totalPages,
  total,
  perPage,
  onPageChange,
  standalone = false,
}) {
  if (totalPages <= 1 && total <= perPage) return null;

  const from = total === 0 ? 0 : page * perPage + 1;
  const to = Math.min((page + 1) * perPage, total);

  const pageNumbers = buildPageNumbers(page, totalPages);

  if (standalone) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.5,
          mt: 2,
        }}
      >
        <PageBtn
          label="←"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        />
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <Typography
              key={`dots-${i}`}
              sx={{ fontSize: 12, color: "#9ca3af", px: 0.5 }}
            >
              …
            </Typography>
          ) : (
            <PageBtn
              key={p}
              label={p + 1}
              active={p === page}
              onClick={() => onPageChange(p)}
            />
          ),
        )}
        <PageBtn
          label="→"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        />
      </Box>
    );
  }

  // Inline — renders inside Paper's bottom bar
  return (
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
        {total === 0 ? "0" : `${from}–${to}`} από {total} εγγραφές
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <PageBtn
          label="←"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        />
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <Typography
              key={`dots-${i}`}
              sx={{ fontSize: 12, color: "#9ca3af", px: 0.5 }}
            >
              …
            </Typography>
          ) : (
            <PageBtn
              key={p}
              label={p + 1}
              active={p === page}
              onClick={() => onPageChange(p)}
            />
          ),
        )}
        <PageBtn
          label="→"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        />
      </Stack>
    </Box>
  );
}

// ─── Single page button ───────────────────────────────────────────────────────
function PageBtn({ label, active = false, disabled = false, onClick }) {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        minWidth: 28,
        height: 28,
        px: 0.5,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        fontWeight: active ? 600 : 400,
        background: active ? "#1f6feb" : "transparent",
        color: active ? "#fff" : "#6b7280",
        border: "0.5px solid",
        borderColor: active ? "#1f6feb" : "#e5e7eb",
        userSelect: "none",
        transition: "background 0.15s",
        "&:hover": disabled || active ? {} : { background: "#f3f4f6" },
      }}
    >
      {label}
    </Box>
  );
}

// ─── Smart page number builder ────────────────────────────────────────────────
// Always shows: first, last, current ±1, with "..." where gaps exist.
// E.g. for page=5, total=10: [0, "...", 4, 5, 6, "...", 9]
function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const always = new Set([0, total - 1, current, current - 1, current + 1]);
  const pages = [...always]
    .filter((p) => p >= 0 && p < total)
    .sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) result.push("...");
    result.push(pages[i]);
  }
  return result;
}

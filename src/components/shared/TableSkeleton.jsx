import { Box, Skeleton } from "@mui/material";

/**
 * TableSkeleton
 *
 * Drop-in skeleton loader για όλες τις λίστες του CRM.
 * Αντικαθιστά τον spinner με animated placeholder rows
 * που μοιάζουν με πραγματικά δεδομένα — η εφαρμογή
 * φαίνεται πιο γρήγορη γιατί ο χρήστης βλέπει δομή αμέσως.
 *
 * Props:
 *   rows    — αριθμός placeholder rows (default: 8)
 *   columns — αριθμός columns (default: 5)
 *   hasAction — αν η τελευταία στήλη είναι action buttons (default: true)
 *
 * Χρήση:
 *   if (loading) return <TableSkeleton rows={10} columns={6} />;
 *
 * Ή μέσα σε Paper:
 *   {loading ? (
 *     <TableSkeleton rows={8} columns={5} />
 *   ) : (
 *     <table>...</table>
 *   )}
 */
export default function TableSkeleton({
  rows = 8,
  columns = 5,
  hasAction = true,
}) {
  // Τελευταία στήλη είναι action (μικρότερη)
  const dataCols = hasAction ? columns - 1 : columns;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${dataCols}, 1fr)${hasAction ? " 80px" : ""}`,
          gap: 0,
          px: 2,
          py: 1.2,
          background: "#fafafa",
          borderBottom: "0.5px solid #e5e7eb",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Box key={i} sx={{ px: 0.5 }}>
            <Skeleton
              variant="text"
              width={
                i === columns - 1 && hasAction
                  ? 40
                  : `${50 + Math.random() * 30}%`
              }
              height={14}
              sx={{ borderRadius: 0.5 }}
            />
          </Box>
        ))}
      </Box>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <Box
          key={rowIdx}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${dataCols}, 1fr)${hasAction ? " 80px" : ""}`,
            gap: 0,
            px: 2,
            py: 0.6,
            borderBottom: rowIdx < rows - 1 ? "0.5px solid #f3f4f6" : "none",
            background: rowIdx % 2 === 0 ? "#fff" : "#fafafa",
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => {
            const isFirst = colIdx === 0;
            const isAction = hasAction && colIdx === columns - 1;
            const isChip = colIdx === columns - (hasAction ? 2 : 1); // last data col = status chip

            return (
              <Box
                key={colIdx}
                sx={{ px: 0.5, py: 0.8, display: "flex", alignItems: "center" }}
              >
                {isAction ? (
                  // Action column: two small circle skeletons (edit + delete)
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Skeleton variant="circular" width={22} height={22} />
                    <Skeleton variant="circular" width={22} height={22} />
                  </Box>
                ) : isChip ? (
                  // Status chip skeleton
                  <Skeleton
                    variant="rounded"
                    width={56}
                    height={20}
                    sx={{ borderRadius: 20 }}
                  />
                ) : isFirst ? (
                  // First col: monospace-ish (AFM or ID) — fixed width
                  <Skeleton
                    variant="text"
                    width={90}
                    height={16}
                    sx={{ borderRadius: 0.5, fontFamily: "monospace" }}
                  />
                ) : (
                  // Regular text column — varies width for realism
                  <Skeleton
                    variant="text"
                    width={`${40 + ((rowIdx * 13 + colIdx * 7) % 40)}%`}
                    height={16}
                    sx={{ borderRadius: 0.5 }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

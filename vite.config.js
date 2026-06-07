import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Output directory (default is 'dist' — matches Dockerfile COPY)
    outDir: "dist",

    // Raise the chunk size warning threshold slightly
    // (MUI is large but tree-shaken; 800KB is acceptable)
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Split vendor libraries into a separate chunk for better caching.
        // Users only re-download vendor.js when dependencies change,
        // not on every app deployment.
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
        },
      },
    },
  },

  // Development proxy — avoids CORS issues during local dev.
  // The browser hits localhost:5173, Vite forwards /api to the Spring Boot server.
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

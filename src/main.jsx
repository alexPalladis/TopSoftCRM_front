import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeModeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import App from "./App.jsx";

/**
 * QueryClient — one instance shared across the entire app.
 *
 * staleTime: 60s  → data is fresh for 60 seconds; no refetch on revisit
 *                   within that window. Dashboard stats and dropdown lists
 *                   benefit most from this.
 * retry: 1        → retry once on error, then show error state.
 *                   Default is 3, which feels slow for a CRM.
 * refetchOnWindowFocus: false → don't refetch when the user switches tabs.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </QueryClientProvider>
  </StrictMode>,
);

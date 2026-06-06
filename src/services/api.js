import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: true, // sends the HttpOnly cookie automatically on every request
  headers: { "Content-Type": "application/json" },
});

// No request interceptor needed — the browser sends the cookie automatically.

// Response interceptor: on 401, try a silent refresh once, then logout.
let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If 401 and we haven't already retried, attempt a silent refresh
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      // Prevent multiple simultaneous refresh calls
      if (isRefreshing) {
        // If already refreshing, just reject — the retry after refresh will cover it
        return Promise.reject(err);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        isRefreshing = false;
        // Cookie has been refreshed — retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Refresh failed (user deactivated, session truly expired) → force logout
        localStorage.removeItem("user"); // only user metadata, no token
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  },
);

export default api;

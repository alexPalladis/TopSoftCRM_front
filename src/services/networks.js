import api from "./api";

export const networksApi = {
  getAll: (params) => api.get("/networks", { params }),
  getLookup: () => api.get("/networks/lookup"), // ← ΝΕΟ
  getById: (id) => api.get(`/networks/${id}`),
  create: (data) => api.post("/networks", data),
  update: (id, data) => api.put(`/networks/${id}`, data),
  delete: (id) => api.delete(`/networks/${id}`),
};

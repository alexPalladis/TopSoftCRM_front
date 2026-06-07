import api from "./api";

export const subdealersApi = {
  getAll: (params) => api.get("/subdealers", { params }),
  getLookup: () => api.get("/subdealers/lookup"), // ← ΝΕΟ
  getById: (id) => api.get(`/subdealers/${id}`),
  create: (data) => api.post("/subdealers", data),
  update: (id, data) => api.put(`/subdealers/${id}`, data),
  delete: (id) => api.delete(`/subdealers/${id}`),
};

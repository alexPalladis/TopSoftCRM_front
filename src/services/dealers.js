import api from "./api";

export const dealersApi = {
  getAll: (params) => api.get("/dealers", { params }),
  getById: (id) => api.get(`/dealers/${id}`),
  create: (data) => api.post("/dealers", data),
  update: (id, data) => api.put(`/dealers/${id}`, data),
  delete: (id) => api.delete(`/dealers/${id}`),
};

import api from "./api";

export const customersApi = {
  getAll: (params) => api.get("/customers", { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  // Reassign customer to a different subdealer.
  // data = { subDealerId: string | null }
  reassign: (id, data) => api.patch(`/customers/${id}/reassign`, data),
};

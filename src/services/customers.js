import api from "./api";

export const customersApi = {
  getAll: (params) => api.get("/customers", { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  reassign: (id, data) => api.patch(`/customers/${id}/reassign`, data),
  // Subscriptions — used in CustomerFormPage edit mode
  getSubscriptions: (id) => api.get(`/customers/${id}/subscriptions`),
  upsertSubscription: (id, data) =>
    api.post(`/customers/${id}/subscriptions`, data),
};

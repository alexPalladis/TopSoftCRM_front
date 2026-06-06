import api from "./api";

export const ticketsApi = {
  // params may include: page, size, status, dateFrom, dateTo
  getAll: (params) => api.get("/tickets", { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post("/tickets", data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  complete: (id) => api.patch(`/tickets/${id}/complete`),
  delete: (id) => api.delete(`/tickets/${id}`),
  pendingCount: () => api.get("/tickets/pending-count"),
};

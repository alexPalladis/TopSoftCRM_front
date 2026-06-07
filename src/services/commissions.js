import api from "./api";

export const commissionsApi = {
  getAllByType: (entityType) =>
    api.get("/commissions", { params: { entityType } }),
  getByEntity: (entityType, entityId) =>
    api.get(`/commissions/${entityType}/${entityId}`),
  save: (data) => api.post("/commissions", data),

  // History
  getHistory: (params) => api.get("/commissions/history", { params }),
  togglePaidDealer: (id) => api.patch(`/commissions/history/${id}/paid-dealer`),
  togglePaidNetwork: (id) =>
    api.patch(`/commissions/history/${id}/paid-network`),
  updateReceipt: (id, receipt) =>
    api.patch(`/commissions/history/${id}/receipt`, { receipt }),
  deleteHistory: (id) => api.delete(`/commissions/history/${id}`),
  exportExcel: (params) =>
    api.get("/commissions/history/export", { params, responseType: "blob" }),
};

// Referral code: GET /api/referral-codes/my
export const referralCodeApi = {
  getMy: () => api.get("/referral-codes/my"),
};

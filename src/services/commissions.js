import api from "./api";

export const commissionsApi = {
  getAllByType: (entityType) =>
    api.get("/commissions", { params: { entityType } }),
  getByEntity: (entityType, entityId) =>
    api.get(`/commissions/${entityType}/${entityId}`),
  save: (data) => api.post("/commissions", data),
};

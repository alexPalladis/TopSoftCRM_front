import api from "./api";

export const productsApi = {
  getAll: () => api.get("/products"),
  getActive: () => api.get("/products/active"),
  toggleActive: (id) => api.patch(`/products/${id}/toggle`),
  updatePrice: (id, price) => api.patch(`/products/${id}/price`, { price }),
};

import api from "./api";

export const profileApi = {
  changePassword: (currentPassword, newPassword) =>
    api.patch("/profile/password", { currentPassword, newPassword }),
};

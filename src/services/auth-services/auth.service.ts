import { asyncHandler } from "@/utils/async-handler";
import api from "../api-client";

export const Login = asyncHandler(async (email, password) => {
  const res = await api.post("/api/user/admin/login", {
    email,
    Password: password,
  });
  return res;
});

export const Logout = asyncHandler(async () => {
  const res = await api.post("/api/user/logout");
  localStorage.clear();
  window.location.href = "/auth/login";
  return res;
});

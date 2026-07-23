import { asyncHandler } from "@/utils/async-handler";
import api from "../api-client";

export const getAllUsers = asyncHandler(async () => {
  const res = await api.get("/api/admin/get-all-users");
  return res;
});

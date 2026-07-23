import { asyncHandler } from "@/utils/async-handler";
import api from "../api-client";

export const getAllAssessments = asyncHandler(async () => {
  const res = await api.get("/api/admin/get-all-assessments");
  return res;
});

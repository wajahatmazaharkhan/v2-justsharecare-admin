import { asyncHandler } from "@/utils/async-handler";
import api from "../api-client";

export const fetchAllCounsellors = asyncHandler(async () => {
  const res = await api.get("/api/counsellor/get-all-counsellors");
  return res.data.data;
});

export const approveCounsellor = asyncHandler(async (id: string) => {
  const res = await api.patch(`/api/counsellor/approve/${id}`);
  return res.data;
});

export const getCounsellorCount = asyncHandler(async () => {
  const res = await api.get("/api/admin/get-counsellor-count");
  return res;
});

export const getPendingVerificationCount = asyncHandler(async () => {
  const res = await api.get("/api/admin/get-pending-verification-count");
  return res;
});

export const getRegisteredCount = asyncHandler(async () => {
  const res = await api.get("/api/admin/get-registered-count");
  return res;
});

export const getTotalAppointments = asyncHandler(async () => {
  const res = await api.get("/api/admin/total-appointments");
  return res;
});

export const getThisMonthRevenue = asyncHandler(async () => {
  const res = await api.get("/api/admin/get-revenue-month");
  return res;
});

export const getCanceledAppointmentsLength = asyncHandler(async () => {
  const res = await api.get("/api/admin/get-canceled-appointments-length");
  return res;
});

export const getLatestCounsellors = asyncHandler(async () => {
  const res = await api.get("/api/admin/latest-counsellors");
  return res;
});

export const getWeeklyRevenue = asyncHandler(async () => {
  const res = await api.get("/api/admin/stats/revenue-weekly");
  return res;
});

export const getAllAppointments = asyncHandler(async () => {
  const res = await api.get("/api/admin/get-all-appointments");
  return res;
});
export const getDetailedAllAppointments = asyncHandler(async () => {
  const res = await api.get("/api/admin/all-appointments");
  return res;
});

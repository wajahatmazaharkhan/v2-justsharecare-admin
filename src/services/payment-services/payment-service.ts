// src/services/payment-service.ts
import { asyncHandler } from "@/utils/async-handler";
import api from "../api-client";

export interface User {
  fullname: string;
  email: string;
  phone_number: string;
}

export interface Counsellor {
  fullname: string;
  email: string;
}

export interface Appointment {
  _id: string;
  user_name: string;
  counsellor_name: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: "chat" | "voice" | "video";
  status: string;
  price: number;
  payment_status: string;
  notes: string;
  user_id: User;
  counsellor_id: Counsellor;
}

export interface Payment {
  payment_id: string;
  razorpay_payment_id: string;
  amount?: number;
  appointment: Appointment | null;
  createdAt: string;
}

export const getAllPayments = asyncHandler(async (search?: string) => {
  const res = await api.get("/api/admin/payments/all", {
    params: { search },
  });
  return res.data as { success: boolean; payments: Payment[] };
});

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAllPayments } from "@/services/payment-services/payment-service";
import type { Payment } from "@/services/payment-services/payment-service";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Prevent race conditions
  const requestIdRef = useRef(0);

  const fetchPayments = async (query?: string) => {
    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      const res = await getAllPayments(query?.trim() || undefined);

      // Ignore outdated responses
      if (currentRequestId !== requestIdRef.current) return;

      if (res.success) {
        setPayments(res.payments || []);
      }
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchPayments();
  }, []);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPayments(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  // 🔥 Local fallback filter (so search still works if backend fails)
  const filteredPayments = useMemo(() => {
    if (!search.trim()) return payments;

    const q = search.toLowerCase();

    return payments.filter((p) => {
      return (
        p.razorpay_payment_id?.toLowerCase().includes(q) ||
        p.appointment?.user_name?.toLowerCase().includes(q) ||
        p.appointment?.counsellor_name?.toLowerCase().includes(q) ||
        p.appointment?.session_type?.toLowerCase().includes(q)
      );
    });
  }, [payments, search]);

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-sm rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Payments</CardTitle>
          <Input
            placeholder="Search by user, counsellor, payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Counsellor</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.payment_id}>
                      <TableCell className="font-medium">
                        {payment.razorpay_payment_id || "—"}
                      </TableCell>

                      <TableCell>
                        {payment.appointment?.user_name || "N/A"}
                      </TableCell>

                      <TableCell>
                        {payment.appointment?.counsellor_name || "N/A"}
                      </TableCell>

                      <TableCell className="capitalize">
                        {payment.appointment?.session_type || "—"}
                      </TableCell>

                      <TableCell>
                        {payment.appointment
                          ? new Date(
                              payment.appointment.scheduled_at,
                            ).toLocaleString()
                          : "—"}
                      </TableCell>

                      <TableCell>
                        ₹{payment.amount ?? payment.appointment?.price ?? 0}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            payment.appointment?.payment_status === "successful"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {payment.appointment?.payment_status ||
                            "No Appointment"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;

/* eslint-disable react-hooks/set-state-in-effect */
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData } from "chart.js";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import formatCurrencyINR from "@/utils/format-currency";
import { useEffect, useState } from "react";
import {
  getAllAppointments,
  getCanceledAppointmentsLength,
  getCounsellorCount,
  getLatestCounsellors,
  getPendingVerificationCount,
  getRegisteredCount,
  getThisMonthRevenue,
  getTotalAppointments,
  getWeeklyRevenue,
} from "@/services/counsellor-services/counsellor.service";
import useTitle from "@/hooks/useTitle";

// Register chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type Counsellor = {
  id: string;
  name: string;
  email: string;
  registered: string;
};

type Appointment = {
  status: "scheduled" | "completed" | "cancelled" | "no-show";
};

export default function AdminDashboard() {
  useTitle("Admin");

  const [count, setCount] = useState<number>();
  const [pendingCount, setPendingCount] = useState<number>();
  const [registeredCount, setRegisteredCount] = useState<number>();
  const [aptCount, setAptCount] = useState<number>();
  const [revenue, setRevenue] = useState<number>();
  const [canceled, setCanceled] = useState<number>();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [weeklyData, setWeeklyData] = useState<ChartData<"line"> | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const getCount = async () => {
    const res = await getCounsellorCount();
    setCount(res.data.data);
  };
  const getPendingCount = async () => {
    const res = await getPendingVerificationCount();
    setPendingCount(res.data.data);
  };
  const getRegisteredCounts = async () => {
    const res = await getRegisteredCount();
    setRegisteredCount(res.data.data);
  };
  const getAppointmentCounts = async () => {
    const res = await getTotalAppointments();
    setAptCount(res.data.data);
  };
  const monthlyRevenue = async () => {
    const res = await getThisMonthRevenue();
    setRevenue(res.data.data);
  };
  const getCanceledLength = async () => {
    const res = await getCanceledAppointmentsLength();
    setCanceled(res.data.data);
  };
  const getRecentCounsellors = async () => {
    const res = await getLatestCounsellors();
    setCounsellors(res.data.data);
  };
  const fetchWeeklyRevenue = async () => {
    const res = await getWeeklyRevenue();
    setWeeklyData(res.data.data);
  };
  const fetchAllappointments = async () => {
    const res = await getAllAppointments();
    setAppointments(res.data.data);
  };

  useEffect(() => {
    getCount();
    getPendingCount();
    getRegisteredCounts();
    getAppointmentCounts();
    monthlyRevenue();
    getCanceledLength();
    getRecentCounsellors();
    fetchWeeklyRevenue();
    fetchAllappointments();
  }, []);

  return (
    <div>
      <div className="p-6 space-y-6">
        <SummaryCards
          count={count ?? 0}
          pending={pendingCount ?? 0}
          registeredCount={registeredCount ?? 0}
          apts={aptCount ?? 0}
          monthlyRevenue={revenue ?? 0}
          canceled={canceled ?? 0}
        />

        <NewCounsellors counsellors={counsellors} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart weeklyData={weeklyData} />
          <AppointmentStats appointments={appointments} />
        </div>
      </div>
    </div>
  );
}

/* ================= SUMMARY CARDS ================= */

function SummaryCards({
  count,
  pending,
  registeredCount,
  apts,
  monthlyRevenue,
  canceled,
}: {
  count: number;
  pending: number;
  registeredCount: number;
  apts: number;
  monthlyRevenue: number;
  canceled: number;
}) {
  const summaryData = [
    { title: "Total Counsellors", value: count },
    { title: "Pending Verifications", value: pending },
    { title: "Verified Users", value: registeredCount },
    { title: "Total Appointments", value: apts },
    {
      title: "Revenue (This Month)",
      value: monthlyRevenue ? formatCurrencyINR(monthlyRevenue) : 0,
    },
    { title: "Cancellations", value: canceled ?? 0 },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {summaryData.map((item) => (
        <Card key={item.title}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{item.value}</CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ================= NEW COUNSELLORS ================= */

function NewCounsellors({ counsellors }: { counsellors: Counsellor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Newly Applied Counsellors</CardTitle>
      </CardHeader>
      <CardContent>
        {counsellors.map((c) => (
          <div
            key={c.id}
            className="flex justify-between items-center py-3 border-b last:border-0"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.email}</p>
            </div>
            <div className="text-sm text-muted-foreground">{c.registered}</div>
            <Button variant="outline" size="sm">
              View
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ================= REVENUE CHART ================= */

function RevenueChart({
  weeklyData,
}: {
  weeklyData: ChartData<"line"> | null;
}) {
  if (!weeklyData) return <p>Loading chart...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <Line data={weeklyData} />
      </CardContent>
    </Card>
  );
}

/* ================= APPOINTMENT STATS ================= */

function AppointmentStats({ appointments }: { appointments: Appointment[] }) {
  const stats = {
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    "no-show": 0,
  };

  appointments?.forEach((apt) => {
    if (apt.status === "scheduled") stats.scheduled++;
    if (apt.status === "completed") stats.completed++;
    if (apt.status === "cancelled") stats.cancelled++;
    if (apt.status === "no-show") stats["no-show"]++;
  });

  const appointmentStats = {
    labels: ["Scheduled", "Completed", "Cancelled", "No-show"],
    datasets: [
      {
        label: "Appointments",
        data: [
          stats.scheduled,
          stats.completed,
          stats.cancelled,
          stats["no-show"],
        ],
        backgroundColor: ["#60a5fa", "#4ade80", "#facc15", "#f87171"],
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={appointmentStats} />
      </CardContent>
    </Card>
  );
}

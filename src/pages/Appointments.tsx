import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { getDetailedAllAppointments } from "@/services/counsellor-services/counsellor.service";

// ================= TYPES =================
interface User {
  _id: string;
  fullname: string;
  email: string;
  status: string;
  isVerified: boolean;
}

interface Counsellor {
  _id: string;
  fullname: string;
  counselling_type: string;
  years_experience: number;
  rating: number;
  status: string;
}

export interface Appointment {
  _id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  price: number;
  payment_status: string;
  counsellor_approved: boolean;
  reminderSent: boolean;
  user: User;
  counsellor: Counsellor;
}

const ITEMS_PER_PAGE = 10;

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await getDetailedAllAppointments();
        setAppointments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return appointments.filter((a) =>
      [
        a.user.fullname,
        a.user.email,
        a.counsellor.fullname,
        a.status,
        a.session_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [appointments, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "cancelled":
      case "no-show":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search user, counsellor, status..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-xl overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Counsellor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Approved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((a) => (
              <TableRow key={a._id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{a.user.fullname}</span>
                    <span className="text-xs text-muted-foreground">
                      {a.user.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{a.counsellor.fullname}</TableCell>
                <TableCell>{a.counsellor.counselling_type}</TableCell>
                <TableCell>{a.counsellor.years_experience} yrs</TableCell>
                <TableCell>{a.session_type}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(a.status)}>{a.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{a.payment_status}</Badge>
                </TableCell>
                <TableCell className="font-medium">₹{a.price}</TableCell>
                <TableCell>{a.duration_minutes}m</TableCell>
                <TableCell>{formatDate(a.scheduled_at)}</TableCell>
                <TableCell>{a.counsellor_approved ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center items-center gap-4 pt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

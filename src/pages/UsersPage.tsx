"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "@/services/user-services/user.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  User,
  Shield,
  Globe,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";

const FALLBACK_AVATAR = "/avatar.png";
const ROWS_PER_PAGE = 10;

/* ---------------- TYPES ---------------- */

interface UserType {
  _id: string;
  fullname: string;
  email: string;
  phone_number?: string;
  role: "admin" | "user" | "counsellor";
  gender?: string;
  dob?: string | null;
  timezone?: string;
  preferred_language?: string;
  status: "active" | "inactive";
  isVerified: boolean;
  profilePic?: string | null;
  createdAt: string;
  last_login?: string;
}

interface ApiResponse {
  data: UserType[];
}

/* ---------------- BADGES ---------------- */

const RoleBadge = ({ role }: { role: string }) => {
  const styles: any = {
    admin: "bg-red-100 text-red-700",
    counsellor: "bg-blue-100 text-blue-700",
    user: "bg-gray-100 text-gray-700",
  };
  return <Badge className={styles[role]}>{role}</Badge>;
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge variant={status === "active" ? "default" : "secondary"}>
    {status}
  </Badge>
);

const VerifiedBadge = ({ verified }: { verified: boolean }) =>
  verified ? (
    <Badge className="bg-green-600">
      <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
    </Badge>
  ) : (
    <Badge variant="secondary">
      <Clock className="w-3 h-3 mr-1" /> Unverified
    </Badge>
  );

/* ---------------- MAIN ---------------- */

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selected, setSelected] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();

      const usersArray = res?.data?.data;

      if (!Array.isArray(usersArray)) {
        throw new Error("Users data is not array");
      }

      setUsers(usersArray);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    const q = search.toLowerCase();

    return users.filter(
      (u) =>
        u.fullname?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.timezone?.toLowerCase().includes(q),
    );
  }, [users, search]);

  // Pagination now works on filtered users
  const totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredUsers.slice(start, start + ROWS_PER_PAGE);
  }, [page, filteredUsers]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Platform Users</CardTitle>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search by name, email, role, or timezone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">User</th>
                  <th className="px-6 py-3 text-left text-sm">Role</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                  <th className="px-6 py-3 text-left text-sm">Verified</th>
                  <th className="px-6 py-3 text-left text-sm">Timezone</th>
                  <th className="px-6 py-3 text-left text-sm">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            loading="lazy"
                            src={u.profilePic || FALLBACK_AVATAR}
                          />
                          <AvatarFallback>
                            {u.fullname?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.fullname}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-6 py-4">
                        <VerifiedBadge verified={u.isVerified} />
                      </td>
                      <td className="px-6 py-4 text-sm">{u.timezone}</td>
                      <td className="px-6 py-4">
                        <Button size="sm" onClick={() => setSelected(u)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="lg:hidden p-4 space-y-4">
            {paginatedUsers.map((u) => (
              <Card key={u._id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={u.profilePic || FALLBACK_AVATAR} />
                        <AvatarFallback>{u.fullname?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{u.fullname}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <RoleBadge role={u.role} />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(u)}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <p className="text-sm">
              Page {page} of {totalPages}
            </p>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* USER DETAILS MODAL */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selected.profilePic || FALLBACK_AVATAR} />
                  <AvatarFallback>
                    {selected.fullname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{selected.fullname}</h2>
                  <p className="text-muted-foreground">{selected.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <Mail className="inline w-4 h-4 mr-2" />
                  {selected.email}
                </p>
                <p>
                  <Phone className="inline w-4 h-4 mr-2" />
                  {selected.phone_number || "—"}
                </p>
                <p>
                  <Shield className="inline w-4 h-4 mr-2" />
                  {selected.role}
                </p>
                <p>
                  <User className="inline w-4 h-4 mr-2" />
                  {selected.gender}
                </p>
                <p>
                  <Globe className="inline w-4 h-4 mr-2" />
                  {selected.timezone}
                </p>
                <p>
                  <Calendar className="inline w-4 h-4 mr-2" />
                  {selected.dob?.slice(0, 10)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

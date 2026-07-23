import { useEffect, useMemo, useState } from "react";
import {
  fetchAllCounsellors,
  approveCounsellor,
} from "@/services/counsellor-services/counsellor.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Globe,
  User,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Constants
const FALLBACK_AVATAR = "/avatar.png";
const ITEMS_PER_PAGE = 10;

// Types
interface CounsellorDocuments {
  profile_picture?: string;
  government_id?: string;
  qualification_certificates?: string;
  licence?: string;
  experience_letter?: string;
  additional_documents?: string;
}

interface Counsellor {
  _id: string;
  fullname: string;
  email: string;
  contact_number?: string;
  years_experience?: number;
  Admin_approved: boolean;
  bio?: string;
  specialties?: string;
  languages?: string[];
  session_type?: string;
  hourly_rate?: number;
  counselling_type?: string;
  gender?: string;
  documents?: CounsellorDocuments;
}

interface ApiResponse {
  data?: Counsellor[];
}

// Utility Functions
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = FALLBACK_AVATAR;
};

const openDocumentExternally = (url: string) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  newWindow?.focus();
};

// Reusable Components
const Avatar = ({ src, alt }: { src?: string; alt: string }) => (
  <img
    src={src || FALLBACK_AVATAR}
    className="w-10 h-10 rounded-full object-cover border-2 bg-muted"
    onError={handleImageError}
    alt={alt}
  />
);

const LargeAvatar = ({ src, alt }: { src?: string; alt: string }) => (
  <img
    src={src || FALLBACK_AVATAR}
    className="w-24 h-24 rounded-full object-cover border-2 bg-muted shrink-0"
    onError={handleImageError}
    alt={alt}
  />
);

const StatusBadge = ({ approved }: { approved: boolean }) => {
  if (approved) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Approved
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    >
      <Clock className="h-3 w-3 mr-1" />
      Pending
    </Badge>
  );
};

const DocumentLink = ({ label, url }: { label: string; url?: string }) => {
  if (!url?.trim()) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => openDocumentExternally(url)}
      className="w-full justify-start gap-2 h-auto py-3 hover:bg-primary/10 hover:border-primary transition-all"
    >
      <FileText className="h-4 w-4 text-primary shrink-0" />
      <span className="truncate text-left flex-1 font-medium">{label}</span>
      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
    </Button>
  );
};

const InfoRow = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 text-muted-foreground" />
    <span className="truncate">{label}</span>
  </div>
);

const LoadingState = () => (
  <div className="py-16 text-center text-muted-foreground">
    Loading counsellors...
  </div>
);

const EmptyState = () => (
  <div className="py-16 text-center text-muted-foreground">
    No applications yet
  </div>
);

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 border-t">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, idx) =>
          typeof page === "number" ? (
            <Button
              key={idx}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="h-8 min-w-8 px-2"
            >
              {page}
            </Button>
          ) : (
            <span key={idx} className="px-2 text-muted-foreground">
              {page}
            </span>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Main Component
export default function CounsellorsPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selected, setSelected] = useState<Counsellor | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const response: ApiResponse | Counsellor[] = await fetchAllCounsellors();

      // Handle both response formats: { data: [] } or []
      const counsellorData = Array.isArray(response)
        ? response
        : response?.data || [];

      setCounsellors(counsellorData);
    } catch (error) {
      console.error("Error loading counsellors:", error);
      toast.error("Failed to load counsellors");
      setCounsellors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCounsellors = useMemo(() => {
    if (!search.trim()) return counsellors;

    const q = search.toLowerCase();

    return counsellors.filter(
      (c) =>
        c.fullname?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        String(c.years_experience || "").includes(q) ||
        c.specialties?.toLowerCase().includes(q) ||
        c.counselling_type?.toLowerCase().includes(q) ||
        c.languages?.some((lang) => lang.toLowerCase().includes(q)),
    );
  }, [counsellors, search]);

  // Pagination logic
  const { paginatedCounsellors, totalPages } = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = filteredCounsellors.slice(startIndex, endIndex);
    const total = Math.ceil(filteredCounsellors.length / ITEMS_PER_PAGE);

    return {
      paginatedCounsellors: paginated,
      totalPages: total,
    };
  }, [filteredCounsellors, currentPage]);

  useEffect(() => {
    loadData();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleApprove = async (id: string) => {
    try {
      setApproving(true);
      await approveCounsellor(id);
      toast.success("Counsellor Approved");
      setSelected(null);
      await loadData();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Approval failed");
    } finally {
      setApproving(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (filteredCounsellors.length === 0) return <EmptyState />;
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Counsellor Applications</CardTitle>
          <div className="mt-4 flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Search by name, email, specialty, language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
            />
            {!loading && filteredCounsellors.length > 0 && (
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredCounsellors.length} result
                {filteredCounsellors.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-sm">
                      Name
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-sm">
                      Email
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-sm">
                      Experience
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-sm">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-sm">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading || paginatedCounsellors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-0">
                        {renderContent()}
                      </td>
                    </tr>
                  ) : (
                    paginatedCounsellors.map((c) => (
                      <tr
                        key={c._id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={c.documents?.profile_picture}
                              alt={c.fullname}
                            />
                            <span className="font-medium">{c.fullname}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-[250px]">
                          <span className="truncate block text-sm text-muted-foreground">
                            {c.email}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {c.years_experience || 0} years
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge approved={c.Admin_approved} />
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected(c)}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {loading || paginatedCounsellors.length === 0
              ? renderContent()
              : paginatedCounsellors.map((c) => (
                  <Card key={c._id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={c.documents?.profile_picture || FALLBACK_AVATAR}
                          className="w-16 h-16 rounded-full object-cover border-2 bg-muted shrink-0"
                          onError={handleImageError}
                          alt={c.fullname}
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-semibold truncate">
                            {c.fullname}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {c.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {c.years_experience || 0} years experience
                          </p>
                        </div>
                        <StatusBadge approved={c.Admin_approved} />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(c)}
                        className="w-full"
                      >
                        Review Application
                      </Button>
                    </CardContent>
                  </Card>
                ))}

            {!loading && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* REVIEW MODAL */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 flex flex-col">
          {/* Header */}
          <div className="shrink-0 bg-background border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Application Review</h2>
          </div>

          {/* Scrollable Content */}
          {selected && (
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Profile Section */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <LargeAvatar
                  src={selected.documents?.profile_picture}
                  alt={selected.fullname}
                />

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-semibold">
                      {selected.fullname}
                    </h3>
                    <p className="text-muted-foreground">
                      {selected.counselling_type || "Counsellor"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <InfoRow icon={Mail} label={selected.email} />
                    <InfoRow
                      icon={Phone}
                      label={selected.contact_number || "—"}
                    />
                    <InfoRow
                      icon={Briefcase}
                      label={`${selected.years_experience || 0} years experience`}
                    />
                    <InfoRow
                      icon={DollarSign}
                      label={`₹${selected.hourly_rate || 0}/hour`}
                    />
                    <InfoRow
                      icon={Calendar}
                      label={selected.session_type || "—"}
                    />
                    <InfoRow icon={User} label={selected.gender || "—"} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bio Section */}
              {selected.bio && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    About
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selected.bio}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              {(selected.specialties || selected.languages?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selected.specialties && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Specialties</h4>
                      <p className="text-sm text-muted-foreground">
                        {selected.specialties}
                      </p>
                    </div>
                  )}

                  {selected.languages && selected.languages.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Languages
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selected.languages.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Documents Section */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submitted Documents
                </h4>

                {!selected.documents ||
                Object.values(selected.documents).every((val) => !val) ? (
                  <p className="text-sm text-muted-foreground italic">
                    No documents uploaded yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DocumentLink
                      label="Government ID"
                      url={selected.documents?.government_id}
                    />
                    <DocumentLink
                      label="Qualification Certificate"
                      url={selected.documents?.qualification_certificates}
                    />
                    <DocumentLink
                      label="Professional Licence"
                      url={selected.documents?.licence}
                    />
                    <DocumentLink
                      label="Experience Letter"
                      url={selected.documents?.experience_letter}
                    />
                    <DocumentLink
                      label="Additional Documents"
                      url={selected.documents?.additional_documents}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!selected.Admin_approved && (
                <>
                  <Separator />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1"
                      disabled={approving}
                      onClick={() => handleApprove(selected._id)}
                    >
                      {approving ? "Approving..." : "Approve Application"}
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      Reject Application
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

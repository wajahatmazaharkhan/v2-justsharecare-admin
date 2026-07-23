/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Settings, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Logout } from "@/services/auth-services/auth.service";
import Swal from "sweetalert2";
export default function AdminNavbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", path: "/admin" },
    { label: "Counsellors", path: "/admin/counsellors" },
    { label: "Appointments", path: "/admin/appointments" },
    { label: "Payments", path: "/admin/payments" },
    { label: "Users", path: "/admin/users" },
    { label: "Assessments", path: "/admin/assessments" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navigate = useNavigate();

  return (
    <header className="w-full border-b bg-background">
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* LEFT: Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <h1
            onClick={() => navigate("/")}
            className="text-lg lg:text-xl font-bold tracking-tight cursor-pointer"
          >
            Just Share Care
          </h1>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 ml-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Search */}
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8" />
          </div>

          {/* Notifications */}
          {/* <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button> */}

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "Do you confirm to logout!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Logout",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      Logout();
                    }
                  });
                }}
                className="text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* MOBILE NAV DROPDOWN */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-background px-4 pb-4 pt-2 space-y-1 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                isActive(link.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

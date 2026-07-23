import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  AdminDashboard,
  Appointments,
  Assessments,
  CounsellorsPage,
  Login,
  Payments,
  UsersPage,
} from "./pages";
import { Toaster } from "sonner";
import { AdminNavbar } from "./components";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";
import { useAuthStore } from "./store/auth-store";

function App() {
  const authenticated = useAuthStore((s) => s.authenticated);
  return (
    <Router>
      <Toaster richColors position="top-right" />
      <div>
        {authenticated && <AdminNavbar />}

        <Routes>
          {/* Public */}
          <Route element={<PublicRoute />}>
            <Route path="/auth/login" element={<Login />} />
          </Route>

          {/* Protected Admin Area */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/counsellors" element={<CounsellorsPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/assessments" element={<Assessments />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/appointments" element={<Appointments />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

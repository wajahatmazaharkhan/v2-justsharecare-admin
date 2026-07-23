import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

export const PublicRoute = () => {
  const authenticated = useAuthStore((state) => state.authenticated);

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

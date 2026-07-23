import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

export const ProtectedRoute = () => {
  const authenticated = useAuthStore((state) => state.authenticated);
  const location = useLocation();

  if (!authenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location }} // so you can redirect back after login
      />
    );
  }

  return <Outlet />;
};

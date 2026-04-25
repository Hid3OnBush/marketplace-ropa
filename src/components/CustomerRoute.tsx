import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { ReactNode } from "react";

interface CustomerRouteProps {
  children: ReactNode;
}

function CustomerRoute({ children }: CustomerRouteProps) {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

export default CustomerRoute;
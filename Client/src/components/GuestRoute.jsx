import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GuestRoute() {
  const { isAuthenticated, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;

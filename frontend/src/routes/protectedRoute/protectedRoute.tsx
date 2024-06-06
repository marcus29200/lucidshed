import { useAuth } from '../../hooks/auth.tsx';
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />
};

export default ProtectedRoute;

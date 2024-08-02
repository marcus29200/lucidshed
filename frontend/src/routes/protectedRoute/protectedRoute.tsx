import { Outlet, Navigate, useLoaderData } from "react-router-dom";

const ProtectedRoute = () => {
  const user = useLoaderData();
  return user ? <Outlet /> : <Navigate to="/login" replace />
};

export default ProtectedRoute;

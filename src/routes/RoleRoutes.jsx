import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole = String(user?.role || '').toLowerCase();
  const normalizedRoles = allowedRoles.map((role) => String(role).toLowerCase());

  if (!normalizedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
import { Navigate } from "react-router-dom";
import { getUser } from "../auth";

// Guards a page: must be logged in, and (optionally) have one of the allowed roles
function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;

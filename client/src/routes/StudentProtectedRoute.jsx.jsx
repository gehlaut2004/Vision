import { Navigate, useLocation } from "react-router-dom";

export default function StudentProtectedRoute({ children }) {
  const token = localStorage.getItem("studentToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

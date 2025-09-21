import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function OrgProtectedRoute({ children }) {
  const [isAllowed, setIsAllowed] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const org = JSON.parse(localStorage.getItem("org"));
    if (org) {
      setIsAllowed(true);
    } else {
      setIsAllowed(false);
    }
  }, []);

  if (isAllowed === null) {
    return <div className="text-center p-6 text-cyan-300">Checking access...</div>; // optional loader
  }

  if (!isAllowed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

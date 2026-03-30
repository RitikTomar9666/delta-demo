import { Navigate } from "react-router-dom";

// ✅ FIX: window.location.href ki jagah <Navigate> use karo
// window.location.href se pura page reload hota tha — React state kho jaati thi
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

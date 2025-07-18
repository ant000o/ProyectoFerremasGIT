import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, roleRequired }) {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roleRequired && user.rol !== roleRequired) {
        return <Navigate to="/" />;
    }

    return children;
}

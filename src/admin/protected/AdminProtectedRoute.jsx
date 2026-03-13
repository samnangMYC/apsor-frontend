import { Navigate, Outlet } from "react-router-dom";

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
        return true;
    }
};

const AdminProtectedRoute = () => {
    const token = localStorage.getItem("apsor:accessToken");

    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("apsor:accessToken");
        localStorage.removeItem("apsor:refreshToken");

        return <Navigate to="/admin/unauth" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
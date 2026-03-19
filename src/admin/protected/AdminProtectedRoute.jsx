import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredAccessToken, getStoredCurrentUser } from "../../page/auth/authStorage";
import {
    canAccessAdminDashboard,
    canAccessAdminPath,
    getDefaultAdminRoute,
} from "../utils/adminAccess";

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
        return true;
    }
};

const AdminProtectedRoute = () => {
    const location = useLocation();
    const token = getStoredAccessToken();
    const storedUser = getStoredCurrentUser();

    if (!token || isTokenExpired(token)) {
        localStorage.removeItem("apsor:accessToken");
        localStorage.removeItem("apsor:refreshToken");

        return <Navigate to="/admin/unauth" replace />;
    }

    if (!storedUser) {
        return <Navigate to="/admin/unauth" replace />;
    }

    if (!canAccessAdminDashboard(storedUser)) {
        return <Navigate to="/admin/unauth" replace />;
    }

    if (!canAccessAdminPath(storedUser, location.pathname)) {
        return <Navigate to={getDefaultAdminRoute(storedUser)} replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;

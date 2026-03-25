import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./page/home/HomePage";
import SignUp from "./page/auth/SignUp";
import SignIn from "./page/auth/SignIn";
import ForgotPassword from "./page/auth/ForgotPassword";
import ForgotPasswordOtp from "./page/auth/ForgotPasswordOtp";
import ResetPassword from "./page/auth/ResetPassword";
import CategoryDetailPage from "./page/category/CategoryDetailPage";
import ServiceDetailPage from "./page/service/ServiceDetailPage";
import UploadServicePage from "./page/service/UploadServicePage";
import EditServicePage from "./page/service/EditServicePage";
import ProviderDetailPage from "./page/provider/ProviderDetailPage";
import ProviderProfilePage from "./page/provider/ProviderProfilePage";
import ProviderServiceManagePage from "./page/provider/ProviderServiceManagePage";
import ProfilePage from "./page/profile/ProfilePage";
import BecomeProviderPage from "./page/provider/BecomeProviderPage";
import OrdersPage from "./page/order/OrdersPage";
import OrderDetailPage from "./page/order/OrderDetailPage";
import SearchRelatedPage from "./page/search/SearchRelatedPage";
import RouteLayout from "./layouts/RouteLayout";
import { useTheme } from "./hooks/useTheme";
import AdminDashboardLayout from "./admin/AdminDashboardLayout";
import PaymentPage from "./page/payment/PaymentPage";
import AdminDashboardPage from "./admin/pages/AdminDashboardPage";
import AdminCategoriesPage from "./admin/pages/AdminCategoriesPage";
import AdminSubcategoriesPage from "./admin/pages/AdminSubcategoriesPage";
import AdminUsersPage from "./admin/pages/AdminUsersPage";
import AdminCustomerPage from "./admin/pages/AdminCustomerPage";
import AdminOrdersPage from "./admin/pages/AdminOrdersPage";
import AdminProviderPage from "./admin/pages/AdminProviderPage";
import AdminServicesPage from "./admin/pages/AdminServicesPage";
import AdminAuditLogsPage from "./admin/pages/AdminAuditLogsPage";
import ProviderDashboardPage from "./admin/pages/ProviderDashboardPage";
import ProviderOrdersPage from "./admin/pages/ProviderOrdersPage";
import AdminProtectedRoute from "./admin/protected/AdminProtectedRoute";
import AdminUnauthPage from "./admin/components/AdminUnauthPage";
import { getStoredCurrentUser } from "./page/auth/authStorage";
import { isProviderUser } from "./admin/utils/adminAccess";

function RoleBasedDashboardPage() {
  const storedUser = getStoredCurrentUser();

  if (isProviderUser(storedUser)) {
    return <ProviderDashboardPage />;
  }

  return <AdminDashboardPage />;
}

function RoleBasedServicePage() {
  const storedUser = getStoredCurrentUser();

  if (isProviderUser(storedUser)) {
    return <ProviderServiceManagePage />;
  }

  return <AdminServicesPage />;
}

function RoleBasedOrdersPage() {
  const storedUser = getStoredCurrentUser();

  if (isProviderUser(storedUser)) {
    return <ProviderOrdersPage />;
  }

  return <Navigate to="/admin/dashboard/orders" replace />;
}

function App() {
  useTheme("system");

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RouteLayout showHeader={true} showFooter={true} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServiceDetailPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/upload-service" element={<UploadServicePage />} />
          <Route path="/service/edit" element={<EditServicePage />} />
          <Route path="/service/edit/:id" element={<EditServicePage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/providers" element={<Navigate to="/" replace />} />
          <Route path="/providers/:username" element={<ProviderDetailPage />} />
          <Route path="/provider/profile" element={<ProviderProfilePage />} />
          <Route path="/service" element={<Navigate to="/upload-service" replace />} />
          <Route path="/service/upload" element={<Navigate to="/upload-service" replace />} />
          <Route path="/provider/service" element={<Navigate to="/upload-service" replace />} />
          <Route path="/provider/service/upload" element={<Navigate to="/upload-service" replace />} />
          <Route path="/provider/service/edit" element={<Navigate to="/service/edit" replace />} />
          <Route path="/provider/service/edit/:id" element={<Navigate to="/service/edit" replace />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/search" element={<SearchRelatedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/become-provider" element={<BecomeProviderPage />} />
          <Route path="/became-provider" element={<BecomeProviderPage />} />

          {/* Authentication */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password/otp" element={<ForgotPasswordOtp />} />
          <Route path="/forgot-password/reset" element={<ResetPassword />} />
          <Route path="/admin/unauth" element={<AdminUnauthPage />} />
        </Route>

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
            <Route index element={<RoleBasedDashboardPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="subcategories" element={<AdminSubcategoriesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="customers" element={<AdminCustomerPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="providers" element={<AdminProviderPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="services" element={<Navigate to="/admin/service" replace />} />
          </Route>

          <Route path="/admin/service" element={<AdminDashboardLayout />}>
            <Route index element={<RoleBasedServicePage />} />
          </Route>

          <Route path="/admin/orders" element={<AdminDashboardLayout />}>
            <Route index element={<RoleBasedOrdersPage />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

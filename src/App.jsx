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
import ProfilePage from "./page/profile/ProfilePage";
import BecomeProviderPage from "./page/provider/BecomeProviderPage";
import ProviderServiceManagePage from "./page/provider/ProviderServiceManagePage";
import OrdersPage from "./page/order/OrdersPage";
import OrderDetailPage from "./page/order/OrderDetailPage";
import SearchRelatedPage from "./page/search/SearchRelatedPage";
import RouteLayout from "./layouts/RouteLayout";
import { useTheme } from "./hooks/useTheme";
import AdminDashboardLayout from "./admin/AdminDashboardLayout";
import PaymentPage from "./page/payment/PaymentPage";
import AdminCategoriesPage from "./admin/pages/AdminCategoriesPage";
import AdminSubcategoriesPage from "./admin/pages/AdminSubcategoriesPage";
import AdminUsersPage from "./admin/pages/AdminUsersPage";

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
          <Route path="/provider/service/upload" element={<UploadServicePage />} />
          <Route path="/provider/service/edit" element={<EditServicePage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/providers/:username" element={<ProviderDetailPage />} />
          <Route path="/provider/service" element={<ProviderServiceManagePage />} />
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
        </Route>

        <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
          <Route index element={<AdminCategoriesPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="subcategories" element={<AdminSubcategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./home/HomePage";
import SignUp from "./auth/SignUp";
import SignIn from "./auth/SignIn";
import ForgotPassword from "./auth/ForgotPassword";
import ForgotPasswordOtp from "./auth/ForgotPasswordOtp";
import ResetPassword from "./auth/ResetPassword";
import CategoryDetailPage from "./category/CategoryDetailPage";
import ServiceDetailPage from "./service/ServiceDetailPage";
import UploadServicePage from "./service/UploadServicePage";
import EditServicePage from "./service/EditServicePage";
import ProviderDetailPage from "./provider/ProviderDetailPage";
import ProfilePage from "./profile/ProfilePage";
import BecomeProviderPage from "./provider/BecomeProviderPage";
import ProviderServiceManagePage from "./provider/ProviderServiceManagePage";
import OrdersPage from "./order/OrdersPage";
import OrderDetailPage from "./order/OrderDetailPage";
import SearchRelatedPage from "./search/SearchRelatedPage";
import RouteLayout from "./layouts/RouteLayout";
import { useTheme } from "./hooks/useTheme";

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

      </Routes>
    </BrowserRouter>
  );
}

export default App;

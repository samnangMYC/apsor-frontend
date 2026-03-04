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
import ProviderDetailPage from "./provider/ProviderDetailPage";
import RouteLayout from "./layouts/RouteLayout";
import { useTheme } from "./hooks/useTheme";

function App() {
  useTheme("system");

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RouteLayout showHeader={true} showFooter={true}  />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServiceDetailPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/categories/:slug" element={<CategoryDetailPage />} />
          <Route path="/providers/:providerKey" element={<ProviderDetailPage />} />
        </Route>

        <Route element={<RouteLayout showHeader={true} showFooter={true} />}>
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

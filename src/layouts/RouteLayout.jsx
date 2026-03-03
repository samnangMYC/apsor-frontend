import { Outlet } from "react-router-dom";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";

export default function RouteLayout({
  showHeader = true,
  showFooter = true
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-app">
      {showHeader ? <Header /> : null}
      <Outlet />
      {showFooter ? <Footer /> : null}
    </div>
  );
}

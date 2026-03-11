import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarPage from "./components/SidebarPage";
import TopHeader from "./components/TopHeader";

const AdminDashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-bg-app">

            {/* Sidebar */}
            <SidebarPage
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Section */}
            <div className="flex min-w-0 flex-1 flex-col">

                {/* Header */}
                <TopHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

                {/* Page Content */}
                <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
                    
                    <Outlet />
                </main>

            </div>

        </div>

    );
};

export default AdminDashboardLayout;

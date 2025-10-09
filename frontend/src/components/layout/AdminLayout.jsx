import React from "react";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Contenido principal */}
            <main className="flex-1 lg:ml-64 transition-all duration-300">
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

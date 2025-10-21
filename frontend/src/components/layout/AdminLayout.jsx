// src/components/layout/AdminLayout.jsx
import React from "react";
import AdminSidebar from "./AdminSidebar";
import HeaderCenate from "./HeaderCenate";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 ml-0 lg:ml-64 transition-all">
        <HeaderCenate />
        <main className="p-6 mt-16">{children}</main>
      </div>
    </div>
  );
}
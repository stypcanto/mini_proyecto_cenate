// src/components/layout/AdminLayout.jsx
import React from "react";
import AdminSidebar from "./AdminSidebar";
import HeaderCenate from "./HeaderCenate";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-slate-900 dark:bg-black min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 ml-0 lg:ml-64 transition-all">
        <HeaderCenate />
        <main className="p-0 mt-16 bg-slate-900 dark:bg-black min-h-screen">{children}</main>
      </div>
    </div>
  );
}
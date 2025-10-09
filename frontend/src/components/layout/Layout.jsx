// src/components/layout/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header fijo arriba */}
            <Header />

            {/* Contenido principal */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer abajo */}
            <Footer />
        </div>
    );
};

export default Layout;

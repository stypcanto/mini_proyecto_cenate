// src/components/layout/HomeLayout.jsx
import React from "react";
import Footer from "./Footer";

/**
 * 📦 Layout específico para la página Home
 * Solo incluye el footer, sin header del panel administrativo
 */
const HomeLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 📄 Contenido principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* 🔻 Footer institucional */}
      <Footer />
    </div>
  );
};

export default HomeLayout;
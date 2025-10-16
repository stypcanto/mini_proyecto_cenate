// src/components/layout/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/**
 * 📦 Layout principal del sistema CENATE
 * Contiene el header institucional, el contenido principal y el footer.
 * Aplica estilo base y asegura consistencia visual entre módulos.
 */
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      {/* 🔷 Header institucional */}
      <Header />

      {/* 📄 Contenido dinámico (según ruta) */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 🔻 Footer institucional */}
      <Footer />
    </div>
  );
};

export default Layout;
import React from "react";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  // No mostrar footer en login
  if (
    location.pathname === "/login" ||
    location.pathname === "/registro" ||
    location.pathname === "/forgot-password"
  ) {
    return null;
  }

  return (
    <footer
      style={{ backgroundColor: "#2e63a6" }}
      className="text-white mt-auto"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logos */}
          <div className="flex items-center space-x-4">
            <img
              src="/images/Logo ESSALUD Blanco.png"
              alt="EsSalud"
              className="h-12 object-contain opacity-90"
            />
            <div className="border-l border-white border-opacity-30 h-12"></div>
            <img
              src="/images/Logo CENATE Blanco.png"
              alt="CENATE"
              className="h-12 object-contain opacity-90"
            />
          </div>

          {/* Información */}
          <div className="text-center md:text-right">
            <p className="text-sm font-medium">
              © {new Date().getFullYear()} CENATE - Centro Nacional de
              Telemedicina
            </p>
            <p className="text-xs text-blue-100 mt-1">
              Desarrollado por Equipo de Gestión TI · Versión 1.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

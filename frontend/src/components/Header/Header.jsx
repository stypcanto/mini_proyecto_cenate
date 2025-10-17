import React from "react";

const Header = ({ title, subtitle, logoLeft, logoRight }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      {/* Logo izquierdo con transición */}
      {logoLeft && (
        <img
          src={logoLeft}
          alt="Logo Izquierda"
          className="object-contain w-48 h-auto transition-all duration-300 ease-in-out sm:w-32 md:w-48"
        />
      )}

      {/* Contenedor central con el título y subtítulo */}
      <div className="flex-1 text-center">
        <h1 className="text-3xl font-semibold text-gray-800">{title}</h1>
        {subtitle && <h2 className="mt-2 text-xl text-gray-600">{subtitle}</h2>}
      </div>

      {/* Logo derecho */}
      {logoRight && (
        <img
          src={logoRight}
          alt="Logo Derecha"
          className="object-contain h-auto w-52 sm:w-32 md:w-48"
        />
      )}
    </header>
  );
};

export default Header;

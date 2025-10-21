import React from "react";

const Header = ({ title, subtitle, logoLeft, logoRight }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
      {/* Logo izquierdo */}
      {logoLeft && (
        <img
          src={logoLeft}
          alt="Logo izquierda"
          className="object-contain w-48 h-auto transition-all duration-300 ease-in-out sm:w-32 md:w-48"
        />
      )}

      {/* Contenido central */}
      <div className="flex-1 text-center">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h1>
        {subtitle && (
          <h2 className="mt-2 text-xl text-gray-600 dark:text-gray-300">
            {subtitle}
          </h2>
        )}
      </div>

      {/* Logo derecho */}
      {logoRight && (
        <img
          src={logoRight}
          alt="Logo derecha"
          className="object-contain h-auto w-52 sm:w-32 md:w-48"
        />
      )}
    </header>
  );
};

export default Header;

import React from 'react';

const Header_template = ({ children }) => {
  return (
    <header className="relative bg-gradient-to-r from-[#0a5ba9] via-[#1d4f8a] to-[#2e63a6] text-white">
      {/* Logos y título */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap">
          {/* Logo EsSalud */}
          <div className="flex items-center">
            <img 
              src="/images/Logo ESSALUD Blanco.png" 
              alt="EsSalud" 
              className="h-16 md:h-20 object-contain"
            />
          </div>

          {/* Título Central */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              Centro Nacional de Telemedicina
            </h1>
            <p className="text-sm md:text-lg mt-2 opacity-90">
              CENATE - EsSalud
            </p>
          </div>

          {/* Logo CENATE */}
          <div className="flex items-center">
            <img 
              src="/images/Logo CENATE Blanco.png" 
              alt="CENATE" 
              className="h-16 md:h-20 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Contenido adicional (como el botón de login) */}
      {children}
    </header>
  );
};

export default Header_template;

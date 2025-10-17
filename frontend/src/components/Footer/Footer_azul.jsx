import React from "react";

const Footer_azul = () => {
  return (
    <footer className="bg-[#0a5ba9] text-white py-2 w-full">
      <div className="container mx-auto text-center">
        <div className="py-0 text-xs text-center text-white border-gray-300">
          <p className="mb-1">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold">CENATE - ESSALUD</span>. Todos los derechos reservados.
          </p>
          <p className="mb-1">
            Diseñado y desarrollado por{" "}
            <span className="font-semibold text-white">Equipo de Gestión TI</span>.
          </p>
          <p className="text-white">Versión 1.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer_azul;

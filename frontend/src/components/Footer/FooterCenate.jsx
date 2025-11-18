import React from "react";

export default function FooterCenate() {
  return (
    <footer className="w-full bg-[#0a5ba9] text-white py-6 px-6 mt-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Centro Nacional de Telemedicina – CENATE</h3>
          <p className="text-sm">
            Somos el órgano prestador nacional desconcentrado del Seguro Social de Salud – EsSalud,
            brindando servicios de telesalud en promoción, prevención, recuperación y rehabilitación.
          </p>
          <p className="text-sm mt-2">
            Dirección: Av. Gral. Juan Antonio Álvarez de Arenales 1302, Lima – Perú
          </p>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold mb-2">Enlaces útiles</h3>
          <ul className="space-y-1">
            <li><a href="https://www.gob.pe/cenate" className="underline hover:text-gray-200">Portal CENATE</a></li>
            <li><a href="https://teleeduca.essalud.gob.pe/" className="underline hover:text-gray-200">TeleEduca</a></li>
            <li><a href="https://telecapacitaciones.essalud.gob.pe/" className="underline hover:text-gray-200">Telecapacitaciones</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs mt-6">
        © {new Date().getFullYear()} CENATE – EsSalud. Todos los derechos reservados.
      </div>
    </footer>
  );
}
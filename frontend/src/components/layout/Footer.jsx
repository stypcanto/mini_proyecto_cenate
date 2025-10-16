// ========================================================================
// 🌐 COMPONENTE: Footer.jsx
// Descripción: Pie de página institucional CENATE - EsSalud
// ========================================================================

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#0B2149] via-[#123C73] to-[#0B2149] text-gray-200 mt-auto">
      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
        {/* Logo e identidad institucional */}
        <div className="flex flex-col items-start">
          <img
            src="/images/Logo CENATE Blanco.png"
            alt="CENATE EsSalud"
            className="h-12 mb-3"
          />
          <p className="text-sm leading-relaxed text-gray-300">
            <strong>CENATE</strong> — Centro Nacional de Telemedicina de EsSalud.<br />
            Comprometidos con la innovación, calidad y acceso equitativo a la salud digital.
          </p>
        </div>

        {/* Servicios destacados */}
        <div>
          <h3 className="text-white font-semibold mb-3 uppercase tracking-wide">
            Nuestros Servicios
          </h3>
          <ul className="space-y-2 text-sm">
            <li>🩺 Telemedicina Asistencial</li>
            <li>🎓 Teleeducación y Telecapacitaciones</li>
            <li>🧭 Telegestión Institucional</li>
            <li>💬 Tele IEC (Información, Educación y Comunicación)</li>
          </ul>
        </div>

        {/* Información de contacto */}
        <div>
          <h3 className="text-white font-semibold mb-3 uppercase tracking-wide">
            Contáctanos
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>📍 Av. Arenales 1404, Jesús María — Lima</li>
            <li>📞 Central Telefónica: (01) 265-6000</li>
            <li>✉️ <a href="mailto:cenate@essalud.gob.pe" className="hover:underline text-blue-200">cenate@essalud.gob.pe</a></li>
            <li>🕓 Horario de atención: L–V 8:00 a.m. – 5:00 p.m.</li>
          </ul>
        </div>
      </div>

      {/* Línea inferior institucional */}
      <div className="border-t border-blue-900/60 bg-[#0A1B3A] py-4 text-center text-xs text-gray-400">
        <p>
          © {new Date().getFullYear()} <strong>CENATE</strong> — EsSalud. Todos los derechos reservados.
        </p>
        <p className="mt-1 text-gray-500 text-[11px]">
          Centro Nacional de Telemedicina · Oficina de Gestión Digital
        </p>
      </div>
    </footer>
  );
};

export default Footer;
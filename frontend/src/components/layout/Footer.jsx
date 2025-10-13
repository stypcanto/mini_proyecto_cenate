// ========================================================================
// 🌐 COMPONENTE: Footer.jsx
// Descripción: Pie de página institucional CENATE - EsSalud
// ========================================================================

import { Facebook, Twitter, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { Icon: Facebook, url: "https://www.facebook.com/EsSaludPeru", name: "Facebook" },
    { Icon: Twitter, url: "https://twitter.com/EsSaludPeru", name: "Twitter" },
    { Icon: Youtube, url: "https://www.youtube.com/@EsSaludPeru", name: "YouTube" },
    { Icon: Linkedin, url: "https://www.linkedin.com/company/essalud-peru", name: "LinkedIn" },
  ];

  return (
      <footer className="bg-[#0b2149] text-gray-300 mt-auto py-10">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-10">
          {/* Logo y descripción */}
          <div>
            <img
                src="/images/Logo CENATE Blanco.png"
                alt="CENATE EsSalud"
                className="h-12 mb-3"
            />
            <p className="text-sm leading-relaxed">
              Centro Nacional de Telemedicina — Innovando en servicios de salud a
              distancia.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-white font-semibold mb-3">Nuestros Servicios</h3>
            <ul className="space-y-2 text-sm">
              <li>Telegestión</li>
              <li>Tele IEC</li>
              <li>Telecapacitaciones</li>
              <li>Telemedicina</li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-3">Contacto</h3>
            <p className="text-sm">Av. Arenales 1404, Jesús María - Lima</p>
            <p className="text-sm">📞 (01) 265-6000</p>
            <p className="text-sm">✉️ cenate@essalud.gob.pe</p>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-white font-semibold mb-3">Síguenos</h3>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, url, name }, i) => (
                  <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${name}`}
                      className="p-2 bg-[#123d7d] rounded-full hover:bg-[#1d5fb8] transition-colors"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-10 border-t border-gray-700 pt-4">
          © 2025 CENATE - EsSalud. Todos los derechos reservados.
        </div>
      </footer>
  );
};

export default Footer;
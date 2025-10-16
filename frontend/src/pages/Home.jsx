// ============================================================================
// 🌐 PÁGINA PRINCIPAL - CENATE | Centro Nacional de Telemedicina - EsSalud
// ============================================================================
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Phone,
  ExternalLink,
  Activity,
  Shield,
  Award,
  Users,
  Calendar,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const Home = () => {
  const patternSVG = `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 0v4h-4v2h4v4h2V6h4V4h-4V0zm0 56v4h-4v-2h4v-4h2v4h4v2h-4zm-24-28v4H2v-2h4v-4h2v4h4v2H6zm48 0v4h-4v-2h4v-4h2v4h4v2h-4z'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <Layout>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        {/* ========================= HERO ========================= */}
        <header className="bg-gradient-to-r from-[#2e63a6] via-[#2456a0] to-[#1d4f8a] text-white relative overflow-hidden shadow-lg">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: patternSVG }}
          />

          <div className="container mx-auto px-6 py-10 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              {/* Logos */}
              <div className="flex items-center gap-6">
                <img
                  src="/images/Logo ESSALUD Blanco.png"
                  alt="Logo de EsSalud"
                  loading="lazy"
                  className="h-16 md:h-20 object-contain drop-shadow-lg"
                />
                <div className="hidden sm:block border-l border-white/30 h-14" />
                <img
                  src="/images/Logo CENATE Blanco.png"
                  alt="Logo de CENATE"
                  loading="lazy"
                  className="h-14 md:h-16 object-contain drop-shadow-lg"
                />
              </div>

              {/* Botón login */}
              <Link
                to="/login"
                className="mt-6 sm:mt-0 flex items-center gap-2 bg-white text-[#2e63a6] px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Iniciar sesión <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* ========================= PRESENTACIÓN ========================= */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-[0_0_35px_rgba(46,99,166,0.25)] transition-all">
            <div className="grid md:grid-cols-5">
              {/* Imagen lateral */}
              <div className="md:col-span-2 relative group">
                <img
                  src="/images/CENATEANGULAR.png"
                  alt="Imagen institucional de CENATE"
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2e63a6]/30 to-transparent" />
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <p className="text-[#2e63a6] font-bold text-lg">+10 años</p>
                  <p className="text-gray-700 text-sm">
                    De experiencia en telesalud
                  </p>
                </div>
              </div>

              {/* Texto institucional */}
              <div className="md:col-span-3 p-10 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] text-white rounded-full text-sm font-bold mb-6 shadow">
                  <Activity className="w-4 h-4" /> Quiénes Somos
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Centro Nacional de <br />
                  <span className="text-[#2e63a6]">Telemedicina</span>
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  El{" "}
                  <span className="font-bold text-[#2e63a6]">CENATE</span> es el
                  órgano nacional de EsSalud que brinda atención médica a
                  distancia en los componentes de promoción, prevención,
                  recuperación y rehabilitación, usando tecnologías de
                  información y comunicación.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  Impulsamos la{" "}
                  <span className="font-semibold text-[#2e63a6]">
                    innovación en educación médica
                  </span>{" "}
                  y la transformación digital en los servicios de salud.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://www.gob.pe/cenate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Conoce más <ExternalLink className="w-5 h-5" />
                  </a>
                  <a
                    href="tel:012656000"
                    className="inline-flex items-center gap-2 bg-white border-2 border-[#2e63a6] text-[#2e63a6] px-8 py-4 rounded-xl font-bold hover:bg-[#2e63a6] hover:text-white transition-all"
                  >
                    <Phone className="w-5 h-5" /> (01) 265-6000
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================= CALIDAD ========================= */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-5xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#2e63a6]/10 text-[#2e63a6] rounded-full text-sm font-bold mb-6">
                <Shield className="w-4 h-4" /> Certificación de Calidad
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sistema de Gestión de la Calidad
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Hemos adoptado la Política de Calidad de EsSalud, promoviendo la
                excelencia y seguridad en todos nuestros servicios de
                telemedicina.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: "Seguridad",
                  desc: "Protección de datos y privacidad garantizada.",
                },
                {
                  icon: Award,
                  title: "Excelencia",
                  desc: "Cumplimos estándares internacionales de calidad.",
                },
                {
                  icon: Activity,
                  title: "Mejora Continua",
                  desc: "Innovamos constantemente en procesos y tecnología.",
                },
              ].map(({ icon: Icon, title, desc }, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl border-t-4 border-[#2e63a6] transition-all"
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#2e63a6] to-[#1d4f8a] rounded-xl flex items-center justify-center text-white shadow-md">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-700 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================= CTA ========================= */}
        <section className="relative bg-gradient-to-r from-[#2e63a6] via-[#2456a0] to-[#1d4f8a] py-16 text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: patternSVG }}
          />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Accede a Nuestros Servicios
            </h2>
            <p className="text-blue-100 mb-12">
              Plataformas digitales para profesionales y pacientes
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  icon: Calendar,
                  title: "Consulta por Telemedicina",
                  link: "https://www.gob.pe/52766-realizar-una-consulta-por-telemedicina",
                },
                {
                  icon: Award,
                  title: "Programa TELEEDUCA",
                  link: "https://teleeduca.essalud.gob.pe/",
                },
                {
                  icon: Users,
                  title: "Telecapacitaciones",
                  link: "https://telecapacitaciones.essalud.gob.pe/",
                },
              ].map(({ icon: Icon, title, link }, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-xl p-8 transition-all hover:scale-105 backdrop-blur-md"
                >
                  <Icon className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">{title}</h3>
                  <div className="flex justify-center items-center gap-2 text-sm font-semibold text-white/90">
                    Acceder{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Home;
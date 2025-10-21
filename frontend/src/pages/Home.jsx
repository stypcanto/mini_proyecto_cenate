// ========================================================================
// 🏠 Home.jsx – Portal Institucional CENATE 2025
// ------------------------------------------------------------------------
// Página pública principal (antes de login)
// Incluye:
//   - HeaderCenate y FooterCenate exclusivos para sitios institucionales.
//   - Imágenes y textos oficiales de https://www.gob.pe/cenate
//   - Diseño profesional inspirado en Apple y EsSalud.
// ========================================================================

import React from "react";
import { Link } from "react-router-dom";
import HeaderCenate from "../components/Header/HeaderCenate";
import FooterCenate from "../components/Footer/FooterCenate";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ============================================================ */}
      {/* 🔷 Header institucional */}
      {/* ============================================================ */}
      <HeaderCenate />

      {/* ============================================================ */}
      {/* 🏛️ Sección principal */}
      {/* ============================================================ */}
      <main className="flex-1">
        {/* Hero institucional */}
        <section className="relative w-full">
          <img
            src="/images/CENATEANGULAR.png"
            alt="Fondo institucional CENATE"
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white px-4">
            <img
              src="/images/LogoCENATEBlanco.png"
              alt="Logo CENATE"
              className="h-20 mb-4 drop-shadow-lg"
            />
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 drop-shadow-lg">

            </h1>
            <p className="max-w-2xl text-lg sm:text-xl text-white/90 drop-shadow">
              Brindamos servicios de salud a distancia mediante el uso de las
              Tecnologías de la Información y Comunicación (TIC), acercando la
              salud a todos los peruanos.
            </p>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 📘 Sección informativa institucional */}
        {/* ============================================================ */}
        <section className="px-6 py-16 max-w-6xl mx-auto text-justify">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#0a5ba9] mb-4">
              Acerca del CENATE
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              El <strong>Centro Nacional de Telemedicina (CENATE)</strong> es el
              órgano prestador nacional desconcentrado del Seguro Social de Salud –
              EsSalud, responsable de brindar servicios de salud a distancia a
              través de los componentes de promoción, prevención, recuperación y
              rehabilitación, haciendo uso de las{" "}
              <strong>Tecnologías de la Información y Comunicación (TIC)</strong>.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mt-4">
              Fue creado con el propósito de acercar los servicios de salud a
              todas las regiones del país, garantizando el acceso oportuno y
              equitativo a la atención médica especializada, especialmente en las
              zonas rurales o de difícil acceso.
            </p>
          </div>

          {/* ============================================================ */}
          {/* 🎯 Misión y Visión */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all">
              <h3 className="text-2xl font-semibold text-[#0a5ba9] mb-3">Misión</h3>
              <p className="text-gray-700 leading-relaxed">
                Brindar servicios de salud a distancia de manera oportuna,
                equitativa y con calidad, haciendo uso de las TIC, para contribuir
                al bienestar de los asegurados y la mejora del acceso a los
                servicios de salud.
              </p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all">
              <h3 className="text-2xl font-semibold text-[#0a5ba9] mb-3">Visión</h3>
              <p className="text-gray-700 leading-relaxed">
                Ser el referente nacional en la prestación de servicios de salud a
                distancia mediante tecnologías digitales, fortaleciendo el sistema
                de salud y garantizando atención médica de calidad en todo el Perú.
              </p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 🩺 Ejes de la Telesalud */}
          {/* ============================================================ */}
          <h2 className="text-3xl font-bold text-[#0a5ba9] mb-8 text-center">
            Ejes del desarrollo de la Telesalud
          </h2>

          {[
            {
              title: "Telegestión",
              content:
                "Aplicación de principios, conocimientos y métodos de gestión de salud mediante TIC, en la planificación, organización, dirección y control de los servicios de salud.",
            },
            {
              title: "Tele información, educación y comunicación (TeleIEC)",
              content:
                "Promueve la educación sanitaria y la comunicación digital para difundir estilos de vida saludables, fomentando la prevención y el autocuidado.",
            },
            {
              title: "Telecapacitación",
              content:
                "Fortalece las competencias del personal de salud mediante programas de formación virtual, talleres y educación continua.",
            },
            {
              title: "Telemedicina",
              content:
                "Provisión de servicios de salud a distancia, en promoción, diagnóstico, tratamiento, rehabilitación y cuidados paliativos, garantizando el acceso equitativo a la atención médica.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="mb-6 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-[#0a5ba9]"
            >
              <h3 className="text-xl font-semibold text-[#0a5ba9] mb-2">
                {item.title}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}

          {/* ============================================================ */}
          {/* 🔗 Enlaces destacados */}
          {/* ============================================================ */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-[#0a5ba9] mb-6">
              Plataformas y servicios
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://www.gob.pe/52766-realizar-una-consulta-por-telemedicina"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0a5ba9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#073d71] transition"
              >
                Realizar una consulta por telemedicina
              </a>
              <a
                href="https://teleeduca.essalud.gob.pe/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0a5ba9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#073d71] transition"
              >
                Programa “TELEEDUCA”
              </a>
              <a
                href="https://telecapacitaciones.essalud.gob.pe/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0a5ba9] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#073d71] transition"
              >
                Telecapacitaciones y TeleIEC
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* ⚓ Footer institucional */}
      {/* ============================================================ */}
      <FooterCenate />
    </div>
  );
}
// ========================================================================
// 🏠 Home.jsx – Portal Institucional CENATE 2025
// ------------------------------------------------------------------------
// Página pública principal con información de CENATE y Dashboards PowerBI
// Migrado del proyecto Congreso_ESSALUD_2025
// ========================================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import HeaderCenate from "../components/Header/HeaderCenate";
import FooterCenate from "../components/Footer/FooterCenate";

// Configuración de los dashboards de PowerBI
const POWERBI_DASHBOARDS = {
  telemedicina: {
    title: 'Dashboard Telemedicina - CENATE',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiZWI4YjE4MmItODFjOS00YmYzLTgwMTgtNzcwNTM5YjQyNDM0IiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9'
  },
  teleiec: {
    title: 'Dashboard TeleIEC - CENATE',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiYjIyM2I4NmUtZDkzNC00ZWJjLThlZDEtM2ZmOTBmOTJlYjI1IiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9'
  },
  telegestion: {
    title: 'Dashboard Telegestión - CENATE',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiOWRhZWJkZmItZmQ1Yi00NWJhLWJlNDQtNjQxMTNlOGI5YWMxIiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9'
  },
  telecapacitacion: {
    title: 'Dashboard Telecapacitación - CENATE',
    src: 'https://app.powerbi.com/view?r=eyJrIjoiMTA5YWYzY2UtYjZjYS00ZGU5LWI3NWEtYzk2N2Q1OTYyNzhhIiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9'
  }
};

// Modal para mostrar dashboards de PowerBI
function PowerBIModal({ title, iframeSrc, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-[95vw] h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Header del modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0a5ba9] text-white">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-2xl"
          >
            &times;
          </button>
        </div>
        {/* Iframe de PowerBI */}
        <iframe
          title={title}
          src={iframeSrc}
          className="w-full h-[calc(90vh-72px)]"
          frameBorder="0"
          allowFullScreen={true}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [activeDashboard, setActiveDashboard] = useState(null);

  const ejes = [
    {
      id: 'telemedicina',
      title: 'Telemedicina',
      description: 'Implementando servicios síncronos y asíncronos como Teleconsulta, Telemonitoreo, Teleinterconsulta y Teleapoyo al diagnóstico.',
      icon: '🏥'
    },
    {
      id: 'teleiec',
      title: 'TeleIEC',
      description: 'Desarrollando estrategias de información, educación y comunicación en salud para la población asegurada, enfocadas en el Modelo de Cuidado Integral de Salud (MCI).',
      icon: '📚'
    },
    {
      id: 'telegestion',
      title: 'Telegestión',
      description: 'Proponiendo y formulando la planificación, organización, ejecución y control de la Red Funcional de Telesalud de EsSalud.',
      icon: '📊'
    },
    {
      id: 'telecapacitacion',
      title: 'Telecapacitación',
      description: 'Fortaleciendo las competencias del personal de la salud mediante programas de formación continua con énfasis en gestión sanitaria y clínica.',
      icon: '🎓'
    }
  ];

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
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-lg">
              Acerca de CENATE
            </h1>
            <p className="max-w-2xl text-lg sm:text-xl text-white/90 drop-shadow">
              Centro Nacional de Telemedicina - EsSalud
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 📘 Sección informativa institucional */}
        {/* ============================================================ */}
        <section className="px-6 py-16 max-w-6xl mx-auto text-justify">
          {/* Introducción */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
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
          {/* 📊 Dashboard de Avances de Telesalud */}
          {/* ============================================================ */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-[#0a5ba9] mb-6 text-center">
              Avances de Telesalud del CENATE
            </h2>
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200">
              <iframe
                title="Dashboard de Avances de Telesalud - CENATE"
                src="https://app.powerbi.com/view?r=eyJrIjoiZDIyYWZhYTEtYmEwMy00YTlmLWFlYTUtZmQ5N2I2ZWFiNjRkIiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9"
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen={true}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Para ver los detalles de cada indicador, revise las tarjetas de los ejes de desarrollo en la parte inferior.
            </p>
          </div>

          {/* ============================================================ */}
          {/* 🩺 Ejes de la Telesalud (con dashboards interactivos) */}
          {/* ============================================================ */}
          <h2 className="text-3xl font-bold text-[#0a5ba9] mb-4 text-center">
            Ejes del desarrollo de la Telesalud
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            El CENATE es responsable de impulsar los cuatro ejes de desarrollo de la
            Telesalud en las Instituciones Prestadoras de Servicios de Salud (IPRESS) de EsSalud.
            <strong className="block mt-2 text-[#0a5ba9]">Haz clic en cada tarjeta para ver el dashboard correspondiente.</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {ejes.map((eje) => (
              <div
                key={eje.id}
                onClick={() => setActiveDashboard(eje.id)}
                className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all border-l-4 border-[#0a5ba9] group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{eje.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#0a5ba9] mb-2">
                      {eje.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {eje.description}
                    </p>
                    <span className="inline-block mt-4 text-[#0a5ba9] font-medium text-sm group-hover:underline">
                      Ver Dashboard →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                Programa "TELEEDUCA"
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

          {/* ============================================================ */}
          {/* 📞 Información de contacto */}
          {/* ============================================================ */}
          <div className="mt-12 bg-gradient-to-r from-[#0a5ba9] to-[#1e88e5] rounded-2xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <span className="text-3xl mb-2 block">📍</span>
                <p className="font-medium">Dirección</p>
                <p className="text-white/80 text-sm">
                  Jr. Domingo Cueto 120, Jesús María<br />Lima, Perú
                </p>
              </div>
              <div>
                <span className="text-3xl mb-2 block">✉️</span>
                <p className="font-medium">Correo</p>
                <p className="text-white/80 text-sm">cenate.contacto@essalud.gob.pe</p>
              </div>
              <div>
                <span className="text-3xl mb-2 block">⏰</span>
                <p className="font-medium">Horario</p>
                <p className="text-white/80 text-sm">Lunes a Viernes<br />8:00 am - 5:00 pm</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* ⚓ Footer institucional */}
      {/* ============================================================ */}
      <FooterCenate />

      {/* Modal de PowerBI */}
      {activeDashboard && POWERBI_DASHBOARDS[activeDashboard] && (
        <PowerBIModal
          title={POWERBI_DASHBOARDS[activeDashboard].title}
          iframeSrc={POWERBI_DASHBOARDS[activeDashboard].src}
          onClose={() => setActiveDashboard(null)}
        />
      )}
    </div>
  );
}

// ========================================================================
// BienvenidaMesaAyuda.jsx - Página de Bienvenida Mesa de Ayuda
// ========================================================================
// Diseño profesional siguiendo patrón estándar de bienvenidas CENATE
// Para personal de Mesa de Ayuda que gestiona tickets de soporte
// ========================================================================

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Headphones,
  ListChecks,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/**
 * Página de bienvenida del Módulo Mesa de Ayuda
 * Sigue el patrón estándar de bienvenidas CENATE
 *
 * @version v1.65.1 (2026-02-19)
 */
export default function BienvenidaMesaAyuda() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const genero = user?.genero === "F" || user?.genero === "FEMENINO" ? "a" : "o";
  const nombreUsuario = user?.nombreCompleto || "Usuario";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con bienvenida */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">
            ¡Bienvenid{genero}, {nombreUsuario}!
          </h1>
          <p className="text-lg text-slate-600">
            Centro Nacional de Telemedicina - CENATE
          </p>
        </div>

        {/* Card principal de bienvenida */}
        <div className="bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5 gap-6 p-8 text-white items-center">
            {/* Contenido */}
            <div className="md:col-span-4 space-y-3">
              <h2 className="text-2xl font-bold">
                Módulo de Mesa de Ayuda
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Gestiona los tickets de soporte técnico creados por los médicos,
                responde consultas, da seguimiento a incidencias y asegura la
                resolución oportuna de problemas del sistema de telemedicina.
              </p>

              {/* Rol */}
              <div className="pt-2 flex items-center gap-2 text-blue-100 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">MESA DE AYUDA</span>
              </div>
            </div>

            {/* Ícono minimalista */}
            <div className="flex justify-center items-center md:col-span-1">
              <Headphones className="w-24 h-24 text-white opacity-90" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Tarjetas de acciones rápidas */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Card 1: Gestión de Tickets */}
            <QuickActionCard
              icon={<ListChecks className="w-6 h-6" />}
              title="Gestión de Tickets"
              description="Revisa, responde y gestiona todos los tickets de soporte creados por los médicos. Filtra por estado, prioridad y realiza seguimiento"
              color="blue"
              action={() => navigate("/mesa-ayuda/tickets-pendientes")}
            />

            {/* Card 2: Preguntas Frecuentes */}
            <QuickActionCard
              icon={<HelpCircle className="w-6 h-6" />}
              title="Preguntas Frecuentes"
              description="Consulta las preguntas frecuentes sobre el uso del sistema de Mesa de Ayuda, flujos de tickets y procedimientos de soporte"
              color="purple"
              action={() => navigate("/mesa-ayuda/faqs")}
            />
          </div>
        </div>

        {/* Botón de acción principal */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate("/mesa-ayuda/tickets-pendientes")}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <span>Ir a Gestión de Tickets</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-200">
          <p>
            ¿Necesitas ayuda? Contacta al equipo de soporte de CENATE o revisa la documentación en tu panel.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Componente: Tarjeta de Acción Rápida
// ============================================================
function QuickActionCard({ icon, title, description, color, action }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
  };

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <button
      onClick={action}
      className={`${colorClasses[color]} border rounded-xl p-5 transition-all duration-300 cursor-pointer group text-left w-full shadow-sm hover:shadow-lg hover:scale-105`}
    >
      <div className={`${iconColorClasses[color]} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </button>
  );
}

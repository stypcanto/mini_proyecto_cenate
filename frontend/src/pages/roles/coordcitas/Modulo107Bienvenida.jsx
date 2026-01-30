// ========================================================================
// 🎯 Modulo107Bienvenida.jsx – Página de Bienvenida Módulo 107
// ========================================================================

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { BookOpen, Info } from "lucide-react";

export default function Modulo107Bienvenida() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Módulo 107 - Bienvenida</h1>
          <p className="text-slate-600">
            Gestión integral de pacientes y atenciones del Módulo 107
          </p>
        </div>

        {/* Card de Bienvenida */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                ¡Bienvenido al Módulo 107!
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                El Módulo 107 es un sistema integral para la gestión de pacientes diagnosticados bajo el protocolo 107.
                Aquí puedes cargar datos de pacientes, consultar atenciones clínicas, gestionar expedientes y generar reportes.
              </p>
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Este módulo está diseñado para coordinadores y personal médico autorizado.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones rápidas */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-2">📊 Función del Módulo 107</h3>
            <p className="text-sm text-slate-600">
              Proporciona herramientas para la carga, gestión y seguimiento de pacientes que requieren atención especializada.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-2">👤 Tu Acceso</h3>
            <p className="text-sm text-slate-600">
              Tienes acceso completo a las funcionalidades del Módulo 107 según tus permisos asignados.
            </p>
          </div>
        </div>

        {/* Información de usuario */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <p className="text-sm text-slate-700">
            <strong>Usuario:</strong> {user?.nombreCompleto || "No disponible"}
          </p>
        </div>
      </div>
    </div>
  );
}

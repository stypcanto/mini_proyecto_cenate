// ========================================================================
// 📊 SeguimientoLecturasExterno.jsx – Dashboard PowerBI para IPRESS Externas
// ========================================================================
// Panel de control en tiempo real para monitorear lecturas pendientes
// de procesamiento en la IPRESS consultante
// ========================================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function SeguimientoLecturasExterno() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con botón atrás */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Seguimiento de Lecturas Pendientes
            </h1>
            <p className="text-slate-600 mt-2">
              Panel de control en tiempo real para monitorear las lecturas pendientes de procesamiento en tu IPRESS
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>
        </div>

        {/* Dashboard PowerBI */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <iframe
            title="Dashboard de Diferimiento de Lecturas Pendientes"
            width="100%"
            height="700"
            src="https://app.powerbi.com/view?r=eyJrIjoiMDZhMDI0ODEtMDJiMi00ZDE1LWJjMmMtOTExM2FjMzEwYjNjIiwidCI6IjM0ZjMyNDE5LTFjMDUtNDc1Ni04OTZlLTQ1ZDYzMzcyNjU5YiIsImMiOjR9"
            frameBorder="0"
            allowFullScreen={true}
            style={{ borderRadius: "16px" }}
          ></iframe>
        </div>

        {/* Nota informativa */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Información importante</h4>
            <p className="text-sm text-blue-800">
              Este dashboard se actualiza automáticamente cada hora. Para reportar problemas con los datos o errores en la visualización, contacta al equipo técnico de CENATE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

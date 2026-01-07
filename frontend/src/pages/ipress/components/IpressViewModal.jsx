// ========================================================================
// 👁️ IpressViewModal.jsx – Modal de Visualización de IPRESS
// ------------------------------------------------------------------------
// Muestra todos los detalles de una IPRESS en modo solo lectura
// Disponible para todos los usuarios del sistema
// ========================================================================

import React from "react";
import { X, Building2, Network, MapPin, Activity, Globe, Navigation, Power } from "lucide-react";

export default function IpressViewModal({ ipress, onClose }) {
  if (!ipress) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */ }
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Detalles de IPRESS</h2>
                <p className="text-blue-100 text-sm">Información completa de la institución</p>
              </div>
            </div>
            <button
              onClick={ onClose }
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */ }
        <div className="p-6 space-y-6">
          {/* Información Básica */ }
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Información Básica</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">
                  Código IPRESS
                </label>
                <p className="text-slate-900 font-mono text-lg font-semibold">
                  { ipress.codIpress || "No especificado" }
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">
                  ID IPRESS
                </label>
                <p className="text-slate-900 font-mono text-lg font-semibold">
                  { ipress.idIpress || "No especificado" }
                </p>
              </div>

              <div className="md:col-span-2 bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1">
                  Nombre de la Institución
                </label>
                <p className="text-slate-900 font-medium text-base">
                  { ipress.descIpress || "No especificado" }
                </p>
              </div>
            </div>
          </section>

          {/* Información de Red */ }
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">Red Asistencial</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Macrorregión */ }
              { ipress.descMacrorregion && (
                <div className="md:col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide block mb-1">
                    Macrorregión
                  </label>
                  <p className="text-blue-900 font-medium text-lg">
                    { ipress.descMacrorregion }
                  </p>
                </div>
              ) }

              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                  ID Red
                </label>
                <p className="text-emerald-900 font-mono text-lg font-semibold">
                  { ipress.idRed || "No especificado" }
                </p>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide block mb-1">
                  Nombre de la Red
                </label>
                <p className="text-emerald-900 font-medium">
                  { ipress.nombreRed || "Sin red asignada" }
                </p>
              </div>
            </div>
          </section>

          {/* Modalidad de Atención */ }
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900">Modalidad de Atención</h3>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide block mb-1">
                Tipo de Servicio
              </label>
              <div className="flex items-center gap-2">
                <span className={ `inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${ipress.nombreModalidadAtencion === 'TELECONSULTA'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : ipress.nombreModalidadAtencion === 'TELECONSULTORIO'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : ipress.nombreModalidadAtencion === 'MIXTA'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : ipress.nombreModalidadAtencion === 'NO SE BRINDA SERVICIO'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }` }>
                  { ipress.nombreModalidadAtencion || 'No especificado' }
                </span>
              </div>
              { ipress.idModalidadAtencion && (
                <p className="text-xs text-purple-600 mt-2">
                  ID Modalidad: <span className="font-mono font-semibold">{ ipress.idModalidadAtencion }</span>
                </p>
              ) }
            </div>

            {/* Detalles de Modalidad MIXTA */ }
            { ipress.nombreModalidadAtencion === 'MIXTA' && (
              <div className="grid grid-cols-1 gap-4 mt-4">
                { ipress.detallesTeleconsulta && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide block mb-2">
                      Teleconsulta
                    </label>
                    <p className="text-blue-900 font-medium text-sm whitespace-pre-wrap">
                      { ipress.detallesTeleconsulta }
                    </p>
                  </div>
                ) }

                { ipress.detallesTeleconsultorio && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide block mb-2">
                      Teleconsultorio
                    </label>
                    <p className="text-purple-900 font-medium text-sm whitespace-pre-wrap">
                      { ipress.detallesTeleconsultorio }
                    </p>
                  </div>
                ) }
              </div>
            ) }
          </section>

          {/* Ubicación y Dirección */ }
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-slate-900">Ubicación</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              { ipress.direcIpress && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-1">
                    Dirección
                  </label>
                  <p className="text-amber-900 font-medium">
                    { ipress.direcIpress }
                  </p>
                </div>
              ) }

              {/* Coordenadas Geográficas */ }
              { (ipress.latIpress || ipress.longIpress) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-1">
                      📍 Latitud
                    </label>
                    <p className="text-amber-900 font-medium font-mono text-sm">
                      { ipress.latIpress || "No especificado" }
                    </p>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-1">
                      📍 Longitud
                    </label>
                    <p className="text-amber-900 font-medium font-mono text-sm">
                      { ipress.longIpress || "No especificado" }
                    </p>
                  </div>
                </div>
              ) }

              {/* URL de Google Maps */ }
              { ipress.gmapsUrlIpress && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <label className="text-xs font-semibold text-amber-700 uppercase tracking-wide block mb-1">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>URL de Google Maps</span>
                    </div>
                  </label>
                  <a
                    href={ ipress.gmapsUrlIpress }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm underline break-all"
                  >
                    { ipress.gmapsUrlIpress }
                  </a>
                </div>
              ) }
            </div>
          </section>

          {/* Estado de la IPRESS */ }
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Power className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">Estado</h3>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide block mb-1">
                Estado Actual
              </label>
              <span className={ `inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${ipress.statIpress === 'A'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
                }` }>
                { ipress.statIpress === 'A' ? 'Activo' : 'Inactivo' }
              </span>
            </div>
          </section>

        </div>

        {/* Footer */ }
        <div className="bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200">
          <div className="flex justify-end">
            <button
              onClick={ onClose }
              className="px-6 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700
                         transition-colors font-medium shadow-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

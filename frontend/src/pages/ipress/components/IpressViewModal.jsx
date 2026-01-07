// ========================================================================
// 👁️ IpressViewModal.jsx – Modal de Visualización de IPRESS (Profesional)
// ------------------------------------------------------------------------
// Muestra todos los detalles de una IPRESS en modo solo lectura
// Disponible para todos los usuarios del sistema
// ========================================================================

import React from "react";
import { X, Building2, Network, MapPin, Activity, Globe, Power } from "lucide-react";

export default function IpressViewModal({ ipress, onClose }) {
  if (!ipress) return null;

  const InfoField = ({ label, value }) => (
    <div className="mb-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm text-slate-900">
        {value || "No especificado"}
      </p>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const isActive = status === 'A';
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {isActive ? '● Activo' : '● Inactivo'}
      </span>
    );
  };

  const ModalityBadge = ({ modalidad }) => {
    const colors = {
      'TELECONSULTA': 'bg-blue-100 text-blue-700',
      'TELECONSULTORIO': 'bg-purple-100 text-purple-700',
      'MIXTA': 'bg-emerald-100 text-emerald-700',
      'NO SE BRINDA SERVICIO': 'bg-red-100 text-red-700'
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[modalidad] || 'bg-gray-100 text-gray-700'}`}>
        {modalidad}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{ipress.descIpress}</h2>
              <p className="text-slate-300 text-sm">ID: {ipress.idIpress}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <InfoField label="Código" value={ipress.codIpress} />
              <InfoField label="ID IPRESS" value={ipress.idIpress} />
            </div>
            <div>
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Estado
                </p>
                <StatusBadge status={ipress.statIpress} />
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Modalidad
                </p>
                <ModalityBadge modalidad={ipress.nombreModalidadAtencion} />
              </div>
            </div>
            <div>
              <InfoField label="Red" value={ipress.nombreRed} />
              {ipress.descMacrorregion && (
                <InfoField label="Macrorregión" value={ipress.descMacrorregion} />
              )}
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* Detalles de Modalidad MIXTA */}
          {ipress.nombreModalidadAtencion === 'MIXTA' && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Detalles de Modalidad Mixta
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                      📞 Teleconsulta
                    </p>
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {ipress.detallesTeleconsulta || 'No especificado'}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                      🎥 Teleconsultorio
                    </p>
                    <p className="text-sm text-blue-900 leading-relaxed">
                      {ipress.detallesTeleconsultorio || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200"></div>
            </>
          )}

          {/* Ubicación */}
          <div>
            <h3 className="text-sm font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ubicación
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {ipress.direcIpress && (
                <InfoField label="Dirección" value={ipress.direcIpress} />
              )}
              {(ipress.latIpress || ipress.longIpress) && (
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Latitud" value={ipress.latIpress} />
                  <InfoField label="Longitud" value={ipress.longIpress} />
                </div>
              )}
              {ipress.gmapsUrlIpress && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Ubicación en Google Maps
                  </p>
                  <a
                    href={ipress.gmapsUrlIpress}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Abrir mapa →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-xl border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

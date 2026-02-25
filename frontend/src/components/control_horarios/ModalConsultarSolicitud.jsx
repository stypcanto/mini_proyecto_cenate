// ============================================================================
// 👁️ ModalConsultarSolicitud - Vista de lectura de solicitud
// ============================================================================

import React from 'react';
import { X } from 'lucide-react';

const ModalConsultarSolicitud = ({ horario, isOpen, onClose }) => {
  if (!isOpen || !horario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Detalle de Solicitud - {horario.nomPers}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información General */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
              Información General
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Período</p>
                <p className="text-lg font-semibold text-gray-800">{horario.periodo}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Área</p>
                <p className="text-lg font-semibold text-gray-800">{horario.descArea}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Médico / Personal</p>
                <p className="text-lg font-semibold text-gray-800">{horario.nomPers}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Grupo Programático</p>
                <p className="text-lg font-semibold text-gray-800">{horario.idGrupoProg}</p>
              </div>
            </div>
          </div>

          {/* Datos Laborales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
              Datos Laborales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Régimen Laboral</p>
                <p className="text-lg font-semibold text-gray-800">{horario.descRegLab}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 uppercase mb-1">Servicio</p>
                <p className="text-lg font-semibold text-gray-800">
                  {horario.descServicio || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Horario y Turnos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
              Control de Horarios
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-xs text-blue-600 uppercase mb-1 font-medium">
                  Turnos Totales
                </p>
                <p className="text-2xl font-bold text-blue-800">{horario.turnosTotales}</p>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-xs text-green-600 uppercase mb-1 font-medium">
                  Turnos Válidos
                </p>
                <p className="text-2xl font-bold text-green-800">{horario.turnosValidos}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg col-span-2">
                <p className="text-xs text-purple-600 uppercase mb-1 font-medium">
                  Horas Totales
                </p>
                <p className="text-2xl font-bold text-purple-800">{horario.horasTotales} hrs</p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {horario.observaciones && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                Observaciones
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {horario.observaciones}
                </p>
              </div>
            </div>
          )}

          {/* Información de Auditoría */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
              Información de Auditoría
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs list-style-none">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Creado</p>
                <p className="font-medium text-gray-700">
                  {new Date(horario.createdAt).toLocaleString('es-PE')}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Última actualización</p>
                <p className="font-medium text-gray-700">
                  {new Date(horario.updatedAt).toLocaleString('es-PE')}
                </p>
              </div>
            </div>
          </div>

          {/* Button Cerrar */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConsultarSolicitud;

// ========================================================================
// 🔍 DetalleAtencionModal.jsx – Modal de detalle completo de atención clínica
// ========================================================================

import React from 'react';
import { X, User, FileText, Building2, Activity, Calendar, UserCheck } from 'lucide-react';

const DetalleAtencionModal = ({ isOpen, onClose, atencion }) => {
  if (!isOpen || !atencion) return null;

  const formatFecha = (fecha) => {
    if (!fecha) return 'No registrada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSexo = (sexo) => {
    if (sexo === 'M') return 'Masculino';
    if (sexo === 'F') return 'Femenino';
    return 'No especificado';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-bold">Detalle de Atención Clínica</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-blue-100">
            Solicitud: {atencion.numeroSolicitud} | ID: {atencion.idSolicitud}
          </p>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 space-y-8">
          {/* ========== SECCIÓN 1: IDENTIFICACIÓN DE LA SOLICITUD ========== */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">🆔 Identificación de la Solicitud</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">ID Solicitud</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.idSolicitud}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Número de Solicitud</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.numeroSolicitud}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">ID Bolsa</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.idBolsa || '107'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Estado Registro</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  atencion.activo 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {atencion.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* ========== SECCIÓN 2: DATOS DEL PACIENTE ========== */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">👤 Datos del Paciente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.pacienteNombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">ID Paciente</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.pacienteId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Documento</label>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-900">{atencion.pacienteDni}</p>
                  <p className="text-xs text-gray-500">({atencion.tipoDocumento})</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Sexo</label>
                <p className="text-sm font-semibold text-gray-900">{formatSexo(atencion.pacienteSexo)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Edad</label>
                <p className="text-sm font-semibold text-gray-900">
                  {atencion.pacienteEdad ? `${atencion.pacienteEdad} años` : 'No registrada'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                <p className="text-sm font-semibold text-gray-900">
                  {atencion.fechaNacimiento 
                    ? new Date(atencion.fechaNacimiento).toLocaleDateString('es-ES')
                    : 'No registrada'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Teléfono Principal</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.pacienteTelefono || 'No registrado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Teléfono Alternativo</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.pacienteTelefonoAlterno || 'No registrado'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.pacienteEmail || 'No registrado'}</p>
              </div>
            </div>
          </div>

          {/* ========== SECCIÓN 3: DATOS DE IPRESS ========== */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">🏥 Datos de IPRESS</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Nombre de IPRESS</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.ipressNombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">ID IPRESS</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.idIpress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Código IPRESS</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.codigoIpress}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Código Adscripción</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.codigoAdscripcion}</p>
              </div>
            </div>
          </div>

          {/* ========== SECCIÓN 4: INFORMACIÓN CLÍNICA/DERIVACIÓN ========== */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">🏷️ Información Clínica / Derivación</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Derivación Interna</label>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {atencion.derivacionInterna}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Especialidad</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.especialidad}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Tipo de Cita</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.tipoCita}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">ID Servicio</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.idServicio}</p>
              </div>
            </div>
          </div>

          {/* ========== SECCIÓN 5: ESTADO DE LA GESTIÓN DE CITA ========== */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">📌 Estado de la Gestión de Cita</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Estado Actual</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  atencion.estadoDescripcion === "PENDIENTE"
                    ? "bg-orange-100 text-orange-700"
                    : atencion.estadoDescripcion === "ATENDIDO"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {atencion.estadoDescripcion}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">ID Estado</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.estadoGestionCitasId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Código Estado</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.estadoCodigo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Estado Legacy</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.estado}</p>
              </div>
            </div>
          </div>

          {/* ========== SECCIÓN 6: FECHAS DE CONTROL ========== */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">⏰ Fechas de Control</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de Solicitud</label>
                <p className="text-sm font-semibold text-gray-900">{formatFecha(atencion.fechaSolicitud)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de Actualización</label>
                <p className="text-sm font-semibold text-gray-900">{formatFecha(atencion.fechaActualizacion)}</p>
              </div>
            </div>
          </div>

          {/* ========== SECCIÓN 7: GESTORA ASIGNADA ========== */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">👩‍⚕️ Gestora Asignada</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Responsable</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.responsableNombre || 'No asignado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">ID Responsable</label>
                <p className="text-sm font-semibold text-gray-900">{atencion.responsableGestoraId || 'No asignado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de Asignación</label>
                <p className="text-sm font-semibold text-gray-900">{formatFecha(atencion.fechaAsignacion)}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer del Modal */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleAtencionModal;
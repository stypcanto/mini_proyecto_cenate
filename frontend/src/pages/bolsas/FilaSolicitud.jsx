import React from 'react';
import { Phone, Users, UserPlus, Download, FileText, X } from 'lucide-react';

/**
 * 🚀 v2.6.0 - Componente MEMORIZADO para cada fila de tabla
 * Evita re-renders innecesarios cuando otros datos cambian
 * Mejora drasticamente la performance de la tabla (25 filas × 20 columnas)
 */
function FilaSolicitud({
  solicitud,
  isChecked,
  onToggleCheck,
  onAbrirCambiarTelefono,
  onAbrirAsignarGestora,
  onEliminarAsignacion,
  onAbrirEnviarRecordatorio,
  isProcessing,
  getEstadoBadge,
}) {
  return (
    <tr className={`border-b transition-colors duration-200 ${
      isChecked
        ? 'bg-blue-100 border-blue-300 hover:bg-blue-150'
        : 'border-gray-200 hover:bg-gray-50'
    }`}>
      {/* CHECKBOX */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggleCheck}
          className={`w-5 h-5 border-2 rounded cursor-pointer transition-all ${
            isChecked
              ? 'bg-blue-600 border-blue-600 accent-white'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        />
      </td>

      {/* DATOS PRINCIPALES - Origen de la Bolsa */}
      <td className="px-1 py-1 text-sm text-gray-700 max-w-xs">
        <span className="font-medium text-gray-900">{solicitud.descBolsa || solicitud.nombreBolsa || 'Sin clasificar'}</span>
      </td>
      <td className="px-1 py-1 text-sm text-gray-700">{solicitud.fechaPreferidaNoAtendida}</td>
      <td className="px-1 py-1 text-sm">
        <div className="text-xs text-gray-600 font-semibold">{solicitud.tipoDocumento}</div>
        <div className="font-semibold text-blue-600 mt-0.5">{solicitud.dni}</div>
      </td>
      <td className="px-1 py-1 text-sm">
        <div className="font-semibold text-gray-900">{solicitud.paciente}</div>
        <div className="text-xs text-gray-500 mt-0.5">
          <span className="inline-block">{solicitud.sexo}</span>
          <span className="mx-1">•</span>
          <span className="inline-block">{solicitud.edad} años</span>
        </div>
      </td>
      <td className="px-1 py-1 text-sm text-gray-900 whitespace-nowrap">
        <div>{solicitud.telefono}</div>
        {solicitud.telefonoAlterno && solicitud.telefonoAlterno !== 'N/A' && (
          <div className="text-xs text-gray-500" title="Teléfono Alterno">Alterno: {solicitud.telefonoAlterno}</div>
        )}
      </td>
      {/* TIPO DE CITA */}
      <td className="px-1 py-1 text-sm text-gray-700">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap inline-block ${
            solicitud.tipoCita === 'RECITA'
              ? 'bg-blue-100 text-blue-700'
              : solicitud.tipoCita === 'INTERCONSULTA'
              ? 'bg-purple-100 text-purple-700'
              : solicitud.tipoCita === 'VOLUNTARIA'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {solicitud.tipoCita}
        </span>
      </td>

      {/* ESPECIALIDAD Y UBICACIÓN */}
      <td className="px-1 py-1 text-sm text-gray-900">{solicitud.especialidad}</td>
      <td className="px-1 py-1 text-sm text-gray-900 max-w-xs truncate" title={solicitud.ipress}>
        <span className="font-semibold text-blue-600">{solicitud.codigoIpress}</span> - {solicitud.ipress || 'N/A'}
      </td>
      <td className="px-1 py-1 text-sm text-gray-900">{solicitud.red || 'Sin Red'}</td>

      {/* ESTADO */}
      <td className="px-1 py-1">
        <span
          className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap inline-block ${getEstadoBadge(
            solicitud.estado
          )}`}
          title={solicitud.estadoCodigo || 'Código de estado'}
        >
          {solicitud.estadoDisplay}
        </span>
      </td>

      {/* FECHA Y HORA DE CITA */}
      <td className="px-1 py-1 text-xs">
        {solicitud.fechaHoraCita ? (
          <span className="text-indigo-700 font-medium">{solicitud.fechaHoraCita}</span>
        ) : (
          <span className="text-gray-300 italic">—</span>
        )}
      </td>

      {/* MÉDICO ASIGNADO */}
      <td className="px-1 py-1 text-xs">
        {solicitud.nombreMedicoAsignado ? (
          <span className="text-gray-900 font-medium">{solicitud.nombreMedicoAsignado}</span>
        ) : (
          <span className="text-gray-300 italic">—</span>
        )}
      </td>

      {/* ESTADO DE ATENCIÓN (condicion_medica) */}
      <td className="px-1 py-1">
        {solicitud.condicionMedica ? (
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium inline-block ${
            solicitud.condicionMedica === 'Atendido'
              ? 'bg-emerald-100 text-emerald-800'
              : solicitud.condicionMedica === 'Deserción' || solicitud.condicionMedica === 'Desercion'
              ? 'bg-red-100 text-red-800'
              : solicitud.condicionMedica === 'Pendiente'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {solicitud.condicionMedica}
          </span>
        ) : (
          <span className="text-gray-300 italic text-[10px]">—</span>
        )}
      </td>

      {/* FECHA DE ATENCIÓN MÉDICA */}
      <td className="px-1 py-1 text-xs">
        {solicitud.fechaAtencionMedica ? (
          <span className="text-indigo-700 font-medium">{solicitud.fechaAtencionMedica}</span>
        ) : (
          <span className="text-gray-300 italic">—</span>
        )}
      </td>

      {/* FECHA ASIGNACIÓN */}
      <td className="px-1 py-1 text-xs text-gray-600">
        {solicitud.fechaAsignacionFormato ? (
          <span className="text-gray-900 font-medium">{solicitud.fechaAsignacionFormato}</span>
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </td>

      {/* GESTORA ASIGNADA */}
      <td className="px-1 py-1 text-sm">
        {solicitud.gestoraAsignada ? (
          <span className="font-semibold text-green-700">{solicitud.gestoraAsignada}</span>
        ) : (
          <span className="text-gray-400 italic">Sin asignar</span>
        )}
      </td>

      {/* FECHA CAMBIO ESTADO */}
      <td className="px-1 py-1 text-sm text-gray-600">
        {solicitud.fechaCambioEstado ? (
          <span className="text-blue-700 font-medium">{solicitud.fechaCambioEstado}</span>
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </td>

      {/* USUARIO CAMBIO ESTADO */}
      <td className="px-1 py-1 text-sm text-gray-600">
        {solicitud.usuarioCambioEstado ? (
          <span className="text-gray-900 font-medium">{solicitud.usuarioCambioEstado}</span>
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </td>

      {/* ACCIONES */}
      <td className="px-1 py-1 text-center">
        <div className="flex items-center justify-center gap-1">
          {/* Asignar/Reasignar Gestora */}
          {!solicitud.gestoraAsignada && (
            <button
              onClick={() => onAbrirAsignarGestora(solicitud)}
              className="p-1.5 hover:bg-blue-100 rounded-md transition-colors text-blue-600 disabled:opacity-50"
              title="Asignar gestora de citas"
              disabled={isProcessing}
            >
              <UserPlus size={16} />
            </button>
          )}

          {solicitud.gestoraAsignada && (
            <button
              onClick={() => onAbrirAsignarGestora(solicitud)}
              className="p-1.5 hover:bg-blue-100 rounded-md transition-colors text-blue-600 disabled:opacity-50"
              title="Reasignar gestora"
              disabled={isProcessing}
            >
              <Users size={16} />
            </button>
          )}

          {/* Eliminar Asignación */}
          {solicitud.gestoraAsignada && (
            <button
              onClick={() => onEliminarAsignacion(solicitud)}
              className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-red-600 disabled:opacity-50"
              title="Eliminar asignación"
              disabled={isProcessing}
            >
              <X size={16} />
            </button>
          )}

          {/* Prioridad (deshabilitado) */}
          <button
            className="p-1.5 hover:bg-yellow-100 rounded-md transition-colors text-yellow-600 disabled:opacity-50"
            title="Marcar prioridad (próximamente)"
            disabled={true}
          >
            <FileText size={16} />
          </button>

          {/* Cambiar Teléfono */}
          <button
            onClick={() => onAbrirCambiarTelefono(solicitud)}
            className="p-1.5 hover:bg-purple-100 rounded-md transition-colors text-purple-600 disabled:opacity-50"
            title="Cambiar teléfono"
            disabled={isProcessing}
          >
            <Phone size={16} />
          </button>

          {/* Enviar Recordatorio */}
          <button
            onClick={() => onAbrirEnviarRecordatorio(solicitud)}
            className="p-1.5 hover:bg-green-100 rounded-md transition-colors text-green-600 disabled:opacity-50"
            title="Enviar recordatorio"
            disabled={isProcessing}
          >
            <Download size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ✨ Memorizar: solo re-renderizar si las props cambian
export default React.memo(FilaSolicitud, (prevProps, nextProps) => {
  // Comparación custom comparando por ID y valores en lugar de referencias
  return (
    prevProps.solicitud?.id === nextProps.solicitud?.id &&
    prevProps.isChecked === nextProps.isChecked &&
    prevProps.isProcessing === nextProps.isProcessing &&
    prevProps.getEstadoBadge === nextProps.getEstadoBadge
  );
});

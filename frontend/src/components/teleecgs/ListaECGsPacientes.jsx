import React from "react";
import { Eye, Download, Trash2, Calendar, User, Phone, CheckCircle, XCircle, Loader } from "lucide-react";

/**
 * 📋 Tabla de ECGs por pacientes
 * ✅ v3.0.0 - Actualizado para mostrar estados transformados y observaciones
 */
export default function ListaECGsPacientes({
  ecgs,
  onVer,
  onDescargar,
  onEliminar,
  onProcesar,
  onRechazar,
  accionando = false,
  imagenEnAccion = null
}) {
  const getEstadoBadge = (estado) => {
    // v3.0.0: Soportar nuevos estados + transformados
    const estilos = {
      // Estados transformados para usuario EXTERNO
      ENVIADA: "bg-blue-100 text-blue-800 border border-blue-300",
      RECHAZADA: "bg-red-100 text-red-800 border border-red-300",
      ATENDIDA: "bg-green-100 text-green-800 border border-green-300",
      // Estados transformados para CENATE
      PENDIENTE: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      OBSERVADA: "bg-purple-100 text-purple-800 border border-purple-300",
      // Legacy (deprecated)
      PROCESADA: "bg-green-100 text-green-800 border border-green-300",
    };
    return estilos[estado] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  const obtenerEstadoMostrado = (ecg) => {
    // v3.0.0: Preferir estado transformado si está disponible
    return ecg.estadoTransformado || ecg.estado;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-PE");
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Fecha
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              DNI
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Paciente
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Teléfono
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Edad
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Género
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Estado
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {ecgs.map((ecg) => (
            <tr
              key={ecg.idImagen}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatearFecha(ecg.fechaEnvio)}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {ecg.numDocPaciente}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {ecg.nombresPaciente} {ecg.apellidosPaciente}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ecg.nombreArchivo}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {ecg.telefonoPrincipalPaciente || "-"}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {ecg.edadPaciente || "-"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                {ecg.generoPaciente || "-"}
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="space-y-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(obtenerEstadoMostrado(ecg))}`}>
                    {obtenerEstadoMostrado(ecg)}
                  </span>
                  {/* v3.0.0: Mostrar observaciones si existen */}
                  {ecg.observaciones && (
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                      <p className="font-medium">💬 Observaciones:</p>
                      <p>{ecg.observaciones}</p>
                    </div>
                  )}
                  {/* Mostrar si fue subsanada */}
                  {ecg.fueSubsanado && (
                    <div className="text-xs text-green-600 mt-2 p-2 bg-green-50 rounded">
                      ✅ Subsanada (hay una versión mejorada)
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Ver */}
                  <button
                    onClick={() => onVer(ecg)}
                    disabled={accionando && imagenEnAccion === ecg.idImagen}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ver imagen"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Descargar */}
                  <button
                    onClick={() => onDescargar(ecg.idImagen, ecg.nombreArchivo)}
                    disabled={accionando && imagenEnAccion === ecg.idImagen}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* v3.0.0: Procesar (solo visible en estado PENDIENTE/ENVIADA) */}
                  {(ecg.estado === "PENDIENTE" || ecg.estado === "ENVIADA") && onProcesar && (
                    <button
                      onClick={() => onProcesar(ecg.idImagen)}
                      disabled={accionando && imagenEnAccion === ecg.idImagen}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Aceptar/Procesar"
                    >
                      {accionando && imagenEnAccion === ecg.idImagen ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* v3.0.0: Rechazar (solo visible en estado PENDIENTE/ENVIADA) */}
                  {(ecg.estado === "PENDIENTE" || ecg.estado === "ENVIADA") && onRechazar && (
                    <button
                      onClick={() => onRechazar(ecg.idImagen)}
                      disabled={accionando && imagenEnAccion === ecg.idImagen}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Rechazar"
                    >
                      {accionando && imagenEnAccion === ecg.idImagen ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Eliminar */}
                  <button
                    onClick={() => onEliminar(ecg.idImagen)}
                    disabled={accionando && imagenEnAccion === ecg.idImagen}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Eliminar"
                  >
                    {accionando && imagenEnAccion === ecg.idImagen ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

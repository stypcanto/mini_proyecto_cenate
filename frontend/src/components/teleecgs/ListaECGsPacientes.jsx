import React from "react";
import { Eye, Download, Trash2, Calendar, User, Phone, CheckCircle, XCircle, Loader } from "lucide-react";

/**
 * 📋 Tabla de ECGs por pacientes
 * ✅ v1.1.0 - Agregadas acciones Procesar y Rechazar para PENDIENTE
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
    const estilos = {
      PENDIENTE:
        "bg-yellow-100 text-yellow-800 border border-yellow-300",
      PROCESADA: "bg-green-100 text-green-800 border border-green-300",
      RECHAZADA: "bg-red-100 text-red-800 border border-red-300",
    };
    return estilos[estado] || estilos.PENDIENTE;
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
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(ecg.estado)}`}>
                  {ecg.estado}
                </span>
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

                  {/* Procesar (si está pendiente) */}
                  {ecg.estado === "PENDIENTE" && (
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

                  {/* Rechazar (si está pendiente) */}
                  {ecg.estado === "PENDIENTE" && (
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

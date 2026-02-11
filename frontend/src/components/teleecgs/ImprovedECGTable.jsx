/**
 * 🏥 ImprovedECGTable.jsx
 * Tabla mejorada de EKGs con información clínica
 * v1.0.0 - CENATE 2026
 */

import React, { useState } from "react";
import {
  Eye,
  Download,
  Trash2,
  Clock,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Filter,
} from "lucide-react";
import MedicalRiskIndicator, { calcularNivelRiesgo } from "./MedicalRiskIndicator";

export default function ImprovedECGTable({
  ecgs = [],
  onVer = () => {},
  onDescargar = () => {},
  onEliminar = () => {},
  loading = false,
}) {
  const [filtroRiesgo, setFiltroRiesgo] = useState("todos"); // todos, critico, urgente, moderado, rutina
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Enriquecer EKGs con información de riesgo calculada
  const ecgsEnriquecidos = ecgs.map((ecg) => {
    let tiempoMinutos = 0;
    if (ecg.tiempoTranscurrido) {
      if (typeof ecg.tiempoTranscurrido === "string") {
        if (ecg.tiempoTranscurrido.includes("d")) {
          tiempoMinutos = parseInt(ecg.tiempoTranscurrido) * 1440;
        } else if (ecg.tiempoTranscurrido.includes("h")) {
          tiempoMinutos = parseInt(ecg.tiempoTranscurrido) * 60;
        } else if (ecg.tiempoTranscurrido.includes("m")) {
          tiempoMinutos = parseInt(ecg.tiempoTranscurrido);
        }
      }
    }

    const riesgo = calcularNivelRiesgo(tiempoMinutos, ecg.esUrgente, ecg.edad);
    return { ...ecg, riesgo, tiempoMinutos };
  });

  // Filtrar
  const ecgsFiltrados = ecgsEnriquecidos.filter((ecg) => {
    const coincideRiesgo =
      filtroRiesgo === "todos" || ecg.riesgo.nivel === filtroRiesgo;
    const coincideEstado =
      filtroEstado === "todos" || ecg.estado === filtroEstado;
    return coincideRiesgo && coincideEstado;
  });

  // Ordenar por riesgo (críticos primero)
  const nivelPrioridad = { "CRÍTICO": 0, "URGENTE": 1, "MODERADO": 2, "RUTINA": 3 };
  const ecgsOrdenados = [...ecgsFiltrados].sort(
    (a, b) => nivelPrioridad[a.riesgo.nivel] - nivelPrioridad[b.riesgo.nivel]
  );

  const estados = [...new Set(ecgs.map((e) => e.estado))];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando datos clínicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-700">Filtrar por:</span>
        </div>

        {/* Filtro Riesgo */}
        <select
          value={filtroRiesgo}
          onChange={(e) => setFiltroRiesgo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los riesgos</option>
          <option value="CRÍTICO">🔴 Críticos</option>
          <option value="URGENTE">🟠 Urgentes</option>
          <option value="MODERADO">🟡 Moderados</option>
          <option value="RUTINA">🟢 Rutina</option>
        </select>

        {/* Filtro Estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los estados</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        {/* Resumen */}
        <div className="ml-auto text-sm text-gray-600 font-medium">
          Mostrando {ecgsOrdenados.length} de {ecgs.length} registros
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {ecgsOrdenados.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No hay registros que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Riesgo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Edad/Género
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Teléfono
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Tiempo
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Imágenes
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ecgsOrdenados.map((ecg, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-gray-50 transition-colors ${
                      ecg.riesgo.nivel === "CRÍTICO"
                        ? "bg-red-50"
                        : ecg.riesgo.nivel === "URGENTE"
                        ? "bg-orange-50"
                        : ecg.riesgo.nivel === "MODERADO"
                        ? "bg-yellow-50"
                        : "bg-white"
                    }`}
                  >
                    {/* Riesgo */}
                    <td className="px-6 py-4">
                      <MedicalRiskIndicator
                        tiempoTranscurrido={ecg.tiempoTranscurrido || "0m"}
                        esUrgente={ecg.esUrgente}
                        tamano="sm"
                      />
                    </td>

                    {/* Paciente */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {ecg.nombrePaciente}
                      </div>
                      <div className="text-xs text-gray-500">
                        DNI: {ecg.dni || ecg.numDocPaciente}
                      </div>
                    </td>

                    {/* Edad/Género */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ecg.edad && typeof ecg.edad === "string"
                        ? ecg.edad.split("/")[0]
                        : ecg.edad || "-"}{" "}
                      años / {ecg.genero === "M" ? "♂️" : ecg.genero === "F" ? "♀️" : "-"}
                    </td>

                    {/* Teléfono */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ecg.telefono || "-"}
                    </td>

                    {/* Tiempo de Espera */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{ecg.tiempoTranscurrido || "Sin datos"}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ecg.estado === "ENVIADA"
                            ? "bg-yellow-100 text-yellow-800"
                            : ecg.estado === "OBSERVADA"
                            ? "bg-blue-100 text-blue-800"
                            : ecg.estado === "ATENDIDA"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ecg.estado || "Sin estado"}
                      </span>
                    </td>

                    {/* Cantidad de Imágenes */}
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {ecg.cantidadImagenes || 1}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onVer(ecg)}
                          title="Ver imágenes"
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDescargar(ecg.idImagen, ecg.nombreArchivo)}
                          title="Descargar"
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEliminar(ecg.idImagen)}
                          title="Eliminar"
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================================================
// 🔍 RevisarDuplicados.jsx – Auditoría de Duplicados Potenciales (CENATE 2025)
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, AlertTriangle, Eye, Check, X,
  ChevronLeft, ChevronRight, Search, Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import aseguradosService from "../../services/aseguradosService";

export default function RevisarDuplicados() {
  const navigate = useNavigate();
  const [duplicados, setDuplicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [tamanoPagina] = useState(25);
  const [ordenar, setOrdenar] = useState("dni");
  const [busqueda, setBusqueda] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetalle, setShowDetalle] = useState(false);

  // Cargar duplicados al montar o cambiar paginación
  useEffect(() => {
    cargarDuplicados();
  }, [paginaActual, ordenar]);

  const cargarDuplicados = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/asegurados/duplicados/potenciales?page=${paginaActual}&size=${tamanoPagina}&ordenar=${ordenar}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (!response.ok) throw new Error("Error al cargar duplicados");

      const data = await response.json();
      setDuplicados(data.content || []);
      setTotalPaginas(data.totalPages || 0);
      setTotalElementos(data.totalElements || 0);
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Error al cargar duplicados");
      setDuplicados([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalles = async (docPaciente) => {
    try {
      const response = await fetch(`/api/asegurados/duplicado/${docPaciente}`);
      if (!response.ok) throw new Error("Error al cargar detalles");

      const data = await response.json();
      setSelectedItem(data);
      setShowDetalle(true);
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Error al cargar detalles del duplicado");
    }
  };

  const duplicadosFiltrados = duplicados.filter((d) =>
    d.paciente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.docPaciente?.includes(busqueda)
  );

  const exportarCSV = () => {
    const headers = ["DNI", "Nombre", "Edad", "IPRESS", "Vigencia", "Marcado"];
    const rows = duplicados.map((d) => [
      d.docPaciente,
      d.paciente,
      d.edad || "-",
      d.nombreIpress || "-",
      d.vigencia ? "Sí" : "No",
      new Date(d.marcadoAt).toLocaleDateString("es-PE"),
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `duplicados_asegurados_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV exportado correctamente");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/asegurados/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft size={20} /> Volver al módulo
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Revisión de Duplicados Potenciales
              </h1>
              <p className="text-gray-600 mt-1">
                Encontrados {totalElementos} registros con DNI conflictivos que requieren revisión
              </p>
              <div className="mt-3 p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ Nota:</strong> Estos registros tienen DNI de 7 caracteres que coinciden con DNI de 8 caracteres ya existentes.
                  Se requiere investigación para determinar cuál es el registro correcto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ordenamiento */}
          <select
            value={ordenar}
            onChange={(e) => {
              setOrdenar(e.target.value);
              setPaginaActual(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dni">Ordenar por DNI</option>
            <option value="nombre">Ordenar por Nombre</option>
            <option value="fecha">Ordenar por Fecha</option>
          </select>

          {/* Exportar */}
          <button
            onClick={exportarCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabla de duplicados */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : duplicadosFiltrados.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg">No se encontraron duplicados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">DNI</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Edad</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">IPRESS</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vigencia</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {duplicadosFiltrados.map((dup) => (
                    <tr key={dup.pkAsegurado} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-800">{dup.docPaciente}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{dup.paciente}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dup.edad || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dup.nombreIpress || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            dup.vigencia
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {dup.vigencia ? "✓ Activo" : "✗ Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => cargarDetalles(dup.docPaciente)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                        >
                          <Eye size={16} /> Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Página {paginaActual + 1} de {totalPaginas} ({totalElementos} registros)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaActual(Math.max(0, paginaActual - 1))}
                  disabled={paginaActual === 0}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPaginaActual(Math.min(totalPaginas - 1, paginaActual + 1))}
                  disabled={paginaActual >= totalPaginas - 1}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetalle && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h2 className="text-2xl font-bold">Detalles del Duplicado</h2>
              <p className="text-blue-100 mt-1">DNI: {selectedItem.docPaciente}</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Registro de 7 caracteres */}
                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                  <h3 className="font-bold text-amber-900 mb-3">📋 Registro de 7 caracteres (MARCADO)</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>PK:</strong> <span className="font-mono">{selectedItem.pkAsegurado7}</span>
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedItem.paciente7}
                    </p>
                    <p className="text-xs text-amber-700 mt-2 p-2 bg-white rounded">
                      ⚠️ Este es el registro que fue marcado como duplicado potencial
                    </p>
                  </div>
                </div>

                {/* Registro de 8 caracteres */}
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h3 className="font-bold text-green-900 mb-3">✓ Registro de 8 caracteres (PRIORITARIO)</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>PK:</strong> <span className="font-mono">{selectedItem.pkAsegurado8}</span>
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedItem.paciente8}
                    </p>
                    <p className="text-xs text-green-700 mt-2 p-2 bg-white rounded">
                      ✓ Este es el registro considerado prioritario (DNI estándar)
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado y fecha */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm">
                  <strong>Estado:</strong>{" "}
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    {selectedItem.estado}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Marcado:</strong> {new Date(selectedItem.marcadoAt).toLocaleString("es-PE")}
                </p>
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-blue-900 mb-2">📌 Próximos pasos:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Verificar en ESSI cuál es el registro correcto</li>
                  <li>Comparar nombres y datos personales</li>
                  <li>Determinar si se debe desactivar uno de los registros</li>
                  <li>Documentar la decisión en auditoría</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetalle(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

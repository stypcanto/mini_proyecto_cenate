// ========================================================================
// 🔍 RevisarDuplicados.jsx – Auditoría de Duplicados Potenciales (CENATE 2025)
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, AlertTriangle, Eye, Check, X,
  ChevronLeft, ChevronRight, Search, Download,
  Activity, TrendingDown, TrendingUp, BarChart3
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
  const [resolving, setResolving] = useState(false);

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

  const resolverDuplicado = async (pkAseguradoDesactivar, decision) => {
    try {
      setResolving(true);
      const response = await fetch("/api/asegurados/duplicados/resolver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pkAseguradoDesactivar,
          docPaciente: selectedItem.docPaciente,
          decision
        })
      });

      if (!response.ok) throw new Error("Error al resolver");

      const data = await response.json();
      toast.success(data.message || "Duplicado resuelto correctamente ✅");

      setShowDetalle(false);
      setSelectedItem(null);
      // Recargar duplicados
      cargarDuplicados();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al resolver duplicado");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-6">
      {/* Botón Volver */}
      <button
        onClick={() => navigate("/asegurados/dashboard")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
      >
        <ArrowLeft size={20} /> Volver al módulo
      </button>

      {/* Cards de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total de Duplicados */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-5 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total de Duplicados</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{totalElementos}</p>
              <p className="text-xs text-blue-600 mt-2">Registros con conflictos detectados</p>
            </div>
            <BarChart3 className="text-blue-400 opacity-70" size={32} />
          </div>
        </div>

        {/* Activos */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-5 border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Duplicados Activos</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {duplicados.filter(d => d.vigencia).length}
              </p>
              <p className="text-xs text-green-600 mt-2">Con vigencia actual</p>
            </div>
            <TrendingUp className="text-green-400 opacity-70" size={32} />
          </div>
        </div>

        {/* Inactivos */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-5 border-l-4 border-red-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Duplicados Inactivos</p>
              <p className="text-3xl font-bold text-red-700 mt-2">
                {duplicados.filter(d => !d.vigencia).length}
              </p>
              <p className="text-xs text-red-600 mt-2">Sin vigencia válida</p>
            </div>
            <TrendingDown className="text-red-400 opacity-70" size={32} />
          </div>
        </div>

        {/* Porcentaje Vigencia */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-md p-5 border-l-4 border-amber-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">% Vigencia</p>
              <p className="text-3xl font-bold text-amber-700 mt-2">
                {totalElementos > 0 ? Math.round((duplicados.filter(d => d.vigencia).length / totalElementos) * 100) : 0}%
              </p>
              <p className="text-xs text-amber-600 mt-2">Tasa de registros activos</p>
            </div>
            <Activity className="text-amber-400 opacity-70" size={32} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
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
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sticky top-0 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Detalles del Duplicado</h2>
                  <p className="text-blue-100 mt-1">DNI: {selectedItem.docPaciente}</p>
                </div>
                <button
                  onClick={() => setShowDetalle(false)}
                  className="text-white hover:bg-blue-800 rounded-full p-2 transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {/* Tabla comparativa */}
              <div className="mb-5 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/3">Tipo de Registro</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/3">PK</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-amber-100 bg-amber-50 hover:bg-amber-100">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-amber-900">📋 7 caracteres</span>
                        <span className="block text-xs text-amber-700 mt-0.5">MARCADO</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-800">{selectedItem.pkAsegurado7}</td>
                      <td className="px-4 py-3 text-gray-800">{selectedItem.paciente7}</td>
                    </tr>
                    <tr className="bg-green-50 hover:bg-green-100">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-green-900">✓ 8 caracteres</span>
                        <span className="block text-xs text-green-700 mt-0.5">PRIORITARIO</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-800">{selectedItem.pkAsegurado8}</td>
                      <td className="px-4 py-3 text-gray-800">{selectedItem.paciente8}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Información adicional compacta */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                {/* Estado */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Estado</p>
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    {selectedItem.estado}
                  </span>
                </div>

                {/* Fecha */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Marcado</p>
                  <p className="text-xs text-gray-700">{new Date(selectedItem.marcadoAt).toLocaleDateString("es-PE")}</p>
                </div>

                {/* DNI */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">DNI</p>
                  <p className="font-mono font-bold text-gray-800">{selectedItem.docPaciente}</p>
                </div>
              </div>

              {/* Instrucciones y recomendación en una fila */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-bold text-blue-900 mb-2 text-xs">📌 Próximos pasos:</h4>
                  <ol className="text-xs text-blue-800 space-y-0.5 list-decimal list-inside">
                    <li>Verificar en ESSI cuál es correcto</li>
                    <li>Comparar datos personales</li>
                    <li>Seleccionar "Desactivar" incorrecto</li>
                    <li>Quedaría en auditoría</li>
                  </ol>
                </div>

                {/* Recomendación */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-900 mb-1">💡 Recomendación:</p>
                  <p className="text-xs text-green-800">Mantener registro de 8 dígitos (estándar). Desactivar de 7 dígitos.</p>
                </div>
              </div>

              {/* Opciones de Resolución */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-3 text-sm">✅ Resolver Duplicado</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => resolverDuplicado(selectedItem.pkAsegurado7, "desactivar_7_digitos")}
                    disabled={resolving}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50 text-sm font-medium"
                  >
                    {resolving ? "Procesando..." : "❌ Desactivar 7 dígitos"}
                  </button>
                  <button
                    onClick={() => resolverDuplicado(selectedItem.pkAsegurado8, "desactivar_8_digitos")}
                    disabled={resolving}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-medium"
                  >
                    {resolving ? "Procesando..." : "❌ Desactivar 8 dígitos"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer sticky */}
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-between sticky bottom-0">
              <button
                onClick={() => setShowDetalle(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                Cerrar
              </button>
              <a
                href="http://10.56.1.158/sgss/servlet/hmain"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                🔗 Abrir ESSI
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

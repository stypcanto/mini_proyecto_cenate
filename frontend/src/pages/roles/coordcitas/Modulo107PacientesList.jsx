// ========================================================================
// 👥 Modulo107PacientesList.jsx – Listado de Pacientes Módulo 107
// ========================================================================
// Versión especializada para visualizar pacientes con estado de atención

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Filter,
  Download,
  Phone,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import apiClient from "../../../lib/apiClient";

export default function Modulo107PacientesList() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterDepartamento, setFilterDepartamento] = useState("");
  const [filterIpress, setFilterIpress] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [stats, setStats] = useState({
    total: 0,
    atendidos: 0,
    pendientes: 0,
    en_proceso: 0,
    cancelados: 0,
  });

  // Cargar pacientes desde la BD
  const cargarPacientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/bolsa107/pacientes", true);
      const data = response || [];
      setPacientes(data);

      // Calcular estadísticas por estado
      const atendidos = data.filter((p) => p.estado_atencion === "ATENDIDO").length;
      const pendientes = data.filter((p) => p.estado_atencion === "PENDIENTE").length;
      const en_proceso = data.filter((p) => p.estado_atencion === "EN_PROCESO").length;
      const cancelados = data.filter((p) => p.estado_atencion === "CANCELADO").length;

      setStats({
        total: data.length,
        atendidos,
        pendientes,
        en_proceso,
        cancelados,
      });
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
      toast.error("Error al cargar los pacientes del Módulo 107");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  // Filtrar pacientes
  const pacientesFiltrados = pacientes
    .filter((p) => {
      const matchSearch =
        !searchTerm ||
        p.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telefono?.includes(searchTerm);

      const matchEstado = !filterEstado || p.estado_atencion === filterEstado;
      const matchDepartamento = !filterDepartamento || p.departamento === filterDepartamento;
      const matchIpress = !filterIpress || p.desc_ipress === filterIpress;

      return matchSearch && matchEstado && matchDepartamento && matchIpress;
    })
    .sort((a, b) => {
      const fechaA = new Date(a.created_at || 0);
      const fechaB = new Date(b.created_at || 0);
      return fechaA - fechaB;
    });

  // Paginación
  const totalPages = Math.ceil(pacientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pacientesPaginados = pacientesFiltrados.slice(startIndex, endIndex);

  // Valores únicos para filtros
  const estadosUnicos = [...new Set(pacientes.map((p) => p.estado_atencion).filter(Boolean))];
  const departamentosUnicos = [...new Set(pacientes.map((p) => p.departamento).filter(Boolean))];
  const ipressUnicas = [...new Set(pacientes.map((p) => p.desc_ipress).filter(Boolean))];

  // Manejar selección
  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const idsEnPaginaActual = pacientesPaginados.map((p) => p.id_item);
    const todosSeleccionados = idsEnPaginaActual.every((id) => selectedIds.includes(id));

    if (todosSeleccionados) {
      setSelectedIds((prev) => prev.filter((id) => !idsEnPaginaActual.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...idsEnPaginaActual])]);
    }
  };

  // Resetear página cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEstado, filterDepartamento, filterIpress]);

  // Exportar a Excel
  const handleExportar = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un paciente para exportar");
      return;
    }

    try {
      const pacientesExportar = pacientes.filter((p) => selectedIds.includes(p.id_item));

      const datosExcel = pacientesExportar.map((p) => ({
        "Fecha Registro": p.created_at
          ? (() => {
              const fecha = new Date(p.created_at);
              const dia = String(fecha.getDate()).padStart(2, "0");
              const mes = String(fecha.getMonth() + 1).padStart(2, "0");
              const anio = fecha.getFullYear();
              return `${dia}/${mes}/${anio}`;
            })()
          : "",
        DNI: p.numero_documento || "",
        Paciente: p.paciente || "",
        Sexo: p.sexo || "",
        Edad: calcularEdad(p.fecha_nacimiento) || "",
        Teléfono: p.telefono || "",
        "IPRESS Nombre": p.desc_ipress || "",
        Departamento: p.departamento || "",
        "Estado Atención": p.estado_atencion || "",
        "Fecha Atención": p.fecha_atencion || "",
        Especialista: p.especialista || "",
      }));

      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pacientes Módulo 107");

      const colWidths = [
        { wch: 15 },
        { wch: 12 },
        { wch: 35 },
        { wch: 6 },
        { wch: 6 },
        { wch: 15 },
        { wch: 50 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
      ];
      ws["!cols"] = colWidths;

      const fecha = new Date();
      const nombreArchivo = `Pacientes_Modulo107_${fecha.getFullYear()}${String(
        fecha.getMonth() + 1
      ).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}_${String(
        fecha.getHours()
      ).padStart(2, "0")}${String(fecha.getMinutes()).padStart(2, "0")}.xlsx`;

      XLSX.writeFile(wb, nombreArchivo);

      toast.success(`✅ Se exportaron ${selectedIds.length} pacientes correctamente`);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("❌ Error al exportar los pacientes a Excel");
    }
  };

  // Calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "—";
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Badge para estado
  const getEstadoBadge = (estado) => {
    const estilos = {
      ATENDIDO: "bg-green-100 text-green-800 border-green-300",
      PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
      EN_PROCESO: "bg-blue-100 text-blue-800 border-blue-300",
      CANCELADO: "bg-red-100 text-red-800 border-red-300",
    };

    const iconos = {
      ATENDIDO: <CheckCircle2 className="w-4 h-4" />,
      PENDIENTE: <Clock className="w-4 h-4" />,
      EN_PROCESO: <RefreshCw className="w-4 h-4 animate-spin" />,
      CANCELADO: <AlertCircle className="w-4 h-4" />,
    };

    return (
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 w-fit ${estilos[estado]}`}>
        {iconos[estado]}
        {estado}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              Pacientes del Módulo 107
            </h1>
            <p className="text-slate-600">Visualización de pacientes y estado de atención</p>
          </div>
          <button
            onClick={cargarPacientes}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Pacientes</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Atendidos</p>
              <p className="text-3xl font-bold text-green-600">{stats.atendidos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">En Proceso</p>
              <p className="text-3xl font-bold text-blue-600">{stats.en_proceso}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Cancelados</p>
              <p className="text-3xl font-bold text-red-600">{stats.cancelados}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por Estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {estadosUnicos.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          {/* Filtro por IPRESS */}
          <select
            value={filterIpress}
            onChange={(e) => setFilterIpress(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las IPRESS</option>
            {ipressUnicas.map((ipress) => (
              <option key={ipress} value={ipress}>
                {ipress}
              </option>
            ))}
          </select>
        </div>

        {/* Acciones masivas */}
        {selectedIds.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">
                {selectedIds.length} paciente{selectedIds.length !== 1 ? "s" : ""} seleccionado
                {selectedIds.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportar}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={
                      pacientesPaginados.length > 0 &&
                      pacientesPaginados.every((p) => selectedIds.includes(p.id_item))
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Registro</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">DNI</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Paciente</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Sexo</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Edad</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">IPRESS</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Estado Atención</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Atención</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Especialista</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center">
                    <RefreshCw className="w-12 h-12 text-slate-300 animate-spin mx-auto mb-2" />
                    <p className="font-medium text-lg text-slate-500">Cargando pacientes...</p>
                  </td>
                </tr>
              ) : pacientesPaginados.length > 0 ? (
                pacientesPaginados.map((paciente) => (
                  <tr key={paciente.id_item} className="border-b border-slate-100 hover:bg-blue-50/30">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(paciente.id_item)}
                        onChange={() => handleSelectOne(paciente.id_item)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {paciente.created_at
                        ? (() => {
                            const fecha = new Date(paciente.created_at);
                            const dia = String(fecha.getDate()).padStart(2, "0");
                            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
                            const anio = fecha.getFullYear();
                            return `${dia}/${mes}/${anio}`;
                          })()
                        : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">{paciente.numero_documento}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{paciente.paciente}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          paciente.sexo === "M"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {paciente.sexo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700">
                      {calcularEdad(paciente.fecha_nacimiento)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        {paciente.desc_ipress ? (
                          <>
                            <span className="text-sm font-medium text-slate-800">{paciente.desc_ipress}</span>
                            <span className="text-xs text-slate-500">Código: {paciente.cod_ipress}</span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Sin IPRESS</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getEstadoBadge(paciente.estado_atencion || "PENDIENTE")}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {paciente.fecha_atencion
                        ? (() => {
                            const fecha = new Date(paciente.fecha_atencion);
                            const dia = String(fecha.getDate()).padStart(2, "0");
                            const mes = String(fecha.getMonth() + 1).padStart(2, "0");
                            const anio = fecha.getFullYear();
                            return `${dia}/${mes}/${anio}`;
                          })()
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {paciente.especialista || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="py-12 text-center">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-lg text-slate-500">No hay pacientes registrados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!loading && pacientesFiltrados.length > 0 && (
          <div className="border-t pt-4 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Mostrando <strong>{startIndex + 1}</strong> a{" "}
                <strong>{Math.min(endIndex, pacientesFiltrados.length)}</strong> de{" "}
                <strong>{pacientesFiltrados.length}</strong> pacientes
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 2) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

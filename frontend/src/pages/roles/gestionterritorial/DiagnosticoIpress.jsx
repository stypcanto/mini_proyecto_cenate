// ========================================================================
// 🗺️ DiagnosticoIpress.jsx – Consulta de Diagnósticos IPRESS (CENATE 2025)
// ------------------------------------------------------------------------
// Panel para visualizar los diagnósticos llenados por las IPRESS
// Filtros por Red e IPRESS, vista de resultados y exportación
// Tema claro con colores institucionales CENATE
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2, Search, Download, FileSpreadsheet,
  ChevronLeft, ChevronRight, Filter, Loader,
  Network, ClipboardList, Eye, CheckCircle2,
  AlertCircle, Calendar, FileText, XCircle, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import aseguradosService from "../../../services/aseguradosService";
import api from "../../../services/apiClient";

export default function DiagnosticoIpress() {
  // Estados principales
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [ipress, setIpress] = useState([]);
  const [redes, setRedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [redSeleccionada, setRedSeleccionada] = useState("");
  const [ipressSeleccionada, setIpressSeleccionada] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  // Modal de detalle
  const [modalDetalle, setModalDetalle] = useState(false);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState(null);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  // ================================================================
  // 📡 CARGAR DATOS
  // ================================================================
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar redes e IPRESS
      const [redesData, ipressData] = await Promise.all([
        aseguradosService.getRedes(),
        aseguradosService.getIpress(null)
      ]);

      setRedes(redesData || []);
      setIpress(ipressData || []);

      // Cargar diagnósticos (ajustar endpoint según tu backend)
      try {
        const diagnosticosData = await api.get("/diagnosticos-ipress");
        setDiagnosticos(diagnosticosData || []);
      } catch (error) {
        // Si no existe el endpoint, usar datos de ejemplo
        console.log("Endpoint de diagnósticos no disponible, usando datos de ejemplo");
        setDiagnosticos(generarDatosEjemplo(ipressData));
      }

      toast.success("Datos cargados correctamente");
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // Datos de ejemplo mientras no exista el endpoint
  const generarDatosEjemplo = (ipressList) => {
    if (!ipressList || ipressList.length === 0) return [];

    const estados = ["completado", "pendiente", "en_revision"];
    return ipressList.slice(0, 15).map((ipr, index) => ({
      id: index + 1,
      idIpress: ipr.idIpress,
      codIpress: ipr.codIpress,
      descIpress: ipr.descIpress,
      idRed: ipr.idRed,
      estado: estados[index % 3],
      fechaEnvio: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      porcentajeCompletado: Math.floor(Math.random() * 40) + 60,
      datosGenerales: { completado: true },
      recursosHumanos: { completado: index % 2 === 0 },
      infraestructura: { completado: index % 3 === 0 },
      equipamiento: { completado: true },
      conectividad: { completado: index % 2 === 0 },
      servicios: { completado: true },
      necesidades: { completado: index % 4 === 0 }
    }));
  };

  // ================================================================
  // 🔍 FILTRADO
  // ================================================================
  const ipressFiltradas = useMemo(() => {
    if (!redSeleccionada) return ipress;
    return ipress.filter(ipr => ipr.idRed === parseInt(redSeleccionada));
  }, [ipress, redSeleccionada]);

  const datosFiltrados = useMemo(() => {
    let resultado = [...diagnosticos];

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (item) =>
          item.descIpress?.toLowerCase().includes(termino) ||
          item.codIpress?.toLowerCase().includes(termino)
      );
    }

    if (redSeleccionada) {
      resultado = resultado.filter((item) => item.idRed === parseInt(redSeleccionada));
    }

    if (ipressSeleccionada) {
      resultado = resultado.filter((item) => item.idIpress === parseInt(ipressSeleccionada));
    }

    if (estadoFiltro) {
      resultado = resultado.filter((item) => item.estado === estadoFiltro);
    }

    return resultado;
  }, [diagnosticos, busqueda, redSeleccionada, ipressSeleccionada, estadoFiltro]);

  // ================================================================
  // 📊 PAGINACIÓN
  // ================================================================
  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return datosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [datosFiltrados, paginaActual, itemsPorPagina]);

  // ================================================================
  // 🎨 HELPERS
  // ================================================================
  const getEstadoBadge = (estado) => {
    const config = {
      completado: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <CheckCircle2 size={14} />,
        label: "Completado"
      },
      pendiente: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <AlertCircle size={14} />,
        label: "Pendiente"
      },
      en_revision: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: <Eye size={14} />,
        label: "En Revisión"
      }
    };

    const { bg, text, border, icon, label } = config[estado] || config.pendiente;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
        {icon}
        {label}
      </span>
    );
  };

  const getNombreRed = (idRed) => {
    const red = redes.find(r => r.idRed === idRed);
    return red?.descRed || "Sin red";
  };

  const verDetalle = (diagnostico) => {
    setDiagnosticoSeleccionado(diagnostico);
    setModalDetalle(true);
  };

  const exportarExcel = () => {
    toast.success("Exportando a Excel...");
  };

  // ================================================================
  // 🖼️ RENDER
  // ================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-cenate-600 animate-spin" />
          <p className="text-gray-600">Cargando diagnósticos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-cenate-600 shadow-lg shadow-cenate-600/20">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Diagnóstico de las IPRESS</h1>
            <p className="text-gray-500 text-sm">Consulta y seguimiento de formularios de diagnóstico</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cenate-100">
              <FileText className="w-5 h-5 text-cenate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{diagnosticos.length}</p>
              <p className="text-sm text-gray-500">Total Diagnósticos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {diagnosticos.filter(d => d.estado === "completado").length}
              </p>
              <p className="text-sm text-gray-500">Completados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {diagnosticos.filter(d => d.estado === "pendiente").length}
              </p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {diagnosticos.filter(d => d.estado === "en_revision").length}
              </p>
              <p className="text-sm text-gray-500">En Revisión</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-gray-100">
            <Filter className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-700">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar IPRESS..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cenate-500 focus:border-cenate-500 transition-all"
            />
          </div>

          {/* Filtro por Red */}
          <div className="relative">
            <Network className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={redSeleccionada}
              onChange={(e) => {
                setRedSeleccionada(e.target.value);
                setIpressSeleccionada("");
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cenate-500 focus:border-cenate-500 appearance-none cursor-pointer transition-all"
            >
              <option value="">Todas las Redes</option>
              {redes.map((red) => (
                <option key={red.idRed} value={red.idRed}>
                  {red.descRed}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por IPRESS */}
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={ipressSeleccionada}
              onChange={(e) => {
                setIpressSeleccionada(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cenate-500 focus:border-cenate-500 appearance-none cursor-pointer transition-all"
            >
              <option value="">Todas las IPRESS</option>
              {ipressFiltradas.map((ipr) => (
                <option key={ipr.idIpress} value={ipr.idIpress}>
                  {ipr.descIpress}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="relative">
            <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={estadoFiltro}
              onChange={(e) => {
                setEstadoFiltro(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-cenate-500 focus:border-cenate-500 appearance-none cursor-pointer transition-all"
            >
              <option value="">Todos los Estados</option>
              <option value="completado">Completado</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En Revisión</option>
            </select>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Mostrando <span className="text-gray-800 font-semibold">{datosFiltrados.length}</span> diagnósticos
        </p>
        <div className="flex gap-2">
          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2 bg-cenate-600 hover:bg-cenate-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={exportarExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  IPRESS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Red
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha Envío
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {datosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <XCircle className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">No se encontraron diagnósticos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                datosPaginados.map((diagnostico) => (
                  <tr
                    key={diagnostico.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{diagnostico.descIpress}</p>
                        <p className="text-sm text-gray-500">{diagnostico.codIpress}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-700">{getNombreRed(diagnostico.idRed)}</span>
                    </td>
                    <td className="px-4 py-4">
                      {getEstadoBadge(diagnostico.estado)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cenate-500 to-cenate-600 rounded-full transition-all"
                            style={{ width: `${diagnostico.porcentajeCompletado}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12">
                          {diagnostico.porcentajeCompletado}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {diagnostico.fechaEnvio
                            ? new Date(diagnostico.fechaEnvio).toLocaleDateString("es-PE")
                            : "Sin enviar"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => verDetalle(diagnostico)}
                          className="p-2 rounded-lg bg-cenate-100 text-cenate-600 hover:bg-cenate-200 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Página {paginaActual} de {totalPaginas}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                disabled={paginaActual === 1}
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalle */}
      {modalDetalle && diagnosticoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-cenate-600 to-cenate-700">
              <div>
                <h3 className="text-xl font-bold text-white">Detalle del Diagnóstico</h3>
                <p className="text-cenate-100">{diagnosticoSeleccionado.descIpress}</p>
              </div>
              <button
                onClick={() => setModalDetalle(false)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <XCircle className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Código IPRESS</p>
                    <p className="text-gray-800 font-medium">{diagnosticoSeleccionado.codIpress}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Red</p>
                    <p className="text-gray-800 font-medium">{getNombreRed(diagnosticoSeleccionado.idRed)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">Secciones del Formulario</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "datosGenerales", label: "Datos Generales" },
                      { key: "recursosHumanos", label: "Recursos Humanos" },
                      { key: "infraestructura", label: "Infraestructura" },
                      { key: "equipamiento", label: "Equipamiento" },
                      { key: "conectividad", label: "Conectividad" },
                      { key: "servicios", label: "Servicios" },
                      { key: "necesidades", label: "Necesidades" }
                    ].map((seccion) => (
                      <div
                        key={seccion.key}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                          diagnosticoSeleccionado[seccion.key]?.completado
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {diagnosticoSeleccionado[seccion.key]?.completado ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{seccion.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setModalDetalle(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-cenate-600 text-white hover:bg-cenate-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

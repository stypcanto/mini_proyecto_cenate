// ========================================================================
// DiagnosticoIpress.jsx - Consulta de Diagnosticos IPRESS (CENATE 2025)
// ------------------------------------------------------------------------
// Panel para visualizar los diagnosticos llenados por las IPRESS
// Muestra estado de firma, permite ver/descargar PDF
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2, Search, Download, FileSpreadsheet,
  ChevronLeft, ChevronRight, Filter, Loader,
  Network, ClipboardList, Eye, CheckCircle2,
  AlertCircle, Calendar, FileText, XCircle, RefreshCw,
  Shield, FileCheck, User, Fingerprint, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import aseguradosService from "../../../services/aseguradosService";
import api from '../../lib/apiClient';

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
  const [cargandoPdf, setCargandoPdf] = useState(false);

  // Paginacion
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  // Multi-select para descarga batch (v1.45.3)
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [cargandoZip, setCargandoZip] = useState(false);

  // ================================================================
  // CARGAR DATOS
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

      // Cargar diagnosticos reales del backend
      try {
        const diagnosticosData = await api.get("/formulario-diagnostico");
        setDiagnosticos(diagnosticosData || []);
      } catch (error) {
        console.log("Error al cargar diagnosticos:", error);
        setDiagnosticos([]);
      }

      toast.success("Datos cargados correctamente");
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // FILTRADO
  // ================================================================

  // Mostrar todas las redes disponibles (no solo las que tienen diagnósticos)
  const redesConDiagnosticos = useMemo(() => {
    return redes;
  }, [redes]);

  // Mostrar todas las IPRESS disponibles (no solo las que tienen diagnósticos)
  const ipressConDiagnosticos = useMemo(() => {
    return ipress;
  }, [ipress]);

  // Filtrar IPRESS por red seleccionada
  const ipressFiltradas = useMemo(() => {
    if (!redSeleccionada) return ipressConDiagnosticos;
    return ipressConDiagnosticos.filter(ipr => ipr.idRed === parseInt(redSeleccionada));
  }, [ipressConDiagnosticos, redSeleccionada]);

  const datosFiltrados = useMemo(() => {
    let resultado = [...diagnosticos];

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (item) =>
          item.nombreIpress?.toLowerCase().includes(termino) ||
          item.codigoIpress?.toLowerCase().includes(termino) ||
          item.nombreFirmante?.toLowerCase().includes(termino)
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
  // PAGINACION
  // ================================================================
  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return datosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [datosFiltrados, paginaActual, itemsPorPagina]);

  // ================================================================
  // HELPERS
  // ================================================================
  const getEstadoBadge = (estado) => {
    const config = {
      FIRMADO: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: <Shield size={14} />,
        label: "Firmado"
      },
      ENVIADO: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <CheckCircle2 size={14} />,
        label: "Enviado"
      },
      EN_PROCESO: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <AlertCircle size={14} />,
        label: "En Proceso"
      },
      APROBADO: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: <FileCheck size={14} />,
        label: "Aprobado"
      },
      RECHAZADO: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle size={14} />,
        label: "Rechazado"
      }
    };

    const c = config[estado] || config.EN_PROCESO;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
        {c.icon}
        {c.label}
      </span>
    );
  };

  const getFirmaBadge = (diagnostico) => {
    if (diagnostico.firmaDigital || diagnostico.fechaFirma) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            <Fingerprint size={12} />
            Firmado
          </span>
          {diagnostico.nombreFirmante && (
            <span className="text-xs text-gray-500">{diagnostico.nombreFirmante}</span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <AlertCircle size={12} />
        Sin firma
      </span>
    );
  };

  const verDetalle = async (diagnostico) => {
    setDiagnosticoSeleccionado(diagnostico);
    setModalDetalle(true);
  };

  const descargarPdf = async (idFormulario) => {
    setCargandoPdf(true);
    try {
      const token = localStorage.getItem('auth.token');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

      const response = await fetch(`${baseUrl}/formulario-diagnostico/${idFormulario}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formulario_${idFormulario}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("PDF descargado correctamente");
    } catch (error) {
      console.error("Error descargando PDF:", error);
      toast.error("No se pudo descargar el PDF");
    } finally {
      setCargandoPdf(false);
    }
  };

  const verPdf = async (idFormulario) => {
    setCargandoPdf(true);
    try {
      const token = localStorage.getItem('auth.token');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

      const response = await fetch(`${baseUrl}/formulario-diagnostico/${idFormulario}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error abriendo PDF:", error);
      toast.error("No hay PDF disponible para este formulario");
    } finally {
      setCargandoPdf(false);
    }
  };

  const exportarExcel = () => {
    toast.success("Exportando a Excel...");
    // Implementar exportacion a Excel
  };

  // ================================================================
  // MULTI-SELECT PARA DESCARGA BATCH (v1.45.3)
  // ================================================================

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  };

  const toggleSeleccionarTodos = () => {
    if (seleccionados.size === datosPaginados.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(datosPaginados.map(d => d.idFormulario)));
    }
  };

  const limpiarSeleccion = () => {
    setSeleccionados(new Set());
  };

  const descargarPdfsSeleccionados = async () => {
    if (seleccionados.size === 0) {
      toast.warning("Por favor, selecciona al menos un diagnóstico");
      return;
    }

    if (seleccionados.size > 50) {
      toast.error("No se pueden descargar más de 50 PDFs a la vez");
      return;
    }

    setCargandoZip(true);
    try {
      const token = localStorage.getItem('auth.token');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

      const response = await fetch(`${baseUrl}/formulario-diagnostico/descargar-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: Array.from(seleccionados)
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al generar ZIP');
      }

      // Descargar ZIP
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Nombre con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.download = `diagnosticos_${timestamp}.zip`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${seleccionados.size} PDF(s) descargados correctamente`);
      limpiarSeleccion();
    } catch (error) {
      console.error("Error descargando ZIP:", error);
      toast.error(error.message || "No se pudo descargar el archivo ZIP");
    } finally {
      setCargandoZip(false);
    }
  };

  // Estadisticas
  const stats = useMemo(() => ({
    total: diagnosticos.length,
    firmados: diagnosticos.filter(d => d.estado === "FIRMADO" || d.firmaDigital).length,
    enviados: diagnosticos.filter(d => d.estado === "ENVIADO").length,
    enProceso: diagnosticos.filter(d => d.estado === "EN_PROCESO").length
  }), [diagnosticos]);

  // ================================================================
  // RENDER
  // ================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Cargando diagnosticos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Diagnostico de las IPRESS</h1>
            <p className="text-gray-500 text-sm">Consulta y seguimiento de formularios de diagnostico</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Diagnosticos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-100">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.firmados}</p>
              <p className="text-sm text-gray-500">Firmados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.enviados}</p>
              <p className="text-sm text-gray-500">Enviados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.enProceso}</p>
              <p className="text-sm text-gray-500">En Proceso</p>
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
          {/* Busqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar IPRESS o firmante..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all"
            >
              <option value="">Todas las Redes</option>
              {redesConDiagnosticos.map((red) => (
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all"
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
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all"
            >
              <option value="">Todos los Estados</option>
              <option value="FIRMADO">Firmado</option>
              <option value="ENVIADO">Enviado</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Barra de selección múltiple */}
      {seleccionados.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {seleccionados.size} diagnóstico(s) seleccionado(s)
            </span>
            <button
              onClick={limpiarSeleccion}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Limpiar selección
            </button>
          </div>
          <button
            onClick={descargarPdfsSeleccionados}
            disabled={cargandoZip}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargandoZip ? (
              <>
                <Loader className="animate-spin h-5 w-5" />
                <span>Generando ZIP...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Descargar Seleccionados</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Mostrando <span className="text-gray-800 font-semibold">{datosFiltrados.length}</span> diagnosticos
        </p>
        <div className="flex gap-2">
          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
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
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-700">Diagnosticos Registrados</h3>
          <p className="text-xs text-gray-500 mt-0.5">Total de registros: {datosFiltrados.length}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600">
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={seleccionados.size === datosPaginados.length && datosPaginados.length > 0}
                    onChange={toggleSeleccionarTodos}
                    className="w-4 h-4 rounded border-white/30 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  IPRESS
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Red
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Firma
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Fecha Envio
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {datosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <XCircle className="w-10 h-10 text-gray-300" />
                      <p className="text-gray-400 text-sm">No se encontraron diagnosticos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                datosPaginados.map((diagnostico) => (
                  <tr
                    key={diagnostico.idFormulario}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={seleccionados.has(diagnostico.idFormulario)}
                        onChange={() => toggleSeleccion(diagnostico.idFormulario)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{diagnostico.nombreIpress}</p>
                        <p className="text-xs text-gray-500">{diagnostico.codigoIpress}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{diagnostico.nombreRed || "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getEstadoBadge(diagnostico.estado)}
                    </td>
                    <td className="px-4 py-3">
                      {getFirmaBadge(diagnostico)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {diagnostico.fechaEnvio ? (
                          <>
                            <div>{new Date(diagnostico.fechaEnvio).toLocaleDateString("es-PE", {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(diagnostico.fechaEnvio).toLocaleTimeString("es-PE", {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </>
                        ) : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Ver detalle */}
                        <div className="relative group">
                          <button
                            onClick={() => verDetalle(diagnostico)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Ver detalle
                          </span>
                        </div>
                        {/* Ver PDF */}
                        <div className="relative group">
                          <button
                            onClick={() => verPdf(diagnostico.idFormulario)}
                            disabled={cargandoPdf}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Ver PDF
                          </span>
                        </div>
                        {/* Descargar PDF */}
                        <div className="relative group">
                          <button
                            onClick={() => descargarPdf(diagnostico.idFormulario)}
                            disabled={cargandoPdf}
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Descargar PDF
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-white">
            <p className="text-xs text-gray-500">
              Pagina {paginaActual} de {totalPaginas}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                disabled={paginaActual === 1}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div>
                <h3 className="text-xl font-bold text-white">Detalle del Diagnostico</h3>
                <p className="text-blue-100">{diagnosticoSeleccionado.nombreIpress}</p>
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
                {/* Info basica */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Codigo IPRESS</p>
                    <p className="text-gray-800 font-medium">{diagnosticoSeleccionado.codigoIpress}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Red</p>
                    <p className="text-gray-800 font-medium">{diagnosticoSeleccionado.nombreRed || "-"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Macroregion</p>
                    <p className="text-gray-800 font-medium">{diagnosticoSeleccionado.nombreMacroregion || "-"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Estado</p>
                    {getEstadoBadge(diagnosticoSeleccionado.estado)}
                  </div>
                </div>

                {/* Info de firma */}
                {(diagnosticoSeleccionado.firmaDigital || diagnosticoSeleccionado.fechaFirma) && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-semibold text-purple-800">Informacion de Firma Digital</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-purple-600">Firmante</p>
                        <p className="text-sm font-medium text-gray-800">{diagnosticoSeleccionado.nombreFirmante || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600">DNI</p>
                        <p className="text-sm font-medium text-gray-800">{diagnosticoSeleccionado.dniFirmante || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600">Fecha de Firma</p>
                        <p className="text-sm font-medium text-gray-800">
                          {diagnosticoSeleccionado.fechaFirma
                            ? new Date(diagnosticoSeleccionado.fechaFirma).toLocaleString("es-PE")
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-600">Entidad Certificadora</p>
                        <p className="text-sm font-medium text-gray-800">{diagnosticoSeleccionado.entidadCertificadora || "-"}</p>
                      </div>
                    </div>
                    {diagnosticoSeleccionado.hashDocumento && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="text-xs text-purple-600">Hash SHA-256</p>
                        <p className="text-xs font-mono text-gray-600 break-all">{diagnosticoSeleccionado.hashDocumento}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Fecha Creacion</p>
                    <p className="text-gray-800 font-medium">
                      {diagnosticoSeleccionado.fechaCreacion
                        ? new Date(diagnosticoSeleccionado.fechaCreacion).toLocaleString("es-PE")
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Fecha Envio</p>
                    <p className="text-gray-800 font-medium">
                      {diagnosticoSeleccionado.fechaEnvio
                        ? new Date(diagnosticoSeleccionado.fechaEnvio).toLocaleString("es-PE")
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Datos generales */}
                {diagnosticoSeleccionado.datosGenerales && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Datos Generales</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Director</p>
                        <p className="font-medium">{diagnosticoSeleccionado.datosGenerales.directorNombre || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Responsable Telesalud</p>
                        <p className="font-medium">{diagnosticoSeleccionado.datosGenerales.responsableNombre || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
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
                onClick={() => verPdf(diagnosticoSeleccionado.idFormulario)}
                disabled={cargandoPdf}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Ver PDF
              </button>
              <button
                onClick={() => descargarPdf(diagnosticoSeleccionado.idFormulario)}
                disabled={cargandoPdf}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
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

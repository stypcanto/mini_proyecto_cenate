// ========================================================================
// 🏥 ListadoIpress.jsx – Gestión Profesional de IPRESS (CENATE 2025)
// ------------------------------------------------------------------------
// Panel completo con tabla, búsqueda, filtros, paginación y exportación
// Diseño Apple-inspired con gradientes y transiciones suaves
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2, Search, Download, FileText, FileSpreadsheet,
  ChevronLeft, ChevronRight, Filter, ArrowUpDown, Loader,
  Home, TrendingUp, MapPin, Network, Activity, Plus, Edit2, Trash2, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import ipressService from "../../services/ipressService";
import { useAuth } from "../../context/AuthContext";
import IpressFormModal from "./components/IpressFormModal";
import ConfirmDeleteIpressModal from "./components/ConfirmDeleteIpressModal";
import IpressViewModal from "./components/IpressViewModal";

export default function ListadoIpress() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados principales
  const [ipress, setIpress] = useState([]);
  const [ipressConRedes, setIpressConRedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [macroregionSeleccionada, setMacroregionSeleccionada] = useState(null);
  const [redSeleccionada, setRedSeleccionada] = useState(null);
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState(null);
  const [macrorregiones, setMacrorregiones] = useState([]);
  const [redes, setRedes] = useState([]);
  const [modalidades, setModalidades] = useState([]);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  // Ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({ campo: null, direccion: "asc" });

  // Estados para modales CRUD
  const [modalCrearEditar, setModalCrearEditar] = useState({ open: false, ipress: null });
  const [modalEliminar, setModalEliminar] = useState({ open: false, ipress: null });
  const [modalVer, setModalVer] = useState({ open: false, ipress: null });

  // Verificar permisos de usuario
  const esAdminOSuperadmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPERADMIN');
  const esSuperadmin = user?.roles?.includes('SUPERADMIN');

  // ================================================================
  // 📡 CARGAR DATOS
  // ================================================================
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar redes, modalidades y todas las IPRESS
      const [redesData, modalidadesData, ipressData] = await Promise.all([
        apiClient.get('/redes'), // ✅ Endpoint correcto que devuelve macrorregiones
        ipressService.obtenerModalidadesActivas(),
        ipressService.obtenerTodas()
      ]);

      setRedes(redesData || []);
      setModalidades(modalidadesData || []);
      setIpress(ipressData || []);

      // Extraer macrorregiones únicas de las redes
      const macrorregionesUnicas = [];
      const macrosMap = new Map();
      (redesData || []).forEach(red => {
        if (red.macroregion && !macrosMap.has(red.macroregion.idMacro)) {
          macrosMap.set(red.macroregion.idMacro, red.macroregion);
          macrorregionesUnicas.push(red.macroregion);
        }
      });
      setMacrorregiones(macrorregionesUnicas);

      // Enriquecer IPRESS con información de red y macrorregión
      const ipressEnriquecidas = (ipressData || []).map(ipr => {
        const red = redesData.find(r => r.idRed === ipr.idRed);
        return {
          ...ipr,
          nombreRed: red?.descRed || "Sin red asignada",
          idRedDisplay: ipr.idRed || "N/A",
          idMacro: red?.macroregion?.idMacro || null,
          nombreMacro: red?.macroregion?.descMacro || null,
          // Agregar descMacrorregion para el modal de visualización
          descMacrorregion: red?.macroregion?.descMacro || null
        };
      });

      setIpressConRedes(ipressEnriquecidas);
      toast.success(`${ipressEnriquecidas.length} IPRESS cargadas correctamente`);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos de IPRESS");
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // 🔍 FILTRADO Y BÚSQUEDA
  // ================================================================
  const datosFiltrados = useMemo(() => {
    let resultado = [...ipressConRedes];

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (item) =>
          item.descIpress?.toLowerCase().includes(termino) ||
          item.codIpress?.toLowerCase().includes(termino) ||
          item.nombreRed?.toLowerCase().includes(termino)
      );
    }

    // Filtrar por macrorregión
    if (macroregionSeleccionada) {
      resultado = resultado.filter((item) => item.idMacro === parseInt(macroregionSeleccionada));
    }

    // Filtrar por red
    if (redSeleccionada) {
      resultado = resultado.filter((item) => item.idRed === parseInt(redSeleccionada));
    }

    // Filtrar por modalidad de atención
    if (modalidadSeleccionada) {
      resultado = resultado.filter((item) => item.idModAten === parseInt(modalidadSeleccionada));
    }

    // Ordenar
    if (ordenamiento.campo) {
      resultado.sort((a, b) => {
        const valorA = a[ordenamiento.campo] || "";
        const valorB = b[ordenamiento.campo] || "";
        const comparacion = valorA.toString().localeCompare(valorB.toString());
        return ordenamiento.direccion === "asc" ? comparacion : -comparacion;
      });
    }

    return resultado;
  }, [ipressConRedes, busqueda, macroregionSeleccionada, redSeleccionada, modalidadSeleccionada, ordenamiento]);

  // ================================================================
  // 📄 PAGINACIÓN
  // ================================================================
  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return datosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [datosFiltrados, paginaActual, itemsPorPagina]);

  // Ajustar página si se queda fuera de rango
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  // ================================================================
  // 🔄 HANDLERS
  // ================================================================
  const handleOrdenar = (campo) => {
    setOrdenamiento((prev) => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === "asc" ? "desc" : "asc",
    }));
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setMacroregionSeleccionada(null);
    setRedSeleccionada(null);
    setModalidadSeleccionada(null);
    setPaginaActual(1);
    toast.success("Filtros limpiados");
  };

  // ================================================================
  // ✏️ CRUD DE IPRESS
  // ================================================================
  const handleCrear = () => {
    setModalCrearEditar({ open: true, ipress: null });
  };

  const handleEditar = (ipress) => {
    setModalCrearEditar({ open: true, ipress });
  };

  const handleEliminar = (ipress) => {
    setModalEliminar({ open: true, ipress });
  };

  const confirmarEliminar = async () => {
    try {
      await ipressService.eliminar(modalEliminar.ipress.idIpress);
      toast.success("IPRESS eliminada exitosamente");
      setModalEliminar({ open: false, ipress: null });
      cargarDatos(); // Recargar datos
    } catch (error) {
      console.error("Error al eliminar IPRESS:", error);
      toast.error("Error al eliminar IPRESS");
    }
  };

  const handleSuccessModal = () => {
    toast.success(`IPRESS ${modalCrearEditar.ipress ? 'actualizada' : 'creada'} exitosamente`);
    setModalCrearEditar({ open: false, ipress: null });
    cargarDatos(); // Recargar datos
  };

  // ================================================================
  // 📥 EXPORTACIÓN
  // ================================================================
  const exportarCSV = () => {
    const headers = ["Centro Asistencial", "ID CAS", "Red Asistencial", "ID RED", "Modalidad de Atención"];
    const rows = datosFiltrados.map((item) => [
      item.descIpress,
      item.codIpress,
      item.nombreRed,
      item.idRedDisplay,
      item.nombreModalidadAtencion || "No especificado",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ipress_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado correctamente");
  };

  // ================================================================
  // 🎨 RENDER
  // ================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando IPRESS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ============================================================ */ }
        {/* HEADER */ }
        {/* ============================================================ */ }
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={ () => navigate(-1) }
              className="p-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg
                         hover:bg-blue-600 hover:text-white transition-all"
              title="Volver"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Listado de IPRESS</h1>
              <p className="text-sm text-slate-600">
                Gestión de Instituciones Prestadoras de Servicios de Salud
              </p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-900">
                { datosFiltrados.length }
              </span>
              <span className="text-slate-600">IPRESS</span>
            </div>
          </div>
        </header>

        {/* ============================================================ */ }
        {/* CARDS DE ESTADÍSTICAS */ }
        {/* ============================================================ */ }
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Total IPRESS</p>
            <p className="text-4xl font-bold">{ ipress.length }</p>
            <p className="text-xs opacity-75 mt-2">Instituciones registradas</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Network className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Redes</p>
            <p className="text-4xl font-bold">{ redes.length }</p>
            <p className="text-xs opacity-75 mt-2">Redes asistenciales</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <Filter className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Filtradas</p>
            <p className="text-4xl font-bold">{ datosFiltrados.length }</p>
            <p className="text-xs opacity-75 mt-2">Resultados actuales</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Cobertura</p>
            <p className="text-4xl font-bold">100%</p>
            <p className="text-xs opacity-75 mt-2">Nacional</p>
          </div>
        </section>

        {/* ============================================================ */ }
        {/* FILTROS Y BÚSQUEDA */ }
        {/* ============================================================ */ }
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          {/* Búsqueda - Ancho completo */ }
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Buscar IPRESS
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={ busqueda }
                onChange={ (e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                } }
                placeholder="Buscar por nombre, código o red..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtros - Grid de 3 columnas */ }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Filtro por Macrorregión */ }
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filtrar por Macrorregión
              </label>
              <select
                value={ macroregionSeleccionada || "" }
                onChange={ (e) => {
                  setMacroregionSeleccionada(e.target.value || null);
                  setPaginaActual(1);
                } }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las macrorregiones</option>
                { macrorregiones.map((macro) => (
                  <option key={ macro.idMacro } value={ macro.idMacro }>
                    { macro.descMacro }
                  </option>
                )) }
              </select>
            </div>

            {/* Filtro por red */ }
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filtrar por Red
              </label>
              <select
                value={ redSeleccionada || "" }
                onChange={ (e) => {
                  setRedSeleccionada(e.target.value || null);
                  setPaginaActual(1);
                } }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las redes</option>
                { redes.map((red) => (
                  <option key={ red.idRed } value={ red.idRed }>
                    { red.descRed }
                  </option>
                )) }
              </select>
            </div>

            {/* Filtro por Modalidad de Atención */ }
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filtrar por Modalidad
              </label>
              <select
                value={ modalidadSeleccionada || "" }
                onChange={ (e) => {
                  setModalidadSeleccionada(e.target.value || null);
                  setPaginaActual(1);
                } }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las modalidades</option>
                { modalidades.map((mod) => (
                  <option key={ mod.idModAten } value={ mod.idModAten }>
                    { mod.descModAten }
                  </option>
                )) }
              </select>
            </div>
          </div>

          {/* Botones de acción */ }
          <div className="flex flex-wrap items-center gap-3">
            { esAdminOSuperadmin && (
              <button
                onClick={ handleCrear }
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white
                           rounded-lg hover:bg-blue-700 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Nueva IPRESS
              </button>
            ) }

            <button
              onClick={ exportarCSV }
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white
                         rounded-lg hover:bg-emerald-700 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Exportar a CSV
            </button>

            { (busqueda || macroregionSeleccionada || redSeleccionada || modalidadSeleccionada) && (
              <button
                onClick={ limpiarFiltros }
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white
                           border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Limpiar filtros
              </button>
            ) }

            <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
              <span>Mostrar:</span>
              <select
                value={ itemsPorPagina }
                onChange={ (e) => {
                  setItemsPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                } }
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={ 10 }>10</option>
                <option value={ 25 }>25</option>
                <option value={ 50 }>50</option>
                <option value={ 100 }>100</option>
              </select>
              <span>entradas</span>
            </div>
          </div>
        </section>

        {/* ============================================================ */ }
        {/* TABLA DE DATOS */ }
        {/* ============================================================ */ }
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={ () => handleOrdenar("descIpress") }
                      className="flex items-center gap-2 font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      Centro Asistencial
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={ () => handleOrdenar("codIpress") }
                      className="flex items-center gap-2 font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      ID CAS
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={ () => handleOrdenar("nombreRed") }
                      className="flex items-center gap-2 font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      Red Asistencial
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">
                    ID RED
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">
                    Modalidad de Atención
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                { datosPaginados.length > 0 ? (
                  datosPaginados.map((item, index) => (
                    <tr
                      key={ index }
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        { item.descIpress }
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                        { item.codIpress }
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        { item.nombreRed }
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                        { item.idRedDisplay }
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <span className={ `inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${item.nombreModalidadAtencion === 'TELECONSULTA'
                            ? 'bg-blue-100 text-blue-800'
                            : item.nombreModalidadAtencion === 'TELECONSULTORIO'
                              ? 'bg-purple-100 text-purple-800'
                              : item.nombreModalidadAtencion === 'AMBOS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.nombreModalidadAtencion === 'NO SE BRINDA SERVICIO'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-600'
                          }` }>
                          { item.nombreModalidadAtencion || 'No especificado' }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="flex items-center justify-center gap-2">
                          {/* Botón Ver - Disponible para TODOS los usuarios */ }
                          <button
                            onClick={ () => setModalVer({ open: true, ipress: item }) }
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Botones Editar y Eliminar - Solo para ADMIN y SUPERADMIN */ }
                          { esAdminOSuperadmin && (
                            <>
                              <button
                                onClick={ () => handleEditar(item) }
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar IPRESS"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              { esSuperadmin && (
                                <button
                                  onClick={ () => handleEliminar(item) }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar IPRESS (solo SUPERADMIN)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) }
                            </>
                          ) }
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No se encontraron IPRESS</p>
                      <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </td>
                  </tr>
                ) }
              </tbody>
            </table>
          </div>

          {/* Paginación */ }
          { datosFiltrados.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Mostrando{ " " }
                <span className="font-semibold text-slate-900">
                  { (paginaActual - 1) * itemsPorPagina + 1 }
                </span>{ " " }
                a{ " " }
                <span className="font-semibold text-slate-900">
                  { Math.min(paginaActual * itemsPorPagina, datosFiltrados.length) }
                </span>{ " " }
                de{ " " }
                <span className="font-semibold text-slate-900">
                  { datosFiltrados.length }
                </span>{ " " }
                entradas
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={ () => setPaginaActual((p) => Math.max(1, p - 1)) }
                  disabled={ paginaActual === 1 }
                  className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-white
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>

                <div className="flex items-center gap-1">
                  { [...Array(Math.min(5, totalPaginas))].map((_, i) => {
                    const pagina = i + 1;
                    return (
                      <button
                        key={ pagina }
                        onClick={ () => setPaginaActual(pagina) }
                        className={ `px-4 py-2 rounded-lg font-medium transition-all ${paginaActual === pagina
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                          }` }
                      >
                        { pagina }
                      </button>
                    );
                  }) }
                  { totalPaginas > 5 && (
                    <>
                      <span className="px-2 text-slate-400">...</span>
                      <button
                        onClick={ () => setPaginaActual(totalPaginas) }
                        className={ `px-4 py-2 rounded-lg font-medium transition-all ${paginaActual === totalPaginas
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                          }` }
                      >
                        { totalPaginas }
                      </button>
                    </>
                  ) }
                </div>

                <button
                  onClick={ () => setPaginaActual((p) => Math.min(totalPaginas, p + 1)) }
                  disabled={ paginaActual === totalPaginas }
                  className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-white
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>
          ) }
        </section>

        {/* ============================================================ */ }
        {/* MODALES */ }
        {/* ============================================================ */ }
        { modalCrearEditar.open && (
          <IpressFormModal
            ipress={ modalCrearEditar.ipress }
            redes={ redes }
            onClose={ () => setModalCrearEditar({ open: false, ipress: null }) }
            onSuccess={ handleSuccessModal }
          />
        ) }

        { modalEliminar.open && (
          <ConfirmDeleteIpressModal
            ipress={ modalEliminar.ipress }
            onConfirm={ confirmarEliminar }
            onCancel={ () => setModalEliminar({ open: false, ipress: null }) }
          />
        ) }

        { modalVer.open && (
          <IpressViewModal
            ipress={ modalVer.ipress }
            onClose={ () => setModalVer({ open: false, ipress: null }) }
          />
        ) }
      </div>
    </div>
  );
}

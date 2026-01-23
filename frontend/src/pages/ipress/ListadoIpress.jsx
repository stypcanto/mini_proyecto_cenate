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
  Home, TrendingUp, MapPin, Network, Activity, Plus, Edit2, Trash2, Eye,
  Settings, X, Stethoscope
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

  // Estado para modal de configurar especialidades
  const [modalConfigEspecialidades, setModalConfigEspecialidades] = useState({ open: false, ipress: null });
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState([]); // Todas las especialidades CENATE
  const [especialidadesConfiguradas, setEspecialidadesConfiguradas] = useState([]); // Configuración actual de la IPRESS
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(false);
  const [savingEspecialidades, setSavingEspecialidades] = useState(false);

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
  // ⚙️ CONFIGURAR ESPECIALIDADES
  // ================================================================
  const handleConfigEspecialidades = async (ipressItem) => {
    setModalConfigEspecialidades({ open: true, ipress: ipressItem });
    setLoadingEspecialidades(true);
    try {
      // 1. Primero cargar TODAS las especialidades disponibles de CENATE
      const disponibles = await apiClient.get('/servicio-essi/activos-cenate');
      setEspecialidadesDisponibles(disponibles || []);

      if (!disponibles || disponibles.length === 0) {
        toast.error("No se encontraron especialidades disponibles en CENATE");
        setEspecialidadesConfiguradas([]);
        return;
      }

      // 2. Luego cargar la configuración actual de esta IPRESS (puede estar vacía)
      let configuradas = [];
      try {
        configuradas = await apiClient.get(`/ipress/servicio-essi/${ipressItem.codIpress}`);
      } catch (configError) {
        // Si falla, significa que no hay configuración previa (es normal)
        console.log("No hay configuración previa para esta IPRESS:", configError);
        configuradas = [];
      }

      // 3. Crear mapa de configuraciones existentes para acceso rápido
      const configMap = new Map();
      (configuradas || []).forEach(cfg => {
        configMap.set(cfg.idServicio, cfg);
      });

      // 4. Combinar: TODAS las 31 especialidades con su configuración (si existe)
      const combinadas = disponibles.map(esp => {
        const config = configMap.get(esp.idServicio);
        return {
          idServicio: esp.idServicio,
          codServicio: esp.codServicio,
          descServicio: esp.descServicio,
          teleconsulta: config?.teleconsulta ?? false,
          teleconsultorio: config?.teleconsultorio ?? false,
          fechaCreacion: config?.fechaCreacion || null,
          fechaActualizacion: config?.fechaActualizacion || null,
          usuarioRegistro: config?.usuarioRegistro || null,
          usuarioModifico: config?.usuarioModifico || null,
          tieneConfiguracion: !!config
        };
      });

      setEspecialidadesConfiguradas(combinadas);
      toast.success(`${disponibles.length} especialidades cargadas`);
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
      toast.error("Error al cargar las especialidades de CENATE");
      setEspecialidadesDisponibles([]);
      setEspecialidadesConfiguradas([]);
    } finally {
      setLoadingEspecialidades(false);
    }
  };

  const handleCheckboxChange = (idServicio, campo) => {
    setEspecialidadesConfiguradas(prev =>
      prev.map(esp =>
        esp.idServicio === idServicio
          ? { ...esp, [campo]: !esp[campo] }
          : esp
      )
    );
  };

  const handleMarcarTodo = (campo) => {
    // Si todos están marcados, desmarcar todos. Si no, marcar todos.
    const todosSeleccionados = especialidadesConfiguradas.every(esp => esp[campo]);
    setEspecialidadesConfiguradas(prev =>
      prev.map(esp => ({ ...esp, [campo]: !todosSeleccionados }))
    );
  };

  // Calcular si todos/algunos/ninguno están marcados para cada columna
  const todosTeleconsulta = especialidadesConfiguradas.length > 0 &&
    especialidadesConfiguradas.every(esp => esp.teleconsulta);
  const algunosTeleconsulta = especialidadesConfiguradas.some(esp => esp.teleconsulta) && !todosTeleconsulta;

  const todosTeleconsultorio = especialidadesConfiguradas.length > 0 &&
    especialidadesConfiguradas.every(esp => esp.teleconsultorio);
  const algunosTeleconsultorio = especialidadesConfiguradas.some(esp => esp.teleconsultorio) && !todosTeleconsultorio;

  const handleGuardarEspecialidades = async () => {
    const ipressCode = modalConfigEspecialidades.ipress?.codIpress;
    if (!ipressCode) return;

    setSavingEspecialidades(true);
    try {
      // Enviar TODAS las 31 especialidades con su estado actual
      const servicios = especialidadesConfiguradas.map(esp => ({
        idServicio: esp.idServicio,
        teleconsulta: esp.teleconsulta,
        teleconsultorio: esp.teleconsultorio
      }));

      // El backend espera ConfigurarServiciosRequest { servicios: [...] }
      await apiClient.put(`/ipress/servicio-essi/configurar/${ipressCode}`, { servicios: servicios });
      toast.success(`Configuración de ${servicios.length} especialidades guardada exitosamente`);

      // Recargar los datos después de guardar exitosamente
      await recargarConfiguracionEspecialidades(ipressCode);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast.error("Error al guardar la configuración de especialidades");
    } finally {
      setSavingEspecialidades(false);
    }
  };

  const recargarConfiguracionEspecialidades = async (codIpress) => {
    try {
      const configuradas = await apiClient.get(`/ipress/servicio-essi/${codIpress}`);

      // Crear mapa de configuraciones
      const configMap = new Map();
      (configuradas || []).forEach(cfg => {
        configMap.set(cfg.idServicio, cfg);
      });

      // Actualizar el estado con los datos recargados
      setEspecialidadesConfiguradas(prev =>
        prev.map(esp => {
          const config = configMap.get(esp.idServicio);
          return {
            ...esp,
            teleconsulta: config?.teleconsulta ?? false,
            teleconsultorio: config?.teleconsultorio ?? false,
            fechaCreacion: config?.fechaCreacion || null,
            fechaActualizacion: config?.fechaActualizacion || null,
            usuarioRegistro: config?.usuarioRegistro || null,
            usuarioModifico: config?.usuarioModifico || null,
            tieneConfiguracion: !!config
          };
        })
      );
    } catch (error) {
      console.error("Error al recargar configuración:", error);
    }
  };

  const cerrarModalEspecialidades = () => {
    setModalConfigEspecialidades({ open: false, ipress: null });
    setEspecialidadesDisponibles([]);
    setEspecialidadesConfiguradas([]);
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

                          {/* Botón Configurar Especialidades - Solo para ADMIN y SUPERADMIN */ }
                          { esAdminOSuperadmin && (
                            <button
                              onClick={ () => handleConfigEspecialidades(item) }
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Configurar Especialidades"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          ) }

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

        {/* Modal Configurar Especialidades */ }
        { modalConfigEspecialidades.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
              {/* Header del modal */ }
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Configurar Especialidades</h2>
                    <p className="text-purple-100 text-sm">
                      { modalConfigEspecialidades.ipress?.descIpress } ({ modalConfigEspecialidades.ipress?.codIpress })
                    </p>
                  </div>
                </div>
                <button
                  onClick={ cerrarModalEspecialidades }
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  disabled={ savingEspecialidades }
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Contenido del modal */ }
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                { loadingEspecialidades ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                    <p className="text-slate-600">Cargando especialidades...</p>
                  </div>
                ) : especialidadesConfiguradas.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                      <Stethoscope className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-slate-700 text-sm">
                        Especialidades disponibles ({ especialidadesConfiguradas.length })
                      </span>
                    </div>

                    {/* Tabla compacta */ }
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-2 py-2 text-left font-semibold text-slate-700">Código</th>
                            <th className="px-2 py-2 text-left font-semibold text-slate-700">Especialidad</th>
                            <th className="px-2 py-2 text-center font-semibold text-slate-700">
                              <div className="flex flex-col items-center gap-1">
                                <span>Teleconsulta</span>
                                <label className="flex items-center gap-1 text-xs font-normal text-slate-500 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={ todosTeleconsulta }
                                    ref={ el => { if (el) el.indeterminate = algunosTeleconsulta; } }
                                    onChange={ () => handleMarcarTodo('teleconsulta') }
                                    className="w-3 h-3 text-purple-600 border-slate-300 rounded
                                               focus:ring-purple-500 cursor-pointer"
                                  />
                                  Todos
                                </label>
                              </div>
                            </th>
                            <th className="px-2 py-2 text-center font-semibold text-slate-700">
                              <div className="flex flex-col items-center gap-1">
                                <span>Teleconsultorio</span>
                                <label className="flex items-center gap-1 text-xs font-normal text-slate-500 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={ todosTeleconsultorio }
                                    ref={ el => { if (el) el.indeterminate = algunosTeleconsultorio; } }
                                    onChange={ () => handleMarcarTodo('teleconsultorio') }
                                    className="w-3 h-3 text-purple-600 border-slate-300 rounded
                                               focus:ring-purple-500 cursor-pointer"
                                  />
                                  Todos
                                </label>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          { especialidadesConfiguradas.map((esp) => (
                            <tr
                              key={ esp.idServicio }
                              className={ `hover:bg-purple-50/50 transition-colors ${
                                esp.tieneConfiguracion ? 'bg-white' : 'bg-slate-50/50'
                              }` }
                            >
                              <td className="px-2 py-1.5 font-mono text-slate-600">{ esp.codServicio }</td>
                              <td className="px-2 py-1.5 font-medium text-slate-900">{ esp.descServicio }</td>
                              <td className="px-2 py-1.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={ esp.teleconsulta }
                                  onChange={ () => handleCheckboxChange(esp.idServicio, 'teleconsulta') }
                                  className="w-4 h-4 text-purple-600 border-slate-300 rounded
                                             focus:ring-purple-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={ esp.teleconsultorio }
                                  onChange={ () => handleCheckboxChange(esp.idServicio, 'teleconsultorio') }
                                  className="w-4 h-4 text-purple-600 border-slate-300 rounded
                                             focus:ring-purple-500 cursor-pointer"
                                />
                              </td>
                           
                            </tr>
                          )) }
                        </tbody>
                      </table>
                    </div>

                    {/* Leyenda */ }
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-white border border-slate-200 rounded"></div>
                        <span>Configurado</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded"></div>
                        <span>Sin configurar</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Stethoscope className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-lg font-medium">No hay especialidades disponibles</p>
                    <p className="text-sm">No se encontraron especialidades activas en CENATE</p>
                  </div>
                ) }
              </div>

              {/* Footer del modal */ }
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={ cerrarModalEspecialidades }
                  disabled={ savingEspecialidades }
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600
                             transition-colors font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={ handleGuardarEspecialidades }
                  disabled={ savingEspecialidades || loadingEspecialidades }
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700
                             transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  { savingEspecialidades && <Loader className="w-4 h-4 animate-spin" /> }
                  { savingEspecialidades ? 'Guardando...' : 'Guardar' }
                </button>
              </div>
            </div>
          </div>
        ) }
      </div>
    </div>
  );
}

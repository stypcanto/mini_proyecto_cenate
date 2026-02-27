import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Plus, Search, Phone, ChevronDown, ChevronUp, Circle, Eye, Users, UserPlus, Download, FileText, FolderOpen, ListChecks, Upload, AlertCircle, Edit, X, AlertTriangle, Clock, UserCheck, Database } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListHeader from '../../components/ListHeader';
import bolsasService, { actualizarIpressAtencion, actualizarFechaPreferida, asignarGestoraMasivo } from '../../services/bolsasService';
import ipressService from '../../services/ipressService';
import { usePermisos } from '../../context/PermisosContext';
import ModalResultadosImportacion from '../../components/modals/ModalResultadosImportacion'; // ✅ NUEVO v1.19.0
import FilaSolicitud from './FilaSolicitud'; // 🚀 v2.6.0: Componente memorizado para filas
import DetallesPacienteModal from '../../components/modals/DetallesPacienteModal'; // v1.75.0: Historial trazabilidad

/**
 * 📋 Solicitudes - Recepción de Bolsa
 * v2.0.0 - Redesign con estadísticas y filtros mejorados
 *
 * Características:
 * - Dashboard de estadísticas por estado (Total, Pendientes, Citados, Asignados, Sin Asignar)
 * - Tabla mejorada con IPRESS, Bolsa, Fechas, Estado, Semáforo
 * - Filtros dropdown para Bolsas, Redes, Especialidades, Estados
 * - Indicadores de tráfico (semáforo) por paciente
 * - Acciones: Cambiar celular
 */
/**
 * Genera un alias corto para nombres de bolsas
 * Ejemplos:
 * "Bolsas Explotación de Datos - Análisis y reportes" → "Bolsa Explotación Datos"
 * "Bolsas Interconsulta - Especialista" → "Bolsa Interconsulta"
 */
function generarAliasBolsa(nombreBolsa) {
  if (!nombreBolsa) return 'Sin clasificar';

  // Eliminar las palabras genéricas y el guion
  let alias = nombreBolsa
    .replace(/^Bolsas?\s+/, '') // Quita "Bolsa" o "Bolsas" al inicio
    .replace(/\s*-\s*.*$/, '') // Quita todo después del guion
    .trim();

  // Si el resultado es muy largo, acortarlo a palabras principales
  if (alias.length > 30) {
    const palabras = alias.split(' ');
    alias = palabras.slice(0, 3).join(' '); // Tomar primeras 3 palabras
  }

  return `Bolsa ${alias}`;
}

/**
 * ✅ v1.48.4: Convierte nombre de bolsa a código
 * Ejemplos:
 * "Bolsa 107" → "BOLSA_107"
 * "Bolsa Dengue" → "BOLSA_DENGUE"
 * "Bolsa Explotación de Datos" → "BOLSA_EXPLOTACION_DATOS"
 */
function generarCodigoBolsa(nombreBolsa) {
  if (!nombreBolsa) return 'SIN_CLASIFICAR';

  return nombreBolsa
    .toUpperCase()
    .replace(/[àáäâ]/g, 'A')
    .replace(/[èéëê]/g, 'E')
    .replace(/[ìíïî]/g, 'I')
    .replace(/[òóöô]/g, 'O')
    .replace(/[ùúüû]/g, 'U')
    .replace(/[ñ]/g, 'N')
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export default function Solicitudes() {
  const [registrosPorPagina, setRegistrosPorPagina] = useState(20);
  const { esSuperAdmin } = usePermisos();

  const [solicitudes, setSolicitudes] = useState([]);
  const [totalElementos, setTotalElementos] = useState(0); // NEW v2.5.1: Total de elementos del backend
  const [estadisticasGlobales, setEstadisticasGlobales] = useState(null); // NEW v2.5.2: Stats globales del backend

  // NEW v2.5.8: Estadísticas de filtros del backend (análisis de TODA la tabla)
  const [estadisticasTipoBolsa, setEstadisticasTipoBolsa] = useState([]);
  // estadisticasTipoCita eliminado (v1.65.1) — el filtro Tipo de Cita usa opciones hardcodeadas
  const [especialidadesActivas, setEspecialidadesActivas] = useState([]); // Especialidades desde backend (v1.42.0)
  const [errorEspecialidades, setErrorEspecialidades] = useState(null); // Error al cargar especialidades (v1.42.0)
  const [estadisticasIpress, setEstadisticasIpress] = useState([]);
  const [estadisticasIpressAtencion, setEstadisticasIpressAtencion] = useState([]);
  // estadisticasTipoCita eliminado (v1.65.1) — el filtro usa opciones hardcodeadas

  const [isLoading, setIsLoading] = useState(true); // Inicia con loader por defecto
  const [estadisticasCargadas, setEstadisticasCargadas] = useState(false); // ✅ v1.42.0: Rastrear carga de estadísticas
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroBolsa, setFiltroBolsa] = useState([]); // [] = todas las bolsas (multi-select)
  const [filtroRed, setFiltroRed] = useState('todas');
  const [filtroIpress, setFiltroIpress] = useState('todas');
  const [filtroIpressAtencion, setFiltroIpressAtencion] = useState('todas');
  const [filtroMacrorregion, setFiltroMacrorregion] = useState('todas');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // Mostrar todos los estados por defecto
  const [filtroTipoCita, setFiltroTipoCita] = useState('todas');
  const [filtroAsignacion, setFiltroAsignacion] = useState('todos');  // ✅ v1.42.0: Filtro asignación (cards clickeables)
  const [filtroGestoraId, setFiltroGestoraId] = useState(null);        // Filtro por gestora asignada (ID)
  const [filtroEstadoBolsa, setFiltroEstadoBolsa] = useState('todos'); // ✅ v1.67.0: Filtro estado de bolsa (PENDIENTE, OBSERVADO, ATENDIDO)
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');     // ✅ v1.66.0: Filtro rango de fechas - inicio
  const [filtroFechaFin, setFiltroFechaFin] = useState('');           // ✅ v1.66.0: Filtro rango de fechas - fin
  const [cardSeleccionado, setCardSeleccionado] = useState(null);     // ✅ v1.42.0: Rastrear card activo
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [modoSeleccionTotal, setModoSeleccionTotal] = useState(false); // v1.65.0: "Seleccionar todos los X que coinciden"
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // v1.80.0: Ordenamiento de columnas

  // Cache de catálogos para evitar N+1 queries
  const [cacheEstados, setCacheEstados] = useState({});
  const [cacheIpress, setCacheIpress] = useState({});
  const [cacheRedes, setCacheRedes] = useState({});
  const [listaEstadosGestion, setListaEstadosGestion] = useState([]); // ✅ v3.7.0: Estados desde dim_estados_gestion_citas
  const [catalogosCargados, setCatalogosCargados] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modales y estado para acciones
  const [modalCambiarTelefono, setModalCambiarTelefono] = useState(false);
  const [modalAsignarGestora, setModalAsignarGestora] = useState(false);
  const [modalEnviarRecordatorio, setModalEnviarRecordatorio] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoTelefonoAlterno, setNuevoTelefonoAlterno] = useState(''); // NEW v2.4.3
  const [gestoraSeleccionada, setGestoraSeleccionada] = useState(null);
  const [gestoras, setGestoras] = useState([]); // NEW: Lista de gestoras disponibles
  const [isLoadingGestoras, setIsLoadingGestoras] = useState(false); // NEW
  const [filtroGestora, setFiltroGestora] = useState(''); // NEW: Filtro de búsqueda de gestoras
  const [tipoRecordatorio, setTipoRecordatorio] = useState('EMAIL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Estado para sincronización de teléfonos
  const [isSyncingPhones, setIsSyncingPhones] = useState(false);

  // Estado para importación de Excel
  const [idTipoBolsaSeleccionado, setIdTipoBolsaSeleccionado] = useState('');
  const [idServicioSeleccionado, setIdServicioSeleccionado] = useState('');
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Estado para asegurados nuevos
  const [modalAseguradosNuevos, setModalAseguradosNuevos] = useState(false);
  const [aseguradosNuevos, setAseguradosNuevos] = useState([]);

  // v1.75.0: Modal historial de trazabilidad
  const [modalHistorial, setModalHistorial] = useState(false);
  const [solicitudHistorial, setSolicitudHistorial] = useState(null);

  // Estado para asegurados sincronizados recientemente

  // Referencias para sincronizar scroll horizontal
  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);

  // Sincronizar scroll horizontal top → bottom
  const handleTopScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  // Sincronizar scroll horizontal bottom → top
  const handleBottomScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
  };
  const [modalAseguradosSincronizados, setModalAseguradosSincronizados] = useState(false);
  const [aseguradosSincronizados, setAseguradosSincronizados] = useState([]);

  // ✅ Estado para modal de resultados de importación (v1.19.0)
  const [modalResultadosImportacion, setModalResultadosImportacion] = useState(false);
  const [resultadosImportacion, setResultadosImportacion] = useState(null);

  // Estado para modal de confirmación de borrado
  const [modalConfirmarBorrado, setModalConfirmarBorrado] = useState(false);
  const [cantidadABorrar, setCantidadABorrar] = useState(0);
  const [seleccionarTodas, setSeleccionarTodas] = useState(false);

  // Estado para collapse/expand de secciones
  const [expandFiltros, setExpandFiltros] = useState(false);

  // Estado para modal de cambiar bolsa
  const [modalCambiarBolsa, setModalCambiarBolsa] = useState(false);

  // ✅ v1.105.0: Modal IPRESS Atención
  const [modalIpressAtencion, setModalIpressAtencion]       = useState(false);
  const [iprессBusqueda, setIpressBusqueda]                 = useState('');
  const [ipressResultados, setIpressResultados]             = useState([]);
  const [ipressSeleccionada, setIpressSeleccionada]         = useState(null);
  const [loadingIpress, setLoadingIpress]                   = useState(false);
  const [bolsaNuevaSeleccionada, setBolsaNuevaSeleccionada] = useState(null);
  const [bolsasDisponibles, setBolsasDisponibles] = useState([]);
  const [tiposBolsasActivos, setTiposBolsasActivos] = useState([]); // Tipos de bolsas activos (catálogo)

  // ============================================================================
  // 📦 EFFECT 1: Cargar CATÁLOGOS una sola vez al iniciar
  // ============================================================================
  useEffect(() => {
    console.log('🚀 Montaje inicial - Cargando catálogos...');
    isMountedRef.current = true;
    const loadCatalogs = async () => {
      await cargarCatalogos();
    };
    loadCatalogs();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================================================
  // 📦 EFFECT 1.5: Cargar ESPECIALIDADES como efecto separado
  // ============================================================================
  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        setErrorEspecialidades(null);
        const response = await bolsasService.obtenerEspecialidadesActivasCenate();

        if (isMountedRef.current) {
          if (Array.isArray(response) && response.length > 0) {
            // Extraer descServicio de cada DimServicioEssiDTO y ordenar
            const nombres = response
              .map(s => s.descServicio)
              .filter(n => n && n.trim() !== '')
              .sort();
            setEspecialidadesActivas(nombres);
          } else {
            console.warn('⚠️ Respuesta inesperada de especialidades CENATE:', response);
            setErrorEspecialidades('Formato de respuesta inesperado');
          }
        }
      } catch (error) {
        console.error('❌ Error cargando especialidades:', error);
        if (isMountedRef.current) {
          setErrorEspecialidades('No se pudieron cargar las especialidades');
          // Fallback: Calcular especialidades desde registros locales si API falla
          const localEspecialidades = [...new Set(
            solicitudes
              .map(s => s.especialidad)
              .filter(e => e && e.trim() !== '')
          )].sort();
          if (localEspecialidades.length > 0) {
            setEspecialidadesActivas(localEspecialidades);
            setErrorEspecialidades('Usando especialidades de página actual');
          }
        }
      }
    };

    cargarEspecialidades();
  }, []);

  // ============================================================================
  // 📦 EFFECT 2: Cargar SOLICITUDES después de que catálogos Y estadísticas estén listos
  // ============================================================================
  // ✅ v1.42.0: Esperar a que estadísticas estén cargadas para evitar números incorrectos
  // ✅ v3.0.1: Usar cargarSolicitudesConFiltros() para aplicar filtros por defecto en la carga inicial
  // ✅ v3.0.3: Cargar solicitudes INMEDIATAMENTE cuando catálogos están listos
  // Las estadísticas (tarjetas) cargan en paralelo sin bloquear la tabla
  useEffect(() => {
    if (catalogosCargados) {
      console.log('📋 Catálogos cargados, iniciando carga de solicitudes CON FILTROS...');
      cargarSolicitudesConFiltros();
      console.log('ℹ️ Las estadísticas cargan en paralelo sin bloquear la tabla');
    }
  }, [catalogosCargados]);

  // ============================================================================
  // 📦 EFFECT 2.5: DEPRECADO (v3.0.0)
  // ============================================================================
  // ℹ️ Esta llamada se CONSOLIDÓ en Effect 2.6 con obtenerEstadisticasFiltros()
  // Ya no es necesaria hacer una llamada separada a por-estado
  // Se incluye en la respuesta consolidada del endpoint /filtros
  //
  // ANTES: 2 efectos hacían múltiples llamadas (Effect 2.5 + Effect 2.6)
  // AHORA: 1 solo efecto hace 1 sola llamada consolidada
  // ============================================================================

  // ============================================================================
  // 📦 EFFECT 2.6a: Cargar ESTADÍSTICAS + DROPDOWNS rápidos (en paralelo, inmediato)
  // ============================================================================
  // v1.65.3: Mueve Estado de Gestora y Gestora Asignada fuera de cargarCatalogos()
  // para que sus dropdowns aparezcan sin esperar obtenerIpress() (lento).
  useEffect(() => {
    console.log('📊 [2.6a] Cargando estadísticas, estados y gestoras en paralelo...');
    (async () => {
      try {
        const [estado, bolsas, estadosGestion, gestorasData] = await Promise.all([
          bolsasService.obtenerEstadisticasPorEstado().catch(() => []),
          bolsasService.obtenerEstadisticasPorTipoBolsa().catch(() => []),
          bolsasService.obtenerEstadosGestion().catch(() => []),
          bolsasService.obtenerGestorasDisponibles().catch(() => []),
        ]);
        if (isMountedRef.current) {
          setEstadisticasGlobales(estado || []);
          setEstadisticasTipoBolsa(bolsas || []);
          setEstadisticasCargadas(true);
          if (estadosGestion && Array.isArray(estadosGestion) && estadosGestion.length > 0) {
            const estadosPorCodigo = {};
            estadosGestion.forEach(e => { estadosPorCodigo[e.codEstadoCita] = e; });
            setCacheEstados(estadosPorCodigo);
            setListaEstadosGestion(estadosGestion);
          }
          const gestorasArray = Array.isArray(gestorasData)
            ? gestorasData
            : (gestorasData?.gestoras ?? []);
          setGestoras(gestorasArray);
          console.log('✅ [2.6a] Tarjetas KPI, estados y gestoras cargados');
        }
      } catch (error) {
        console.error('❌ [2.6a] Error cargando tarjetas:', error);
        if (isMountedRef.current) setEstadisticasCargadas(true);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // 📦 EFFECT 2.6b: Cargar ESTADÍSTICAS DE IPRESS para filtros (en paralelo, no espera catálogos)
  // ============================================================================
  // v1.65.2: Desacoplado de catalogosCargados → carga en paralelo junto con 2.6a.
  // Antes esperaba a que los 5 endpoints de cargarCatalogos() terminaran (lento).
  useEffect(() => {
    console.log('📊 [2.6b] Cargando estadísticas de IPRESS para filtros...');
    (async () => {
      try {
        const [ipress, ipressAtencion] = await Promise.all([
          bolsasService.obtenerEstadisticasPorIpress().catch(() => []),
          bolsasService.obtenerEstadisticasPorIpressAtencion().catch(() => []),
        ]);
        if (isMountedRef.current) {
          setEstadisticasIpress(ipress || []);
          setEstadisticasIpressAtencion(ipressAtencion || []);
          console.log('✅ [2.6b] Stats IPRESS para filtros cargadas');
        }
      } catch (error) {
        console.error('❌ [2.6b] Error cargando stats IPRESS:', error);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // 📦 EFFECT 3: Filtrado AUTOMÁTICO cuando cambian los filtros (v2.6.0 - UX: instant filtering)
  // ============================================================================
  // Cuando el usuario cambia CUALQUIER filtro → resetear a página 1 y recargar con filtros
  // IMPORTANTE: useRef para evitar ejecutar en la primer inicialización
  const isFirstLoad = React.useRef(true);

  useEffect(() => {
    // Primera ejecución: solo marcar que ya pasó el primer mount
    if (isFirstLoad.current) {
      console.log('🔍 Primer mount - inicializando filtros...');
      isFirstLoad.current = false;
      return;
    }

    // El usuario cambió un filtro: recargar con filtros
    console.log('🔍 Filtros cambiados - Reloading solicitudes con filtros:', {
      filtroBolsa, filtroMacrorregion, filtroRed, filtroIpress,
      filtroEspecialidad, filtroEstado, filtroTipoCita, filtroAsignacion, searchTerm,
      filtroFechaInicio, filtroFechaFin
    });
    setCurrentPage(1); // Reset a página 1
    setModoSeleccionTotal(false); // v1.65.0: Limpiar modo selección total al cambiar filtros
    setSelectedRows(new Set()); // Limpiar selección al cambiar filtros
    cargarSolicitudesConFiltros(); // Cargar CON FILTROS desde el backend
  }, [filtroBolsa, filtroMacrorregion, filtroRed, filtroIpress, filtroIpressAtencion, filtroEspecialidad, filtroEstado, filtroTipoCita, filtroAsignacion, filtroGestoraId, filtroEstadoBolsa, searchTerm, filtroFechaInicio, filtroFechaFin, registrosPorPagina]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // 📦 EFFECT 4: Cargar SIGUIENTE PÁGINA cuando cambia currentPage (v2.5.2 - Server-side pagination)
  // ============================================================================
  useEffect(() => {
    if (catalogosCargados && currentPage > 1) {
      console.log('📄 Cambio de página detectado:', currentPage);
      setModoSeleccionTotal(false); // v1.65.0: Limpiar modo selección total al cambiar página
      setSelectedRows(new Set()); // Limpiar selección al cambiar página
      // currentPage es 1-based, pero backend espera 0-based
      const pageIndex = currentPage - 1;
      cargarSolicitudesPaginadas(pageIndex);
    }
  }, [currentPage, catalogosCargados]);

  // ============================================================================
  // 📦 EFFECT 5: Recargar gestoras cuando se abre el modal
  // ============================================================================
  useEffect(() => {
    if (modalAsignarGestora && gestoras.length === 0) {
      console.log('👤 Modal abierto, reintentando cargar gestoras...');
      setIsLoadingGestoras(true);
      (async () => {
        try {
          const gestorasData = await bolsasService.obtenerGestorasDisponibles();
          let gestorasArray = [];
          if (gestorasData) {
            if (Array.isArray(gestorasData)) {
              gestorasArray = gestorasData;
            } else if (gestorasData.gestoras && Array.isArray(gestorasData.gestoras)) {
              gestorasArray = gestorasData.gestoras;
            }
          }
          setGestoras(gestorasArray);
          console.log('✅ Gestoras recargadas:', gestorasArray.length);
        } catch (error) {
          console.error('❌ Error recargando gestoras:', error);
        } finally {
          setIsLoadingGestoras(false);
        }
      })();
    }
  }, [modalAsignarGestora]);

  // ============================================================================
  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = React.useRef(true);

  // 🔄 FUNCIÓN 1: Cargar CATÁLOGOS (se ejecuta UNA sola vez)
  // ============================================================================
  const cargarCatalogos = React.useCallback(async () => {
    console.log('📦 Cargando catálogos (ejecutarse solo UNA vez)...');
    try {
      const [estadosData, ipressData, redesData, gestorasData, tiposBolsasData] = await Promise.all([
        bolsasService.obtenerEstadosGestion().catch(() => []),
        bolsasService.obtenerIpress().catch(() => []),
        bolsasService.obtenerRedes().catch(() => []),
        bolsasService.obtenerGestorasDisponibles().catch(() => []), // NEW v2.4.0
        bolsasService.obtenerTiposBolsasActivosPublic().catch(() => [])
      ]);


      // Crear cache de estados, IPRESS y Redes
      if (estadosData && Array.isArray(estadosData)) {
        const estadosMap = {};
        const estadosPorCodigo = {};
        estadosData.forEach(e => {
          estadosMap[e.idEstadoCita] = e;
          estadosPorCodigo[e.codEstadoCita] = e;
        });
        if (isMountedRef.current) {
          setCacheEstados(estadosPorCodigo); // ✅ v3.7.0: Cache por codEstadoCita para lookup rápido
          setListaEstadosGestion(estadosData);
          console.log('📋 Estados de gestión cargados desde BD:', estadosData.length, Object.keys(estadosPorCodigo));
        }
      }

      if (ipressData && Array.isArray(ipressData)) {
        const ipressMap = {};
        ipressData.forEach(i => { ipressMap[i.id] = i; });
        if (isMountedRef.current) setCacheIpress(ipressMap);
      }

      if (redesData && Array.isArray(redesData)) {
        const redesMap = {};
        redesData.forEach(r => { redesMap[r.id] = r; });
        if (isMountedRef.current) setCacheRedes(redesMap);
      }

      // NEW v2.4.0: Cargar gestoras disponibles al inicio
      console.log('📊 DEBUG gestorasData:', gestorasData);
      let gestorasArray = [];
      if (gestorasData) {
        if (Array.isArray(gestorasData)) {
          // Si es array directo
          gestorasArray = gestorasData;
        } else if (gestorasData.gestoras && Array.isArray(gestorasData.gestoras)) {
          // Si es objeto con propiedad gestoras
          gestorasArray = gestorasData.gestoras;
        }
      }
      if (isMountedRef.current) setGestoras(gestorasArray);
      console.log('✅ Gestoras cargadas:', gestorasArray.length, gestorasArray);

      // Tipos de bolsas activos (catálogo)
      console.log('📦 Tipos de bolsas activos:', tiposBolsasData);
      const tiposBolsasArray = Array.isArray(tiposBolsasData) ? tiposBolsasData : [];
      if (isMountedRef.current) setTiposBolsasActivos(tiposBolsasArray);
      console.log('✅ Tipos de bolsas activos cargados:', tiposBolsasArray.length);

      // ✅ v3.0.0: Estadísticas ahora se cargan via EFFECT 2 (consolidated endpoint)
      // NO cargar estadísticas aquí - dejar que el useEffect 2 maneje eso
      if (isMountedRef.current) {
        setCatalogosCargados(true);
      }
    } catch (error) {
      console.error('❌ Error cargando catálogos:', error);
      if (isMountedRef.current) {
        setErrorMessage('Error al cargar catálogos. Intenta nuevamente.');
        setCatalogosCargados(true); // Igualmente marcar como cargado para permitir cargar solicitudes
      }
    }
  }, []);

  // ============================================================================
  // 🔄 FUNCIÓN 2: Cargar SOLICITUDES (se puede ejecutar múltiples veces)
  // ============================================================================
  const cargarSolicitudes = async () => {
    console.log('⚡ Cargando solicitudes (página: 0, size: 100)...');
    setIsLoading(true);
    setErrorMessage('');
    try {
      console.log('📡 Llamando a bolsasService.obtenerSolicitudesPaginado()...');
      // v2.5.1: Usar endpoint paginado para mejorar performance (25 registros por página)
      const response = await bolsasService.obtenerSolicitudesPaginado(0, registrosPorPagina);
      console.log('📥 Respuesta recibida:', response);
      console.log('📊 Tipo de respuesta:', typeof response);

      // Manejar respuesta paginada (Page object del backend)
      let solicitudesData = response;
      let totalElementosDelBackend = response?.length || 0;

      // Si es una respuesta de Page (tiene structure: {content, totalElements, totalPages, etc})
      if (response && response.content && Array.isArray(response.content)) {
        console.log('📄 Respuesta es Page de Spring Data');
        solicitudesData = response.content;
        totalElementosDelBackend = response.totalElements || 0;
        console.log('📊 Total elementos del backend:', totalElementosDelBackend);
        console.log('📊 Total páginas:', response.totalPages);
      }

      console.log('📊 Registros en esta página:', solicitudesData?.length);
      console.log('📊 Es array?:', Array.isArray(solicitudesData));

      // Debug: Verificar estructura de API response
      if (solicitudesData && solicitudesData.length > 0) {
        console.log('📊 DEBUG - Total solicitudes:', solicitudesData.length);
        console.log('📊 DEBUG - Primera solicitud del API:', JSON.stringify(solicitudesData[0], null, 2));
        console.log('📊 DEBUG - Campos disponibles:', Object.keys(solicitudesData[0]));
      } else {
        console.warn('⚠️ solicitudesData está vacío o no es un array');
        setSolicitudes([]);
        setTotalElementos(totalElementosDelBackend);
        setIsLoading(false);
        return;
      }

      // Guardar total de elementos del backend para cálculo de paginación
      setTotalElementos(totalElementosDelBackend);

      // Procesar solicitudes y enriquecer con nombres de catálogos
      const solicitudesEnriquecidas = (solicitudesData || []).map((solicitud, idx) => {
        try {
          // NEW v2.4.0: Mapear responsable_gestora_id a gestora nombre desde lista de gestoras
          const gestoraAsignadaNombre = solicitud.nombre_gestora || null;

          // Formatear fecha de asignación si existe (con hora, sin segundos)
          const fechaAsignacionFormato = solicitud.fecha_asignacion
            ? new Date(solicitud.fecha_asignacion).toLocaleString('es-PE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
            : null;

          return {
            ...solicitud,
            id: solicitud.id_solicitud,
            dni: solicitud.paciente_dni || '',
            paciente: solicitud.paciente_nombre || '',
            telefono: solicitud.paciente_telefono || '',
            telefonoAlterno: solicitud.paciente_telefono_alterno || '',
            correo: solicitud.paciente_email || solicitud.email_pers || '',
            sexo: solicitud.paciente_sexo || solicitud.sexo || 'N/A',
            edad: solicitud.paciente_edad || solicitud.edad || 'N/A',
            estado: solicitud.estado || 'N/A',  // 🟢 Estado de Bolsa (sin mapear)
            estadoCita: mapearEstadoAPI(solicitud.cod_estado_cita || solicitud.estado_gestion_citas_id),  // Estado de cita mapeado
            estadoDisplay: solicitud.desc_estado_cita || getEstadoDisplay(solicitud.cod_estado_cita),
            estadoCodigo: solicitud.cod_estado_cita,
            semaforo: solicitud.recordatorio_enviado ? 'verde' : 'rojo',
            diferimiento: calcularDiferimiento(solicitud.fecha_solicitud),
            especialidad: solicitud.especialidad || '',
            red: solicitud.desc_red || 'Sin asignar',
            ipress: solicitud.desc_ipress || 'N/A',
            macroregion: solicitud.desc_macro || 'Sin asignar',
            bolsa: generarCodigoBolsa(solicitud.desc_tipo_bolsa),
            nombreBolsa: generarAliasBolsa(solicitud.desc_tipo_bolsa),
            descBolsa: solicitud.desc_tipo_bolsa || 'Sin clasificar',
            fechaCita: solicitud.fecha_asignacion ? new Date(solicitud.fecha_asignacion).toLocaleDateString('es-PE') : 'N/A',
            fechaAsignacion: solicitud.fecha_solicitud ? new Date(solicitud.fecha_solicitud).toLocaleDateString('es-PE') : 'N/A',
            gestoraAsignada: gestoraAsignadaNombre,
            gestoraAsignadaId: solicitud.responsable_gestora_id,
            fechaAsignacionFormato: fechaAsignacionFormato,
            // ============================================================================
            // 📋 LOS 10 CAMPOS DEL EXCEL v1.8.0
            // ============================================================================
            fechaPreferidaNoAtendida: solicitud.fecha_preferida_no_atendida ?
              (() => {
                const [y, m, d] = solicitud.fecha_preferida_no_atendida.split('-');
                return `${d}/${m}/${y}`;
              })() : 'N/A',
            tipoDocumento: solicitud.tipo_documento || 'N/A',
            fechaNacimiento: solicitud.fecha_nacimiento ?
              (() => {
                const [y, m, d] = solicitud.fecha_nacimiento.split('-');
                return `${d}/${m}/${y}`;
              })() : 'N/A',
            tipoCita: solicitud.tipo_cita ? solicitud.tipo_cita.toUpperCase() : 'N/A',
            codigoIpress: solicitud.codigo_adscripcion || 'N/A',
            idIpressAtencion: solicitud.id_ipress_atencion || null,
            codIpressAtencion: solicitud.cod_ipress_atencion || 'N/A',
            descIpressAtencion: solicitud.desc_ipress_atencion || 'N/A',
            ipressAtencion: solicitud.desc_ipress_atencion || 'N/A',
            // ============================================================================
            // � F. INGRESO BOLSA - Campo para FilaSolicitud.jsx (v1.68.1)
            // ============================================================================
            fechaSolicitud: solicitud.fecha_solicitud
              ? new Date(solicitud.fecha_solicitud).toLocaleString('es-PE')
              : null,
            // ============================================================================
            // �📋 AUDITORÍA: CAMBIOS DE ESTADO (v3.3.1)
            // ============================================================================
            fechaCambioEstado: solicitud.fecha_cambio_estado
              ? new Date(solicitud.fecha_cambio_estado).toLocaleString('es-PE')
              : null,
            usuarioCambioEstado: solicitud.usuario_cambio_estado_id
              ? `Usuario ${solicitud.usuario_cambio_estado_id}`
              : null,
            // 🩺 ATENCIÓN MÉDICA (v3.5.0)
            fechaHoraCita: solicitud.fecha_atencion && solicitud.hora_atencion
              ? (() => { const [y,m,d] = solicitud.fecha_atencion.split('-'); return `${d}/${m}/${y} ${solicitud.hora_atencion.substring(0,5)}`; })()
              : solicitud.fecha_atencion
                ? (() => { const [y,m,d] = solicitud.fecha_atencion.split('-'); return `${d}/${m}/${y}`; })()
                : null,
            condicionMedica: solicitud.condicion_medica || null,
            fechaAtencionMedica: solicitud.fecha_atencion_medica
              ? new Date(solicitud.fecha_atencion_medica).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
              : null,
            nombreMedicoAsignado: solicitud.nombre_medico_asignado || null
          };
        } catch (mapError) {
          console.error(`❌ Error procesando solicitud [${idx}]:`, mapError, 'Solicitud:', solicitud);
          throw mapError;
        }
      });

      console.log('✅ Solicitudes enriquecidas (primeras 3):', solicitudesEnriquecidas.slice(0, 3));
      setSolicitudes(solicitudesEnriquecidas);

      // Debug: Ver primera solicitud DESPUÉS del procesamiento
      if (solicitudesEnriquecidas && solicitudesEnriquecidas.length > 0) {
        console.log('✅ DEBUG ENRIQUECIDA - Primera solicitud después del mapeo:', JSON.stringify(solicitudesEnriquecidas[0], null, 2));
        console.log('✅ DEBUG - Campos en objeto enriquecido:', Object.keys(solicitudesEnriquecidas[0]));
      }

      // 🔍 DEBUG: Mostrar datos completos para DNI 70073164
      const solicitud70073164 = solicitudesEnriquecidas.find(s => s.dni === '70073164');
      if (solicitud70073164) {
        console.log('🔍 DEBUG - DOCUMENTO 70073164 - DATOS COMPLETOS DEL BACKEND:');
        console.log('════════════════════════════════════════════════════════════');
        console.log('ID Solicitud:', solicitud70073164.id_solicitud);
        console.log('Nombre:', solicitud70073164.paciente_nombre);
        console.log('DNI:', solicitud70073164.paciente_dni);
        console.log('');
        console.log('🏥 IPRESS - ADSCRIPCIÓN:');
        console.log('  id_ipress:', solicitud70073164.id_ipress);
        console.log('  desc_ipress:', solicitud70073164.desc_ipress);
        console.log('  codigo_adscripcion:', solicitud70073164.codigo_adscripcion);
        console.log('');
        console.log('🏥 IPRESS - ATENCIÓN (NUEVO v1.15.0):');
        console.log('  id_ipress_atencion:', solicitud70073164.id_ipress_atencion);
        console.log('  cod_ipress_atencion:', solicitud70073164.cod_ipress_atencion);
        console.log('  desc_ipress_atencion:', solicitud70073164.desc_ipress_atencion);
        console.log('  ipressAtencion:', solicitud70073164.ipressAtencion);
        console.log('');
        console.log('📋 OBJETO COMPLETO DEL BACKEND:');
        console.log(JSON.stringify(solicitud70073164, null, 2));
        console.log('════════════════════════════════════════════════════════════');
      } else {
        console.log('⚠️ No se encontró documento 70073164 en esta página');
      }

      // Verificar si hay asegurados nuevos sin sincronizar
      verificarAseguradosNuevos();

    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error);
      setErrorMessage('Error al cargar las solicitudes. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 🆕 FUNCIÓN 1B: Cargar SOLICITUDES CON FILTROS (v2.6.0 - UX: instant filtering)
  // ============================================================================
  // Cuando el usuario cambia filtros, el backend devuelve datos filtrados
  // Esta es la nueva función principal para cargar datos
  const cargarSolicitudesConFiltros = async () => {
    console.log('🔍 Cargando solicitudes CON FILTROS desde backend...');
    console.log('📋 Filtros actuales:', {
      filtroBolsa,
      filtroMacrorregion,
      filtroRed,
      filtroIpress,
      filtroEspecialidad,
      filtroEstado,
      filtroTipoCita,
      filtroAsignacion,
      filtroFechaInicio,
      filtroFechaFin,
      searchTerm
    });
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Llamar al backend CON parámetros de filtro (v2.6.0 + v1.42.0: asignación + v1.66.0: rango fechas)
      const asignacionFinal = filtroAsignacion === 'todos' ? null : filtroAsignacion;
      console.log('✅ asignacionFinal para enviar:', asignacionFinal);

      const response = await bolsasService.obtenerSolicitudesPaginado(
        0, // page 0 (primera página cuando cambian los filtros)
        registrosPorPagina,
        filtroBolsa.length === 0 ? null : filtroBolsa.join(','),
        filtroMacrorregion === 'todas' ? null : filtroMacrorregion,
        filtroRed === 'todas' ? null : filtroRed,
        filtroIpress === 'todas' ? null : filtroIpress,
        filtroEspecialidad === 'todas' ? null : filtroEspecialidad,
        filtroEstado === 'todos' ? null : filtroEstado,
        filtroIpressAtencion === 'todas' ? null : filtroIpressAtencion,
        filtroTipoCita === 'todas' ? null : filtroTipoCita,
        asignacionFinal,
        searchTerm.trim() || null,
        filtroFechaInicio || null,
        filtroFechaFin || null,
        null,              // condicionMedica
        filtroGestoraId,   // gestoraId
        filtroEstadoBolsa === 'todos' ? null : filtroEstadoBolsa  // estadoBolsa
      );

      console.log('📥 Respuesta con filtros recibida:', response);

      // Manejar respuesta paginada
      let solicitudesData = response;
      let totalElementosDelBackend = response?.length || 0;

      if (response && response.content && Array.isArray(response.content)) {
        console.log('📄 Respuesta es Page de Spring Data');
        solicitudesData = response.content;
        totalElementosDelBackend = response.totalElements || 0;
        console.log('📊 Total elementos con filtros:', totalElementosDelBackend);
        console.log('📊 Total páginas:', response.totalPages);
      }

      if (solicitudesData && solicitudesData.length > 0) {
        console.log('✅ Página con filtros cargada:', solicitudesData.length, 'registros');

        // Procesar solicitudes (MISMO MAPEO QUE ANTES)
        const solicitudesEnriquecidas = (solicitudesData || []).map((solicitud, idx) => {
          try {
            const gestoraAsignadaNombre = solicitud.nombre_gestora || null;

            const fechaAsignacionFormato = solicitud.fecha_asignacion
              ? new Date(solicitud.fecha_asignacion).toLocaleString('es-PE', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : null;

            return {
              ...solicitud,
              id: solicitud.id_solicitud,
              dni: solicitud.paciente_dni || '',
              paciente: solicitud.paciente_nombre || '',
              telefono: solicitud.paciente_telefono || '',
              telefonoAlterno: solicitud.paciente_telefono_alterno || '',
              correo: solicitud.paciente_email || solicitud.email_pers || '',
              sexo: solicitud.paciente_sexo || solicitud.sexo || 'N/A',
              edad: solicitud.paciente_edad || solicitud.edad || 'N/A',
              estado: solicitud.estado || 'N/A',  // 🟢 Estado de Bolsa (sin mapear)
              estadoCita: mapearEstadoAPI(solicitud.cod_estado_cita || solicitud.estado_gestion_citas_id),  // Estado de cita mapeado
              estadoDisplay: solicitud.desc_estado_cita || getEstadoDisplay(solicitud.cod_estado_cita),
              estadoCodigo: solicitud.cod_estado_cita,
              semaforo: solicitud.recordatorio_enviado ? 'verde' : 'rojo',
              diferimiento: calcularDiferimiento(solicitud.fecha_solicitud),
              especialidad: solicitud.especialidad || '',
              red: solicitud.desc_red || 'Sin asignar',
              ipress: solicitud.desc_ipress || 'N/A',
              macroregion: solicitud.desc_macro || 'Sin asignar',
              bolsa: generarCodigoBolsa(solicitud.desc_tipo_bolsa),
              nombreBolsa: generarAliasBolsa(solicitud.desc_tipo_bolsa),
              descTipoBolsa: solicitud.desc_tipo_bolsa, // ✅ v1.66.6: Guardar descripción completa para filtrado
              fechaCita: solicitud.fecha_asignacion ? new Date(solicitud.fecha_asignacion).toLocaleString('es-PE') : 'N/A',
              fechaAsignacion: solicitud.fecha_solicitud ? new Date(solicitud.fecha_solicitud).toLocaleString('es-PE') : 'N/A',
              gestoraAsignada: gestoraAsignadaNombre,
              gestoraAsignadaId: solicitud.responsable_gestora_id,
              fechaAsignacionFormato: fechaAsignacionFormato,
              fechaPreferidaNoAtendida: solicitud.fecha_preferida_no_atendida ?
                (() => {
                  const [y, m, d] = solicitud.fecha_preferida_no_atendida.split('-');
                  return `${d}/${m}/${y}`;
                })() : 'N/A',
              tipoDocumento: solicitud.tipo_documento || 'N/A',
              fechaNacimiento: solicitud.fecha_nacimiento ?
                (() => {
                  const [y, m, d] = solicitud.fecha_nacimiento.split('-');
                  return `${d}/${m}/${y}`;
                })() : 'N/A',
              tipoCita: solicitud.tipo_cita ? solicitud.tipo_cita.toUpperCase() : 'N/A',
              codigoIpress: solicitud.codigo_adscripcion || 'N/A',
              idIpressAtencion: solicitud.id_ipress_atencion || null,
              codIpressAtencion: solicitud.cod_ipress_atencion || 'N/A',
              descIpressAtencion: solicitud.desc_ipress_atencion || 'N/A',
              ipressAtencion: solicitud.desc_ipress_atencion || 'N/A',
              // ============================================================================
              // � F. INGRESO BOLSA - Campo para FilaSolicitud.jsx (v1.68.1)
              // ============================================================================
              fechaSolicitud: solicitud.fecha_solicitud
                ? new Date(solicitud.fecha_solicitud).toLocaleString('es-PE')
                : null,
              // ============================================================================
              // �📋 AUDITORÍA: CAMBIOS DE ESTADO (v3.3.1) - MAPEO FALTANTE
              // ============================================================================
              fechaCambioEstado: solicitud.fecha_cambio_estado
                ? new Date(solicitud.fecha_cambio_estado).toLocaleString('es-PE')
                : null,
              usuarioCambioEstado: solicitud.nombre_usuario_cambio_estado || null,
              // 🩺 ATENCIÓN MÉDICA (v3.5.0)
              fechaHoraCita: solicitud.fecha_atencion && solicitud.hora_atencion
                ? (() => { const [y,m,d] = solicitud.fecha_atencion.split('-'); return `${d}/${m}/${y} ${solicitud.hora_atencion.substring(0,5)}`; })()
                : solicitud.fecha_atencion
                  ? (() => { const [y,m,d] = solicitud.fecha_atencion.split('-'); return `${d}/${m}/${y}`; })()
                  : null,
              condicionMedica: solicitud.condicion_medica || null,
              fechaAtencionMedica: solicitud.fecha_atencion_medica
                ? new Date(solicitud.fecha_atencion_medica).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
                : null,
              nombreMedicoAsignado: solicitud.nombre_medico_asignado || null
            };
          } catch (mapError) {
            console.error(`❌ Error procesando solicitud [${idx}]:`, mapError);
            throw mapError;
          }
        });

        console.log('✅ Solicitudes enriquecidas con filtros:', solicitudesEnriquecidas.length);
        setSolicitudes(solicitudesEnriquecidas);
        setTotalElementos(totalElementosDelBackend);

        // 🔍 DEBUG: Mostrar datos completos para DNI 70073164
        const solicitud70073164 = solicitudesEnriquecidas.find(s => s.dni === '70073164');
        if (solicitud70073164) {
          console.log('🔍 DEBUG - DOCUMENTO 70073164 - DATOS COMPLETOS DEL BACKEND:');
          console.log('════════════════════════════════════════════════════════════');
          console.log('ID Solicitud:', solicitud70073164.id_solicitud);
          console.log('Nombre:', solicitud70073164.paciente_nombre);
          console.log('DNI:', solicitud70073164.paciente_dni);
          console.log('');
          console.log('🏥 IPRESS - ADSCRIPCIÓN:');
          console.log('  id_ipress:', solicitud70073164.id_ipress);
          console.log('  desc_ipress:', solicitud70073164.desc_ipress);
          console.log('  codigo_adscripcion:', solicitud70073164.codigo_adscripcion);
          console.log('');
          console.log('🏥 IPRESS - ATENCIÓN (NUEVO v1.15.0):');
          console.log('  id_ipress_atencion:', solicitud70073164.id_ipress_atencion);
          console.log('  cod_ipress_atencion:', solicitud70073164.cod_ipress_atencion);
          console.log('  desc_ipress_atencion:', solicitud70073164.desc_ipress_atencion);
          console.log('  ipressAtencion:', solicitud70073164.ipressAtencion);
          console.log('');
          console.log('📋 OBJETO COMPLETO DEL BACKEND:');
          console.log(JSON.stringify(solicitud70073164, null, 2));
          console.log('════════════════════════════════════════════════════════════');
        } else {
          console.log('⚠️ No se encontró documento 70073164 en esta página');
        }
      } else {
        console.warn('⚠️ Sin resultados con estos filtros');
        setSolicitudes([]);
        setTotalElementos(0);
      }

    } catch (error) {
      console.error('❌ Error cargando con filtros:', error);
      setErrorMessage('Error al aplicar filtros. Intenta nuevamente.');
      setSolicitudes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 📄 FUNCIÓN 2: Cargar PÁGINA ESPECÍFICA CON FILTROS (v2.6.0 - integrated filtering)
  // ============================================================================
  const cargarSolicitudesPaginadas = async (pageIndex) => {
    console.log('📄 Cargando página:', pageIndex, 'con filtros aplicados...');
    setIsLoading(true);
    setErrorMessage('');
    try {
      // pageIndex es 0-based (page 0, 1, 2, etc)
      // IMPORTANTE: Pasar los filtros actuales para mantener la consistencia
      const response = await bolsasService.obtenerSolicitudesPaginado(
        pageIndex,
        registrosPorPagina,
        filtroBolsa.length === 0 ? null : filtroBolsa.join(','),
        filtroMacrorregion === 'todas' ? null : filtroMacrorregion,
        filtroRed === 'todas' ? null : filtroRed,
        filtroIpress === 'todas' ? null : filtroIpress,
        filtroEspecialidad === 'todas' ? null : filtroEspecialidad,
        filtroEstado === 'todos' ? null : filtroEstado,
        filtroIpressAtencion === 'todas' ? null : filtroIpressAtencion,
        filtroTipoCita === 'todas' ? null : filtroTipoCita,
        filtroAsignacion === 'todos' ? null : filtroAsignacion,
        searchTerm.trim() || null,
        filtroFechaInicio || null,
        filtroFechaFin || null,
        null,              // condicionMedica
        filtroGestoraId,   // gestoraId
        filtroEstadoBolsa === 'todos' ? null : filtroEstadoBolsa  // estadoBolsa
      );
      console.log('📥 Respuesta página recibida:', response);

      // Manejar respuesta paginada (Page object del backend)
      let solicitudesData = response;
      let totalElementosDelBackend = response?.length || 0;

      if (response && response.content && Array.isArray(response.content)) {
        console.log('📄 Respuesta es Page de Spring Data');
        solicitudesData = response.content;
        totalElementosDelBackend = response.totalElements || 0;
        console.log('📊 Total elementos del backend:', totalElementosDelBackend);
      }

      if (solicitudesData && solicitudesData.length > 0) {
        console.log('✅ Página cargada: ', solicitudesData.length, 'registros');

        // Procesar solicitudes y enriquecer con nombres de catálogos (mismo mapeo que antes)
        const solicitudesEnriquecidas = (solicitudesData || []).map((solicitud, idx) => {
          try {
            const gestoraAsignadaNombre = solicitud.nombre_gestora || null;

            const fechaAsignacionFormato = solicitud.fecha_asignacion
              ? new Date(solicitud.fecha_asignacion).toLocaleString('es-PE', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : null;

            return {
              ...solicitud,
              id: solicitud.id_solicitud,
              dni: solicitud.paciente_dni || '',
              paciente: solicitud.paciente_nombre || '',
              telefono: solicitud.paciente_telefono || '',
              telefonoAlterno: solicitud.paciente_telefono_alterno || '',
              correo: solicitud.paciente_email || solicitud.email_pers || '',
              sexo: solicitud.paciente_sexo || solicitud.sexo || 'N/A',
              edad: solicitud.paciente_edad || solicitud.edad || 'N/A',
              estado: solicitud.estado || 'N/A',  // 🟢 Estado de Bolsa (sin mapear)
              estadoCita: mapearEstadoAPI(solicitud.cod_estado_cita || solicitud.estado_gestion_citas_id),  // Estado de cita mapeado
              estadoDisplay: solicitud.desc_estado_cita || getEstadoDisplay(solicitud.cod_estado_cita),
              estadoCodigo: solicitud.cod_estado_cita,
              semaforo: solicitud.recordatorio_enviado ? 'verde' : 'rojo',
              diferimiento: calcularDiferimiento(solicitud.fecha_solicitud),
              especialidad: solicitud.especialidad || '',
              red: solicitud.desc_red || 'Sin asignar',
              ipress: solicitud.desc_ipress || 'N/A',
              macroregion: solicitud.desc_macro || 'Sin asignar',
              bolsa: generarCodigoBolsa(solicitud.desc_tipo_bolsa),
              nombreBolsa: generarAliasBolsa(solicitud.desc_tipo_bolsa),
              descTipoBolsa: solicitud.desc_tipo_bolsa, // ✅ v1.66.6: Guardar descripción completa para filtrado
              fechaCita: solicitud.fecha_asignacion ? new Date(solicitud.fecha_asignacion).toLocaleString('es-PE') : 'N/A',
              fechaAsignacion: solicitud.fecha_solicitud ? new Date(solicitud.fecha_solicitud).toLocaleString('es-PE') : 'N/A',
              gestoraAsignada: gestoraAsignadaNombre,
              gestoraAsignadaId: solicitud.responsable_gestora_id,
              fechaAsignacionFormato: fechaAsignacionFormato,
              fechaPreferidaNoAtendida: solicitud.fecha_preferida_no_atendida ?
                (() => {
                  const [y, m, d] = solicitud.fecha_preferida_no_atendida.split('-');
                  return `${d}/${m}/${y}`;
                })() : 'N/A',
              tipoDocumento: solicitud.tipo_documento || 'N/A',
              fechaNacimiento: solicitud.fecha_nacimiento ?
                (() => {
                  const [y, m, d] = solicitud.fecha_nacimiento.split('-');
                  return `${d}/${m}/${y}`;
                })() : 'N/A',
              tipoCita: solicitud.tipo_cita ? solicitud.tipo_cita.toUpperCase() : 'N/A',
              codigoIpress: solicitud.codigo_adscripcion || 'N/A',
              idIpressAtencion: solicitud.id_ipress_atencion || null,
              codIpressAtencion: solicitud.cod_ipress_atencion || 'N/A',
              descIpressAtencion: solicitud.desc_ipress_atencion || 'N/A',
              ipressAtencion: solicitud.desc_ipress_atencion || 'N/A',
              // ============================================================================
              // 📅 F. INGRESO BOLSA - Campo para FilaSolicitud.jsx (v1.68.1)
              // ============================================================================
              fechaSolicitud: solicitud.fecha_solicitud
                ? new Date(solicitud.fecha_solicitud).toLocaleString('es-PE')
                : null,
              // 🩺 ATENCIÓN MÉDICA (v3.5.0)
              fechaHoraCita: solicitud.fecha_atencion && solicitud.hora_atencion
                ? (() => { const [y,m,d] = solicitud.fecha_atencion.split('-'); return `${d}/${m}/${y} ${solicitud.hora_atencion.substring(0,5)}`; })()
                : solicitud.fecha_atencion
                  ? (() => { const [y,m,d] = solicitud.fecha_atencion.split('-'); return `${d}/${m}/${y}`; })()
                  : null,
              condicionMedica: solicitud.condicion_medica || null,
              fechaAtencionMedica: solicitud.fecha_atencion_medica
                ? new Date(solicitud.fecha_atencion_medica).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
                : null,
              nombreMedicoAsignado: solicitud.nombre_medico_asignado || null
            };
          } catch (mapError) {
            console.error(`❌ Error procesando solicitud [${idx}]:`, mapError);
            throw mapError;
          }
        });

        setSolicitudes(solicitudesEnriquecidas);
        setTotalElementos(totalElementosDelBackend);
      } else {
        console.warn('⚠️ No hay datos en esta página');
        setSolicitudes([]);
      }
    } catch (error) {
      console.error('❌ Error cargando página paginada:', error);
      setErrorMessage('Error al cargar la página. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Obtener nombre descriptivo del estado para mostrar en tabla
  // ✅ v3.7.0: Usa descripción desde dim_estados_gestion_citas (cacheEstados por codEstadoCita)
  const getEstadoDisplay = (codEstadoCita) => {
    // Buscar en cache de estados desde BD
    if (cacheEstados && codEstadoCita) {
      // Primero buscar por código directo (PENDIENTE_CITA, CITADO, etc.)
      const estadoBD = cacheEstados[codEstadoCita];
      if (estadoBD && estadoBD.descEstadoCita) {
        return estadoBD.descEstadoCita;
      }
    }
    // Fallback si no se encuentra en cache
    const fallbackMap = {
      'PENDIENTE_CITA': 'Pendiente Citar',
      'CITADO': 'Citado',
      'ATENDIDA': 'Asistió',
      'NO_CONTESTA': 'Observado',
      'CANCELADO': 'Cancelado'
    };
    return fallbackMap[codEstadoCita] || codEstadoCita || 'Pendiente';
  };

  // Helper: Mapear estado API a estado UI (v1.6.0 - Estados Gestión Citas)
  const mapearEstadoAPI = (estado) => {
    // Mapeo de códigos de estado v1.6.0 a estados UI para filtros y estadísticas
    const mapping = {
      // Estado inicial
      'PENDIENTE_CITA': 'pendiente',

      // Estados de gestión (después de contacto)
      'CITADO': 'citado',
      'NO_CONTESTA': 'observado',
      'CANCELADO': 'observado',
      'ASISTIO': 'atendido',
      'REPROGRAMADO': 'observado',
      'INASISTENCIA': 'observado',
      'VENCIDO': 'observado',
      'EN_SEGUIMIENTO': 'observado',
      'DERIVADO': 'observado',

      // Compatibilidad hacia atrás (por si API aún retorna valores antiguos)
      'PENDIENTE': 'pendiente',
      'APROBADA': 'citado',
      'RECHAZADA': 'observado',
      'ATENDIDA': 'atendido'
    };

    // Si es un string (cod_estado_cita), buscar en el mapping
    if (typeof estado === 'string') {
      return mapping[estado] || 'pendiente';
    }

    // Si es un número (estado_gestion_citas_id), mapear basado en ID
    // IDs de dim_estados_gestion_citas (v1.33.0):
    // 1=CITADO, 2=NO_CONTESTA, 3=CANCELADO, 4=ASISTIO, 5=PENDIENTE_CITA (INICIAL)
    // 6=REPROGRAMADO, 7=INASISTENCIA, 8=VENCIDO, 9=EN_SEGUIMIENTO, 10=DERIVADO
    const idMapping = {
      1: 'citado',      // CITADO (visitó, asistió)
      2: 'observado',   // NO_CONTESTA (no responde)
      3: 'observado',   // CANCELADO (cita cancelada)
      4: 'atendido',    // ASISTIO (asistió a la cita)
      5: 'pendiente',   // PENDIENTE_CITA ◄─── INICIAL (Paciente nuevo que ingresó a la bolsa)
      6: 'observado',   // REPROGRAMADO (reprogramada)
      7: 'observado',   // INASISTENCIA (no asistió)
      8: 'observado',   // VENCIDO (plazo vencido)
      9: 'observado',   // EN_SEGUIMIENTO (seguimiento)
      10: 'observado'   // DERIVADO (derivada a otro)
    };

    return idMapping[estado] || 'pendiente';
  };

  // Helper: Calcular diferimiento en días desde la fecha de solicitud
  const calcularDiferimiento = (fechaSolicitud) => {
    if (!fechaSolicitud) return 0;
    const fecha = new Date(fechaSolicitud);
    const hoy = new Date();
    const diferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return Math.max(0, diferencia);
  };

  // ============================================================================
  // 🗑️ FUNCIÓN: Borrar solicitudes seleccionadas O TODAS
  // ============================================================================
  const borrarSolicitudesSeleccionadas = async () => {
    // Determinar qué IDs borrar: todos o solo seleccionados
    let idsSeleccionados = [];

    if (seleccionarTodas) {
      // Borrar TODAS las solicitudes filtradas (todas las páginas)
      idsSeleccionados = solicitudes.map(s => s.id);
      console.log(`🗑️ Borrado MASIVO: Todas ${idsSeleccionados.length} solicitudes`);
    } else {
      // Borrar solo los seleccionados en los checkboxes
      idsSeleccionados = Array.from(selectedRows);
      console.log(`🗑️ Borrado selectivo: ${idsSeleccionados.length} solicitudes seleccionadas`);
    }

    if (idsSeleccionados.length === 0) {
      setErrorMessage('No hay solicitudes seleccionadas para borrar');
      return;
    }

    setModalConfirmarBorrado(false);
    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('🗑️ Borrando solicitudes:', idsSeleccionados);

      // Llamar al servicio para borrar múltiples solicitudes
      const resultado = await bolsasService.eliminarMultiplesSolicitudes(idsSeleccionados);
      console.log('✅ Resultado del borrado:', resultado);

      // Mostrar éxito
      setImportStatus({
        type: 'success',
        message: `✅ Se borraron ${idsSeleccionados.length} solicitud(es) correctamente`,
        showModal: true
      });

      // Limpiar selección
      setSelectedRows(new Set());
      setSeleccionarTodas(false);

      // Recargar solicitudes (sin catálogos, más rápido)
      setTimeout(() => {
        cargarSolicitudes();
      }, 1500);

    } catch (error) {
      console.error('❌ Error borrando solicitudes:', error);
      setErrorMessage(`❌ Error al borrar: ${error.message}`);
      setImportStatus({
        type: 'error',
        message: `❌ Error al borrar solicitudes: ${error.message}`,
        showModal: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si hay asegurados nuevos detectados (no sincronizados)
  const verificarAseguradosNuevos = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/bolsas/solicitudes/asegurados-nuevos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth.token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.total > 0) {
          setAseguradosNuevos(data.asegurados);
          setModalAseguradosNuevos(true);
          console.log('⚠️ Se encontraron ' + data.total + ' asegurados nuevos sin sincronizar');
        }
      }
    } catch (error) {
      console.warn('No se pudo verificar asegurados nuevos:', error.message);
    }
  };

  // Calcular estadísticas (v2.5.2 - Use global stats from backend)
  // ✅ v3.0.1: Calcular estadísticas SOLO desde datos del backend, nunca desde tabla local
  // Esto previene mostrar números incorrectos en la primera carga
  const estadisticas = (() => {
    if (estadisticasGlobales && Array.isArray(estadisticasGlobales) && estadisticasGlobales.length > 0) {
      // estadisticasGlobales es un array de EstadisticasPorEstadoDTO desde el backend
      const statsMap = {};
      let total = 0;

      estadisticasGlobales.forEach(stat => {
        const estado = stat.estado?.toUpperCase();
        const cantidad = stat.cantidad || 0;
        statsMap[estado] = cantidad;
        // 👥 v1.41.0: Total NO incluye ASIGNADOS (es una métrica separada)
        if (estado !== 'ASIGNADOS') {
          total += cantidad;
        }
      });

      const asignados = statsMap['ASIGNADOS'] || 0;
      return {
        total: total,
        pendientes: statsMap['PENDIENTE_CITA'] || 0,      // ✅ v1.54.4: Usar PENDIENTE_CITA (código del estado)
        citados: statsMap['CITADO'] || 0,                 // ✅ v1.54.4: CITADO (código del estado)
        asignados: asignados,                             // 👥 v1.41.0: Casos asignados a gestora
        sinAsignar: total - asignados,                    // ✅ v1.42.0: Casos sin asignar
      };
    } else {
      // ✅ v3.0.3: Si las estadísticas no han cargado aún, mostrar loader animado
      // NO usar solicitudes.length porque eso causa números incorrectos en la primera carga
      return {
        total: null,  // null = mostrar loader
        pendientes: null,
        citados: null,
        asignados: null,
        sinAsignar: null,
      };
    }
  })();

  // ✅ v2.6.0 - Filtrado ahora es SERVER-SIDE
  // Ya no hay necesidad de filtrado client-side
  // `solicitudes` contiene los registros filtrados del backend
  // `totalElementos` contiene el total global con filtros aplicados

  // Calcular paginación (v2.6.0 - Server-side pagination integrada)
  const totalRegistros = totalElementos > 0 ? totalElementos : solicitudes.length;
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  // Los registros mostrados son directamente `solicitudes` (ya paginados y filtrados desde el backend)
  const solicitudesPaginadas = solicitudes;

  // ✅ v1.80.0: Ordenamiento client-side de la página actual
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const SortIcon = ({ columnKey }) => {
    const isActive = sortConfig.key === columnKey;
    if (!isActive) return <span className="ml-1 text-white/30 text-xs">⇅</span>;
    return sortConfig.direction === 'asc'
      ? <span className="ml-1 text-yellow-300 font-bold">↑</span>
      : <span className="ml-1 text-yellow-300 font-bold">↓</span>;
  };

  // Mapa de columna → campo raw ISO para ordenar fechas correctamente
  const SORT_RAW_FIELD = {
    fechaSolicitud: 'fecha_solicitud',
    fechaAsignacion: 'fecha_solicitud',
    fechaAtencionMedica: 'fecha_atencion_medica',
    fechaHoraCita: 'fecha_atencion',
  };

  const sortedSolicitudesPaginadas = useMemo(() => {
    if (!sortConfig.key) return solicitudesPaginadas;
    const rawField = SORT_RAW_FIELD[sortConfig.key];
    return [...solicitudesPaginadas].sort((a, b) => {
      let aVal = rawField ? (a[rawField] ?? '') : (a[sortConfig.key] ?? '');
      let bVal = rawField ? (b[rawField] ?? '') : (b[sortConfig.key] ?? '');
      // Comparar como fechas si el campo raw es ISO
      if (rawField && aVal && bVal) {
        return sortConfig.direction === 'asc'
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [solicitudesPaginadas, sortConfig]);

  // ✅ v1.42.0: Manejador para clics en cards de estadísticas
  const handleCardClick = (cardType) => {
    console.log('📊 handleCardClick - cardType:', cardType, 'cardSeleccionado actual:', cardSeleccionado);

    if (cardSeleccionado === cardType) {
      // Click nuevamente → deseleccionar y limpiar filtros
      console.log('🔄 Deseleccionando card - limpiando todos los filtros');
      setCardSeleccionado(null);
      setFiltroEstado('todos');
      setFiltroAsignacion('todos');
      setFiltroGestoraId(null);
      setFiltroEstadoBolsa('todos');
    } else {
      // Seleccionar este card → limpiar TODOS los filtros para que la tabla concuerde con el número del card
      setCardSeleccionado(cardType);
      setFiltroBolsa([]);
      setFiltroIpress('todas');
      setFiltroEspecialidad('todas');
      setFiltroTipoCita('todas');
      setFiltroGestoraId(null);
      setFiltroEstadoBolsa('todos');
      setFiltroFechaInicio('');
      setFiltroFechaFin('');
      setSearchTerm('');

      switch (cardType) {
        case 'total':
          setFiltroEstado('todos');
          setFiltroAsignacion('todos');
          break;
        case 'pendiente':
          setFiltroEstado('PENDIENTE_CITA');
          setFiltroAsignacion('todos');
          break;
        case 'asignado':
          setFiltroEstado('todos');
          setFiltroAsignacion('asignados');
          break;
        case 'sin_asignar':
          setFiltroEstado('todos');
          setFiltroAsignacion('sin_asignar');
          break;
        default:
          break;
      }
    }
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      citado: 'bg-purple-100 text-purple-800 border border-purple-300',
      atendido: 'bg-green-100 text-green-800 border border-green-300',
      observado: 'bg-red-100 text-red-800 border border-red-300'
    };
    return estilos[estado] || estilos.pendiente;
  };

  const getSemaforoColor = (semaforo) => {
    return semaforo === 'rojo' ? 'text-red-500' : 'text-green-500';
  };

  const getBolsaColor = (bolsa) => {
    const colorMap = {
      'BOLSA 107': 'bg-green-100 text-green-700 border border-green-300',
      'BOLSA DENGUE': 'bg-orange-100 text-orange-700 border border-orange-300',
      'BOLSAS ENFERMERIA': 'bg-cyan-100 text-cyan-700 border border-cyan-300',
      'BOLSAS EXPLOTADATOS': 'bg-pink-100 text-pink-700 border border-pink-300',
      'BOLSAS IVR': 'bg-purple-100 text-purple-700 border border-purple-300',
      'BOLSAS REPROGRAMACION': 'bg-blue-100 text-blue-700 border border-blue-300',
      'BOLSA GESTORES TERRITORIAL': 'bg-indigo-100 text-indigo-700 border border-indigo-300'
    };
    return colorMap[bolsa] || 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  const getSexoColor = (sexo) => {
    return sexo === 'Femenino'
      ? 'bg-pink-100 text-pink-700 border border-pink-300'
      : 'bg-blue-100 text-blue-700 border border-blue-300';
  };

  const getRedColor = () => {
    return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
  };

  // ============================================================================
  // 🎯 FUNCIONES PARA CALCULAR CONTADORES DINÁMICOS
  // ============================================================================
  const countWithFilters = (filterKey, filterValue) => {
    return solicitudes.filter(sol => {
      const matchSearch = !searchTerm || sol.dni.includes(searchTerm);

      // Si estamos contando esta opción, usa filterValue; si no, usa el filtro activo
      const matchBolsa = filterKey === 'bolsa' ? sol.descTipoBolsa === filterValue : (filtroBolsa.length === 0 ? true : filtroBolsa.includes(sol.descTipoBolsa));
      const matchMacrorregion = filterKey === 'macro' ? sol.macroregion === filterValue : (filtroMacrorregion === 'todas' ? true : sol.macroregion === filtroMacrorregion);
      const matchRed = filterKey === 'red' ? sol.red === filterValue : (filtroRed === 'todas' ? true : sol.red === filtroRed);
      const matchIpress = filterKey === 'ipress' ? sol.ipress === filterValue : (filtroIpress === 'todas' ? true : sol.ipress === filtroIpress);
      const getEspecialidadDisplay = (s) => {
        return (s.especialidad && s.especialidad.trim() !== '') ? s.especialidad : 'S/E';
      };
      const especDisplayValue = getEspecialidadDisplay(sol);
      const matchEspecialidad = filtroEspecialidad === 'todas' ? true : especDisplayValue === filtroEspecialidad;
      const matchTipoCita = filterKey === 'cita' ? (sol.tipoCita?.toUpperCase?.() || '') === filterValue : (filtroTipoCita === 'todas' ? true : (sol.tipoCita?.toUpperCase?.() || '') === filtroTipoCita);
      const matchEstado = filterKey === 'estado' ? sol.estadoCodigo === filterValue : (filtroEstado === 'todos' ? true : sol.estadoCodigo === filtroEstado);

      return matchSearch && matchBolsa && matchMacrorregion && matchRed && matchIpress && matchEspecialidad && matchTipoCita && matchEstado;
    }).length;
  };

  // Obtener valores únicos para filtros dinámicos
  const bolsasUnicas = [...new Set(solicitudes.map(s => s.nombreBolsa))].filter(b => b && b !== 'Sin clasificar').sort();
  const redesUnicas = [...new Set(solicitudes.map(s => s.red))].sort();
  const ipressUnicas = [...new Set(solicitudes.map(s => s.ipress))].filter(i => i && i !== 'N/A').sort();
  const macrorregionesUnicas = [...new Set(solicitudes.map(s => s.macroregion))].filter(m => m && m !== 'N/A').sort();

  // NEW v1.42.0: Usar especialidades desde backend (TODAS, no solo de página actual)
  const especialidadesUnicas = especialidadesActivas && especialidadesActivas.length > 0
    ? especialidadesActivas
    : [];

  // Verificar si hay registros SIN especialidad y agregar "S/E"
  const hayRegistrosSinEspecialidad = solicitudes.some(s => !s.especialidad || s.especialidad.trim() === '');
  const especialidadesConSE = hayRegistrosSinEspecialidad
    ? ['S/E', ...especialidadesUnicas].sort()
    : especialidadesUnicas.sort();
  // Whitelist de tipos de cita válidos
  const TIPOS_CITA_VALIDOS = ['VOLUNTARIA', 'INTERCONSULTA', 'RECITA', 'REFERENCIA'];
  const tiposCitaUnicos = [
    ...new Set(
      solicitudes
        .map(s => s.tipoCita?.toUpperCase?.() || '')
        .filter(tipo => TIPOS_CITA_VALIDOS.includes(tipo))
    )
  ].sort();

  // Estados únicos del filtro dinámico (usar código original para filtrado)
  const estadosUnicos = [...new Set(solicitudes.map(s => s.estadoCodigo))].filter(e => e && e !== 'N/A').sort();

  // Manejar selección de filas - Simple y robusto
  const toggleRowSelection = (id) => {
    console.log('🔄 ANTES de toggle:', { id, selectedRows: Array.from(selectedRows), tamaño: selectedRows.size });
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      console.log(`❌ Removiendo ${id} de selección`);
      newSelected.delete(id);
    } else {
      console.log(`✅ Agregando ${id} a selección`);
      newSelected.add(id);
    }
    console.log('🔄 DESPUÉS de toggle:', { id, selectedRows: Array.from(newSelected), tamaño: newSelected.size });
    setSelectedRows(newSelected);
  };

  // Monitoreo de cambios en selectedRows
  useEffect(() => {
    console.log('📊 selectedRows actualizado:', Array.from(selectedRows), 'Total:', selectedRows.size);
  }, [selectedRows]);

  const toggleAllRows = () => {
    if (selectedRows.size === solicitudes.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(solicitudes.map(s => s.id)));
    }
  };

  // Obtener iniciales del paciente
  const getInitials = (nombre) => {
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  // Obtener color para diferimiento
  const getDiferimiento = (dias) => {
    if (dias >= 20) {
      return 'text-red-600';
    } else if (dias >= 10) {
      return 'text-orange-600';
    } else {
      return 'text-green-600';
    }
  };

  // Descargar selección de bolsas en Excel
  const descargarSeleccion = async () => {
    if (selectedRows.size === 0) {
      alert('Selecciona al menos una solicitud para descargar');
      return;
    }

    try {
      const idsSeleccionados = Array.from(selectedRows);
      const token = localStorage.getItem('auth.token');
      const queryParams = new URLSearchParams({
        ids: idsSeleccionados.join(','),
      });

      const response = await fetch(
        `/api/bolsas/solicitudes/exportar-asignados?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const excelBlob = await response.blob();

      // Descargar archivo Excel
      const element = document.createElement('a');
      const url = URL.createObjectURL(excelBlob);
      element.setAttribute('href', url);
      element.setAttribute('download', `solicitudes_${new Date().toISOString().split('T')[0]}.xlsx`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando Excel:', error);
      alert('Error al descargar el archivo. Intenta nuevamente.');
    }
  };

  // ========================================================================
  // 📋 HANDLERS DE ACCIONES
  // ========================================================================

  // Abrir modal para cambiar teléfono (v2.4.3 - ambos teléfonos)
  // v1.75.0: Abrir modal de historial de trazabilidad
  const handleVerHistorial = useCallback((solicitud) => {
    setSolicitudHistorial(solicitud);
    setModalHistorial(true);
  }, []);

  const handleAbrirCambiarTelefono = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setNuevoTelefono(solicitud.telefono || '');
    setNuevoTelefonoAlterno(solicitud.telefonoAlterno || '');
    setModalCambiarTelefono(true);
  };

  // Procesar cambio de teléfono (v2.4.3 - permite editar ambos, pueden estar en blanco)
  const handleGuardarCambiarTelefono = async () => {
    // Validar que al menos uno tenga contenido
    if (!nuevoTelefono.trim() && !nuevoTelefonoAlterno.trim()) {
      alert('Por favor ingresa al menos un teléfono');
      return;
    }

    setIsProcessing(true);
    try {
      await bolsasService.actualizarTelefonos(
        solicitudSeleccionada.idSolicitud || solicitudSeleccionada.id,
        nuevoTelefono.trim() || null,
        nuevoTelefonoAlterno.trim() || null
      );
      alert('Teléfonos actualizados correctamente');
      setModalCambiarTelefono(false);
      setNuevoTelefono('');
      setNuevoTelefonoAlterno('');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error actualizando teléfonos:', error);
      alert('Error al actualizar los teléfonos. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ v1.105.0: Abrir modal IPRESS Atención
  const handleAbrirIpressAtencion = useCallback((solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setIpressSeleccionada(null);
    setIpressBusqueda('');
    setIpressResultados([]);
    setModalIpressAtencion(true);
  }, []);

  // Guardar fecha preferida editada inline desde FilaSolicitud
  const handleEditarFechaPreferida = useCallback(async (solicitud, fechaISO) => {
    try {
      await actualizarFechaPreferida(solicitud.id, fechaISO);
      // Actualizar el estado local sin recargar toda la tabla
      const fechaMostrar = fechaISO
        ? (() => { const [y, m, d] = fechaISO.split('-'); return `${d}/${m}/${y}`; })()
        : 'N/A';
      setSolicitudes(prev => prev.map(s =>
        s.id === solicitud.id ? { ...s, fechaPreferidaNoAtendida: fechaMostrar } : s
      ));
      import('react-hot-toast').then(({ default: toast }) =>
        toast.success('Fecha preferida actualizada')
      );
    } catch (e) {
      console.error('Error actualizando fecha preferida:', e);
      import('react-hot-toast').then(({ default: toast }) =>
        toast.error('Error al actualizar la fecha')
      );
    }
  }, []);

  // Buscar IPRESS en tiempo real
  const handleBuscarIpress = async (termino) => {
    setIpressBusqueda(termino);
    if (termino.trim().length < 2) { setIpressResultados([]); return; }
    setLoadingIpress(true);
    try {
      const resultados = await ipressService.buscar(termino);
      setIpressResultados(resultados.slice(0, 10));
    } catch (e) {
      console.error('Error buscando IPRESS:', e);
    } finally {
      setLoadingIpress(false);
    }
  };

  // Guardar IPRESS Atención seleccionada
  const handleGuardarIpressAtencion = async () => {
    if (!ipressSeleccionada) { alert('Selecciona una IPRESS'); return; }
    setIsProcessing(true);
    try {
      await actualizarIpressAtencion(
        solicitudSeleccionada.idSolicitud || solicitudSeleccionada.id,
        ipressSeleccionada.id
      );
      alert(`IPRESS Atención actualizada: ${ipressSeleccionada.descIpress}`);
      setModalIpressAtencion(false);
      cargarSolicitudes();
    } catch (error) {
      console.error('Error actualizando IPRESS Atención:', error);
      alert('Error al actualizar. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal para asignar gestora (cargar gestoras disponibles)
  const handleAbrirAsignarGestora = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setGestoraSeleccionada(null);
    console.log('👤 Abriendo modal de asignación. Gestoras disponibles:', gestoras);
    setModalAsignarGestora(true);
  };

  // Procesar asignación a gestora (individual o masiva)
  const handleGuardarAsignarGestora = async () => {
    if (!gestoraSeleccionada) {
      alert('Por favor selecciona una gestora');
      return;
    }

    // Obtener datos de la gestora seleccionada (comparar como strings para evitar type mismatch)
    const gestoraData = gestoras.find(g => String(g.id) === String(gestoraSeleccionada));
    if (!gestoraData) {
      console.error('Gestora no encontrada. Buscando:', gestoraSeleccionada, 'En lista:', gestoras.map(g => ({ id: g.id, idStr: String(g.id), nombre: g.nombre })));
      alert('Gestora no encontrada');
      return;
    }

    console.log('✅ Gestora encontrada:', gestoraData);

    setIsProcessing(true);
    try {
      const gestoraId = Number(gestoraSeleccionada);

      if (modoSeleccionTotal) {
        // MODO SELECCIÓN TOTAL: asignar todos los de la página actual (ya filtrados)
        const todosIds = solicitudes.map(s => s.idSolicitud || s.id).filter(Boolean);
        console.log(`📋 [BULK TOTAL] Asignando ${todosIds.length} solicitudes a ${gestoraData.nombre}`);
        const resultado = await asignarGestoraMasivo(todosIds, gestoraId);
        const actualizados = resultado?.actualizados ?? todosIds.length;
        alert(`✅ ${actualizados} solicitudes asignadas a ${gestoraData.nombre}`);
      } else if (selectedRows.size >= 1) {
        const ids = Array.from(selectedRows);
        if (ids.length === 1) {
          // ASIGNACIÓN INDIVIDUAL
          await bolsasService.asignarAGestora(ids[0], gestoraId, gestoraData.nombre);
          alert('✅ Solicitud asignada correctamente a ' + gestoraData.nombre);
        } else {
          // ASIGNACIÓN MASIVA (bulk) — 1 sola llamada HTTP
          console.log(`📋 [BULK] Asignando ${ids.length} solicitudes a ${gestoraData.nombre}`);
          const resultado = await asignarGestoraMasivo(ids, gestoraId);
          const actualizados = resultado?.actualizados ?? ids.length;
          alert(`✅ ${actualizados} solicitudes asignadas a ${gestoraData.nombre}`);
        }
      } else {
        // Fallback: asignación individual desde solicitudSeleccionada
        await bolsasService.asignarAGestora(
          solicitudSeleccionada.idSolicitud || solicitudSeleccionada.id,
          gestoraId,
          gestoraData.nombre
        );
        alert('✅ Solicitud asignada correctamente a ' + gestoraData.nombre);
      }

      setModalAsignarGestora(false);
      setGestoraSeleccionada(null);
      setSelectedRows(new Set());
      setModoSeleccionTotal(false);
      setTimeout(() => {
        cargarSolicitudesConFiltros();
      }, 300);
    } catch (error) {
      console.error('Error asignando gestora:', error);
      alert('❌ Error al asignar la gestora. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // NEW v2.4.0: Eliminar asignación de gestora
  const handleEliminarAsignacionGestora = async (solicitud) => {
    if (!window.confirm(`¿Deseas eliminar la asignación de ${solicitud.gestoraAsignada}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      // Llamar al servicio para eliminar asignación (pasar null como idGestora)
      await bolsasService.asignarAGestora(
        solicitud.idSolicitud || solicitud.id,
        null, // null significa eliminar
        null
      );
      alert('Asignación eliminada correctamente');
      cargarSolicitudes(); // Recargar solicitudes
    } catch (error) {
      console.error('Error eliminando asignación:', error);
      alert('Error al eliminar la asignación. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal para enviar recordatorio
  const handleAbrirEnviarRecordatorio = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setTipoRecordatorio('EMAIL');
    setModalEnviarRecordatorio(true);
  };

  // Procesar envío de recordatorio
  const handleGuardarEnviarRecordatorio = async () => {
    setIsProcessing(true);
    try {
      await bolsasService.enviarRecordatorio(
        solicitudSeleccionada.idSolicitud || solicitudSeleccionada.id,
        tipoRecordatorio
      );
      alert(`Recordatorio enviado por ${tipoRecordatorio}`);
      setModalEnviarRecordatorio(false);
      cargarSolicitudes(); // Recargar solicitudes (más rápido)
    } catch (error) {
      console.error('Error enviar recordatorio:', error);
      alert('Error al enviar el recordatorio. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal para cambiar tipo de bolsa en múltiples seleccionadas (SOLO SUPERADMIN)
  const handleAbrirCambiarBolsaMasivo = () => {
    // Validar permisos SUPERADMIN
    if (!esSuperAdmin) {
      alert('❌ Solo SUPERADMIN puede cambiar el tipo de bolsa');
      return;
    }

    if (selectedRows.size === 0) {
      alert('Por favor selecciona al menos una solicitud');
      return;
    }

    setBolsaNuevaSeleccionada(null);

    // Cargar bolsas disponibles - Deduplicar por ID
    const bolsasMap = new Map();
    solicitudes.forEach(s => {
      const id = s.idBolsa || s.id_bolsa;
      const nombre = s.nombreBolsa;
      if (nombre && nombre !== 'Sin clasificar' && id) {
        bolsasMap.set(id, nombre);
      }
    });

    const bolsasDispUnicas = Array.from(bolsasMap).map(([id, nombre]) => ({
      id: parseInt(id),
      nombre
    })).sort((a, b) => a.nombre.localeCompare(b.nombre));

    setBolsasDisponibles(bolsasDispUnicas);
    setModalCambiarBolsa(true);
  };

  // Guardar cambio de tipo de bolsa en múltiples seleccionadas
  const handleGuardarCambiarBolsaMasivo = async () => {
    if (!bolsaNuevaSeleccionada) {
      alert('Por favor selecciona un nuevo tipo de bolsa');
      return;
    }

    const idsSeleccionados = Array.from(selectedRows);

    if (idsSeleccionados.length === 0) {
      alert('Por favor selecciona al menos una solicitud');
      return;
    }

    setIsProcessing(true);
    let exitosos = 0;
    let errores = 0;

    try {
      // Procesar cada solicitud seleccionada
      for (const id of idsSeleccionados) {
        try {
          await bolsasService.cambiarTipoBolsa(id, bolsaNuevaSeleccionada);
          exitosos++;
        } catch (error) {
          console.error(`Error en solicitud ${id}:`, error);
          errores++;
        }
      }

      alert(`✅ Tipo de bolsa actualizado: ${exitosos} exitosas, ${errores} con error`);
      setModalCambiarBolsa(false);
      setSelectedRows(new Set()); // Limpiar selección
      cargarSolicitudes(); // Recargar solicitudes
    } catch (error) {
      console.error('Error cambiando tipo de bolsa masivo:', error);
      alert('❌ Error al cambiar el tipo de bolsa. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Procesar importación de Excel
  const handleImportarExcel = async (e) => {
    e.preventDefault();

    if (!archivoExcel || !idTipoBolsaSeleccionado || !idServicioSeleccionado) {
      alert('Por favor complete todos los campos: tipo de bolsa, especialidad y archivo Excel');
      return;
    }

    const formData = new FormData();
    formData.append('file', archivoExcel);
    formData.append('idTipoBolsa', idTipoBolsaSeleccionado);
    formData.append('idServicio', idServicioSeleccionado);

    setIsImporting(true);
    try {
      const result = await bolsasService.importarSolicitudesDesdeExcel(formData);

      // ✅ NUEVO v1.19.0: Mostrar modal con resultados detallados
      setResultadosImportacion(result);
      setModalResultadosImportacion(true);

      // Limpiar formulario y cerrar modal de importación
      setModalImportar(false);
      setIdTipoBolsaSeleccionado('');
      setIdServicioSeleccionado('');
      setArchivoExcel(null);

      // Recargar tabla
      cargarSolicitudes();

      // 📍 Verificar asegurados sincronizados recientemente
      await verificarAseguradosSincronizados();
    } catch (error) {
      console.error('Error al importar Excel:', error);
      alert('Error al importar: ' + (error.message || 'Intenta nuevamente'));
    } finally {
      setIsImporting(false);
    }
  };

  // Función para verificar asegurados sincronizados recientemente
  const verificarAseguradosSincronizados = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/bolsas/asegurados-sincronizados-reciente', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth.token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.total > 0) {
          setAseguradosSincronizados(data.asegurados);
          setModalAseguradosSincronizados(true);
          console.log('✅ Se encontraron ' + data.total + ' asegurados sincronizados recientemente');
        }
      }
    } catch (error) {
      console.warn('No se pudo verificar asegurados sincronizados:', error.message);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full">
        {/* Header Reutilizable */}
        <PageHeader
          badge={{
            label: "Recepción de Bolsa",
            bgColor: "bg-blue-100 text-blue-700",
            icon: FolderOpen
          }}
          title="Solicitudes"
        />

        {/* Tarjetas de Estadísticas - Siempre Visible */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Solicitudes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in">

            {/* 1. Sin Gestora — Rojo (ACCIÓN URGENTE) */}
            <div
              onClick={() => handleCardClick('sin_asignar')}
              className={`rounded-xl p-6 text-white cursor-pointer group overflow-hidden relative
                transition-[transform,box-shadow,opacity] duration-200 ease-out
                hover:scale-[1.02] hover:-translate-y-0.5
                ${cardSeleccionado === 'sin_asignar' ? 'ring-2 ring-white/50 scale-[1.02] -translate-y-0.5' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 45%, #991b1b 100%)',
                boxShadow: cardSeleccionado === 'sin_asignar'
                  ? '0 20px 40px -8px rgba(153,27,27,0.65), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 4px 20px -4px rgba(153,27,27,0.45), inset 0 1px 0 rgba(255,255,255,0.12)'
              }}
            >
              {/* Vignette permanente — profundidad en reposo */}
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)' }} />
              {/* Gloss diagonal — visible solo en hover */}
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)' }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Sin Gestora</span>
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="text-5xl font-bold text-white leading-none mb-2"
                  style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {estadisticas.sinAsignar === null
                    ? <span className="text-2xl opacity-50 animate-pulse">—</span>
                    : estadisticas.sinAsignar.toLocaleString('es-PE')}
                </div>
                <div className="text-xs text-white/60 font-medium">Requieren asignación</div>
              </div>
            </div>

            {/* 2. Pendiente Citar — Naranja (EN COLA) */}
            <div
              onClick={() => handleCardClick('pendiente')}
              className={`rounded-xl p-6 text-white cursor-pointer group overflow-hidden relative
                transition-[transform,box-shadow,opacity] duration-200 ease-out
                hover:scale-[1.02] hover:-translate-y-0.5
                ${cardSeleccionado === 'pendiente' ? 'ring-2 ring-white/50 scale-[1.02] -translate-y-0.5' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 45%, #c2410c 100%)',
                boxShadow: cardSeleccionado === 'pendiente'
                  ? '0 20px 40px -8px rgba(194,65,12,0.65), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 4px 20px -4px rgba(194,65,12,0.45), inset 0 1px 0 rgba(255,255,255,0.12)'
              }}
            >
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)' }} />
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)' }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Pendiente Citar</span>
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="text-5xl font-bold text-white leading-none mb-2"
                  style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {estadisticas.pendientes === null
                    ? <span className="text-2xl opacity-50 animate-pulse">—</span>
                    : estadisticas.pendientes.toLocaleString('es-PE')}
                </div>
                <div className="text-xs text-white/60 font-medium">Esperando llamada</div>
              </div>
            </div>

            {/* 3. Con Gestora — Verde (EN PROGRESO) */}
            <div
              onClick={() => handleCardClick('asignado')}
              className={`rounded-xl p-6 text-white cursor-pointer group overflow-hidden relative
                transition-[transform,box-shadow,opacity] duration-200 ease-out
                hover:scale-[1.02] hover:-translate-y-0.5
                ${cardSeleccionado === 'asignado' ? 'ring-2 ring-white/50 scale-[1.02] -translate-y-0.5' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 45%, #166534 100%)',
                boxShadow: cardSeleccionado === 'asignado'
                  ? '0 20px 40px -8px rgba(22,101,52,0.65), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 4px 20px -4px rgba(22,101,52,0.45), inset 0 1px 0 rgba(255,255,255,0.12)'
              }}
            >
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)' }} />
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)' }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Con Gestora</span>
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="text-5xl font-bold text-white leading-none mb-2"
                  style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {estadisticas.asignados === null
                    ? <span className="text-2xl opacity-50 animate-pulse">—</span>
                    : estadisticas.asignados.toLocaleString('es-PE')}
                </div>
                <div className="text-xs text-white/60 font-medium">Gestora asignada</div>
              </div>
            </div>

            {/* 4. Total en Bolsa — Azul (REFERENCIA GLOBAL) */}
            <div
              onClick={() => handleCardClick('total')}
              className={`rounded-xl p-6 text-white cursor-pointer group overflow-hidden relative
                transition-[transform,box-shadow,opacity] duration-200 ease-out
                hover:scale-[1.02] hover:-translate-y-0.5
                ${cardSeleccionado === 'total' ? 'ring-2 ring-white/50 scale-[1.02] -translate-y-0.5' : ''}`}
              style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 45%, #1e3a8a 100%)',
                boxShadow: cardSeleccionado === 'total'
                  ? '0 20px 40px -8px rgba(30,58,138,0.65), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 4px 20px -4px rgba(30,58,138,0.45), inset 0 1px 0 rgba(255,255,255,0.12)'
              }}
            >
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)' }} />
              <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)' }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">Total en Bolsa</span>
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Database className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="text-5xl font-bold text-white leading-none mb-2"
                  style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {estadisticas.total === null
                    ? <span className="text-2xl opacity-50 animate-pulse">—</span>
                    : estadisticas.total.toLocaleString('es-PE')}
                </div>
                <div className="text-xs text-white/60 font-medium">Todos los estados</div>
              </div>
            </div>

          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }
        `}</style>

        {/* Banner filtro activo por card */}
        {cardSeleccionado && cardSeleccionado !== 'total' && (
          <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-medium">
            <span>Filtrado por card:</span>
            <span className="font-bold">
              {cardSeleccionado === 'sin_asignar' && '🚨 Sin Gestora'}
              {cardSeleccionado === 'pendiente' && '⏳ Pendiente Citar'}
              {cardSeleccionado === 'asignado' && '✅ Con Gestora'}
            </span>
            <button
              onClick={() => { setCardSeleccionado(null); setFiltroEstado('todos'); setFiltroAsignacion('todos'); }}
              className="ml-auto text-blue-500 hover:text-blue-700 font-bold text-xs underline"
            >
              Quitar filtro
            </button>
          </div>
        )}

        {/* Sección de Lista de Pacientes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header con título y botón toggle */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Lista de Pacientes</h2>
            <button
              onClick={() => setExpandFiltros(!expandFiltros)}
              className="px-4 py-2 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
              title={expandFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
            >
              <span className="text-sm font-semibold text-gray-700">
                {expandFiltros ? 'Ocultar' : 'Mostrar'} filtros
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform duration-300 ${
                  expandFiltros ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Filtros - Collapse/Expand con animación suave y contenedor visual mejorado */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expandFiltros ? 'max-h-[450px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-2 shadow-sm">
          <ListHeader
            title=""
            showTitle={false}
            searchPlaceholder="Buscar por DNI (8 dígitos)..."
            searchValue={searchTerm}
            onSearchChange={(e) => {
              const valor = e.target.value.replace(/\D/g, '').slice(0, 8);
              setSearchTerm(valor);
            }}
            filters={[
              {
                name: "Bolsas",
                multiSelect: true,
                value: filtroBolsa,
                onMultiChange: (values) => setFiltroBolsa(values),
                options: estadisticasTipoBolsa
                  .sort((a, b) => b.total - a.total)
                  .map(bolsa => {
                    const nombreBolsa = generarAliasBolsa(bolsa.tipoBolsa);
                    return {
                      label: `${nombreBolsa} (${bolsa.total})`,
                      value: bolsa.tipoBolsa
                    };
                  })
              },
              {
                name: "IPRESS - Adscripción",
                searchable: true,
                value: filtroIpress,
                onChange: (e) => setFiltroIpress(e.target.value),
                options: [
                  { label: `Todas (${totalElementos})`, value: "todas" },
                  ...estadisticasIpress
                    .filter(i => i.total > 0)
                    .sort((a, b) => (a.nombreIpress || '').localeCompare(b.nombreIpress || '', 'es', { sensitivity: 'base' }))
                    .map(i => ({
                      label: `${i.nombreIpress} (${i.total})`,
                      value: i.nombreIpress
                    }))
                ]
              },
              {
                name: "IPRESS - Atención",
                searchable: true,
                value: filtroIpressAtencion,
                onChange: (e) => setFiltroIpressAtencion(e.target.value),
                options: [
                  { label: `Todas`, value: "todas" },
                  ...estadisticasIpressAtencion
                    .filter(i => i.total > 0)
                    .sort((a, b) => (a.nombreIpress || '').localeCompare(b.nombreIpress || '', 'es', { sensitivity: 'base' }))
                    .map(i => ({
                      label: `${i.nombreIpress} (${i.total})`,
                      value: i.nombreIpress
                    }))
                ]
              },
              {
                name: "Estado de Gestora",
                searchable: true,
                value: filtroEstado,
                onChange: (e) => setFiltroEstado(e.target.value),
                options: (() => {
                  const statsMap = {};
                  if (estadisticasGlobales && Array.isArray(estadisticasGlobales)) {
                    estadisticasGlobales.forEach(stat => {
                      if (stat.estado) statsMap[stat.estado.toUpperCase()] = stat.cantidad || 0;
                    });
                  }
                  return [
                    { label: `Todos los estados (${totalElementos})`, value: "todos" },
                    ...listaEstadosGestion.map(estado => {
                      const count = statsMap[estado.codEstadoCita?.toUpperCase()] ?? 0;
                      return {
                        label: `${estado.descEstadoCita} (${count})`,
                        value: estado.codEstadoCita
                      };
                    })
                  ];
                })()
              },
              {
                name: "Tipo de Cita",
                searchable: true,
                value: filtroTipoCita,
                onChange: (e) => setFiltroTipoCita(e.target.value),
                options: [
                  { label: "Todas las citas", value: "todas" },
                  { label: "Voluntaria", value: "VOLUNTARIA" },
                  { label: "Recita", value: "RECITA" },
                  { label: "Interconsulta", value: "INTERCONSULTA" },
                  { label: "Referencia", value: "REFERENCIA" }
                ]
              },
              {
                name: "Especialidades",
                searchable: true,
                value: filtroEspecialidad,
                onChange: (e) => setFiltroEspecialidad(e.target.value),
                options: [
                  { label: `Todas las especialidades (${especialidadesConSE.length})`, value: "todas" },
                  ...especialidadesConSE.map(esp => ({
                    label: esp,
                    value: esp
                  }))
                ]
              },
              {
                name: "Estado de Bolsa",
                searchable: false,
                value: filtroEstadoBolsa,
                onChange: (e) => setFiltroEstadoBolsa(e.target.value),
                options: [
                  { label: "Todos", value: "todos" },
                  { label: "Pendiente", value: "PENDIENTE" },
                  { label: "Observado", value: "OBSERVADO" },
                  { label: "Atendido", value: "ATENDIDO" }
                ]
              },
              {
                name: "Gestora Asignada",
                searchable: true,
                value: filtroGestoraId === null ? "todas" : filtroGestoraId === "sin_asignar" ? "sin_asignar" : String(filtroGestoraId),
                onChange: (e) => {
                  const val = e.target.value;
                  if (val === "todas") {
                    setFiltroGestoraId(null);
                    setFiltroAsignacion("todos");
                  } else if (val === "sin_asignar") {
                    setFiltroGestoraId(null);
                    setFiltroAsignacion("sin_asignar");
                  } else {
                    setFiltroAsignacion("todos");
                    setFiltroGestoraId(Number(val));
                  }
                },
                options: [
                  { label: "Todas las gestoras", value: "todas" },
                  { label: "Sin gestora asignada", value: "sin_asignar" },
                  ...gestoras
                    .filter(g => g && g.id && g.nombre)
                    .map(g => ({
                      label: g.nombre,
                      value: String(g.id)
                    }))
                ]
              }
            ]}
            onClearFilters={() => {
              setFiltroBolsa([]);
              setFiltroIpress('todas');
              setFiltroIpressAtencion('todas');
              setFiltroEspecialidad('todas');
              setFiltroEstado('todos');
              setFiltroTipoCita('todas');
              setFiltroAsignacion('todos');
              setFiltroGestoraId(null);
              setFiltroEstadoBolsa('todos');
              setFiltroFechaInicio('');
              setFiltroFechaFin('');
              setSearchTerm('');
              setCardSeleccionado(null);
            }}
          />
          </div>

          {/* ✅ v1.66.0: FILTRO RANGO DE FECHAS - Optimizado v1.67.0 */}
          <div className="px-2 py-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Filtro de Rango de Fechas de Ingreso a Bolsa</label>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1">F. Inicio</label>
                <input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 font-medium"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1">F. Fin</label>
                <input
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 font-medium"
                />
              </div>
            </div>
          </div>

          {/* ✅ v1.76.0: Filtro Pacientes Nuevos + Selector de registros por página */}
          <div className="px-2 py-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* Botón Pacientes Nuevos */}
              <button
                onClick={() => {
                  if (filtroEstado === 'PENDIENTE_CITA') {
                    setFiltroEstado('todos');
                  } else {
                    setFiltroEstado('PENDIENTE_CITA');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all"
                style={filtroEstado === 'PENDIENTE_CITA'
                  ? { background: '#16a34a', color: '#fff', borderColor: '#16a34a' }
                  : { background: '#f0fdf4', color: '#16a34a', borderColor: '#86efac' }}
                title="Muestra solo los pacientes nuevos que ingresaron a la bolsa (sin cita asignada aún)"
              >
                <span>🆕</span>
                {filtroEstado === 'PENDIENTE_CITA' ? '✓ Pacientes Nuevos' : 'Ver Pacientes Nuevos'}
              </button>

              {/* Botón Sincronizar Teléfonos desde Asegurados */}
              <div className="relative group">
                <button
                  onClick={async () => {
                    if (isSyncingPhones) return;
                    setIsSyncingPhones(true);
                    try {
                      const res = await bolsasService.sincronizarTelefonos();
                      const data = res?.data || res;
                      const { default: toast } = await import('react-hot-toast');
                      if (data?.estado === 'exito') {
                        toast.success(`${data.actualizados} teléfonos actualizados de ${data.total_sin_telefono} sin teléfono`);
                        if (data.actualizados > 0) cargarSolicitudes();
                      } else {
                        toast.error(data?.mensaje || 'Error al sincronizar');
                      }
                    } catch (err) {
                      const { default: toast } = await import('react-hot-toast');
                      toast.error('Error al sincronizar teléfonos');
                    } finally {
                      setIsSyncingPhones(false);
                    }
                  }}
                  disabled={isSyncingPhones}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all"
                  style={{ background: isSyncingPhones ? '#e5e7eb' : '#eff6ff', color: isSyncingPhones ? '#9ca3af' : '#1d4ed8', borderColor: isSyncingPhones ? '#d1d5db' : '#93c5fd' }}
                >
                  <Phone size={14} className={isSyncingPhones ? 'animate-pulse' : ''} />
                  {isSyncingPhones ? 'Sincronizando...' : 'Sincronizar Teléfonos'}
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  Completa los teléfonos vacíos buscando en la base de asegurados por DNI
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>

              {/* Selector de registros por página */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-semibold text-gray-600">Registros por página:</span>
                <div className="flex gap-1">
                  {[10, 20, 50, 100].map(n => (
                    <button
                      key={n}
                      onClick={() => setRegistrosPorPagina(n)}
                      className="w-10 h-8 text-xs font-bold rounded-lg border transition-all"
                      style={registrosPorPagina === n
                        ? { background: '#0A5BA9', color: '#fff', borderColor: '#0A5BA9' }
                        : { background: '#f8fafc', color: '#374151', borderColor: '#d1d5db' }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ⚠️ Mensaje de error/aviso de especialidades (v1.42.0) */}
          {errorEspecialidades && (
            <div className={`px-2 py-1 rounded text-xs font-medium mb-1 ${
              errorEspecialidades.includes('Usando')
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {errorEspecialidades.includes('Usando')
                ? '⚠️ ' + errorEspecialidades + ' (mostrando datos de página actual)'
                : '❌ ' + errorEspecialidades}
            </div>
          )}
          </div>

          {/* 📌 ESPACIADO: Separación entre filtros y tabla */}
          <div className="h-2"></div>

          {/* Botones de acción: asignar gestora, descargar, cambiar bolsa, limpiar y borrar */}
          {(selectedRows.size > 0 || solicitudes.length > 0) && (
            <div className="flex justify-end gap-3 flex-wrap">
                {(selectedRows.size >= 1 || modoSeleccionTotal) && !seleccionarTodas && (
                  <button
                    onClick={() => {
                      setGestoraSeleccionada(null);
                      setModalAsignarGestora(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                    title="Asignar los pacientes seleccionados a una gestora de citas"
                  >
                    <UserPlus size={22} className="font-bold" />
                    {modoSeleccionTotal
                      ? `Asignar todos (${totalElementos})`
                      : `Asignar a Gestora (${selectedRows.size})`}
                  </button>
                )}

                {selectedRows.size > 0 && !seleccionarTodas && (
                  <button
                    onClick={descargarSeleccion}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Download size={22} className="font-bold" />
                    Descargar Selección ({selectedRows.size})
                  </button>
                )}

                {selectedRows.size > 0 && (
                  <button
                    onClick={() => {
                      setSelectedRows(new Set());
                      setSeleccionarTodas(false);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                    title="Solo desselecciona sin eliminar"
                  >
                    <X size={22} className="font-bold" />
                    Limpiar Selección
                  </button>
                )}

                {(selectedRows.size > 0 || seleccionarTodas) && (
                  <>
                    {seleccionarTodas && (
                      <button
                        onClick={() => {
                          setSeleccionarTodas(false);
                          setSelectedRows(new Set());
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                      >
                        <X size={22} className="font-bold" />
                        Limpiar Selección
                      </button>
                    )}

                    {esSuperAdmin && (
                      <>
                        <button
                          onClick={handleAbrirCambiarBolsaMasivo}
                          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                          title="Cambiar tipo de bolsa para las seleccionadas"
                        >
                          <Edit size={22} className="font-bold" />
                          Cambiar Bolsa ({selectedRows.size})
                        </button>

                        <button
                          onClick={() => {
                            const cantidad = seleccionarTodas ? solicitudes.length : selectedRows.size;
                            setCantidadABorrar(cantidad);
                            setModalConfirmarBorrado(true);
                          }}
                          className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl ${
                            seleccionarTodas
                              ? 'bg-red-700 hover:bg-red-800'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          <AlertCircle size={22} className="font-bold" />
                          Borrar {seleccionarTodas ? `TODAS (${solicitudes.length})` : `Selección (${selectedRows.size})`}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
          )}

          {/* 📌 ESPACIADO ADICIONAL: Separación antes de la tabla */}
          <div className="h-4"></div>

          {/* SCROLL SUPERIOR para indicar que hay más columnas */}
          <style>{`
            .scroll-top::-webkit-scrollbar {
              height: 12px;
            }
            .scroll-top::-webkit-scrollbar-track {
              background: #dbeafe;
              border-radius: 6px;
            }
            .scroll-top::-webkit-scrollbar-thumb {
              background: #0ea5e9;
              border-radius: 6px;
              border: 1px solid #dbeafe;
            }
            .scroll-top::-webkit-scrollbar-thumb:hover {
              background: #0284c7;
            }
          `}</style>

          {/* Tabla con nuevo diseño visual - Contenedor mejorado */}
          {/* 📜 SCROLL SUPERIOR SINCRONIZADO */}
          <div
            ref={topScrollRef}
            onScroll={handleTopScroll}
            className="overflow-x-auto rounded-t-xl border border-b-0 border-gray-200 bg-white"
            style={{
              height: '12px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#3b82f6 #f3f4f6',
            }}
          >
            <div style={{ width: '3000px', height: '1px' }}></div>
          </div>

          <style>{`
            .table-container::-webkit-scrollbar {
              height: 14px;
            }
            .table-container::-webkit-scrollbar-track {
              background: #f3f4f6;
            }
            .table-container::-webkit-scrollbar-thumb {
              background: #3b82f6;
              border-radius: 7px;
              border: 2px solid #f3f4f6;
            }
            .table-container::-webkit-scrollbar-thumb:hover {
              background: #1d4ed8;
            }
          `}</style>
          <div
            ref={bottomScrollRef}
            onScroll={handleBottomScroll}
            className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)] bg-white rounded-b-xl shadow-lg border border-gray-200 table-container relative"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 font-medium">Cargando solicitudes...</p>
              </div>
            ) : errorMessage ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-semibold">{errorMessage}</p>
                  <button
                    onClick={() => cargarSolicitudes()}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : solicitudes.length > 0 ? (
              <>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Leyenda formato paciente */}
                <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1.5 text-xs text-blue-700 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Paciente:</strong> Género - Nombres del Paciente (Edad)</span>
                </div>
                {/* Leyenda lápiz IPRESS Atención */}
                <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1.5 text-xs text-amber-700 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14H9v-1a2 2 0 01.172-.768z" /></svg>
                  <span><strong>IPRESS Atención</strong> — el lápiz <svg xmlns="http://www.w3.org/2000/svg" className="inline h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14H9v-1a2 2 0 01.172-.768z" /></svg> permite asignar o cambiar la IPRESS donde se atenderá al paciente</span>
                </div>
              </div>
              <table className="w-full border-collapse">
                <thead className="bg-[#0D5BA9] text-white sticky top-0 z-40">
                  <tr className="border-b-2 border-blue-900">
                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === solicitudes.length && solicitudes.length > 0}
                        onChange={toggleAllRows}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </th>
                    {/* Columnas - Orden optimizado v2.1.0 + v1.68.0: F. Ingreso Bolsa primera | v1.80.0: Ordenamiento */}
                    {[
                      { label: 'F. Ingreso Bolsa', key: 'fechaSolicitud' },
                      { label: 'Estado de Bolsa', key: 'estado' },
                      { label: 'Origen de la Bolsa', key: 'nombreBolsa' },
                      { label: 'Fecha Preferida', key: 'fechaPreferidaNoAtendida' },
                      { label: 'T-N° Documento', key: 'dni' },
                      { label: 'Paciente', key: 'paciente' },
                      { label: 'Teléfonos', key: 'telefono' },
                      { label: 'Tipo de Cita', key: 'tipoCita' },
                      { label: 'Especialidad', key: 'especialidad' },
                      { label: 'IPRESS - Adscripción', key: 'ipress' },
                      { label: 'IPRESS - Atención', key: 'ipressAtencion' },
                      { label: 'Red', key: 'red' },
                      { label: 'Estado de Gestora', key: 'estadoDisplay' },
                      { label: 'F/H Cita', key: 'fechaHoraCita' },
                      { label: 'Médico Asignado', key: 'nombreMedicoAsignado' },
                      { label: 'Est. Atención Médica', key: 'condicionMedica' },
                      { label: 'F. Atención Méd.', key: 'fechaAtencionMedica' },
                      { label: 'Fecha Asignación', key: 'fechaAsignacion' },
                      { label: 'Gestora Asignada', key: 'gestoraAsignada' },
                      { label: 'Usuario Cambio Estado', key: 'usuarioCambioEstado' },
                    ].map(({ label, key }) => {
                      const isActive = sortConfig.key === key;
                      return (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className={`px-3 py-3 text-left text-sm font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none transition-colors
                            ${isActive ? 'bg-[#073f7a]' : 'bg-[#0D5BA9] hover:bg-[#0a4f96]'}`}
                        >
                          {label}<SortIcon columnKey={key} />
                        </th>
                      );
                    })}
                    <th className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {/* v1.65.0: Banner "Seleccionar todos los X" (patrón Gmail) */}
                  {selectedRows.size === solicitudes.length && solicitudes.length > 0 && totalElementos > solicitudes.length && (
                    <tr>
                      <td colSpan={99} className="px-0 py-0">
                        <div className="flex items-center justify-center gap-3 bg-blue-50 border-y border-blue-200 py-2 px-4 text-sm text-blue-800">
                          {modoSeleccionTotal ? (
                            <>
                              <span className="font-medium">✅ Los {totalElementos} registros que coinciden están seleccionados.</span>
                              <button
                                onClick={() => { setModoSeleccionTotal(false); setSelectedRows(new Set()); }}
                                className="underline text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Cancelar selección
                              </button>
                            </>
                          ) : (
                            <>
                              <span>Los {solicitudes.length} registros de esta página están seleccionados.</span>
                              <button
                                onClick={() => setModoSeleccionTotal(true)}
                                className="underline text-blue-600 hover:text-blue-800 font-semibold"
                              >
                                Seleccionar los {totalElementos} registros que coinciden
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  {/* 🚀 v2.6.0: Componente memorizado para máxima performance | v1.80.0: Ordenamiento */}
                  {sortedSolicitudesPaginadas.map((solicitud) => (
                    <FilaSolicitud
                      key={solicitud.id}
                      solicitud={solicitud}
                      isChecked={selectedRows.has(solicitud.id)}
                      onToggleCheck={() => toggleRowSelection(solicitud.id)}
                      onAbrirCambiarTelefono={handleAbrirCambiarTelefono}
                      onAbrirAsignarGestora={handleAbrirAsignarGestora}
                      onEliminarAsignacion={handleEliminarAsignacionGestora}
                      onAbrirEnviarRecordatorio={handleAbrirEnviarRecordatorio}
                      onAbrirIpressAtencion={handleAbrirIpressAtencion}
                      onEditarFechaPreferida={handleEditarFechaPreferida}
                      onVerHistorial={handleVerHistorial}
                      isProcessing={isProcessing}
                      getEstadoBadge={getEstadoBadge}
                    />
                  ))}
                </tbody>
              </table>

              {/* 📄 PAGINACIÓN v2.5.2 - Server-side pagination */}
              {solicitudes.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-600 font-medium">
                      {(() => {
                        const registroInicio = (currentPage - 1) * registrosPorPagina + 1;
                        const registroFin = Math.min(currentPage * registrosPorPagina, totalRegistros);
                        return (
                          <>
                            Mostrando <span className="font-bold text-gray-900">{registroInicio}</span>–<span className="font-bold text-gray-900">{registroFin}</span> de <span className="font-bold text-gray-900">{totalRegistros}</span>
                          </>
                        );
                      })()}
                    </div>
                    {/* Selector compacto de registros por página en el footer */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">por pág.:</span>
                      {[10, 20, 50, 100].map(n => (
                        <button
                          key={n}
                          onClick={() => setRegistrosPorPagina(n)}
                          className="w-8 h-6 text-xs font-bold rounded border transition-all"
                          style={registrosPorPagina === n
                            ? { background: '#0A5BA9', color: '#fff', borderColor: '#0A5BA9' }
                            : { background: '#fff', color: '#374151', borderColor: '#d1d5db' }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>

                    <span className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md">
                      Página <span className="font-bold">{currentPage}</span> de <span className="font-bold">{totalPaginas}</span>
                    </span>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPaginas, currentPage + 1))}
                      disabled={currentPage === totalPaginas}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
              </>
            ) : (
              <div className="p-12 text-center">
                {solicitudes.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 inline-block">
                    <p className="text-gray-700 text-base">No hay solicitudes de bolsa registradas en el sistema.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 inline-block">
                    <p className="text-yellow-700 font-semibold text-base mb-2">⚠️ Ninguna coincide con los filtros</p>
                    <p className="text-yellow-600 text-sm">Se encontraron {solicitudes.length} solicitudes, pero ninguna coincide con los filtros aplicados.</p>
                    <p className="text-yellow-600 text-xs mt-2">Intenta cambiar los filtros o limpiar la búsqueda.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ====== MODAL 1: CAMBIAR TELÉFONO (v2.4.3 - ambos campos) ====== */}
        {modalCambiarTelefono && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">📞 Actualizar Teléfonos</h2>
              {solicitudSeleccionada && (
                <p className="text-sm text-gray-600 mb-4">
                  Paciente: <strong>{solicitudSeleccionada.paciente}</strong>
                </p>
              )}

              {/* Campo 1: Teléfono Principal */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono Principal
                </label>
                <input
                  type="tel"
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  placeholder="Ej: 987654321"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Campo 2: Teléfono Alterno */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono Alterno
                </label>
                <input
                  type="tel"
                  value={nuevoTelefonoAlterno}
                  onChange={(e) => setNuevoTelefonoAlterno(e.target.value)}
                  placeholder="Ej: 912345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Nota de validación */}
              <p className="text-xs text-gray-500 mb-6">
                * Al menos uno de los teléfonos es requerido
              </p>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModalCambiarTelefono(false);
                    setNuevoTelefono('');
                    setNuevoTelefonoAlterno('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarCambiarTelefono}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL: IPRESS ATENCIÓN (v1.105.0) ====== */}
        {modalIpressAtencion && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
               onClick={(e) => { if (e.target === e.currentTarget) setModalIpressAtencion(false); }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-bold text-gray-900">🏥 IPRESS de Atención</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Paciente: <span className="font-semibold text-gray-700">{solicitudSeleccionada?.paciente}</span>
                  </p>
                </div>
                <button onClick={() => setModalIpressAtencion(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Actual */}
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
                  <p className="text-xs text-gray-400 mb-1">Actual</p>
                  <p className="font-semibold text-purple-700">
                    {solicitudSeleccionada?.codIpressAtencion && solicitudSeleccionada.codIpressAtencion !== 'N/A'
                      ? `${solicitudSeleccionada.codIpressAtencion} - ${solicitudSeleccionada.ipressAtencion}`
                      : 'Sin IPRESS de atención registrada'}
                  </p>
                </div>

                {/* Buscador */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5 block">
                    Buscar nueva IPRESS
                  </label>
                  <input
                    type="text"
                    value={iprессBusqueda}
                    onChange={(e) => handleBuscarIpress(e.target.value)}
                    placeholder="Escribe nombre o código de IPRESS..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5BA9]/30 focus:border-[#0A5BA9]"
                    autoFocus
                  />
                </div>

                {/* Resultados */}
                {loadingIpress && (
                  <p className="text-xs text-gray-400 text-center py-2">Buscando...</p>
                )}
                {!loadingIpress && ipressResultados.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {ipressResultados.map((ip) => (
                      <button
                        key={ip.id}
                        onClick={() => { setIpressSeleccionada(ip); setIpressBusqueda(ip.descIpress); setIpressResultados([]); }}
                        className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 last:border-b-0 hover:bg-[#0A5BA9]/5 transition-colors ${
                          ipressSeleccionada?.id === ip.id ? 'bg-[#0A5BA9]/10 font-semibold text-[#0A5BA9]' : 'text-gray-800'
                        }`}
                      >
                        <span className="font-semibold text-[#0A5BA9] mr-2">{ip.codIpress}</span>
                        {ip.descIpress}
                      </button>
                    ))}
                  </div>
                )}

                {/* Seleccionada */}
                {ipressSeleccionada && (
                  <div className="bg-[#0A5BA9]/5 border border-[#0A5BA9]/20 rounded-lg px-4 py-3 flex items-center gap-3">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="text-xs text-[#0A5BA9]/70">Seleccionada</p>
                      <p className="text-sm font-bold text-[#0A5BA9]">{ipressSeleccionada.codIpress} - {ipressSeleccionada.descIpress}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setModalIpressAtencion(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarIpressAtencion}
                  disabled={isProcessing || !ipressSeleccionada}
                  className="flex-1 px-4 py-2 bg-[#0A5BA9] hover:bg-[#083d78] text-white rounded-lg font-semibold disabled:opacity-50 text-sm transition-colors"
                >
                  {isProcessing ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL 2: ASIGNAR GESTORA ====== */}
        {modalAsignarGestora && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
               onClick={(e) => {
                 if (e.target === e.currentTarget && !isProcessing) {
                   setModalAsignarGestora(false);
                   setGestoraSeleccionada(null);
                 }
               }}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-auto animate-slide-up overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{selectedRows.size > 1 ? '👥' : '👤'}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Asignar Gestora de Citas</h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {selectedRows.size > 1
                        ? `Selecciona la gestora responsable de ${selectedRows.size} solicitudes`
                        : 'Selecciona la gestora responsable de esta solicitud'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setModalAsignarGestora(false);
                    setGestoraSeleccionada(null);
                    setFiltroGestora('');
                  }}
                  disabled={isProcessing}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Solicitud info - individual or bulk */}
                {selectedRows.size > 1 ? (
                  <div className="mb-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {selectedRows.size}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Asignación Múltiple</p>
                        <p className="text-xs text-gray-600 mt-1">{selectedRows.size} solicitudes serán asignadas a la gestora seleccionada</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  solicitudSeleccionada && (
                    <div className="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Paciente:</p>
                      <p className="font-bold text-gray-900">{solicitudSeleccionada.paciente}</p>
                      <p className="text-xs text-gray-500 mt-2">DNI: {solicitudSeleccionada.dni}</p>
                    </div>
                  )
                )}

                {/* Gestoras list with search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Gestoras Disponibles ({gestoras.filter(g => g.nombre.toLowerCase().includes(filtroGestora.toLowerCase())).length})
                  </label>

                  {/* Search field */}
                  {gestoras.length > 0 && (
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="🔍 Busca por nombre..."
                        value={filtroGestora}
                        onChange={(e) => setFiltroGestora(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  )}

                  {isLoadingGestoras ? (
                    <div className="text-center py-12">
                      <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-gray-500 text-sm">Cargando gestoras disponibles...</p>
                    </div>
                  ) : gestoras.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">❌ No hay gestoras disponibles en el sistema</p>
                    </div>
                  ) : gestoras.filter(g => g.nombre.toLowerCase().includes(filtroGestora.toLowerCase())).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No se encontraron gestoras que coincidan con "{filtroGestora}"</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                      {gestoras
                        .filter(g => g.nombre.toLowerCase().includes(filtroGestora.toLowerCase()))
                        .map((gestora) => (
                        <div
                          key={gestora.id}
                          onClick={() => {
                            if (!isProcessing) {
                              const gestoraIdStr = String(gestora.id);
                              console.log('👤 Gestora seleccionada:', { id: gestora.id, idStr: gestoraIdStr, nombre: gestora.nombre });
                              setGestoraSeleccionada(gestoraIdStr);
                            }
                          }}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            String(gestoraSeleccionada) === String(gestora.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm ${
                              gestoraSeleccionada === gestora.id.toString()
                                ? 'bg-blue-500'
                                : 'bg-gradient-to-br from-blue-400 to-blue-600'
                            }`}>
                              {gestora.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{gestora.nombre}</p>
                              {gestora.activo && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <span>●</span> Activa
                                </p>
                              )}
                            </div>
                            {String(gestoraSeleccionada) === String(gestora.id) && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                                ✓
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setModalAsignarGestora(false);
                    setGestoraSeleccionada(null);
                    setFiltroGestora('');
                  }}
                  disabled={isProcessing}
                  className="px-6 py-2 text-gray-700 font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarAsignarGestora}
                  disabled={isProcessing || gestoras.length === 0 || !gestoraSeleccionada}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block animate-spin">⟳</span>
                      Asignando...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Asignar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slide-up {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}</style>

        {/* ====== MODAL 3: ENVIAR RECORDATORIO ====== */}
        {modalEnviarRecordatorio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Enviar Recordatorio</h2>
              {solicitudSeleccionada && (
                <p className="text-sm text-gray-600 mb-4">
                  Paciente: <strong>{solicitudSeleccionada.paciente}</strong>
                </p>
              )}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Recordatorio
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="WHATSAPP"
                      checked={tipoRecordatorio === 'WHATSAPP'}
                      onChange={(e) => setTipoRecordatorio(e.target.value)}
                      className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm text-gray-700">WhatsApp</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="EMAIL"
                      checked={tipoRecordatorio === 'EMAIL'}
                      onChange={(e) => setTipoRecordatorio(e.target.value)}
                      className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalEnviarRecordatorio(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEnviarRecordatorio}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL 4: CAMBIAR TIPO DE BOLSA (SUPERADMIN) ====== */}
        {modalCambiarBolsa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">⚠️ Cambiar Tipo de Bolsa (Masivo)</h2>
              <p className="text-sm text-gray-600 mb-6">
                <strong>Solicitudes seleccionadas:</strong> {selectedRows.size}
              </p>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seleccionar Nueva Bolsa
                </label>
                <select
                  value={bolsaNuevaSeleccionada || ''}
                  onChange={(e) => setBolsaNuevaSeleccionada(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">-- Seleccione una bolsa --</option>
                  {bolsasDisponibles.map((bolsa) => (
                    <option key={bolsa.id} value={bolsa.id}>
                      {bolsa.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3 mb-6">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Atención:</strong> Se cambiarán el tipo de bolsa para las <strong>{selectedRows.size}</strong> solicitudes seleccionadas. Este cambio se reflejará inmediatamente en la base de datos.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalCambiarBolsa(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarCambiarBolsaMasivo}
                  disabled={isProcessing || !bolsaNuevaSeleccionada}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold disabled:opacity-50"
                >
                  {isProcessing ? `Actualizando (${selectedRows.size})...` : `Actualizar (${selectedRows.size})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL 5: IMPORTAR DESDE EXCEL ====== */}
        {modalImportar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Importar Solicitudes desde Excel</h2>
                <p className="text-sm text-gray-500 mt-1">Cargue un archivo Excel con 2 columnas: DNI y Código Adscripción</p>
              </div>

              <form onSubmit={handleImportarExcel} className="p-6 space-y-6">
                {/* PASO 1: Selector Tipo de Bolsa */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PASO 1: Seleccionar Tipo de Bolsa *
                  </label>
                  <select
                    value={idTipoBolsaSeleccionado}
                    onChange={(e) => setIdTipoBolsaSeleccionado(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="">-- Seleccione un tipo de bolsa --</option>
                    <option value="1">BOLSA_107 - Importación masiva</option>
                    <option value="2">BOLSA_DENGUE - Control epidemiológico</option>
                    <option value="3">BOLSAS_ENFERMERIA - Atenciones de enfermería</option>
                    <option value="4">BOLSAS_EXPLOTADATOS - Análisis y reportes</option>
                    <option value="5">BOLSAS_IVR - Sistema IVR</option>
                    <option value="6">BOLSAS_REPROGRAMACION - Citas reprogramadas</option>
                    <option value="7">BOLSA_GESTORES_TERRITORIAL - Gestión territorial</option>
                  </select>
                </div>

                {/* PASO 2: Selector Especialidad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PASO 2: Seleccionar Especialidad *
                  </label>
                  <select
                    value={idServicioSeleccionado}
                    onChange={(e) => setIdServicioSeleccionado(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="">-- Seleccione una especialidad --</option>
                    <option value="1">Cardiología</option>
                    <option value="2">Neurología</option>
                    <option value="3">Oncología</option>
                    <option value="4">Dermatología</option>
                    <option value="5">Pediatría</option>
                    <option value="6">Psicología</option>
                    <option value="7">Medicina Interna</option>
                  </select>
                </div>

                {/* PASO 3: Carga de Archivo Excel */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PASO 3: Cargar Archivo Excel *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setArchivoExcel(e.target.files?.[0] || null)}
                      className="hidden"
                      id="fileInputExcel"
                      required
                    />
                    <label htmlFor="fileInputExcel" className="cursor-pointer">
                      <p className="text-blue-600 hover:text-blue-700 font-semibold">
                        {archivoExcel ? archivoExcel.name : 'Haga clic para seleccionar archivo'}
                      </p>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Excel debe tener 2 columnas: Columna A = DNI, Columna B = Código Adscripción
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setModalImportar(false);
                      setIdTipoBolsaSeleccionado('');
                      setIdServicioSeleccionado('');
                      setArchivoExcel(null);
                    }}
                    disabled={isImporting}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !archivoExcel || !idTipoBolsaSeleccionado || !idServicioSeleccionado}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Importar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====== MODAL 5: ASEGURADOS NUEVOS ====== */}
        {modalAseguradosNuevos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-yellow-200 bg-yellow-50 sticky top-0">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <h2 className="text-xl font-bold text-yellow-900">Asegurados Nuevos Detectados</h2>
                    <p className="text-sm text-yellow-800 mt-1">Se encontraron {aseguradosNuevos.length} asegurados que no existen en la base de datos</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4">
                  Los siguientes DNIs están siendo usados en solicitudes pero no están registrados en la base de datos de asegurados.
                  <strong> Esto impide mostrar sus nombres completos.</strong>
                </p>

                {/* Tabla de asegurados nuevos */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-yellow-100">
                      <tr>
                        <th className="border border-yellow-300 px-4 py-2 text-left font-semibold text-yellow-900">DNI</th>
                        <th className="border border-yellow-300 px-4 py-2 text-left font-semibold text-yellow-900">Estado Actual</th>
                        <th className="border border-yellow-300 px-4 py-2 text-center font-semibold text-yellow-900">Solicitudes</th>
                        <th className="border border-yellow-300 px-4 py-2 text-left font-semibold text-yellow-900">Primera Solicitud</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aseguradosNuevos.map((aseg, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                          <td className="border border-yellow-200 px-4 py-2 font-mono font-semibold text-blue-600">{aseg.dni}</td>
                          <td className="border border-yellow-200 px-4 py-2">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                              {aseg.estado_actual}
                            </span>
                          </td>
                          <td className="border border-yellow-200 px-4 py-2 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-xs">
                              {aseg.solicitudes_con_este_dni}
                            </span>
                          </td>
                          <td className="border border-yellow-200 px-4 py-2 text-xs text-gray-600">
                            {new Date(aseg.fecha_primera_solicitud).toLocaleDateString('es-PE')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>¿Qué hacer?</strong> Estos asegurados deben ser añadidos a la base de datos de asegurados para mostrar sus nombres completos.
                    Puede realizar una actualización de la BD desde el módulo de importación de asegurados o contactar al administrador del sistema.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalAseguradosNuevos(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setModalAseguradosNuevos(false);
                      // Aquí se podría navegar a un módulo de importación de asegurados
                      console.log('Redirigir a módulo de importación de asegurados');
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                  >
                    Ir a Importar Asegurados
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL 6: ASEGURADOS SINCRONIZADOS RECIENTEMENTE ====== */}
        {modalAseguradosSincronizados && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-green-200 bg-green-50 sticky top-0">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✅</div>
                  <div>
                    <h2 className="text-xl font-bold text-green-900">Pacientes Registrados en la Base de Datos</h2>
                    <p className="text-sm text-green-800 mt-1">
                      {aseguradosSincronizados.length} asegurados han sido registrados/actualizados exitosamente
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4">
                  Los siguientes pacientes han sido sincronizados en la base de datos de asegurados con sus datos de contacto actualizados:
                </p>

                {/* Tabla de asegurados sincronizados */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">DNI</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">Nombre</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">Teléfono</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">Correo</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">Sexo</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">F. Nacimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aseguradosSincronizados.map((aseg, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                          <td className="border border-green-200 px-4 py-2 font-mono font-semibold text-blue-600">{aseg.dni}</td>
                          <td className="border border-green-200 px-4 py-2 font-medium text-gray-800">{aseg.nombre}</td>
                          <td className="border border-green-200 px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              aseg.telefono !== 'N/A' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {aseg.telefono}
                            </span>
                          </td>
                          <td className="border border-green-200 px-4 py-2 truncate max-w-xs" title={aseg.correo}>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              aseg.correo !== 'N/A' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {aseg.correo}
                            </span>
                          </td>
                          <td className="border border-green-200 px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              aseg.sexo === 'Femenino' || aseg.sexo === 'F' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {aseg.sexo}
                            </span>
                          </td>
                          <td className="border border-green-200 px-4 py-2 text-xs text-gray-600">
                            {aseg.fecha_nacimiento !== 'N/A' ? new Date(aseg.fecha_nacimiento).toLocaleDateString('es-PE') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-900">
                    <strong>✅ Sincronización Exitosa:</strong> Los pacientes han sido registrados y sus datos de teléfono y correo han sido actualizados en la base de datos de asegurados.
                    Todos los datos están disponibles para consultas futuras.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalAseguradosSincronizados(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setModalAseguradosSincronizados(false);
                      cargarSolicitudes(); // Recargar tabla con datos actualizados
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold"
                  >
                    Actualizar Tabla
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🗑️ MODAL: Confirmación de Borrado */}
        {modalConfirmarBorrado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-4 ${seleccionarTodas ? 'border-red-700' : 'border-red-500'}`}>
              {/* Icono */}
              <div className="text-6xl mb-4 text-center text-red-500">⚠️</div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-center mb-4 text-red-700">
                {seleccionarTodas ? '🔴 BORRADO MASIVO' : 'Confirmar Borrado'}
              </h2>

              {/* Mensaje */}
              <p className="text-center text-gray-700 mb-6 text-lg">
                {seleccionarTodas ? (
                  <>
                    ¿Está <strong>MUY SEGURO</strong> de que desea borrar <strong className="text-red-700 text-xl">{cantidadABorrar}</strong> solicitud(es)?
                    <br />
                    <span className="text-sm text-red-600">(TODAS las solicitudes)</span>
                  </>
                ) : (
                  <>¿Está seguro de que desea borrar <strong>{cantidadABorrar}</strong> solicitud(es)?</>
                )}
              </p>

              {/* Advertencia */}
              <div className={`border rounded-lg p-4 mb-6 ${
                seleccionarTodas
                  ? 'bg-red-100 border-red-400'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm ${seleccionarTodas ? 'text-red-900' : 'text-red-800'}`}>
                  <strong>⚠️ Atención:</strong> Esta acción <strong>NO se puede deshacer</strong>. Los datos serán eliminados permanentemente de la base de datos.
                </p>
                {seleccionarTodas && (
                  <p className="text-sm text-red-900 mt-2">
                    <strong>🔴 BORRADO MASIVO:</strong> Está a punto de eliminar TODAS las {cantidadABorrar} solicitudes que coinciden con los filtros actuales.
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setModalConfirmarBorrado(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={borrarSolicitudesSeleccionadas}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    seleccionarTodas
                      ? 'bg-red-700 hover:bg-red-800'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Borrando...
                    </>
                  ) : (
                    <>
                      🗑️ Sí, {seleccionarTodas ? 'BORRAR TODAS' : 'Borrar'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NUEVO v1.19.0: MODAL: Resultados Detallados de Importación */}
        <ModalResultadosImportacion
          isOpen={modalResultadosImportacion}
          onClose={() => setModalResultadosImportacion(false)}
          resultados={resultadosImportacion}
        />

        {/* v1.75.0: MODAL: Historial de trazabilidad de solicitud */}
        <DetallesPacienteModal
          isOpen={modalHistorial}
          onClose={() => { setModalHistorial(false); setSolicitudHistorial(null); }}
          paciente={solicitudHistorial ? {
            apellidosNombres: solicitudHistorial.paciente,
            numDoc: solicitudHistorial.dni,
            telefono: solicitudHistorial.telefono,
            ipress: solicitudHistorial.ipress,
          } : null}
          idSolicitud={solicitudHistorial?.id}
        />
      </div>
    </div>
  );
}

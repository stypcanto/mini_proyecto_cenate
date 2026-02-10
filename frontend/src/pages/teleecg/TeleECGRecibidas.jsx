import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity,
  Filter,
  X,
  Search,
  RefreshCw,
  FileDown,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope,
  Edit,
  Zap,
  Bell,
  Eye,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import teleecgService from "../../services/teleecgService";
import VisorEKGModal from "../../components/teleecgs/VisorECGModal";
import CarrouselECGModal from "../../components/teleecgs/CarrouselECGModal";
import ModalEvaluacionECG from "../../components/teleecgs/ModalEvaluacionECG";
import TeleEKGBreadcrumb from "../../components/teleecgs/TeleEKGBreadcrumb";
import toast from "react-hot-toast";

/**
 * 🫀 TeleEKGRecibidas - Panel administrativo de EKGs consolidado
 * Muestra TODAS las EKGs recibidas de TODAS las IPRESS
 * Acceso: ADMIN, SUPERADMIN, COORDINADOR_RED, ENFERMERIA
 */
export default function TeleEKGRecibidas() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const dniParam = searchParams.get('dni'); // ✅ URL parameter support (?dni=123)
  const wsRef = React.useRef(null); // ✅ WebSocket reference

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [ecgs, setEcgs] = useState([]);
  const [selectedEKG, setSelectedEKG] = useState(null);
  const [showVisor, setShowVisor] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ v3.1.0: Modal unificado para triaje clínico
  // Consolidó: showProcesarModal + showEvaluacionModal
  // Flujo: Validación → Evaluación → Nota Clínica
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false);
  const [ecgParaEvaluar, setEcgParaEvaluar] = useState(null);
  const [evaluandoImagen, setEvaluandoImagen] = useState(false);

  // Estadísticas consolidadas (v3.0.0: CENATE view con nuevos estados)
  const [stats, setStats] = useState({
    total: 0,                    // Total de imágenes
    pacientesPendientes: 0,      // Cantidad de pacientes únicos con imágenes pendientes
    pendientes: 0,               // PENDIENTE = ENVIADA en BD
    observadas: 0,               // OBSERVADA = con observaciones
    atendidas: 0,                // ATENDIDA = completadas
  });

  // Filtros (inicializar con DNI desde URL si existe)
  const [filtros, setFiltros] = useState({
    searchTerm: dniParam || "",
    estado: "TODOS",
    ipress: "TODOS",
    fechaDesde: "",
    fechaHasta: "",
  });

  // IPRESS disponibles (para el filtro)
  const [ipressOptions, setIpressOptions] = useState([]);

  // ✅ WebSocket & Real-time
  const [wsConnected, setWsConnected] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  // ✅ Inicializar WebSocket para real-time sync
  const inicializarWebSocket = useCallback(() => {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/teleekgs`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("✅ WebSocket conectado - Real-time sync habilitado");
        setWsConnected(true);
        toast.success("🔗 Conectado a sync en tiempo real");
      };

      wsRef.current.onmessage = (event) => {
        console.log("📨 Notificación WebSocket:", event.data);

        try {
          const data = JSON.parse(event.data);

          // Nueva imagen subida
          if (data.type === "NEW_IMAGE") {
            cargarEKGs(); // Recargar tabla automáticamente
            cargarEstadisticasGlobales();

            // Agregar a notificaciones
            const notif = {
              id: Date.now(),
              type: "success",
              message: `📸 ${data.message || "Nueva imagen ECG recibida"}`,
              timestamp: new Date(),
            };
            setNotificaciones(prev => [...prev, notif]);
            setTimeout(() => {
              setNotificaciones(prev => prev.filter(n => n.id !== notif.id));
            }, 5000);
          }

          // Imagen evaluada
          if (data.type === "IMAGE_EVALUATED") {
            cargarEKGs();
            cargarEstadisticasGlobales();

            const notif = {
              id: Date.now(),
              type: "info",
              message: `✅ EKG evaluada: ${data.resultado || ""}`,
              timestamp: new Date(),
            };
            setNotificaciones(prev => [...prev, notif]);
            setTimeout(() => {
              setNotificaciones(prev => prev.filter(n => n.id !== notif.id));
            }, 5000);
          }
        } catch (error) {
          console.error("Error procesando mensaje WebSocket:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ Error WebSocket:", error);
        setWsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("🔌 WebSocket desconectado - Fallback a polling");
        setWsConnected(false);
        // Reconectar después de 5 segundos
        setTimeout(inicializarWebSocket, 5000);
      };
    } catch (error) {
      console.error("No se pudo inicializar WebSocket:", error);
      // Fallback: usar polling (ya está en auto-refresh)
    }
  }, []);

  // ✅ Inicializar Push Notifications
  const inicializarPushNotifications = useCallback(() => {
    if (!('Notification' in window)) {
      console.log("Push Notifications no soportadas en este navegador");
      return;
    }

    if (Notification.permission === 'granted') {
      console.log("✅ Push Notifications habilitadas");
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log("✅ Push Notifications habilitadas");
          new Notification('CENATE TeleEKG', {
            body: 'Recibirás notificaciones sobre nuevas imágenes ECG',
            icon: '🫀'
          });
        }
      });
    }
  }, []);

  // Cargar EKGs al montarse
  useEffect(() => {
    cargarEKGs();
    cargarEstadisticasGlobales();
    inicializarWebSocket();
    inicializarPushNotifications();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // ✅ Aplicar filtro DNI desde URL si existe
  useEffect(() => {
    if (dniParam) {
      setFiltros(prev => ({ ...prev, searchTerm: dniParam }));
      toast.info(`📍 Filtrado automáticamente por DNI: ${dniParam}`);
    }
  }, [dniParam]);

  // ✅ Auto-refresh cada 30 segundos (para sincronización en tiempo real)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Recargar datos silenciosamente (sin mostrar loading)
        await Promise.all([
          cargarEKGs(),
          cargarEstadisticasGlobales()
        ]);
      } catch (error) {
        console.warn("⚠️ Error en auto-refresh:", error);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  /**
   * ✅ v1.21.5: Cargar todas las EKGs (IMÁGENES INDIVIDUALES, no agrupadas)
   * Esto asegura que contemos IMÁGENES, no PACIENTES
   */
  const cargarEKGs = async () => {
    try {
      setLoading(true);
      // ✅ FIX: Usar endpoint que retorna AGRUPADO por asegurado (1 fila por paciente)
      const response = await teleecgService.listarAgrupoPorAsegurado(filtros.searchTerm, filtros.estado);
      const ecgData = Array.isArray(response) ? response : [];
      setEcgs(ecgData);
      console.log("✅ ECGs agrupadas por asegurado cargadas:", ecgData.length, "pacientes");

      // ✅ FIX: Extraer opciones IPRESS después de cargar los datos
      if (ecgData.length > 0) {
        const ipressUniques = [...new Set(ecgData.map((e) => e.nombre_ipress || e.nombreIpress))].filter(Boolean);
        setIpressOptions(ipressUniques);
        console.log("✅ IPRESS Options extraidas:", ipressUniques.length, "opciones");
      }
    } catch (error) {
      console.error("❌ Error al cargar EKGs:", error);
      setEcgs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ v1.21.5 FIX: Cargar estadísticas GLOBALES (sin filtros) para los cards
   * Los cards muestran TODAS las imágenes del sistema
   * La tabla muestra solo las imágenes filtradas
   *
   * Importante: Esta es la fuente de verdad para los cards
   * Cuenta IMÁGENES, no PACIENTES
   */
  const cargarEstadisticasGlobales = async () => {
    try {
      const response = await teleecgService.obtenerEstadisticas();
      // ✅ El API retorna { success, message, code, data: {...} }
      const statsData = response?.data || response || {};

      // 🔍 El DTO serializa con @JsonProperty en snake_case
      // Contar pacientes únicos con imágenes pendientes desde ecgs cargados
      const pacientesConPendientes = new Set();
      ecgs.forEach((asegurado) => {
        if (asegurado.ecgs_pendientes && asegurado.ecgs_pendientes > 0) {
          pacientesConPendientes.add(asegurado.num_doc_paciente);
        }
      });

      setStats({
        total: statsData.total_imagenes_cargadas || statsData.totalImagenesCargadas || statsData.total || 0,
        pacientesPendientes: pacientesConPendientes.size,  // Cantidad de pacientes únicos con pendientes
        pendientes: statsData.total_imagenes_pendientes || statsData.totalImagenesPendientes || statsData.totalPendientes || 0,
        observadas: statsData.total_imagenes_rechazadas || statsData.totalImagenesRechazadas || statsData.totalObservadas || 0,
        atendidas: statsData.total_imagenes_procesadas || statsData.totalImagenesProcesadas || statsData.totalAtendidas || 0,
      });

      console.log("✅ Estadísticas globales (TODAS las imágenes):", statsData);
      console.log(`✅ Pacientes con pendientes: ${pacientesConPendientes.size}`);
    } catch (error) {
      console.error("❌ Error al cargar estadísticas globales:", error);
      // Fallback: calcular desde datos cargados si falla API
      calcularEstadisticasDesdeEKGs();
    }
  };

  /**
   * Calcular estadísticas desde EKGs cargados (fallback si API falla)
   * Cuenta IMÁGENES INDIVIDUALES y PACIENTES ÚNICOS
   */
  const calcularEstadisticasDesdeEKGs = () => {
    let totalEKGs = 0;
    let pendientes = 0;
    let observadas = 0;
    let atendidas = 0;
    const pacientesConPendientes = new Set();

    // Contar cada PACIENTE y sus IMÁGENES según su estado
    ecgs.forEach((asegurado) => {
      // Contar imágenes pendientes por paciente
      if (asegurado.ecgs_pendientes && asegurado.ecgs_pendientes > 0) {
        pacientesConPendientes.add(asegurado.num_doc_paciente);
        pendientes += asegurado.ecgs_pendientes;
      }

      if (asegurado.ecgs_observadas) {
        observadas += asegurado.ecgs_observadas;
      }

      if (asegurado.ecgs_atendidas) {
        atendidas += asegurado.ecgs_atendidas;
      }

      totalEKGs += (asegurado.total_ecgs || asegurado.ecgs_pendientes + asegurado.ecgs_observadas + asegurado.ecgs_atendidas);
    });

    const nuevasStats = {
      total: totalEKGs,
      pacientesPendientes: pacientesConPendientes.size,
      pendientes: pendientes,
      observadas: observadas,
      atendidas: atendidas,
    };

    setStats(nuevasStats);
    console.log("✅ Estadísticas calculadas desde IMÁGENES (fallback):", nuevasStats);
    console.log(`✅ Pacientes con pendientes: ${pacientesConPendientes.size}`);
  };

  /**
   * Extraer opciones IPRESS únicas de los EKGs
   */
  const extraerIpressOptions = useCallback(() => {
    if (ecgs && ecgs.length > 0) {
      const ipressUniques = [...new Set(ecgs.map((e) => e.nombre_ipress || e.nombreIpress))].filter(
        Boolean
      );
      setIpressOptions(ipressUniques);
      console.log("✅ IPRESS Options extraidas:", ipressUniques.length, "opciones");
    }
  }, [ecgs]);

  /**
   * Refrescar todos los datos
   * ✅ v1.21.5 FIX: Recargar tabla Y estadísticas globales
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      cargarEKGs(),
      cargarEstadisticasGlobales()
    ]);
    setRefreshing(false);
  };

  // ✅ v3.1.0: handleProcesar y handleConfirmarProcesamiento consolidadas en modal unificado
  // Ahora ambos botones (Atender + Procesar) abren ModalEvaluacionECG con validación

  // ❌ ELIMINADO: handleRechazar - No se rechaza en CENATE, solo se atiende

  /**
   * Descargar EKG
   */
  const handleDescargar = async (idImagen, nombreArchivo) => {
    try {
      await teleecgService.descargarImagen(idImagen, nombreArchivo);
    } catch (error) {
      console.error("❌ Error al descargar EKG:", error);
      alert("Error al descargar la imagen");
    }
  };

  /**
   * Ver visor de EKG
   */
  const handleVer = async (ecg) => {
    try {
      const imagenData = await teleecgService.verPreview(ecg.id_imagen || ecg.idImagen);
      const ecgConImagen = {
        ...ecg,
        contenidoImagen: imagenData.contenidoImagen,
        tipoContenido: imagenData.tipoContenido,
      };
      setSelectedEKG(ecgConImagen);
      setShowVisor(true);
    } catch (error) {
      console.error("❌ Error al cargar imagen:", error);
      alert("No se pudo cargar la imagen");
    }
  };

  /**
   * ✅ v3.0.0: Abrir modal de evaluación (NORMAL/ANORMAL + descripción)
   */
  const handleEvaluar = (ecg) => {
    setEcgParaEvaluar(ecg);
    setShowEvaluacionModal(true);
  };

  /**
   * ✅ v5.0.0: Confirmar evaluación y guardar (con opción de marcar como atendido)
   * Ahora recibe directamente el idImagen desde el modal
   */
  const handleConfirmarEvaluacion = async (evaluacion, descripcion, idImagen) => {
    try {
      setEvaluandoImagen(true);

      console.log("📋 [CALLBACK] Evaluación recibida:", {
        evaluacion,
        descripcion: descripcion.substring(0, 50) + "...",
        idImagen,
      });

      // Si no viene idImagen, intentar obtenerlo del objeto ecgParaEvaluar
      const finalIdImagen = idImagen || ecgParaEvaluar?.id_imagen || ecgParaEvaluar?.idImagen;

      if (!finalIdImagen) {
        throw new Error("No se pudo obtener el ID de la imagen para evaluar");
      }

      // Guardar la evaluación
      await teleecgService.evaluarImagen(
        finalIdImagen,
        evaluacion,
        descripcion
      );

      toast.success(`✅ EKG evaluada como ${evaluacion}`);
      setShowEvaluacionModal(false);
      setEcgParaEvaluar(null);
      await Promise.all([cargarEKGs(), cargarEstadisticasGlobales()]);
    } catch (error) {
      console.error("❌ Error al evaluar EKG:", error);
      toast.error(error.message || "Error al guardar evaluación");
    } finally {
      setEvaluandoImagen(false);
    }
  };

  /**
   * Exportar a Excel
   */
  const handleExportar = async () => {
    try {
      await teleecgService.exportarExcel();
      alert("✅ Datos exportados a Excel");
    } catch (error) {
      console.error("❌ Error al exportar:", error);
      alert("Error al exportar los datos");
    }
  };

  /**
   * ✅ v1.21.5: Aplicar filtros (para datos agrupados por asegurado)
   */
  const ecgsFiltrados = ecgs.filter((asegurado) => {
    // Búsqueda por DNI o nombre
    const matchSearch =
      !filtros.searchTerm ||
      asegurado.num_doc_paciente?.includes(filtros.searchTerm) ||
      asegurado.nombres_paciente?.toLowerCase().includes(filtros.searchTerm.toLowerCase()) ||
      asegurado.apellidos_paciente?.toLowerCase().includes(filtros.searchTerm.toLowerCase());

    // Filtro de estado (usando estado_transformado o estado_principal)
    const estado = asegurado.estado_transformado || asegurado.estado_principal;
    const matchEstado =
      filtros.estado === "TODOS" || estado === filtros.estado;

    // Filtro de IPRESS
    const matchIpress =
      filtros.ipress === "TODOS" || asegurado.nombre_ipress === filtros.ipress;

    // Filtro de fecha (usando fecha_ultimo_ecg)
    const fechaEnvio = new Date(asegurado.fecha_ultimo_ecg);
    const matchFecha =
      (!filtros.fechaDesde ||
        fechaEnvio >= new Date(filtros.fechaDesde)) &&
      (!filtros.fechaHasta ||
        fechaEnvio <= new Date(filtros.fechaHasta));

    return matchSearch && matchEstado && matchIpress && matchFecha;
  });

  /**
   * Badge de estado (v3.0.0: Nuevos estados para CENATE)
   * Usa estado_transformado si está disponible (para CENATE es PENDIENTE, OBSERVADA, ATENDIDA)
   * ✅ FIX: Acceder por snake_case ya que API retorna en snake_case
   */
  const getEstadoBadge = (ecg) => {
    // Preferir estado_transformado si está disponible (snake_case desde API)
    const estado = ecg.estado_transformado || ecg.estado_principal || ecg.estadoTransformado || ecg.estado;

    const badges = {
      // Estados transformados para CENATE
      PENDIENTE: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" /> Pendiente
        </span>
      ),
      OBSERVADA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <AlertCircle className="w-3 h-3" /> Observada
        </span>
      ),
      ATENDIDA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" /> Atendida
        </span>
      ),
      // Estados raw de BD v3.0.0 como fallback
      ENVIADA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" /> Enviada
        </span>
      ),
      // Legacy states for backward compatibility
      PROCESADA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" /> Procesada
        </span>
      ),
      RECHAZADA: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" /> Rechazada
        </span>
      ),
    };
    // Si no hay badge definido, mostrar el estado como texto
    return badges[estado] || (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {estado || "Desconocido"}
      </span>
    );
  };

  /**
   * ✅ v3.0.0: Badge para evaluación médica (NORMAL/ANORMAL)
   */
  const getEvaluacionBadge = (evaluacion) => {
    const badges = {
      NORMAL: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" /> NORMAL
        </span>
      ),
      ANORMAL: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="w-3 h-3" /> ANORMAL
        </span>
      ),
      SIN_EVALUAR: (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Clock className="w-3 h-3" /> Sin evaluar
        </span>
      ),
    };
    return badges[evaluacion] || (evaluacion ? evaluacion : badges.SIN_EVALUAR);
  };

  /**
   * Formatear tamaño en bytes
   */
  const formatSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="w-full">
        {/* 🎯 Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              TeleEKG Recibidas
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            Vista consolidada de todos los electrocardiogramas recibidos de las IPRESS
          </p>
        </div>

        {/* ✅ Breadcrumb de navegación */}
        <TeleEKGBreadcrumb />

        {/* 📊 Tarjetas de Estadísticas - Estilo MisECGsRecientes con gradientes */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Resumen de Pendientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Imágenes EKG a analizar - Verde SATURADO */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-600 p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {/* Icono */}
                  <div className="mb-2">
                    <Activity className="w-6 h-6 text-white" />
                  </div>

                  {/* Número */}
                  <div className="mb-1">
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {stats.total}
                    </span>
                  </div>

                  {/* Etiqueta */}
                  <span className="text-xs md:text-sm font-semibold text-white/90">
                    Imágenes EKG a analizar
                  </span>
                </div>
              </div>
            </div>

            {/* Pacientes pendientes - Gris Oscuro/Negro SATURADO */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-800 p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {/* Icono */}
                  <div className="mb-2">
                    <Eye className="w-6 h-6 text-white" />
                  </div>

                  {/* Número */}
                  <div className="mb-1.5">
                    <span className="text-3xl font-bold text-white">
                      {stats.pacientesPendientes}
                    </span>
                  </div>

                  {/* Etiqueta */}
                  <span className="text-xs font-semibold text-white/90">
                    Pacientes pendientes
                  </span>
                </div>
              </div>
            </div>

            {/* Observadas - Ámbar SATURADO */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 border border-orange-600 p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {/* Icono */}
                  <div className="mb-2">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>

                  {/* Número */}
                  <div className="mb-1">
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {stats.observadas}
                    </span>
                  </div>

                  {/* Etiqueta */}
                  <span className="text-xs md:text-sm font-semibold text-white/90">
                    Observadas
                  </span>
                </div>
              </div>
            </div>

            {/* Atendidas - Verde Teal SATURADO */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 border border-teal-600 p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {/* Icono */}
                  <div className="mb-2">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>

                  {/* Número */}
                  <div className="mb-1">
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {stats.atendidas}
                    </span>
                  </div>

                  {/* Etiqueta */}
                  <span className="text-xs md:text-sm font-semibold text-white/90">
                    Atendidas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎨 Sección de Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar (DNI o Nombre)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="DNI o nombre del paciente..."
                  value={filtros.searchTerm}
                  onChange={(e) =>
                    setFiltros({ ...filtros, searchTerm: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Estado (v3.0.0: Nuevos nombres para CENATE) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) =>
                  setFiltros({ ...filtros, estado: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="TODOS">Todos</option>
                <option value="PENDIENTE">Pendientes (Enviadas)</option>
                <option value="OBSERVADA">Observadas (Con problemas)</option>
                <option value="ATENDIDA">Atendidas (Completadas)</option>
              </select>
            </div>

            {/* IPRESS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IPRESS
              </label>
              <select
                value={filtros.ipress}
                onChange={(e) =>
                  setFiltros({ ...filtros, ipress: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="TODOS">Todas</option>
                {ipressOptions.map((ipress) => (
                  <option key={ipress} value={ipress}>
                    {ipress}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro de fechas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaDesde: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaHasta: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                <span>Refrescar</span>
              </button>
              <button
                onClick={handleExportar}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* 📋 Tabla de EKGs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando EKGs...</p>
            </div>
          ) : ecgsFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No se encontraron EKGs con los filtros especificados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      DNI
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Paciente
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      IPRESS
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Fecha Envío
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Tamaño
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Evaluación
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ecgsFiltrados.map((asegurado, index) => (
                    <tr
                      key={`${asegurado.num_doc_paciente}-${index}`}
                      className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                        {asegurado.num_doc_paciente}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{asegurado.nombres_paciente} {asegurado.apellidos_paciente}</p>
                            <p className="text-xs text-slate-500">📌 {asegurado.total_ecgs} EKGs</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        <span className="inline-block px-3 py-2 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                          {asegurado.nombre_ipress || asegurado.codigo_ipress}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {formatDate(asegurado.fecha_ultimo_ecg)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded font-medium border border-yellow-100 w-fit">
                            📤 {asegurado.ecgs_pendientes || 0} Enviadas
                          </span>
                          {asegurado.ecgs_observadas > 0 && (
                            <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded font-medium border border-purple-100 w-fit">
                              ⚠️ {asegurado.ecgs_observadas} Observadas
                            </span>
                          )}
                          {asegurado.ecgs_atendidas > 0 && (
                            <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded font-medium border border-green-100 w-fit">
                              ✅ {asegurado.ecgs_atendidas} Atendidas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getEstadoBadge(asegurado)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getEvaluacionBadge(asegurado.evaluacion_principal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {/* Evaluar si alguna no está evaluada */}
                          {(asegurado.evaluacion_principal === "SIN_EVALUAR" || !asegurado.evaluacion_principal) && (
                            <button
                              onClick={() => {
                                if (asegurado.imagenes && asegurado.imagenes.length > 0) {
                                  // Pasar el objeto completo del asegurado para ver TODAS las imágenes en carrusel
                                  setEcgParaEvaluar(asegurado);
                                  setShowEvaluacionModal(true);
                                }
                              }}
                              title="Evaluar (Diagnóstico)"
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            >
                              <Stethoscope className="w-4 h-4" />
                            </button>
                          )}

                          {/* Procesar si alguna está pendiente - Abre modal unificado v3.1.0 */}
                          {asegurado.ecgs_pendientes > 0 && (
                            <button
                              onClick={() => {
                                if (asegurado.imagenes && asegurado.imagenes.length > 0) {
                                  // Usar el modal unificado (ahora con validación de calidad)
                                  setEcgParaEvaluar(asegurado);
                                  setShowEvaluacionModal(true);
                                }
                              }}
                              title="Procesar EKG (Observaciones)"
                              className="p-2 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Rechazar si alguna está pendiente */}
                          {/* ❌ BOTÓN RECHAZAR ELIMINADO - Solo se atiende en CENATE, no se rechaza */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Información de paginación */}
        {ecgsFiltrados.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando {ecgsFiltrados.length} de {ecgs.length} EKGs
          </div>
        )}
      </div>

      {/* 👁️ ✅ v1.21.5: Modal Carrusel de Múltiples EKGs por Asegurado */}
      {showVisor && selectedEKG && selectedEKG.imagenes && selectedEKG.imagenes.length > 0 ? (
        <CarrouselECGModal
          imagenes={selectedEKG.imagenes}
          paciente={{
            numDoc: selectedEKG.num_doc_paciente,
            nombres: selectedEKG.nombres_paciente,
            apellidos: selectedEKG.apellidos_paciente,
          }}
          onClose={() => {
            setShowVisor(false);
            setSelectedEKG(null);
          }}
          onDescargar={() => {
            toast.error("Función de descarga múltiple aún no implementada");
          }}
        />
      ) : showVisor && selectedEKG ? (
        // Fallback a visor individual si no tiene múltiples imágenes
        <VisorEKGModal
          ecg={selectedEKG}
          onClose={() => {
            setShowVisor(false);
            setSelectedEKG(null);
          }}
          onDescargar={() =>
            handleDescargar(selectedEKG.idImagen, selectedEKG.nombreArchivo)
          }
        />
      ) : null}

      {/* ✅ FIX T-EKG-003: Modal para procesar EKG con observaciones */}
      {/* ✅ v3.1.0: Modal unificado para triaje clínico - Validación + Evaluación + Nota */}
      {showEvaluacionModal && ecgParaEvaluar && (
        <ModalEvaluacionECG
          isOpen={showEvaluacionModal}
          ecg={ecgParaEvaluar}
          onClose={() => {
            setShowEvaluacionModal(false);
            setEcgParaEvaluar(null);
          }}
          onConfirm={handleConfirmarEvaluacion}
          loading={evaluandoImagen}
        />
      )}
    </div>
  );
}

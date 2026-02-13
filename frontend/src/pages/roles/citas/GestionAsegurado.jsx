// ========================================================================
// 👤 GestionAsegurado.jsx – Gestión de Citas y Asegurados
// ========================================================================
// Rediseño v1.41.0: Tabla de Pacientes Asignados como foco principal
// Integración real con /api/bolsas/solicitudes/mi-bandeja
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getToken } from "../../../constants/auth";
import { useStatusChange } from "../../../hooks/useStatusChange";
import ListHeader from "../../../components/ListHeader";
import DateTimePickerCita from "../../../components/DateTimePickerCita";
import {
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  UserPlus,
  RefreshCw,
  Lock,
  ArrowRight,
  Edit2,
  ChevronDown,
  Download,
  Search,
  Plus,
  X,
  Loader2,
  Building2,
  ClipboardList,
  Phone,
  AlertTriangle,
  Smartphone,
  MessageCircle,
  Check,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatearTiempoRelativo } from "../../../utils/dateUtils";


export default function GestionAsegurado() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pacientesAsignados, setPacientesAsignados] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPacientes: 0,
    citado: 0,              // Estado: CITADO (Por atender)
    atendidoIpress: 0,      // Estado: ATENDIDO_IPRESS (Completados)
    pendienteCita: 0,       // Estado: PENDIENTE_CITA (Nuevos en bolsa)
    otros: 0                // Resto de estados (NO_CONTESTA, NO_DESEA, etc.)
  });
  const [error, setError] = useState(null);
  const [modalTelefono, setModalTelefono] = useState({
    visible: false,
    paciente: null,
    telefonoPrincipal: "",
    telefonoAlterno: "",
    saving: false,
  });

  // 📱 Estado para modal de envío de mensaje de cita (v1.50.1)
  const [modalMensajeCita, setModalMensajeCita] = useState({
    visible: false,
    paciente: null,
    preview: null,
    enviando: false,
    step: "preview", // preview | confirmar | enviado
  });

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);

  // ============================================================================
  // FILTROS ESPECIALIZADOS v1.42.0 (inspirados en Solicitudes)
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filtroMacrorregion, setFiltroMacrorregion] = useState("todas");
  const [filtroRed, setFiltroRed] = useState("todas");
  const [filtroIpress, setFiltroIpress] = useState("todas");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("todas");
  const [filtroTipoCita, setFiltroTipoCita] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [expandFiltros, setExpandFiltros] = useState(false); // Filtros colapsados por defecto
  const [selectedRows, setSelectedRows] = useState(new Set()); // Selección de pacientes para descarga
  
  // Filtros de Bolsa y Prioridad (v1.48.0)
  const [filtroTipoBolsa, setFiltroTipoBolsa] = useState("todas");
  const [filtroPrioridad107, setFiltroPrioridad107] = useState("todas");
  const [tiposBolsasAPI, setTiposBolsasAPI] = useState([]); // Bolsas cargadas desde el backend

  // Filtros avanzados Phase 2 (v1.50.0)
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [ipressDisponibles, setIpressDisponibles] = useState([]);
  const [cargandoIpress, setCargandoIpress] = useState(false);

  // 📅 Filtros de rango de fechas (v1.43.3)
  const [filtroFechaIngresoInicio, setFiltroFechaIngresoInicio] = useState("");
  const [filtroFechaIngresoFin, setFiltroFechaIngresoFin] = useState("");
  const [filtroFechaAsignacionInicio, setFiltroFechaAsignacionInicio] = useState("");
  const [filtroFechaAsignacionFin, setFiltroFechaAsignacionFin] = useState("");

  // Estados para manejar edición de estado con botones Guardar/Cancelar
  const [pacienteEditandoEstado, setPacienteEditandoEstado] = useState(null);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState("");
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  // Estados para manejar fecha/hora y especialista por paciente
  const [citasAgendadas, setCitasAgendadas] = useState({}); // { pacienteId: { fecha, hora, especialista } }
  
  // Estado para almacenar médicos dinámicos por servicio
  const [medicosPorServicio, setMedicosPorServicio] = useState({}); // { idServicio: [médicos] }
  const [cargandoMedicos, setCargandoMedicos] = useState(false);

  // ============================================================================
  // 🔧 ESTADO PARA IMPORTACIÓN DE PACIENTES ADICIONALES (v1.46.0)
  // ============================================================================
  const [modalImportar, setModalImportar] = useState(false);
  const [busquedaAsegurado, setBusquedaAsegurado] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [agregandoPaciente, setAgregandoPaciente] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(""); // v1.46.7: Médico en modal
  const [fechaHoraCitaSeleccionada, setFechaHoraCitaSeleccionada] = useState(""); // v1.46.7: Fecha/Hora en modal
  const [medicosDisponibles, setMedicosDisponibles] = useState([]); // v1.46.7: Médicos por especialidad

  // 🔧 API_BASE dinámico basado en el host actual o variable de entorno
  const getApiBase = () => {
    // Prioridad: variable de entorno > window.location
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // Fallback: construir desde window.location (recomendado para producción)
    const protocol = window.location.protocol; // http: o https:
    const hostname = window.location.hostname; // IP o dominio
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}/api`;
  };
  
  const API_BASE = getApiBase();

  // ============================================================================
  // 🔐 FUNCIÓN AUXILIAR: OBTENER HEADERS CON TOKEN
  // ============================================================================
  const getHeaders = () => {
    const token = getToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ============================================================================
  // 🎨 FUNCIÓN: OBTENER COLORES POR TIPO DE BOLSA
  // ============================================================================
  const getBolsaColor = (descTipoBolsa) => {
    if (!descTipoBolsa) return "bg-gray-100 text-gray-800";
    
    const desc = descTipoBolsa.toLowerCase();
    
    // Mapeo de palabras clave a colores Tailwind
    if (desc.includes("107") || desc.includes("importación")) 
      return "bg-blue-100 text-blue-800";
    if (desc.includes("dengue")) 
      return "bg-red-100 text-red-800";
    if (desc.includes("recita") || desc.includes("interconsulta")) 
      return "bg-purple-100 text-purple-800";
    if (desc.includes("reprogramación") || desc.includes("reprogram")) 
      return "bg-amber-100 text-amber-800";
    if (desc.includes("gestores territorial") || desc.includes("territorial")) 
      return "bg-emerald-100 text-emerald-800";
    if (desc.includes("gineco") || desc.includes("oncología")) 
      return "bg-pink-100 text-pink-800";
    if (desc.includes("enfermería")) 
      return "bg-cyan-100 text-cyan-800";
    if (desc.includes("explotación") || desc.includes("datos")) 
      return "bg-indigo-100 text-indigo-800";
    if (desc.includes("ivr") || desc.includes("respuesta de voz")) 
      return "bg-teal-100 text-teal-800";
    if (desc.includes("padomi") || desc.includes("derivado")) 
      return "bg-rose-100 text-rose-800";
    if (desc.includes("gestora")) 
      return "bg-lime-100 text-lime-800";
    
    // Default para otras bolsas
    return "bg-slate-100 text-slate-800";
  };

  // Función para obtener clase condicional de fila según estado del paciente (Phase 3 v1.50.0)
  const getRowAlertClass = (paciente) => {
    const estado = paciente.descEstadoCita?.toLowerCase() || '';
    const codigoEstado = paciente.codigoEstado || '';

    // Sin servicio asignado = Rojo tenue + borde naranja
    if (estado.includes('sin servicio') || estado.includes('requiere médico')) {
      return 'bg-red-50/30 border-l-4 border-orange-500 hover:bg-red-50/50';
    }

    // Requiere fecha = Amarillo tenue
    if (estado.includes('requiere fecha') || codigoEstado === 'PENDIENTE_CITA') {
      return 'bg-amber-50/30 border-l-4 border-amber-400 hover:bg-amber-50/50';
    }

    // Citado = Verde tenue
    if (codigoEstado === 'CITADO') {
      return 'bg-emerald-50/20 hover:bg-emerald-50/40';
    }

    // Atendido = Verde claro
    if (codigoEstado === 'ATENDIDO_IPRESS') {
      return 'bg-green-50/20 hover:bg-green-50/40';
    }

    // Default
    return 'hover:bg-gray-50';
  };

  // Función para obtener colores de badge de estado (Phase 3 v1.50.0)
  const getEstadoBadgeColor = (estado) => {
    if (!estado) return 'bg-gray-100 text-gray-800';

    const lower = estado.toLowerCase();
    if (lower.includes('atendido')) return 'bg-green-100 text-green-800';
    if (lower.includes('citado')) return 'bg-blue-100 text-blue-800';
    if (lower.includes('pendiente')) return 'bg-amber-100 text-amber-800';
    if (lower.includes('sin servicio')) return 'bg-red-100 text-red-800';

    return 'bg-gray-100 text-gray-800';
  };

  // ============================================================================
  // UTILIDAD: DEBOUNCE PARA BÚSQUEDA OPTIMIZADA
  // ============================================================================
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // ============================================================================
  // 🏥 CARGAR MÉDICOS POR SERVICIO (DINÁMICO) - SOPORTA TELEECG
  // ============================================================================
  const obtenerMedicosPorServicio = async (idServicio, descTipoBolsa = "") => {
    // Detectar si es TeleECG
    const esTeleECG = descTipoBolsa && descTipoBolsa.toUpperCase().includes("TELEECG");

    // Determinar la clave de caché
    const cacheKey = esTeleECG ? "TELEECG" : idServicio;

    // Si ya tenemos los médicos cacheados, no hacer segunda llamada
    if (medicosPorServicio[cacheKey]) {
      return;
    }

    // No hacer llamada si idServicio no es válido y no es TeleECG
    if (!esTeleECG && (!idServicio || isNaN(idServicio))) {
      return;
    }

    setCargandoMedicos(true);
    try {
      const token = getToken();

      // Determinar el endpoint según el tipo de bolsa
      let endpoint;
      if (esTeleECG) {
        endpoint = `${API_BASE}/atenciones-clinicas/detalle-medico/para-teleecg`;
        console.log("📞 Obteniendo médicos para TeleECG (todos disponibles)...");
      } else {
        endpoint = `${API_BASE}/atenciones-clinicas/detalle-medico/por-servicio/${idServicio}`;
        console.log(`📞 Obteniendo médicos para servicio ${idServicio}...`);
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const medicos = data.data || [];
        console.log(`✅ Se obtuvieron ${medicos.length} médicos para ${esTeleECG ? "TeleECG" : "servicio " + idServicio}`);

        setMedicosPorServicio(prev => ({
          ...prev,
          [cacheKey]: medicos
        }));
      } else {
        setMedicosPorServicio(prev => ({
          ...prev,
          [cacheKey]: []
        }));
      }
    } catch (error) {
      console.error("❌ Error al obtener médicos:", error);
      const cacheKey = esTeleECG ? "TELEECG" : idServicio;
      setMedicosPorServicio(prev => ({
        ...prev,
        [cacheKey]: []
      }));
    } finally {
      setCargandoMedicos(false);
    }
  };

  // Fetch assigned patients from backend
  const fetchPacientesAsignados = async () => {
    try {
      const token = getToken();
      console.log("📥 Fetching assigned patients from /api/bolsas/solicitudes/mi-bandeja");
      console.log("🔐 Token disponible:", token ? "✅ Sí" : "❌ No");
      console.log("🔐 Token value:", token ? `${token.substring(0, 20)}...` : "null");

      if (!token) {
        console.error("❌ No hay token disponible en localStorage");
        setError("No hay sesión activa. Por favor, inicia sesión nuevamente.");
        return;
      }

      // 📅 Construir URL con parámetros de fecha si están presentes (v1.43.3)
      let url = `${API_BASE}/bolsas/solicitudes/mi-bandeja`;
      const params = new URLSearchParams();

      console.log("📅 DEBUG Filtros de fecha crudos:");
      console.log("   - filtroFechaIngresoInicio:", filtroFechaIngresoInicio, "tipo:", typeof filtroFechaIngresoInicio);
      console.log("   - filtroFechaIngresoFin:", filtroFechaIngresoFin, "tipo:", typeof filtroFechaIngresoFin);
      console.log("   - filtroFechaAsignacionInicio:", filtroFechaAsignacionInicio, "tipo:", typeof filtroFechaAsignacionInicio);
      console.log("   - filtroFechaAsignacionFin:", filtroFechaAsignacionFin, "tipo:", typeof filtroFechaAsignacionFin);

      if (filtroFechaIngresoInicio) params.append('fechaIngresoInicio', filtroFechaIngresoInicio);
      if (filtroFechaIngresoFin) params.append('fechaIngresoFin', filtroFechaIngresoFin);
      if (filtroFechaAsignacionInicio) params.append('fechaAsignacionInicio', filtroFechaAsignacionInicio);
      if (filtroFechaAsignacionFin) params.append('fechaAsignacionFin', filtroFechaAsignacionFin);

      if (params.toString()) {
        url += `?${params.toString()}`;
        console.log("📋 URL FINAL con filtros de fecha:", url);
      }

      const response = await fetch(
        url,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
      console.log("📋 Response Headers:", {
        "content-type": response.headers.get("content-type"),
        "content-length": response.headers.get("content-length"),
      });

      if (!response.ok) {
        console.warn(`❌ Error fetching mi-bandeja: Status ${response.status}`);
        const responseText = await response.text();
        console.error("Response text:", responseText);
        try {
          const errorData = JSON.parse(responseText);
          console.error("Error details (JSON):", errorData);
        } catch (e) {
          console.error("Could not parse error as JSON");
        }
        setPacientesAsignados([]);
        setError(`Error al obtener pacientes: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log("📦 Response structure:", data);
      console.log("📦 Response keys:", Object.keys(data));

      // The endpoint returns { total, solicitudes, mensaje }
      const solicitudes = data?.solicitudes || data?.data?.content || data?.content || [];

      console.log(`✅ Found ${solicitudes.length} assigned patient(s)`);
      if (solicitudes.length > 0) {
        console.log("📋 Sample solicitud:", solicitudes[0]);
        console.log("📋 Campos disponibles en solicitud[0]:", Object.keys(solicitudes[0]));
        console.log("📋 paciente_edad:", solicitudes[0].paciente_edad);
        console.log("📋 pacienteEdad:", solicitudes[0].pacienteEdad);
        console.log("📦 id_bolsa:", solicitudes[0].id_bolsa);
        console.log("📦 desc_tipo_bolsa:", solicitudes[0].desc_tipo_bolsa);
      }

      // Transform SolicitudBolsaDTO to table structure
      const pacientes = solicitudes.map((solicitud, idx) => {
        // Mapear código de estado a descripción
        let codigoEstado = solicitud.cod_estado_cita || solicitud.codEstadoCita || "PENDIENTE_CITA";

        // ✅ v1.109.0: Para RECITA e INTERCONSULTA, asegurar que el estado es PENDIENTE_CITA
        const tipoCita = solicitud.tipo_cita || solicitud.tipoCita || "-";
        if ((tipoCita === "RECITA" || tipoCita === "INTERCONSULTA") && codigoEstado !== "PENDIENTE_CITA") {
          codigoEstado = "PENDIENTE_CITA"; // Forzar estado correcto para bolsas generadas por médicos
        }

        const estadoObj = estadosDisponibles.find(e => e.codigo === codigoEstado);
        const descEstadoFinal = estadoObj ? estadoObj.descripcion : codigoEstado;

        const edadAsignada = solicitud.paciente_edad || solicitud.pacienteEdad || "-";

        return {
          id: solicitud.id_solicitud || solicitud.idSolicitud || idx,
          numeroSolicitud: solicitud.numero_solicitud || solicitud.numeroSolicitud || "-",
          pacienteDni: solicitud.paciente_dni || solicitud.pacienteDni || "-",
          pacienteNombre: solicitud.paciente_nombre || solicitud.pacienteNombre || "-",
          pacienteEdad: edadAsignada,
          pacienteSexo: solicitud.paciente_sexo || solicitud.pacienteSexo || "-",
          pacienteTelefono: solicitud.paciente_telefono || solicitud.pacienteTelefono || "-",
          pacienteTelefonoAlterno: solicitud.paciente_telefono_alterno || solicitud.pacienteTelefonoAlterno || "-",
          especialidad: solicitud.especialidad || "-",
          idServicio: solicitud.id_servicio || solicitud.idServicio || null, // ID numérico del servicio
          tipoCita: solicitud.tipo_cita || solicitud.tipoCita || "-",
          descIpress: solicitud.desc_ipress || solicitud.descIpress || "-",
          descEstadoCita: descEstadoFinal,
          codigoEstado: codigoEstado, // Guardar también el código para comparaciones
          fechaSolicitud: solicitud.fecha_solicitud || solicitud.fechaSolicitud || new Date().toISOString(),
          fechaAsignacion: solicitud.fecha_asignacion || solicitud.fechaAsignacion || "-",
          // Auditoría: Fecha y usuario del cambio de estado (v3.3.1)
          fechaCambioEstado: solicitud.fecha_cambio_estado || null,
          usuarioCambioEstado: solicitud.nombre_usuario_cambio_estado || null,
          // 📅 Detalles de cita agendada (NEW v3.4.0)
          fechaAtencion: solicitud.fecha_atencion || null,
          horaAtencion: solicitud.hora_atencion || null,
          idPersonal: solicitud.id_personal || null,
          // 🩺 Atención médica (NEW v3.5.0)
          condicionMedica: solicitud.condicion_medica || null,
          fechaAtencionMedica: solicitud.fecha_atencion_medica || null,
          // 🆕 Campos para filtro de bolsa y prioridad (v1.48.0)
          idTipoBolsa: solicitud.id_bolsa || solicitud.idBolsa || null,
          descTipoBolsa: solicitud.desc_tipo_bolsa || solicitud.descTipoBolsa || "Sin clasificar",
          tiempoInicioSintomas: solicitud.tiempo_inicio_sintomas || solicitud.tiempoInicioSintomas || null,
          consentimientoInformado: solicitud.consentimiento_informado || solicitud.consentimientoInformado || null,
          prioridad: solicitud.prioridad || null,
        };
      });

      // Ordenar por fecha de solicitud descendente (más nuevas primero)
      pacientes.sort((a, b) => {
        const fechaA = new Date(a.fechaSolicitud || 0).getTime();
        const fechaB = new Date(b.fechaSolicitud || 0).getTime();
        return fechaB - fechaA; // Descendente
      });

      setPacientesAsignados(pacientes);

      // 📅 Cargar datos guardados de citas en el estado citasAgendadas
      const citasGuardadas = {};
      pacientes.forEach(paciente => {
        if (paciente.fechaAtencion || paciente.horaAtencion || paciente.idPersonal) {
          // Combinar fecha y hora en formato datetime-local: YYYY-MM-DDTHH:mm
          let datetimeValue = "";
          if (paciente.fechaAtencion) {
            datetimeValue = paciente.fechaAtencion;
            if (paciente.horaAtencion) {
              datetimeValue += `T${paciente.horaAtencion}`;
            }
          }
          citasGuardadas[paciente.id] = {
            fecha: datetimeValue,
            especialista: paciente.idPersonal,
          };
        }
      });
      
      // Si hay citas guardadas, actualizar estado
      if (Object.keys(citasGuardadas).length > 0) {
        setCitasAgendadas(prev => ({
          ...prev,
          ...citasGuardadas
        }));
        console.log("📅 Citas guardadas cargadas:", citasGuardadas);
      }

      // Calculate metrics por estado
      const citados = pacientes.filter(p => p.codigoEstado === "CITADO").length;
      const atendidos = pacientes.filter(p => p.codigoEstado === "ATENDIDO_IPRESS").length;
      const pendientes = pacientes.filter(p => p.codigoEstado === "PENDIENTE_CITA").length;
      const otros = pacientes.filter(p => 
        !["CITADO", "ATENDIDO_IPRESS", "PENDIENTE_CITA"].includes(p.codigoEstado)
      ).length;

      console.log("📊 Métricas calculadas:", { total: pacientes.length, citados, atendidos, pendientes, otros });
      console.log("📊 Estados encontrados:", [...new Set(pacientes.map(p => p.codigoEstado))]);

      setMetrics({
        totalPacientes: pacientes.length,
        citado: citados,
        atendidoIpress: atendidos,
        pendienteCita: pendientes,
        otros: otros
      });
    } catch (err) {
      console.error("Error fetching assigned patients:", err);
      setPacientesAsignados([]);
    }
  };

  // Abrir modal para actualizar teléfono
  const abrirModalTelefono = (paciente) => {
    setModalTelefono({
      visible: true,
      paciente,
      telefonoPrincipal: paciente.pacienteTelefono || "",
      telefonoAlterno: paciente.pacienteTelefonoAlterno || "",
      saving: false,
    });
  };

  // Cerrar modal
  const cerrarModalTelefono = () => {
    setModalTelefono({
      visible: false,
      paciente: null,
      telefonoPrincipal: "",
      telefonoAlterno: "",
      saving: false,
    });
  };

  // Hook para cambiar estado con patrón Toast + Undo
  const { changeStatus } = useStatusChange(
    // Callback 1: Actualizar UI localmente (optimistic update)
    (pacienteId, newStatus) => {
      setPacientesAsignados(prev =>
        prev.map(p =>
          p.id === pacienteId
            ? { ...p, descEstadoCita: newStatus }
            : p
        )
      );
    },
    // Callback 2: API call al backend - NUEVO ENDPOINT CON FECHA, HORA Y MÉDICO
    async (pacienteId, newStatus) => {
      console.log("📤 CALLBACK 2 INICIADO - Enviando al backend");
      console.log("  pacienteId:", pacienteId);
      console.log("  newStatus:", newStatus);
      
      const token = getToken();
      console.log("🔑 Token obtenido:", token ? "SÍ" : "NO");
      
      // newStatus es la descripción, pero necesitamos el código
      // Encontrar el código a partir de la descripción
      const estadoObj = estadosDisponibles.find(e => e.descripcion === newStatus);
      const nuevoEstadoCodigo = estadoObj?.codigo || newStatus; // Si no encuentra, usar el valor
      
      console.log("🔍 Búsqueda de estado:");
      console.log("  estadoObj:", estadoObj);
      console.log("  nuevoEstadoCodigo:", nuevoEstadoCodigo);
      
      // Obtener datos de la cita agendada si existen
      const citaAgendada = citasAgendadas[pacienteId] || {};
      
      console.log("📅 Datos de cita agendada:", citaAgendada);
      console.log("  citaAgendada.fecha:", citaAgendada.fecha);
      console.log("  citaAgendada.especialista:", citaAgendada.especialista);
      
      // Extraer fecha y hora del datetime-local: "2026-02-08T14:30" → fecha: "2026-02-08", hora: "14:30"
      // ✅ v1.45.0: Fecha/hora SOLO requeridos si estado es "CITADO"
      // ✅ Especialista SIEMPRE puede ser enviado (independiente del estado)
      let fechaAtencion = null;
      let horaAtencion = null;
      let idPersonalEspecialista = null;

      // ✅ Especialista se puede asignar SIEMPRE (no solo para CITADO)
      idPersonalEspecialista = citaAgendada.especialista || null;

      if (nuevoEstadoCodigo === "CITADO") {
        // Estado CITADO: requiere fecha, hora y especialista
        if (citaAgendada.fecha) {
          const datetimeValue = citaAgendada.fecha;
          console.log("⏰ Extrayendo fecha y hora de:", datetimeValue);
          const [fecha, hora] = datetimeValue.split('T');
          fechaAtencion = fecha; // YYYY-MM-DD
          horaAtencion = hora;   // HH:mm
          console.log("  fechaAtencion:", fechaAtencion);
          console.log("  horaAtencion:", horaAtencion);
        }
        console.log("✅ Estado CITADO: Incluyendo fecha, hora y especialista");
      } else {
        // Estado NO CITADO: fecha/hora son null, pero especialista se mantiene
        console.log("⏭️ Estado NO es CITADO: Fecha/hora NULL, pero especialista se mantiene si fue seleccionado");
      }
      
      // Preparar body con estado + detalles de cita (null si no es CITADO)
      const bodyData = {
        nuevoEstadoCodigo: nuevoEstadoCodigo,
        fechaAtencion: fechaAtencion,
        horaAtencion: horaAtencion,
        idPersonal: idPersonalEspecialista,
      };

      console.log("📦 Body a enviar:", bodyData);
      console.log("📤 Enviando PATCH a: /bolsas/solicitudes/" + pacienteId + "/estado-y-cita");

      try {
        const response = await fetch(
          `${API_BASE}/bolsas/solicitudes/${pacienteId}/estado-y-cita`,
          {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
          }
        );

        console.log("📡 Response status:", response.status);
        console.log("📡 Response ok:", response.ok);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Error response from backend:", errorData);
          throw new Error(errorData.error || "Error al actualizar el estado");
        }

        const responseData = await response.json();
        console.log("✅ Backend response OK:", responseData);

        // Refrescar datos desde backend para asegurar sincronización
        console.log("🔄 Recargando datos desde backend...");
        await fetchPacientesAsignados();
        console.log("✅ Datos recargados exitosamente");
      } catch (error) {
        console.error("❌ Error en CALLBACK 2:", error);
        throw error;
      }
    }
  );

  // Handlers para cambio de estado con Guardar/Cancelar
  const handleGuardarEstado = async () => {
    console.log("🎬 handleGuardarEstado INICIADO");
    console.log("📊 pacienteEditandoEstado:", pacienteEditandoEstado);
    console.log("📊 nuevoEstadoSeleccionado:", nuevoEstadoSeleccionado);
    
    if (!pacienteEditandoEstado || !nuevoEstadoSeleccionado) {
      toast.error("Por favor selecciona un estado válido");
      console.error("❌ Validación fallida: pacienteEditandoEstado=", pacienteEditandoEstado, "nuevoEstadoSeleccionado=", nuevoEstadoSeleccionado);
      return;
    }

    // 📅 VALIDACIÓN CONDICIONAL: Fecha y Médico SOLO requeridos si estado es "CITADO"
    const citaAgendada = citasAgendadas[pacienteEditandoEstado] || {};
    console.log("🔍 Cita agendada:", citaAgendada);
    console.log("🔍 Estado seleccionado:", nuevoEstadoSeleccionado);
    
    // ✅ Si el estado es "CITADO", requiere fecha y médico
    if (nuevoEstadoSeleccionado === "CITADO") {
      if (!citaAgendada.fecha) {
        toast.error("⚠️ Para estado CITADO: Por favor selecciona la fecha y hora de la cita");
        console.error("❌ Validación fallida: estado CITADO pero fecha vacía");
        return;
      }
      
      if (!citaAgendada.especialista) {
        toast.error("⚠️ Para estado CITADO: Por favor selecciona un médico/especialista");
        console.error("❌ Validación fallida: estado CITADO pero especialista no seleccionado");
        return;
      }
      
      console.log("✅ Estado CITADO: Validación de fecha y médico PASADA");
    } else {
      // ✅ Para otros estados (NO_CONTESTA, NO_DESEA, APAGADO, etc.), fecha y médico son OPCIONALES
      console.log("✅ Estado " + nuevoEstadoSeleccionado + ": Validación de fecha y médico OMITIDA (no requerida)");
    }

    const paciente = pacientesAsignados.find(p => p.id === pacienteEditandoEstado);
    if (!paciente) {
      console.error("❌ Paciente no encontrado:", pacienteEditandoEstado);
      return;
    }

    console.log("📝 Paciente a guardar:", paciente);
    console.log("📝 Especialista:", citaAgendada.especialista);
    console.log("📝 Fecha/Hora:", citaAgendada.fecha);
    console.log("📝 Estado:", nuevoEstadoSeleccionado);

    setGuardandoEstado(true);

    try {
      console.log("✅ Todas las validaciones pasaron");
      
      // Llama al hook que maneja la lógica de cambio de estado
      const estadoObj = estadosDisponibles.find(e => e.codigo === nuevoEstadoSeleccionado);
      console.log("📊 Objeto estado encontrado:", estadoObj);
      console.log("🚀 Llamando a changeStatus con:", {
        pacienteId: pacienteEditandoEstado,
        newStatus: estadoObj?.descripcion,
        previousStatus: paciente.descEstadoCita,
        pacienteNombre: paciente.pacienteNombre
      });
      
      changeStatus(
        pacienteEditandoEstado,
        estadoObj ? estadoObj.descripcion : nuevoEstadoSeleccionado,
        paciente.descEstadoCita || "Sin estado",
        paciente.pacienteNombre
      );

      console.log("✅ changeStatus fue llamado");

      // Limpiar estado de edición
      setPacienteEditandoEstado(null);
      setNuevoEstadoSeleccionado("");
      console.log("✅ Estado de edición limpiado");

      // ✅ Toast minimalista de éxito
      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 bg-white border-l-4 border-green-500 rounded-lg px-4 py-3 shadow-lg transition-all ${
            t.visible ? 'animate-in' : 'animate-out'
          }`}
        >
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              Cita programada con éxito
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {paciente.pacienteNombre}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
      ), {
        position: 'top-right',
        duration: 4000,
      });
    } catch (error) {
      console.error("❌ Error en handleGuardarEstado:", error);
      toast.error("Error al guardar el estado");
    } finally {
      setGuardandoEstado(false);
    }
  };

  const handleCancelarEstado = () => {
    setPacienteEditandoEstado(null);
    setNuevoEstadoSeleccionado("");
  };

  // ========================================================================
  // 📱 FUNCIONES PARA ENVÍO DE MENSAJE DE CITA (v1.50.1)
  // ========================================================================

  const abrirModalMensajeCita = async (paciente) => {
    if (!paciente.fechaAtencion || !paciente.horaAtencion) {
      toast.error("❌ El paciente debe tener fecha y hora de cita agendada");
      return;
    }

    // Obtener nombre del médico - buscar en múltiples lugares
    let pacienteConMedico = { ...paciente };

    console.log("🔍 DEBUG - Buscando médico para paciente:", paciente.id);
    console.log("   - idPersonal:", paciente.idPersonal);
    console.log("   - citasAgendadas[id]:", citasAgendadas[paciente.id]);
    console.log("   - idServicio:", paciente.idServicio);

    // ✅ v1.50.2: Cargar médicos si falta idServicio o es TeleECG
    const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
    const cacheKey = esTeleECG ? "TELEECG" : paciente.idServicio;

    if ((paciente.idServicio || esTeleECG) && !medicosPorServicio[cacheKey]) {
      console.log("📥 Cargando médicos para:", esTeleECG ? "TeleECG" : "servicio " + paciente.idServicio);
      await obtenerMedicosPorServicio(paciente.idServicio, paciente.descTipoBolsa);
    }

    // Opción 1: Buscar en citasAgendadas (si el usuario acababa de seleccionar)
    const citaAgendada = citasAgendadas[paciente.id];
    if (citaAgendada && citaAgendada.especialista && paciente.idServicio) {
      const medicos = medicosPorServicio[paciente.idServicio] || [];
      console.log(`   - Médicos en servicio ${paciente.idServicio}:`, medicos);
      const medicoEncontrado = medicos.find(m => m.idPers === citaAgendada.especialista);

      if (medicoEncontrado) {
        // ✅ v1.50.3: Usar 'nombre' field directamente del DetalleMedicoDTO
        const nombre = medicoEncontrado.nombre || "Por asignar";
        pacienteConMedico.nombreMedico = nombre;
        console.log("   ✅ Médico encontrado en citasAgendadas:", nombre);
      }
    }

    // Opción 2: Si paciente ya tiene idPersonal (médico guardado previamente)
    if (!pacienteConMedico.nombreMedico && paciente.idPersonal) {
      if (paciente.idServicio) {
        const medicos = medicosPorServicio[paciente.idServicio] || [];
        const medicoEncontrado = medicos.find(m => m.idPers === paciente.idPersonal);
        if (medicoEncontrado) {
          // ✅ v1.50.3: Usar 'nombre' field directamente del DetalleMedicoDTO
          const nombre = medicoEncontrado.nombre || "Por asignar";
          pacienteConMedico.nombreMedico = nombre;
          console.log("   ✅ Médico encontrado en idPersonal:", nombre);
        }
      }
    }

    if (!pacienteConMedico.nombreMedico) {
      console.log("   ⚠️ Médico no encontrado, usando 'Por asignar'");
    }

    setModalMensajeCita({
      visible: true,
      paciente: pacienteConMedico,
      preview: null,
      enviando: false,
      step: "preview",
    });

    // Cargar vista previa
    await previsualizarMensajeCita(pacienteConMedico);
  };

  // Generar mensaje de cita formateado (v1.50.2 - Sin API)
  const generarMensajeCita = (paciente) => {
    // Formato de fecha: DD/MM/YY
    // Nota: Ajustar por timezone UTC (la BD devuelve en UTC, nosotros estamos en UTC-5)
    let fechaObj = new Date(paciente.fechaAtencion);

    // Si la fecha viene en formato ISO (YYYY-MM-DD), ajustar timezone
    if (typeof paciente.fechaAtencion === "string" && paciente.fechaAtencion.includes("-")) {
      // Sumar 1 día para compensar offset de timezone (UTC → UTC-5)
      fechaObj.setDate(fechaObj.getDate() + 1);
    }

    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const año = String(fechaObj.getFullYear()).slice(-2);
    const fechaFormato = `${dia}/${mes}/${año}`;

    // Calcular hora fin (suma 55 minutos)
    const horaFin = paciente.horaFin
      ? paciente.horaFin.substring(0, 5)
      : (() => {
          const [horas, minutos] = paciente.horaAtencion.substring(0, 5).split(":");
          const horaFinal = new Date(0, 0, 0, parseInt(horas), parseInt(minutos) + 55);
          return `${String(horaFinal.getHours()).padStart(2, "0")}:${String(
            horaFinal.getMinutes()
          ).padStart(2, "0")}`;
        })();

    // Obtener nombre del médico (puede estar en diferentes campos)
    const nombreMedico =
      paciente.nombreMedico ||
      paciente.nomMedico ||
      (paciente.medicoNombre ? `Dr. ${paciente.medicoNombre}` : "Por asignar");

    return `Estimado asegurado(a): ${paciente.pacienteNombre}
Recuerde estar pendiente 30 minutos antes de su cita virtual:

👩🏻 MEDICO/LICENCIADO: ${nombreMedico}
⚕️ ESPECIALIDAD: ${paciente.especialidad || "No especificada"}
🗓️ DIA: ${fechaFormato}
⏰ HORA REFERENCIAL: ${paciente.horaAtencion.substring(0, 5)} a ${horaFin}

IMPORTANTE: Usted va a ser atendido por el Centro Nacional de Telemedicina (CENATE) - ESSALUD, por su seguridad las atenciones están siendo grabadas.
*Usted autoriza el tratamiento de sus datos personales afines a su atención por Telemedicina.
*Recuerde que se le llamará hasta 24 horas antes para confirmar su cita.
*Recuerde estar pendiente media hora antes de su cita.

El profesional se comunicará con usted a través del siguiente número: 01 2118830

Atte. Centro Nacional de Telemedicina
CENATE de Essalud`;
  };

  const previsualizarMensajeCita = (paciente) => {
    const mensaje = generarMensajeCita(paciente);
    setModalMensajeCita((prev) => ({
      ...prev,
      preview: mensaje,
    }));
  };

  const enviarMensajeCita = () => {
    const paciente = modalMensajeCita.paciente;

    if (!paciente || !paciente.pacienteTelefono) {
      toast.error("❌ Paciente o teléfono no válido");
      return;
    }

    setModalMensajeCita((prev) => ({
      ...prev,
      enviando: true,
    }));

    try {
      // Generar mensaje
      const mensaje = generarMensajeCita(paciente);

      // Normalizar teléfono (agregar código de país 51 si no lo tiene)
      let telefono = paciente.pacienteTelefono.replace(/\D/g, "");
      if (!telefono.startsWith("51")) {
        telefono = "51" + (telefono.length === 10 ? telefono.substring(1) : telefono);
      }

      // Construir URL de WhatsApp Web
      const mensajeEncodificado = encodeURIComponent(mensaje);
      const urlWhatsApp = `https://wa.me/${telefono}?text=${mensajeEncodificado}`;

      // Abrir WhatsApp en nueva ventana
      window.open(urlWhatsApp, "_blank");

      // Mostrar toast de éxito
      setModalMensajeCita((prev) => ({
        ...prev,
        enviando: false,
      }));

      toast.custom((t) => (
        <div
          className={`flex items-center gap-3 bg-white border-l-4 border-green-500 rounded-lg px-4 py-3 shadow-lg transition-all ${
            t.visible ? "animate-in" : "animate-out"
          }`}
        >
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              ✓ WhatsApp abierto con mensaje
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {paciente.pacienteTelefono}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
      ), {
        position: "top-right",
        duration: 4000,
      });

      // Cerrar modal después de 1 segundo
      setTimeout(() => {
        setModalMensajeCita({
          visible: false,
          paciente: null,
          preview: null,
          enviando: false,
          step: "preview",
        });
      }, 1000);
    } catch (error) {
      console.error("Error abriendo WhatsApp:", error);
      toast.error("❌ Error al abrir WhatsApp");
      setModalMensajeCita((prev) => ({
        ...prev,
        enviando: false,
      }));
    }
  };

  // Guardar teléfono actualizado
  const guardarTelefono = async () => {
    const tel1 = modalTelefono.telefonoPrincipal?.trim();
    const tel2 = modalTelefono.telefonoAlterno?.trim();

    // Validación 1: Al menos uno requerido
    if (!tel1 && !tel2) {
      toast.error("Al menos uno de los teléfonos es requerido");
      return;
    }

    // Validación 2: Formato (9 dígitos Perú)
    const phoneRegex = /^\d{9}$/;
    if (tel1 && !phoneRegex.test(tel1)) {
      toast.error("Teléfono principal: debe ser 9 dígitos");
      return;
    }
    if (tel2 && !phoneRegex.test(tel2)) {
      toast.error("Teléfono alterno: debe ser 9 dígitos");
      return;
    }

    setModalTelefono({ ...modalTelefono, saving: true });

    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/bolsas/solicitudes/${modalTelefono.paciente.id}/actualizar-telefonos`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pacienteTelefono: modalTelefono.telefonoPrincipal,
            pacienteTelefonoAlterno: modalTelefono.telefonoAlterno,
          }),
        }
      );

      if (response.ok) {
        toast.success("Teléfono actualizado correctamente");
        cerrarModalTelefono();
        await fetchPacientesAsignados();
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        toast.error(errorData.error || errorData.message || "Error al actualizar el teléfono");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al actualizar el teléfono");
    } finally {
      setModalTelefono({ ...modalTelefono, saving: false });
    }
  };

  // ============================================================================
  // ✅ FUNCIONES DE SELECCIÓN Y DESCARGA
  // ============================================================================

  // Toggle selección individual
  const toggleRowSelection = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Toggle seleccionar todos los visibles (filtrados)
  const toggleAllRows = () => {
    if (selectedRows.size === pacientesFiltrados.length && pacientesFiltrados.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(pacientesFiltrados.map(p => p.id)));
    }
  };

  // Descargar selección de pacientes
  const descargarSeleccion = async () => {
    if (selectedRows.size === 0) {
      toast.error("Selecciona al menos un paciente para descargar");
      return;
    }

    try {
      const idsSeleccionados = Array.from(selectedRows);
      console.log("📊 Pacientes seleccionados para descargar:", idsSeleccionados);

      const token = getToken();
      const queryParams = new URLSearchParams({
        ids: idsSeleccionados.join(","),
      });

      const response = await fetch(
        `${API_BASE}/bolsas/solicitudes/exportar-asignados?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/octet-stream",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const excelBlob = await response.blob();

      // Descargar archivo
      const element = document.createElement("a");
      const url = URL.createObjectURL(excelBlob);
      element.setAttribute("href", url);
      element.setAttribute(
        "download",
        `pacientes_asignados_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);

      toast.success(`Descargados ${selectedRows.size} paciente(s)`);
      setSelectedRows(new Set());
    } catch (error) {
      console.error("Error descargando Excel:", error);
      toast.error("Error al descargar el archivo. Intenta nuevamente.");
    }
  };

  // ============================================================================
  // 🔍 BUSCAR ASEGURADOS CON DEBOUNCE (v1.46.0)
  // ============================================================================
  const buscarAseguradosImpl = async (termino) => {
    if (!termino || termino.length !== 8) {
      setResultadosBusqueda([]);
      return;
    }

    setCargandoBusqueda(true);
    try {
      const response = await fetch(
        `${API_BASE}/asegurados/buscar?q=${encodeURIComponent(termino)}&size=10`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const asegurados = data?.content || [];
        console.log(`🔍 Búsqueda encontró ${asegurados.length} resultados`);
        setResultadosBusqueda(asegurados);
      } else {
        console.error("Error en búsqueda:", response.status);
        setResultadosBusqueda([]);
      }
    } catch (error) {
      console.error("Error buscando asegurados:", error);
      toast.error("Error al buscar asegurados");
      setResultadosBusqueda([]);
    } finally {
      setCargandoBusqueda(false);
    }
  };

  // Crear versión con debounce
  const buscarAsegurados = React.useMemo(
    () => debounce(buscarAseguradosImpl, 500),
    []
  );

  // Trigger búsqueda cuando cambia el término
  React.useEffect(() => {
    buscarAsegurados(busquedaAsegurado);
  }, [busquedaAsegurado, buscarAsegurados]);

  // ============================================================================
  // 🏥 CARGAR MÉDICOS POR ESPECIALIDAD (v1.46.8)
  // ============================================================================
  const cargarMedicosPorEspecialidad = async (especialidad) => {
    if (!especialidad) {
      setMedicosDisponibles([]);
      setMedicoSeleccionado("");
      return;
    }

    try {
      const response = await fetch(
        `${getApiBase()}/bolsas/solicitudes/fetch-doctors-by-specialty?especialidad=${encodeURIComponent(especialidad)}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setMedicosDisponibles(result.data || []);
        console.log(`✅ Cargados ${result.data?.length || 0} médicos para ${especialidad}`);
      } else {
        console.error("Error al cargar médicos:", response.statusText);
        setMedicosDisponibles([]);
      }
    } catch (error) {
      console.error("Error al cargar médicos:", error);
      setMedicosDisponibles([]);
    }
  };

  // 🏥 v1.46.8: Cargar médicos cuando cambia especialidad
  React.useEffect(() => {
    if (especialidadSeleccionada) {
      cargarMedicosPorEspecialidad(especialidadSeleccionada);
    } else {
      setMedicosDisponibles([]);
      setMedicoSeleccionado("");
    }
  }, [especialidadSeleccionada]);

  // ============================================================================
  // ➕ IMPORTAR PACIENTE ADICIONAL (v1.46.0) - FIXED v1.46.1
  // ============================================================================
  const importarPacienteAdicional = async (asegurado) => {
    // ✅ v1.46.5: Validar especialidad seleccionada
    if (!especialidadSeleccionada || especialidadSeleccionada.trim() === "") {
      toast.error("⚠️ Debes seleccionar una especialidad antes de importar");
      return;
    }

    setAgregandoPaciente(true);
    try {
      const dni = asegurado.docPaciente;

      // ✅ v1.46.4: IMPORTAR SOLO A dim_solicitud_bolsa (bandeja del gestor de citas)
      // No crear en gestion_paciente - solo agregar a la bandeja del gestor
      // El gestor puede entonces asignar especialidad y médico
      const createBolsaRes = await fetch(
        `${API_BASE}/bolsas/solicitudes/crear-adicional`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            pacienteDni: asegurado.docPaciente,
            pacienteNombre: asegurado.paciente,
            pacienteEdad: asegurado.edad,
            pacienteSexo: asegurado.sexo,
            pacienteTelefono: asegurado.telCelular || asegurado.telFijo,
            pacienteTelefonoAlterno: asegurado.telFijo || asegurado.telCelular,
            descIpress: asegurado.casAdscripcion || asegurado.nombreIpress, // Usar código, fallback a nombre
            tipoCita: "TELECONSULTA",
            origen: "Importación Manual",
            codEstadoCita: "01",
            usuarioCreacion: user?.id,
            especialidad: especialidadSeleccionada, // ✅ v1.46.5: Agregar especialidad
            // ✅ v1.46.9: Agregar médico y fecha de cita si se seleccionaron
            idPersonal: medicoSeleccionado ? parseInt(medicoSeleccionado) : null,
            fechaAtencion: fechaHoraCitaSeleccionada ? fechaHoraCitaSeleccionada.split('T')[0] : null,
            horaAtencion: fechaHoraCitaSeleccionada ? fechaHoraCitaSeleccionada.split('T')[1] + ':00' : null,
          }),
        }
      );

      if (!createBolsaRes.ok) {
        const errorData = await createBolsaRes.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al crear en dim_solicitud_bolsa (${createBolsaRes.status})`);
      }

      toast.success(`Paciente ${asegurado.paciente} importado a ${especialidadSeleccionada}`);

      // 4. Cerrar modal y recargar tabla
      setModalImportar(false);
      setBusquedaAsegurado("");
      setResultadosBusqueda([]);
      setEspecialidadSeleccionada(""); // ✅ v1.46.5: Resetear especialidad
      setMedicoSeleccionado(""); // ✅ v1.46.7: Resetear médico
      setFechaHoraCitaSeleccionada(""); // ✅ v1.46.7: Resetear fecha/hora
      await fetchPacientesAsignados();
    } catch (error) {
      console.error("Error importando paciente:", error);
      const mensaje = error.message || "Error al importar paciente";
      toast.error(mensaje);
    } finally {
      setAgregandoPaciente(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        // Cargar bolsas desde el API
        try {
          const resBolsas = await fetch(`${getApiBase()}/bolsas/tipos-bolsas/activos`, {
            headers: getHeaders(),
          });
          if (resBolsas.ok) {
            const bolsas = await resBolsas.json();
            console.log("📦 Bolsas cargadas desde API:", bolsas);
            setTiposBolsasAPI(bolsas || []);
          }
        } catch (e) {
          console.error("❌ Error cargando bolsas:", e);
        }
        // Cargar estados de gestión de citas desde el API
        try {
          const resEstados = await fetch(`${getApiBase()}/admin/estados-gestion-citas/todos`, {
            headers: getHeaders(),
          });
          if (resEstados.ok) {
            const estados = await resEstados.json();
            const estadosMapeados = estados
              .map((e) => ({ codigo: e.codEstadoCita, descripcion: e.descEstadoCita }))
              .sort((a, b) => a.descripcion.localeCompare(b.descripcion, "es"));
            console.log("📋 Estados cargados desde API:", estadosMapeados.length);
            setEstadosDisponibles(estadosMapeados);
          }
        } catch (e) {
          console.error("❌ Error cargando estados:", e);
        }
        await fetchPacientesAsignados();
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervalo = setInterval(async () => {
      console.log("🔄 Auto-refresh pacientes...");
      try {
        await fetchPacientesAsignados();
        setLastRefreshTime(new Date());
      } catch (err) {
        console.error("Error en auto-refresh:", err);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshEnabled]);

  // 📅 Recargar pacientes cuando cambian los filtros de fecha (v1.43.3)
  useEffect(() => {
    console.log("📅 Filtros de fecha cambiados, recargando pacientes...");
    fetchPacientesAsignados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroFechaIngresoInicio, filtroFechaIngresoFin, filtroFechaAsignacionInicio, filtroFechaAsignacionFin]);

  // Debounce search - actualizar debouncedSearch después de 300ms sin escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar IPRESS disponibles desde API (Phase 2 v1.50.0)
  useEffect(() => {
    const cargarIpress = async () => {
      setCargandoIpress(true);
      try {
        const ipressService = (await import("../../../services/ipressService")).default;
        const data = await ipressService.obtenerActivas();
        if (data && Array.isArray(data) && data.length > 0) {
          const ipressFormatted = data.map(i => ({
            id: i.idIpress,
            codigo: i.codIpress,
            nombre: i.descIpress
          }));
          setIpressDisponibles(ipressFormatted);
          console.log("✅ IPRESS cargadas desde API:", ipressFormatted);
        }
      } catch (error) {
        console.error("Error cargando IPRESS:", error);
        // Fallback: usar IPRESS de los pacientes cargados
        if (pacientesAsignados.length > 0) {
          const ipressUnicas = [...new Set(
            pacientesAsignados
              .map(p => p.descIpress)
              .filter(i => i && i !== "-")
          )];
          setIpressDisponibles(
            ipressUnicas.map(nombre => ({
              id: nombre,
              codigo: nombre,
              nombre: nombre
            }))
          );
          console.log("✅ IPRESS cargadas desde pacientes (fallback):", ipressUnicas);
        }
      } finally {
        setCargandoIpress(false);
      }
    };

    cargarIpress();
  }, [pacientesAsignados.length]);

  // Cargar automáticamente médicos de pacientes que ya tienen idPersonal
  useEffect(() => {
    if (pacientesAsignados.length === 0) return;

    const serviciosConMedicos = new Set();
    let tieneTeleECG = false;

    // Recolectar todos los idServicio únicos y detectar TeleECG
    pacientesAsignados.forEach(paciente => {
      // Detectar TeleECG
      const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
      if (esTeleECG) {
        tieneTeleECG = true;
      }

      // Recolectar servicios normales que tienen idPersonal
      if (paciente.idPersonal && paciente.idServicio && !serviciosConMedicos.has(paciente.idServicio) && !esTeleECG) {
        serviciosConMedicos.add(paciente.idServicio);
        console.log(`👨‍⚕️ Paciente ${paciente.pacienteNombre} tiene idPersonal ${paciente.idPersonal}, cargando médicos del servicio ${paciente.idServicio}`);
      }
    });

    // Cargar médicos para TeleECG si existe
    if (tieneTeleECG && !medicosPorServicio["TELEECG"]) {
      console.log("📞 Cargando médicos para TeleECG...");
      obtenerMedicosPorServicio(null, "BOLSA_TELEECG");
    }

    // Cargar médicos para cada servicio normal
    serviciosConMedicos.forEach(idServicio => {
      if (!medicosPorServicio[idServicio]) {
        console.log(`🔄 Obteniendo médicos del servicio ${idServicio}...`);
        obtenerMedicosPorServicio(idServicio);
      }
    });
  }, [pacientesAsignados, medicosPorServicio]);

  // ============================================================================
  // 🆕 TIPOS DE BOLSAS Y COMPUTED VALUES (v1.48.0)
  // ============================================================================
  // Usar bolsas del API si están disponibles, sino calcular desde pacientes
  const tiposBolsas = tiposBolsasAPI.length > 0 
    ? tiposBolsasAPI.map(b => ({ idTipoBolsa: b.idTipoBolsa, descTipoBolsa: b.descTipoBolsa }))
    : [
        ...new Set(pacientesAsignados
          .map((p) => JSON.stringify({ idTipoBolsa: p.idTipoBolsa, descTipoBolsa: p.descTipoBolsa }))
          .filter((s) => s && s !== '{"idTipoBolsa":null,"descTipoBolsa":"Sin clasificar"}'))
      ].map(s => JSON.parse(s)).sort((a, b) => (a.descTipoBolsa || "").localeCompare(b.descTipoBolsa || ""));

  const esBolsa107 = filtroTipoBolsa !== "todas" && 
    tiposBolsas.find(tb => String(tb.idTipoBolsa) === String(filtroTipoBolsa))?.descTipoBolsa?.toLowerCase().includes("107");
  
  // Bolsa ID 1 específicamente (para mostrar columna Prioridad)
  const esBolsaId1 = filtroTipoBolsa === "1";
  
  const esBolsaReprogramacion = filtroTipoBolsa !== "todas" && 
    tiposBolsas.find(tb => String(tb.idTipoBolsa) === String(filtroTipoBolsa))?.descTipoBolsa?.toLowerCase().includes("reprogram");

  // ============================================================================
  // FUNCIÓN DE FILTRADO ESPECIALIZADO
  // ============================================================================
  const pacientesFiltrados = pacientesAsignados.filter((paciente) => {
    // ✅ Búsqueda SOLO por DNI (v1.50.1)
    const searchMatch =
      debouncedSearch === "" ||
      paciente.pacienteDni?.toLowerCase().includes(debouncedSearch.toLowerCase());

    // 📦 Filtro Tipo de Bolsa (v1.48.0)
    const bolsaMatch =
      filtroTipoBolsa === "todas" ||
      String(paciente.idTipoBolsa) === String(filtroTipoBolsa);

    // 🚦 Filtro Prioridad 107 (v1.48.0) - Basado en tiempo_inicio_sintomas
    const prioridadMatch = (() => {
      if (filtroPrioridad107 === "todas") return true;
      const tiempo = paciente.tiempoInicioSintomas;
      // Si el filtro es "> 72", incluir también valores nulos o vacíos
      if (filtroPrioridad107 === "> 72") {
        return tiempo === "> 72" || !tiempo || tiempo === "";
      }
      return tiempo === filtroPrioridad107;
    })();

    // 🌎 Filtro Macrorregión
    const macrorregionMatch =
      filtroMacrorregion === "todas" ||
      paciente.macrorregion === filtroMacrorregion;

    // 🌐 Filtro Red
    const redMatch =
      filtroRed === "todas" ||
      paciente.red === filtroRed;

    // 🏥 Filtro IPRESS
    const ipressMatch =
      filtroIpress === "todas" ||
      paciente.descIpress === filtroIpress;

    // 🏨 Filtro Especialidad
    const especialidadMatch =
      filtroEspecialidad === "todas" ||
      (filtroEspecialidad === "S/E" && !paciente.especialidad) ||
      paciente.especialidad === filtroEspecialidad;

    // 📅 Filtro Tipo de Cita
    const tipoCitaMatch =
      filtroTipoCita === "todas" ||
      paciente.tipoCita === filtroTipoCita;

    // Estado
    const estadoMatch =
      filtroEstado === "todos" ||
      paciente.codigoEstado === filtroEstado;

    // Filtro Solo Pendientes (Phase 2 v1.50.0)
    const pendienteMatch =
      !soloPendientes ||
      (paciente.codigoEstado !== "CITADO" &&
       paciente.codigoEstado !== "ATENDIDO_IPRESS");

    return (
      searchMatch &&
      bolsaMatch &&
      prioridadMatch &&
      macrorregionMatch &&
      redMatch &&
      ipressMatch &&
      especialidadMatch &&
      tipoCitaMatch &&
      estadoMatch &&
      pendienteMatch
    );
  });

  // Contadores dinámicos para filtros (Phase 2 v1.50.0)
  const contadores = useMemo(() => {
    const pendientes = pacientesFiltrados.filter(p =>
      p.codigoEstado !== "CITADO" &&
      p.codigoEstado !== "ATENDIDO_IPRESS"
    ).length;

    const citados = pacientesFiltrados.filter(p =>
      p.codigoEstado === "CITADO"
    ).length;

    const atendidos = pacientesFiltrados.filter(p =>
      p.codigoEstado === "ATENDIDO_IPRESS"
    ).length;

    return { pendientes, citados, atendidos };
  }, [pacientesFiltrados]);

  // ============================================================================
  // CALCULAR OPCIONES DISPONIBLES PARA FILTROS
  // ============================================================================
  const macrorregionesUnicas = [
    ...new Set(pacientesAsignados
      .map((p) => p.macrorregion)
      .filter((m) => m))
  ].sort();

  const redesUnicas = [
    ...new Set(pacientesAsignados
      .map((p) => p.red)
      .filter((r) => r))
  ].sort();

  const ipressUnicas = [
    ...new Set(pacientesAsignados
      .map((p) => p.descIpress)
      .filter((i) => i))
  ].sort();

  // 🏥 Especialidades disponibles para importación (v1.46.5)
  const especialidadesDisponibles = [
    "NUTRICION",
    "CARDIOLOGIA",
    "MEDICINA GENERAL",
    "NEUROLOGIA",
    "PSIQUIATRIA",
    "PEDIATRIA",
    "DERMATOLOGIA",
    "OFTALMOLOGIA",
    "S/E"
  ];

  const especialidadesUnicas = [
    ...new Set(
      pacientesAsignados
        .map((p) => (p.especialidad && p.especialidad.trim() !== "" ? p.especialidad : null))
        .filter((e) => e !== null)
    )
  ].sort();

  const hayRegistrosSinEspecialidad = pacientesAsignados.some(
    (p) => !p.especialidad || p.especialidad.trim() === ""
  );

  const especialidadesConSE = [
    ...especialidadesUnicas,
    ...(hayRegistrosSinEspecialidad ? ["S/E"] : [])
  ];

  const tiposCitaUnicos = [
    ...new Set(pacientesAsignados
      .map((p) => p.tipoCita)
      .filter((t) => t))
  ].sort();

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando pacientes asignados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-600">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchPacientesAsignados();
            }}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.nombreCompleto?.charAt(0) || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Bienvenid(a), {user?.nombreCompleto?.split(" ")[0] || "Usuario"}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Gestor de Citas - Gestión de Pacientes Asignados
                </p>
                <div className="flex gap-3 mt-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    Rol: GESTOR DE CITAS
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    📅 {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de Atenciones */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900">Estadísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Total */}
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg shadow-md p-3 text-white transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-100 text-xs font-semibold">Total</span>
                <Users className="w-6 h-6 text-slate-200" strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold">{metrics.totalPacientes}</div>
            </div>

            {/* Citado - Por Atender */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-3 text-white transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-blue-100 text-xs font-semibold">Por Atender</span>
                <ClipboardList className="w-6 h-6 text-blue-200" strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold">{metrics.citado || 0}</div>
            </div>

            {/* Atendido IPRESS - Completados */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-md p-3 text-white transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-green-100 text-xs font-semibold">Completados</span>
                <CheckCircle2 className="w-6 h-6 text-green-200" strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold">{metrics.atendidoIpress || 0}</div>
            </div>

            {/* Pendientes en Bolsa - Nuevos */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md p-3 text-white transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-amber-100 text-xs font-semibold">Nuevos</span>
                <Calendar className="w-6 h-6 text-amber-200" strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold">{metrics.pendienteCita || 0}</div>
            </div>

            {/* Otros - Problemas/Rechazos */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-md p-3 text-white transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-red-100 text-xs font-semibold">Otros</span>
                <AlertTriangle className="w-6 h-6 text-red-200" strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold">{metrics.otros || 0}</div>
            </div>
          </div>
        </div>

        {/* Sección Principal: Pacientes Asignados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Mi Bandeja de Pacientes</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Pacientes asignados desde el módulo de Bolsas de Pacientes
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setModalImportar(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm font-medium"
                  title="Importar paciente desde base de asegurados"
                >
                  <UserPlus className="w-4 h-4" />
                  Importar Paciente
                </button>

                <button
                  onClick={() => {
                    console.log("🔄 Recargando pacientes asignados...");
                    setLoading(true);
                    fetchPacientesAsignados().finally(() => setLoading(false));
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>

                {selectedRows.size > 0 && (
                  <button
                    onClick={descargarSeleccion}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    <Download size={20} />
                    Descargar ({selectedRows.size})
                  </button>
                )}

                <button
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-xs flex items-center gap-1 ${
                    autoRefreshEnabled
                      ? "bg-white/30 hover:bg-white/40"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  title={autoRefreshEnabled ? "Auto-actualización activada (cada 30s)" : "Auto-actualización desactivada"}
                >
                  {autoRefreshEnabled ? "🔄✓" : "🔄✗"} Auto
                </button>

                <span className="text-xs text-blue-100 whitespace-nowrap">
                  {lastRefreshTime.toLocaleTimeString("es-ES")}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {pacientesAsignados.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No tienes pacientes asignados aún</p>
              </div>
            ) : (
              <>
                {/* 🔍 FILTROS SIEMPRE VISIBLES - BOLSA Y PRIORIDAD (v1.48.0) */}
                <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded flex items-center gap-1">
                      <Search className="w-4 h-4" strokeWidth={2} />
                      FILTROS
                    </span>
                    
                    {/* Búsqueda con Debounce */}
                    <div className="flex-1 min-w-[200px] relative">
                      <input
                        type="text"
                        placeholder="Buscar por DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-9"
                      />
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      {searchTerm !== debouncedSearch && (
                        <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-blue-500 animate-spin" />
                      )}
                    </div>
                    
                    {/* Filtro Bolsa - SIEMPRE VISIBLE */}
                    <div className="min-w-[200px]">
                      <select
                        value={filtroTipoBolsa}
                        onChange={(e) => {
                          setFiltroTipoBolsa(e.target.value);
                          setFiltroPrioridad107("todas"); // Reset prioridad al cambiar bolsa
                        }}
                        className="w-full px-3 py-2 border-2 border-blue-400 bg-blue-50 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="todas">Todas las bolsas</option>
                        {tiposBolsas.map((tb) => (
                          <option key={tb.idTipoBolsa} value={tb.idTipoBolsa}>
                            {tb.descTipoBolsa}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Filtro Prioridad - VISIBLE SOLO PARA BOLSA 107 */}
                    {esBolsa107 && (
                      <div className="min-w-[180px]">
                        <select
                          value={filtroPrioridad107}
                          onChange={(e) => setFiltroPrioridad107(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-red-400 bg-red-50 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="todas">Todas las prioridades</option>
                          <option value="< 24">&lt; 24 hrs (Urgente)</option>
                          <option value="24 - 72">24 - 72 hrs (Media)</option>
                          <option value="> 72">&gt; 72 hrs (Baja)</option>
                        </select>
                      </div>
                    )}

                    {/* Filtro IPRESS (Phase 2 v1.50.0) */}
                    <div className="min-w-[180px]">
                      <select
                        value={filtroIpress}
                        onChange={(e) => setFiltroIpress(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-green-400 bg-green-50 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="todas">
                          {cargandoIpress ? "Cargando..." : `Todas (${pacientesFiltrados.length})`}
                        </option>
                        {ipressDisponibles.map((ipress) => (
                          <option key={ipress.id} value={ipress.nombre}>
                            {ipress.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Toggle Solo Pendientes (Phase 2 v1.50.0) */}
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={soloPendientes}
                        onChange={(e) => setSoloPendientes(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Solo Pendientes ({contadores.pendientes})
                      </span>
                    </label>

                    {/* Botón para más filtros */}
                    <button
                      onClick={() => setExpandFiltros(!expandFiltros)}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      {expandFiltros ? "Ocultar" : "Más filtros"}
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${expandFiltros ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {expandFiltros && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      {/* Dropdowns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Macrorregión */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Macrorregión
                          </label>
                          <select
                            value={filtroMacrorregion}
                            onChange={(e) => setFiltroMacrorregion(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="todas">Todas las macrorregiones</option>
                            {macrorregionesUnicas.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Red */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Red
                          </label>
                          <select
                            value={filtroRed}
                            onChange={(e) => setFiltroRed(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="todas">Todas las redes</option>
                            {redesUnicas.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* IPRESS */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            IPRESS
                          </label>
                          <select
                            value={filtroIpress}
                            onChange={(e) => setFiltroIpress(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="todas">Todas las IPRESS</option>
                            {ipressUnicas.map((i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Especialidad */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Especialidad
                          </label>
                          <select
                            value={filtroEspecialidad}
                            onChange={(e) => setFiltroEspecialidad(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="todas">Todas las especialidades</option>
                            {especialidadesConSE.map((e) => (
                              <option key={e} value={e}>
                                {e}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Tipo de Cita */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Tipo de Cita
                          </label>
                          <select
                            value={filtroTipoCita}
                            onChange={(e) => setFiltroTipoCita(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="todas">Todos los tipos</option>
                            {tiposCitaUnicos.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Estado */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">
                            Estado
                          </label>
                          <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="todos">Todos los estados</option>
                            {estadosDisponibles.map((e) => (
                              <option key={e.codigo} value={e.codigo}>
                                {e.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 📅 Filtros de Rango de Fechas (v1.43.3) */}
                      <div className="border-t border-gray-200 pt-3">
                        {/* F. INGRESO BOLSA */}
                        <div className="mb-3">
                          <label className="text-xs font-semibold text-orange-600 block mb-2 flex items-center gap-1">
                            📅 Rango de Fechas - F. Ingreso Bolsa
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Desde</label>
                              <input
                                type="date"
                                value={filtroFechaIngresoInicio}
                                onChange={(e) => setFiltroFechaIngresoInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Hasta</label>
                              <input
                                type="date"
                                value={filtroFechaIngresoFin}
                                onChange={(e) => setFiltroFechaIngresoFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* F. ASIGNACIÓN */}
                        <div>
                          <label className="text-xs font-semibold text-blue-600 block mb-2 flex items-center gap-1">
                            📅 Rango de Fechas - F. Asignación
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Desde</label>
                              <input
                                type="date"
                                value={filtroFechaAsignacionInicio}
                                onChange={(e) => setFiltroFechaAsignacionInicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Hasta</label>
                              <input
                                type="date"
                                value={filtroFechaAsignacionFin}
                                onChange={(e) => setFiltroFechaAsignacionFin(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botón Limpiar */}
                      <div className="flex justify-end pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setFiltroTipoBolsa("todas");
                            setFiltroPrioridad107("todas");
                            setFiltroMacrorregion("todas");
                            setFiltroRed("todas");
                            setFiltroIpress("todas");
                            setFiltroEspecialidad("todas");
                            setFiltroTipoCita("todas");
                            setFiltroEstado("todos");
                            setFiltroFechaIngresoInicio("");
                            setFiltroFechaIngresoFin("");
                            setFiltroFechaAsignacionInicio("");
                            setFiltroFechaAsignacionFin("");
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          🗑️ Limpiar todos
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-hidden max-h-[calc(100vh-400px)] overflow-y-auto relative">
                  <table className="w-full text-xs border-collapse">
                  <thead className="bg-[#0D5BA9] text-white sticky top-0 z-20">
                    <tr className="border-b-2 border-blue-800">
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === pacientesFiltrados.length && pacientesFiltrados.length > 0}
                          onChange={toggleAllRows}
                          className="w-4 h-4 cursor-pointer"
                          title={selectedRows.size === pacientesFiltrados.length ? "Deseleccionar todo" : "Seleccionar todo"}
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
                        F. Ingreso Bolsa
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
                        F. Asignación
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
                        Origen de la Bolsa
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
                        T-Nº Documento
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
                        Paciente
                      </th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase">
                        Teléfonos
                      </th>
                      {/* Columna Prioridad - Solo visible para Bolsa ID 1 */}
                      {esBolsaId1 && (
                        <th className="px-2 py-2 text-center text-[10px] font-bold uppercase">
                          Prioridad
                        </th>
                      )}
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        Especialidad
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        DNI Méd.
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        Especialista
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        Fecha/Hora Cita
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        IPRESS
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        Tipo Cita
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        Estado
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        F. Atención Méd.
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        Est. Atención
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        F. Cambio
                      </th>
                      <th className="px-2 py-2 text-left text-[10px] font-bold uppercase">
                        Usuario
                      </th>
                      <th className="px-2 py-2 text-center text-[10px] font-bold uppercase">
                        Acc.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesFiltrados.map((paciente, idx) => (
                      <tr
                        key={paciente.id}
                        className={`border-b border-gray-200 transition-colors ${
                          selectedRows.has(paciente.id)
                            ? 'bg-blue-100 border-blue-300'
                            : getRowAlertClass(paciente)
                        }`}
                      >
                        <td className="px-2 py-1.5">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(paciente.id)}
                            onChange={() => toggleRowSelection(paciente.id)}
                            className={`w-4 h-4 border-2 rounded cursor-pointer transition-all ${
                              selectedRows.has(paciente.id)
                                ? 'bg-blue-600 border-blue-600 accent-white'
                                : 'border-gray-300 hover:border-blue-400'
                            }`}
                          />
                        </td>
                        {/* F. INGRESO BOLSA */}
                        <td className="px-3 py-2">
                          {(() => {
                            // Para RECITA e INTERCONSULTA, usar fechaSolicitud si fechaCambioEstado está vacío
                            const fechaMostrar = (paciente.tipoCita === "RECITA" || paciente.tipoCita === "INTERCONSULTA")
                              ? (paciente.fechaSolicitud || paciente.fechaCambioEstado)
                              : paciente.fechaCambioEstado;

                            return fechaMostrar && fechaMostrar !== "-" ? (
                              <div className="bg-orange-50 rounded p-1.5 border-l-4 border-orange-600">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <Calendar size={12} className="text-orange-600 flex-shrink-0" />
                                  <span className="text-xs font-bold text-orange-600 uppercase tracking-tight">Ingreso</span>
                                </div>
                                <div className="text-xs font-semibold text-orange-900">
                                  {new Date(fechaMostrar).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </div>
                                <div className="text-xs text-orange-600 font-medium">
                                  {formatearTiempoRelativo(fechaMostrar)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 italic text-xs py-0.5">—</div>
                            );
                          })()}
                        </td>

                        {/* F. ASIGNACIÓN */}
                        <td className="px-3 py-2">
                          {paciente.fechaAsignacion && paciente.fechaAsignacion !== "-" ? (
                            <div className="bg-blue-50 rounded p-1.5 border-l-4 border-blue-600">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Calendar size={12} className="text-blue-600 flex-shrink-0" />
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">Asignación</span>
                              </div>
                              <div className="text-xs font-semibold text-blue-900">
                                {new Date(paciente.fechaAsignacion).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                {formatearTiempoRelativo(paciente.fechaAsignacion)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 italic text-xs py-0.5">—</div>
                          )}
                        </td>

                        {/* ORIGEN DE LA BOLSA */}
                        <td className="px-3 py-2">
                          {paciente.descTipoBolsa && paciente.descTipoBolsa !== "-" ? (
                            <span className="text-xs font-semibold text-gray-900">
                              {paciente.descTipoBolsa}
                            </span>
                          ) : (
                            <div className="text-gray-400 italic text-xs py-0.5">—</div>
                          )}
                        </td>

                        {/* T-Nº DOCUMENTO */}
                        <td className="px-3 py-2 text-sm min-w-max">
                          <div className="text-xs text-gray-600 font-semibold">DNI</div>
                          <div className="font-bold text-blue-600 mt-1 text-base">{paciente.pacienteDni}</div>
                        </td>

                        {/* PACIENTE */}
                        <td className="px-3 py-2 text-sm min-w-max">
                          <div className="font-bold text-gray-900 text-base whitespace-nowrap">{paciente.pacienteNombre}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="inline-block">{paciente.pacienteSexo || "N/D"}</span>
                            <span className="mx-1">•</span>
                            <span className="inline-block">{paciente.pacienteEdad || "N/D"} años</span>
                          </div>
                        </td>

                        {/* TELÉFONOS */}
                        <td className="px-3 py-2">
                          <div className="bg-green-50 rounded p-1.5 border-l-4 border-green-600">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Phone size={12} className="text-green-600 flex-shrink-0" />
                              <span className="text-xs font-bold text-green-600 uppercase tracking-tight">Principal</span>
                            </div>
                            <div className="text-xs font-semibold text-green-900">
                              {paciente.pacienteTelefono ? (
                                <a
                                  href={`https://wa.me/${paciente.pacienteTelefono.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-green-700"
                                  title="Abrir en WhatsApp"
                                >
                                  {paciente.pacienteTelefono}
                                </a>
                              ) : (
                                <span className="text-gray-400">N/D</span>
                              )}
                            </div>

                            {paciente.pacienteTelefonoAlterno && (
                              <>
                                <div className="h-px bg-green-200 my-1"></div>
                                <div className="flex items-center gap-1 mb-0.5">
                                  <Phone size={12} className="text-green-500 flex-shrink-0" />
                                  <span className="text-xs font-bold text-green-600 uppercase tracking-tight">Alterno</span>
                                </div>
                                <div className="text-xs font-semibold text-green-900">
                                  <a
                                    href={`https://wa.me/${paciente.pacienteTelefonoAlterno.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline text-green-700"
                                    title="Abrir en WhatsApp"
                                  >
                                    {paciente.pacienteTelefonoAlterno}
                                  </a>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        {/* Celda Prioridad - Solo visible para Bolsa ID 1 */}
                        {esBolsaId1 && (
                          <td className="px-2 py-1.5 text-center">
                            {(() => {
                              const tiempo = paciente.tiempoInicioSintomas;
                              if (!tiempo) {
                                return (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                                    🟢 Sin datos
                                  </span>
                                );
                              }
                              if (tiempo === "< 24") {
                                return (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">
                                    🔴 &lt; 24 hrs
                                  </span>
                                );
                              }
                              if (tiempo === "24 - 72") {
                                return (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800">
                                    🟡 24-72 hrs
                                  </span>
                                );
                              }
                              if (tiempo === "> 72") {
                                return (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800">
                                    🟢 &gt; 72 hrs
                                  </span>
                                );
                              }
                              // Valor desconocido
                              return (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-800">
                                  {tiempo}
                                </span>
                              );
                            })()}
                          </td>
                        )}
                        <td className="px-2 py-1.5 text-slate-600">
                          {pacienteEditandoEstado === paciente.id
                            ? citasAgendadas[paciente.id]?.especialidad || "Seleccionar médico"
                            : paciente.especialidad}
                        </td>
                        {/* DNI MÉDICO - COLUMNA SEPARADA */}
                        <td className="px-2 py-1.5 text-slate-600">
                          {(() => {
                            const idServicio = paciente.idServicio;
                            const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
                            const cacheKey = esTeleECG ? "TELEECG" : idServicio;
                            const medicos = medicosPorServicio[cacheKey] || [];
                            const seleccionadoId = citasAgendadas[paciente.id]?.especialista;
                            const medicoSeleccionado = medicos.find(m => m.idPers === seleccionadoId);

                            return medicoSeleccionado && medicoSeleccionado.numDocPers
                              ? medicoSeleccionado.numDocPers
                              : "-";
                          })()}
                        </td>
                        {/* ESPECIALISTA - CARGADO DINÁMICAMENTE - EDITABLE EN MODO EDICIÓN */}
                        <td className="px-2 py-1.5 text-slate-600">
                          {pacienteEditandoEstado === paciente.id ? (
                            // MODO EDICIÓN: Mostrar dropdown editable
                            (() => {
                              const idServicio = paciente.idServicio;
                              const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
                              const esValidoNumerico = idServicio && !isNaN(idServicio);
                              const cacheKey = esTeleECG ? "TELEECG" : idServicio;

                              if ((esValidoNumerico || esTeleECG)) {
                                if (!medicosPorServicio[cacheKey] && !cargandoMedicos) {
                                  obtenerMedicosPorServicio(idServicio, paciente.descTipoBolsa);
                                }
                              }

                              const medicos = medicosPorServicio[cacheKey] || [];
                              const hayMedicos = medicos.length > 0;
                              const seleccionadoId = citasAgendadas[paciente.id]?.especialista;
                              const medicoSeleccionado = medicos.find(m => m.idPers === seleccionadoId);

                              return (
                                <>
                                  {esValidoNumerico || esTeleECG ? (
                                    <div className="space-y-1">
                                      {cargandoMedicos && !medicosPorServicio[cacheKey] ? (
                                        <div className="text-center py-1">
                                          <span className="text-xs text-blue-600 font-medium">Cargando...</span>
                                        </div>
                                      ) : hayMedicos ? (
                                        <select
                                          value={seleccionadoId || ""}
                                          onChange={(e) => {
                                            const idPers = e.target.value ? parseInt(e.target.value) : "";

                                            // Buscar el médico seleccionado para obtener su especialidad
                                            const medicoElegido = medicos.find(m => m.idPers === idPers);
                                            console.log(`👨‍⚕️ Médico seleccionado:`, medicoElegido);
                                            console.log(`📊 Campos disponibles: especialidad=${medicoElegido?.especialidad}, descArea=${medicoElegido?.descArea}, perPers=${medicoElegido?.perPers}`);

                                            // Extraer especialidad: especialidad (del backend) > descArea > "SIN ESPECIALIDAD"
                                            const especialidadMedico = medicoElegido?.especialidad ||
                                                                      medicoElegido?.descArea ||
                                                                      "SIN ESPECIALIDAD";

                                            console.log(`📋 Especialidad final cargada: ${especialidadMedico}`);

                                            setCitasAgendadas(prev => ({
                                              ...prev,
                                              [paciente.id]: {
                                                ...prev[paciente.id],
                                                especialista: idPers,
                                                especialidad: especialidadMedico  // ✅ Cargar especialidad automáticamente
                                              }
                                            }));

                                            console.log(`✅ Estado actualizado para paciente ${paciente.id}`);
                                          }}
                                          className={`w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 cursor-pointer ${
                                            nuevoEstadoSeleccionado === "CITADO"
                                              ? "border-green-400 bg-green-50 focus:ring-green-500"
                                              : "border-blue-300 bg-blue-50 focus:ring-blue-400"
                                          }`}
                                          title="Puedes asignar un médico independientemente del estado"
                                        >
                                          <option value="">Seleccionar médico...</option>
                                          {medicos
                                            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
                                            .map((medico) => (
                                              <option key={medico.idPers} value={medico.idPers}>
                                                {medico.nombre} {medico.colegPers ? `(${medico.colegPers})` : ""}
                                              </option>
                                            ))}
                                        </select>
                                      ) : (
                                        <div className="text-center py-1">
                                          <span className="text-xs text-red-600 font-medium">Sin médicos</span>
                                        </div>
                                      )}
                                      {medicoSeleccionado && (
                                        <p className="text-xs text-slate-600">{medicoSeleccionado.nombre}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="bg-gray-100 border border-gray-300 rounded px-2 py-1.5 text-center">
                                      <span className="text-xs text-gray-500">Sin servicio asignado</span>
                                    </div>
                                  )}
                                </>
                              );
                            })()
                          ) : (
                            // MODO NORMAL: Mostrar especialista seleccionado como texto
                            (() => {
                              const idServicio = paciente.idServicio;
                              const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
                              const cacheKey = esTeleECG ? "TELEECG" : idServicio;
                              const medicos = medicosPorServicio[cacheKey] || [];
                              const seleccionadoId = citasAgendadas[paciente.id]?.especialista;
                              const medicoSeleccionado = medicos.find(m => m.idPers === seleccionadoId);

                              return (
                                <span className="text-xs text-slate-600">
                                  {medicoSeleccionado ? medicoSeleccionado.nombre : "No seleccionado"}
                                </span>
                              );
                            })()
                          )}
                        </td>
                        {/* FECHA Y HORA DE CITA - EDITABLE EN MODO EDICIÓN */}
                        <td className="px-2 py-1.5 text-slate-600">
                          {pacienteEditandoEstado === paciente.id ? (
                            // MODO EDICIÓN: DateTimePickerCita profesional
                            (() => {
                              const especialistaId = citasAgendadas[paciente.id]?.especialista;
                              const estaDisabled = !especialistaId;
                              console.log(`📅 DateTimePickerCita para paciente ${paciente.id}:`, {
                                especialistaId,
                                estaDisabled,
                                citasAgendadas: citasAgendadas[paciente.id]
                              });
                              return (
                                <DateTimePickerCita
                                  value={citasAgendadas[paciente.id]?.fecha || ""}
                                  onChange={(fecha) => {
                                    console.log(`📝 Fecha seleccionada: ${fecha}`);
                                    setCitasAgendadas(prev => ({
                                      ...prev,
                                      [paciente.id]: {
                                        ...prev[paciente.id],
                                        fecha: fecha
                                      }
                                    }));
                                  }}
                                  disabled={estaDisabled}
                                  idMedico={especialistaId}
                                  onValidationChange={(esValido) => {
                                    console.log(`Validación de cita: ${esValido ? "✅" : "❌"}`);
                                  }}
                                />
                              );
                            })()
                          ) : (
                            // MODO NORMAL: Mostrar como texto
                            (() => {
                              const fechaVal = citasAgendadas[paciente.id]?.fecha;
                              if (fechaVal) {
                                // Convertir de "2026-02-07T13:15" a "07/02/2026 13:15"
                                const [fecha, hora] = fechaVal.split('T');
                                const [año, mes, día] = fecha.split('-');
                                return (
                                  <div className="text-xs font-semibold text-gray-900">
                                    {día}/{mes}/{año} {hora || ""}
                                  </div>
                                );
                              }
                              return <span className="text-xs text-gray-400 italic">No seleccionado</span>;
                            })()
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-slate-600">
                          {paciente.descIpress}
                        </td>
                        <td className="px-2 py-1.5 text-slate-600">
                          {paciente.tipoCita}
                        </td>
                        <td className="px-2 py-1.5">
                          {pacienteEditandoEstado === paciente.id ? (
                            // Modo Edición: Mostrar Select
                            <div className="space-y-1">
                              <select
                                value={nuevoEstadoSeleccionado}
                                onChange={(e) => {
                                  const nuevoEstado = e.target.value;
                                  setNuevoEstadoSeleccionado(nuevoEstado);

                                  // ✅ v1.45.0: Si el estado NO es CITADO, limpiar SOLO la fecha/hora
                                  // Preservar el especialista porque puede ser asignado independientemente
                                  if (nuevoEstado !== "CITADO") {
                                    setCitasAgendadas(prev => ({
                                      ...prev,
                                      [paciente.id]: {
                                        ...prev[paciente.id],
                                        fecha: null
                                        // ✅ No limpiar especialista: puede mantenerse
                                      }
                                    }));
                                    console.log(`🧹 Limpiada fecha para paciente ${paciente.id} (estado: ${nuevoEstado}), especialista preservado`);
                                  }
                                }}
                                className="w-full px-3 py-1.5 border-2 border-orange-400 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              >
                                <option value="">Seleccionar estado...</option>
                                {estadosDisponibles.map((est) => (
                                  <option key={est.codigo} value={est.codigo} title={est.descripcion}>
                                    {est.descripcion.split(" - ")[0]}
                                  </option>
                                ))}
                              </select>
                              {nuevoEstadoSeleccionado && nuevoEstadoSeleccionado !== "CITADO" && (
                                <p className="text-xs text-gray-600 italic">
                                  ℹ️ Para este estado, médico y fecha son opcionales
                                </p>
                              )}
                              {nuevoEstadoSeleccionado === "CITADO" && (
                                <p className="text-xs text-orange-600 font-medium">
                                  ⚠️ Requiere médico y fecha de cita
                                </p>
                              )}
                            </div>
                          ) : (
                            // Modo Normal: Mostrar Badge del Estado
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-medium inline-block ${
                              paciente.codigoEstado === "ATENDIDO_IPRESS"
                                ? "bg-green-100 text-green-800"
                                : paciente.codigoEstado === "PENDIENTE_CITA"
                                ? "bg-blue-100 text-blue-800"
                                : paciente.codigoEstado === "CITADO"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {paciente.descEstadoCita?.split(" - ")[0] || "Sin estado"}
                            </span>
                          )}
                        </td>
                        {/* FECHA ATENCIÓN MÉDICA */}
                        <td className="px-2 py-1.5 text-[10px] font-medium">
                          {paciente.fechaAtencionMedica ? (
                            <span className="text-indigo-700">
                              {new Date(paciente.fechaAtencionMedica).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
                              {new Date(paciente.fechaAtencionMedica).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-gray-300 italic">—</span>
                          )}
                        </td>
                        {/* ESTADO/CONDICIÓN ATENCIÓN MÉDICA */}
                        <td className="px-2 py-1.5">
                          {paciente.condicionMedica ? (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium inline-block ${
                              paciente.condicionMedica === 'Atendido'
                                ? 'bg-emerald-100 text-emerald-800'
                                : paciente.condicionMedica === 'Deserción' || paciente.condicionMedica === 'Desercion'
                                ? 'bg-red-100 text-red-800'
                                : paciente.condicionMedica === 'Pendiente'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {paciente.condicionMedica}
                            </span>
                          ) : (
                            <span className="text-gray-300 italic text-[10px]">—</span>
                          )}
                        </td>
                        {/* FECHA CAMBIO ESTADO - Auditoría v3.3.1 */}
                        <td className="px-2 py-1.5 text-gray-700 text-[10px] font-medium">
                          {paciente.fechaCambioEstado ? (
                            <span className="text-blue-700">
                              {formatearTiempoRelativo(paciente.fechaCambioEstado)}
                            </span>
                          ) : (
                            <span className="text-gray-300 italic">—</span>
                          )}
                        </td>
                        {/* USUARIO CAMBIO ESTADO - Auditoría v3.3.1 */}
                        <td className="px-2 py-1.5 text-slate-600 text-xs">
                          {paciente.usuarioCambioEstado ? (
                            <span className="text-gray-900 font-medium">
                              {paciente.usuarioCambioEstado}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        {/* COLUMNA ACCIONES - Lápiz para editar + Guardar/Cancelar */}
                        <td className="px-2 py-1.5 text-center">
                          {pacienteEditandoEstado === paciente.id ? (
                            // Modo Edición: Mostrar Guardar y Cancelar (mejorados)
                            <div className="flex gap-2 justify-center items-center h-10">
                              {/* BOTÓN GUARDAR - Verde + Check Icon + Spinner */}
                              <button
                                onClick={handleGuardarEstado}
                                disabled={!nuevoEstadoSeleccionado || guardandoEstado}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm"
                                title="Guardar cambios"
                              >
                                {guardandoEstado ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" strokeWidth={2} />
                                    Guardar
                                  </>
                                )}
                              </button>

                              {/* BOTÓN CANCELAR - Outline Gris */}
                              <button
                                onClick={handleCancelarEstado}
                                disabled={guardandoEstado}
                                className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Cancelar edición"
                              >
                                <X className="w-4 h-4" strokeWidth={2} />
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            // Modo Normal: Mostrar botones de acciones
                            <div className="flex gap-1 justify-center items-center">
                              <button
                                onClick={() => {
                                  setPacienteEditandoEstado(paciente.id);
                                  setNuevoEstadoSeleccionado(paciente.codigoEstado || "");
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                                title="Editar estado y cita"
                              >
                                <Edit2 className="w-4 h-4" strokeWidth={2} />
                              </button>
                              <button
                                onClick={() => abrirModalTelefono(paciente)}
                                className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded transition-colors"
                                title="Actualizar teléfono"
                              >
                                <Smartphone className="w-4 h-4" strokeWidth={2} />
                              </button>
                              {paciente.fechaAtencion && paciente.horaAtencion && (
                                <button
                                  onClick={() => abrirModalMensajeCita(paciente)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors"
                                  title="Enviar mensaje de cita formateado"
                                >
                                  <MessageCircle className="w-4 h-4" strokeWidth={2} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>


              </>
            )}
          </div>
        </div>

        {/* Floating Action Bar para selecciones masivas (Phase 4 v1.50.0) */}
        {selectedRows.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50 flex-wrap justify-center">
            <span className="font-semibold text-base">{selectedRows.size} seleccionados</span>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  // TODO: Implementar asignación masiva de médicos
                  toast.info("Función próximamente: Asignación masiva de médicos");
                }}
                className="flex items-center gap-2 px-4 py-1.5 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors text-sm font-semibold"
                title="Asignar médico a pacientes seleccionados"
              >
                <UserPlus className="w-4 h-4" strokeWidth={2} />
                Asignar
              </button>

              {selectedRows.size > 0 && (
                <button
                  onClick={descargarSeleccion}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors text-sm font-semibold"
                  title="Descargar pacientes seleccionados"
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                  Descargar
                </button>
              )}

              <button
                onClick={() => setSelectedRows(new Set())}
                className="flex items-center gap-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors text-sm font-semibold"
                title="Limpiar selección"
              >
                <X className="w-4 h-4" strokeWidth={2} />
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Actualizar Teléfono */}
      {modalTelefono.visible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span>📱</span>
                <span>Actualizar Teléfonos</span>
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Paciente:</p>
                <p className="text-gray-900 font-medium">
                  {modalTelefono.paciente?.pacienteNombre}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono Principal
                </label>
                <input
                  type="tel"
                  value={modalTelefono.telefonoPrincipal}
                  onChange={(e) =>
                    setModalTelefono({
                      ...modalTelefono,
                      telefonoPrincipal: e.target.value,
                    })
                  }
                  placeholder="Ej: 987654321"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {modalTelefono.telefonoPrincipal && modalTelefono.telefonoPrincipal.length < 9 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Mínimo 9 dígitos (actual: {modalTelefono.telefonoPrincipal.length})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono Alterno
                </label>
                <input
                  type="tel"
                  value={modalTelefono.telefonoAlterno}
                  onChange={(e) =>
                    setModalTelefono({
                      ...modalTelefono,
                      telefonoAlterno: e.target.value,
                    })
                  }
                  placeholder="Ej: 912345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {modalTelefono.telefonoAlterno && modalTelefono.telefonoAlterno.length < 9 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Mínimo 9 dígitos (actual: {modalTelefono.telefonoAlterno.length})
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                💡 <strong>Formato:</strong> Mínimo <strong>9 dígitos</strong> por teléfono. Al menos uno es requerido.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={cerrarModalTelefono}
                  disabled={modalTelefono.saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarTelefono}
                  disabled={modalTelefono.saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalTelefono.saving ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Envío de Mensaje de Cita (v1.50.1) */}
      {modalMensajeCita.visible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                <span>Enviar Mensaje de Cita</span>
              </h2>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Paciente info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600">Paciente:</p>
                <p className="text-lg font-bold text-gray-900">
                  {modalMensajeCita.paciente?.pacienteNombre}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  DNI: {modalMensajeCita.paciente?.pacienteDni} |
                  Tel: {modalMensajeCita.paciente?.pacienteTelefono}
                </p>
              </div>

              {/* Vista Previa */}
              {modalMensajeCita.preview && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Vista Previa del Mensaje:</p>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-xs whitespace-pre-wrap text-gray-800 max-h-48 overflow-y-auto font-mono leading-relaxed">
                    {modalMensajeCita.preview}
                  </div>
                </div>
              )}

              {/* Información */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-6">
                <p className="text-xs text-amber-800">
                  <strong>📱 Se enviará por WhatsApp</strong> al teléfono registrado del paciente. Incluye fecha, hora y detalles de la cita médica.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() =>
                  setModalMensajeCita({
                    visible: false,
                    paciente: null,
                    preview: null,
                    enviando: false,
                    step: "preview",
                  })
                }
                disabled={modalMensajeCita.enviando}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={enviarMensajeCita}
                disabled={modalMensajeCita.enviando}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {modalMensajeCita.enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar Paciente Adicional (v1.46.0) */}
      {modalImportar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">
                  Importar Paciente Adicional
                </h2>
              </div>
              <button
                onClick={() => {
                  setModalImportar(false);
                  setBusquedaAsegurado("");
                  setResultadosBusqueda([]);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Input búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por N° de Documento
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={busquedaAsegurado}
                    onChange={(e) => {
                      const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setBusquedaAsegurado(soloDigitos);
                    }}
                    placeholder="Ingresa los 8 dígitos del DNI"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    autoFocus
                  />
                  {cargandoBusqueda && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {busquedaAsegurado.length > 0 ? `${busquedaAsegurado.length}/8 dígitos` : 'Ingresa 8 dígitos para buscar'}
                </p>
              </div>

              {/* Resultados */}
              {busquedaAsegurado.length === 8 && (
                <div className="space-y-3">
                  {cargandoBusqueda ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                  ) : resultadosBusqueda.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No se encontraron resultados</p>
                    </div>
                  ) : (
                    resultadosBusqueda.map((asegurado) => (
                      <div
                        key={asegurado.pkAsegurado}
                        className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:bg-green-50/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Info paciente */}
                          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                            <div>
                              <p className="text-xs text-gray-500">DNI</p>
                              <p className="font-medium text-gray-900">
                                {asegurado.docPaciente}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Edad / Sexo</p>
                              <p className="font-medium text-gray-900">
                                {asegurado.edad} años / {asegurado.sexo}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500">Nombre Completo</p>
                              <p className="font-semibold text-gray-900">
                                {asegurado.paciente}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Teléfono</p>
                              <p className="text-sm text-gray-700">
                                {asegurado.telCelular || asegurado.telFijo || "Sin teléfono"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Tipo Seguro</p>
                              <p className="text-sm text-gray-700">
                                {asegurado.tipoSeguro}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-gray-500">IPRESS Adscrita</p>
                              <p className="text-sm text-gray-700">
                                {asegurado.nombreIpress || "Sin IPRESS"}
                              </p>
                            </div>
                            <div className="col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-300">
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                📋 Especialidad <span className="text-red-600 text-lg">*</span>
                              </label>
                              <select
                                value={especialidadSeleccionada}
                                onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
                                className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm font-medium transition-all ${
                                  especialidadSeleccionada
                                    ? "bg-white border-green-500 text-green-900"
                                    : "bg-green-50 border-green-300 text-gray-500"
                                }`}
                              >
                                <option value="" disabled className="text-gray-400">
                                  🔴 Seleccionar especialidad (obligatorio)
                                </option>
                                {especialidadesDisponibles.map((esp) => (
                                  <option key={esp} value={esp} className="text-gray-900">
                                    ✓ {esp}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* 👨‍⚕️ Médico - v1.46.8: Select dinámico por especialidad */}
                            <div className="col-span-2 bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                👨‍⚕️ Médico Especialista
                              </label>
                              <select
                                value={medicoSeleccionado}
                                onChange={(e) => setMedicoSeleccionado(e.target.value)}
                                disabled={!especialidadSeleccionada || medicosDisponibles.length === 0}
                                className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium transition-all ${
                                  !especialidadSeleccionada || medicosDisponibles.length === 0
                                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                    : medicoSeleccionado
                                    ? "bg-white border-blue-500 text-blue-900"
                                    : "bg-white border-blue-300 text-gray-700"
                                }`}
                              >
                                <option value="">
                                  {!especialidadSeleccionada
                                    ? "⚠️ Primero selecciona una especialidad"
                                    : medicosDisponibles.length === 0
                                    ? "⚠️ No hay médicos disponibles"
                                    : "Seleccionar médico (opcional)"}
                                </option>
                                {medicosDisponibles.map((medico) => (
                                  <option key={medico.idPers} value={medico.idPers}>
                                    Dr(a). {medico.nombre} - DNI: {medico.documento}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* 📅 Fecha y Hora de Cita - v1.46.7 */}
                            <div className="col-span-2 bg-purple-50 p-3 rounded-lg border-2 border-purple-300">
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                📅 Fecha y Hora de Cita
                              </label>
                              <input
                                type="datetime-local"
                                value={fechaHoraCitaSeleccionada}
                                onChange={(e) => setFechaHoraCitaSeleccionada(e.target.value)}
                                className="w-full px-3 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                              />
                            </div>
                          </div>

                          {/* Botón agregar */}
                          <button
                            onClick={() => importarPacienteAdicional(asegurado)}
                            disabled={agregandoPaciente}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {agregandoPaciente ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span className="font-medium">Agregar</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

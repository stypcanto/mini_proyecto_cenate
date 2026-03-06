// ========================================================================
// 👤 GestionAsegurado.jsx – Gestión de Citas y Asegurados
// ========================================================================
// Rediseño v1.41.0: Tabla de Pacientes Asignados como foco principal
// Integración real con /api/bolsas/solicitudes/mi-bandeja
// ========================================================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
import { logRespuestaConsola } from "../../../utils/consoleResponseLogger";
import HistorialPacienteBtn from "../../../components/trazabilidad/HistorialPacienteBtn";

// ── Tooltip con posición fixed (escapa overflow:hidden) ──────
function Tooltip({ text, children }) {
  const [pos, setPos] = React.useState(null);
  const ref = React.useRef(null);
  const show = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top - 8 });
  };
  return (
    <div ref={ref} style={{ display: 'inline-flex' }} onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      {children}
      {pos && (
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y,
          transform: 'translate(-50%, -100%)',
          background: '#1e293b', color: '#fff', fontSize: '11px', fontWeight: '500',
          whiteSpace: 'nowrap', padding: '4px 9px', borderRadius: '6px',
          pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', zIndex: 99999,
        }}>
          {text}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            borderWidth: '4px', borderStyle: 'solid',
            borderColor: '#1e293b transparent transparent transparent',
          }} />
        </div>
      )}
    </div>
  );
}

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

  // 🏷️ CENACRON: ID de la estrategia y modal de registro
  const [cenacronEstrategiaId, setCenacronEstrategiaId] = useState(null);
  const [modalCenacron, setModalCenacron] = useState({ visible: false, paciente: null, guardando: false });

  // ✅ v1.109.10: Paginación - 100 registros por página
  const REGISTROS_POR_PAGINA = 100;
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================================
  // FILTROS ESPECIALIZADOS v1.42.0 (inspirados en Solicitudes)
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
  // 🔍 ESTADO PARA PRE-VALIDACIÓN DE ASEGURADO (v1.67.0)
  // ============================================================================
  const [modalPreValidacion, setModalPreValidacion] = useState(false);
  const [preValidacionDni, setPreValidacionDni] = useState("");
  const [preValidacionEstado, setPreValidacionEstado] = useState("idle"); // idle | buscando | encontrado | no_encontrado | error
  const [preValidacionResultado, setPreValidacionResultado] = useState(null);
  const [preValidacionPaso, setPreValidacionPaso] = useState(1); // 1: búsqueda DNI, 2: formulario cita

  // ============================================================================
  // 🆕 ESTADO PARA AGREGAR NUEVO ASEGURADO
  // ============================================================================
  const [modalNuevoAsegurado, setModalNuevoAsegurado] = useState(false);
  const [nuevoAsegurado, setNuevoAsegurado] = useState({
    tipoDocumento: "DNI",
    documento: "",
    nombreCompleto: "",
    fechaNacimiento: "",
    sexo: "M",
    tipoPaciente: "Titular",
    telefonoPrincipal: "",
    telefonoAlterno: "",
    correo: "",
    tipoSeguro: "Titular",
    casAdscripcion: "",
    periodo: String(new Date().getFullYear()),
    pacienteCenacron: false,
  });
  const [dniValidacion, setDniValidacion] = useState(null); // null | "validando" | "ok" | "duplicado"
  const [guardandoAsegurado, setGuardandoAsegurado] = useState(false);

  // ============================================================================
  // 🔧 ESTADO PARA IMPORTACIÓN DE PACIENTES ADICIONALES (v1.46.0)
  // ============================================================================
  const [modalImportar, setModalImportar] = useState(false);
  const [modalDuplicado, setModalDuplicado] = useState(false);
  const [duplicadoInfo, setDuplicadoInfo] = useState(null);
  const [busquedaAsegurado, setBusquedaAsegurado] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [agregandoPaciente, setAgregandoPaciente] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(""); // v1.46.7: Médico en modal
  const [fechaHoraCitaSeleccionada, setFechaHoraCitaSeleccionada] = useState(""); // v1.46.7: Fecha/Hora en modal
  const [medicosDisponibles, setMedicosDisponibles] = useState([]); // v1.46.7: Médicos por especialidad
  const [busquedaProfesional, setBusquedaProfesional] = useState(""); // autocomplete profesional
  const [mostrarDropdownProfes, setMostrarDropdownProfes] = useState(false);
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState(""); // autocomplete especialidad
  const [mostrarDropdownEsp, setMostrarDropdownEsp] = useState(false);
  const [especialidadesAPI, setEspecialidadesAPI] = useState([]); // cargadas desde BD
  const [horasOcupadas, setHorasOcupadas] = useState([]); // v1.67.0: Horas ya reservadas del profesional

  // v1.67.1: Drum/wheel picker refs
  const hourDrumRef = useRef(null);
  const minuteDrumRef = useRef(null);
  const DRUM_HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07..23
  const DRUM_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const DRUM_ITEM_H = 40;

  // Sync drum scroll position when time changes externally
  useEffect(() => {
    const time = fechaHoraCitaSeleccionada?.split('T')[1];
    if (!time) return;
    const [h, m] = time.split(':').map(Number);
    const hIdx = DRUM_HOURS.indexOf(h);
    const mIdx = DRUM_MINUTES.indexOf(m);
    if (hourDrumRef.current && hIdx >= 0) {
      hourDrumRef.current.scrollTop = hIdx * DRUM_ITEM_H;
    }
    if (minuteDrumRef.current && mIdx >= 0) {
      minuteDrumRef.current.scrollTop = mIdx * DRUM_ITEM_H;
    }
  }, [fechaHoraCitaSeleccionada]); // eslint-disable-line

  const handleDrumScroll = useCallback((drumType) => {
    const ref = drumType === 'hour' ? hourDrumRef : minuteDrumRef;
    if (!ref.current) return;
    clearTimeout(ref.current._scrollTimer);
    ref.current._scrollTimer = setTimeout(() => {
      const scrollTop = ref.current.scrollTop;
      const idx = Math.round(scrollTop / DRUM_ITEM_H);
      const arr = drumType === 'hour' ? DRUM_HOURS : DRUM_MINUTES;
      const clamped = Math.max(0, Math.min(idx, arr.length - 1));
      ref.current.scrollTop = clamped * DRUM_ITEM_H;
      const fechaActual = fechaHoraCitaSeleccionada?.split('T')[0] || '';
      if (!fechaActual) return;
      const time = fechaHoraCitaSeleccionada?.split('T')[1] || '07:00';
      const [currH, currM] = time.split(':').map(Number);
      const newH = drumType === 'hour' ? arr[clamped] : currH;
      const newM = drumType === 'minute' ? arr[clamped] : currM;
      const slot = `${String(newH).padStart(2,'0')}:${String(newM).padStart(2,'0')}`;
      setFechaHoraCitaSeleccionada(`${fechaActual}T${slot}`);
    }, 120);
  }, [fechaHoraCitaSeleccionada]); // eslint-disable-line

  const formatearNombreEspecialista = (medico) => {
    const apellidoPaterno = (medico?.apellidoPaterno || medico?.apPaterno || "").trim();
    const apellidoMaterno = (medico?.apellidoMaterno || medico?.apMaterno || "").trim();
    const nombres = (medico?.nombres || "").trim();

    if (apellidoPaterno && apellidoMaterno && nombres) {
      return `${apellidoPaterno} ${apellidoMaterno}, ${nombres}`;
    }

    const nombreCompleto = (medico?.nombre || "").trim().replace(/\s+/g, " ");
    if (!nombreCompleto) return "Sin nombre";

    const partes = nombreCompleto.split(" ");
    if (partes.length >= 3) {
      const apellidos = partes.slice(-2).join(" ");
      const nombresInferidos = partes.slice(0, -2).join(" ");
      return `${apellidos}, ${nombresInferidos}`;
    }

    return nombreCompleto;
  };

  const formatearLabelEspecialista = (medico) => {
    const numeroDocumento =
      medico?.documento || medico?.numDocPers || medico?.numeroDocumento || "Sin documento";
    return `${formatearNombreEspecialista(medico)} - DNI: ${numeroDocumento}`;
  };

  const obtenerApellidoPaternoParaOrden = (medico) => {
    const apellidoPaterno = (medico?.apellidoPaterno || medico?.apPaterno || "").trim();
    if (apellidoPaterno) return apellidoPaterno;

    const nombreCompleto = (medico?.nombre || "").trim().replace(/\s+/g, " ");
    if (!nombreCompleto) return "";

    const partes = nombreCompleto.split(" ");
    if (partes.length >= 3) {
      return partes[partes.length - 2];
    }
    if (partes.length === 2) {
      return partes[1];
    }
    return partes[0] || "";
  };

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

  // Cargar especialidades desde BD — recarga cada vez que se abre el dropdown
  useEffect(() => {
    if (!mostrarDropdownEsp) return;
    fetch(`${API_BASE}/especialidades/activas`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setEspecialidadesAPI(
        (Array.isArray(data) ? data : [])
          .map(e => e.descripcion?.toUpperCase()?.trim())
          .filter(Boolean)
          .sort()
      ))
      .catch(() => {});
  }, [mostrarDropdownEsp]); // eslint-disable-line

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
  // 🏥 CARGAR MÉDICOS POR ESPECIALIDAD (TEXTO) — usa fetch-doctors-by-specialty
  // Prioridad: especialidad texto > id_servicio numérico
  // ============================================================================
  const obtenerMedicosPorEspecialidadTexto = async (especialidad) => {
    if (!especialidad || especialidad === "-") return;

    const cacheKey = `ESP:${especialidad}`;

    if (medicosPorServicio[cacheKey]) return; // ya cacheado

    setCargandoMedicos(true);
    try {
      const response = await fetch(
        `${getApiBase()}/bolsas/solicitudes/fetch-doctors-by-specialty?especialidad=${encodeURIComponent(especialidad)}`,
        { method: "POST", headers: getHeaders() }
      );

      if (response.ok) {
        const result = await response.json();
        const medicos = result.data || [];
        console.log(`✅ [por-especialidad] ${medicos.length} médicos para '${especialidad}'`);
        setMedicosPorServicio(prev => ({ ...prev, [cacheKey]: medicos }));
      } else {
        setMedicosPorServicio(prev => ({ ...prev, [cacheKey]: [] }));
      }
    } catch (error) {
      console.error(`❌ Error cargando médicos por especialidad '${especialidad}':`, error);
      setMedicosPorServicio(prev => ({ ...prev, [`ESP:${especialidad}`]: [] }));
    } finally {
      setCargandoMedicos(false);
    }
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
          descIpress: solicitud.desc_ipress_atencion || solicitud.descIpressAtencion || solicitud.desc_ipress || solicitud.descIpress || "-",
          descEstadoCita: descEstadoFinal,
          codigoEstado: codigoEstado, // Guardar también el código para comparaciones
          estado: solicitud.estado || null, // ✅ Campo estado de la bolsa (v1.70.0)
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
          esCenacron: solicitud.es_cenacron === true || solicitud.esCenacron === true,
          esMaraton:  solicitud.es_maraton === true  || solicitud.esMaraton === true,
          pacienteId: solicitud.paciente_id || solicitud.pacienteId || null,
        };
      });

      // Ordenar por fecha de solicitud descendente (más nuevas primero)
      pacientes.sort((a, b) => {
        const fechaA = new Date(a.fechaSolicitud || 0).getTime();
        const fechaB = new Date(b.fechaSolicitud || 0).getTime();
        return fechaB - fechaA; // Descendente
      });

      // Excluir estados que pertenecen a "Citas Agendadas"
      const ESTADOS_AGENDADAS = ['HOSPITALIZADO', 'NO_IPRESS_CENATE', 'NUM_NO_EXISTE', 'YA_NO_REQUIERE',
                                  'CITADO', 'SIN_VIGENCIA', 'FALLECIDO', 'ATENDIDO_IPRESS'];
      const pacientesPendientes = pacientes.filter(p => !ESTADOS_AGENDADAS.includes(p.codigoEstado));
      setPacientesAsignados(pacientesPendientes);

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
  // 🏷️ CENACRON: Registrar paciente en el programa
  const confirmarRegistroCenacron = async () => {
    const { paciente } = modalCenacron;
    if (!paciente || !cenacronEstrategiaId) return;
    const pkAsegurado = paciente.pacienteId || paciente.pacienteDni;
    if (!pkAsegurado) { toast.error("No se encontró el ID del paciente"); return; }

    setModalCenacron(prev => ({ ...prev, guardando: true }));
    try {
      const response = await fetch(`${API_BASE}/paciente-estrategia`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ pkAsegurado, idEstrategia: cenacronEstrategiaId }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Error ${response.status}`);
      }
      // Actualizar badge en tabla localmente
      setPacientesAsignados(prev =>
        prev.map(p => p.id === paciente.id ? { ...p, esCenacron: true } : p)
      );
      toast.success(`✅ ${paciente.pacienteNombre} registrado en CENACRON`);
      setModalCenacron({ visible: false, paciente: null, guardando: false });
    } catch (err) {
      toast.error(`Error al registrar en CENACRON: ${err.message}`);
      setModalCenacron(prev => ({ ...prev, guardando: false }));
    }
  };

  const abrirModalTelefono = (paciente) => {
    setModalTelefono({
      visible: true,
      paciente,
      telefonoPrincipal: (paciente.pacienteTelefono || "").replace(/\D/g, ""),
      telefonoAlterno: (paciente.pacienteTelefonoAlterno || "").replace(/\D/g, ""),
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
          
          // ✅ v1.66.0: Crear error con estructura compatible con useStatusChange
          const error = new Error(errorData.mensaje || errorData.error || "Error al actualizar el estado");
          error.response = { data: errorData };
          throw error;
        }

        const responseData = await response.json();
        console.log("✅ Backend response OK:", responseData);

        // ✅ v1.66.0: Actualizar estado local INMEDIATAMENTE con respuesta del backend
        // No esperar a fetchPacientesAsignados para mejor UX
        setPacientesAsignados(prev =>
          prev.map(p => {
            if (p.id === pacienteId) {
              // Encontrar la descripción del estado desde estadosDisponibles
              const estadoObj = estadosDisponibles.find(e => e.codigo === responseData.nuevoEstadoCodigo);
              return {
                ...p,
                descEstadoCita: estadoObj?.descripcion || newStatus,
                codigoEstado: responseData.nuevoEstadoCodigo,
                // Actualizar demás campos si existen en el response
                fechaAtencion: responseData.fechaAtencion || p.fechaAtencion,
                horaAtencion: responseData.horaAtencion || p.horaAtencion,
                idPersonal: responseData.idPersonal || p.idPersonal,
              };
            }
            return p;
          })
        );
        
        console.log("✅ Estado local actualizado inmediatamente");

        // Refrescar datos desde backend DESPUÉS para sincronización completa (en background)
        console.log("🔄 Recargando datos desde backend en background...");
        fetchPacientesAsignados().catch(err => 
          console.warn("⚠️ Error refrescando datos en background:", err)
        );
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
    // Intentar recuperar fecha/hora desde citasAgendadas si no está en el objeto
    let fechaAtencion = paciente.fechaAtencion;
    let horaAtencion  = paciente.horaAtencion;

    if ((!fechaAtencion || !horaAtencion) && citasAgendadas[paciente.id]?.fecha) {
      const datetimeStr = citasAgendadas[paciente.id].fecha; // "YYYY-MM-DDTHH:mm"
      const [f, h] = datetimeStr.split("T");
      fechaAtencion = f || fechaAtencion;
      horaAtencion  = h || horaAtencion;
    }

    if (!fechaAtencion || !horaAtencion) {
      toast.error("❌ El paciente debe tener fecha y hora de cita agendada");
      return;
    }

    // Enriquecer paciente con fecha/hora resueltos
    paciente = { ...paciente, fechaAtencion, horaAtencion };

    // Obtener nombre del médico - buscar en múltiples lugares
    let pacienteConMedico = { ...paciente };

    console.log("🔍 DEBUG - Buscando médico para paciente:", paciente.id);
    console.log("   - idPersonal:", paciente.idPersonal);
    console.log("   - citasAgendadas[id]:", citasAgendadas[paciente.id]);
    console.log("   - idServicio:", paciente.idServicio);

    // ✅ v1.50.2: Cargar médicos si falta idServicio o es TeleECG
    const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
    const tieneEspTexto = paciente.especialidad && paciente.especialidad !== "-";
    const cacheKey = esTeleECG ? "TELEECG" : (tieneEspTexto ? `ESP:${paciente.especialidad}` : paciente.idServicio);

    if (esTeleECG && !medicosPorServicio["TELEECG"]) {
      await obtenerMedicosPorServicio(null, paciente.descTipoBolsa);
    } else if (tieneEspTexto && !medicosPorServicio[cacheKey]) {
      console.log("📥 Cargando médicos para especialidad:", paciente.especialidad);
      await obtenerMedicosPorEspecialidadTexto(paciente.especialidad);
    } else if (paciente.idServicio && !medicosPorServicio[cacheKey]) {
      console.log("📥 Cargando médicos para servicio:", paciente.idServicio);
      await obtenerMedicosPorServicio(paciente.idServicio, paciente.descTipoBolsa);
    }

    // Opción 1: Buscar en citasAgendadas (si el usuario acababa de seleccionar)
    const citaAgendada = citasAgendadas[paciente.id];
    if (citaAgendada && citaAgendada.especialista) {
      const medicos = medicosPorServicio[cacheKey] || [];
      console.log(`   - Médicos en caché '${cacheKey}':`, medicos.length);
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
      const medicos = medicosPorServicio[cacheKey] || [];
      const medicoEncontrado = medicos.find(m => m.idPers === paciente.idPersonal);
      if (medicoEncontrado) {
        // ✅ v1.50.3: Usar 'nombre' field directamente del DetalleMedicoDTO
        const nombre = medicoEncontrado.nombre || "Por asignar";
        pacienteConMedico.nombreMedico = nombre;
        console.log("   ✅ Médico encontrado en idPersonal:", nombre);
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
    const tel1 = (modalTelefono.telefonoPrincipal || "").trim().replace(/\D/g, "");
    const tel2 = (modalTelefono.telefonoAlterno || "").trim().replace(/\D/g, "");

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
  // 🔍 PRE-VALIDACIÓN: Buscar si asegurado existe por DNI (v1.67.0)
  // ============================================================================
  const buscarPreValidacion = async () => {
    if (!preValidacionDni || preValidacionDni.length !== 8) return;
    setPreValidacionEstado("buscando");
    setPreValidacionResultado(null);
    try {
      // Intento 1: búsqueda directa por DNI
      const res = await fetch(`${API_BASE}/asegurados/doc/${encodeURIComponent(preValidacionDni)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.docPaciente || data.doc_paciente)) {
          setPreValidacionResultado(data);
          setPreValidacionEstado("encontrado");
          return;
        }
      }
      // Intento 2: búsqueda general
      const res2 = await fetch(`${API_BASE}/asegurados/buscar?q=${encodeURIComponent(preValidacionDni)}&size=1`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res2.ok) {
        const data2 = await res2.json();
        const items = data2?.content || data2?.data || (Array.isArray(data2) ? data2 : []);
        if (items.length > 0) {
          setPreValidacionResultado(items[0]);
          setPreValidacionEstado("encontrado");
          return;
        }
      }
      setPreValidacionEstado("no_encontrado");
    } catch {
      setPreValidacionEstado("error");
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
      const dni = termino.trim();

      // ✅ Optimización: búsqueda directa por DNI exacto (más rápida)
      const responseByDoc = await fetch(
        `${API_BASE}/asegurados/doc/${encodeURIComponent(dni)}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (responseByDoc.ok) {
        const asegurado = await responseByDoc.json();
        logRespuestaConsola({
          titulo: "Consulta DNI",
          endpoint: `${API_BASE}/asegurados/doc/${encodeURIComponent(dni)}`,
          method: "GET",
          enviado: { dni },
          status: responseByDoc.status,
          devuelto: asegurado,
          fuente: "/asegurados/doc",
        });
        const resultados = asegurado ? [asegurado] : [];
        console.log(`🔍 Búsqueda directa por DNI encontró ${resultados.length} resultado(s)`);
        setResultadosBusqueda(resultados);
        return;
      }

      // Si no existe por DNI exacto, fallback al endpoint general
      if (responseByDoc.status !== 404) {
        console.warn("⚠️ /doc/{dni} devolvió estado", responseByDoc.status, "- usando fallback /buscar");
      }

      const response = await fetch(
        `${API_BASE}/asegurados/buscar?q=${encodeURIComponent(dni)}&size=1`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        logRespuestaConsola({
          titulo: "Consulta DNI",
          endpoint: `${API_BASE}/asegurados/buscar?q=${encodeURIComponent(dni)}&size=1`,
          method: "GET",
          enviado: { dni, q: dni, size: 1 },
          status: response.status,
          devuelto: data,
          fuente: "/asegurados/buscar (fallback)",
        });
        const asegurados = data?.content || [];
        console.log(`🔍 Fallback /buscar encontró ${asegurados.length} resultados`);
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
        const medicosOrdenados = [...(result.data || [])].sort((a, b) => {
          const apA = obtenerApellidoPaternoParaOrden(a);
          const apB = obtenerApellidoPaternoParaOrden(b);
          const cmpApellido = apA.localeCompare(apB, "es", { sensitivity: "base" });
          if (cmpApellido !== 0) return cmpApellido;
          return formatearNombreEspecialista(a).localeCompare(formatearNombreEspecialista(b), "es", {
            sensitivity: "base",
          });
        });
        setMedicosDisponibles(medicosOrdenados);
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
    setBusquedaProfesional("");
    setMostrarDropdownProfes(false);
  }, [especialidadSeleccionada]);

  // 🕐 v1.67.0: Cargar horas ocupadas cuando cambia profesional o fecha
  React.useEffect(() => {
    const fechaActual = fechaHoraCitaSeleccionada?.split('T')[0];
    if (!medicoSeleccionado || !fechaActual) {
      setHorasOcupadas([]);
      return;
    }
    const fetchHoras = async () => {
      try {
        const token = getToken();
        const resp = await fetch(
          `${API_BASE}/bolsas/solicitudes/horas-ocupadas?idPersonal=${medicoSeleccionado}&fecha=${fechaActual}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (resp.ok) {
          const data = await resp.json();
          setHorasOcupadas(data.horasOcupadas || []);
        }
      } catch (err) {
        console.error("Error cargando horas ocupadas:", err);
      }
    };
    fetchHoras();
  }, [medicoSeleccionado, fechaHoraCitaSeleccionada?.split('T')[0]]);

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
            descIpress: asegurado.nombreIpress || asegurado.casAdscripcion, // Usar nombre, fallback a código
            tipoCita: "TELECONSULTA",
            origen: "Importación Manual",
            // Si tiene fecha + médico asignado → CITADO automáticamente, sino pendiente
            codEstadoCita: (fechaHoraCitaSeleccionada && medicoSeleccionado) ? "CITADO" : "01",
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
        // 409 = paciente ya asignado → mostrar modal informativo
        if (createBolsaRes.status === 409 && errorData.error === "paciente_duplicado") {
          setDuplicadoInfo({ paciente: asegurado.paciente, dni: asegurado.docPaciente, asignacion: errorData.asignacionExistente });
          setModalDuplicado(true);
          return;
        }
        throw new Error(errorData.message || `Error al crear en dim_solicitud_bolsa (${createBolsaRes.status})`);
      }

      // v1.67.0: Si viene del modal pre-validación, mostrar paso de éxito
      if (modalPreValidacion) {
        setPreValidacionPaso(3); // Paso 3 = éxito
        setModalImportar(false);
        setBusquedaAsegurado("");
        setResultadosBusqueda([]);
        await fetchPacientesAsignados();
      } else {
        toast.success(`Paciente ${asegurado.paciente} importado a ${especialidadSeleccionada}`);
        setModalImportar(false);
        setModalPreValidacion(false);
        setPreValidacionPaso(1);
        setPreValidacionDni("");
        setPreValidacionEstado("idle");
        setPreValidacionResultado(null);
        setBusquedaAsegurado("");
        setResultadosBusqueda([]);
        setEspecialidadSeleccionada("");
        setMedicoSeleccionado("");
        setFechaHoraCitaSeleccionada("");
        setBusquedaProfesional("");
        setMostrarDropdownProfes(false);
        setBusquedaEspecialidad("");
        setMostrarDropdownEsp(false);
        await fetchPacientesAsignados();
      }
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
  }, [filtroFechaAsignacionInicio, filtroFechaAsignacionFin]);

  // 🏷️ Cargar ID de estrategia CENACRON al montar (una sola vez)
  useEffect(() => {
    fetch(`${API_BASE}/admin/estrategias-institucionales/activas`)
      .then(r => r.ok ? r.json() : [])
      .then(lista => {
        const cenacron = lista.find(e => e.codEstrategia === "CENACRON" || e.sigla === "CENACRON");
        if (cenacron) setCenacronEstrategiaId(cenacron.idEstrategia);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          })).sort((a, b) => a.nombre.localeCompare(b.nombre));
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
    const especialidadesConMedicos = new Set();
    let tieneTeleECG = false;

    // Recolectar especialidades y servicios únicos con médico asignado
    pacientesAsignados.forEach(paciente => {
      const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
      if (esTeleECG) {
        tieneTeleECG = true;
        return;
      }

      if (paciente.idPersonal) {
        // Preferir búsqueda por especialidad texto si está disponible
        if (paciente.especialidad && paciente.especialidad !== "-") {
          especialidadesConMedicos.add(paciente.especialidad);
        } else if (paciente.idServicio) {
          serviciosConMedicos.add(paciente.idServicio);
        }
      }
    });

    // Cargar médicos para TeleECG si existe
    if (tieneTeleECG && !medicosPorServicio["TELEECG"]) {
      console.log("📞 Cargando médicos para TeleECG...");
      obtenerMedicosPorServicio(null, "BOLSA_TELEECG");
    }

    // Cargar médicos por especialidad (texto) — nueva lógica preferida
    especialidadesConMedicos.forEach(esp => {
      const cacheKey = `ESP:${esp}`;
      if (!medicosPorServicio[cacheKey]) {
        console.log(`🔄 Precargando médicos para especialidad '${esp}'...`);
        obtenerMedicosPorEspecialidadTexto(esp);
      }
    });

    // Cargar médicos por idServicio para los que no tienen especialidad texto
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

  // Estados que "pasan" a citas-agendadas — siempre excluidos de esta vista
  const ESTADOS_AGENDADOS = ['CITADO', 'YA_NO_REQUIERE', 'SIN_VIGENCIA', 'FALLECIDO', 'ATENDIDO_IPRESS'];

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

    // 🎓 Excluir pacientes que ya pasaron a citas-agendadas
    const noEnCitasAgendadas = !ESTADOS_AGENDADOS.includes(paciente.codigoEstado);

    return (
      searchMatch &&
      bolsaMatch &&
      prioridadMatch &&
      ipressMatch &&
      especialidadMatch &&
      tipoCitaMatch &&
      estadoMatch &&
      pendienteMatch &&
      noEnCitasAgendadas
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

  // ✅ v1.109.10: Paginación de pacientes - 100 por página
  const totalPaginas = Math.ceil(pacientesFiltrados.length / REGISTROS_POR_PAGINA);
  const pacientesPaginados = pacientesFiltrados.slice(
    (currentPage - 1) * REGISTROS_POR_PAGINA,
    currentPage * REGISTROS_POR_PAGINA
  );

  // Resetear a página 1 cuando cambian los filtros
  const handleFiltroChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // ============================================================================
  // CALCULAR OPCIONES DISPONIBLES PARA FILTROS
  // ============================================================================
  const ipressUnicas = [
    ...new Set(pacientesAsignados
      .map((p) => p.descIpress)
      .filter((i) => i))
  ].sort();

  // 📋 Estados únicos presentes en la tabla actual (para dropdown de filtro)
  const estadosEnTabla = React.useMemo(() => {
    const map = new Map();
    pacientesAsignados.forEach(p => {
      if (p.codigoEstado && !map.has(p.codigoEstado)) {
        map.set(p.codigoEstado, p.descEstadoCita || p.codigoEstado);
      }
    });
    return Array.from(map.entries())
      .map(([codigo, descripcion]) => ({ codigo, descripcion }))
      .sort((a, b) => a.descripcion.localeCompare(b.descripcion, 'es'));
  }, [pacientesAsignados]);

  // 🏥 Especialidades disponibles desde BD (dinámico)
  const especialidadesDisponibles = especialidadesAPI;

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
                <div className="relative group">
                  <button
                    onClick={() => {
                      setPreValidacionDni("");
                      setPreValidacionEstado("idle");
                      setPreValidacionResultado(null);
                      setPreValidacionPaso(1);
                      setEspecialidadSeleccionada("");
                      setMedicoSeleccionado("");
                      setFechaHoraCitaSeleccionada("");
                      setBusquedaEspecialidad("");
                      setBusquedaProfesional("");
                      setModalPreValidacion(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar cita adicional
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                    Verifica si el paciente existe en el sistema y agenda una nueva cita. Si no existe, podrás registrarlo primero.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>

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
                            {estadosEnTabla.map((e) => (
                              <option key={e.codigo} value={e.codigo}>
                                {e.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 📅 Filtros de Rango de Fechas (v1.43.3) */}
                      <div className="border-t border-gray-200 pt-3">
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
                            setFiltroIpress("todas");
                            setFiltroEspecialidad("todas");
                            setFiltroTipoCita("todas");
                            setFiltroEstado("todos");
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

                <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto relative">
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
                        Estado de Gestora
                      </th>
                      <th className="px-2 py-2 text-center text-[10px] font-bold uppercase">
                        Acc.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesPaginados.map((paciente, idx) => (
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
                          <HistorialPacienteBtn dni={paciente.pacienteDni} nombrePaciente={paciente.pacienteNombre} />
                          {paciente.esCenacron && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-300">
                              ♾ CENACRON
                            </span>
                          )}
                          {paciente.esMaraton && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              🏃 MARATÓN
                            </span>
                          )}
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
                          {paciente.especialidad}
                        </td>
                        {/* DNI MÉDICO - COLUMNA SEPARADA */}
                        <td className="px-2 py-1.5 text-slate-600">
                          {(() => {
                            const idServicio = paciente.idServicio;
                            const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
                            const tieneEsp = paciente.especialidad && paciente.especialidad !== "-";
                            const cacheKey = esTeleECG ? "TELEECG" : (tieneEsp ? `ESP:${paciente.especialidad}` : idServicio);
                            const medicos = medicosPorServicio[cacheKey] || [];
                            const seleccionadoId = citasAgendadas[paciente.id]?.especialista;
                            const medicoSeleccionado = medicos.find(m => m.idPers === seleccionadoId);

                            if (!medicoSeleccionado) return "-";
                            const dniMed = String(medicoSeleccionado.documento || medicoSeleccionado.numDocPers || "").trim();
                            return dniMed || "-";
                          })()}
                        </td>
                        {/* ESPECIALISTA - CARGADO DINÁMICAMENTE - EDITABLE EN MODO EDICIÓN */}
                        <td className="px-2 py-1.5 text-slate-600">
                          {pacienteEditandoEstado === paciente.id ? (
                            // MODO EDICIÓN: Mostrar dropdown editable
                            (() => {
                              const idServicio = paciente.idServicio;
                              const esTeleECG = paciente.descTipoBolsa && paciente.descTipoBolsa.toUpperCase().includes("TELEECG");
                              const tieneEsp = paciente.especialidad && paciente.especialidad !== "-";
                              // Prioridad: especialidad texto > idServicio numérico
                              const cacheKey = esTeleECG ? "TELEECG" : (tieneEsp ? `ESP:${paciente.especialidad}` : idServicio);
                              const esValidoNumerico = idServicio && !isNaN(idServicio);

                              // Disparar carga si aún no está en caché
                              if (esTeleECG) {
                                if (!medicosPorServicio["TELEECG"] && !cargandoMedicos) {
                                  obtenerMedicosPorServicio(null, paciente.descTipoBolsa);
                                }
                              } else if (tieneEsp) {
                                if (!medicosPorServicio[cacheKey] && !cargandoMedicos) {
                                  obtenerMedicosPorEspecialidadTexto(paciente.especialidad);
                                }
                              } else if (esValidoNumerico) {
                                if (!medicosPorServicio[cacheKey] && !cargandoMedicos) {
                                  obtenerMedicosPorServicio(idServicio, paciente.descTipoBolsa);
                                }
                              }

                              const medicos = medicosPorServicio[cacheKey] || [];
                              const hayMedicos = medicos.length > 0;
                              const seleccionadoId = citasAgendadas[paciente.id]?.especialista;
                              const medicoSeleccionado = medicos.find(m => m.idPers === seleccionadoId);
                              const puedeCargar = esTeleECG || tieneEsp || esValidoNumerico;

                              return (
                                <>
                                  {puedeCargar ? (
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
                                            console.log(`📊 Campos disponibles: numDocPers="${medicoElegido?.numDocPers}", colegPers="${medicoElegido?.colegPers}", especialidad=${medicoElegido?.especialidad}, descArea=${medicoElegido?.descArea}, perPers=${medicoElegido?.perPers}`);

                                            // Extraer especialidad: del DTO completo > del paciente > "SIN ESPECIALIDAD"
                                            // Nota: fetch-doctors-by-specialty devuelve DTO simplificado {idPers, nombre, documento}
                                            const especialidadMedico = medicoElegido?.especialidad ||
                                                                      medicoElegido?.descArea ||
                                                                      paciente.especialidad ||
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
                                      <span className="text-xs text-gray-500">Sin profesional disponible</span>
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
                              const tieneEsp = paciente.especialidad && paciente.especialidad !== "-";
                              const cacheKey = esTeleECG ? "TELEECG" : (tieneEsp ? `ESP:${paciente.especialidad}` : idServicio);
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
                              {/* ✅ v1.67.0: Deshabilitar edición solo si condicionMedica=Atendido */}
                              <Tooltip text={paciente.condicionMedica === "Atendido" ? "Atención ya completada" : "Editar estado y cita"}>
                                <button
                                  onClick={() => {
                                    setPacienteEditandoEstado(paciente.id);
                                    setNuevoEstadoSeleccionado(paciente.codigoEstado || "");
                                  }}
                                  disabled={paciente.condicionMedica === "Atendido"}
                                  className={`p-2 rounded transition-colors text-white font-medium flex items-center gap-1 ${
                                    paciente.condicionMedica === "Atendido"
                                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  }`}
                                >
                                  <Edit2 className="w-4 h-4" strokeWidth={2} />
                                </button>
                              </Tooltip>
                              <Tooltip text="Actualizar teléfono">
                                <button
                                  onClick={() => abrirModalTelefono(paciente)}
                                  className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded transition-colors"
                                >
                                  <Smartphone className="w-4 h-4" strokeWidth={2} />
                                </button>
                              </Tooltip>
                              {(paciente.codigoEstado === "CITADO" || (paciente.fechaAtencion && paciente.horaAtencion)) && (
                                <Tooltip text="Enviar cita por WhatsApp">
                                  <button
                                    onClick={() => abrirModalMensajeCita(paciente)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors"
                                  >
                                    <MessageCircle className="w-4 h-4" strokeWidth={2} />
                                  </button>
                                </Tooltip>
                              )}
                              {/* 🏷️ Registrar en CENACRON (solo si no pertenece aún) */}
                              {!paciente.esCenacron && cenacronEstrategiaId && (
                                <Tooltip text="Registrar en programa CENACRON">
                                  <button
                                    onClick={() => setModalCenacron({ visible: true, paciente, guardando: false })}
                                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 p-2 rounded transition-colors"
                                  >
                                    <span className="text-xs font-bold leading-none">♾</span>
                                  </button>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ✅ v1.109.10: Controles de paginación */}
              {pacientesFiltrados.length > REGISTROS_POR_PAGINA && (
                <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200 rounded-b-xl">
                  <span className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * REGISTROS_POR_PAGINA) + 1} - {Math.min(currentPage * REGISTROS_POR_PAGINA, pacientesFiltrados.length)} de {pacientesFiltrados.length} registros
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:bg-gray-300 hover:bg-blue-700"
                    >
                      ← Anterior
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700 font-semibold">
                      Página {currentPage} de {totalPaginas}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPaginas, currentPage + 1))}
                      disabled={currentPage === totalPaginas}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:bg-gray-300 hover:bg-blue-700"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}

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

      {/* 🏷️ Modal Registrar en CENACRON */}
      {modalCenacron.visible && modalCenacron.paciente && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-t-2xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">♾</span>
                <h3 className="text-white font-bold text-base">Registrar en CENACRON</h3>
              </div>
              <button
                onClick={() => setModalCenacron({ visible: false, paciente: null, guardando: false })}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">
                ¿Confirma el registro del siguiente paciente en el programa <strong className="text-purple-700">CENACRON</strong>?
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                <p className="font-bold text-gray-900 text-base leading-tight">{modalCenacron.paciente.pacienteNombre}</p>
                <p className="text-sm text-gray-500 mt-1">DNI: {modalCenacron.paciente.pacienteDni}</p>
              </div>
              {/* Requisitos de elegibilidad */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-xs font-bold text-amber-800 mb-1.5">⚠️ Requisitos de elegibilidad</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  El paciente debe tener diagnóstico confirmado de al menos una enfermedad crónica elegible:
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {['HTA', 'Diabetes', 'EPOC', 'Asma', 'Insuf. Cardíaca', 'ERC'].map(enf => (
                    <span key={enf} className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-semibold">
                      {enf}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-5">
                Una vez registrado, el badge ♾ CENACRON aparecerá en todas las bandejas de profesionales.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalCenacron({ visible: false, paciente: null, guardando: false })}
                  disabled={modalCenacron.guardando}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarRegistroCenacron}
                  disabled={modalCenacron.guardando}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {modalCenacron.guardando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>♾ Confirmar registro</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
      {/* ── Modal: Paciente ya asignado ─────────────────────────────── */}
      {modalDuplicado && duplicadoInfo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-amber-500 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Cita duplicada en la misma especialidad</h3>
                <p className="text-amber-100 text-xs">No se puede registrar: ya existe una cita activa</p>
              </div>
            </div>
            {/* Contenido */}
            <div className="px-6 py-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm">{duplicadoInfo.paciente}</p>
                <p className="text-gray-500 text-xs font-mono mt-0.5">DNI: {duplicadoInfo.dni}</p>
              </div>
              {/* Explicación clara del motivo */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                <div>
                  <p className="text-sm font-semibold text-red-700">¿Por qué no se puede registrar?</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Este paciente ya tiene una cita activa en <span className="font-bold">{duplicadoInfo.asignacion?.especialidad || "la misma especialidad"}</span> con estado <span className="font-bold">{duplicadoInfo.asignacion?.desc_estado_cita || duplicadoInfo.asignacion?.descEstadoCita || duplicadoInfo.asignacion?.estado || "activo"}</span>.
                    Para registrar una nueva cita en esta especialidad, primero debe completarse, cancelarse o atenderse la cita existente.
                  </p>
                  <p className="text-xs text-blue-600 mt-1.5 font-medium">
                    Nota: Puedes citar al paciente en una especialidad diferente sin restricciones.
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Detalles de la cita existente:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Profesional asignado</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {duplicadoInfo.asignacion?.nombre_medico_asignado || duplicadoInfo.asignacion?.nombreMedicoAsignado || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Especialidad</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {duplicadoInfo.asignacion?.especialidad || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Fecha de atención</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {(() => {
                      const f = duplicadoInfo.asignacion?.fecha_atencion || duplicadoInfo.asignacion?.fechaAtencion;
                      if (!f) return "—";
                      const [y, m, d] = f.split('-');
                      return `${d}/${m}/${y}`;
                    })()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Hora</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {(() => {
                      const t = duplicadoInfo.asignacion?.hora_atencion || duplicadoInfo.asignacion?.horaAtencion;
                      if (!t) return "—";
                      const [hStr, mStr] = t.split(':');
                      const h = parseInt(hStr, 10);
                      const period = h < 12 ? 'a. m.' : 'p. m.';
                      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                      return `${String(h12).padStart(2, '0')}:${mStr} ${period}`;
                    })()}
                  </p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Estado actual</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {duplicadoInfo.asignacion?.desc_estado_cita || duplicadoInfo.asignacion?.descEstadoCita || duplicadoInfo.asignacion?.estado || "—"}
                  </p>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 pb-5">
              <button
                onClick={() => { setModalDuplicado(false); setDuplicadoInfo(null); }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

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
                                📋 Especialidad / Servicio <span className="text-red-600 text-lg">*</span>
                              </label>
                              {(() => {
                                const TODAS = especialidadesAPI;
                                const terminoEsp = busquedaEspecialidad.toLowerCase().trim();
                                const filtradas = terminoEsp ? TODAS.filter(e => e.toLowerCase().includes(terminoEsp)) : TODAS;
                                return (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={busquedaEspecialidad}
                                      onChange={(e) => {
                                        setBusquedaEspecialidad(e.target.value);
                                        setMostrarDropdownEsp(true);
                                        if (!e.target.value) {
                                          setEspecialidadSeleccionada("");
                                          setMedicoSeleccionado("");
                                          setBusquedaProfesional("");
                                        }
                                      }}
                                      onFocus={() => setMostrarDropdownEsp(true)}
                                      onBlur={() => setTimeout(() => setMostrarDropdownEsp(false), 150)}
                                      placeholder="🔴 Buscar especialidad (obligatorio)..."
                                      className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm font-medium transition-all ${
                                        especialidadSeleccionada
                                          ? "bg-white border-green-500 text-green-900"
                                          : "bg-green-50 border-green-300 text-gray-500"
                                      }`}
                                    />
                                    {mostrarDropdownEsp && (
                                      <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto text-sm">
                                        {filtradas.length === 0 ? (
                                          <li className="px-3 py-2 text-gray-400 italic">Sin resultados para "{busquedaEspecialidad}"</li>
                                        ) : (
                                          <>
                                            {filtradas.map(esp => (
                                              <li
                                                key={esp}
                                                onMouseDown={() => {
                                                  setEspecialidadSeleccionada(esp);
                                                  setBusquedaEspecialidad(esp);
                                                  setMostrarDropdownEsp(false);
                                                  setMedicoSeleccionado("");
                                                  setBusquedaProfesional("");
                                                }}
                                                className={`px-3 py-2 cursor-pointer hover:bg-green-50 ${especialidadSeleccionada === esp ? "bg-green-100 font-semibold text-green-900" : "text-gray-800"}`}
                                              >
                                                ✓ {esp}
                                              </li>
                                            ))}
                                          </>
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* 👨‍⚕️ Profesional de Salud - autocomplete */}
                            <div className="col-span-2 bg-blue-50 p-3 rounded-lg border-2 border-blue-300">
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                👨‍⚕️ Profesional de Salud
                              </label>
                              {!especialidadSeleccionada ? (
                                <div className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm">
                                  ⚠️ Primero selecciona una especialidad / servicio
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={busquedaProfesional}
                                    onChange={(e) => {
                                      setBusquedaProfesional(e.target.value);
                                      setMostrarDropdownProfes(true);
                                      if (!e.target.value) setMedicoSeleccionado("");
                                    }}
                                    onFocus={() => setMostrarDropdownProfes(true)}
                                    onBlur={() => setTimeout(() => setMostrarDropdownProfes(false), 150)}
                                    placeholder={medicosDisponibles.length === 0 ? "Sin profesionales disponibles" : "Buscar por nombre o DNI..."}
                                    disabled={medicosDisponibles.length === 0}
                                    className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium transition-all ${
                                      medicoSeleccionado
                                        ? "bg-white border-blue-500 text-blue-900"
                                        : "bg-white border-blue-300 text-gray-700"
                                    }`}
                                  />
                                  {mostrarDropdownProfes && medicosDisponibles.length > 0 && (() => {
                                    const termino = busquedaProfesional.toLowerCase().trim();
                                    const filtrados = termino
                                      ? medicosDisponibles.filter(m =>
                                          formatearLabelEspecialista(m).toLowerCase().includes(termino)
                                        )
                                      : medicosDisponibles;
                                    return filtrados.length > 0 ? (
                                      <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto text-sm">
                                        <li
                                          className="px-3 py-2 text-gray-400 italic cursor-pointer hover:bg-gray-50"
                                          onMouseDown={() => {
                                            setMedicoSeleccionado("");
                                            setBusquedaProfesional("");
                                            setMostrarDropdownProfes(false);
                                          }}
                                        >
                                          Seleccionar profesional (opcional)
                                        </li>
                                        {filtrados.map((medico) => (
                                          <li
                                            key={medico.idPers}
                                            onMouseDown={() => {
                                              setMedicoSeleccionado(String(medico.idPers));
                                              setBusquedaProfesional(formatearLabelEspecialista(medico));
                                              setMostrarDropdownProfes(false);
                                            }}
                                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                                              String(medicoSeleccionado) === String(medico.idPers)
                                                ? "bg-blue-100 font-semibold text-blue-900"
                                                : "text-gray-800"
                                            }`}
                                          >
                                            {formatearLabelEspecialista(medico)}
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 text-sm">
                                        <li className="px-3 py-2 text-gray-400 italic">Sin resultados para "{busquedaProfesional}"</li>
                                      </ul>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>

                            {/* 📅 Fecha y Hora de Cita - v1.46.7 */}
                            <div className="col-span-2 bg-purple-50 p-3 rounded-lg border-2 border-purple-300">
                              <label className="block text-sm font-semibold text-gray-800 mb-3">
                                📅 Fecha y Hora de Cita
                              </label>
                              <div className="space-y-2">
                                {/* Campo Fecha */}
                                <div>
                                  <label className="text-xs text-gray-700 font-medium">Fecha</label>
                                  <input
                                    type="date"
                                    value={fechaHoraCitaSeleccionada?.split('T')[0] || ''}
                                    onChange={(e) => {
                                      const fechaSeleccionada = e.target.value;
                                      const horaActual = fechaHoraCitaSeleccionada?.split('T')[1] || '';
                                      setFechaHoraCitaSeleccionada(horaActual ? `${fechaSeleccionada}T${horaActual}` : fechaSeleccionada);
                                    }}
                                    min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                                  />
                                </div>

                                {/* Drum / Wheel picker de hora (modal importar) */}
                                <div>
                                  <label className="text-xs text-gray-700 font-medium mb-2 block">Horario</label>
                                  {(() => {
                                    const fechaActual = fechaHoraCitaSeleccionada?.split('T')[0] || '';
                                    const selSlot = fechaHoraCitaSeleccionada?.split('T')[1] || '';
                                    const [selH, selM] = selSlot ? selSlot.split(':').map(Number) : [7, 0];
                                    return (
                                      <div className="flex gap-2">
                                        <div className="flex-1">
                                          <p className="text-center text-xs text-gray-400 mb-1">Hora</p>
                                          <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                                            <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: 'rgba(124,58,237,0.12)', borderTop: '2px solid #7c3aed', borderBottom: '2px solid #7c3aed' }} />
                                            <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                                            <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                                            <div
                                              ref={hourDrumRef}
                                              onScroll={() => handleDrumScroll('hour')}
                                              className="absolute inset-0 overflow-y-scroll"
                                              style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            >
                                              <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                                {DRUM_HOURS.map(h => {
                                                  const period = h < 12 ? 'a.m.' : 'p.m.';
                                                  const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
                                                  const isSelected = selH === h;
                                                  return (
                                                    <div
                                                      key={h}
                                                      style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'center' }}
                                                      className={`flex items-center justify-center cursor-pointer select-none font-semibold text-sm transition-all ${isSelected ? 'text-purple-700' : 'text-gray-500'}`}
                                                      onClick={() => {
                                                        if (!fechaActual) { toast.error("Selecciona primero la fecha"); return; }
                                                        const slot = `${String(h).padStart(2,'0')}:${String(selM).padStart(2,'0')}`;
                                                        setFechaHoraCitaSeleccionada(`${fechaActual}T${slot}`);
                                                        if (hourDrumRef.current) hourDrumRef.current.scrollTop = DRUM_HOURS.indexOf(h) * DRUM_ITEM_H;
                                                      }}
                                                    >
                                                      {String(h12).padStart(2,'0')} {period}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-center text-2xl font-bold text-purple-400 pb-1">:</div>
                                        <div className="flex-1">
                                          <p className="text-center text-xs text-gray-400 mb-1">Minutos</p>
                                          <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                                            <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: 'rgba(124,58,237,0.12)', borderTop: '2px solid #7c3aed', borderBottom: '2px solid #7c3aed' }} />
                                            <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                                            <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                                            <div
                                              ref={minuteDrumRef}
                                              onScroll={() => handleDrumScroll('minute')}
                                              className="absolute inset-0 overflow-y-scroll"
                                              style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            >
                                              <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                                {DRUM_MINUTES.map(m => {
                                                  const mm = String(m).padStart(2, '0');
                                                  const slot = `${String(selH).padStart(2,'0')}:${mm}`;
                                                  const ocupado = horasOcupadas.includes(slot);
                                                  const isSelected = selM === m;
                                                  return (
                                                    <div
                                                      key={m}
                                                      style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'center' }}
                                                      className={`flex items-center justify-center gap-1 cursor-pointer select-none font-semibold text-sm transition-all
                                                        ${ocupado ? 'text-red-400 cursor-not-allowed' : ''}
                                                        ${isSelected && !ocupado ? 'text-purple-700' : ''}
                                                        ${!ocupado && !isSelected ? 'text-gray-500' : ''}`}
                                                      onClick={() => {
                                                        if (ocupado) { toast.error("Horario ocupado"); return; }
                                                        if (!fechaActual) { toast.error("Selecciona primero la fecha"); return; }
                                                        const newSlot = `${String(selH).padStart(2,'0')}:${mm}`;
                                                        setFechaHoraCitaSeleccionada(`${fechaActual}T${newSlot}`);
                                                        if (minuteDrumRef.current) minuteDrumRef.current.scrollTop = DRUM_MINUTES.indexOf(m) * DRUM_ITEM_H;
                                                      }}
                                                    >
                                                      <span>{mm}</span>
                                                      {ocupado && <span className="text-xs text-red-400">✕</span>}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  <div className="mt-2 flex items-center justify-between">
                                    {fechaHoraCitaSeleccionada?.includes('T') ? (() => {
                                      const [, timeVal] = fechaHoraCitaSeleccionada.split('T');
                                      const [hh, mmSel] = timeVal.split(':').map(Number);
                                      const p = hh < 12 ? 'a. m.' : 'p. m.';
                                      const h12v = hh === 12 ? 12 : hh > 12 ? hh - 12 : hh;
                                      const ocupado = horasOcupadas.includes(timeVal);
                                      return <p className={`text-xs font-semibold ${ocupado ? 'text-red-600' : 'text-purple-700'}`}>{ocupado ? '⚠ Horario ocupado' : `Seleccionado: ${String(h12v).padStart(2,'0')}:${String(mmSel).padStart(2,'0')} ${p}`}</p>;
                                    })() : <span className="text-xs text-gray-400">Desplaza para seleccionar hora</span>}
                                    {horasOcupadas.length > 0 && <span className="text-xs text-amber-600 font-medium">{horasOcupadas.length} ocupados</span>}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-2">Intervalos de 5 minutos, desde hoy</p>
                            </div>
                          </div>

                          {/* Botón agregar */}
                          <button
                            onClick={() => {
                              // Validar que la fecha no sea anterior a hoy
                              if (fechaHoraCitaSeleccionada) {
                                const fechaSeleccionada = fechaHoraCitaSeleccionada.split('T')[0];
                                const ahora = new Date();
                                const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;
                                
                                if (fechaSeleccionada < hoy) {
                                  toast.error("❌ No puedes citar a una fecha anterior a hoy");
                                  return;
                                }
                              }
                              
                              importarPacienteAdicional(asegurado);
                            }}
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

      {/* ================================================================ */}
      {/* 🔍 MODAL PRE-VALIDACIÓN DE ASEGURADO (v1.67.0)                 */}
      {/* ================================================================ */}
      {modalPreValidacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  {preValidacionPaso === 3 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Calendar className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Registrar cita adicional</h2>
                  <p className="text-blue-100 text-xs">
                    {preValidacionPaso === 3 ? "Cita registrada correctamente" : "Busca al paciente y completa los datos de la cita"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setModalPreValidacion(false); setPreValidacionPaso(1); setPreValidacionDni(""); setPreValidacionEstado("idle"); setPreValidacionResultado(null); setEspecialidadSeleccionada(""); setMedicoSeleccionado(""); setFechaHoraCitaSeleccionada(""); setBusquedaEspecialidad(""); setBusquedaProfesional(""); }} className="text-white/80 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* === PASO 3: Pantalla de éxito === */}
            {preValidacionPaso === 3 ? (
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Cita registrada con exito</h3>
                <p className="text-gray-600">
                  Se ha colocado una cita adicional para <span className="font-semibold">{preValidacionResultado?.paciente || preValidacionResultado?.nombre}</span> (DNI: {preValidacionResultado?.docPaciente || preValidacionResultado?.doc_paciente}).
                </p>
                {fechaHoraCitaSeleccionada && (
                  <p className="text-sm text-gray-500">
                    Fecha: <span className="font-medium">{fechaHoraCitaSeleccionada.split('T')[0]}</span>
                    {fechaHoraCitaSeleccionada.split('T')[1] && <> | Hora: <span className="font-medium">{fechaHoraCitaSeleccionada.split('T')[1]}</span></>}
                    {busquedaProfesional && <> | Profesional: <span className="font-medium">{busquedaProfesional}</span></>}
                  </p>
                )}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mx-auto max-w-md">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                      <span className="font-semibold">Importante:</span> No te olvides de asegurarte que el paciente tambien este citado en el <span className="font-bold">ESSI</span> en el mismo horario para que el profesional pueda atender.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <button
                    onClick={() => {
                      setPreValidacionPaso(1);
                      setPreValidacionDni("");
                      setPreValidacionEstado("idle");
                      setPreValidacionResultado(null);
                      setEspecialidadSeleccionada("");
                      setMedicoSeleccionado("");
                      setFechaHoraCitaSeleccionada("");
                      setBusquedaEspecialidad("");
                      setBusquedaProfesional("");
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar otra cita
                  </button>
                  <button
                    onClick={() => { setModalPreValidacion(false); setPreValidacionPaso(1); setPreValidacionDni(""); setPreValidacionEstado("idle"); setPreValidacionResultado(null); setEspecialidadSeleccionada(""); setMedicoSeleccionado(""); setFechaHoraCitaSeleccionada(""); setBusquedaEspecialidad(""); setBusquedaProfesional(""); }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Body: Dos columnas */}
                <div className="grid grid-cols-2 divide-x divide-gray-200">
                  {/* ======== COLUMNA IZQUIERDA: Paso 1 - Buscar paciente ======== */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${preValidacionEstado === "encontrado" ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}>1</span>
                      <span className="text-sm font-semibold text-gray-700">Buscar paciente</span>
                      {preValidacionEstado === "encontrado" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    </div>

                    {/* Barra de búsqueda DNI */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Ingresa el DNI del paciente</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ej: 12345678"
                          maxLength={8}
                          value={preValidacionDni}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                            setPreValidacionDni(val);
                            if (val.length < 8) {
                              setPreValidacionEstado("idle");
                              setPreValidacionResultado(null);
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter" && preValidacionDni.length === 8 && preValidacionEstado !== "buscando") {
                              buscarPreValidacion();
                            }
                          }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                        />
                        <button
                          disabled={preValidacionDni.length !== 8 || preValidacionEstado === "buscando"}
                          onClick={buscarPreValidacion}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          {preValidacionEstado === "buscando" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          Buscar
                        </button>
                      </div>
                      {preValidacionDni.length > 0 && preValidacionDni.length < 8 && (
                        <p className="text-xs text-gray-400 mt-1">Ingresa los 8 digitos del DNI</p>
                      )}
                    </div>

                    {/* Resultado: Paciente ENCONTRADO */}
                    {preValidacionEstado === "encontrado" && preValidacionResultado && (
                      <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-sm text-green-700">Paciente encontrado</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-100 space-y-2">
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            <div>
                              <p className="text-xs text-gray-400">DNI</p>
                              <p className="text-sm font-semibold text-gray-800">{preValidacionResultado.docPaciente || preValidacionResultado.doc_paciente}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Edad / Sexo</p>
                              <p className="text-sm font-semibold text-gray-800">{preValidacionResultado.edad ? `${preValidacionResultado.edad} a.` : "—"} / {preValidacionResultado.sexo === "M" ? "M" : "F"}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Nombre completo</p>
                            <p className="text-sm font-bold text-gray-800">{preValidacionResultado.paciente || preValidacionResultado.nombre}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {(preValidacionResultado.telCelular || preValidacionResultado.telFijo || preValidacionResultado.telefono || preValidacionResultado.telefonoPrincipal) && (
                              <div>
                                <p className="text-xs text-gray-400">Telefono</p>
                                <p className="text-sm font-semibold text-gray-800">{preValidacionResultado.telCelular || preValidacionResultado.telFijo || preValidacionResultado.telefono || preValidacionResultado.telefonoPrincipal}</p>
                              </div>
                            )}
                            {(preValidacionResultado.tipoSeguro || preValidacionResultado.tipo_seguro) && (
                              <div>
                                <p className="text-xs text-gray-400">Tipo seguro</p>
                                <p className="text-sm font-semibold text-gray-800">{preValidacionResultado.tipoSeguro || preValidacionResultado.tipo_seguro}</p>
                              </div>
                            )}
                          </div>
                          {(preValidacionResultado.casAdscripcion || preValidacionResultado.cas_adscripcion || preValidacionResultado.nombreIpress) && (
                            <div>
                              <p className="text-xs text-gray-400">IPRESS adscrita</p>
                              <p className="text-sm font-semibold text-gray-800">{preValidacionResultado.nombreIpress || preValidacionResultado.casAdscripcion || preValidacionResultado.cas_adscripcion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Resultado: Paciente NO ENCONTRADO */}
                    {preValidacionEstado === "no_encontrado" && (
                      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold text-sm text-amber-700">Paciente no encontrado</span>
                        </div>
                        <p className="text-sm text-amber-600">
                          No se encontro ningun asegurado con DNI <span className="font-bold">{preValidacionDni}</span>.
                        </p>
                        <button
                          onClick={() => {
                            setModalPreValidacion(false);
                            setNuevoAsegurado(prev => ({ ...prev, tipoDocumento: "DNI", documento: preValidacionDni, nombreCompleto: "", fechaNacimiento: "", sexo: "M", tipoPaciente: "Titular", telefonoPrincipal: "", telefonoAlterno: "", correo: "", tipoSeguro: "Titular", casAdscripcion: "", periodo: String(new Date().getFullYear()), pacienteCenacron: false }));
                            setDniValidacion("ok");
                            fetch(`${API_BASE}/asegurados/filtros/ipress`, { headers: { Authorization: `Bearer ${getToken()}` } })
                              .then(r => r.json()).then(d => setIpressDisponibles(d || [])).catch(() => {});
                            setModalNuevoAsegurado(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Registrar nuevo paciente
                        </button>
                      </div>
                    )}

                    {/* Resultado: ERROR */}
                    {preValidacionEstado === "error" && (
                      <div className="border border-red-200 bg-red-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2 text-red-700">
                          <XCircle className="w-5 h-5" />
                          <span className="font-semibold text-sm">Error en la busqueda</span>
                        </div>
                        <p className="text-sm text-red-600">No se pudo verificar el DNI. Intenta nuevamente.</p>
                      </div>
                    )}

                    {/* Estado idle - Hint */}
                    {preValidacionEstado === "idle" && preValidacionDni.length === 0 && (
                      <div className="text-center py-6">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Ingresa un DNI para buscar al paciente</p>
                      </div>
                    )}
                  </div>

                  {/* ======== COLUMNA DERECHA: Paso 2 - Datos de la cita (desbloqueo secuencial) ======== */}
                  <div className={`p-5 space-y-4 ${preValidacionEstado !== "encontrado" ? "opacity-40 pointer-events-none" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${preValidacionEstado === "encontrado" ? "bg-blue-600 text-white" : "bg-gray-300 text-white"}`}>2</span>
                      <span className="text-sm font-semibold text-gray-700">Datos de la cita</span>
                    </div>

                    {/* 1. Especialidad / Servicio — siempre habilitado */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-300">
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Especialidad / Servicio <span className="text-red-600 text-lg">*</span>
                      </label>
                      {(() => {
                        const TODAS = especialidadesAPI;
                        const terminoEsp = busquedaEspecialidad.toLowerCase().trim();
                        const filtradas = terminoEsp ? TODAS.filter(e => e.toLowerCase().includes(terminoEsp)) : TODAS;
                        return (
                          <div className="relative">
                            <input
                              type="text"
                              value={busquedaEspecialidad}
                              onChange={(e) => {
                                setBusquedaEspecialidad(e.target.value);
                                setMostrarDropdownEsp(true);
                                if (!e.target.value) {
                                  setEspecialidadSeleccionada("");
                                  setMedicoSeleccionado("");
                                  setBusquedaProfesional("");
                                }
                              }}
                              onFocus={() => setMostrarDropdownEsp(true)}
                              onBlur={() => setTimeout(() => setMostrarDropdownEsp(false), 150)}
                              placeholder="Buscar especialidad..."
                              className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm font-medium transition-all ${
                                especialidadSeleccionada ? "bg-white border-green-500 text-green-900" : "bg-green-50 border-green-300 text-gray-500"
                              }`}
                            />
                            {mostrarDropdownEsp && (
                              <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto text-sm">
                                {filtradas.length === 0 ? (
                                  <li className="px-3 py-2 text-gray-400 italic">Sin resultados</li>
                                ) : (
                                  <>
                                    {filtradas.map(esp => (
                                      <li key={esp} onMouseDown={() => { setEspecialidadSeleccionada(esp); setBusquedaEspecialidad(esp); setMostrarDropdownEsp(false); setMedicoSeleccionado(""); setBusquedaProfesional(""); }}
                                        className={`px-3 py-2 cursor-pointer hover:bg-green-50 ${especialidadSeleccionada === esp ? "bg-green-100 font-semibold text-green-900" : "text-gray-800"}`}
                                      >{esp}</li>
                                    ))}
                                  </>
                                )}
                              </ul>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* 2. Profesional de Salud — bloqueado hasta seleccionar especialidad */}
                    <div className={`p-3 rounded-lg border-2 transition-all ${!especialidadSeleccionada ? "bg-gray-50 border-gray-200 opacity-50 pointer-events-none" : "bg-blue-50 border-blue-300"}`}>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Profesional de Salud</label>
                      {!especialidadSeleccionada ? (
                        <div className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm">Primero selecciona una especialidad</div>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={busquedaProfesional}
                            onChange={(e) => { setBusquedaProfesional(e.target.value); setMostrarDropdownProfes(true); if (!e.target.value) setMedicoSeleccionado(""); }}
                            onFocus={() => setMostrarDropdownProfes(true)}
                            onBlur={() => setTimeout(() => setMostrarDropdownProfes(false), 150)}
                            placeholder={medicosDisponibles.length === 0 ? "Sin profesionales disponibles" : "Buscar por nombre o DNI..."}
                            disabled={medicosDisponibles.length === 0}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium transition-all ${
                              medicoSeleccionado ? "bg-white border-blue-500 text-blue-900" : "bg-white border-blue-300 text-gray-700"
                            }`}
                          />
                          {mostrarDropdownProfes && medicosDisponibles.length > 0 && (() => {
                            const termino = busquedaProfesional.toLowerCase().trim();
                            const filtrados = termino ? medicosDisponibles.filter(m => formatearLabelEspecialista(m).toLowerCase().includes(termino)) : medicosDisponibles;
                            return filtrados.length > 0 ? (
                              <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto text-sm">
                                <li className="px-3 py-2 text-gray-400 italic cursor-pointer hover:bg-gray-50" onMouseDown={() => { setMedicoSeleccionado(""); setBusquedaProfesional(""); setMostrarDropdownProfes(false); }}>
                                  Seleccionar profesional (opcional)
                                </li>
                                {filtrados.map((medico) => (
                                  <li key={medico.idPers} onMouseDown={() => { setMedicoSeleccionado(String(medico.idPers)); setBusquedaProfesional(formatearLabelEspecialista(medico)); setMostrarDropdownProfes(false); }}
                                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${String(medicoSeleccionado) === String(medico.idPers) ? "bg-blue-100 font-semibold text-blue-900" : "text-gray-800"}`}
                                  >
                                    {formatearLabelEspecialista(medico)}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 text-sm">
                                <li className="px-3 py-2 text-gray-400 italic">Sin resultados para "{busquedaProfesional}"</li>
                              </ul>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* 3. Fecha y Hora de Cita — bloqueado hasta seleccionar profesional */}
                    <div className={`p-3 rounded-lg border-2 transition-all ${!medicoSeleccionado ? "bg-gray-50 border-gray-200 opacity-50 pointer-events-none" : "bg-purple-50 border-purple-300"}`}>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Fecha y Hora de Cita</label>
                      {!medicoSeleccionado ? (
                        <div className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm">Primero selecciona un profesional</div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-700 font-medium">Fecha</label>
                            <input
                              type="date"
                              value={fechaHoraCitaSeleccionada?.split('T')[0] || ''}
                              onChange={(e) => {
                                const fechaSeleccionada = e.target.value;
                                setFechaHoraCitaSeleccionada(fechaSeleccionada);
                              }}
                              min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
                              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                            />
                          </div>
                          {/* Drum / Wheel picker de hora */}
                          <div>
                            <label className="text-xs text-gray-700 font-medium mb-2 block">Horario</label>
                            {(() => {
                              const fechaActual = fechaHoraCitaSeleccionada?.split('T')[0] || '';
                              const selSlot = fechaHoraCitaSeleccionada?.split('T')[1] || '';
                              const [selH, selM] = selSlot ? selSlot.split(':').map(Number) : [7, 0];
                              return (
                                <div className="flex gap-2">
                                  {/* Drum Horas */}
                                  <div className="flex-1">
                                    <p className="text-center text-xs text-gray-400 mb-1">Hora</p>
                                    <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                                      {/* Overlay de selección */}
                                      <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: 'rgba(124,58,237,0.12)', borderTop: '2px solid #7c3aed', borderBottom: '2px solid #7c3aed' }} />
                                      <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                                      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                                      <div
                                        ref={hourDrumRef}
                                        onScroll={() => handleDrumScroll('hour')}
                                        className="absolute inset-0 overflow-y-scroll"
                                        style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                      >
                                        <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                          {DRUM_HOURS.map(h => {
                                            const period = h < 12 ? 'a.m.' : 'p.m.';
                                            const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
                                            const isSelected = selH === h;
                                            return (
                                              <div
                                                key={h}
                                                style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'center' }}
                                                className={`flex items-center justify-center cursor-pointer select-none font-semibold text-sm transition-all ${isSelected ? 'text-purple-700' : 'text-gray-500'}`}
                                                onClick={() => {
                                                  if (!fechaActual) { toast.error("Selecciona primero la fecha"); return; }
                                                  const slot = `${String(h).padStart(2,'0')}:${String(selM).padStart(2,'0')}`;
                                                  setFechaHoraCitaSeleccionada(`${fechaActual}T${slot}`);
                                                  if (hourDrumRef.current) hourDrumRef.current.scrollTop = DRUM_HOURS.indexOf(h) * DRUM_ITEM_H;
                                                }}
                                              >
                                                {String(h12).padStart(2,'0')} {period}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Separador */}
                                  <div className="flex items-center justify-center text-2xl font-bold text-purple-400 pb-1">:</div>
                                  {/* Drum Minutos */}
                                  <div className="flex-1">
                                    <p className="text-center text-xs text-gray-400 mb-1">Minutos</p>
                                    <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                                      <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: 'rgba(124,58,237,0.12)', borderTop: '2px solid #7c3aed', borderBottom: '2px solid #7c3aed' }} />
                                      <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                                      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                                      <div
                                        ref={minuteDrumRef}
                                        onScroll={() => handleDrumScroll('minute')}
                                        className="absolute inset-0 overflow-y-scroll"
                                        style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                      >
                                        <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                          {DRUM_MINUTES.map(m => {
                                            const mm = String(m).padStart(2, '0');
                                            const slot = `${String(selH).padStart(2,'0')}:${mm}`;
                                            const ocupado = horasOcupadas.includes(slot);
                                            const isSelected = selM === m;
                                            return (
                                              <div
                                                key={m}
                                                style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'center' }}
                                                className={`flex items-center justify-center gap-1 cursor-pointer select-none font-semibold text-sm transition-all
                                                  ${ocupado ? 'text-red-400 cursor-not-allowed' : ''}
                                                  ${isSelected && !ocupado ? 'text-purple-700' : ''}
                                                  ${!ocupado && !isSelected ? 'text-gray-500' : ''}`}
                                                onClick={() => {
                                                  if (ocupado) { toast.error("Horario ocupado"); return; }
                                                  if (!fechaActual) { toast.error("Selecciona primero la fecha"); return; }
                                                  const newSlot = `${String(selH).padStart(2,'0')}:${mm}`;
                                                  setFechaHoraCitaSeleccionada(`${fechaActual}T${newSlot}`);
                                                  if (minuteDrumRef.current) minuteDrumRef.current.scrollTop = DRUM_MINUTES.indexOf(m) * DRUM_ITEM_H;
                                                }}
                                              >
                                                <span>{mm}</span>
                                                {ocupado && <span className="text-xs text-red-400">✕</span>}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                            {/* Slot seleccionado + indicador ocupados */}
                            <div className="mt-2 flex items-center justify-between">
                              {fechaHoraCitaSeleccionada?.includes('T') ? (() => {
                                const [, timeVal] = fechaHoraCitaSeleccionada.split('T');
                                const [hh, mmSel] = timeVal.split(':').map(Number);
                                const p = hh < 12 ? 'a. m.' : 'p. m.';
                                const h12v = hh === 12 ? 12 : hh > 12 ? hh - 12 : hh;
                                const ocupado = horasOcupadas.includes(timeVal);
                                return (
                                  <p className={`text-xs font-semibold ${ocupado ? 'text-red-600' : 'text-purple-700'}`}>
                                    {ocupado ? '⚠ Horario ocupado' : `Seleccionado: ${String(h12v).padStart(2,'0')}:${String(mmSel).padStart(2,'0')} ${p}`}
                                  </p>
                                );
                              })() : <span className="text-xs text-gray-400">Desplaza para seleccionar hora</span>}
                              {horasOcupadas.length > 0 && <span className="text-xs text-amber-600 font-medium">{horasOcupadas.length} ocupados</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Boton Citar Paciente — visible solo cuando hay fecha+hora */}
                    <button
                      onClick={() => {
                        if (!especialidadSeleccionada) { toast.error("Selecciona una especialidad"); return; }
                        if (!medicoSeleccionado) { toast.error("Selecciona un profesional"); return; }
                        if (!fechaHoraCitaSeleccionada || !fechaHoraCitaSeleccionada.includes('T')) { toast.error("Selecciona fecha y hora"); return; }
                        const fechaSeleccionada = fechaHoraCitaSeleccionada.split('T')[0];
                        const ahora = new Date();
                        const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;
                        if (fechaSeleccionada < hoy) { toast.error("No puedes citar a una fecha anterior a hoy"); return; }
                        importarPacienteAdicional(preValidacionResultado);
                      }}
                      disabled={agregandoPaciente || preValidacionEstado !== "encontrado" || !especialidadSeleccionada || !medicoSeleccionado || !fechaHoraCitaSeleccionada?.includes('T')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {agregandoPaciente ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                      {agregandoPaciente ? "Citando paciente..." : "Citar Paciente"}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                  <button
                    onClick={() => { setModalPreValidacion(false); setPreValidacionPaso(1); setPreValidacionDni(""); setPreValidacionEstado("idle"); setPreValidacionResultado(null); setEspecialidadSeleccionada(""); setMedicoSeleccionado(""); setFechaHoraCitaSeleccionada(""); setBusquedaEspecialidad(""); setBusquedaProfesional(""); }}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 🆕 MODAL AGREGAR NUEVO ASEGURADO                               */}
      {/* ================================================================ */}
      {modalNuevoAsegurado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Agregar Nuevo Asegurado</h2>
              </div>
              <button onClick={() => setModalNuevoAsegurado(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Fila 1: Tipo de Documento + Documento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={nuevoAsegurado.tipoDocumento}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, tipoDocumento: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carné de Extranjería</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Selecciona el tipo de documento</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="12345678"
                    maxLength={20}
                    value={nuevoAsegurado.documento}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 20);
                      setNuevoAsegurado(p => ({ ...p, documento: val }));
                      // Validar DNI en tiempo real
                      if (val.length >= 8) {
                        setDniValidacion("validando");
                        fetch(`${API_BASE}/asegurados/validar-dni/${val}`, { headers: { Authorization: `Bearer ${getToken()}` } })
                          .then(r => r.json())
                          .then(d => setDniValidacion(d.disponible ? "ok" : "duplicado"))
                          .catch(() => setDniValidacion(null));
                      } else {
                        setDniValidacion(null);
                      }
                    }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 ${
                      dniValidacion === "duplicado" ? "border-red-400 bg-red-50" :
                      dniValidacion === "ok" ? "border-green-400 bg-green-50" : "border-gray-300"
                    }`}
                  />
                  {dniValidacion === "validando" && <p className="text-xs text-blue-500 mt-1">Validando...</p>}
                  {dniValidacion === "ok" && <p className="text-xs text-green-600 mt-1">✅ Disponible</p>}
                  {dniValidacion === "duplicado" && <p className="text-xs text-red-600 mt-1">❌ Ya está registrado</p>}
                </div>
              </div>

              {/* Fila 2: Nombre Completo + Fecha de Nacimiento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Juan Pérez García"
                    value={nuevoAsegurado.nombreCompleto}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, nombreCompleto: e.target.value.toUpperCase() }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={nuevoAsegurado.fechaNacimiento}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, fechaNacimiento: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fila 3: Sexo + Tipo de Paciente */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sexo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={nuevoAsegurado.sexo}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, sexo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tipo de Paciente <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={nuevoAsegurado.tipoPaciente}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, tipoPaciente: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Titular">Titular</option>
                    <option value="Derechohabiente">Derechohabiente</option>
                    <option value="Pensionista">Pensionista</option>
                  </select>
                </div>
              </div>

              {/* Fila 4: Teléfono principal + Alterno */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono móvil principal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="999888777"
                    maxLength={15}
                    value={nuevoAsegurado.telefonoPrincipal}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, telefonoPrincipal: e.target.value.replace(/\D/g, "") }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono celular o fijo alterno
                  </label>
                  <input
                    type="tel"
                    placeholder="987654321"
                    maxLength={15}
                    value={nuevoAsegurado.telefonoAlterno}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, telefonoAlterno: e.target.value.replace(/\D/g, "") }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fila 5: Correo + Tipo de Seguro */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={nuevoAsegurado.correo}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, correo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tipo de Seguro <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={nuevoAsegurado.tipoSeguro}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, tipoSeguro: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Titular">Titular</option>
                    <option value="Derechohabiente">Derechohabiente</option>
                    <option value="Pensionista">Pensionista</option>
                  </select>
                </div>
              </div>

              {/* Fila 6: IPRESS + Periodo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    IPRESS <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={nuevoAsegurado.casAdscripcion}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, casAdscripcion: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Selecciona una IPRESS</option>
                    {ipressDisponibles.map(ip => (
                      <option key={ip.codIpress || ip.id} value={ip.codIpress || ip.cod_ipress}>
                        {ip.descIpress || ip.desc_ipress || ip.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Periodo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="2026"
                    maxLength={4}
                    value={nuevoAsegurado.periodo}
                    onChange={e => setNuevoAsegurado(p => ({ ...p, periodo: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Ingresa solo el año (4 dígitos). Ejemplo: 2025</p>
                </div>
              </div>

              {/* Toggle CENACRON */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Paciente CENACRON</p>
                  <p className="text-xs text-gray-500 mt-0.5">Indica si el asegurado pertenece al programa de pacientes crónicos CENACRON</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNuevoAsegurado(p => ({ ...p, pacienteCenacron: !p.pacienteCenacron }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    nuevoAsegurado.pacienteCenacron ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    nuevoAsegurado.pacienteCenacron ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setModalNuevoAsegurado(false)}
                disabled={guardandoAsegurado}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={guardandoAsegurado || dniValidacion === "duplicado" || dniValidacion === "validando"}
                onClick={async () => {
                  const a = nuevoAsegurado;
                  if (!a.documento || !a.nombreCompleto || !a.fechaNacimiento || !a.telefonoPrincipal || !a.casAdscripcion || !a.periodo) {
                    toast.error("Completa todos los campos obligatorios (*)");
                    return;
                  }
                  if (dniValidacion === "duplicado") { toast.error("El DNI ya está registrado"); return; }
                  setGuardandoAsegurado(true);
                  try {
                    const payload = {
                      docPaciente: a.documento,
                      paciente: a.nombreCompleto,
                      fecnacimpaciente: a.fechaNacimiento,
                      sexo: a.sexo,
                      tipoPaciente: a.tipoPaciente,
                      telCelular: a.telefonoPrincipal,
                      telFijo: a.telefonoAlterno || null,
                      correoElectronico: a.correo || null,
                      tipoSeguro: a.tipoSeguro,
                      casAdscripcion: a.casAdscripcion,
                      periodo: a.periodo,
                      pacienteCronico: a.pacienteCenacron,
                    };
                    const res = await fetch(`${API_BASE}/asegurados`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
                      body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      throw new Error(err.mensaje || err.error || "Error al crear asegurado");
                    }
                    toast.success(`✅ Asegurado ${a.nombreCompleto} creado correctamente`);
                    setModalNuevoAsegurado(false);
                  } catch (err) {
                    toast.error(`❌ ${err.message}`);
                  } finally {
                    setGuardandoAsegurado(false);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guardandoAsegurado ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Crear Asegurado
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

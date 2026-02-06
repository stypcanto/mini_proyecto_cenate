// ========================================================================
// 👤 GestionAsegurado.jsx – Gestión de Citas y Asegurados
// ========================================================================
// Rediseño v1.41.0: Tabla de Pacientes Asignados como foco principal
// Integración real con /api/bolsas/solicitudes/mi-bandeja
// ========================================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getToken } from "../../../constants/auth";
import { useStatusChange } from "../../../hooks/useStatusChange";
import ListHeader from "../../../components/ListHeader";
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
} from "lucide-react";
import toast from "react-hot-toast";

export default function GestionAsegurado() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pacientesAsignados, setPacientesAsignados] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPacientes: 0,
    pacientesAtendidos: 0,
    pacientesPendientes: 0,
    solicitudesPendientes: 0,
  });
  const [error, setError] = useState(null);
  const [modalTelefono, setModalTelefono] = useState({
    visible: false,
    paciente: null,
    telefonoPrincipal: "",
    telefonoAlterno: "",
    saving: false,
  });

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [estadosDisponibles] = useState([
    { codigo: "PENDIENTE_CITA", descripcion: "Pendiente Citar - Paciente nuevo que ingresó a la bolsa" },
    { codigo: "CITADO", descripcion: "Citado - Paciente agendado para atención" },
    { codigo: "ATENDIDO_IPRESS", descripcion: "Atendido por IPRESS - Paciente recibió atención en institución" },
    { codigo: "NO_CONTESTA", descripcion: "No contesta - Paciente no responde a las llamadas" },
    { codigo: "NO_DESEA", descripcion: "No desea - Paciente rechaza la atención" },
    { codigo: "APAGADO", descripcion: "Apagado - Teléfono del paciente apagado" },
    { codigo: "TEL_SIN_SERVICIO", descripcion: "Teléfono sin servicio - Línea telefónica sin servicio" },
    { codigo: "NUM_NO_EXISTE", descripcion: "Número no existe - Teléfono registrado no existe" },
    { codigo: "SIN_VIGENCIA", descripcion: "Sin vigencia de Seguro - Seguro del paciente no vigente" },
    { codigo: "HC_BLOQUEADA", descripcion: "Historia clínica bloqueada - HC del paciente bloqueada en sistema" },
    { codigo: "REPROG_FALLIDA", descripcion: "Reprogramación Fallida - No se pudo reprogramar la cita" },
  ]);

  // ============================================================================
  // 🔍 FILTROS ESPECIALIZADOS v1.42.0 (inspirados en Solicitudes)
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroMacrorregion, setFiltroMacrorregion] = useState("todas");
  const [filtroRed, setFiltroRed] = useState("todas");
  const [filtroIpress, setFiltroIpress] = useState("todas");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("todas");
  const [filtroTipoCita, setFiltroTipoCita] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipoBolsa, setFiltroTipoBolsa] = useState("todas");
  const [tiposBolsas, setTiposBolsas] = useState([]); // Lista de tipos de bolsas desde API
  const [filtroPrioridad107, setFiltroPrioridad107] = useState("todas"); // Filtro prioridad para bolsa 107
  const [expandFiltros, setExpandFiltros] = useState(false); // Filtros colapsados por defecto
  const [selectedRows, setSelectedRows] = useState(new Set()); // Selección de pacientes para descarga

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
  const [idServicioSeleccionado, setIdServicioSeleccionado] = useState(null); // v1.47.0: ID del servicio
  const [especialidadesApi, setEspecialidadesApi] = useState([]); // v1.47.0: Especialidades desde API
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
  // ⏱️ UTILIDAD: DEBOUNCE PARA BÚSQUEDA OPTIMIZADA
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
  // 🏥 CARGAR MÉDICOS POR SERVICIO (DINÁMICO)
  // ============================================================================
  const obtenerMedicosPorServicio = async (idServicio) => {
    // No hacer llamada si idServicio no es válido
    if (!idServicio || isNaN(idServicio)) {
      return;
    }

    // Si ya tenemos los médicos cacheados, no hacer segunda llamada
    if (medicosPorServicio[idServicio]) {
      return;
    }

    setCargandoMedicos(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/atenciones-clinicas/detalle-medico/por-servicio/${idServicio}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const medicos = data.data || [];
        console.log(`✅ Se obtuvieron ${medicos.length} médicos para servicio ${idServicio}`);

        setMedicosPorServicio(prev => ({
          ...prev,
          [idServicio]: medicos
        }));
      } else {
        setMedicosPorServicio(prev => ({
          ...prev,
          [idServicio]: []
        }));
      }
    } catch (error) {
      console.error("❌ Error al obtener médicos:", error);
      setMedicosPorServicio(prev => ({
        ...prev,
        [idServicio]: []
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

      const response = await fetch(
        `${API_BASE}/bolsas/solicitudes/mi-bandeja`,
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
      }

      // Transform SolicitudBolsaDTO to table structure
      const pacientes = solicitudes.map((solicitud, idx) => {
        // Mapear código de estado a descripción
        const codigoEstado = solicitud.cod_estado_cita || solicitud.codEstadoCita || "PENDIENTE_CITA";
        const estadoObj = estadosDisponibles.find(e => e.codigo === codigoEstado);
        const descEstadoFinal = estadoObj ? estadoObj.descripcion : codigoEstado;

        return {
          id: solicitud.id_solicitud || solicitud.idSolicitud || idx,
          numeroSolicitud: solicitud.numero_solicitud || solicitud.numeroSolicitud || "-",
          pacienteDni: solicitud.paciente_dni || solicitud.pacienteDni || "-",
          pacienteNombre: solicitud.paciente_nombre || solicitud.pacienteNombre || "-",
          pacienteEdad: solicitud.paciente_edad || solicitud.pacienteEdad || "-",
          pacienteSexo: solicitud.paciente_sexo || solicitud.pacienteSexo || "-",
          pacienteTelefono: solicitud.paciente_telefono || solicitud.pacienteTelefono || "-",
          pacienteTelefonoAlterno: solicitud.paciente_telefono_alterno || solicitud.pacienteTelefonoAlterno || "-",
          especialidad: solicitud.especialidad || "-",
          idServicio: solicitud.id_servicio || solicitud.idServicio || null, // ID numérico del servicio
          tipoCita: solicitud.tipo_cita || solicitud.tipoCita || "-",
          tiempoInicioSintomas: solicitud.tiempo_inicio_sintomas || solicitud.tiempoInicioSintomas || "-",
          consentimientoInformado: (solicitud.consentimiento_informado ?? solicitud.consentimientoInformado) === true ? "Sí" : (solicitud.consentimiento_informado ?? solicitud.consentimientoInformado) === false ? "No" : "-",
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
          // Tipo de Bolsa
          idBolsa: solicitud.id_bolsa || solicitud.idBolsa || null,
          descTipoBolsa: solicitud.desc_tipo_bolsa || solicitud.descTipoBolsa || "-",
        };
      });

      // Ordenar por fecha de asignación ascendente (más antiguas primero)
      pacientes.sort((a, b) => {
        const fechaA = new Date(a.fechaAsignacion || 0).getTime();
        const fechaB = new Date(b.fechaAsignacion || 0).getTime();
        return fechaA - fechaB; // Ascendente
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

      // Calculate metrics
      const atendidos = pacientes.filter(p => p.codigoEstado === "ATENDIDO_IPRESS").length;
      const pendientes = pacientes.filter(p => p.codigoEstado === "PENDIENTE_CITA").length;

      setMetrics({
        totalPacientes: pacientes.length,
        pacientesAtendidos: atendidos,
        pacientesPendientes: pendientes,
        solicitudesPendientes: pendientes,
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
    if (!termino || termino.length < 3) {
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
  // ➕ IMPORTAR PACIENTE ADICIONAL (v1.46.0) - FIXED v1.47.0
  // ============================================================================
  const importarPacienteAdicional = async (asegurado) => {
    // ✅ v1.47.0: Validar idServicio seleccionado
    if (!idServicioSeleccionado) {
      toast.error("⚠️ Debes seleccionar una especialidad antes de importar");
      return;
    }

    setAgregandoPaciente(true);
    try {
      const dni = asegurado.docPaciente;

      // ✅ v1.46.4: IMPORTAR SOLO A dim_solicitud_bolsa (bandeja del gestor de citas)
      // No crear en gestion_paciente - solo agregar a la bandeja del gestor
      // El gestor puede entonces asignar especialidad y médico
      
      // ✅ v1.47.2: Extraer fecha y hora del datetime-local
      let fechaAtencionParsed = null;
      let horaAtencionParsed = null;
      if (fechaHoraCitaSeleccionada) {
        const [fecha, hora] = fechaHoraCitaSeleccionada.split('T');
        fechaAtencionParsed = fecha; // YYYY-MM-DD
        horaAtencionParsed = hora;   // HH:mm
        console.log("⏰ Fecha atención:", fechaAtencionParsed, "Hora:", horaAtencionParsed);
      }
      
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
            especialidad: especialidadSeleccionada, // ✅ v1.46.5: Agregar especialidad (nombre)
            idServicio: idServicioSeleccionado, // ✅ v1.47.0: Agregar idServicio directamente
            idPersonal: medicoSeleccionado ? parseInt(medicoSeleccionado) : null, // ✅ v1.47.1: ID del médico
            fechaAtencion: fechaAtencionParsed, // ✅ v1.47.2: Fecha de atención
            horaAtencion: horaAtencionParsed, // ✅ v1.47.2: Hora de atención
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
      setIdServicioSeleccionado(null); // ✅ v1.47.0: Resetear idServicio
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
        await fetchPacientesAsignados();
        await fetchTiposBolsas(); // Cargar tipos de bolsas
        await fetchEspecialidadesApi(); // v1.47.0: Cargar especialidades
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para cargar tipos de bolsas desde API
  const fetchTiposBolsas = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/bolsas/tipos-bolsas/activos`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("📦 Tipos de bolsas cargados:", data);
        setTiposBolsas(data || []);
      } else {
        console.warn("⚠️ No se pudieron cargar los tipos de bolsas");
      }
    } catch (error) {
      console.error("❌ Error cargando tipos de bolsas:", error);
    }
  };

  // 🏥 v1.47.0: Cargar especialidades desde API (activos-cenate)
  const fetchEspecialidadesApi = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/servicio-essi/activos-cenate`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("🏥 Especialidades cargadas desde API:", data);
        setEspecialidadesApi(data || []);
      } else {
        console.warn("⚠️ No se pudieron cargar las especialidades");
      }
    } catch (error) {
      console.error("❌ Error cargando especialidades:", error);
    }
  };

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

  // Cargar automáticamente médicos de pacientes que ya tienen idPersonal
  useEffect(() => {
    if (pacientesAsignados.length === 0) return;

    const serviciosConMedicos = new Set();
    
    // Recolectar todos los idServicio únicos que tienen idPersonal guardado
    pacientesAsignados.forEach(paciente => {
      if (paciente.idPersonal && paciente.idServicio && !serviciosConMedicos.has(paciente.idServicio)) {
        serviciosConMedicos.add(paciente.idServicio);
        console.log(`👨‍⚕️ Paciente ${paciente.pacienteNombre} tiene idPersonal ${paciente.idPersonal}, cargando médicos del servicio ${paciente.idServicio}`);
      }
    });

    // Cargar médicos para cada servicio
    serviciosConMedicos.forEach(idServicio => {
      if (!medicosPorServicio[idServicio]) {
        console.log(`🔄 Obteniendo médicos del servicio ${idServicio}...`);
        obtenerMedicosPorServicio(idServicio);
      }
    });
  }, [pacientesAsignados, medicosPorServicio]);

  // ============================================================================
  // 🔍 FUNCIÓN DE FILTRADO ESPECIALIZADO
  // ============================================================================
  const pacientesFiltrados = pacientesAsignados.filter((paciente) => {
    // 🔎 Búsqueda por DNI, Nombre o IPRESS
    const searchMatch =
      searchTerm === "" ||
      paciente.pacienteDni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.descIpress?.toLowerCase().includes(searchTerm.toLowerCase());

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

    // 📌 Filtro Estado
    const estadoMatch =
      filtroEstado === "todos" ||
      paciente.codigoEstado === filtroEstado;
    
    // 📦 Filtro Tipo de Bolsa
    const tipoBolsaMatch =
      filtroTipoBolsa === "todas" ||
      paciente.idBolsa?.toString() === filtroTipoBolsa;

    // 🚦 Filtro Prioridad (solo para bolsa 107)
    const getPrioridadCategoria = (tiempoSintomas) => {
      if (!tiempoSintomas || tiempoSintomas === "-") return "> 72";
      if (tiempoSintomas.includes("< 24") || tiempoSintomas.includes("<24")) return "< 24";
      if (tiempoSintomas.includes("24 - 72") || tiempoSintomas.includes("24-72")) return "24 - 72";
      return "> 72";
    };
    
    const prioridadMatch = (() => {
      if (filtroPrioridad107 === "todas") return true;
      const categoria = getPrioridadCategoria(paciente.tiempoInicioSintomas);
      return categoria === filtroPrioridad107;
    })();

    if (filtroEstado !== "todos" && !estadoMatch) {
      console.log(`❌ Paciente ${paciente.pacienteNombre} rechazado por estado. Esperado: ${filtroEstado}, Actual: ${paciente.codigoEstado}`);
    }

    return (
      searchMatch &&
      macrorregionMatch &&
      redMatch &&
      ipressMatch &&
      especialidadMatch &&
      tipoCitaMatch &&
      estadoMatch &&
      tipoBolsaMatch &&
      prioridadMatch
    );
  });

  // 🔍 Determinar si la bolsa seleccionada es 107 (para mostrar columnas adicionales)
  const esBolsa107 = (() => {
    if (filtroTipoBolsa === "todas") return false;
    // Verificar si el filtro es "1" (id de bolsa 107)
    if (filtroTipoBolsa === "1") return true;
    const tipoBolsaSeleccionada = tiposBolsas.find(tb => tb.idTipoBolsa?.toString() === filtroTipoBolsa);
    if (!tipoBolsaSeleccionada) return false;
    const codigo = tipoBolsaSeleccionada.codTipoBolsa?.toString() || "";
    const descripcion = tipoBolsaSeleccionada.descTipoBolsa || "";
    return codigo === "1" || codigo.includes("107") || descripcion.includes("107");
  })();

  // 🔄 Determinar si la bolsa seleccionada es Reprogramación (id 6)
  const esBolsaReprogramacion = (() => {
    if (filtroTipoBolsa === "todas") return false;
    // Verificar si el filtro seleccionado es el id 6 o si el código contiene "6" o "REPROG"
    if (filtroTipoBolsa === "6") return true;
    const tipoBolsaSeleccionada = tiposBolsas.find(tb => tb.idTipoBolsa?.toString() === filtroTipoBolsa);
    if (!tipoBolsaSeleccionada) return false;
    const codigo = tipoBolsaSeleccionada.codTipoBolsa?.toString() || "";
    const descripcion = (tipoBolsaSeleccionada.descTipoBolsa || "").toUpperCase();
    return codigo === "6" || descripcion.includes("REPROG");
  })();

  // ============================================================================
  // 📊 CALCULAR OPCIONES DISPONIBLES PARA FILTROS
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

  // 🏥 Especialidades disponibles para importación (v1.47.0 - cargadas desde API)
  const especialidadesDisponibles = especialidadesApi.map(e => e.descServicio);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-gray-600 text-sm">Total de Pacientes</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.totalPacientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">Pacientes Atendidos</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.pacientesAtendidos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-gray-600 text-sm">Pacientes Pendientes</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.pacientesPendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="text-gray-600 text-sm">Solicitudes Pendientes</p>
                <p className="text-3xl font-bold text-slate-900">{metrics.solicitudesPendientes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Principal: Pacientes Asignados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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

          <div className="p-4">
            {pacientesAsignados.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-4 text-sm">No tienes pacientes asignados aún</p>
              </div>
            ) : (
              <>
                {/* 🔍 FILTROS ESPECIALIZADOS */}
                <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {/* Fila principal siempre visible: Búsqueda + Tipo de Bolsa */}
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Buscar paciente, DNI o IPRESS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="min-w-[180px]">
                      <select
                        value={filtroTipoBolsa}
                        onChange={(e) => {
                          setFiltroTipoBolsa(e.target.value);
                          setFiltroPrioridad107("todas"); // Reset prioridad al cambiar bolsa
                        }}
                        className="w-full px-2 py-1.5 border border-blue-400 bg-blue-50 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="todas">📦 Todas las bolsas</option>
                        {tiposBolsas.map((tb) => (
                          <option key={tb.idTipoBolsa} value={tb.idTipoBolsa}>
                            {tb.descTipoBolsa}
                          </option>
                        ))}
                      </select>
                    </div>
                    {esBolsa107 && (
                      <div className="min-w-[160px]">
                        <select
                          value={filtroPrioridad107}
                          onChange={(e) => setFiltroPrioridad107(e.target.value)}
                          className="w-full px-2 py-1.5 border border-red-400 bg-red-50 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                          <option value="todas">🚦 Todas las prioridades</option>
                          <option value="< 24">🔴 &lt; 24 hrs (Urgente)</option>
                          <option value="24 - 72">🟡 24 - 72 hrs (Media)</option>
                          <option value="> 72">🟢 &gt; 72 hrs (Baja)</option>
                        </select>
                      </div>
                    )}
                    <button
                      onClick={() => setExpandFiltros(!expandFiltros)}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded"
                    >
                      {expandFiltros ? "Ocultar" : "Más filtros"}
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${expandFiltros ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {expandFiltros && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      {/* Dropdowns compactos */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                        {/* Macrorregión */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                            Macrorregión
                          </label>
                          <select
                            value={filtroMacrorregion}
                            onChange={(e) => setFiltroMacrorregion(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="todas">Todas</option>
                            {macrorregionesUnicas.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Red */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                            Red
                          </label>
                          <select
                            value={filtroRed}
                            onChange={(e) => setFiltroRed(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="todas">Todas</option>
                            {redesUnicas.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* IPRESS */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                            IPRESS
                          </label>
                          <select
                            value={filtroIpress}
                            onChange={(e) => setFiltroIpress(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="todas">Todas</option>
                            {ipressUnicas.map((i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Especialidad */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                            Especialidad
                          </label>
                          <select
                            value={filtroEspecialidad}
                            onChange={(e) => setFiltroEspecialidad(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="todas">Todas</option>
                            {especialidadesConSE.map((e) => (
                              <option key={e} value={e}>
                                {e}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Tipo de Cita */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                            Tipo Cita
                          </label>
                          <select
                            value={filtroTipoCita}
                            onChange={(e) => setFiltroTipoCita(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="todas">Todos</option>
                            {tiposCitaUnicos.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Estado */}
                        <div>
                          <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                            Estado
                          </label>
                          <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="todos">Todos</option>
                            {estadosDisponibles.map((e) => (
                              <option key={e.codigo} value={e.codigo}>
                                {e.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Botón Limpiar */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setFiltroMacrorregion("todas");
                            setFiltroRed("todas");
                            setFiltroIpress("todas");
                            setFiltroEspecialidad("todas");
                            setFiltroTipoCita("todas");
                            setFiltroEstado("todos");
                            setFiltroTipoBolsa("todas");
                            setFiltroPrioridad107("todas");
                          }}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded transition-colors"
                        >
                          🗑️ Limpiar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                  <thead className="bg-[#0D5BA9] text-white sticky top-0">
                    <tr className="border-b-2 border-blue-800">
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === pacientesFiltrados.length && pacientesFiltrados.length > 0}
                          onChange={toggleAllRows}
                          className="w-4 h-4 cursor-pointer"
                          title={selectedRows.size === pacientesFiltrados.length ? "Deseleccionar todo" : "Seleccionar todo"}
                        />
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Bolsa
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        F. Asignación
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        DNI
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Paciente
                      </th>
                      <th className="px-2 py-1.5 text-center text-[10px] font-bold uppercase">
                        Edad
                      </th>
                      <th className="px-2 py-1.5 text-center text-[10px] font-bold uppercase">
                        Gén.
                      </th>
                      {esBolsa107 && (
                        <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                          T. Síntomas
                        </th>
                      )}
                      {esBolsa107 && (
                        <th className="px-2 py-1.5 text-center text-[10px] font-bold uppercase">
                          Consent.
                        </th>
                      )}
                      {esBolsaReprogramacion && (
                        <th className="px-2 py-1.5 text-center text-[10px] font-bold uppercase">
                          Prioridad
                        </th>
                      )}
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Especialidad
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        DNI Méd.
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Especialista
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Fecha/Hora Cita
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        IPRESS
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Tipo Cita
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Tel. 1
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Tel. 2
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Estado
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        F. Cambio
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-bold uppercase">
                        Usuario
                      </th>
                      <th className="px-2 py-1.5 text-center text-[10px] font-bold uppercase">
                        Acc.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesFiltrados.map((paciente, idx) => (
                      <tr
                        key={paciente.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          selectedRows.has(paciente.id) ? 'bg-blue-100 border-blue-300' : (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                        }`}
                      >
                        <td className="px-2 py-1">
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
                        <td className="px-2 py-1 text-slate-600">
                          {paciente.descTipoBolsa}
                        </td>
                        <td className="px-2 py-1 text-gray-900 text-[10px]">
                          {paciente.fechaAsignacion === "-"
                            ? "-"
                            : new Date(paciente.fechaAsignacion).toLocaleString("es-PE", {
                                year: '2-digit',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                        </td>
                        <td className="px-2 py-1 font-medium text-slate-900">
                          {paciente.pacienteDni}
                        </td>
                        <td className="px-2 py-1 text-slate-600">
                          {paciente.pacienteNombre}
                        </td>
                        <td className="px-2 py-1 text-center text-slate-600">
                          {paciente.pacienteEdad}
                        </td>
                        <td className="px-2 py-1 text-center text-slate-600">
                          {paciente.pacienteSexo}
                        </td>
                        {esBolsa107 && (
                          <td className="px-2 py-1 text-center text-slate-600">
                            {(() => {
                              const valor = paciente.tiempoInicioSintomas || "-";
                              let colorDot = "bg-green-500"; // Default green
                              if (valor.includes("< 24") || valor.includes("<24")) {
                                colorDot = "bg-red-500";
                              } else if (valor.includes("24 - 72") || valor.includes("24-72")) {
                                colorDot = "bg-yellow-500";
                              }
                              const displayText = valor === "-" ? "Sin datos" : valor;
                              return (
                                <div className="flex flex-col items-center">
                                  <span className={`w-3 h-3 rounded-full ${colorDot}`}></span>
                                  <span className="text-[9px] mt-0.5 text-gray-600">{displayText}</span>
                                </div>
                              );
                            })()}
                          </td>
                        )}
                        {esBolsa107 && (
                          <td className="px-2 py-1 text-center text-slate-600">
                            {(() => {
                              const valor = paciente.consentimientoInformado;
                              if (valor === "Sí" || valor === true) {
                                return (
                                  <div className="flex flex-col items-center">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span className="text-[9px] mt-0.5 text-gray-600">Sí</span>
                                  </div>
                                );
                              } else if (valor === "No" || valor === false) {
                                return (
                                  <div className="flex flex-col items-center">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    <span className="text-[9px] mt-0.5 text-gray-600">No</span>
                                  </div>
                                );
                              }
                              return "-";
                            })()}
                          </td>
                        )}
                        {esBolsaReprogramacion && (
                          <td className="px-2 py-1 text-center text-slate-600">
                            {(() => {
                              const fechaSolicitud = paciente.fechaSolicitud;
                              if (!fechaSolicitud || fechaSolicitud === "-") {
                                return "-";
                              }
                              const fechaSol = new Date(fechaSolicitud);
                              const hoy = new Date();
                              const diffTime = hoy.getTime() - fechaSol.getTime();
                              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                              
                              let colorDot = "bg-green-500";
                              let leyenda = `${diffDays}d`;
                              
                              if (diffDays > 30) {
                                colorDot = "bg-red-500";
                              } else if (diffDays >= 16) {
                                colorDot = "bg-yellow-500";
                              }
                              
                              return (
                                <div className="flex flex-col items-center">
                                  <span className={`w-3 h-3 rounded-full ${colorDot}`}></span>
                                  <span className="text-[9px] mt-0.5 text-gray-600">{leyenda}</span>
                                </div>
                              );
                            })()}
                          </td>
                        )}
                        <td className="px-2 py-1 text-slate-600">
                          {paciente.especialidad}
                        </td>
                        {/* DNI MÉDICO - COLUMNA SEPARADA */}
                        <td className="px-2 py-1 text-slate-600">
                          {(() => {
                            const idServicio = paciente.idServicio;
                            const medicos = medicosPorServicio[idServicio] || [];
                            const seleccionadoId = citasAgendadas[paciente.id]?.especialista;
                            const medicoSeleccionado = medicos.find(m => m.idPers === seleccionadoId);

                            return medicoSeleccionado && medicoSeleccionado.numDocPers
                              ? medicoSeleccionado.numDocPers
                              : "-";
                          })()}
                        </td>
                        {/* ESPECIALISTA - CARGADO DINÁMICAMENTE - EDITABLE EN MODO EDICIÓN */}
                        <td className="px-2 py-1 text-slate-600">
                          {pacienteEditandoEstado === paciente.id ? (
                            // MODO EDICIÓN: Mostrar dropdown editable
                            (() => {
                              const idServicio = paciente.idServicio;
                              const esValidoNumerico = idServicio && !isNaN(idServicio);
                              
                              if (esValidoNumerico) {
                                if (!medicosPorServicio[idServicio] && !cargandoMedicos) {
                                  obtenerMedicosPorServicio(idServicio);
                                }
                              }

                              const medicos = medicosPorServicio[idServicio] || [];
                              const hayMedicos = medicos.length > 0;
                              const seleccionadoId = citasAgendadas[paciente.id]?.especialista;
                              const medicoSeleccionado = medicos.find(m => m.idPers === seleccionadoId);

                              return (
                                <>
                                  {esValidoNumerico ? (
                                    <div className="space-y-1">
                                      {cargandoMedicos && !medicosPorServicio[idServicio] ? (
                                        <div className="text-center py-1">
                                          <span className="text-xs text-blue-600 font-medium">Cargando...</span>
                                        </div>
                                      ) : hayMedicos ? (
                                        <select
                                          value={seleccionadoId || ""}
                                          onChange={(e) => {
                                            const idPers = e.target.value ? parseInt(e.target.value) : "";
                                            setCitasAgendadas(prev => ({
                                              ...prev,
                                              [paciente.id]: {
                                                ...prev[paciente.id],
                                                especialista: idPers
                                              }
                                            }));
                                          }}
                                          className={`w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 cursor-pointer ${
                                            nuevoEstadoSeleccionado === "CITADO"
                                              ? "border-green-400 bg-green-50 focus:ring-green-500"
                                              : "border-blue-300 bg-blue-50 focus:ring-blue-400"
                                          }`}
                                          title="Puedes asignar un médico independientemente del estado"
                                        >
                                          <option value="">Seleccionar médico...</option>
                                          {medicos.map((medico) => (
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
                              const medicos = medicosPorServicio[idServicio] || [];
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
                        <td className="px-2 py-1 text-slate-600">
                          {pacienteEditandoEstado === paciente.id ? (
                            // MODO EDICIÓN: Input editable
                            <input
                              type="datetime-local"
                              value={citasAgendadas[paciente.id]?.fecha || ""}
                              onChange={(e) => {
                                setCitasAgendadas(prev => ({
                                  ...prev,
                                  [paciente.id]: {
                                    ...prev[paciente.id],
                                    fecha: e.target.value
                                  }
                                }));
                              }}
                              disabled={nuevoEstadoSeleccionado !== "CITADO"}
                              className={`w-full px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-2 ${
                                nuevoEstadoSeleccionado === "CITADO"
                                  ? "border-green-400 bg-green-50 focus:ring-green-500 cursor-pointer"
                                  : "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed"
                              }`}
                              placeholder="Seleccionar fecha y hora"
                              title={nuevoEstadoSeleccionado === "CITADO" ? "Selecciona la fecha y hora de la cita" : "Solo requerido para estado CITADO"}
                            />
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
                        <td className="px-2 py-1 text-slate-600">
                          {paciente.descIpress}
                        </td>
                        <td className="px-2 py-1 text-slate-600">
                          {paciente.tipoCita}
                        </td>
                        <td className="px-2 py-1 text-slate-600">
                          {paciente.pacienteTelefono}
                        </td>
                        <td className="px-2 py-1 text-slate-600">
                          {paciente.pacienteTelefonoAlterno}
                        </td>
                        <td className="px-2 py-1">
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
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-block ${
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
                        {/* FECHA CAMBIO ESTADO - Auditoría v3.3.1 */}
                        <td className="px-2 py-1 text-slate-600 text-[10px]">
                          {paciente.fechaCambioEstado ? (
                            <span className="text-blue-700 font-medium">
                              {new Date(paciente.fechaCambioEstado).toLocaleString("es-ES")}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        {/* USUARIO CAMBIO ESTADO - Auditoría v3.3.1 */}
                        <td className="px-2 py-1 text-slate-600 text-[10px]">
                          {paciente.usuarioCambioEstado ? (
                            <span className="text-gray-900 font-medium">
                              {paciente.usuarioCambioEstado}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        {/* COLUMNA ACCIONES - Lápiz para editar + Guardar/Cancelar */}
                        <td className="px-2 py-1 text-center">
                          {pacienteEditandoEstado === paciente.id ? (
                            // Modo Edición: Mostrar Guardar y Cancelar
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={handleGuardarEstado}
                                disabled={!nuevoEstadoSeleccionado || guardandoEstado}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                title="Guardar cambios"
                              >
                                💾 Guardar
                              </button>
                              <button
                                onClick={handleCancelarEstado}
                                disabled={guardandoEstado}
                                className="bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                title="Cancelar edición"
                              >
                                ✕ Cancelar
                              </button>
                            </div>
                          ) : (
                            // Modo Normal: Mostrar Lápiz de Editar
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setPacienteEditandoEstado(paciente.id);
                                  setNuevoEstadoSeleccionado(paciente.codigoEstado || "");
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center"
                                title="Editar estado y cita"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => abrirModalTelefono(paciente)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                title="Actualizar teléfonos"
                              >
                                📱
                              </button>
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
                  Buscar por DNI o Nombre
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={busquedaAsegurado}
                    onChange={(e) => setBusquedaAsegurado(e.target.value)}
                    placeholder="Ingresa DNI o nombre del paciente..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    autoFocus
                  />
                  {cargandoBusqueda && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 3 caracteres para buscar
                </p>
              </div>

              {/* Resultados */}
              {busquedaAsegurado.length >= 3 && (
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
                                value={idServicioSeleccionado || ""}
                                onChange={(e) => {
                                  const selectedId = e.target.value ? parseInt(e.target.value) : null;
                                  setIdServicioSeleccionado(selectedId);
                                  const esp = especialidadesApi.find(x => x.idServicio === selectedId);
                                  setEspecialidadSeleccionada(esp?.descServicio || "");
                                }}
                                className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm font-medium transition-all ${
                                  idServicioSeleccionado
                                    ? "bg-white border-green-500 text-green-900"
                                    : "bg-green-50 border-green-300 text-gray-500"
                                }`}
                              >
                                <option value="" disabled className="text-gray-400">
                                  🔴 Seleccionar especialidad (obligatorio)
                                </option>
                                {especialidadesApi.map((esp) => (
                                  <option key={esp.idServicio} value={esp.idServicio} className="text-gray-900">
                                    ✓ {esp.descServicio}
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
                                disabled={!idServicioSeleccionado || medicosDisponibles.length === 0}
                                className={`w-full px-3 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium transition-all ${
                                  !idServicioSeleccionado || medicosDisponibles.length === 0
                                    ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                    : medicoSeleccionado
                                    ? "bg-white border-blue-500 text-blue-900"
                                    : "bg-white border-blue-300 text-gray-700"
                                }`}
                              >
                                <option value="">
                                  {!idServicioSeleccionado
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

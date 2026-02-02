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
    { codigo: "PENDIENTE", descripcion: "Pendiente Citar - Paciente nuevo que ingresó a la bolsa" },
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
  const [expandFiltros, setExpandFiltros] = useState(false); // Filtros colapsados por defecto
  const [selectedRows, setSelectedRows] = useState(new Set()); // Selección de pacientes para descarga

  // Estados para manejar edición de estado con botones Guardar/Cancelar
  const [pacienteEditandoEstado, setPacienteEditandoEstado] = useState(null);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState("");
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  const API_BASE = "http://localhost:8080/api";

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
        const codigoEstado = solicitud.cod_estado_cita || solicitud.codEstadoCita || "PENDIENTE";
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
          tipoCita: solicitud.tipo_cita || solicitud.tipoCita || "-",
          descIpress: solicitud.desc_ipress || solicitud.descIpress || "-",
          descEstadoCita: descEstadoFinal,
          codigoEstado: codigoEstado, // Guardar también el código para comparaciones
          fechaSolicitud: solicitud.fecha_solicitud || solicitud.fechaSolicitud || new Date().toISOString(),
          fechaAsignacion: solicitud.fecha_asignacion || solicitud.fechaAsignacion || "-",
          // Auditoría: Fecha y usuario del cambio de estado (v3.3.1)
          fechaCambioEstado: solicitud.fecha_cambio_estado || null,
          usuarioCambioEstado: solicitud.nombre_usuario_cambio_estado || null,
        };
      });

      setPacientesAsignados(pacientes);

      // Calculate metrics
      const atendidos = pacientes.filter(p => p.codigoEstado === "ATENDIDO_IPRESS").length;
      const pendientes = pacientes.filter(p => p.codigoEstado === "PENDIENTE").length;

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
    // Callback 2: API call al backend
    async (pacienteId, newStatus) => {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/bolsas/solicitudes/${pacienteId}/estado?nuevoEstadoCodigo=${encodeURIComponent(newStatus)}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el estado");
      }

      // Refrescar datos desde backend para asegurar sincronización
      await fetchPacientesAsignados();
    }
  );

  // Handlers para cambio de estado con Guardar/Cancelar
  const handleGuardarEstado = async () => {
    if (!pacienteEditandoEstado || !nuevoEstadoSeleccionado) {
      toast.error("Por favor selecciona un estado válido");
      return;
    }

    const paciente = pacientesAsignados.find(p => p.id === pacienteEditandoEstado);
    if (!paciente) return;

    setGuardandoEstado(true);

    try {
      // Llama al hook que maneja la lógica de cambio de estado
      const estadoObj = estadosDisponibles.find(e => e.codigo === nuevoEstadoSeleccionado);
      changeStatus(
        pacienteEditandoEstado,
        nuevoEstadoSeleccionado,
        paciente.descEstadoCita || "Sin estado",
        paciente.pacienteNombre
      );

      // Limpiar estado de edición
      setPacienteEditandoEstado(null);
      setNuevoEstadoSeleccionado("");
    } catch (error) {
      console.error("Error guardando estado:", error);
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

      const csvBlob = await response.blob();

      // Descargar archivo
      const element = document.createElement("a");
      const url = URL.createObjectURL(csvBlob);
      element.setAttribute("href", url);
      element.setAttribute(
        "download",
        `pacientes_asignados_${new Date().toISOString().split("T")[0]}.csv`
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);

      toast.success(`Descargados ${selectedRows.size} paciente(s)`);
      setSelectedRows(new Set());
    } catch (error) {
      console.error("Error descargando CSV:", error);
      toast.error("Error al descargar el archivo. Intenta nuevamente.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
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
      paciente.estado === filtroEstado;

    return (
      searchMatch &&
      macrorregionMatch &&
      redMatch &&
      ipressMatch &&
      especialidadMatch &&
      tipoCitaMatch &&
      estadoMatch
    );
  });

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
                <button
                  onClick={() => navigate("/bolsas/solicitudes")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Ir a Asignar Pacientes
                </button>
              </div>
            ) : (
              <>
                {/* 🔍 FILTROS ESPECIALIZADOS */}
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
                    <button
                      onClick={() => setExpandFiltros(!expandFiltros)}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      {expandFiltros ? "Ocultar" : "Mostrar"} filtros
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          expandFiltros ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {expandFiltros && (
                    <div className="space-y-3">
                      {/* Búsqueda */}
                      <div>
                        <input
                          type="text"
                          placeholder="Buscar paciente, DNI o IPRESS..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

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

                      {/* Botón Limpiar */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setFiltroMacrorregion("todas");
                            setFiltroRed("todas");
                            setFiltroIpress("todas");
                            setFiltroEspecialidad("todas");
                            setFiltroTipoCita("todas");
                            setFiltroEstado("todos");
                          }}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          🗑️ Limpiar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                  <thead className="bg-[#0D5BA9] text-white sticky top-0">
                    <tr className="border-b-2 border-blue-800">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedRows.size === pacientesFiltrados.length && pacientesFiltrados.length > 0}
                          onChange={toggleAllRows}
                          className="w-5 h-5 cursor-pointer"
                          title={selectedRows.size === pacientesFiltrados.length ? "Deseleccionar todo" : "Seleccionar todo"}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Fecha Asignación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        DNI Paciente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Nombre Paciente
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                        Edad
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                        Género
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Especialidad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        IPRESS
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Tipo de Cita
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Teléfono 1
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Teléfono 2
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Fecha Cambio Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                        Usuario Cambio Estado
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                        Acciones
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
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(paciente.id)}
                            onChange={() => toggleRowSelection(paciente.id)}
                            className={`w-5 h-5 border-2 rounded cursor-pointer transition-all ${
                              selectedRows.has(paciente.id)
                                ? 'bg-blue-600 border-blue-600 accent-white'
                                : 'border-gray-300 hover:border-blue-400'
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-900 text-xs font-medium">
                          {paciente.fechaAsignacion === "-"
                            ? "-"
                            : new Date(paciente.fechaAsignacion).toLocaleString("es-PE", {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {paciente.pacienteDni}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {paciente.pacienteNombre}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {paciente.pacienteEdad}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {paciente.pacienteSexo}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {paciente.especialidad}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {paciente.descIpress}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {paciente.tipoCita}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {paciente.pacienteTelefono}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {paciente.pacienteTelefonoAlterno}
                        </td>
                        <td className="px-4 py-3">
                          {pacienteEditandoEstado === paciente.id ? (
                            <div className="space-y-2">
                              <select
                                value={nuevoEstadoSeleccionado}
                                onChange={(e) => setNuevoEstadoSeleccionado(e.target.value)}
                                className="w-full px-3 py-1.5 border-2 border-orange-400 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                              >
                                <option value="">Seleccionar estado...</option>
                                {estadosDisponibles.map((est) => (
                                  <option key={est.codigo} value={est.codigo} title={est.descripcion}>
                                    {est.descripcion.split(" - ")[0]}
                                  </option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleGuardarEstado}
                                  disabled={!nuevoEstadoSeleccionado || guardandoEstado}
                                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  {guardandoEstado ? "Guardando..." : "Guardar"}
                                </button>
                                <button
                                  onClick={handleCancelarEstado}
                                  disabled={guardandoEstado}
                                  className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-block ${
                                paciente.codigoEstado === "ATENDIDO_IPRESS"
                                  ? "bg-green-100 text-green-800"
                                  : paciente.codigoEstado === "PENDIENTE"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {paciente.descEstadoCita?.split(" - ")[0] || "Sin estado"}
                              </span>
                              <button
                                onClick={() => {
                                  setPacienteEditandoEstado(paciente.id);
                                  setNuevoEstadoSeleccionado(
                                    estadosDisponibles.find(e => e.descripcion === paciente.descEstadoCita)?.codigo || ""
                                  );
                                }}
                                className="text-blue-600 hover:text-blue-800 ml-2"
                                title="Editar estado"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                        {/* FECHA CAMBIO ESTADO - Auditoría v3.3.1 */}
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {paciente.fechaCambioEstado ? (
                            <span className="text-blue-700 font-medium">
                              {new Date(paciente.fechaCambioEstado).toLocaleString("es-ES")}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        {/* USUARIO CAMBIO ESTADO - Auditoría v3.3.1 */}
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {paciente.usuarioCambioEstado ? (
                            <span className="text-gray-900 font-medium">
                              {paciente.usuarioCambioEstado}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => abrirModalTelefono(paciente)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                            title="Actualizar teléfonos"
                          >
                            📱 Teléfono
                          </button>
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

    </div>
  );
}

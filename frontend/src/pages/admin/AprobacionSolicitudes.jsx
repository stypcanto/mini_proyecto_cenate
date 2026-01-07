// ========================================================================
// 📋 AprobacionSolicitudes.jsx – Panel SUPERADMIN (CENATE 2025)
// ------------------------------------------------------------------------
// Panel profesional para que el SUPERADMIN revise, apruebe o rechace
// las solicitudes de registro de nuevos usuarios.
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  AlertTriangle,
  Filter,
  RefreshCw,
  UserCheck,
  Send,
  Search,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../lib/apiClient";

export default function AprobacionSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("PENDIENTE"); // PENDIENTE, TODAS, APROBADA, RECHAZADA
  const [estadisticas, setEstadisticas] = useState({});
  const [modalRechazo, setModalRechazo] = useState({ open: false, solicitudId: null });
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [modalTipoCorreo, setModalTipoCorreo] = useState({
    open: false,
    idUsuario: null,
    nombreCompleto: "",
    correoPersonal: "",
    correoCorporativo: ""
  });

  // Estados para usuarios pendientes de activación
  const [vistaActual, setVistaActual] = useState("solicitudes"); // "solicitudes" o "pendientes-activacion"
  const [usuariosPendientes, setUsuariosPendientes] = useState([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(null); // ID del usuario al que se está enviando
  const [eliminandoUsuario, setEliminandoUsuario] = useState(null); // ID del usuario que se está eliminando
  const [busquedaPendientes, setBusquedaPendientes] = useState(""); // Búsqueda por nombre o documento

  // Estados para filtros adicionales
  const [filtroIpress, setFiltroIpress] = useState(""); // Filtro por IPRESS
  const [filtroFechaDesde, setFiltroFechaDesde] = useState(""); // Filtro fecha desde
  const [filtroFechaHasta, setFiltroFechaHasta] = useState(""); // Filtro fecha hasta

  // Estados para selección múltiple
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [procesandoMasivo, setProcesandoMasivo] = useState(false);

  // Estados para validación de usuarios duplicados
  const [usuariosDuplicados, setUsuariosDuplicados] = useState({}); // {solicitudId: existe}
  const [verificandoUsuarios, setVerificandoUsuarios] = useState(new Set()); // Set de IDs en verificación

  // Cargar solicitudes cuando cambia el filtro (solo en vista solicitudes)
  useEffect(() => {
    if (vistaActual === "solicitudes") {
      cargarSolicitudes();
      cargarEstadisticas();
    }
  }, [filtro]);

  // Cargar usuarios pendientes cuando cambia a esa vista
  useEffect(() => {
    if (vistaActual === "pendientes-activacion") {
      cargarUsuariosPendientes();
    }
  }, [vistaActual]);

  // Verificar existencia de usuarios cuando carguen las solicitudes
  useEffect(() => {
    if (vistaActual === "solicitudes" && solicitudes.length > 0) {
      solicitudes.forEach((solicitud) => {
        if (
          solicitud.estado === "PENDIENTE" &&
          !usuariosDuplicados.hasOwnProperty(solicitud.idSolicitud) &&
          !verificandoUsuarios.has(solicitud.idSolicitud)
        ) {
          verificarExistenciaUsuario(solicitud.idSolicitud);
        }
      });
    }
  }, [solicitudes, vistaActual]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const endpoint =
        filtro === "PENDIENTE"
          ? "/admin/solicitudes-registro/pendientes"
          : "/admin/solicitudes-registro";
      const data = await apiClient.get(endpoint, true);

      // Filtrar en el frontend si se seleccionó un estado específico
      let filtradas = data;
      if (filtro !== "TODAS") {
        // Convertir filtro frontend a estado backend
        const estadoBackend = filtro === "APROBADA" ? "APROBADO" : 
                             filtro === "RECHAZADA" ? "RECHAZADO" : filtro;
        filtradas = data.filter((s) => s.estado === estadoBackend);
      }

      setSolicitudes(filtradas);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      toast.error("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await apiClient.get("/admin/solicitudes-registro/estadisticas", true);
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Verificar existencia de un usuario antes de aprobar la solicitud
  const verificarExistenciaUsuario = async (solicitudId) => {
    try {
      setVerificandoUsuarios((prev) => new Set(prev).add(solicitudId));

      const response = await apiClient.get(
        `/admin/solicitudes-registro/${solicitudId}/validar-usuario`,
        true
      );

      const existe = response.existe || false;
      setUsuariosDuplicados((prev) => ({
        ...prev,
        [solicitudId]: existe,
      }));

      if (existe) {
        console.warn(
          `⚠️ Usuario duplicado detectado: ${response.username} (Solicitud ID: ${solicitudId})`
        );
      }
    } catch (error) {
      console.error("Error verificando existencia de usuario:", error);
      // En caso de error, asumimos que el usuario NO existe para permitir continuar
      setUsuariosDuplicados((prev) => ({
        ...prev,
        [solicitudId]: false,
      }));
    } finally {
      setVerificandoUsuarios((prev) => {
        const newSet = new Set(prev);
        newSet.delete(solicitudId);
        return newSet;
      });
    }
  };

  // Cargar usuarios que fueron aprobados pero no han activado su cuenta
  const cargarUsuariosPendientes = async () => {
    try {
      setLoadingPendientes(true);
      const data = await apiClient.get("/admin/usuarios/pendientes-activacion", true);
      setUsuariosPendientes(data || []);
    } catch (error) {
      console.error("Error al cargar usuarios pendientes:", error);
      toast.error("Error al cargar usuarios pendientes de activación");
    } finally {
      setLoadingPendientes(false);
    }
  };

  // Abrir modal de selección de tipo de correo
  const abrirModalTipoCorreo = (usuario) => {
    setModalTipoCorreo({
      open: true,
      idUsuario: usuario.idUsuario,
      nombreCompleto: usuario.nombreCompleto,
      correoPersonal: usuario.correoPersonal || "",
      correoCorporativo: usuario.correoInstitucional || ""
    });
  };

  // Reenviar email de activación a un usuario con tipo de correo específico
  const reenviarEmailActivacion = async (tipoCorreo) => {
    const { idUsuario, nombreCompleto } = modalTipoCorreo;

    try {
      setEnviandoEmail(idUsuario);
      setModalTipoCorreo({ ...modalTipoCorreo, open: false });

      const response = await apiClient.post(
        `/admin/usuarios/${idUsuario}/reenviar-activacion`,
        { tipoCorreo },
        true
      );

      if (response.success) {
        toast.success(`Correo de activación enviado exitosamente a ${tipoCorreo === "PERSONAL" ? "correo personal" : "correo corporativo"}`);
      } else {
        toast.error(response.error || "No se pudo enviar el correo");
      }
    } catch (error) {
      console.error("Error al reenviar email:", error);
      toast.error(error.message || "Error al reenviar el correo de activación");
    } finally {
      setEnviandoEmail(null);
      setModalTipoCorreo({
        open: false,
        idUsuario: null,
        nombreCompleto: "",
        correoPersonal: "",
        correoCorporativo: ""
      });
    }
  };

  // Eliminar usuario pendiente de activación (para que pueda volver a registrarse)
  const eliminarUsuarioPendiente = async (idUsuario, nombreCompleto) => {
    if (!window.confirm(
      `¿Está seguro de eliminar al usuario "${nombreCompleto}"?\n\n` +
      `Esta acción eliminará la cuenta del usuario y podrá volver a registrarse.\n\n` +
      `⚠️ Esta acción no se puede deshacer.`
    )) {
      return;
    }

    try {
      setEliminandoUsuario(idUsuario);
      await apiClient.delete(`/admin/usuarios/${idUsuario}/pendiente-activacion`, true);

      toast.success("Usuario eliminado. Ahora puede volver a registrarse.");
      // Recargar la lista
      cargarUsuariosPendientes();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error(error.message || "Error al eliminar el usuario");
    } finally {
      setEliminandoUsuario(null);
    }
  };

  // Obtener lista única de IPRESS para el filtro
  const listaIpress = useMemo(() => {
    const ipressSet = new Set();
    usuariosPendientes.forEach(u => {
      if (u.ipress) ipressSet.add(u.ipress);
    });
    return Array.from(ipressSet).sort();
  }, [usuariosPendientes]);

  // Filtrar usuarios pendientes según búsqueda y filtros
  const usuariosFiltrados = useMemo(() => {
    let resultados = [...usuariosPendientes];

    // Filtro por búsqueda de texto
    if (busquedaPendientes) {
      const term = busquedaPendientes.toLowerCase();
      resultados = resultados.filter(u =>
        (u.nombreCompleto?.toLowerCase() || '').includes(term) ||
        (u.username?.toLowerCase() || '').includes(term) ||
        (u.correoPersonal?.toLowerCase() || '').includes(term) ||
        (u.correoInstitucional?.toLowerCase() || '').includes(term) ||
        (u.telefono?.toLowerCase() || '').includes(term) ||
        (u.ipress?.toLowerCase() || '').includes(term)
      );
    }

    // Filtro por IPRESS
    if (filtroIpress) {
      resultados = resultados.filter(u => u.ipress === filtroIpress);
    }

    // Filtro por fecha desde
    if (filtroFechaDesde) {
      const fechaDesde = new Date(filtroFechaDesde);
      fechaDesde.setHours(0, 0, 0, 0);
      resultados = resultados.filter(u => {
        if (!u.fechaCreacion) return false;
        const fechaUsuario = new Date(u.fechaCreacion);
        fechaUsuario.setHours(0, 0, 0, 0);
        return fechaUsuario >= fechaDesde;
      });
    }

    // Filtro por fecha hasta
    if (filtroFechaHasta) {
      const fechaHasta = new Date(filtroFechaHasta);
      fechaHasta.setHours(23, 59, 59, 999);
      resultados = resultados.filter(u => {
        if (!u.fechaCreacion) return false;
        const fechaUsuario = new Date(u.fechaCreacion);
        return fechaUsuario <= fechaHasta;
      });
    }

    return resultados;
  }, [usuariosPendientes, busquedaPendientes, filtroIpress, filtroFechaDesde, filtroFechaHasta]);

  // Limpiar selección cuando cambia la búsqueda o los datos
  useEffect(() => {
    setSeleccionados(new Set());
  }, [busquedaPendientes, usuariosPendientes]);

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroIpress("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setBusquedaPendientes("");
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtroIpress || filtroFechaDesde || filtroFechaHasta;

  // Funciones de selección
  const toggleSeleccion = (idUsuario) => {
    setSeleccionados(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idUsuario)) {
        newSet.delete(idUsuario);
      } else {
        newSet.add(idUsuario);
      }
      return newSet;
    });
  };

  const seleccionarTodos = () => {
    if (seleccionados.size === usuariosFiltrados.length) {
      // Deseleccionar todos
      setSeleccionados(new Set());
    } else {
      // Seleccionar todos los filtrados
      setSeleccionados(new Set(usuariosFiltrados.map(u => u.idUsuario)));
    }
  };

  // Acciones masivas
  const reenviarEmailsMasivo = async () => {
    const usuariosConCorreo = usuariosFiltrados.filter(
      u => seleccionados.has(u.idUsuario) && (u.correoPersonal || u.correoInstitucional)
    );

    if (usuariosConCorreo.length === 0) {
      toast.error("No hay usuarios seleccionados con correo registrado");
      return;
    }

    if (!window.confirm(
      `¿Desea reenviar el correo de activación a ${usuariosConCorreo.length} usuario(s)?`
    )) {
      return;
    }

    setProcesandoMasivo(true);
    let exitosos = 0;
    let fallidos = 0;

    for (const usuario of usuariosConCorreo) {
      try {
        await apiClient.post(`/admin/usuarios/${usuario.idUsuario}/reenviar-activacion`, {}, true);
        exitosos++;
      } catch (error) {
        console.error(`Error al reenviar a ${usuario.nombreCompleto}:`, error);
        fallidos++;
      }
    }

    setProcesandoMasivo(false);
    setSeleccionados(new Set());

    if (exitosos > 0 && fallidos === 0) {
      toast.success(`Se enviaron ${exitosos} correo(s) exitosamente`);
    } else if (exitosos > 0 && fallidos > 0) {
      toast.success(`Se enviaron ${exitosos} correo(s), ${fallidos} fallaron`);
    } else {
      toast.error("No se pudo enviar ningún correo");
    }
  };

  const eliminarMasivo = async () => {
    const usuariosSeleccionados = usuariosFiltrados.filter(u => seleccionados.has(u.idUsuario));

    if (usuariosSeleccionados.length === 0) {
      toast.error("No hay usuarios seleccionados");
      return;
    }

    if (!window.confirm(
      `⚠️ ¿Está seguro de eliminar ${usuariosSeleccionados.length} usuario(s)?\n\n` +
      `Esta acción eliminará las cuentas de los usuarios y podrán volver a registrarse.\n\n` +
      `Esta acción NO se puede deshacer.`
    )) {
      return;
    }

    setProcesandoMasivo(true);
    let exitosos = 0;
    let fallidos = 0;

    for (const usuario of usuariosSeleccionados) {
      try {
        await apiClient.delete(`/admin/usuarios/${usuario.idUsuario}/pendiente-activacion`, true);
        exitosos++;
      } catch (error) {
        console.error(`Error al eliminar ${usuario.nombreCompleto}:`, error);
        fallidos++;
      }
    }

    setProcesandoMasivo(false);
    setSeleccionados(new Set());
    cargarUsuariosPendientes();

    if (exitosos > 0 && fallidos === 0) {
      toast.success(`Se eliminaron ${exitosos} usuario(s) exitosamente`);
    } else if (exitosos > 0 && fallidos > 0) {
      toast.success(`Se eliminaron ${exitosos} usuario(s), ${fallidos} fallaron`);
    } else {
      toast.error("No se pudo eliminar ningún usuario");
    }
  };

  const aprobarSolicitud = async (id) => {
    if (!window.confirm("¿Está seguro de aprobar esta solicitud?\n\nSe creará el usuario y se enviará un correo con un enlace para que configure su contraseña de forma segura.")) {
      return;
    }

    try {
      await apiClient.put(`/admin/solicitudes-registro/${id}/aprobar`, {}, true);
      toast.success("Solicitud aprobada. Se envió un correo con el enlace de activación.");
      cargarSolicitudes();
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al aprobar solicitud:", error);
      toast.error(error.response?.data?.error || "Error al aprobar la solicitud");
    }
  };

  const rechazarSolicitud = async () => {
    if (!motivoRechazo.trim()) {
      toast.error("Debe ingresar un motivo de rechazo");
      return;
    }

    try {
      await apiClient.put(`/admin/solicitudes-registro/${modalRechazo.solicitudId}/rechazar`, {
        motivo: motivoRechazo,
      }, true);
      toast.success("Solicitud rechazada exitosamente");
      setModalRechazo({ open: false, solicitudId: null });
      setMotivoRechazo("");
      cargarSolicitudes();
      cargarEstadisticas();
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
      toast.error(error.response?.data?.error || "Error al rechazar la solicitud");
    }
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "APROBADO":
      case "APROBADA":
        return "bg-green-100 text-green-800 border-green-300";
      case "RECHAZADO":
      case "RECHAZADA":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "APROBADO":
      case "APROBADA":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "RECHAZADO":
      case "RECHAZADA":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {vistaActual === "solicitudes"
              ? "Aprobación de Solicitudes"
              : "Usuarios Pendientes de Activación"}
          </h1>
          <p className="text-slate-600 mt-1">
            {vistaActual === "solicitudes"
              ? "Revise y apruebe las solicitudes de registro de nuevos usuarios"
              : "Usuarios aprobados que aún no han configurado su contraseña"}
          </p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setVistaActual("solicitudes")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            vistaActual === "solicitudes"
              ? "bg-white text-[#0A5BA9] shadow-md"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          Solicitudes de Registro
        </button>
        <button
          onClick={() => setVistaActual("pendientes-activacion")}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            vistaActual === "pendientes-activacion"
              ? "bg-white text-orange-600 shadow-md"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Pendientes de Activación
          {usuariosPendientes.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {usuariosPendientes.length}
            </span>
          )}
        </button>
      </div>

      {/* ===== VISTA: SOLICITUDES DE REGISTRO ===== */}
      {vistaActual === "solicitudes" && (
        <>
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 font-semibold text-sm uppercase tracking-wide">
                Pendientes
              </p>
              <p className="text-4xl font-bold text-yellow-900 mt-2">
                {estadisticas.pendientes || 0}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold text-sm uppercase tracking-wide">
                Aprobadas
              </p>
              <p className="text-4xl font-bold text-green-900 mt-2">
                {estadisticas.aprobadas || 0}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-600 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-semibold text-sm uppercase tracking-wide">
                Rechazadas
              </p>
              <p className="text-4xl font-bold text-red-900 mt-2">
                {estadisticas.rechazadas || 0}
              </p>
            </div>
            <XCircle className="w-12 h-12 text-red-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">Filtrar por:</span>
          {["PENDIENTE", "TODAS", "APROBADA", "RECHAZADA"].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtro === estado
                  ? "bg-[#0A5BA9] text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Solicitudes */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-[#0A5BA9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No hay solicitudes {filtro.toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.idSolicitud}
              className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header con estado */}
                  <div className="flex items-center gap-3">
                    {getIconoEstado(solicitud.estado)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(
                        solicitud.estado
                      )}`}
                    >
                      {solicitud.estado}
                    </span>
                    <span className="text-sm text-slate-500">
                      Solicitud #{solicitud.idSolicitud}
                    </span>
                    <span className="text-sm text-slate-400">
                      {new Date(solicitud.createdAt).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Información del solicitante */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">
                          {solicitud.nombres} {solicitud.apellidoPaterno}{" "}
                          {solicitud.apellidoMaterno}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium">{solicitud.tipoDocumento}:</span>
                        <span>{solicitud.numeroDocumento}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600">
                          {solicitud.correoPersonal}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600">{solicitud.telefono}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-700">
                          {solicitud.nombreIpress}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600">
                          Nacimiento:{" "}
                          {new Date(solicitud.fechaNacimiento).toLocaleDateString("es-PE")}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Género:</span> {solicitud.genero === "M" ? "Masculino" : "Femenino"}
                      </div>
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">Tipo:</span> {solicitud.tipoPersonal}
                      </div>
                    </div>
                  </div>

                  {/* Motivo de rechazo (si existe) */}
                  {(solicitud.estado === "RECHAZADO" || solicitud.estado === "RECHAZADA") && solicitud.motivoRechazo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">Motivo de rechazo:</span>{" "}
                        {solicitud.motivoRechazo}
                      </p>
                    </div>
                  )}

                  {/* Verificación de duplicado de usuario (PENDIENTE) */}
                  {solicitud.estado === "PENDIENTE" && (
                    <div className="mt-4">
                      {verificandoUsuarios.has(solicitud.idSolicitud) ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Verificando usuario...
                        </div>
                      ) : usuariosDuplicados[solicitud.idSolicitud] ? (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-800">Advertencia: Usuario Duplicado</p>
                            <p className="text-xs text-red-700 mt-1">
                              Ya existe un usuario con el nombre de usuario <code className="bg-red-100 px-1 rounded font-mono">{solicitud.numeroDocumento}</code>
                            </p>
                            <p className="text-xs text-red-600 mt-2">
                              ⚠️ No se puede aprobar esta solicitud hasta que el usuario duplicado sea identificado y resuelto.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded">
                          <CheckCircle2 className="w-4 h-4" />
                          Usuario disponible - Puede proceder con la aprobación
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Botones de acción (solo para pendientes) */}
                {solicitud.estado === "PENDIENTE" && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => aprobarSolicitud(solicitud.idSolicitud)}
                      disabled={usuariosDuplicados[solicitud.idSolicitud] === true}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md
                        ${
                          usuariosDuplicados[solicitud.idSolicitud]
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      title={
                        usuariosDuplicados[solicitud.idSolicitud]
                          ? "No se puede aprobar: usuario duplicado detectado"
                          : "Aprobar solicitud"
                      }
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() =>
                        setModalRechazo({ open: true, solicitudId: solicitud.idSolicitud })
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {/* ===== VISTA: USUARIOS PENDIENTES DE ACTIVACIÓN ===== */}
      {vistaActual === "pendientes-activacion" && (
        <>
          {/* Info card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              <UserCheck className="w-10 h-10 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-orange-900">
                  Usuarios Aprobados Pendientes de Activación
                </h3>
                <p className="text-orange-700 text-sm mt-1">
                  Estos usuarios fueron aprobados pero aún no han configurado su contraseña.
                  Puede reenviarles el correo de activación si no lo recibieron.
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={cargarUsuariosPendientes}
                  className="p-2 bg-orange-200 hover:bg-orange-300 rounded-lg transition-colors"
                  title="Recargar lista"
                >
                  <RefreshCw className={`w-5 h-5 text-orange-700 ${loadingPendientes ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Buscador */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento, teléfono o IPRESS..."
                value={busquedaPendientes}
                onChange={(e) => setBusquedaPendientes(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all"
              />
              {busquedaPendientes && (
                <button
                  onClick={() => setBusquedaPendientes("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            {busquedaPendientes && (
              <p className="text-sm text-slate-500 mt-2">
                Mostrando {usuariosFiltrados.length} de {usuariosPendientes.length} usuarios
              </p>
            )}
          </div>

          {/* Filtros Adicionales */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-700">Filtros Avanzados</h3>
              {hayFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="ml-auto text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por IPRESS */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  IPRESS
                </label>
                <select
                  value={filtroIpress}
                  onChange={(e) => setFiltroIpress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all text-sm"
                >
                  <option value="">Todas las IPRESS</option>
                  {listaIpress.map((ipress) => (
                    <option key={ipress} value={ipress}>
                      {ipress}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por fecha desde */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all text-sm"
                />
              </div>

              {/* Filtro por fecha hasta */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Indicador de resultados filtrados */}
            {hayFiltrosActivos && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Mostrando <span className="font-semibold text-orange-600">{usuariosFiltrados.length}</span> de <span className="font-semibold">{usuariosPendientes.length}</span> usuarios
                  {filtroIpress && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">IPRESS: {filtroIpress}</span>}
                  {filtroFechaDesde && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Desde: {new Date(filtroFechaDesde).toLocaleDateString('es-PE')}</span>}
                  {filtroFechaHasta && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Hasta: {new Date(filtroFechaHasta).toLocaleDateString('es-PE')}</span>}
                </p>
              </div>
            )}
          </div>

          {/* Barra de acciones masivas */}
          {seleccionados.size > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <CheckSquare className="w-5 h-5" />
                <span className="font-medium">
                  {seleccionados.size} usuario{seleccionados.size > 1 ? 's' : ''} seleccionado{seleccionados.size > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={reenviarEmailsMasivo}
                  disabled={procesandoMasivo}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesandoMasivo ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Reenviar Emails
                </button>
                <button
                  onClick={eliminarMasivo}
                  disabled={procesandoMasivo}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesandoMasivo ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Eliminar
                </button>
                <button
                  onClick={() => setSeleccionados(new Set())}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de usuarios pendientes */}
          {loadingPendientes ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : usuariosPendientes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">Todos los usuarios han activado su cuenta</p>
              <p className="text-slate-400 text-sm mt-2">No hay usuarios pendientes de activación</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No se encontraron resultados</p>
              <p className="text-slate-400 text-sm mt-2">No hay usuarios que coincidan con "{busquedaPendientes}"</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-4 text-center">
                        <button
                          onClick={seleccionarTodos}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title={seleccionados.size === usuariosFiltrados.length ? "Deseleccionar todos" : "Seleccionar todos"}
                        >
                          {seleccionados.size === 0 ? (
                            <Square className="w-5 h-5 text-slate-400" />
                          ) : seleccionados.size === usuariosFiltrados.length ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <MinusSquare className="w-5 h-5 text-blue-600" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        IPRESS
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Correo
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {usuariosFiltrados.map((usuario) => (
                      <tr
                        key={usuario.idUsuario}
                        className={`hover:bg-slate-50 transition-colors ${
                          seleccionados.has(usuario.idUsuario) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleSeleccion(usuario.idUsuario)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            {seleccionados.has(usuario.idUsuario) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {usuario.nombreCompleto}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {usuario.idUsuario}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600 font-mono">{usuario.username}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-600" title={usuario.telefono || 'Sin teléfono'}>
                              {usuario.telefono || <span className="text-slate-400 italic">Sin teléfono</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-600 truncate max-w-[200px]" title={usuario.ipress || 'Sin IPRESS'}>
                              {usuario.ipress || <span className="text-slate-400 italic">Sin IPRESS</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-600 truncate max-w-[180px]" title={usuario.correoPersonal || usuario.correoInstitucional || 'Sin correo'}>
                              {usuario.correoPersonal || usuario.correoInstitucional || <span className="text-slate-400 italic">Sin correo</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600">
                            {usuario.fechaCreacion
                              ? new Date(usuario.fechaCreacion).toLocaleDateString("es-PE", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalTipoCorreo(usuario)}
                              disabled={enviandoEmail === usuario.idUsuario || (!usuario.correoPersonal && !usuario.correoInstitucional)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                enviandoEmail === usuario.idUsuario
                                  ? 'bg-gray-200 text-gray-500 cursor-wait'
                                  : (!usuario.correoPersonal && !usuario.correoInstitucional)
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
                              }`}
                              title={(!usuario.correoPersonal && !usuario.correoInstitucional) ? 'Usuario sin correo registrado' : 'Reenviar correo de activación'}
                            >
                              {enviandoEmail === usuario.idUsuario ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => eliminarUsuarioPendiente(usuario.idUsuario, usuario.nombreCompleto)}
                              disabled={eliminandoUsuario === usuario.idUsuario}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                eliminandoUsuario === usuario.idUsuario
                                  ? 'bg-gray-200 text-gray-500 cursor-wait'
                                  : 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                              }`}
                              title="Eliminar usuario para que pueda volver a registrarse"
                            >
                              {eliminandoUsuario === usuario.idUsuario ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Rechazo */}
      {modalRechazo.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Rechazar Solicitud</h3>
            <p className="text-slate-600 mb-4">
              Por favor, indique el motivo del rechazo:
            </p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ej: Documentación incompleta, datos incorrectos, etc."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/30 outline-none resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setModalRechazo({ open: false, solicitudId: null });
                  setMotivoRechazo("");
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={rechazarSolicitud}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Tipo de Correo */}
      {modalTipoCorreo.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-8 h-8 text-orange-600" />
              <h3 className="text-xl font-bold text-slate-800">Seleccionar Tipo de Correo</h3>
            </div>

            <p className="text-slate-600 mb-6">
              ¿A qué correo desea reenviar el enlace de activación para <span className="font-semibold">{modalTipoCorreo.nombreCompleto}</span>?
            </p>

            <div className="space-y-3">
              {/* Opción: Correo Personal */}
              {modalTipoCorreo.correoPersonal ? (
                <button
                  onClick={() => reenviarEmailActivacion("PERSONAL")}
                  className="w-full flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-blue-900 text-sm">Correo Personal</p>
                    <p className="text-blue-700 text-xs mt-0.5 break-all">{modalTipoCorreo.correoPersonal}</p>
                  </div>
                </button>
              ) : (
                <div className="w-full flex items-start gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl opacity-60 cursor-not-allowed">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-500 text-sm">Correo Personal</p>
                    <p className="text-gray-400 text-xs mt-0.5">No registrado</p>
                  </div>
                </div>
              )}

              {/* Opción: Correo Corporativo */}
              {modalTipoCorreo.correoCorporativo ? (
                <button
                  onClick={() => reenviarEmailActivacion("CORPORATIVO")}
                  className="w-full flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-green-900 text-sm">Correo Corporativo</p>
                    <p className="text-green-700 text-xs mt-0.5 break-all">{modalTipoCorreo.correoCorporativo}</p>
                  </div>
                </button>
              ) : (
                <div className="w-full flex items-start gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl opacity-60 cursor-not-allowed">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-500 text-sm">Correo Corporativo</p>
                    <p className="text-gray-400 text-xs mt-0.5">No registrado</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setModalTipoCorreo({
                  open: false,
                  idUsuario: null,
                  nombreCompleto: "",
                  correoPersonal: "",
                  correoCorporativo: ""
                })}
                className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
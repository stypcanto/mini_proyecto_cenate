// ========================================================================
// FormularioSolicitudTurnos.jsx - Componente Principal
// ------------------------------------------------------------------------
// ✅ FUNCIONALIDADES IMPLEMENTADAS:
// 1) Filtros: Tipo de periodo (VIGENTES vs ACTIVOS), Año (2025/2026/2027),
//    Periodo (depende del año y tipo), Estado (de la solicitud).
// 2) Tabla por periodo: Año, Periodo, Solicitud, Inicio, Fin, Estado, Acción.
// 3) Al INICIAR (o EDITAR) NO aparece combo de periodo: se muestra tarjeta detalle
//    (inicio/fin/creación/actualización/envío/estado/periodo).
// 4) Registro de turnos - INTERFAZ DE TABLA INTERACTIVA (v2.0):
//    - Tabla con todas las especialidades disponibles
//    - Columnas: Especialidad, Turno TM, Turnos Mañana, Turnos Tarde,
//      Teleconsultorio, Teleconsulta, Total Turnos, Fecha, Estado
//    - Inputs numéricos editables para configurar turnos por especialidad
//    - Toggles para activar/desactivar Teleconsultorio y Teleconsulta
//    - Cálculo automático del total de turnos
//    - Estados visuales con badges de color
// 5) Mantiene services existentes (solicitudTurnoService / periodoSolicitudService).
// ========================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Save,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
} from "lucide-react";

import { periodoSolicitudService } from "../../../../services/periodoSolicitudService";
import { solicitudTurnoService } from "../../../../services/solicitudTurnoService";

// Componentes separados
import Modal from "./components/Modal";
import PeriodoDetalleCard from "./components/PeriodoDetalleCard";
import TablaSolicitudEspecialidades from "./components/TablaSolicitudEspecialidades";
import VistaSolicitudEnviada from "./components/VistaSolicitudEnviada";

// Utilidades
import { formatFecha, getYearFromPeriodo, estadoBadgeClass } from "./utils/helpers";

/** =======================================================================
 * COMPONENTE PRINCIPAL
 * ======================================================================= */
export default function FormularioSolicitudTurnos() {
  // estados generales
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // datos usuario
  const [miIpress, setMiIpress] = useState(null);

  // periodos
  const [tipoPeriodos, setTipoPeriodos] = useState("VIGENTES"); // VIGENTES | ACTIVOS
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  // especialidades
  const [especialidades, setEspecialidades] = useState([]);

  // solicitudes del usuario (listado)
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loadingTabla, setLoadingTabla] = useState(false);

  // filtros tabla
  const [filtroAnio, setFiltroAnio] = useState("2026");
  const [filtroPeriodoId, setFiltroPeriodoId] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("ALL");

  // modal
  const [openFormModal, setOpenFormModal] = useState(false);
  const [modoModal, setModoModal] = useState("NUEVA"); // NUEVA | EDITAR | VER

  // periodo seleccionado
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [periodoForzado, setPeriodoForzado] = useState(false);

  // solicitud actual
  const [solicitudActual, setSolicitudActual] = useState(null);

  // registros de turnos por especialidad
  // registro = {idServicio, turnoTM, turnoManana, turnoTarde, tc, tl, fecha, estado}
  const [registros, setRegistros] = useState([]);

  // =====================================================================
  // Periodos: VIGENTES y ACTIVOS (según tu endpoint)
  // =====================================================================
  const cargarPeriodos = useCallback(async () => {
    setLoadingPeriodos(true);
    try {
      let data = [];
      if (tipoPeriodos === "VIGENTES") {
        data = await periodoSolicitudService.obtenerVigentes();
      } else {
        data = await periodoSolicitudService.obtenerActivos();
      }

      setPeriodos(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(e);
      setPeriodos([]);
      return [];
    } finally {
      setLoadingPeriodos(false);
    }
  }, [tipoPeriodos]);

  // =====================================================================
  // Tabla solicitudes (tu servicio)
  // =====================================================================
  const refrescarMisSolicitudes = useCallback(async () => {
    setLoadingTabla(true);
    try {
      const data = await solicitudTurnoService.listarMisSolicitudes();
      setMisSolicitudes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMisSolicitudes([]);
    } finally {
      setLoadingTabla(false);
    }
  }, []);

  const handleRefreshAll = useCallback(async () => {
    setError(null);
    setSuccess(null);
    await Promise.all([refrescarMisSolicitudes(), cargarPeriodos()]);
  }, [refrescarMisSolicitudes, cargarPeriodos]);

  // =====================================================================
  // Inicialización
  // =====================================================================
  const inicializar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ipressData, especialidadesData] = await Promise.all([
        solicitudTurnoService.obtenerMiIpress(),
        solicitudTurnoService.obtenerEspecialidadesCenate(),
      ]);

      setMiIpress(ipressData);
      setEspecialidades(Array.isArray(especialidadesData) ? especialidadesData : []);

      await Promise.all([cargarPeriodos(), refrescarMisSolicitudes()]);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [cargarPeriodos, refrescarMisSolicitudes]);

  useEffect(() => {
    inicializar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recargar periodos si cambias tipo
  useEffect(() => {
    cargarPeriodos();
  }, [tipoPeriodos, cargarPeriodos]);

  // =====================================================================
  // Index solicitud por periodo
  // =====================================================================
  const solicitudPorPeriodo = useMemo(() => {
    const map = new Map();
    (misSolicitudes || []).forEach((s) => {
      if (s?.idPeriodo != null) map.set(Number(s.idPeriodo), s);
    });
    return map;
  }, [misSolicitudes]);

  const aniosDisponibles = useMemo(() => ["2025", "2026", "2027"], []);

  const periodosPorAnio = useMemo(() => {
    const arr = Array.isArray(periodos) ? periodos : [];
    if (!filtroAnio) return arr;
    return arr.filter((p) => getYearFromPeriodo(p) === String(filtroAnio));
  }, [periodos, filtroAnio]);

  const filasPorPeriodo = useMemo(() => {
    let base = Array.isArray(periodos) ? [...periodos] : [];

    if (filtroAnio) base = base.filter((p) => getYearFromPeriodo(p) === String(filtroAnio));
    if (filtroPeriodoId) base = base.filter((p) => String(p.idPeriodo) === String(filtroPeriodoId));

    let rows = base.map((p) => {
      const sol = solicitudPorPeriodo.get(Number(p.idPeriodo)) || null;
      return {
        anio: getYearFromPeriodo(p) || "—",
        idPeriodo: p.idPeriodo,
        periodoLabel: p.descripcion || p.periodo || `Periodo #${p.idPeriodo}`,
        periodoCode: p.periodo || "",
        fechaInicio: p.fechaInicio || null,
        fechaFin: p.fechaFin || null,
        solicitud: sol,
        estado: sol?.estado || "SIN_SOLICITUD",
        periodoObj: p,
      };
    });

    if (filtroEstado && filtroEstado !== "ALL") rows = rows.filter((r) => r.estado === filtroEstado);

    // orden por fechaInicio desc
    rows.sort((a, b) => {
      const da = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
      const db = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
      return db - da;
    });

    return rows;
  }, [periodos, filtroAnio, filtroPeriodoId, filtroEstado, solicitudPorPeriodo]);

  // =====================================================================
  // Abrir modal desde fila periodo (Iniciar/Editar/Ver)
  // =====================================================================
  const abrirSolicitudDesdeTabla = async (rowSolicitud) => {
    setError(null);
    setSuccess(null);

    const modo = rowSolicitud.estado === "BORRADOR" ? "EDITAR" : "VER";
    setModoModal(modo);
    setOpenFormModal(true);
    setLoading(true);

    try {
      const solicitud = await solicitudTurnoService.obtenerPorId(rowSolicitud.idSolicitud);
      setSolicitudActual(solicitud);

      // set periodo + bloquear selección
      const p = (periodos || []).find((x) => Number(x.idPeriodo) === Number(solicitud.idPeriodo));
      setPeriodoSeleccionado(
        p || {
          idPeriodo: solicitud.idPeriodo,
          periodo: "",
          descripcion: solicitud.periodoDescripcion,
          fechaInicio: null,
          fechaFin: null,
        }
      );

      // VER: solo lectura (no armamos calendario)
      if (solicitud.estado !== "BORRADOR") {
        setRegistros([]);
        return;
      }

      // EDITAR BORRADOR: Cargar detalles de la solicitud
      if (solicitud.detalles && Array.isArray(solicitud.detalles)) {
        const registrosExistentes = solicitud.detalles.map((det) => ({
          idDetalle: det.idDetalle || null,          // ID del detalle para ediciones
          idServicio: det.idServicio,
          turnoTM: det.turnoTM || 0,
          turnoManana: det.turnoManana || 0,
          turnoTarde: det.turnoTarde || 0,
          tc: det.tc !== undefined ? det.tc : true,
          tl: det.tl !== undefined ? det.tl : true,
          estado: det.estado || "PENDIENTE",
          // Cargar fechas específicas desde detalle_solicitud_turno_fecha
          // det.fechasDetalle = [{fecha: "2026-01-21", bloque: "MANANA", turnos: 2}, ...]
          fechas: (det.fechasDetalle || []).map(f => ({
            fecha: f.fecha,
            turno: f.bloque,                         // "MANANA" o "TARDE"
            id: `${f.fecha}-${f.bloque}`
          }))
        }));
        setRegistros(registrosExistentes);
      } else {
        setRegistros([]);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el detalle de la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const abrirDesdePeriodo = async (fila) => {
    setError(null);
    setSuccess(null);

    // periodo fijo (sin combo)
    setPeriodoForzado(true);

    // set periodo seleccionado desde fila (directo)
    setPeriodoSeleccionado(fila.periodoObj);

    // reset registros
    setRegistros([]);

    // si ya existe solicitud, abrirla
    if (fila?.solicitud?.idSolicitud) {
      return abrirSolicitudDesdeTabla(fila.solicitud);
    }

    // no existe => iniciar
    setModoModal("NUEVA");
    setSolicitudActual(null);
    setOpenFormModal(true);
  };

  const abrirNuevaSolicitud = async () => {
    setPeriodoForzado(false);
    setError(null);
    setSuccess(null);

    setModoModal("NUEVA");
    setSolicitudActual(null);
    setPeriodoSeleccionado(null);
    setRegistros([]);

    setOpenFormModal(true);
    await cargarPeriodos();
  };

  const cerrarModal = async () => {
    setOpenFormModal(false);
    setSaving(false);
    setPeriodoForzado(false);

    await refrescarMisSolicitudes();
  };

  // =====================================================================
  // Solo lectura?
  // =====================================================================
  const esSoloLectura =
    modoModal === "VER" ||
    solicitudActual?.estado === "ENVIADO" ||
    solicitudActual?.estado === "REVISADO" ||
    solicitudActual?.estado === "APROBADA" ||
    solicitudActual?.estado === "RECHAZADA";

  // =====================================================================
  // Payload (para enviar/guardar) - Nuevo formato de tabla
  // =====================================================================
  const buildPayload = () => {
    if (!periodoSeleccionado?.idPeriodo) return null;

    // Estructura: Solicitud -> Detalles (por especialidad)
    // Las fechas se guardan con su propio endpoint (handleAutoGuardarFechas)
    const todosLosDetalles = (registros || []).map((r) => {
      const turnoManana = Number(r.turnoManana || 0);
      const turnoTarde = Number(r.turnoTarde || 0);
      const turnoTM = Number(r.turnoTM || 0);
      const totalTurnos = turnoTM + turnoManana + turnoTarde;

      return {
        idServicio: r.idServicio,           // FK a servicio_essi (especialidad)
        idDetalle: r.idDetalle || null,     // si es edición, incluir el id_detalle existente
        requiere: totalTurnos > 0,          // false si el usuario ya no desea esta especialidad
        turnos: totalTurnos,
        turnoTM: turnoTM,
        turnoManana: turnoManana,           // Cantidad de turnos mañana (a nivel detalle)
        turnoTarde: turnoTarde,             // Cantidad de turnos tarde (a nivel detalle)
        tc: r.tc !== undefined ? r.tc : true,
        tl: r.tl !== undefined ? r.tl : true,
        observacion: "",
        estado: r.estado || "PENDIENTE"
      };
    });

    console.log("🔍 ========== DEBUG PAYLOAD ==========");
    console.log("📋 TODOS los registros (estado actual):");
    registros.forEach(r => {
      const total = Number(r.turnoTM || 0) + Number(r.turnoManana || 0) + Number(r.turnoTarde || 0);
      console.log(`  - idServicio: ${r.idServicio}, idDetalle: ${r.idDetalle}, TM: ${r.turnoTM}, Mañana: ${r.turnoManana}, Tarde: ${r.turnoTarde}, TOTAL: ${total}`);
    });

    // Separar especialidades según estado de turnos
    const detallesConTurnos = todosLosDetalles.filter(d => d.turnos > 0);
    
    // Especialidades que tenían datos en BD pero el usuario ya no quiere (turnos = 0 Y tiene idDetalle)
    const detallesAEliminar = todosLosDetalles.filter(d => {
      const esParaEliminar = d.turnos === 0 && d.idDetalle !== null && d.idDetalle !== undefined;
      if (d.turnos === 0) {
        console.log(`  🔎 Evaluando eliminación - idServicio: ${d.idServicio}, idDetalle: ${d.idDetalle}, turnos: ${d.turnos}, esParaEliminar: ${esParaEliminar}`);
      }
      return esParaEliminar;
    });

    console.log("📊 Especialidades con turnos > 0:", detallesConTurnos.map(d => ({ idServicio: d.idServicio, idDetalle: d.idDetalle, turnos: d.turnos })));
    console.log("🗑️ Especialidades a eliminar (turnos=0 Y con idDetalle):", detallesAEliminar.map(d => ({ idServicio: d.idServicio, idDetalle: d.idDetalle })));
    console.log("=====================================");

    // Calcular totales solo de especialidades con turnos
    const totalTurnosSolicitados = detallesConTurnos.reduce((sum, d) => sum + d.turnos, 0);
    const totalEspecialidades = detallesConTurnos.length;

    // IDs de detalles a eliminar en backend
    const detallesEliminar = detallesAEliminar.map(d => d.idDetalle).filter(Boolean);

    // Siempre incluir idPeriodo (requerido por backend)
    // Si es edición, también incluir idSolicitud
    const payload = {
      idPeriodo: periodoSeleccionado.idPeriodo,
      totalTurnosSolicitados,
      totalEspecialidades,
      detalles: detallesConTurnos,  // Solo especialidades con turnos > 0
      detallesEliminar               // IDs de especialidades que tenían datos pero ahora turnos = 0
    };

    // Agregar idSolicitud solo si es edición
    if (solicitudActual?.idSolicitud) {
      payload.idSolicitud = solicitudActual.idSolicitud;
    }

    return { payloadCompat: payload };
  };

  // =====================================================================
  // Guardar borrador / Enviar
  // =====================================================================
  const handleGuardarBorrador = async () => {
    if (!periodoSeleccionado?.idPeriodo) {
      setError("Debes seleccionar un periodo antes de guardar.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { payloadCompat } = buildPayload();

      console.log("💾 ============ GUARDAR PROGRESO ============");
      console.log("📦 Payload completo:", JSON.stringify(payloadCompat, null, 2));
      console.log("=============================================");

      const resultado = await solicitudTurnoService.guardarBorrador(payloadCompat);

      // Actualizar estado de la solicitud con el resultado completo
      setSolicitudActual(resultado);
      setModoModal(resultado?.estado === "BORRADOR" ? "EDITAR" : "VER");

      // Si es una nueva solicitud (no tenía ID), actualizar periodo para bloquear cambios
      if (!payloadCompat.idSolicitud && resultado?.idSolicitud) {
        setPeriodoForzado(true);
      }

      // Si el resultado incluye detalles con idDetalle, actualizar registros locales
      if (resultado?.detalles?.length > 0) {
        setRegistros(prev => prev.map(r => {
          const detalleBackend = resultado.detalles.find(d => d.idServicio === r.idServicio);
          if (detalleBackend?.idDetalle) {
            return { ...r, idDetalle: detalleBackend.idDetalle };
          }
          return r;
        }));
      }

      setSuccess("Progreso guardado exitosamente");
      setTimeout(() => setSuccess(null), 3000);
      
      // Recargar detalle completo de la solicitud guardada
      if (resultado?.idSolicitud) {
        await abrirSolicitudDesdeTabla(resultado);
      }
      
      // Refrescar la tabla de solicitudes en segundo plano
      refrescarMisSolicitudes();
      
      // Retornar el resultado para uso posterior
      return resultado;
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al guardar el progreso");
    } finally {
      setSaving(false);
    }
  };

  // Auto-guardar fechas cuando se confirman en el modal
  const handleAutoGuardarFechas = async (idServicio, fechasActualizadas) => {
    console.log("🔄 handleAutoGuardarFechas llamado:", { 
      idServicio, 
      fechasCount: fechasActualizadas?.length,
      solicitudActual: solicitudActual?.idSolicitud,
      periodoSeleccionado: periodoSeleccionado?.idPeriodo
    });

    // Validar que exista periodo
    if (!periodoSeleccionado?.idPeriodo) {
      console.warn("⚠️ No se puede auto-guardar: falta periodo");
      setError("No se puede guardar las fechas. Primero selecciona un periodo.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Variable para almacenar el ID de la solicitud
    let idSolicitudActual = solicitudActual?.idSolicitud;

    // Si no existe la solicitud, crearla automáticamente primero
    if (!idSolicitudActual) {
      console.log("📝 Creando solicitud automáticamente antes de guardar fechas...");
      try {
        const solicitudCreada = await handleGuardarBorrador();
        console.log("✅ Solicitud creada:", solicitudCreada);
        idSolicitudActual = solicitudCreada?.idSolicitud;
        
        if (!idSolicitudActual) {
          throw new Error("No se obtuvo idSolicitud después de guardar");
        }
      } catch (error) {
        console.error("❌ Error al crear solicitud automáticamente:", error);
        setError("No se pudo crear la solicitud. Guarda el borrador manualmente primero.");
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    // Verificar que tenemos el ID de la solicitud
    if (!idSolicitudActual) {
      console.warn("⚠️ No se pudo obtener idSolicitud");
      setError("No se puede guardar las fechas. Primero guarda el borrador de la solicitud.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Buscar el detalle específico de la especialidad
    const detalleEspecialidad = registros.find(r => r.idServicio === idServicio);
    console.log("🔍 Detalle encontrado:", detalleEspecialidad);
    
    if (!detalleEspecialidad) {
      console.warn("⚠️ No se encontró el detalle de la especialidad:", idServicio);
      setError("No se encontró la especialidad. Intenta guardar el borrador primero.");
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const turnoManana = Number(detalleEspecialidad.turnoManana || 0);
      const turnoTarde = Number(detalleEspecialidad.turnoTarde || 0);
      const turnoTM = Number(detalleEspecialidad.turnoTM || 0);

      // Usar las fechas que se acaban de actualizar (parámetro) en lugar del estado
      const fechasDetalle = (fechasActualizadas || []).map(f => ({
        fecha: f.fecha,
        bloque: f.turno === "MANANA" ? "MANANA" : "TARDE"
      }));

      console.log("📅 Fechas a guardar:", fechasDetalle);

      const detallePayload = {
        idPeriodo: periodoSeleccionado.idPeriodo,
        idServicio: detalleEspecialidad.idServicio,
        requiere: true,
        turnos: turnoTM + turnoManana + turnoTarde,
        turnoTM: turnoTM,
        turnoManana: turnoManana,
        turnoTarde: turnoTarde,
        tc: detalleEspecialidad.tc !== undefined ? detalleEspecialidad.tc : true,
        tl: detalleEspecialidad.tl !== undefined ? detalleEspecialidad.tl : true,
        observacion: detalleEspecialidad.observacion || "",
        estado: detalleEspecialidad.estado || "PENDIENTE",
        fechasDetalle: fechasDetalle
      };

      // Agregar idDetalle solo si existe (para actualización)
      if (detalleEspecialidad.idDetalle) {
        detallePayload.idDetalle = detalleEspecialidad.idDetalle;
      }

      console.log("📤 Enviando payload a /solicitudes-turno/" + solicitudActual.idSolicitud + "/detalle:", JSON.stringify(detallePayload, null, 2));
      console.log("%c╔═══════════════════════════════════════════════════════╗", "color: #0A5BA9; font-weight: bold");
      console.log("%c║        📤 PAYLOAD GUARDAR FECHA - DETALLE            ║", "color: #0A5BA9; font-weight: bold");
      console.log("%c╚═══════════════════════════════════════════════════════╝", "color: #0A5BA9; font-weight: bold");
      console.log("%c🌐 URL:", "color: #2563EB; font-weight: bold", `POST /solicitudes-turno/${idSolicitudActual}/detalle`);
      console.log("%c📦 Payload:", "color: #16A34A; font-weight: bold");
      console.table({
        idPeriodo: detallePayload.idPeriodo,
        idServicio: detallePayload.idServicio,
        idDetalle: detallePayload.idDetalle || "NUEVO",
        turnos: detallePayload.turnos,
        turnoTM: detallePayload.turnoTM,
        turnoManana: detallePayload.turnoManana,
        turnoTarde: detallePayload.turnoTarde,
        tc: detallePayload.tc,
        tl: detallePayload.tl,
        fechasCount: detallePayload.fechasDetalle.length
      });
      console.log("%c📅 Fechas Detalle:", "color: #CA8A04; font-weight: bold");
      console.table(detallePayload.fechasDetalle);
      console.log("%c📋 JSON Completo:", "color: #9333EA; font-weight: bold");
      console.log(JSON.stringify(detallePayload, null, 2));
      console.log("%c═══════════════════════════════════════════════════════", "color: #0A5BA9; font-weight: bold");

      // Guardar solo este detalle
      const resultado = await solicitudTurnoService.guardarDetalleEspecialidad(
        idSolicitudActual,
        detallePayload
      );
      
      console.log("✅ Respuesta del servidor:", resultado);
      
      // Actualizar el idDetalle en el registro local si es nuevo
      if (!detalleEspecialidad.idDetalle && resultado?.idDetalle) {
        setRegistros(prev => prev.map(r => 
          r.idServicio === idServicio 
            ? { ...r, idDetalle: resultado.idDetalle }
            : r
        ));
      }
      
      console.log("✅ Fechas guardadas para especialidad:", idServicio, "- idDetalle:", resultado?.idDetalle);
      
      // Mostrar mensaje de éxito
      setSuccess(`✅ Fechas guardadas correctamente (${fechasDetalle.length} fecha(s))`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("❌ Error al auto-guardar fechas:", err);
      const mensajeError = err?.response?.data?.message || err?.message || "Error desconocido";
      setError(`Error al guardar las fechas: ${mensajeError}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEnviar = async () => {
    if (!periodoSeleccionado?.idPeriodo) {
      setError("No hay periodo seleccionado.");
      return;
    }
    if (registros.length === 0) {
      setError("Registra al menos un turno antes de enviar.");
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("¿Enviar la solicitud? Luego no podrás modificarla.")) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { payloadCompat } = buildPayload();

      // Primero guardar el borrador (crea o actualiza)
      const guardado = await solicitudTurnoService.guardarBorrador(payloadCompat);
      
      // Luego enviar la solicitud
      const enviado = await solicitudTurnoService.enviar(guardado.idSolicitud);

      // Actualizar estado local
      setSolicitudActual(enviado);
      setModoModal("VER");
      setPeriodoForzado(true);
      
      setSuccess("Solicitud enviada exitosamente.");
      
      // Refrescar la tabla de solicitudes para mostrar el nuevo estado
      await refrescarMisSolicitudes();
      
      // Cerrar modal inmediatamente
      setOpenFormModal(false);
      setSuccess(null);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al enviar la solicitud");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================================
  // RENDER
  // =====================================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
        <p className="ml-3 text-slate-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Solicitudes de Turnos por Telemedicina</h1>
        </div>
        <p className="text-blue-100">Administra tus solicitudes y registra turnos por calendario.</p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Datos del Usuario */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
        <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-[#0A5BA9]" />
          Datos de Contacto
          <span className="text-[10px] font-normal text-slate-500 ml-2">(auto-detectados)</span>
        </h2>

        {miIpress ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Building2 className="w-3 h-3" />
                Red / IPRESS
              </div>
              <p className="font-semibold text-slate-800 text-sm">{miIpress.nombreRed || "Sin Red"}</p>
              <p className="text-xs text-slate-600">{miIpress.nombreIpress || "Sin IPRESS"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <User className="w-3 h-3" />
                Coordinador / Usuario
              </div>
              <p className="font-semibold text-slate-800 text-sm">{miIpress.nombreCompleto || "N/A"}</p>
              <p className="text-xs text-slate-600">DNI: {miIpress.dniUsuario || "N/A"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Mail className="w-3 h-3" />
                Contacto
              </div>
              <p className="font-semibold text-slate-800 text-xs">{miIpress.emailContacto || "Sin email"}</p>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {miIpress.telefonoContacto || "Sin teléfono"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 text-slate-500 text-sm">No se encontraron datos de IPRESS asociados.</div>
        )}

        {miIpress && !miIpress.datosCompletos && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs flex items-center gap-2">
            <Info className="w-3 h-3" />
            {miIpress.mensajeValidacion}
          </div>
        )}
      </div>

      {/* Tabla por Periodo + Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0A5BA9]" />
                Solicitudes por Periodo
              </h2>
              <p className="text-xs text-slate-500">
                Usa <strong>Iniciar</strong> para registrar turnos por calendario.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRefreshAll}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                disabled={loadingTabla || loadingPeriodos}
              >
                {(loadingTabla || loadingPeriodos) ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Actualizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            {/* Tipo periodos */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-700">Tipo de periodos</label>
              <select
                className="mt-1 w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                value={tipoPeriodos}
                onChange={(e) => {
                  setTipoPeriodos(e.target.value);
                  setFiltroPeriodoId("");
                }}
                disabled={loadingPeriodos}
              >
                <option value="VIGENTES">Vigentes</option>
                <option value="ACTIVOS">Activos</option>
              </select>
            </div>

            {/* Año */}
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-700">Año</label>
              <select
                className="mt-1 w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                value={filtroAnio}
                onChange={(e) => {
                  setFiltroAnio(e.target.value);
                  setFiltroPeriodoId("");
                }}
              >
                {aniosDisponibles.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Periodo */}
            <div className="md:col-span-4">
              <label className="text-xs font-semibold text-slate-700">Periodo</label>
              <select
                className="mt-1 w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                value={filtroPeriodoId}
                onChange={(e) => setFiltroPeriodoId(e.target.value)}
                disabled={loadingPeriodos}
              >
                <option value="">Todos los periodos</option>
                {periodosPorAnio.map((p) => (
                  <option key={p.idPeriodo} value={p.idPeriodo}>
                    {p.descripcion} ({p.periodo})
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Estado</label>
              <select
                className="mt-1 w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="ALL">Todos</option>
                <option value="SIN_SOLICITUD">Sin solicitud</option>
                <option value="BORRADOR">Borrador</option>
                <option value="ENVIADO">Enviado</option>
                <option value="REVISADO">Revisado</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
              </select>
            </div>
          </div>
        </div>

        {filasPorPeriodo.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">No hay periodos para los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50 text-xs text-slate-700">
                <tr>
                  <th className="px-2 py-2 text-left">Año</th>
                  <th className="px-2 py-2 text-left">Periodo</th>
                  <th className="px-2 py-2 text-left">Solicitud</th>
                  <th className="px-2 py-2 text-left">Inicio</th>
                  <th className="px-2 py-2 text-left">Fin</th>
                  <th className="px-2 py-2 text-left">Estado</th>
                  <th className="px-2 py-2 text-right">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filasPorPeriodo.map((r) => {
                  const sol = r.solicitud;
                  const tieneSol = !!sol?.idSolicitud;
                  const esBorrador = sol?.estado === "BORRADOR";

                  return (
                    <tr key={r.idPeriodo} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-2 text-xs text-slate-700 font-semibold">{r.anio}</td>

                      <td className="px-2 py-2 text-xs text-slate-700">
                        <div className="font-semibold">{r.periodoLabel}</div>
                        <div className="text-[10px] text-slate-500">Cód: {r.periodoCode} · ID: {r.idPeriodo}</div>
                      </td>

                      <td className="px-2 py-2 text-xs text-slate-700">
                        {tieneSol ? <span className="font-semibold">#{sol.idSolicitud}</span> : <span className="text-slate-400">—</span>}
                      </td>

                      <td className="px-2 py-2 text-xs text-slate-600">{formatFecha(r.fechaInicio)}</td>
                      <td className="px-2 py-2 text-xs text-slate-600">{formatFecha(r.fechaFin)}</td>

                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${estadoBadgeClass(r.estado)}`}>
                          {r.estado === "SIN_SOLICITUD" ? "SIN SOLICITUD" : r.estado}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => abrirDesdePeriodo(r)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {!tieneSol ? (
                            <>
                              <Plus className="w-3 h-3" /> Iniciar
                            </>
                          ) : esBorrador ? (
                            <>
                              <Pencil className="w-3 h-3" /> Editar
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" /> Ver
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-2 text-[10px] text-slate-500">
              * Al iniciar/editar, se muestra detalle del periodo (sin combo) y registro por calendario.
            </div>
          </div>
        )}
      </div>

      {/* ========================= MODAL FORMULARIO ========================= */}
      <Modal
        open={openFormModal}
        onClose={cerrarModal}
        title={
          modoModal === "NUEVA"
            ? "Nueva Solicitud"
            : modoModal === "EDITAR"
            ? `Editar Solicitud #${solicitudActual?.idSolicitud ?? ""}`
            : `Detalle Solicitud #${solicitudActual?.idSolicitud ?? ""}`
        }
      >
        <div className="p-6 space-y-6">
          {/* Detalle periodo / solicitud (SIN COMBO cuando inicias) */}
          {(periodoForzado || (modoModal === "EDITAR" && !!solicitudActual?.idPeriodo) || esSoloLectura) ? (
            <PeriodoDetalleCard
              periodo={periodoSeleccionado}
              solicitud={solicitudActual}
              modoModal={modoModal}
              periodoForzado={periodoForzado}
            />
          ) : (
            // flujo libre (si abres "Nueva solicitud" sin iniciar desde tabla)
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0A5BA9]" />
                Periodo de Solicitud
              </h2>

              {loadingPeriodos && (
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando periodos...
                </div>
              )}

              {periodos.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay periodos disponibles.</p>
                  <button
                    type="button"
                    onClick={cargarPeriodos}
                    className="mt-3 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <select
                  value={periodoSeleccionado?.idPeriodo || ""}
                  onChange={(e) => {
                    const p = periodos.find((x) => Number(x.idPeriodo) === Number(e.target.value));
                    setPeriodoSeleccionado(p || null);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                >
                  <option value="">Seleccione un periodo...</option>
                  {periodos.map((p) => (
                    <option key={p.idPeriodo} value={p.idPeriodo}>
                      {p.descripcion} ({p.periodo})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* VER (solo lectura) - Vista completa de la solicitud */}
          {esSoloLectura && solicitudActual && (
            <VistaSolicitudEnviada solicitud={solicitudActual} />
          )}

          {/* EDITAR/NUEVA: Nueva interfaz de tabla */}
          {!esSoloLectura && (
            <>
              {!periodoSeleccionado?.idPeriodo ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Selecciona un periodo para registrar turnos.
                </div>
              ) : (
                <>
                  {/* Nueva tabla de especialidades */}
                  <TablaSolicitudEspecialidades
                    especialidades={especialidades}
                    periodo={periodoSeleccionado}
                    registros={registros}
                    onChange={(nuevosRegistros) => setRegistros(nuevosRegistros)}
                    onAutoGuardarFechas={handleAutoGuardarFechas}
                    soloLectura={false}
                    mostrarEncabezado={false}
                  />

                  {/* Acciones */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-slate-600">
                        Periodo:{" "}
                        <strong className="text-slate-900">{periodoSeleccionado?.descripcion || "—"}</strong>
                        <div className="text-xs text-slate-500 mt-1">
                          * Guardar crea/actualiza BORRADOR. Enviar deja la solicitud en solo lectura.
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleGuardarBorrador}
                          disabled={saving}
                          className="px-5 py-2.5 border-2 border-[#0A5BA9] text-[#0A5BA9] font-semibold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Guardar Progreso
                        </button>

                        <button
                          onClick={handleEnviar}
                          disabled={saving || registros.length === 0}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          Enviar Solicitud
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

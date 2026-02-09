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
//    - Columnas: Especialidad, Turnos Mañana, Turnos Tarde,
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
  BookOpen,
  X,
  ListChecks,
  Clock,
  FileCheck,
  Users,
  ArrowRight,
} from "lucide-react";

import { periodoSolicitudService } from "../../../../services/periodoSolicitudService";
import { solicitudTurnoService } from "../../../../services/solicitudTurnoService";

// Componentes separados
import Modal from "./components/Modal";
import ModalConfirmacionEnvio from "./components/ModalConfirmacionEnvio";
import PeriodoDetalleCard, { SeccionFechas } from "./components/PeriodoDetalleCard";
import TablaSolicitudEspecialidades from "./components/TablaSolicitudEspecialidades";
import VistaSolicitudEnviada from "./components/VistaSolicitudEnviada";

// Utilidades
import { formatFecha, getYearFromPeriodo, estadoBadgeClass } from "./utils/helpers";

// Clases reutilizables para botones con hover
const BUTTON_HOVER_CLASS = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 hover:shadow-md";
const BUTTON_WHITE_HOVER_CLASS = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 hover:shadow-md";
const BUTTON_SAVE_CLASS = "w-full px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
const BUTTON_SEND_CLASS = "w-full px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

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
  const [aniosDisponibles, setAniosDisponibles] = useState([2026]);

  // modal
  const [openFormModal, setOpenFormModal] = useState(false);
  const [modoModal, setModoModal] = useState("NUEVA"); // NUEVA | EDITAR | VER
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // periodo seleccionado
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [periodoForzado, setPeriodoForzado] = useState(false);

  // solicitud actual
  const [solicitudActual, setSolicitudActual] = useState(null);

  // registros de turnos por especialidad
  // registro = {idServicio, turnoManana, turnoTarde, tc, tl, fecha, estado}
  const [registros, setRegistros] = useState([]);

  // configuración de servicios (tc/tl por defecto desde IPRESS)
  // Map: idServicio -> {tc, tl}
  const [serviciosConfig, setServiciosConfig] = useState(new Map());

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

  const cargarAniosDisponibles = useCallback(async () => {
    try {
      const anios = await periodoSolicitudService.obtenerAniosDisponibles();
      setAniosDisponibles(anios.length > 0 ? anios : [new Date().getFullYear()]);
    } catch (err) {
      console.error("Error al cargar años disponibles:", err);
      setAniosDisponibles([new Date().getFullYear()]);
    }
  }, []);

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
        cargarAniosDisponibles(),
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
  }, [cargarPeriodos, refrescarMisSolicitudes, cargarAniosDisponibles]);

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
  // Obtener configuración de servicios (tc/tl por defecto)
  // =====================================================================
  const obtenerConfigServicios = async (codIpress, idSolicitud = null) => {
    try {
      const config = await solicitudTurnoService.obtenerFormServicios(codIpress, idSolicitud);
      console.log("📋 Configuración de servicios obtenida:", config);
      // Crear mapa para búsqueda rápida: idServicio -> {teleconsultaActivo, teleconsultorioActivo}
      const configMap = new Map();
      (config || []).forEach(srv => {
        configMap.set(srv.idServicio, {
          tl: srv.teleconsultaActivo ?? true,  // teleconsulta -> tl
          tc: srv.teleconsultorioActivo ?? true // teleconsultorio -> tc
        });
      });
      return configMap;
    } catch (err) {
      console.error("Error al obtener configuración de servicios:", err);
      return new Map();
    }
  };

  // =====================================================================
  // Abrir modal desde fila periodo (Iniciar/Editar/Ver)
  // =====================================================================
  const abrirSolicitudDesdeTabla = async (rowSolicitud) => {
    setError(null);
    setSuccess(null);

    const modo = rowSolicitud.estado === "INICIADO" ? "EDITAR" : "VER";
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
      if (solicitud.estado !== "INICIADO") {
        setRegistros([]);
        return;
      }

      // Obtener configuración de servicios (tc/tl por defecto) para EDITAR
      const codIpress = miIpress?.codigo || miIpress?.codIpress;
      let configMap = new Map();
      if (codIpress) {
        configMap = await obtenerConfigServicios(codIpress, rowSolicitud.idSolicitud);
        setServiciosConfig(configMap);
        console.log("📋 Config map para edición:", configMap);
      } else {
        setServiciosConfig(new Map());
      }

      // EDITAR INICIADO: Cargar detalles de la solicitud
      if (solicitud.detalles && Array.isArray(solicitud.detalles)) {
        // Agrupar detalles por idServicio para evitar duplicados
        // El backend devuelve múltiples registros (con diferentes idDetalle) para la misma especialidad
        // cuando hay múltiples fechas. Consolidamos todo en un solo registro por especialidad.
        const detallesAgrupados = new Map();

        solicitud.detalles.forEach((det) => {
          const idServicio = det.idServicio;

          // Obtener valores por defecto de la configuración
          const configDefaults = configMap.get(idServicio) || { tl: true, tc: true };

          // Si ya existe la especialidad, solo agregar las fechas nuevas
          if (detallesAgrupados.has(idServicio)) {
            const existente = detallesAgrupados.get(idServicio);
            // Agregar fechas del detalle actual (evitando duplicados)
            if (det.fechasDetalle && Array.isArray(det.fechasDetalle)) {
              det.fechasDetalle.forEach(f => {
                const fechaKey = `${f.fecha}-${f.bloque}`;
                if (!existente.fechas.some(ef => ef.id === fechaKey)) {
                  existente.fechas.push({
                    fecha: f.fecha,
                    turno: f.bloque,
                    id: fechaKey
                  });
                }
              });
            }
          } else {
            // Primera vez que vemos esta especialidad - crear registro
            // Priorizar valores existentes del detalle, si no usar config por defecto
            detallesAgrupados.set(idServicio, {
              idDetalle: det.idDetalle || null, // Tomamos el idDetalle del primer registro
              idServicio: det.idServicio,

              turnoManana: det.turnoManana || 0,
              turnoTarde: det.turnoTarde || 0,
              tc: det.tc !== undefined ? det.tc : configDefaults.tc,
              tl: det.tl !== undefined ? det.tl : configDefaults.tl,
              estado: det.estado || "PENDIENTE",
              fechas: (det.fechasDetalle || []).map(f => ({
                fecha: f.fecha,
                turno: f.bloque,
                id: `${f.fecha}-${f.bloque}`
              }))
            });
          }
        });

        // Convertir Map a Array
        const registrosExistentes = Array.from(detallesAgrupados.values());
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

    // no existe => iniciar nueva solicitud
    // Obtener configuración de servicios (tc/tl por defecto) para NUEVA solicitud
    const codIpress = miIpress?.codigo || miIpress?.codIpress;
    if (codIpress) {
      const configMap = await obtenerConfigServicios(codIpress);
      setServiciosConfig(configMap);
      console.log("📋 Config cargada para nueva solicitud:", configMap);
    } else {
      setServiciosConfig(new Map());
      console.warn("⚠️ No se pudo obtener codIpress para cargar config de servicios");
    }

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
      const totalTurnos = turnoManana + turnoTarde;

      return {
        idServicio: r.idServicio,           // FK a servicio_essi (especialidad)
        idDetalle: r.idDetalle || null,     // si es edición, incluir el id_detalle existente
        requiere: totalTurnos > 0,          // false si el usuario ya no desea esta especialidad
        turnos: totalTurnos,
        turnoTM: 0,                         // Siempre 0 por defecto
        turnoManana: turnoManana,           // Cantidad de turnos mañana (a nivel detalle)
        turnoTarde: turnoTarde,             // Cantidad de turnos tarde (a nivel detalle)
        tc: r.tc !== undefined ? r.tc : false,
        tl: r.tl !== undefined ? r.tl : false,
        observacion: "",
        estado: r.estado || "PENDIENTE"
      };
    });

    console.log("🔍 ========== DEBUG PAYLOAD ==========");
    console.log("📋 TODOS los registros (estado actual):");
    registros.forEach(r => {
      const total = Number(r.turnoManana || 0) + Number(r.turnoTarde || 0);
      console.log(`  - idServicio: ${r.idServicio}, idDetalle: ${r.idDetalle}, Mañana: ${r.turnoManana}, Tarde: ${r.turnoTarde}, TOTAL: ${total}`);
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

    console.log("🧮 ========== CÁLCULO DE TOTALES ==========");
    console.log("📊 Detalles con turnos:", detallesConTurnos);
    console.log("🔢 Total Turnos Solicitados:", totalTurnosSolicitados);
    console.log("📋 Total Especialidades:", totalEspecialidades);
    console.log("==========================================");

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
  // Calcular resumen para modal de confirmación
  // =====================================================================
  const calcularResumenSolicitud = () => {
    const registrosConTurnos = registros.filter(r => {
      const turnoManana = Number(r.turnoManana || 0);
      const turnoTarde = Number(r.turnoTarde || 0);
      return turnoManana + turnoTarde > 0;
    });

    const totalEspecialidades = registrosConTurnos.length;
    const turnosMañana = registrosConTurnos.reduce((sum, r) => sum + Number(r.turnoManana || 0), 0);
    const turnosTarde = registrosConTurnos.reduce((sum, r) => sum + Number(r.turnoTarde || 0), 0);

    return {
      totalEspecialidades,
      turnosMañana,
      turnosTarde
    };
  };

  // =====================================================================
  // Guardar borrador / Enviar
  // =====================================================================
  const handleGuardarBorrador = async () => {
    if (!periodoSeleccionado?.idPeriodo) {
      setError("Debes seleccionar un periodo antes de guardar.");
      return;
    }

    // Validación adicional: verificar que haya registros con turnos
    const registrosConTurnos = registros.filter(r => {
      const total = Number(r.turnoManana || 0) + Number(r.turnoTarde || 0);
      return total > 0;
    });

    console.log("🔍 ========== VALIDACIÓN PREVIA ==========");
    console.log("📋 Total de registros:", registros.length);
    console.log("✅ Registros con turnos:", registrosConTurnos.length);
    console.log("📊 Registros actuales:", registros);
    console.log("==========================================");

    if (registrosConTurnos.length === 0) {
      setError("Debes configurar al menos una especialidad con turnos antes de guardar.");
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

      console.log("✅ ============ RESPUESTA DEL BACKEND ============");
      console.log("📦 Resultado completo:", JSON.stringify(resultado, null, 2));
      console.log("📊 Total Especialidades (backend):", resultado?.totalEspecialidades);
      console.log("🎯 Total Turnos (backend):", resultado?.totalTurnosSolicitados);
      console.log("📋 Detalles (backend):", resultado?.detalles?.length);
      console.log("=================================================");

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
    console.log("%c═══════════════════════════════════════════════════════", "color: #DC2626; font-weight: bold; font-size: 14px");
    console.log("%c🚀 INICIO handleAutoGuardarFechas", "color: #DC2626; font-weight: bold; font-size: 14px");
    console.log("%c═══════════════════════════════════════════════════════", "color: #DC2626; font-weight: bold; font-size: 14px");
    console.log("📋 Parámetros recibidos:", { 
      idServicio, 
      fechasCount: fechasActualizadas?.length,
      fechasActualizadas,
      solicitudActual: solicitudActual?.idSolicitud,
      periodoSeleccionado: periodoSeleccionado?.idPeriodo,
      registrosCount: registros.length
    });

    // Validar que exista periodo
    if (!periodoSeleccionado?.idPeriodo) {
      console.error("❌ ERROR: No hay periodo seleccionado");
      setError("No se puede guardar las fechas. Primero selecciona un periodo.");
      setTimeout(() => setError(null), 5000);
      return;
    }
    console.log("✅ Periodo validado:", periodoSeleccionado);

    // Buscar el detalle específico de la especialidad
    const detalleEspecialidad = registros.find(r => r.idServicio === idServicio);
    console.log("🔍 Buscando detalle de especialidad:", idServicio);
    console.log("📦 Registros disponibles:", registros);
    console.log("🎯 Detalle encontrado:", detalleEspecialidad);
    
    if (!detalleEspecialidad) {
      console.error("❌ ERROR: No se encontró el detalle de la especialidad:", idServicio);
      console.log("📋 IDs disponibles:", registros.map(r => r.idServicio));
      setError("No se encontró la especialidad en los registros.");
      setTimeout(() => setError(null), 5000);
      return;
    }
    console.log("✅ Detalle de especialidad encontrado");

    // Validar que tenga turnos configurados
    const turnoManana = Number(detalleEspecialidad.turnoManana || 0);
    const turnoTarde = Number(detalleEspecialidad.turnoTarde || 0);
    const totalTurnos = turnoManana + turnoTarde;
    
    console.log("🔢 Turnos configurados:", { turnoManana, turnoTarde, totalTurnos });

    if (totalTurnos === 0) {
      console.error("❌ ERROR: No hay turnos configurados");
      setError("Primero debes configurar los turnos (Mañana o Tarde) antes de agregar fechas.");
      setTimeout(() => setError(null), 5000);
      return;
    }
    console.log("✅ Turnos validados correctamente");

    // Variable para almacenar el ID de la solicitud
    let idSolicitudActual = solicitudActual?.idSolicitud;
    console.log("🆔 ID Solicitud actual:", idSolicitudActual);

    // Si no existe la solicitud, crearla automáticamente primero
    if (!idSolicitudActual) {
      console.log("%c📝 CREANDO SOLICITUD AUTOMÁTICAMENTE...", "color: #F59E0B; font-weight: bold; font-size: 14px");
      console.log("📋 Registros actuales antes de guardar:", registros);
      
      try {
        const solicitudCreada = await handleGuardarBorrador();
        console.log("%c✅ SOLICITUD CREADA EXITOSAMENTE", "color: #10B981; font-weight: bold; font-size: 14px");
        console.log("📦 Resultado completo:", solicitudCreada);
        
        if (!solicitudCreada?.idSolicitud) {
          console.error("❌ ERROR: No se obtuvo idSolicitud después de guardar");
          throw new Error("No se obtuvo idSolicitud después de guardar");
        }
        
        idSolicitudActual = solicitudCreada.idSolicitud;
        console.log("🆔 Nuevo ID Solicitud:", idSolicitudActual);
        
        // Actualizar el estado local con la solicitud creada
        setSolicitudActual(solicitudCreada);
        console.log("✅ Estado solicitudActual actualizado");
        
        // Esperar un momento para que se actualice el estado
        console.log("⏳ Esperando actualización de estado...");
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("✅ Estado actualizado");
        
      } catch (error) {
        console.error("%c❌ ERROR AL CREAR SOLICITUD", "color: #DC2626; font-weight: bold; font-size: 14px");
        console.error("Error completo:", error);
        const mensaje = error?.message || "Error desconocido";
        setError(`No se pudo crear la solicitud: ${mensaje}. Guarda el borrador manualmente primero.`);
        setTimeout(() => setError(null), 5000);
        return;
      }
    } else {
      console.log("✅ Ya existe solicitud, ID:", idSolicitudActual);
    }

    // Verificar que tenemos el ID de la solicitud
    if (!idSolicitudActual) {
      console.error("❌ ERROR CRÍTICO: No se pudo obtener idSolicitud");
      setError("No se puede guardar las fechas. Primero guarda el borrador de la solicitud.");
      setTimeout(() => setError(null), 5000);
      return;
    }
    console.log("✅ Validación final: idSolicitud =", idSolicitudActual);

    try {
      console.log("%c📤 PREPARANDO PAYLOAD PARA GUARDAR FECHAS", "color: #3B82F6; font-weight: bold; font-size: 14px");
      
      // Usar las fechas que se acaban de actualizar (parámetro) en lugar del estado
      const fechasDetalle = (fechasActualizadas || []).map(f => ({
        fecha: f.fecha,
        bloque: f.turno === "MANANA" ? "MANANA" : "TARDE"
      }));

      console.log("📅 Fechas transformadas:", fechasDetalle);

      const detallePayload = {
        idPeriodo: periodoSeleccionado.idPeriodo,
        idServicio: detalleEspecialidad.idServicio,
        requiere: true,
        turnos: turnoManana + turnoTarde,
        turnoTM: 0,  // Siempre 0 por defecto
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

      console.log("📤 Enviando payload a /solicitudes-turno/" + idSolicitudActual + "/detalle:", JSON.stringify(detallePayload, null, 2));
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
      
      // Recargar la solicitud completa para actualizar los datos
      if (idSolicitudActual) {
        try {
          const solicitudActualizada = await solicitudTurnoService.obtenerPorId(idSolicitudActual);
          setSolicitudActual(solicitudActualizada);
          
          // Actualizar registros locales con los detalles actualizados
          if (solicitudActualizada.detalles && Array.isArray(solicitudActualizada.detalles)) {
            setRegistros(prev => {
              return prev.map(registro => {
                const detalleActualizado = solicitudActualizada.detalles.find(d => d.idServicio === registro.idServicio);
                if (detalleActualizado) {
                  return {
                    ...registro,
                    idDetalle: detalleActualizado.idDetalle,
                    fechas: (detalleActualizado.fechasDetalle || []).map(f => ({
                      fecha: f.fecha,
                      turno: f.bloque,
                      turnos: f.turnos || 0
                    })),
                    observacion: detalleActualizado.observacion
                  };
                }
                return registro;
              });
            });
          }
          
          console.log("🔄 Solicitud y registros recargados después de guardar fechas");
        } catch (reloadErr) {
          console.error("⚠️ Error al recargar solicitud:", reloadErr);
        }
      }
      
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
    
    // Mostrar modal de confirmación
    setShowConfirmModal(true);
  };

  const confirmarEnvio = async (observacionGeneral = '') => {
    setShowConfirmModal(false);
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { payloadCompat } = buildPayload();
      
      // Agregar observación general si se proporcionó
      if (observacionGeneral.trim()) {
        payloadCompat.observacionGeneral = observacionGeneral.trim();
      }

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
    <>
      <div className="space-y-6 p-6 w-full">
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

      {/* Sección Informativa del Sistema */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-4 py-3">
          <h2 className="text-base font-bold text-white mb-0.5 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Información del Sistema
          </h2>
          <p className="text-xs text-blue-100">Gestión de Solicitudes de Turnos</p>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
            <p className="text-sm text-gray-700 leading-relaxed text-justify mb-4">
              El presente formulario constituye una herramienta integral diseñada para facilitar la gestión y administración de solicitudes de turnos médicos por parte del personal externo vinculado a las Instituciones Prestadoras de Servicios de Salud (IPRESS) dentro del sistema CENATE.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setOpenInfoModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all hover:shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                Ver más
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla por Periodo + Filtros */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Solicitudes por Periodo
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Usa <strong>Iniciar</strong> para registrar turnos por calendario.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRefreshAll}
                className={BUTTON_WHITE_HOVER_CLASS}
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
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
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
                <option value="INICIADO">Iniciado</option>
                <option value="ENVIADO">Enviado</option>
              </select>
            </div>
          </div>

          {filasPorPeriodo.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">No hay periodos para los filtros seleccionados.</div>
          ) : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="min-w-full border-collapse">
              <thead className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Año</th>
                  <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Periodo</th>
                  <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Solicitud</th>
                  <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Fecha de Apertura</th>
                  <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Fecha de Cierre</th>
                  <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Estado</th>
                  <th className="px-2 py-2.5 text-right text-xs font-bold text-white">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filasPorPeriodo.map((r) => {
                  const sol = r.solicitud;
                  const tieneSol = !!sol?.idSolicitud;
                  const esIniciado = sol?.estado === "INICIADO";

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
                          className={BUTTON_HOVER_CLASS}
                        >
                          {!tieneSol ? (
                            <>
                              <Plus className="w-3 h-3" /> Iniciar
                            </>
                          ) : esIniciado ? (
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
      </div>

      {/* ========================= MODAL FORMULARIO ========================= */}
      <Modal
        open={openFormModal}
        onClose={cerrarModal}
        title={
          modoModal === "NUEVA"
            ? "Nueva Solicitud"
            : modoModal === "EDITAR"
            ? (
              <div className="flex items-center gap-3">
                <span>Detalle de Solicitud #{solicitudActual?.idSolicitud ?? ""}</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${estadoBadgeClass(solicitudActual?.estado || "INICIADO")}`}>
                  {solicitudActual?.estado || "INICIADO"}
                </span>
              </div>
            )
            : `Detalle Solicitud #${solicitudActual?.idSolicitud ?? ""}`
        }
      >
        <div className="p-4 space-y-4">
          {/* Estadísticas de la solicitud (en modo EDITAR) */}
          {modoModal === "EDITAR" && solicitudActual && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-purple-500 p-1.5 rounded">
                    <FileText className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">Especialidades</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 ml-8">
                  {solicitudActual?.totalEspecialidades || 0}
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-cyan-500 p-1.5 rounded">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wide">Total Turnos</span>
                </div>
                <p className="text-2xl font-bold text-cyan-900 ml-8">
                  {solicitudActual?.totalTurnosSolicitados || 0}
                </p>
              </div>
            </div>
          )}

          {/* Detalle periodo / solicitud (SIN COMBO cuando inicias) */}
          {!esSoloLectura && ((periodoForzado || (modoModal === "EDITAR" && !!solicitudActual?.idPeriodo)) ? (
            <PeriodoDetalleCard
              periodo={periodoSeleccionado}
              solicitud={solicitudActual}
              modoModal={modoModal}
              periodoForzado={periodoForzado}
            />
          ) : (
            // flujo libre (si abres "Nueva solicitud" sin iniciar desde tabla)
            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0A5BA9]" />
                Periodo de Solicitud
              </h2>

              {loadingPeriodos && (
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cargando periodos...
                </div>
              )}

              {periodos.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay periodos disponibles.</p>
                  <button
                    type="button"
                    onClick={cargarPeriodos}
                    className="mt-2 px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
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
          ))}

          {/* VER (solo lectura) - Vista completa de la solicitud */}
          {esSoloLectura && solicitudActual && (
            <>
              <VistaSolicitudEnviada solicitud={solicitudActual} />
              <SeccionFechas solicitud={solicitudActual} />
            </>
          )}

          {/* EDITAR/NUEVA: Nueva interfaz de tabla */}
          {!esSoloLectura && (
            <>
              {!periodoSeleccionado?.idPeriodo ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 text-sm rounded-lg flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Selecciona un periodo para registrar turnos.
                </div>
              ) : (
                <>
                  {/* Nueva tabla de especialidades */}
                  <TablaSolicitudEspecialidades
                    especialidades={especialidades}
                    periodo={periodoSeleccionado}
                    registros={registros}
                    configDefaults={serviciosConfig}
                    onChange={(nuevosRegistros) => {
                      console.log("🔄 ========== CAMBIO EN TABLA ==========");
                      console.log("📋 Nuevos registros recibidos:", nuevosRegistros);
                      console.log("📊 Cantidad:", nuevosRegistros?.length);
                      console.log("=======================================");
                      setRegistros(nuevosRegistros);
                    }}
                    onAutoGuardarFechas={handleAutoGuardarFechas}
                    soloLectura={false}
                    mostrarEncabezado={false}
                    botonesAccion={
                      <>
                        <button
                          onClick={handleGuardarBorrador}
                          disabled={saving}
                          className={BUTTON_SAVE_CLASS}
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Guardar Progreso
                        </button>

                        <button
                          onClick={handleEnviar}
                          disabled={saving || registros.length === 0}
                          className={BUTTON_SEND_CLASS}
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Enviar Solicitud
                        </button>
                      </>
                    }
                  />

                  {/* Sección de Fechas en modo EDITAR */}
                  {modoModal === "EDITAR" && solicitudActual && (
                    <SeccionFechas solicitud={solicitudActual} />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>

    {/* Modal de Información Detallada - Independiente con z-index superior */}
    {openInfoModal && (
      <div className="fixed inset-0 z-[60]">
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpenInfoModal(false)} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Información del Sistema</h2>
                <p className="text-blue-100 text-sm">Guía completa de funcionalidades</p>
              </div>
            </div>
            <button
              onClick={() => setOpenInfoModal(false)}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Funcionalidades Principales */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-600" />
                Funcionalidades Principales
              </h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                El sistema permite a los profesionales de la salud registrar y gestionar sus requerimientos de turnos asistenciales de manera estructurada, considerando los siguientes componentes:
              </p>

              <div className="space-y-4">
                {/* 1. Gestión de Periodos */}
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    1. Gestión de Periodos de Solicitud
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    El formulario presenta los periodos habilitados para solicitud de turnos, diferenciados entre periodos vigentes y activos, permitiendo la selección del periodo correspondiente según el calendario establecido por la institución.
                  </p>
                </div>

                {/* 2. Configuración de Turnos */}
                <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    2. Configuración de Turnos por Especialidad
                  </h4>
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    Para cada especialidad médica disponible, el sistema permite especificar:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                    <li>Turnos de tiempo completo</li>
                    <li>Turnos de mañana</li>
                    <li>Turnos de tarde</li>
                    <li>Habilitación de modalidad Teleconsulta</li>
                    <li>Habilitación de modalidad Teleconsultorio</li>
                  </ul>
                </div>

                {/* 3. Gestión de Fechas */}
                <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    3. Gestión de Fechas Específicas
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Una vez configurada la cantidad de turnos por especialidad, el sistema habilita la selección detallada de las fechas en las que se desea prestar servicios, asegurando una planificación precisa de la disponibilidad profesional.
                  </p>
                </div>

                {/* 4. Seguimiento */}
                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4">
                  <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    4. Seguimiento y Trazabilidad
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    El formulario mantiene un registro histórico de todas las solicitudes generadas, clasificadas por estado (Borrador, Enviada, Revisada, Aprobada, Rechazada), facilitando el seguimiento del proceso de asignación de turnos.
                  </p>
                </div>

                {/* 5. Filtros */}
                <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-4">
                  <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    5. Filtros y Búsqueda Avanzada
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Incorpora mecanismos de filtrado por año, periodo, estado de solicitud y especialidad, optimizando la navegación y consulta de información.
                  </p>
                </div>
              </div>
            </div>

            {/* Flujo de Trabajo */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-600" />
                Flujo de Trabajo
              </h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                El proceso operativo contempla las siguientes etapas:
              </p>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                <div className="space-y-4 ml-2">
                  {/* Paso 1 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-md z-10">
                      1
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex-1 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed">Inicio de solicitud seleccionando el periodo correspondiente</p>
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md z-10">
                      2
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex-1 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed">Configuración de especialidades y cantidad de turnos requeridos</p>
                    </div>
                  </div>

                  {/* Paso 3 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-md z-10">
                      3
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex-1 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed">Selección de fechas específicas para cada especialidad</p>
                    </div>
                  </div>

                  {/* Paso 4 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-md z-10">
                      4
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex-1 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed">Guardado de progreso (modo borrador) para modificaciones posteriores</p>
                    </div>
                  </div>

                  {/* Paso 5 */}
                  <div className="flex items-start gap-3 relative">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fuchsia-500 text-white font-bold flex items-center justify-center text-sm shadow-md z-10">
                      5
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex-1 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed">Envío formal de la solicitud para su revisión y aprobación por las instancias competentes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={() => setOpenInfoModal(false)}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
    )}

    {/* Modal de Confirmación de Envío */}
    <ModalConfirmacionEnvio
      isOpen={showConfirmModal}
      onClose={() => setShowConfirmModal(false)}
      onConfirm={confirmarEnvio}
      resumenSolicitud={calcularResumenSolicitud()}
      loading={saving}
    />
    </>
  );
}

// ========================================================================
// FormularioSolicitudTurnos.jsx - Componente Principal
// ------------------------------------------------------------------------
// ✅ REQUERIMIENTOS IMPLEMENTADOS (según tu mensaje):
// 1) Filtros: Tipo de periodo (VIGENTES vs ACTIVOS), Año (2025/2026/2027),
//    Periodo (depende del año y tipo), Estado (de la solicitud).
// 2) Tabla por periodo: Año, Periodo, Solicitud, Inicio, Fin, Estado, Acción.
// 3) Al INICIAR (o EDITAR) NO aparece combo de periodo: se muestra tarjeta detalle
//    (inicio/fin/creación/actualización/envío/estado/periodo).
// 4) Registro de turnos NUEVO (UX):
//    - Combo especialidades
//    - Calendario del periodo (mes)
//    - Por día: botones M y T
//    - Click en M/T -> modal: Teleconsultorio y/o Teleconsulta + cantidades
//    - Abajo: tabla resumen (día, especialidad, turno, modalidades, cantidades, estado)
//    - Por día puede tener 2 registros (M y T).
// 5) Mantiene tus services existentes (solicitudTurnoService / periodoSolicitudService).
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
import ModalConfigTurno from "./components/ModalConfigTurno";
import CalendarPeriodo from "./components/CalendarPeriodo";
import TurnosSolicitados from "./components/TurnosSolicitados";
import PeriodoDetalleCard from "./components/PeriodoDetalleCard";

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

  // registro NUEVO: array de registros por día/turno/especialidad
  // registro = {ymd, turno:'M'|'T', idServicio, especialidad, codServicio, tc, tl, cantidadTC, cantidadTL, estado}
  const [registros, setRegistros] = useState([]);

  // UX: especialidad seleccionada para calendar
  const [idServicioSel, setIdServicioSel] = useState("");
  const especialidadSel = useMemo(
    () => especialidades.find((e) => String(e.idServicio) === String(idServicioSel)) || null,
    [especialidades, idServicioSel]
  );

  // modal configurar turno
  const [openCfg, setOpenCfg] = useState(false);
  const [cfgData, setCfgData] = useState(null); // { ymd, turno, esp }

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

      // EDITAR BORRADOR:
      setRegistros([]);
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

    // reset registros y selección especialidad
    setRegistros([]);
    setIdServicioSel("");

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
    setIdServicioSel("");

    setOpenFormModal(true);
    await cargarPeriodos();
  };

  const cerrarModal = async () => {
    setOpenFormModal(false);
    setSaving(false);
    setPeriodoForzado(false);
    setCfgData(null);
    setOpenCfg(false);

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
  // Registros index (por día|turno) para marcar calendario
  // =====================================================================
  const registrosIndex = useMemo(() => {
    const idx = {};
    (registros || []).forEach((r) => {
      const k = `${r.ymd}|${r.turno}`;
      idx[k] = true;
    });
    return idx;
  }, [registros]);

  // =====================================================================
  // Click M/T en calendario
  // =====================================================================
  const handleClickTurno = (ymd, turno) => {
    if (!especialidadSel) {
      setError("Selecciona una especialidad antes de registrar turnos en el calendario.");
      return;
    }
    setError(null);
    setCfgData({ ymd, turno, esp: especialidadSel });
    setOpenCfg(true);
  };

  // Confirmar modal -> inserta/actualiza registro por (ymd, turno, idServicio)
  const onConfirmCfg = (nuevo) => {
    setRegistros((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const i = arr.findIndex(
        (r) => r.ymd === nuevo.ymd && r.turno === nuevo.turno && String(r.idServicio) === String(nuevo.idServicio)
      );

      // si cantidades 0, eliminar
      const total = Number(nuevo.cantidadTC || 0) + Number(nuevo.cantidadTL || 0);
      if (total <= 0) {
        if (i >= 0) arr.splice(i, 1);
        return arr;
      }

      if (i >= 0) {
        arr[i] = { ...arr[i], ...nuevo };
      } else {
        arr.push(nuevo);
      }
      return arr;
    });
  };

  const onRemoveRegistro = (r) => {
    setRegistros((prev) =>
      (Array.isArray(prev) ? prev : []).filter(
        (x) => !(x.ymd === r.ymd && x.turno === r.turno && String(x.idServicio) === String(r.idServicio))
      )
    );
  };

  const onClearRegistros = () => setRegistros([]);

  // =====================================================================
  // Payload (para enviar/guardar)
  // =====================================================================
  const buildPayload = () => {
    if (!periodoSeleccionado?.idPeriodo) return null;

    // Payload V2 (día/turno)
    const payloadV2 = {
      idPeriodo: periodoSeleccionado.idPeriodo,
      idSolicitud: solicitudActual?.idSolicitud || null,
      registros: (registros || []).map((r) => ({
        fecha: r.ymd,
        turno: r.turno, // M/T
        idServicio: r.idServicio,
        tc: r.tc,
        tl: r.tl,
        cantidadTC: r.cantidadTC,
        cantidadTL: r.cantidadTL,
      })),
    };

    // Payload agregado simple por especialidad (por compat si tu backend aún usa "detalles")
    const map = new Map();
    (registros || []).forEach((r) => {
      const id = Number(r.idServicio);
      if (!map.has(id)) {
        map.set(id, {
          idServicio: id,
          requiere: true,
          turnos: 0,
          mananaActiva: false,
          diasManana: [],
          tardeActiva: false,
          diasTarde: [],
          observacion: "",
        });
      }
      const det = map.get(id);
      const suma = Number(r.cantidadTC || 0) + Number(r.cantidadTL || 0);
      det.turnos += suma;

      const d = new Date(`${r.ymd}T00:00:00`);
      const dia = d.toLocaleDateString("es-PE", { weekday: "short" });
      const norm = dia.replace(".", "").toLowerCase();
      const mapDia = {
        dom: "Dom",
        lun: "Lun",
        mar: "Mar",
        mié: "Mié",
        mie: "Mié",
        jue: "Jue",
        vie: "Vie",
        sáb: "Sáb",
        sab: "Sáb",
      };
      const label = mapDia[norm] || "—";

      if (r.turno === "M") {
        det.mananaActiva = true;
        if (label !== "—" && !det.diasManana.includes(label)) det.diasManana.push(label);
      } else {
        det.tardeActiva = true;
        if (label !== "—" && !det.diasTarde.includes(label)) det.diasTarde.push(label);
      }
    });

    const detalles = Array.from(map.values());

    return { payloadV2, payloadCompat: { idPeriodo: periodoSeleccionado.idPeriodo, detalles } };
  };

  // =====================================================================
  // Guardar borrador / Enviar
  // =====================================================================
  const handleGuardarBorrador = async () => {
    if (!periodoSeleccionado?.idPeriodo) {
      setError("No hay periodo seleccionado.");
      return;
    }
    if (registros.length === 0) {
      setError("Registra al menos un turno antes de guardar.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { payloadCompat } = buildPayload();

      const resultado = await solicitudTurnoService.guardarBorrador(payloadCompat);

      setSolicitudActual(resultado);
      setModoModal(resultado?.estado === "BORRADOR" ? "EDITAR" : "VER");

      setSuccess("Borrador guardado exitosamente");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al guardar borrador");
    } finally {
      setSaving(false);
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

      const guardado = await solicitudTurnoService.guardarBorrador(payloadCompat);
      const enviado = await solicitudTurnoService.enviar(guardado.idSolicitud);

      setSolicitudActual(enviado);
      setModoModal("VER");
      setSuccess("Solicitud enviada exitosamente.");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al enviar");
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
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0A5BA9]" />
          Datos de Contacto
          <span className="text-xs font-normal text-slate-500 ml-2">(auto-detectados)</span>
        </h2>

        {miIpress ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Building2 className="w-4 h-4" />
                Red / IPRESS
              </div>
              <p className="font-semibold text-slate-800">{miIpress.nombreRed || "Sin Red"}</p>
              <p className="text-sm text-slate-600">{miIpress.nombreIpress || "Sin IPRESS"}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <User className="w-4 h-4" />
                Coordinador / Usuario
              </div>
              <p className="font-semibold text-slate-800">{miIpress.nombreCompleto || "N/A"}</p>
              <p className="text-sm text-slate-600">DNI: {miIpress.dniUsuario || "N/A"}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Mail className="w-4 h-4" />
                Contacto
              </div>
              <p className="font-semibold text-slate-800 text-sm">{miIpress.emailContacto || "Sin email"}</p>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {miIpress.telefonoContacto || "Sin teléfono"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">No se encontraron datos de IPRESS asociados.</div>
        )}

        {miIpress && !miIpress.datosCompletos && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            {miIpress.mensajeValidacion}
          </div>
        )}
      </div>

      {/* Tabla por Periodo + Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0A5BA9]" />
                Solicitudes por Periodo
              </h2>
              <p className="text-sm text-slate-500">
                Usa <strong>Iniciar</strong> para registrar turnos por calendario.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRefreshAll}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-2"
                disabled={loadingTabla || loadingPeriodos}
              >
                {(loadingTabla || loadingPeriodos) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Actualizar
              </button>

              <button
                type="button"
                onClick={abrirNuevaSolicitud}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-bold shadow hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva solicitud
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Tipo periodos */}
            <div className="md:col-span-3">
              <label className="text-sm font-semibold text-slate-700">Tipo de periodos</label>
              <select
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
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
              <div className="text-xs text-slate-500 mt-1">* según tus endpoints /vigentes y /activos</div>
            </div>

            {/* Año */}
            <div className="md:col-span-3">
              <label className="text-sm font-semibold text-slate-700">Año</label>
              <select
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
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
              <label className="text-sm font-semibold text-slate-700">Periodo</label>
              <select
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
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
              <div className="text-xs text-slate-500 mt-1">* Al elegir año, se listan periodos relacionados</div>
            </div>

            {/* Estado */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Estado</label>
              <select
                className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
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
          <div className="text-center py-10 text-slate-500">No hay periodos para los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50 text-sm text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Año</th>
                  <th className="px-4 py-3 text-left">Periodo</th>
                  <th className="px-4 py-3 text-left">Solicitud</th>
                  <th className="px-4 py-3 text-left">Inicio</th>
                  <th className="px-4 py-3 text-left">Fin</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filasPorPeriodo.map((r) => {
                  const sol = r.solicitud;
                  const tieneSol = !!sol?.idSolicitud;
                  const esBorrador = sol?.estado === "BORRADOR";

                  return (
                    <tr key={r.idPeriodo} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-slate-700 font-semibold">{r.anio}</td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        <div className="font-semibold">{r.periodoLabel}</div>
                        <div className="text-xs text-slate-500">Código: {r.periodoCode} · ID: {r.idPeriodo}</div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {tieneSol ? <span className="font-semibold">#{sol.idSolicitud}</span> : <span className="text-slate-400">—</span>}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">{formatFecha(r.fechaInicio)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatFecha(r.fechaFin)}</td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${estadoBadgeClass(r.estado)}`}>
                          {r.estado === "SIN_SOLICITUD" ? "SIN SOLICITUD" : r.estado}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => abrirDesdePeriodo(r)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {!tieneSol ? (
                            <>
                              <Plus className="w-4 h-4" /> Iniciar
                            </>
                          ) : esBorrador ? (
                            <>
                              <Pencil className="w-4 h-4" /> Editar
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" /> Ver
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-3 text-xs text-slate-500">
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
          {/* Estado actual */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-slate-600">
              Estado:{" "}
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${estadoBadgeClass(solicitudActual?.estado || "BORRADOR")}`}>
                {solicitudActual?.estado || (modoModal === "NUEVA" ? "BORRADOR" : "—")}
              </span>
            </div>

            <div className="text-sm text-slate-500">
              {solicitudActual?.updatedAt ? (
                <>Última actualización: <strong>{formatFecha(solicitudActual.updatedAt)}</strong></>
              ) : (
                <>—</>
              )}
            </div>
          </div>

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

          {/* VER (solo lectura) */}
          {esSoloLectura && (
            <div className="bg-slate-100 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Solicitud{" "}
                {solicitudActual?.estado === "REVISADO"
                  ? "Revisada"
                  : solicitudActual?.estado === "APROBADA"
                  ? "Aprobada"
                  : solicitudActual?.estado === "RECHAZADA"
                  ? "Rechazada"
                  : "Enviada"}
              </h3>
              <p className="text-slate-600">
                {solicitudActual?.estado === "RECHAZADA"
                  ? "Tu solicitud fue rechazada. Revisa el motivo y genera una nueva solicitud si corresponde."
                  : solicitudActual?.estado === "APROBADA"
                  ? "Tu solicitud fue aprobada."
                  : solicitudActual?.estado === "REVISADO"
                  ? "Tu solicitud ha sido revisada por el coordinador."
                  : "Tu solicitud ha sido enviada y está pendiente de revisión."}
              </p>
            </div>
          )}

          {/* EDITAR/NUEVA: Registro por especialidad + calendario */}
          {!esSoloLectura && (
            <>
              {!periodoSeleccionado?.idPeriodo ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Selecciona un periodo para registrar turnos.
                </div>
              ) : (
                <>
                  {/* Selector especialidad */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                      <div className="flex-1">
                        <label className="text-sm font-bold text-slate-700">Especialidad</label>
                        <select
                          value={idServicioSel}
                          onChange={(e) => setIdServicioSel(e.target.value)}
                          className="mt-1 w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                        >
                          <option value="">Seleccione una especialidad...</option>
                          {especialidades.map((e) => (
                            <option key={e.idServicio} value={e.idServicio}>
                              {e.descServicio} {e.codServicio ? `(${e.codServicio})` : ""}
                            </option>
                          ))}
                        </select>
                        <div className="text-xs text-slate-500 mt-2">
                          * Al seleccionar la especialidad, registra días/turnos en el calendario del periodo.
                        </div>
                      </div>

                      <div className="text-sm text-slate-600">
                        Registros actuales:{" "}
                        <span className="font-extrabold text-[#0A5BA9]">{registros.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendario */}
                  {especialidadSel ? (
                    <CalendarPeriodo
                      periodo={periodoSeleccionado}
                      onClickTurno={handleClickTurno}
                      registrosIndex={registrosIndex}
                      esSoloLectura={false}
                    />
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl">
                      Selecciona una especialidad para mostrar el calendario.
                    </div>
                  )}

                  {/* Resumen */}
                  <TurnosSolicitados registros={registros} onRemove={onRemoveRegistro} onClear={onClearRegistros} />

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
                          disabled={saving || registros.length === 0}
                          className="px-5 py-2.5 border-2 border-[#0A5BA9] text-[#0A5BA9] font-semibold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Guardar Borrador
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

        {/* Modal configurar turno */}
        <ModalConfigTurno
          open={openCfg}
          onClose={() => setOpenCfg(false)}
          data={cfgData}
          onConfirm={onConfirmCfg}
        />
      </Modal>
    </div>
  );
}

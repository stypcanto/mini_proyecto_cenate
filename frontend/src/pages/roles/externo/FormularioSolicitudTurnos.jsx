// ========================================================================
// FormularioSolicitudTurnos.jsx
// ------------------------------------------------------------------------
// Pantalla principal: Tabla de "Mis Solicitudes" + Botón "Nueva Solicitud"
// Modal:
//  - NUEVA: Selector de Periodo + Tabla editable + Guardar/Enviar
//  - EDITAR (BORRADOR): Periodo SOLO LECTURA (sin cambiar) + Tabla editable
//  - VER (ENVIADO/REVISADO): NO muestra combo, solo resumen + detalle (UX UI)
// ========================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
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
  Lock, // ✅ NUEVO
} from "lucide-react";

import { periodoSolicitudService } from "../../../services/periodoSolicitudService";
import { solicitudTurnoService } from "../../../services/solicitudTurnoService";

/** ===== Helpers de fila ===== */
const createEmptyRow = () => ({
  requiere: false,
  turnos: 0,
  mananaActiva: false,
  diasManana: [],
  tardeActiva: false,
  diasTarde: [],
  observacion: "",
});

const esFilaCompleta = (row) => {
  if (!row?.requiere) return false;

  const turnosOk = Number(row.turnos || 0) >= 1;

  const mananaOk =
    !!row.mananaActiva &&
    Array.isArray(row.diasManana) &&
    row.diasManana.length > 0;

  const tardeOk =
    !!row.tardeActiva && Array.isArray(row.diasTarde) && row.diasTarde.length > 0;

  const tieneTurnoConDias = mananaOk || tardeOk;

  return turnosOk && tieneTurnoConDias;
};

const obtenerRequeridasValidasDeTabla = (especialidades, turnosPorEspecialidad) => {
  return especialidades
    .map((esp) => {
      const row = turnosPorEspecialidad?.[esp.idServicio] || createEmptyRow();
      return { esp, row };
    })
    .filter(({ row }) => !!row.requiere)
    .filter(({ row }) => esFilaCompleta(row))
    .map(({ esp, row }) => ({
      idServicio: esp.idServicio,
      requiere: true,
      turnos: Number(row.turnos || 0),
      mananaActiva: !!row.mananaActiva,
      diasManana: Array.isArray(row.diasManana) ? row.diasManana : [],
      tardeActiva: !!row.tardeActiva,
      diasTarde: Array.isArray(row.diasTarde) ? row.diasTarde : [],
      observacion: row.observacion || "",
    }));
};

const obtenerRequeridasPendientes = (especialidades, turnosPorEspecialidad) => {
  return especialidades
    .map((esp) => {
      const row = turnosPorEspecialidad?.[esp.idServicio] || createEmptyRow();
      return { esp, row };
    })
    .filter(({ row }) => !!row.requiere)
    .filter(({ row }) => !esFilaCompleta(row))
    .map(({ esp }) => esp);
};

function formatFecha(fechaIso) {
  if (!fechaIso) return "—";
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
}

function estadoBadgeClass(estado) {
  if (estado === "ENVIADO") return "bg-green-50 text-green-700 border-green-200";
  if (estado === "REVISADO") return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-yellow-50 text-yellow-800 border-yellow-200"; // BORRADOR u otro
}

/** =======================================================================
 * MODAL SIMPLE
 * ======================================================================= */
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div className="font-bold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>

          <div className="overflow-auto max-h-[calc(92vh-68px)]">{children}</div>
        </div>
      </div>
    </div>
  );
}

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

  // periodos y especialidades
  const [periodosVigentes, setPeriodosVigentes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  // tabla solicitudes
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loadingTabla, setLoadingTabla] = useState(false);

  // modal
  const [openFormModal, setOpenFormModal] = useState(false);
  const [modoModal, setModoModal] = useState("NUEVA"); // NUEVA | EDITAR | VER

  // formulario (dentro modal)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [solicitudActual, setSolicitudActual] = useState(null);
  const [turnosPorEspecialidad, setTurnosPorEspecialidad] = useState({});
  const [valTabla, setValTabla] = useState({
    pendCount: 0,
    reqCount: 0,
    okCount: 0,
    firstPendingId: null,
  });

  // ============================================================
  // TABLA SOLICITUDES
  // ============================================================
  const refrescarMisSolicitudes = useCallback(async () => {
    setLoadingTabla(true);
    try {
      const data = await solicitudTurnoService.listarMisSolicitudes();
      setMisSolicitudes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTabla(false);
    }
  }, []);

  // ============================================================
  // CARGA INICIAL
  // ============================================================
  const inicializar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ipressData, periodosData, especialidadesData] = await Promise.all([
        solicitudTurnoService.obtenerMiIpress(),
        periodoSolicitudService.obtenerVigentes(),
        solicitudTurnoService.obtenerEspecialidadesCenate(),
      ]);

      setMiIpress(ipressData);
      setPeriodosVigentes(periodosData || []);
      setEspecialidades(especialidadesData || []);

      const init = {};
      (especialidadesData || []).forEach((esp) => {
        init[esp.idServicio] = createEmptyRow();
      });
      setTurnosPorEspecialidad(init);

      await refrescarMisSolicitudes();

      if ((periodosData || []).length === 1) {
        setPeriodoSeleccionado(periodosData[0]);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [refrescarMisSolicitudes]);

  useEffect(() => {
    inicializar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // ABRIR MODAL
  // ============================================================
  const abrirNuevaSolicitud = () => {
    setError(null);
    setSuccess(null);

    setModoModal("NUEVA");
    setSolicitudActual(null);
    setPeriodoSeleccionado(null);

    const reset = {};
    especialidades.forEach((esp) => (reset[esp.idServicio] = createEmptyRow()));
    setTurnosPorEspecialidad(reset);

    setOpenFormModal(true);
  };

  /**
   * ✅ BORRADOR => EDITAR (carga por ID y mapea a tabla editable)
   * ✅ ENVIADO/REVISADO => VER (carga por ID y muestra solo resumen + detalle)
   *
   * Requisito: solicitudTurnoService.obtenerPorId(idSolicitud)
   */
  const abrirSolicitudDesdeTabla = async (row) => {
    setError(null);
    setSuccess(null);

    const modo = row.estado === "BORRADOR" ? "EDITAR" : "VER";
    setModoModal(modo);

    setOpenFormModal(true);
    setLoading(true);

    try {
      const solicitud = await solicitudTurnoService.obtenerPorId(row.idSolicitud);

      setSolicitudActual(solicitud);

      // set periodo info (si no está en vigentes, igual lo mostramos)
      const periodo =
        periodosVigentes.find((p) => p.idPeriodo === solicitud.idPeriodo) || {
          idPeriodo: solicitud.idPeriodo,
          descripcion: solicitud.periodoDescripcion,
          periodo: "",
          fechaInicio: null,
          fechaFin: null,
          instrucciones: null,
        };
      setPeriodoSeleccionado(periodo);

      // Si es BORRADOR, mapear detalles a tabla editable
      if (solicitud.estado === "BORRADOR") {
        const base = {};
        especialidades.forEach((esp) => (base[esp.idServicio] = createEmptyRow()));

        (solicitud.detalles || []).forEach((det) => {
          const idServicio = det.idServicio;
          if (!idServicio) return;

          base[idServicio] = {
            ...createEmptyRow(),
            requiere: det.requiere ?? true,
            turnos: Number(det.turnosSolicitados ?? det.turnos ?? 0),
            mananaActiva: !!det.mananaActiva,
            diasManana: Array.isArray(det.diasManana) ? det.diasManana : [],
            tardeActiva: !!det.tardeActiva,
            diasTarde: Array.isArray(det.diasTarde) ? det.diasTarde : [],
            observacion: det.observacion || "",
          };
        });

        setTurnosPorEspecialidad(base);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el detalle de la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = async () => {
    setOpenFormModal(false);
    setSaving(false);
    await refrescarMisSolicitudes();
  };

  // ============================================================
  // CARGAR SOLICITUD POR PERIODO (solo NUEVA)
  //   ✅ FIX: ya NO debe ejecutarse en EDITAR
  // ============================================================
  useEffect(() => {
    const cargar = async () => {
      if (!openFormModal) return;
      if (!periodoSeleccionado?.idPeriodo) return;

      // ✅ VER: no cargar por periodo
      if (modoModal === "VER") return;

      // ✅ EDITAR: NO volver a cargar por periodo (evita cambiar cabecera / periodo)
      if (modoModal === "EDITAR" && solicitudActual?.idSolicitud) return;

      try {
        const solicitud = await solicitudTurnoService.obtenerMiSolicitud(periodoSeleccionado.idPeriodo);

        if (solicitud) {
          setSolicitudActual(solicitud);

          const base = {};
          especialidades.forEach((esp) => (base[esp.idServicio] = createEmptyRow()));

          (solicitud.detalles || []).forEach((det) => {
            const idServicio = det.idServicio;
            if (!idServicio) return;

            base[idServicio] = {
              ...createEmptyRow(),
              requiere: det.requiere ?? true,
              turnos: Number(det.turnosSolicitados ?? det.turnos ?? 0),
              mananaActiva: !!det.mananaActiva,
              diasManana: Array.isArray(det.diasManana) ? det.diasManana : [],
              tardeActiva: !!det.tardeActiva,
              diasTarde: Array.isArray(det.diasTarde) ? det.diasTarde : [],
              observacion: det.observacion || "",
            };
          });

          setTurnosPorEspecialidad(base);

          if (modoModal === "NUEVA") {
            setModoModal(solicitud.estado === "BORRADOR" ? "EDITAR" : "VER");
          }
        } else {
          setSolicitudActual(null);
          const reset = {};
          especialidades.forEach((esp) => (reset[esp.idServicio] = createEmptyRow()));
          setTurnosPorEspecialidad(reset);
          if (modoModal !== "NUEVA") setModoModal("NUEVA");
        }
      } catch (err) {
        console.error("Error al cargar solicitud del periodo:", err);
      }
    };

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFormModal, periodoSeleccionado?.idPeriodo, especialidades, modoModal, solicitudActual?.idSolicitud]);

  // ============================================================
  // CÁLCULOS
  // ============================================================
  const totalTurnos = useMemo(() => {
    if (modoModal === "VER") return Number(solicitudActual?.totalTurnosSolicitados || 0);
    return Object.values(turnosPorEspecialidad || {}).reduce(
      (acc, row) => acc + Number(row?.turnos || 0),
      0
    );
  }, [turnosPorEspecialidad, modoModal, solicitudActual?.totalTurnosSolicitados]);

  const especialidadesConTurnos = useMemo(() => {
    if (modoModal === "VER") {
      return Number(
        solicitudActual?.totalEspecialidades ?? (solicitudActual?.detalles?.length || 0)
      );
    }
    return Object.values(turnosPorEspecialidad || {}).filter(
      (row) => Number(row?.turnos || 0) > 0
    ).length;
  }, [turnosPorEspecialidad, modoModal, solicitudActual?.totalEspecialidades, solicitudActual?.detalles]);

  const esSoloLectura =
    modoModal === "VER" ||
    solicitudActual?.estado === "ENVIADO" ||
    solicitudActual?.estado === "REVISADO";

  // ✅ NUEVO: periodo bloqueado SOLO cuando estás EDITANDO un BORRADOR ya creado
  const periodoBloqueado =
    modoModal === "EDITAR" &&
    !!solicitudActual?.idSolicitud &&
    !!solicitudActual?.idPeriodo;

  // ============================================================
  // GUARDAR BORRADOR
  // ============================================================
  const handleGuardarBorrador = async () => {
    if (!periodoSeleccionado?.idPeriodo) {
      setError("Debes seleccionar un periodo");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const pendientes = obtenerRequeridasPendientes(especialidades, turnosPorEspecialidad);
      if (pendientes.length > 0) {
        const nombres = pendientes.slice(0, 3).map((e) => e.descServicio).join(", ");
        setError(
          `No se puede guardar: hay especialidades requeridas incompletas. Completa: ${nombres}${
            pendientes.length > 3 ? "…" : ""
          }`
        );

        const first = pendientes[0];
        if (first?.idServicio) {
          const el = document.getElementById(`row-${first.idServicio}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          el?.classList.add("bg-amber-50");
          setTimeout(() => el?.classList.remove("bg-amber-50"), 900);
        }
        return;
      }

      const detallesValidos = obtenerRequeridasValidasDeTabla(especialidades, turnosPorEspecialidad);
      if (detallesValidos.length === 0) {
        setError("No hay especialidades requeridas completas para guardar.");
        return;
      }

      const payload = {
        idPeriodo: periodoSeleccionado.idPeriodo,
        detalles: detallesValidos,
      };

      const resultado = await solicitudTurnoService.guardarBorrador(payload);
      setSolicitudActual(resultado);
      setModoModal(resultado?.estado === "BORRADOR" ? "EDITAR" : "VER");

      // ✅ asegura que periodo quede fijado tras guardar
      const periodoFix =
        periodosVigentes.find((p) => p.idPeriodo === resultado?.idPeriodo) ||
        periodoSeleccionado;
      setPeriodoSeleccionado(periodoFix || periodoSeleccionado);

      setSuccess("Borrador guardado exitosamente");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Error al guardar borrador");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ENVIAR
  // ============================================================
  const handleEnviar = async () => {
    if (!periodoSeleccionado?.idPeriodo) {
      setError("Debes seleccionar un periodo");
      return;
    }

    if (valTabla.pendCount > 0) {
      setError("Aún hay especialidades requeridas incompletas. Completa las pendientes antes de enviar.");
      if (valTabla.firstPendingId) {
        const el = document.getElementById(`row-${valTabla.firstPendingId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.classList.add("bg-amber-50");
        setTimeout(() => el?.classList.remove("bg-amber-50"), 900);
      }
      return;
    }

    if (totalTurnos === 0) {
      setError("Debes solicitar al menos un turno antes de enviar.");
      return;
    }

    if (!window.confirm("¿Enviar la solicitud? Luego no podrás modificarla.")) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const detalles = obtenerRequeridasValidasDeTabla(especialidades, turnosPorEspecialidad);
      const payload = { idPeriodo: periodoSeleccionado.idPeriodo, detalles };

      const guardado = await solicitudTurnoService.guardarBorrador(payload);
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

  // ============================================================
  // RENDER
  // ============================================================
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
        <p className="text-blue-100">Administra tus solicitudes. Crea una nueva o edita un borrador existente.</p>
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

      {/* Tabla Mis Solicitudes + Botón Nueva */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0A5BA9]" />
              Mis Solicitudes
            </h2>
            <p className="text-sm text-slate-500">Selecciona una solicitud para ver/editar.</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={refrescarMisSolicitudes}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-2"
              disabled={loadingTabla}
            >
              {loadingTabla ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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

        {misSolicitudes.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            Aún no tienes solicitudes registradas. Haz clic en <strong>Nueva solicitud</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50 text-sm text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Periodo</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Creado</th>
                  <th className="px-4 py-3 text-left">Actualizado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {misSolicitudes.map((row) => {
                  const esBorrador = row.estado === "BORRADOR";
                  return (
                    <tr key={row.idSolicitud} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-slate-700 font-semibold">{row.idSolicitud}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        <div className="font-semibold">{row.periodoDescripcion}</div>
                        <div className="text-xs text-slate-500">Periodo ID: {row.idPeriodo}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${estadoBadgeClass(row.estado)}`}>
                          {row.estado}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatFecha(row.createdAt)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatFecha(row.updatedAt)}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => abrirSolicitudDesdeTabla(row)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {esBorrador ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {esBorrador ? "Editar" : "Ver"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                {solicitudActual?.estado || "—"}
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

          {/* ===================== BLOQUE PERIODO (UX) ===================== */}
          {!esSoloLectura ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0A5BA9]" />
                Periodo de Solicitud
              </h2>

              {/* ✅ EDITAR: periodo solo lectura (sin combo) */}
              {periodoBloqueado ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500">Periodo seleccionado</div>
                      <div className="text-lg font-bold text-slate-900">
                        {solicitudActual?.periodoDescripcion || periodoSeleccionado?.descripcion || "—"}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        ID Periodo: <strong>{solicitudActual?.idPeriodo ?? periodoSeleccionado?.idPeriodo ?? "—"}</strong>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800">
                      <Lock className="w-4 h-4" />
                      Bloqueado
                    </span>
                  </div>

                  {(periodoSeleccionado?.fechaInicio || periodoSeleccionado?.fechaFin) && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">Vigencia del periodo</span>
                      </div>
                      {periodoSeleccionado?.fechaInicio && periodoSeleccionado?.fechaFin ? (
                        <p className="text-sm text-blue-700">
                          {new Date(periodoSeleccionado.fechaInicio).toLocaleDateString("es-PE", { dateStyle: "long" })}{" "}
                          -{" "}
                          {new Date(periodoSeleccionado.fechaFin).toLocaleDateString("es-PE", { dateStyle: "long" })}
                        </p>
                      ) : (
                        <p className="text-sm text-blue-700">{periodoSeleccionado?.descripcion || "—"}</p>
                      )}
                      {periodoSeleccionado?.instrucciones && (
                        <p className="mt-2 text-sm text-blue-600 italic">{periodoSeleccionado.instrucciones}</p>
                      )}
                    </div>
                  )}

                  <p className="mt-3 text-xs text-slate-500">
                    El periodo no se puede modificar una vez creada la solicitud.
                  </p>
                </div>
              ) : (
                /* ✅ NUEVA: combo */
                <>
                  {periodosVigentes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay periodos activos.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <select
                        value={periodoSeleccionado?.idPeriodo || ""}
                        onChange={(e) => {
                          const periodo = periodosVigentes.find((p) => p.idPeriodo === parseInt(e.target.value));
                          setPeriodoSeleccionado(periodo || null);
                        }}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                      >
                        <option value="">Seleccione un periodo...</option>
                        {periodosVigentes.map((periodo) => (
                          <option key={periodo.idPeriodo} value={periodo.idPeriodo}>
                            {periodo.descripcion} ({periodo.periodo})
                          </option>
                        ))}
                      </select>

                      {periodoSeleccionado && (
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-center gap-2 text-blue-800 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">Vigencia del periodo</span>
                          </div>

                          {periodoSeleccionado.fechaInicio && periodoSeleccionado.fechaFin ? (
                            <p className="text-sm text-blue-700">
                              {new Date(periodoSeleccionado.fechaInicio).toLocaleDateString("es-PE", { dateStyle: "long" })}{" "}
                              -{" "}
                              {new Date(periodoSeleccionado.fechaFin).toLocaleDateString("es-PE", { dateStyle: "long" })}
                            </p>
                          ) : (
                            <p className="text-sm text-blue-700">{periodoSeleccionado.descripcion || "—"}</p>
                          )}

                          {periodoSeleccionado.instrucciones && (
                            <p className="mt-2 text-sm text-blue-600 italic">{periodoSeleccionado.instrucciones}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            // ✅ VER: SIN combo, solo tarjeta informativa
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">Periodo</div>
                  <div className="text-lg font-bold text-slate-900">{solicitudActual?.periodoDescripcion || "—"}</div>
                  <div className="text-sm text-slate-600">
                    ID Periodo: <strong>{solicitudActual?.idPeriodo ?? "—"}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${estadoBadgeClass(solicitudActual?.estado || "BORRADOR")}`}>
                    {solicitudActual?.estado || "—"}
                  </span>

                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700">
                    Turnos: <span className="ml-1 font-bold">{solicitudActual?.totalTurnosSolicitados ?? 0}</span>
                  </span>

                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700">
                    Especialidades:{" "}
                    <span className="ml-1 font-bold">
                      {solicitudActual?.totalEspecialidades ?? (solicitudActual?.detalles?.length || 0)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500 mb-1">Enviado</div>
                  <div className="font-semibold text-slate-900">{formatFecha(solicitudActual?.fechaEnvio)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500 mb-1">Creado</div>
                  <div className="font-semibold text-slate-900">{formatFecha(solicitudActual?.createdAt)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500 mb-1">Actualizado</div>
                  <div className="font-semibold text-slate-900">{formatFecha(solicitudActual?.updatedAt)}</div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ VER: Detalle UX (tabla solo lectura) */}
          {esSoloLectura && <SolicitudDetalleView solicitud={solicitudActual} />}

          {/* ✅ EDITAR/NUEVA: tabla editable */}
          {periodoSeleccionado && !esSoloLectura && especialidades.length > 0 && (
            <TurnosPorEspecialidadTabla
              especialidades={especialidades}
              turnosPorEspecialidad={turnosPorEspecialidad}
              setTurnosPorEspecialidad={setTurnosPorEspecialidad}
              esSoloLectura={esSoloLectura}
              onValidationChange={setValTabla}
            />
          )}

          {/* Resumen y Acciones (solo si NO es solo lectura) */}
          {periodoSeleccionado && !esSoloLectura && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-slate-600">
                    Total de turnos solicitados:{" "}
                    <strong className="text-2xl text-[#0A5BA9]">{totalTurnos}</strong>
                  </p>
                  <p className="text-sm text-slate-500">en {especialidadesConTurnos} especialidades</p>

                  {valTabla.pendCount > 0 && (
                    <p className="text-sm text-amber-700 mt-1">
                      Pendientes: <strong>{valTabla.pendCount}</strong>
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGuardarBorrador}
                    disabled={saving}
                    className="px-5 py-2.5 border-2 border-[#0A5BA9] text-[#0A5BA9] font-semibold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Guardar Borrador
                  </button>

                  <button
                    onClick={handleEnviar}
                    disabled={saving || totalTurnos === 0 || valTabla.pendCount > 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Enviar Solicitud
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje final si es solo lectura */}
          {esSoloLectura && (
            <div className="bg-slate-100 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Solicitud {solicitudActual?.estado === "REVISADO" ? "Revisada" : "Enviada"}
              </h3>
              <p className="text-slate-600">
                {solicitudActual?.estado === "REVISADO"
                  ? "Tu solicitud ha sido revisada por el coordinador."
                  : "Tu solicitud ha sido enviada y está pendiente de revisión."}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Total solicitado: {solicitudActual?.totalTurnosSolicitados ?? 0} turnos
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

/** =======================================================================
 * Vista SOLO LECTURA (VER): DETALLE EN TABLA (UX PRO)
 * ======================================================================= */
function SolicitudDetalleView({ solicitud }) {
  if (!solicitud) return null;

  const detalles = Array.isArray(solicitud.detalles) ? solicitud.detalles : [];
  const DIAS_ORDEN = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const ordenaDias = (arr) => {
    const a = Array.isArray(arr) ? arr : [];
    const set = new Set(a);
    return DIAS_ORDEN.filter((d) => set.has(d));
  };

  const chipDia = (active, variant = "default") => {
    const base =
      "inline-flex items-center justify-center min-w-[34px] rounded-full px-2.5 py-1 text-xs font-semibold border transition";
    if (!active) return `${base} bg-slate-50 text-slate-400 border-slate-200`;

    if (variant === "morning") return `${base} bg-sky-50 text-sky-700 border-sky-200`;
    if (variant === "afternoon") return `${base} bg-amber-50 text-amber-800 border-amber-200`;
    return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
  };

  const badge = (active, label, tone = "ok") => {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border";
    if (!active) return <span className={`${base} bg-slate-50 text-slate-500 border-slate-200`}>—</span>;

    if (tone === "morning") return <span className={`${base} bg-sky-50 text-sky-700 border-sky-200`}>{label}</span>;
    if (tone === "afternoon") return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>{label}</span>;

    return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>{label}</span>;
  };

  const formatObs = (t) => (t && String(t).trim().length ? String(t).trim() : "—");

  const totalTurnosTabla = detalles.reduce((acc, d) => acc + Number(d.turnosSolicitados || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Detalle de la solicitud</div>
            <div className="text-lg font-bold text-slate-900">Especialidades solicitadas</div>
            <div className="text-sm text-slate-600">Vista solo lectura. Información cargada desde el backend.</div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700">
              Total turnos: <span className="ml-1 font-bold">{solicitud.totalTurnosSolicitados ?? totalTurnosTabla}</span>
            </span>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700">
              N° especialidades: <span className="ml-1 font-bold">{solicitud.totalEspecialidades ?? detalles.length}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Listado</span> <span className="text-slate-500">({detalles.length})</span>
          </div>
          <div className="text-xs text-slate-500">* Días marcados por turno (Mañana / Tarde)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 text-xs text-slate-700 sticky top-0 z-10">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-bold border-b border-slate-200">
                <th className="w-14">#</th>
                <th className="min-w-[260px]">Especialidad</th>
                <th className="w-28">Código</th>
                <th className="w-24 text-right">Turnos</th>
                <th className="w-28 text-center">Mañana</th>
                <th className="min-w-[220px] text-center">Días Mañana</th>
                <th className="w-28 text-center">Tarde</th>
                <th className="min-w-[220px] text-center">Días Tarde</th>
                <th className="min-w-[220px]">Observación</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {detalles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                    No hay detalles registrados.
                  </td>
                </tr>
              ) : (
                detalles.map((d, idx) => {
                  const man = !!d.mananaActiva;
                  const tar = !!d.tardeActiva;

                  const manDias = ordenaDias(d.diasManana);
                  const tarDias = ordenaDias(d.diasTarde);

                  return (
                    <tr key={d.idDetalle ?? `${d.idServicio}-${idx}`} className="hover:bg-slate-50">
                      <td className="px-4 py-4 text-sm text-slate-500">{idx + 1}</td>

                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{d.nombreEspecialidad || "—"}</div>
                        <div className="text-xs text-slate-500">
                          Servicio ID: <span className="font-semibold">{d.idServicio ?? "—"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">{d.codServicio || "—"}</td>

                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border border-blue-200 bg-blue-50 text-[#0A5BA9]">
                          {Number(d.turnosSolicitados || 0)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">{badge(man, "Activa", "morning")}</td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {DIAS_ORDEN.map((dia) => (
                            <span key={`m-${d.idDetalle}-${dia}`} className={chipDia(man && manDias.includes(dia), "morning")}>
                              {dia}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">{badge(tar, "Activa", "afternoon")}</td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {DIAS_ORDEN.map((dia) => (
                            <span key={`t-${d.idDetalle}-${dia}`} className={chipDia(tar && tarDias.includes(dia), "afternoon")}>
                              {dia}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">{formatObs(d.observacion)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {detalles.length > 0 && (
              <tfoot className="bg-white">
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-4" colSpan={3}>
                    <span className="text-sm text-slate-500">Totales</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700">
                      {solicitud.totalTurnosSolicitados ?? totalTurnosTabla}
                    </span>
                  </td>
                  <td className="px-4 py-4" colSpan={5}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

/** =======================================================================
 * TurnosPorEspecialidadTabla (tu tabla editable) - SIN CAMBIOS
 * ======================================================================= */
function TurnosPorEspecialidadTabla({
  especialidades,
  turnosPorEspecialidad,
  setTurnosPorEspecialidad,
  esSoloLectura,
  onValidationChange,
}) {
  const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all|required|pending|complete|not_required

  const getEstadoFila = (row) => {
    if (!row?.requiere) return "not_required";
    const turnosOk = (row.turnos || 0) >= 1;
    const mananaOk = row.mananaActiva && (row.diasManana?.length || 0) > 0;
    const tardeOk = row.tardeActiva && (row.diasTarde?.length || 0) > 0;
    const tieneTurnoConDias = mananaOk || tardeOk;
    return turnosOk && tieneTurnoConDias ? "complete" : "pending";
  };

  const visibles = especialidades
    .map((esp, idx) => ({
      esp,
      idx,
      row: turnosPorEspecialidad[esp.idServicio] || createEmptyRow(),
    }))
    .filter(({ esp }) => {
      const q = search.toLowerCase();
      return (
        (esp.descServicio || "").toLowerCase().includes(q) ||
        (esp.codServicio || "").toLowerCase().includes(q)
      );
    })
    .filter(({ row }) => {
      const st = getEstadoFila(row);
      if (filter === "all") return true;
      if (filter === "required") return row.requiere;
      if (filter === "pending") return st === "pending";
      if (filter === "complete") return st === "complete";
      if (filter === "not_required") return st === "not_required";
      return true;
    });

  const totals = especialidades.map((esp) =>
    getEstadoFila(turnosPorEspecialidad[esp.idServicio] || createEmptyRow())
  );

  const totalCount = especialidades.length;
  const reqCount = especialidades.filter((esp) => turnosPorEspecialidad[esp.idServicio]?.requiere).length;
  const okCount = totals.filter((t) => t === "complete").length;
  const pendCount = totals.filter((t) => t === "pending").length;
  const progressPct = reqCount === 0 ? 0 : Math.round((okCount / reqCount) * 100);

  const firstPendingId =
    especialidades.find(
      (esp) => getEstadoFila(turnosPorEspecialidad[esp.idServicio] || createEmptyRow()) === "pending"
    )?.idServicio ?? null;

  useEffect(() => {
    onValidationChange?.({ pendCount, reqCount, okCount, firstPendingId });
  }, [pendCount, reqCount, okCount, firstPendingId, onValidationChange]);

  const pendingList = especialidades
    .filter((esp) => getEstadoFila(turnosPorEspecialidad[esp.idServicio] || createEmptyRow()) === "pending")
    .map((esp) => esp.descServicio)
    .slice(0, 3)
    .join(", ");

  const patchRow = (idServicio, patch) => {
    setTurnosPorEspecialidad((prev) => ({
      ...prev,
      [idServicio]: {
        ...createEmptyRow(),
        ...prev[idServicio],
        ...patch,
      },
    }));
  };

  const toggleDia = (idServicio, campoDias, dia) => {
    setTurnosPorEspecialidad((prev) => {
      const current = prev[idServicio]?.[campoDias] || [];
      const exists = current.includes(dia);
      const nextDias = exists ? current.filter((d) => d !== dia) : [...current, dia];
      return {
        ...prev,
        [idServicio]: { ...prev[idServicio], [campoDias]: nextDias },
      };
    });
  };

  const irAPendiente = () => {
    const firstPending = visibles.find(({ row }) => getEstadoFila(row) === "pending");
    if (!firstPending) return;
    const el = document.getElementById(`row-${firstPending.esp.idServicio}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.classList.add("bg-amber-50");
    setTimeout(() => el?.classList.remove("bg-amber-50"), 900);
  };

  const chipClass = (active) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition ${
      active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200"
    }`;

  const estadoBadge = (st) => {
    if (st === "complete") return "bg-green-50 text-green-700 border-green-200";
    if (st === "pending") return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6">
            <label className="text-sm font-semibold text-gray-700">Buscar especialidad</label>
            <input
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Ej: cardio, dermato…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={esSoloLectura}
            />
          </div>

          <div className="lg:col-span-3">
            <label className="text-sm font-semibold text-gray-700">Ver</label>
            <select
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={esSoloLectura}
            >
              <option value="all">Todas</option>
              <option value="required">Solo requeridas</option>
              <option value="not_required">Solo no requeridas</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-indigo-50 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Especialidad</th>
              <th className="px-4 py-3 text-center">Requiere</th>
              <th className="px-4 py-3 text-center">N° turnos</th>
              <th className="px-4 py-3 text-center">Mañana</th>
              <th className="px-4 py-3 text-center">Días (Mañana)</th>
              <th className="px-4 py-3 text-center">Tarde</th>
              <th className="px-4 py-3 text-center">Días (Tarde)</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {visibles.map(({ esp, idx, row }) => {
              const st = getEstadoFila(row);
              return (
                <tr key={esp.idServicio} id={`row-${esp.idServicio}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-slate-500">{idx + 1}</td>

                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">{esp.descServicio}</div>
                    {esp.codServicio && <div className="text-xs text-slate-500">Código: {esp.codServicio}</div>}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={!!row.requiere}
                      onChange={(e) => patchRow(esp.idServicio, { requiere: e.target.checked })}
                      disabled={esSoloLectura}
                      className="h-5 w-5 accent-indigo-600"
                    />
                    <div className="text-xs text-slate-500 mt-1">{row.requiere ? "Sí" : "No"}</div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={row.turnos ?? 0}
                      onChange={(e) => patchRow(esp.idServicio, { turnos: Math.max(0, parseInt(e.target.value) || 0) })}
                      disabled={esSoloLectura || !row.requiere}
                      className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm text-center font-semibold disabled:bg-slate-50"
                    />
                  </td>

                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={!!row.mananaActiva}
                      onChange={(e) =>
                        patchRow(esp.idServicio, {
                          mananaActiva: e.target.checked,
                          diasManana: e.target.checked ? row.diasManana : [],
                        })
                      }
                      disabled={esSoloLectura || !row.requiere}
                      className="h-5 w-5 accent-indigo-600"
                    />
                    <div className="text-xs text-slate-400 mt-1">{row.mananaActiva ? "Activo" : "Inactivo"}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div className={`flex flex-wrap gap-1 justify-center ${!row.requiere || !row.mananaActiva ? "opacity-50" : ""}`}>
                      {DIAS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={chipClass(row.diasManana?.includes(d))}
                          onClick={() => toggleDia(esp.idServicio, "diasManana", d)}
                          disabled={esSoloLectura || !row.requiere || !row.mananaActiva}
                        >
                          {d}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600"
                        onClick={() => patchRow(esp.idServicio, { diasManana: [] })}
                        disabled={esSoloLectura || !row.requiere || !row.mananaActiva}
                      >
                        Limpiar
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={!!row.tardeActiva}
                      onChange={(e) =>
                        patchRow(esp.idServicio, {
                          tardeActiva: e.target.checked,
                          diasTarde: e.target.checked ? row.diasTarde : [],
                        })
                      }
                      disabled={esSoloLectura || !row.requiere}
                      className="h-5 w-5 accent-indigo-600"
                    />
                    <div className="text-xs text-slate-400 mt-1">{row.tardeActiva ? "Activo" : "Inactivo"}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div className={`flex flex-wrap gap-1 justify-center ${!row.requiere || !row.tardeActiva ? "opacity-50" : ""}`}>
                      {DIAS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={chipClass(row.diasTarde?.includes(d))}
                          onClick={() => toggleDia(esp.idServicio, "diasTarde", d)}
                          disabled={esSoloLectura || !row.requiere || !row.tardeActiva}
                        >
                          {d}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600"
                        onClick={() => patchRow(esp.idServicio, { diasTarde: [] })}
                        disabled={esSoloLectura || !row.requiere || !row.tardeActiva}
                      >
                        Limpiar
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${estadoBadge(st)}`}>
                      {st === "complete" ? "Completa" : st === "pending" ? "Pendiente" : "No requerida"}
                    </span>
                  </td>
                </tr>
              );
            })}

            {visibles.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                  No hay resultados con esos filtros/búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-gray-700">
            Total: <strong>{totalCount}</strong> · Requeridas: <strong>{reqCount}</strong> · Completas:{" "}
            <strong>{okCount}</strong> · Pendientes: <strong>{pendCount}</strong>
            <span className="ml-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Progreso <span className="ml-1">{progressPct}</span>%
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={irAPendiente}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={esSoloLectura || pendCount === 0}
            >
              Ir a pendiente
            </button>
          </div>
        </div>

        {pendCount > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="font-semibold">Falta completar</div>
            <div className="mt-1 text-amber-900/80">
              En especialidades requeridas, indique <strong>N° turnos</strong> y seleccione días. Ej.:{" "}
              <span className="font-semibold">{pendingList || "—"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

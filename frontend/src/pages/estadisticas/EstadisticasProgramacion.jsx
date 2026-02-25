// ========================================================================
// 📊 EstadisticasProgramacion.jsx
// Módulo: Estadísticas de Programación
// Ruta: /estadisticas/programacion
// Tablas: consolidado_pendientes_mensual | detalle_pendientes_mensual
// ========================================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart3,
  Users,
  TrendingDown,
  Activity,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
  FileText,
  AlertCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  obtenerKpis,
  obtenerConsolidado,
  obtenerDetalle,
  obtenerDetallePorMedico,
} from "../../services/pendientesMensualesService";

// ── Constantes ──────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const CENATE_BLUE = "#0D5BA9";

const AVATAR_COLORS = [
  "bg-orange-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-red-500",
];
const avatarColor = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length];

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtFecha(raw) {
  if (!raw) return "—";
  try {
    const d = new Date(raw + "T00:00:00");
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("es-PE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return raw; }
}

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function useDebounce(value, delay = 400) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, bg = "bg-gray-100", textColor = "text-gray-800", loading }) {
  return (
    <div className={`rounded-xl border border-gray-200 p-4 ${bg} flex items-center gap-4`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        {loading
          ? <div className="h-7 w-14 bg-white/60 animate-pulse rounded mt-0.5" />
          : <p className={`text-2xl font-bold ${textColor}`}>{value?.toLocaleString("es-PE") ?? "—"}</p>
        }
      </div>
    </div>
  );
}

function AbandonoBadge({ value }) {
  const n = typeof value === "number" ? value : parseInt(value) || 0;
  if (n === 0)  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Sin abandono</span>;
  if (n < 5)    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><TrendingDown className="w-3 h-3" />{n}</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><TrendingDown className="w-3 h-3" />{n}</span>;
}

function SubactividadBadge({ value }) {
  if (!value) return <span className="text-gray-400">—</span>;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
      {value}
    </span>
  );
}

// Dropdown con búsqueda interna
function FilterSelect({ label, value, onChange, options, placeholder = "Todos" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 text-xs bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50">
            <li>
              <button onClick={() => { onChange(""); setOpen(false); setQ(""); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50">
                {placeholder}
              </button>
            </li>
            {filtered.map((opt) => (
              <li key={opt}>
                <button onClick={() => { onChange(opt); setOpen(false); setQ(""); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 ${value === opt ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}>
                  {opt}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// Drawer detalle de pacientes del médico
function DrawerMedico({ medico, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!medico?.dniMedico) return;
    setLoading(true);
    obtenerDetallePorMedico(medico.dniMedico)
      .then(setRows)
      .catch(() => toast.error("No se pudo cargar el detalle"))
      .finally(() => setLoading(false));
  }, [medico?.dniMedico]);

  const totalAbandono = medico?.abandono ?? 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">

        {/* Header drawer — CENATE Blue */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-800"
          style={{ backgroundColor: CENATE_BLUE }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {iniciales(medico?.profesional)}
            </div>
            <div>
              <p className="font-semibold text-white text-sm leading-tight">{medico?.profesional ?? "—"}</p>
              <p className="text-white/60 text-xs">DNI: {medico?.dniMedico ?? "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* KPIs del médico */}
        <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-100">
          <div className="rounded-xl border border-gray-200 p-3 bg-blue-50 flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pacientes</p>
              <p className="text-xl font-bold text-blue-700">{loading ? "..." : rows.length}</p>
            </div>
          </div>
          <div className={`rounded-xl border border-gray-200 p-3 flex items-center gap-3 ${totalAbandono === 0 ? "bg-green-50" : totalAbandono < 5 ? "bg-yellow-50" : "bg-red-50"}`}>
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <TrendingDown className={`w-4 h-4 ${totalAbandono === 0 ? "text-green-600" : totalAbandono < 5 ? "text-yellow-600" : "text-red-600"}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Abandonos</p>
              <p className={`text-xl font-bold ${totalAbandono === 0 ? "text-green-700" : totalAbandono < 5 ? "text-yellow-700" : "text-red-700"}`}>{totalAbandono}</p>
            </div>
          </div>

          {/* Servicio & Fecha */}
          <div className="col-span-2 rounded-xl border border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between items-center gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Servicio</p>
                <p className="font-semibold text-gray-700 truncate max-w-[160px]">{medico?.servicio ?? "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Fecha Cita</p>
                <p className="font-semibold text-gray-700">{fmtFecha(medico?.fechaCita)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista nominal */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Pacientes nominales ({loading ? "..." : rows.length})
            </p>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">Sin registros nominales</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 px-2 pb-4">
              {rows.map((row, idx) => (
                <div key={row.idDetPend ?? idx} className="flex items-center gap-3 py-3 px-2 hover:bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full ${avatarColor(idx)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                    {iniciales(row.paciente)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{row.paciente ?? "—"}</p>
                    <p className="text-xs text-gray-500">DNI: {row.docPaciente ?? "—"} · {fmtFecha(row.fechaCita)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${row.abandono && row.abandono !== "0" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {row.abandono || "Ok"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sub-componentes Drawer helpers ────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-800 font-medium text-right ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function EstadisticasProgramacion() {

  // ── Estado ────────────────────────────────────────────────────────────────
  const [tab, setTab]           = useState("resumen");
  const [kpis, setKpis]         = useState(null);
  const [kpisLoading, setKL]    = useState(true);

  const [rows, setRows]               = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPaginas, setTotalPags]  = useState(0);
  const [loading, setLoading]         = useState(false);
  const [pagina, setPagina]           = useState(0);

  // Filtros
  const [subactividad, setSubactividad] = useState("");
  const [profesional, setProfesional]   = useState("");
  const [servicio, setServicio]         = useState("");
  const [busqueda, setBusqueda]         = useState("");
  const [pendingBusqueda, setPending]   = useState("");
  const debProfesional = useDebounce(profesional);

  // Opciones dropdowns
  const [optsSubact, setOptsSubact]   = useState([]);
  const [optsServicio, setOptsServicio] = useState([]);

  // Drawer médico
  const [medicoSel, setMedicoSel] = useState(null);

  // Fecha de corte
  const [fechaCorte, setFechaCorte] = useState(null);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setKL(true);
    obtenerKpis()
      .then((d) => {
        setKpis(d);
        if (d?.porSubactividad?.length)
          setOptsSubact(d.porSubactividad.map((s) => s.subactividad).filter(Boolean));
        if (d?.topServiciosPorAbandonos?.length)
          setOptsServicio(d.topServiciosPorAbandonos.map((s) => s.servicio).filter(Boolean));
      })
      .catch(() => toast.error("No se pudo cargar los KPIs"))
      .finally(() => setKL(false));
  }, []);

  // ── Fetch tabla ───────────────────────────────────────────────────────────
  const fetchData = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const params = {
        subactividad: subactividad || undefined,
        servicio:     servicio     || undefined,
        page: pg, size: PAGE_SIZE,
      };

      let result;
      if (tab === "resumen") {
        if (debProfesional) params.busqueda = debProfesional;
        result = await obtenerConsolidado(params);
      } else {
        const q = busqueda || debProfesional || undefined;
        if (q) params.busqueda = q;
        result = await obtenerDetalle(params);
      }

      const content = result?.content ?? result ?? [];
      const list = Array.isArray(content) ? content : [];
      setRows(list);
      setTotal(result?.totalElements ?? list.length ?? 0);
      setTotalPags(result?.totalPages ?? 1);
      setPagina(pg);
      if (pg === 0 && list.length > 0) setFechaCorte(list[0]?.fechaCita ?? null);

    } catch (e) {
      console.error("❌ fetchData:", e);
      toast.error("Error al cargar los datos");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab, subactividad, servicio, busqueda, debProfesional]);

  useEffect(() => { fetchData(0); }, [fetchData]);

  // ── Limpiar filtros ───────────────────────────────────────────────────────
  const limpiarFiltros = () => {
    setSubactividad(""); setProfesional(""); setServicio("");
    setBusqueda(""); setPending(""); setPagina(0);
  };

  const aplicarBusqueda = () => { setBusqueda(pendingBusqueda.trim()); setPagina(0); };

  // ── Exportar CSV ──────────────────────────────────────────────────────────
  const exportarCSV = () => {
    if (!rows.length) return toast.error("Sin datos para exportar");
    const headers = tab === "resumen"
      ? ["DNI Médico","Profesional","Fecha Cita","Subactividad","Servicio","Abandonos"]
      : ["DNI Médico","Profesional","Fecha Cita","Subactividad","Servicio","DNI Paciente","Paciente","Abandono"];
    const csvRows = rows.map((r) =>
      tab === "resumen"
        ? [r.dniMedico, `"${r.profesional}"`, r.fechaCita, r.subactividad, `"${r.servicio}"`, r.abandono].join(",")
        : [r.dniMedico, `"${r.profesional}"`, r.fechaCita, r.subactividad, `"${r.servicio}"`, r.docPaciente, `"${r.paciente}"`, `"${r.abandono}"`].join(",")
    );
    const csv  = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `pendientes_${tab}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: "#dbeafe" }}>
            <BarChart3 className="w-6 h-6" style={{ color: CENATE_BLUE }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Estadísticas de Programación</h1>
            <p className="text-sm text-gray-500">
              Pendientes mensuales por profesional
              {fechaCorte && <> · <span className="font-medium">Fecha de corte: {fmtFecha(fechaCorte)}</span></>}
            </p>
          </div>
        </div>
        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Médicos con Pendientes"
          value={kpis?.totalMedicos}
          bg="bg-blue-50"
          textColor="text-blue-700"
          loading={kpisLoading}
        />
        <KpiCard
          icon={<User className="w-5 h-5 text-cyan-600" />}
          label="Pacientes Pendientes"
          value={kpis?.totalPacientes}
          bg="bg-cyan-50"
          textColor="text-cyan-700"
          loading={kpisLoading}
        />
        <KpiCard
          icon={<TrendingDown className="w-5 h-5 text-red-500" />}
          label="Total Abandonos"
          value={kpis?.totalAbandonos}
          bg="bg-red-50"
          textColor="text-red-700"
          loading={kpisLoading}
        />
        <KpiCard
          icon={<Activity className="w-5 h-5 text-purple-600" />}
          label="Subactividades"
          value={kpis?.porSubactividad?.length}
          bg="bg-purple-50"
          textColor="text-purple-700"
          loading={kpisLoading}
        />
      </div>

      {/* ── Tabs RESUMEN / NOMINAL ──────────────────────────────────────────── */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-4 bg-white shadow-sm w-full max-w-sm">
        {[
          { key: "resumen", label: "RESUMEN",  sub: "Por profesional" },
          { key: "nominal", label: "NOMINAL",  sub: "Por paciente"    },
        ].map(({ key, label, sub }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPagina(0); setBusqueda(""); setPending(""); setProfesional(""); }}
            className="flex-1 py-3 text-center transition-all duration-200 font-bold text-sm tracking-wider uppercase"
            style={tab === key
              ? { backgroundColor: CENATE_BLUE, color: "white" }
              : { backgroundColor: "white", color: CENATE_BLUE }}
          >
            {label}
            <span className="block text-[10px] font-normal tracking-normal normal-case opacity-70 mt-0.5">{sub}</span>
          </button>
        ))}
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Subactividad */}
          <div className="w-44">
            <FilterSelect
              label="Subactividad"
              value={subactividad}
              onChange={setSubactividad}
              options={optsSubact}
              placeholder="Todas"
            />
          </div>

          {/* Profesional */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Profesional de Salud</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={profesional}
                onChange={(e) => setProfesional(e.target.value)}
                placeholder="Nombre o DNI médico..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Servicio */}
          <div className="w-52">
            <FilterSelect
              label="Servicio"
              value={servicio}
              onChange={setServicio}
              options={optsServicio}
              placeholder="Todos"
            />
          </div>

          {/* Búsqueda paciente (solo nominal) */}
          {tab === "nominal" && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-500 mb-1">Buscar Paciente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={pendingBusqueda}
                  onChange={(e) => setPending(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && aplicarBusqueda()}
                  placeholder="DNI o nombre del paciente..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2">
            {tab === "nominal" && (
              <button
                onClick={aplicarBusqueda}
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: CENATE_BLUE }}
              >
                <Search className="w-4 h-4" /> Buscar
              </button>
            )}
            <button
              onClick={() => fetchData(0)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              title="Limpiar filtros"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Cargando datos...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">Sin resultados para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            {/* ── TABLA RESUMEN ─────────────────────────────────────────────── */}
            {tab === "resumen" && (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: CENATE_BLUE }}>
                  <tr>
                    {["#", "Profesional", "DNI Médico", "Servicio", "Subactividad", "Fecha Cita", "Abandonos", ""].map((h, i) => (
                      <th key={i} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, idx) => (
                    <tr key={row.idConsPend ?? idx} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full ${avatarColor(idx)} flex items-center justify-center text-white font-bold text-xs`}>
                          {pagina * PAGE_SIZE + idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${avatarColor(idx)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                            {iniciales(row.profesional)}
                          </div>
                          <span className="truncate">{row.profesional ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{row.dniMedico ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-700 max-w-[180px] truncate" title={row.servicio}>{row.servicio ?? "—"}</td>
                      <td className="px-6 py-4"><SubactividadBadge value={row.subactividad} /></td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{fmtFecha(row.fechaCita)}</td>
                      <td className="px-6 py-4"><AbandonoBadge value={row.abandono} /></td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setMedicoSel(row)}
                          className="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors hover:text-white"
                          style={{ borderColor: CENATE_BLUE, color: CENATE_BLUE }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = CENATE_BLUE; e.currentTarget.style.color = "white"; }}
                          onMouseOut={(e)  => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = CENATE_BLUE; }}
                        >
                          Ver pacientes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── TABLA NOMINAL ─────────────────────────────────────────────── */}
            {tab === "nominal" && (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: CENATE_BLUE }}>
                  <tr>
                    {["#", "Paciente", "DNI Paciente", "Médico", "Servicio", "Subactividad", "Fecha Cita", "Estado", ""].map((h, i) => (
                      <th key={i} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, idx) => (
                    <tr key={row.idDetPend ?? idx} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-gray-400 text-xs">{pagina * PAGE_SIZE + idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 max-w-[180px]">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${avatarColor(idx)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                            {iniciales(row.paciente)}
                          </div>
                          <span className="truncate">{row.paciente ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{row.docPaciente ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-700 max-w-[160px] truncate" title={row.profesional}>{row.profesional ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-700 max-w-[160px] truncate" title={row.servicio}>{row.servicio ?? "—"}</td>
                      <td className="px-6 py-4"><SubactividadBadge value={row.subactividad} /></td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{fmtFecha(row.fechaCita)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${row.abandono && row.abandono !== "0" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {row.abandono || "Activo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setMedicoSel({ dniMedico: row.dniMedico, profesional: row.profesional, servicio: row.servicio, fechaCita: row.fechaCita, abandono: null })}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
                          title="Ver resumen del médico"
                        >
                          <User className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Paginación ──────────────────────────────────────────────────── */}
        {!loading && rows.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>
              Mostrando {pagina * PAGE_SIZE + 1}–{Math.min((pagina + 1) * PAGE_SIZE, total)} de{" "}
              <span className="font-semibold text-gray-800">{total.toLocaleString("es-PE")}</span> registros
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchData(pagina - 1)}
                disabled={pagina === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                style={{ backgroundColor: CENATE_BLUE }}>
                {pagina + 1} / {totalPaginas || 1}
              </span>
              <button
                onClick={() => fetchData(pagina + 1)}
                disabled={pagina >= totalPaginas - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Panel resumen por subactividad ──────────────────────────────────── */}
      {kpis?.porSubactividad?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: CENATE_BLUE }} />
            <h3 className="text-sm font-semibold text-gray-700">Resumen por Subactividad</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Subactividad", "Médicos", "Abandonos", "Distribución"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kpis.porSubactividad.map((s, idx) => {
                  const pct = kpis.totalAbandonos > 0 ? Math.round((s.abandonos / kpis.totalAbandonos) * 100) : 0;
                  return (
                    <tr key={s.subactividad} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <SubactividadBadge value={s.subactividad} />
                      </td>
                      <td className="px-6 py-3 text-gray-700 font-semibold">{s.medicos}</td>
                      <td className="px-6 py-3">
                        <AbandonoBadge value={Number(s.abandonos)} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden max-w-[120px]">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CENATE_BLUE }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Drawer médico ─────────────────────────────────────────────────────── */}
      {medicoSel && (
        <DrawerMedico
          medico={medicoSel}
          onClose={() => setMedicoSel(null)}
        />
      )}
    </div>
  );
}

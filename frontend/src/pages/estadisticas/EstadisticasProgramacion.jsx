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
  AlertTriangle,
  Calendar,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Stethoscope,
  Activity,
  Clock,
  FileText,
  TrendingDown,
  Download,
  Filter,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  obtenerKpis,
  obtenerConsolidado,
  obtenerDetalle,
  obtenerDetallePorMedico,
} from "../../services/pendientesMensualesService";

// ── Constantes ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const COLOR_PRIMARIO = "#2d5875";   // Azul CENATE oscuro (wireframe)
const COLOR_ACENTO   = "#3b82f6";   // Azul claro para hover/badge

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtFecha(raw) {
  if (!raw) return "—";
  try {
    const d = new Date(raw + "T00:00:00");
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return raw; }
}

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Subcomponente: KPI Card ─────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color = COLOR_PRIMARIO, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-800">{value?.toLocaleString("es-PE") ?? "—"}</p>
        )}
      </div>
    </div>
  );
}

// ── Subcomponente: Badge de abandono ───────────────────────────────────────
function AbandonoBadge({ value }) {
  const n = typeof value === "number" ? value : parseInt(value) || 0;
  const color = n === 0 ? "text-green-700 bg-green-50" : n < 5 ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {n === 0 ? "Sin abandono" : `${n} abandono${n !== 1 ? "s" : ""}`}
    </span>
  );
}

// ── Subcomponente: Selector con búsqueda ───────────────────────────────────
function SearchSelect({ label, icon: Icon, value, onChange, options, placeholder = "Todos" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex-1 min-w-[180px]" ref={ref}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1.5 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-70" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                placeholder="Buscar..."
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            <li>
              <button
                onClick={() => { onChange(""); setOpen(false); setQ(""); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
              >
                {placeholder}
              </button>
            </li>
            {filtered.map((opt) => (
              <li key={opt}>
                <button
                  onClick={() => { onChange(opt); setOpen(false); setQ(""); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 ${value === opt ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                >
                  {opt}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Subcomponente: Drawer Resumen Médico ───────────────────────────────────
function DrawerResumen({ medico, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!medico?.dniMedico) return;
    setLoading(true);
    obtenerDetallePorMedico(medico.dniMedico)
      .then((rows) => setData(rows))
      .catch(() => toast.error("No se pudo cargar el detalle"))
      .finally(() => setLoading(false));
  }, [medico?.dniMedico]);

  if (!medico) return null;

  const totalAbandono = medico.abandono ?? 0;
  const total = data?.length ?? 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100"
          style={{ background: `linear-gradient(135deg, ${COLOR_PRIMARIO} 0%, #1e3f5a 100%)` }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base">
              {iniciales(medico.profesional)}
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">{medico.profesional}</p>
              <p className="text-white/60 text-xs">DNI: {medico.dniMedico ?? "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* KPIs del médico */}
        <div className="grid grid-cols-2 gap-3 p-5 border-b border-gray-100">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{total}</p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">Pacientes Pendientes</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${totalAbandono === 0 ? "bg-green-50" : totalAbandono < 5 ? "bg-yellow-50" : "bg-red-50"}`}>
            <p className={`text-2xl font-bold ${totalAbandono === 0 ? "text-green-700" : totalAbandono < 5 ? "text-yellow-700" : "text-red-700"}`}>
              {totalAbandono}
            </p>
            <p className={`text-xs font-medium mt-0.5 ${totalAbandono === 0 ? "text-green-600" : totalAbandono < 5 ? "text-yellow-600" : "text-red-600"}`}>
              Abandonos
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center col-span-1">
            <p className="text-sm font-semibold text-gray-700 truncate">{medico.servicio ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Servicio</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center col-span-1">
            <p className="text-sm font-semibold text-gray-700">{fmtFecha(medico.fechaCita)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Fecha Cita</p>
          </div>
        </div>

        {/* Tabla de pacientes del médico */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-4 pb-2">
            Pacientes nominales
          </p>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !data?.length ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin registros nominales</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.map((row, idx) => (
                <div key={row.idDetPend ?? idx} className="py-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0">
                    {iniciales(row.paciente)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{row.paciente ?? "—"}</p>
                    <p className="text-xs text-gray-500">DNI: {row.docPaciente ?? "—"} · {fmtFecha(row.fechaCita)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${row.abandono && row.abandono !== "0" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
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

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function EstadisticasProgramacion() {
  // ── Estado principal ──────────────────────────────────────────────────────
  const [tab, setTab] = useState("resumen");          // "resumen" | "nominal"
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  // Datos de tabla
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagina, setPagina] = useState(0);

  // Filtros
  const [subactividad, setSubactividad] = useState("");
  const [profesional, setProfesional] = useState("");
  const [servicio, setServicio] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda);
  const debouncedProfesional = useDebounce(profesional);

  // Opciones dinámicas para dropdowns
  const [optsSubactividad, setOptsSubactividad] = useState([]);
  const [optsServicio, setOptsServicio] = useState([]);

  // Drawer médico
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);

  // Última fecha de corte (max fecha_cita en datos)
  const [fechaCorte, setFechaCorte] = useState(null);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setKpisLoading(true);
    obtenerKpis()
      .then((d) => setKpis(d))
      .catch(() => toast.error("No se pudo cargar los KPIs"))
      .finally(() => setKpisLoading(false));
  }, []);

  // ── Fetch tabla ───────────────────────────────────────────────────────────
  const fetchData = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const params = {
        subactividad: subactividad || undefined,
        servicio: servicio || undefined,
        page: pg,
        size: PAGE_SIZE,
      };

      let result;
      if (tab === "resumen") {
        if (debouncedProfesional) params.busqueda = debouncedProfesional;
        result = await obtenerConsolidado(params);
      } else {
        if (debouncedBusqueda) params.busqueda = debouncedBusqueda;
        if (debouncedProfesional) params.busqueda = debouncedBusqueda || debouncedProfesional;
        result = await obtenerDetalle(params);
      }

      const content = result?.content ?? result ?? [];
      setRows(Array.isArray(content) ? content : []);
      setTotal(result?.totalElements ?? content.length ?? 0);
      setTotalPaginas(result?.totalPages ?? 1);
      setPagina(pg);

      // Extraer opciones únicas para filtros desde primera carga
      if (pg === 0) {
        if (content.length > 0) {
          setFechaCorte(content[0]?.fechaCita ?? null);
        }
      }
    } catch (e) {
      console.error("Error fetchData:", e);
      toast.error("Error al cargar los datos");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tab, subactividad, servicio, debouncedBusqueda, debouncedProfesional]);

  // Cargar opciones únicas desde KPIs
  useEffect(() => {
    if (kpis?.porSubactividad?.length) {
      setOptsSubactividad(kpis.porSubactividad.map((s) => s.subactividad).filter(Boolean));
    }
    if (kpis?.topServiciosPorAbandonos?.length) {
      setOptsServicio(kpis.topServiciosPorAbandonos.map((s) => s.servicio).filter(Boolean));
    }
  }, [kpis]);

  useEffect(() => {
    fetchData(0);
  }, [fetchData]);

  // ── Exportar CSV ──────────────────────────────────────────────────────────
  const exportarCSV = () => {
    if (!rows.length) return toast.error("Sin datos para exportar");
    const headers = tab === "resumen"
      ? ["DNI Médico", "Profesional", "Fecha Cita", "Subactividad", "Servicio", "Abandonos"]
      : ["DNI Médico", "Profesional", "Fecha Cita", "Subactividad", "Servicio", "DNI Paciente", "Paciente", "Abandono"];

    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        tab === "resumen"
          ? [r.dniMedico, `"${r.profesional}"`, r.fechaCita, r.subactividad, `"${r.servicio}"`, r.abandono].join(",")
          : [r.dniMedico, `"${r.profesional}"`, r.fechaCita, r.subactividad, `"${r.servicio}"`, r.docPaciente, `"${r.paciente}"`, `"${r.abandono}"`].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pendientes_${tab}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado correctamente");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Barra superior azul ─────────────────────────────────────────── */}
      <div style={{ backgroundColor: COLOR_PRIMARIO }} className="px-6 py-4 shadow-lg">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">
                Estadísticas de Programación
              </h1>
              <p className="text-white/60 text-xs">Pendientes mensuales por profesional</p>
            </div>
          </div>
          {fechaCorte && (
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold">Fecha de Corte</p>
              <p className="text-white font-semibold text-sm">{fmtFecha(fechaCorte)}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 pt-5 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Users}         label="Médicos con Pendientes" value={kpis?.totalMedicos}   loading={kpisLoading} />
          <KpiCard icon={User}          label="Pacientes Pendientes"   value={kpis?.totalPacientes} loading={kpisLoading} color="#0891b2" />
          <KpiCard icon={TrendingDown}  label="Total Abandonos"        value={kpis?.totalAbandonos} loading={kpisLoading} color="#dc2626" />
          <KpiCard icon={Activity}      label="Subactividades"         value={kpis?.porSubactividad?.length} loading={kpisLoading} color="#7c3aed" />
        </div>
      </div>

      {/* ── Pestañas RESUMEN / NOMINAL ─────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 pt-4">
        <div className="grid grid-cols-2 rounded-xl overflow-hidden shadow-sm border border-gray-200">
          {[
            { key: "resumen", label: "RESUMEN", sub: "Por profesional" },
            { key: "nominal", label: "NOMINAL", sub: "Por paciente" },
          ].map(({ key, label, sub }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setPagina(0); setBusqueda(""); setProfesional(""); }}
              className="py-4 text-center transition-all duration-200 font-bold text-sm tracking-widest uppercase"
              style={tab === key
                ? { backgroundColor: COLOR_PRIMARIO, color: "white" }
                : { backgroundColor: "white", color: COLOR_PRIMARIO }}
            >
              {label}
              <span className="block text-[10px] font-normal tracking-normal normal-case opacity-70 mt-0.5">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filtros ────────────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: COLOR_PRIMARIO }} className="mt-0.5">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-4 items-end">

            {/* Subactividad */}
            <SearchSelect
              label="Subactividad"
              icon={Activity}
              value={subactividad}
              onChange={setSubactividad}
              options={optsSubactividad}
              placeholder="Todas"
            />

            {/* Profesional */}
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1.5 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> Profesional de Salud
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20">
                <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
                <input
                  value={profesional}
                  onChange={(e) => setProfesional(e.target.value)}
                  placeholder="Nombre o DNI..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
                />
                {profesional && (
                  <button onClick={() => setProfesional("")}>
                    <X className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Servicio */}
            <SearchSelect
              label="Servicio"
              icon={FileText}
              value={servicio}
              onChange={setServicio}
              options={optsServicio}
              placeholder="Todos"
            />

            {/* Búsqueda libre (solo nominal) */}
            {tab === "nominal" && (
              <div className="flex-1 min-w-[200px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1.5 flex items-center gap-1">
                  <Search className="w-3 h-3" /> Buscar Paciente
                </p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20">
                  <Search className="w-4 h-4 text-white/50 flex-shrink-0" />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="DNI o nombre del paciente..."
                    className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
                  />
                  {busqueda && (
                    <button onClick={() => setBusqueda("")}>
                      <X className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => fetchData(0)}
                title="Actualizar"
                className="p-2.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={exportarCSV}
                title="Exportar CSV"
                className="p-2.5 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla principal ─────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Info fila */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {loading ? "Cargando..." : (
                <><span className="font-semibold text-gray-800">{total.toLocaleString("es-PE")}</span> registros encontrados</>
              )}
            </p>
            <p className="text-xs text-gray-400">
              Página {pagina + 1} de {totalPaginas || 1}
            </p>
          </div>

          {/* ── TABLA RESUMEN ─────────────────────────────────────────────── */}
          {tab === "resumen" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: `${COLOR_PRIMARIO}10` }}>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Profesional</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">DNI Médico</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Servicio</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Subactividad</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Fecha Cita</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500">Abandonos</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading
                    ? [...Array(8)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(7)].map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-4 bg-gray-100 animate-pulse rounded" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : rows.length === 0
                    ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              <BarChart3 className="w-10 h-10 opacity-30" />
                              <p className="text-sm font-medium">Sin datos para los filtros seleccionados</p>
                            </div>
                          </td>
                        </tr>
                      )
                    : rows.map((row, idx) => (
                        <tr
                          key={row.idConsPend ?? idx}
                          className="hover:bg-blue-50/40 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                                style={{ backgroundColor: COLOR_PRIMARIO }}
                              >
                                {iniciales(row.profesional)}
                              </div>
                              <span className="font-semibold text-gray-800 text-sm">{row.profesional ?? "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.dniMedico ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium max-w-[180px] truncate">
                              {row.servicio ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold"
                              style={{ backgroundColor: `${COLOR_ACENTO}15`, color: COLOR_ACENTO }}>
                              {row.subactividad ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{fmtFecha(row.fechaCita)}</td>
                          <td className="px-4 py-3 text-center">
                            <AbandonoBadge value={row.abandono} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setMedicoSeleccionado(row)}
                              className="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all group-hover:shadow-sm"
                              style={{ borderColor: COLOR_PRIMARIO, color: COLOR_PRIMARIO }}
                              title="Ver pacientes de este médico"
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TABLA NOMINAL ─────────────────────────────────────────────── */}
          {tab === "nominal" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: `${COLOR_PRIMARIO}10` }}>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Paciente</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">DNI Paciente</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Médico</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Servicio</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Subactividad</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">Fecha Cita</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500">Resumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading
                    ? [...Array(8)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(8)].map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-4 bg-gray-100 animate-pulse rounded" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : rows.length === 0
                    ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              <Users className="w-10 h-10 opacity-30" />
                              <p className="text-sm font-medium">Sin pacientes para los filtros seleccionados</p>
                            </div>
                          </td>
                        </tr>
                      )
                    : rows.map((row, idx) => (
                        <tr
                          key={row.idDetPend ?? idx}
                          className="hover:bg-blue-50/40 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0">
                                {iniciales(row.paciente)}
                              </div>
                              <span className="font-semibold text-gray-800 text-sm">{row.paciente ?? "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.docPaciente ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs max-w-[150px] truncate" title={row.profesional}>
                            {row.profesional ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs max-w-[160px] truncate">
                              {row.servicio ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold"
                              style={{ backgroundColor: `${COLOR_ACENTO}15`, color: COLOR_ACENTO }}>
                              {row.subactividad ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{fmtFecha(row.fechaCita)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.abandono && row.abandono !== "0" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                              {row.abandono || "Activo"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setMedicoSeleccionado({ dniMedico: row.dniMedico, profesional: row.profesional, servicio: row.servicio, fechaCita: row.fechaCita, abandono: null })}
                              className="text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all group-hover:shadow-sm"
                              style={{ borderColor: COLOR_PRIMARIO, color: COLOR_PRIMARIO }}
                              title="Ver resumen del médico"
                            >
                              Médico
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Paginación ──────────────────────────────────────────────────── */}
          {totalPaginas > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => fetchData(pagina - 1)}
                disabled={pagina === 0 || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-600 border-gray-200"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPaginas))].map((_, i) => {
                  const pg = Math.max(0, Math.min(pagina - 2, totalPaginas - 5)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => fetchData(pg)}
                      className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                      style={pg === pagina
                        ? { backgroundColor: COLOR_PRIMARIO, color: "white" }
                        : { color: "#6b7280" }}
                    >
                      {pg + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => fetchData(pagina + 1)}
                disabled={pagina >= totalPaginas - 1 || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-600 border-gray-200"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Panel Resumen por Subactividad (debajo de la tabla) ──────────── */}
      {kpis?.porSubactividad?.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-6 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: COLOR_PRIMARIO }} />
              Resumen por Subactividad
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-left text-xs font-bold uppercase tracking-wide text-gray-400">Subactividad</th>
                    <th className="pb-2 text-center text-xs font-bold uppercase tracking-wide text-gray-400">Médicos</th>
                    <th className="pb-2 text-center text-xs font-bold uppercase tracking-wide text-gray-400">Abandonos</th>
                    <th className="pb-2 text-right text-xs font-bold uppercase tracking-wide text-gray-400">Distribución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {kpis.porSubactividad.map((s) => {
                    const pct = kpis.totalAbandonos > 0 ? Math.round((s.abandonos / kpis.totalAbandonos) * 100) : 0;
                    return (
                      <tr key={s.subactividad} className="hover:bg-gray-50/60">
                        <td className="py-2.5">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold"
                            style={{ backgroundColor: `${COLOR_PRIMARIO}15`, color: COLOR_PRIMARIO }}>
                            {s.subactividad}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-gray-700 font-semibold">{s.medicos}</td>
                        <td className="py-2.5 text-center">
                          <AbandonoBadge value={Number(s.abandonos)} />
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, backgroundColor: COLOR_PRIMARIO }}
                              />
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
        </div>
      )}

      {/* ── Drawer detalle médico ────────────────────────────────────────────── */}
      {medicoSeleccionado && (
        <DrawerResumen
          medico={medicoSeleccionado}
          onClose={() => setMedicoSeleccionado(null)}
        />
      )}
    </div>
  );
}

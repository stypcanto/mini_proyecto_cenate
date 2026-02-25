// ========================================================================
// 📊 EstadisticasProgramacion.jsx
// Módulo: Estadísticas de Programación
// Ruta: /estadisticas/programacion
// Tablas: consolidado_pendientes_mensual | detalle_pendientes_mensual
// ========================================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart3, Users, TrendingDown, Activity, Search, RefreshCw, X,
  ChevronLeft, ChevronRight, Download, User, AlertCircle, ChevronDown,
  ChevronRight as ChevRight, Minus, Plus, Calendar, Stethoscope, FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  obtenerKpis,
  obtenerConsolidado,
  obtenerDetalle,
  obtenerDetallePorMedico,
  obtenerCalendario,
} from "../../services/pendientesMensualesService";

// ── Constantes ───────────────────────────────────────────────────────────────
const PAGE_SIZE   = 20;
const CENATE_BLUE = "#0D5BA9";
const AVATAR_COLORS = ["bg-orange-500","bg-green-500","bg-purple-500","bg-blue-500","bg-red-500"];
const avatarColor   = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtFecha(raw) {
  if (!raw) return "—";
  try {
    const d = new Date(raw + "T00:00:00");
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return raw; }
}
function fmtHora(raw) {
  if (!raw) return null;
  // raw viene como "HH:MM:SS" desde el backend (LocalTime → Jackson)
  try { return raw.slice(0, 5); } catch { return raw; }
}
function iniciales(n) {
  if (!n) return "?";
  return n.trim().split(/\s+/).slice(0,2).map(p => p[0]).join("").toUpperCase();
}
function useDebounce(v, ms = 400) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

// Agrupar detalle: { [subactividad]: { [servicio]: [rows] } }
function agruparDetalle(rows) {
  const tree = {};
  for (const row of rows) {
    const sa = row.subactividad ?? "SIN SUBACTIVIDAD";
    const sv = row.servicio     ?? "SIN SERVICIO";
    if (!tree[sa]) tree[sa] = {};
    if (!tree[sa][sv]) tree[sa][sv] = [];
    tree[sa][sv].push(row);
  }
  return tree;
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
  if (n === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Sin abandono</span>;
  if (n < 5)   return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><TrendingDown className="w-3 h-3"/>{n}</span>;
  return         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><TrendingDown className="w-3 h-3"/>{n}</span>;
}

function SubBadge({ v }) {
  if (!v) return <span className="text-gray-400">—</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{v}</span>;
}

// Dropdown con búsqueda
function FilterSelect({ label, value, onChange, options, placeholder = "Todos" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ]       = useState("");
  const ref             = useRef(null);
  const filtered        = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700">
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0"/>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..."
                className="flex-1 text-xs bg-transparent outline-none text-gray-700"/>
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50">
            <li><button onClick={() => { onChange(""); setOpen(false); setQ(""); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-50">{placeholder}</button></li>
            {filtered.map(opt => (
              <li key={opt}><button onClick={() => { onChange(opt); setOpen(false); setQ(""); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 ${value===opt?"bg-blue-50 text-blue-700 font-semibold":"text-gray-700"}`}>
                {opt}</button></li>
            ))}
            {!filtered.length && <li className="px-4 py-3 text-xs text-gray-400 text-center">Sin resultados</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── ÁRBOL JERÁRQUICO ─────────────────────────────────────────────────────────
// Nodo genérico colapsable
function TreeNode({ label, icon, indent = 0, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const padLeft = indent * 20;
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-1.5 py-1.5 px-3 hover:bg-blue-50 text-left transition-colors group"
        style={{ paddingLeft: `${12 + padLeft}px` }}
      >
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 group-hover:text-blue-600">
          {open ? <Minus className="w-3 h-3"/> : <Plus className="w-3 h-3"/>}
        </span>
        {icon}
        <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{label}</span>
        {badge != null && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium flex-shrink-0">{badge}</span>
        )}
      </button>
      {open && <div className="border-l-2 border-gray-100 ml-5">{children}</div>}
    </div>
  );
}

// Fila de servicio — clic abre drawer con lista de pacientes
function ServicioRow({ serv, pacientes, indent = 1, onClick, isActive }) {
  const padLeft = indent * 20;
  return (
    <button
      onClick={() => onClick({ serv, pacientes })}
      className={`w-full flex items-center gap-2 py-2.5 px-3 text-left transition-colors border-l-2 ${
        isActive ? "bg-blue-50 border-blue-500" : "border-transparent hover:bg-blue-50 hover:border-blue-300"
      }`}
      style={{ paddingLeft: `${12 + padLeft}px` }}
    >
      <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-blue-500" : "text-purple-400"}`}/>
      <span className={`text-sm flex-1 truncate font-semibold ${isActive ? "text-blue-700" : "text-gray-800"}`}>
        {serv}
      </span>
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold flex-shrink-0">
        <User className="w-3 h-3"/> {pacientes.length}
      </span>
      <ChevRight className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-blue-500" : "text-gray-300"}`}/>
    </button>
  );
}

// Drawer: lista de pacientes de un servicio (columnas: Paciente | DNI | Fecha Cita | Estado)
function DrawerListaPacientes({ data, medico, onClose }) {
  const [q, setQ] = useState("");
  if (!data) return null;
  const { serv, pacientes, subact } = data;
  const filtrados = q.trim()
    ? pacientes.filter(p => {
        const t = q.trim().toLowerCase();
        return (p.paciente ?? "").toLowerCase().includes(t) ||
               (p.docPaciente ?? "").includes(t);
      })
    : pacientes;
  const totalAbandonos = pacientes.filter(p => p.abandono && p.abandono !== "0").length;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}/>
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-blue-900 flex-shrink-0"
          style={{ backgroundColor: CENATE_BLUE }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-white text-sm leading-snug truncate">{serv}</p>
              <p className="text-white/70 text-xs mt-0.5">{subact}</p>
              <p className="text-white/60 text-xs mt-0.5 truncate">{medico?.profesional}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-white"/>
            </button>
          </div>
          {/* KPIs rápidos */}
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold">
              <Users className="w-3.5 h-3.5"/> {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""}
            </span>
            {totalAbandonos > 0 && (
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-400/40 text-white font-semibold">
                <TrendingDown className="w-3.5 h-3.5"/> {totalAbandonos} abandono{totalAbandonos !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Buscador */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            {q && (
              <button onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5"/>
              </button>
            )}
          </div>
          {q && (
            <p className="text-[10px] text-gray-400 mt-1">
              {filtrados.length} de {pacientes.length} pacientes
            </p>
          )}
        </div>

        {/* Tabla de pacientes */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Paciente / DNI</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Hora</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-gray-400 italic">Sin resultados para "{q}"</td></tr>
              ) : filtrados.map((p, i) => {
                const hora = fmtHora(p.horaCita);
                return (
                  <tr key={p.idDetPend ?? i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-xs leading-snug truncate max-w-[200px]" title={p.paciente}>{p.paciente ?? "—"}</p>
                      <p className="text-gray-400 text-[10px] font-mono mt-0.5">{p.docPaciente ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmtFecha(p.fechaCita)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {hora
                        ? <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <Calendar className="w-3 h-3"/>{hora}
                          </span>
                        : <span className="text-[10px] text-gray-300 italic">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {p.abandono && p.abandono !== "0"
                        ? <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700"><TrendingDown className="w-2.5 h-2.5"/>{p.abandono}</span>
                        : <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">Activo</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Médico colapsable con carga lazy de detalle
function MedicoNode({ medico, idx, searchSubact, searchServicio, turno }) {
  const [open, setOpen]           = useState(false);
  const [detalle, setDetalle]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [drawerData, setDrawer]   = useState(null); // { serv, pacientes, subact }

  const cargar = async () => {
    if (detalle !== null) return;
    setLoading(true);
    try {
      const rows = await obtenerDetallePorMedico(medico.dniMedico, turno);
      setDetalle(Array.isArray(rows) ? rows : []);
    } catch {
      toast.error("Error al cargar pacientes");
      setDetalle([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!open) cargar();
    setOpen(v => !v);
  };

  // Filtrar por subactividad / servicio si hay filtros activos
  const filas = (detalle ?? []).filter(r => {
    if (searchSubact   && r.subactividad !== searchSubact)   return false;
    if (searchServicio && r.servicio     !== searchServicio) return false;
    return true;
  });

  const tree = agruparDetalle(filas);

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Fila médico */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left group"
      >
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 group-hover:text-blue-600">
          {open ? <Minus className="w-3.5 h-3.5"/> : <Plus className="w-3.5 h-3.5"/>}
        </span>
        <div className={`w-9 h-9 rounded-full ${avatarColor(idx)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
          {iniciales(medico.profesional)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate uppercase">{medico.profesional ?? "—"}</p>
          <p className="text-xs text-gray-400">DNI: {medico.dniMedico ?? "—"}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {detalle !== null && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-semibold">
              <Users className="w-3 h-3"/> {filas.length}
            </span>
          )}
          <AbandonoBadge value={medico.abandono} />
          {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500"/>}
        </div>
      </button>

      {/* Árbol: Subactividad → Servicio (clic en servicio abre drawer) */}
      {open && (
        <div className="bg-gray-50 border-t border-gray-100">
          {loading ? (
            <div className="flex items-center gap-2 px-8 py-3 text-xs text-gray-400">
              <RefreshCw className="w-3 h-3 animate-spin"/> Cargando pacientes...
            </div>
          ) : filas.length === 0 ? (
            <p className="px-8 py-3 text-xs text-gray-400 italic">Sin pacientes nominales</p>
          ) : (
            Object.entries(tree).map(([subact, servicios]) => (
              <TreeNode key={subact} label={subact} indent={0}
                badge={Object.values(servicios).reduce((a, sv) => a + sv.length, 0)}
                icon={<Activity className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"/>}
                defaultOpen>
                {Object.entries(servicios).map(([serv, pacientes]) => (
                  <ServicioRow
                    key={serv}
                    serv={serv}
                    pacientes={pacientes}
                    indent={1}
                    isActive={drawerData?.serv === serv && drawerData?.subact === subact}
                    onClick={(d) => setDrawer(prev =>
                      prev?.serv === d.serv && prev?.subact === subact ? null : { ...d, subact }
                    )}
                  />
                ))}
              </TreeNode>
            ))
          )}
        </div>
      )}

      {/* Drawer con lista de pacientes del servicio seleccionado */}
      {drawerData && (
        <DrawerListaPacientes
          data={drawerData}
          medico={medico}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}

// ── DRAWER PACIENTE ───────────────────────────────────────────────────────────
function DrawerPaciente({ paciente, onClose }) {
  if (!paciente) return null;
  const sinAbandono = !paciente.abandono || paciente.abandono === "0";
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}/>
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-800"
          style={{ backgroundColor: CENATE_BLUE }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {iniciales(paciente.paciente)}
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{paciente.paciente ?? "—"}</p>
              <p className="text-white/60 text-xs">DNI: {paciente.docPaciente ?? "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white"/>
          </button>
        </div>

        {/* Estado de abandono */}
        <div className={`px-5 py-3 flex items-center gap-2 ${sinAbandono ? "bg-green-50 border-b border-green-100" : "bg-red-50 border-b border-red-100"}`}>
          {sinAbandono
            ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">✓ Sin abandono</span>
            : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700"><TrendingDown className="w-4 h-4"/> Abandono: {paciente.abandono}</span>
          }
        </div>

        {/* Detalles */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <User className="w-4 h-4 text-blue-500"/>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paciente</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <DRow label="Nombre"     value={paciente.paciente}    />
              <DRow label="DNI / Doc." value={paciente.docPaciente} mono />
              <DRow label="Fecha Cita" value={fmtFecha(paciente.fechaCita)} />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-1.5 mb-2">
              <Stethoscope className="w-4 h-4 text-purple-500"/>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Profesional asignado</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <DRow label="Médico"       value={paciente.profesional}   />
              <DRow label="DNI Médico"   value={paciente.dniMedico}     mono />
              <DRow label="Servicio"     value={paciente.servicio}      />
              <DRow label="Subactividad" value={paciente.subactividad}  />
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

function DRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-800 font-medium text-right ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );
}

// ── CALENDARIO CON BADGES ─────────────────────────────────────────────────────
const DIAS_SEMANA = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES_ES    = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                     "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function CalendarFilter({ conteos = {}, fechaSel, onSelect }) {
  const hoy = new Date();
  const [mes, setMes] = useState({ year: hoy.getFullYear(), month: hoy.getMonth() });
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  // Navegar al mes con más datos cuando llegan conteos
  useEffect(() => {
    const fechas = Object.keys(conteos);
    if (fechas.length) {
      const d = new Date(fechas[0] + "T00:00:00");
      setMes({ year: d.getFullYear(), month: d.getMonth() });
    }
  }, [conteos]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const { year, month } = mes;
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const toKey = d => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const badge = n => n > 9 ? "9+" : String(n);
  const prevMes = () => setMes(({ year: y, month: m }) => m === 0 ? { year: y-1, month: 11 } : { year: y, month: m-1 });
  const nextMes = () => setMes(({ year: y, month: m }) => m === 11 ? { year: y+1, month: 0 } : { year: y, month: m+1 });

  const labelSel = fechaSel
    ? new Date(fechaSel + "T00:00:00").toLocaleDateString("es-PE", { day:"2-digit", month:"2-digit", year:"numeric" })
    : "Seleccionar fecha";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors bg-white ${
          fechaSel ? "border-blue-500 text-blue-700 font-semibold" : "border-gray-200 text-gray-600 hover:border-blue-300"
        }`}
      >
        <Calendar className="w-4 h-4 flex-shrink-0"/>
        <span>{labelSel}</span>
        {fechaSel
          ? <span onClick={e => { e.stopPropagation(); onSelect(null); }} className="ml-1 hover:text-red-500 cursor-pointer">
              <X className="w-3.5 h-3.5"/>
            </span>
          : <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1"/>
        }
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-80">
          {/* Header mes */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMes} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500"/>
            </button>
            <span className="text-sm font-bold text-gray-800">
              {MESES_ES[month]} de {year}
            </span>
            <button onClick={nextMes} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500"/>
            </button>
          </div>

          {/* Nombres días */}
          <div className="grid grid-cols-7 mb-1">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Celdas días */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`}/>)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
              const key  = toKey(d);
              const cnt  = conteos[key] ?? 0;
              const isSel   = fechaSel === key;
              const hasData = cnt > 0;
              return (
                <div key={d} className="flex justify-center py-0.5">
                  <button
                    onClick={() => { onSelect(isSel ? null : key); setOpen(false); }}
                    disabled={!hasData}
                    title={hasData ? `${cnt} pacientes` : undefined}
                    className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-lg text-xs font-bold transition-all select-none
                      ${isSel    ? "ring-2 ring-offset-1 ring-blue-400" : ""}
                      ${hasData  ? "hover:scale-105 cursor-pointer" : "cursor-default"}
                    `}
                    style={hasData
                      ? { backgroundColor: isSel ? "#0D5BA9" : "#1e3a8a", color: "white" }
                      : { color: "#d1d5db" }
                    }
                  >
                    <span className="leading-none">{d}</span>
                    {hasData && (
                      <span className="text-[9px] leading-none font-bold mt-0.5 opacity-80">
                        {badge(cnt)}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {fechaSel && (
            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
              <button onClick={() => { onSelect(null); setOpen(false); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function EstadisticasProgramacion() {

  const [tab, setTab]         = useState("resumen");
  const [turno, setTurno]     = useState("MAÑANA");   // "MAÑANA" | "TARDE"
  const [kpis, setKpis]       = useState(null);
  const [kpisLoading, setKL]  = useState(true);

  // Tabla nominal
  const [rows, setRows]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPaginas, setTotalPag] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [pagina, setPagina]         = useState(0);

  // Resumen (árbol) — lista de consolidado
  const [consolidado, setConsolidado]         = useState([]);
  const [loadingResumen, setLoadingResumen]   = useState(false);
  const [totalResumen, setTotalResumen]       = useState(0);

  // Filtros
  const [subactividad, setSubactividad] = useState("");
  const [profesional, setProfesional]   = useState("");
  const [servicio, setServicio]         = useState("");
  const [busqueda, setBusqueda]         = useState("");
  const [pendingBusq, setPendingBusq]   = useState("");
  const debProfesional = useDebounce(profesional);

  const [optsSubact, setOptsSubact]     = useState([]);
  const [optsServicio, setOptsServicio] = useState([]);

  // Selecciones
  const [pacienteSel, setPacienteSel] = useState(null);
  const [fechaCorte, setFechaCorte]   = useState(null);
  const [fechaFiltro, setFechaFiltro] = useState(null);
  const [calConteos, setCalConteos]   = useState({});

  // ── KPIs ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (turno === "TARDE") {
      setKpis({ totalMedicos: 0, totalPacientes: 0, totalAbandonos: 0, porSubactividad: [], topServiciosPorAbandonos: [] });
      setKL(false);
      return;
    }
    setKL(true);
    obtenerKpis(turno)
      .then(d => {
        setKpis(d);
        if (d?.porSubactividad?.length)       setOptsSubact(d.porSubactividad.map(s => s.subactividad).filter(Boolean));
        if (d?.topServiciosPorAbandonos?.length) setOptsServicio(d.topServiciosPorAbandonos.map(s => s.servicio).filter(Boolean));
      })
      .catch(() => toast.error("No se pudo cargar los KPIs"))
      .finally(() => setKL(false));
  }, [turno]);

  // ── Calendario: conteos por fecha ──────────────────────────────────────
  useEffect(() => {
    if (turno === "TARDE") { setCalConteos({}); return; }
    obtenerCalendario(turno)
      .then(arr => {
        const map = {};
        (arr ?? []).forEach(item => {
          const fecha = item.fecha ?? item[0];
          const count = item.count ?? item[1];
          if (fecha) map[String(fecha).trim()] = Number(count);
        });
        setCalConteos(map);
      })
      .catch(() => {});
  }, [turno]);

  // ── Cargar lista de consolidado (árbol RESUMEN) ────────────────────────
  const fetchResumen = useCallback(async () => {
    // Turno Tarde aún no tiene tablas — mostrar vacío sin consultar
    if (turno === "TARDE") {
      setConsolidado([]);
      setTotalResumen(0);
      setLoadingResumen(false);
      return;
    }
    setLoadingResumen(true);
    try {
      // Traer todo el consolidado (sin paginación, tamaño grande)
      const params = { turno, page: 0, size: 200 };
      if (subactividad)   params.subactividad  = subactividad;
      if (servicio)       params.servicio      = servicio;
      if (debProfesional) params.busqueda      = debProfesional;
      if (fechaFiltro)  { params.fechaDesde = fechaFiltro; params.fechaHasta = fechaFiltro; }
      const result  = await obtenerConsolidado(params);
      const content = result?.content ?? result ?? [];
      const list    = Array.isArray(content) ? content : [];
      setConsolidado(list);
      setTotalResumen(result?.totalElements ?? list.length ?? 0);
      if (list.length) setFechaCorte(list[0]?.fechaCita ?? null);
    } catch (e) {
      toast.error("Error al cargar resumen");
      setConsolidado([]);
    } finally {
      setLoadingResumen(false);
    }
  }, [turno, subactividad, servicio, debProfesional, fechaFiltro]);

  // ── Cargar datos tabla NOMINAL ─────────────────────────────────────────
  const fetchNominal = useCallback(async (pg = 0) => {
    // Turno Tarde aún no tiene tablas — mostrar vacío sin consultar
    if (turno === "TARDE") {
      setRows([]);
      setTotal(0);
      setTotalPag(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { turno, page: pg, size: PAGE_SIZE };
      if (subactividad)   params.subactividad = subactividad;
      if (servicio)       params.servicio     = servicio;
      if (busqueda || debProfesional) params.busqueda = busqueda || debProfesional;
      if (fechaFiltro)    { params.fechaDesde = fechaFiltro; params.fechaHasta = fechaFiltro; }
      const result  = await obtenerDetalle(params);
      const content = result?.content ?? result ?? [];
      const list    = Array.isArray(content) ? content : [];
      setRows(list);
      setTotal(result?.totalElements ?? list.length ?? 0);
      setTotalPag(result?.totalPages ?? 1);
      setPagina(pg);
      if (pg === 0 && list.length) setFechaCorte(list[0]?.fechaCita ?? null);
    } catch (e) {
      toast.error("Error al cargar datos");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [turno, subactividad, servicio, busqueda, debProfesional, fechaFiltro]);

  useEffect(() => {
    setFechaFiltro(null);
    setConsolidado([]);
    setRows([]);
    setPagina(0);
    if (tab === "resumen") fetchResumen();
    else fetchNominal(0);
  }, [turno]); // eslint-disable-line

  useEffect(() => {
    if (tab === "resumen") fetchResumen();
    else fetchNominal(0);
  }, [tab, fetchResumen, fetchNominal]);

  // ── Filtros helpers ───────────────────────────────────────────────────
  const limpiarFiltros = () => {
    setSubactividad(""); setProfesional(""); setServicio("");
    setBusqueda(""); setPendingBusq(""); setPagina(0); setFechaFiltro(null);
  };
  const aplicarBusqueda = () => { setBusqueda(pendingBusq.trim()); setPagina(0); };

  // ── Exportar CSV ──────────────────────────────────────────────────────
  const exportarCSV = () => {
    const src = tab === "resumen" ? consolidado : rows;
    if (!src.length) return toast.error("Sin datos para exportar");
    const headers = tab === "resumen"
      ? ["DNI Médico","Profesional","Fecha Cita","Subactividad","Servicio","Abandonos"]
      : ["DNI Médico","Profesional","Fecha Cita","Subactividad","Servicio","DNI Paciente","Paciente","Abandono"];
    const csvRows = src.map(r =>
      tab === "resumen"
        ? [r.dniMedico, `"${r.profesional}"`, r.fechaCita, r.subactividad, `"${r.servicio}"`, r.abandono].join(",")
        : [r.dniMedico, `"${r.profesional}"`, r.fechaCita, r.subactividad, `"${r.servicio}"`, r.docPaciente, `"${r.paciente}"`, `"${r.abandono}"`].join(",")
    );
    const csv  = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `pendientes_${tab}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100">
            <BarChart3 className="w-6 h-6" style={{ color: CENATE_BLUE }}/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Estadísticas de Programación</h1>
            <p className="text-sm text-gray-500">
              Pendientes mensuales por profesional
              {fechaCorte && <> · <span className="font-medium">Fecha de corte: {fmtFecha(fechaCorte)}</span></>}
            </p>
          </div>
        </div>
        <button onClick={exportarCSV}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4"/> Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={<Users className="w-5 h-5 text-blue-600"/>}      label="Médicos con Pendientes" value={kpis?.totalMedicos}               bg="bg-blue-50"   textColor="text-blue-700"   loading={kpisLoading}/>
        <KpiCard icon={<User className="w-5 h-5 text-cyan-600"/>}       label="Pacientes Pendientes"   value={kpis?.totalPacientes}              bg="bg-cyan-50"   textColor="text-cyan-700"   loading={kpisLoading}/>
        <KpiCard icon={<TrendingDown className="w-5 h-5 text-red-500"/>} label="Total Abandonos"        value={kpis?.totalAbandonos}              bg="bg-red-50"    textColor="text-red-700"    loading={kpisLoading}/>
        <KpiCard icon={<Activity className="w-5 h-5 text-purple-600"/>}  label="Subactividades"         value={kpis?.porSubactividad?.length}     bg="bg-purple-50" textColor="text-purple-700" loading={kpisLoading}/>
      </div>

      {/* ── Selector de Turno ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Turno:</span>
        <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          {/* MAÑANA */}
          <button
            onClick={() => { setTurno("MAÑANA"); setPagina(0); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
              turno === "MAÑANA"
                ? "text-white"
                : "text-amber-600 hover:bg-amber-50"
            }`}
            style={turno === "MAÑANA" ? { backgroundColor: CENATE_BLUE } : {}}
          >
            <span className="text-base leading-none">☀️</span>
            <span>Mañana</span>
            {turno === "MAÑANA" && (
              <span className="text-[10px] font-normal opacity-80 ml-0.5">
                {totalResumen > 0 ? `${totalResumen}` : ""}
              </span>
            )}
          </button>
          {/* TARDE */}
          <button
            onClick={() => { setTurno("TARDE"); setPagina(0); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-200 border-l border-gray-200 ${
              turno === "TARDE"
                ? "text-white"
                : "text-orange-500 hover:bg-orange-50"
            }`}
            style={turno === "TARDE" ? { backgroundColor: "#d97706" } : {}}
          >
            <span className="text-base leading-none">🌆</span>
            <span>Tarde</span>
            {turno === "TARDE" && consolidado.length === 0 && !loadingResumen && (
              <span className="text-[10px] font-normal opacity-80 ml-1 bg-white/20 px-1.5 py-0.5 rounded-full">
                Próximamente
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-4 bg-white shadow-sm w-full max-w-sm">
        {[{key:"resumen",label:"RESUMEN",sub:"Vista árbol"},{key:"nominal",label:"NOMINAL",sub:"Por paciente"}].map(({key,label,sub}) => (
          <button key={key}
            onClick={() => { setTab(key); setPagina(0); setBusqueda(""); setPendingBusq(""); setProfesional(""); }}
            className="flex-1 py-3 text-center transition-all duration-200 font-bold text-sm tracking-wider uppercase"
            style={tab===key ? {backgroundColor:CENATE_BLUE,color:"white"} : {backgroundColor:"white",color:CENATE_BLUE}}>
            {label}
            <span className="block text-[10px] font-normal tracking-normal normal-case opacity-70 mt-0.5">{sub}</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-44">
            <FilterSelect label="Subactividad" value={subactividad} onChange={setSubactividad} options={optsSubact} placeholder="Todas"/>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Profesional de Salud</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input value={profesional} onChange={e => setProfesional(e.target.value)} placeholder="Nombre o DNI médico..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"/>
            </div>
          </div>
          <div className="w-52">
            <FilterSelect label="Servicio" value={servicio} onChange={setServicio} options={optsServicio} placeholder="Todos"/>
          </div>
          {tab === "nominal" && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-500 mb-1">Buscar Paciente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input value={pendingBusq} onChange={e => setPendingBusq(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && aplicarBusqueda()} placeholder="DNI o nombre del paciente..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"/>
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fecha de Cita</label>
            <CalendarFilter conteos={calConteos} fechaSel={fechaFiltro} onSelect={setFechaFiltro}/>
          </div>
          <div className="flex gap-2">
            {tab === "nominal" && (
              <button onClick={aplicarBusqueda}
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                style={{backgroundColor:CENATE_BLUE}}>
                <Search className="w-4 h-4"/> Buscar
              </button>
            )}
            <button onClick={() => tab==="resumen" ? fetchResumen() : fetchNominal(0)}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors" title="Actualizar">
              <RefreshCw className="w-4 h-4"/>
            </button>
            <button onClick={limpiarFiltros}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors" title="Limpiar filtros">
              <X className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </div>

      {/* ── VISTA ÁRBOL (RESUMEN) ─────────────────────────────────────────── */}
      {tab === "resumen" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Info */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{totalResumen.toLocaleString("es-PE")}</span> profesionales · haz clic en el nombre para expandir
            </p>
            {loadingResumen && <RefreshCw className="w-4 h-4 animate-spin text-blue-500"/>}
          </div>

          {turno === "TARDE" && !loadingResumen && (
            <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <span className="text-sm">🌆</span>
              <p className="text-xs text-amber-700 font-medium">
                Los datos del <strong>Turno Tarde</strong> se cargarán próximamente cuando las tablas estén disponibles.
              </p>
            </div>
          )}
          {loadingResumen ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2"/> Cargando...
            </div>
          ) : consolidado.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              {turno === "TARDE" ? (
                <>
                  <span className="text-5xl">🌆</span>
                  <p className="text-sm font-semibold text-gray-600">Turno Tarde — sin datos aún</p>
                  <p className="text-xs text-gray-400 text-center max-w-xs">
                    Los datos del turno tarde se cargarán cuando las tablas correspondientes estén disponibles.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-gray-300"/>
                  <p className="text-sm text-gray-400">Sin resultados</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {consolidado.map((med, idx) => (
                <MedicoNode
                  key={med.dniMedico ?? idx}
                  medico={med}
                  idx={idx}
                  searchSubact={subactividad}
                  searchServicio={servicio}
                  turno={turno}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TABLA NOMINAL ─────────────────────────────────────────────────── */}
      {tab === "nominal" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mr-2"/> Cargando datos...
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              {turno === "TARDE" ? (
                <>
                  <span className="text-5xl">🌆</span>
                  <p className="text-sm font-semibold text-gray-600">Turno Tarde — sin datos aún</p>
                  <p className="text-xs text-gray-400 text-center max-w-xs">
                    Los datos del turno tarde se cargarán cuando las tablas correspondientes estén disponibles.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-gray-300"/>
                  <p className="text-sm text-gray-400">Sin resultados para los filtros seleccionados</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10" style={{backgroundColor:CENATE_BLUE}}>
                  <tr>
                    {["Paciente","DNI Paciente","Médico","Servicio","Subactividad","Fecha Cita","Estado",""].map((h,i) => (
                      <th key={i} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, idx) => (
                    <tr key={row.idDetPend ?? idx} className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      onClick={() => setPacienteSel(row)}>
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
                      <td className="px-6 py-4"><SubBadge v={row.subactividad}/></td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{fmtFecha(row.fechaCita)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${row.abandono && row.abandono!=="0" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {row.abandono || "Activo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500" title="Ver detalle">
                          <User className="w-4 h-4"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {!loading && rows.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>
                Mostrando {pagina*PAGE_SIZE+1}–{Math.min((pagina+1)*PAGE_SIZE,total)} de{" "}
                <span className="font-semibold text-gray-800">{total.toLocaleString("es-PE")}</span> registros
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => fetchNominal(pagina-1)} disabled={pagina===0}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{backgroundColor:CENATE_BLUE}}>
                  {pagina+1} / {totalPaginas||1}
                </span>
                <button onClick={() => fetchNominal(pagina+1)} disabled={pagina>=totalPaginas-1}
                  className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Panel resumen subactividades ─────────────────────────────────── */}
      {kpis?.porSubactividad?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Activity className="w-4 h-4" style={{color:CENATE_BLUE}}/>
            <h3 className="text-sm font-semibold text-gray-700">Resumen por Subactividad</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Subactividad","Médicos","Abandonos","Distribución"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kpis.porSubactividad.map(s => {
                  const pct = kpis.totalAbandonos > 0 ? Math.round((s.abandonos/kpis.totalAbandonos)*100) : 0;
                  return (
                    <tr key={s.subactividad} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3"><SubBadge v={s.subactividad}/></td>
                      <td className="px-6 py-3 text-gray-700 font-semibold">{s.medicos}</td>
                      <td className="px-6 py-3"><AbandonoBadge value={Number(s.abandonos)}/></td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden max-w-[120px]">
                            <div className="h-full rounded-full" style={{width:`${pct}%`,backgroundColor:CENATE_BLUE}}/>
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

      {/* Drawer detalle paciente */}
      {pacienteSel && <DrawerPaciente paciente={pacienteSel} onClose={() => setPacienteSel(null)}/>}
    </div>
  );
}

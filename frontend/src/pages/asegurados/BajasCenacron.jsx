// ========================================================================
// 🚫 BajasCenacron.jsx — Historial de bajas del programa CENACRON
// Módulo: Asegurados  |  Ruta: /asegurados/bajas-cenacron
// ========================================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  UserX, Search, RefreshCw, X, ChevronLeft, ChevronRight,
  Calendar, User, Clock, FileText, AlertCircle, CheckCircle,
  TrendingDown, Filter, Download
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../lib/apiClient";

// ── Constantes ──────────────────────────────────────────────────────────
const ENDPOINT = "/paciente-estrategia/bajas-cenacron";
const PAGE_SIZE = 25;

// ── Helpers ─────────────────────────────────────────────────────────────
function fmtFecha(raw) {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("es-PE", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return raw; }
}

function fmtFechaHora(raw) {
  if (!raw) return "—";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString("es-PE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch { return raw; }
}

function estadoBadge(estado) {
  if (estado === "INACTIVO") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <TrendingDown className="w-3 h-3" /> Baja definitiva
      </span>
    );
  }
  if (estado === "COMPLETADO") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
        <CheckCircle className="w-3 h-3" /> Salida especialidad
      </span>
    );
  }
  return <span className="text-xs text-gray-400">{estado ?? "—"}</span>;
}

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

// ── Componente principal ─────────────────────────────────────────────────
export default function BajasCenacron() {
  // Estado de datos
  const [bajas, setBajas]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [totalPaginas, setTotalPag] = useState(0);
  const [pagina, setPagina]         = useState(0);

  // Filtros
  const [busqueda, setBusqueda]       = useState("");
  const [estado, setEstado]           = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin]       = useState("");
  const [pendingBusqueda, setPending] = useState("");

  // Drawer
  const [selected, setSelected]     = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // KPIs derivados (client-side desde los datos actuales)
  const kpiInactivo   = bajas.filter(b => b.estado === "INACTIVO").length;
  const kpiCompletado = bajas.filter(b => b.estado === "COMPLETADO").length;

  // ── Fetch ──────────────────────────────────────────────────────────────
  const cargar = useCallback(async (pg = pagina) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, size: PAGE_SIZE });
      if (busqueda)    params.append("busqueda", busqueda);
      if (estado)      params.append("estado", estado);
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin)    params.append("fechaFin", fechaFin);

      const data = await apiClient.get(`${ENDPOINT}?${params}`, true);

      if (!data.success) throw new Error(data.error || "Error al cargar");

      setBajas(data.bajas ?? []);
      setTotal(data.total ?? 0);
      setTotalPag(data.totalPaginas ?? 0);
      setPagina(pg);
    } catch (err) {
      console.error("❌ BajasCenacron:", err);
      toast.error("Error al cargar bajas CENACRON");
      setBajas([]);
    } finally {
      setLoading(false);
    }
  }, [busqueda, estado, fechaInicio, fechaFin, pagina]);

  // Carga inicial y al cambiar filtros
  useEffect(() => {
    cargar(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, estado, fechaInicio, fechaFin]);

  // ── Búsqueda con Enter ─────────────────────────────────────────────────
  const aplicarBusqueda = () => {
    setBusqueda(pendingBusqueda.trim());
    setPagina(0);
  };

  const limpiarFiltros = () => {
    setPending("");
    setBusqueda("");
    setEstado("");
    setFechaInicio("");
    setFechaFin("");
    setPagina(0);
  };

  // ── Exportar CSV ───────────────────────────────────────────────────────
  const exportarCSV = () => {
    if (!bajas.length) { toast.error("No hay datos para exportar"); return; }
    const headers = ["ID","DNI","Paciente","Estado","Motivo","Fecha Baja","Usuario Baja","Quien Dio Baja","Días en Programa"];
    const rows = bajas.map(b => [
      b.idAsignacion, b.pkAsegurado, b.nombrePaciente ?? "",
      b.estado, (b.motivo ?? "").replace(/,/g, ";"),
      fmtFechaHora(b.fechaDesvinculacion),
      b.usuarioBajaLogin ?? "", b.nombreQuienDioBaja ?? "",
      b.diasEnPrograma ?? "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `bajas_cenacron_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  // ── Drawer de detalle ──────────────────────────────────────────────────
  const abrirDrawer = (baja) => { setSelected(baja); setDrawerOpen(true); };
  const cerrarDrawer = ()    => { setDrawerOpen(false); setTimeout(() => setSelected(null), 300); };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Bajas del Programa CENACRON</h1>
            <p className="text-sm text-gray-500">
              Historial de pacientes dados de baja con datos de auditoría completos
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

      {/* ── KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard
          icon={<UserX className="w-5 h-5 text-gray-500" />}
          label="Total Bajas"
          value={total}
          color="bg-gray-100"
        />
        <KpiCard
          icon={<TrendingDown className="w-5 h-5 text-red-500" />}
          label="INACTIVO – Baja definitiva"
          value={kpiInactivo}
          color="bg-red-50"
          textColor="text-red-700"
        />
        <KpiCard
          icon={<CheckCircle className="w-5 h-5 text-orange-500" />}
          label="COMPLETADO – Salida especialidad"
          value={kpiCompletado}
          color="bg-orange-50"
          textColor="text-orange-700"
        />
      </div>

      {/* ── Filtros ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">DNI o Nombre</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={pendingBusqueda}
                onChange={e => setPending(e.target.value)}
                onKeyDown={e => e.key === "Enter" && aplicarBusqueda()}
                placeholder="Buscar paciente..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="w-44">
            <label className="block text-xs text-gray-500 mb-1">Estado</label>
            <select
              value={estado}
              onChange={e => { setEstado(e.target.value); setPagina(0); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <option value="">Todos</option>
              <option value="INACTIVO">INACTIVO – Definitivo</option>
              <option value="COMPLETADO">COMPLETADO – Especialidad</option>
            </select>
          </div>

          {/* Fecha inicio */}
          <div className="w-36">
            <label className="block text-xs text-gray-500 mb-1">Fecha desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={e => { setFechaInicio(e.target.value); setPagina(0); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          {/* Fecha fin */}
          <div className="w-36">
            <label className="block text-xs text-gray-500 mb-1">Fecha hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={e => { setFechaFin(e.target.value); setPagina(0); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              onClick={aplicarBusqueda}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              <Search className="w-4 h-4" /> Buscar
            </button>
            <button
              onClick={() => cargar(pagina)}
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

      {/* ── Tabla ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Cargando bajas...
          </div>
        ) : bajas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <AlertCircle className="w-8 h-8" />
            <p>No se encontraron bajas CENACRON</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Paciente","DNI","Estado","Motivo","Fecha Baja","Generado por","Días"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bajas.map((b, idx) => (
                  <tr
                    key={b.idAsignacion ?? idx}
                    onClick={() => abrirDrawer(b)}
                    className="hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">
                      {b.nombrePaciente ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{b.pkAsegurado ?? "—"}</td>
                    <td className="px-4 py-3">{estadoBadge(b.estado)}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate" title={b.motivo}>
                      {b.motivo ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {fmtFecha(b.fechaDesvinculacion)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                      {b.nombreQuienDioBaja || b.usuarioBajaLogin || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-right pr-6">
                      {b.diasEnPrograma != null ? `${b.diasEnPrograma}d` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && bajas.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>
              Mostrando {pagina * PAGE_SIZE + 1}–{Math.min((pagina + 1) * PAGE_SIZE, total)} de {total} registros
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => cargar(pagina - 1)}
                disabled={pagina === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium">
                {pagina + 1} / {totalPaginas}
              </span>
              <button
                onClick={() => cargar(pagina + 1)}
                disabled={pagina >= totalPaginas - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Drawer lateral ── */}
      {drawerOpen && selected && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={cerrarDrawer}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
            {/* Header drawer */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-red-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                  {iniciales(selected.nombreQuienDioBaja || selected.usuarioBajaLogin)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">
                    {selected.nombreQuienDioBaja || selected.usuarioBajaLogin || "Sin auditor"}
                  </p>
                  <p className="text-xs text-gray-500">{selected.usuarioBajaLogin ?? ""}</p>
                </div>
              </div>
              <button onClick={cerrarDrawer} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Sección Paciente */}
              <Section title="Paciente" icon={<User className="w-4 h-4 text-blue-500" />}>
                <Row label="Nombre" value={selected.nombrePaciente} />
                <Row label="DNI / CIP" value={selected.pkAsegurado} mono />
                <Row label="Días en programa" value={selected.diasEnPrograma != null ? `${selected.diasEnPrograma} días` : "—"} />
                <Row label="Fecha ingreso" value={fmtFechaHora(selected.fechaAsignacion)} />
              </Section>

              {/* Sección Baja */}
              <Section title="Detalle de Baja" icon={<FileText className="w-4 h-4 text-red-500" />}>
                <div className="mb-2">{estadoBadge(selected.estado)}</div>
                <Row label="Tipo" value={selected.estado === "INACTIVO" ? "Baja definitiva del programa" : "Salida de especialidad (puede reingresarse)"} />
                <Row label="Fecha / hora de baja" value={fmtFechaHora(selected.fechaDesvinculacion)} />
              </Section>

              {/* Sección Motivo */}
              <Section title="Motivo" icon={<AlertCircle className="w-4 h-4 text-orange-500" />}>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.motivo || <span className="text-gray-400 italic">Sin motivo registrado</span>}
                </p>
              </Section>

              {/* Sección Auditoría */}
              <Section title="Generado por" icon={<Clock className="w-4 h-4 text-gray-500" />}>
                <Row label="Nombre completo" value={selected.nombreQuienDioBaja} />
                <Row label="Usuario login" value={selected.usuarioBajaLogin} mono />
                <Row label="Fecha / hora" value={fmtFechaHora(selected.fechaDesvinculacion)} />
              </Section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-componentes ─────────────────────────────────────────────────────

function KpiCard({ icon, label, value, color = "bg-gray-100", textColor = "text-gray-800" }) {
  return (
    <div className={`rounded-xl border border-gray-200 p-4 ${color} flex items-center gap-4`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}

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
      <span className={`text-gray-800 font-medium text-right ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

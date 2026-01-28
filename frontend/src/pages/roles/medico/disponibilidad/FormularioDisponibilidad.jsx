// ========================================================================
// FormularioDisponibilidad.jsx (Rol Médico)
// ------------------------------------------------------------------------
// Basado en: roles/externo/solicitud-turnos/FormularioSolicitudTurnos.jsx
//
// ✅ Alcance en esta iteración (según tu indicación):
// - Reutiliza la UX/estructura de filtros + tabla por periodo
// - Carga periodos VIGENTES/ACTIVOS desde PeriodoMedicoDisponibilidadController
//   vía periodoMedicoDisponibilidadService:
//     GET /api/periodos-medicos-disponibilidad/vigentes
//     GET /api/periodos-medicos-disponibilidad/activos
// ========================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Loader2, RefreshCw } from "lucide-react";

import periodoMedicoDisponibilidadService from "../../../../services/periodoMedicoDisponibilidadService";
import { formatFecha, getYearFromPeriodo, estadoBadgeClass } from "./utils/helpers";

const BUTTON_WHITE_HOVER_CLASS =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 hover:shadow-md";

export default function FormularioDisponibilidad() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // periodos
  const [tipoPeriodos, setTipoPeriodos] = useState("VIGENTES"); // VIGENTES | ACTIVOS
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  // filtros tabla
  const [filtroAnio, setFiltroAnio] = useState(String(new Date().getFullYear()));
  const [filtroPeriodoId, setFiltroPeriodoId] = useState("");
  const [aniosDisponibles, setAniosDisponibles] = useState([new Date().getFullYear()]);

  const mapPeriodoBackendToUi = (p) => ({
    // Normalizamos nombres para reusar helpers/UI
    idPeriodo: p.idPeriodoRegDisp,
    periodo: p.periodo,
    descripcion: p.descripcion,
    fechaInicio: p.fechaInicio,
    fechaFin: p.fechaFin,
    estado: p.estado,
    anio: p.anio,
    // mantener original por si se necesita luego
    raw: p,
  });

  const cargarAniosDisponibles = useCallback(async () => {
    try {
      const anios = await periodoMedicoDisponibilidadService.listarAnios();
      const lista = Array.isArray(anios) ? anios : [];
      setAniosDisponibles(lista.length > 0 ? lista.sort((a, b) => b - a) : [new Date().getFullYear()]);
    } catch (e) {
      console.error(e);
      setAniosDisponibles([new Date().getFullYear()]);
    }
  }, []);

  const cargarPeriodos = useCallback(async () => {
    setLoadingPeriodos(true);
    setError(null);
    try {
      let data = [];
      if (tipoPeriodos === "VIGENTES") {
        data = await periodoMedicoDisponibilidadService.listarVigentes();
      } else {
        data = await periodoMedicoDisponibilidadService.listarActivos();
      }

      const arr = Array.isArray(data) ? data.map(mapPeriodoBackendToUi) : [];
      setPeriodos(arr);
      return arr;
    } catch (e) {
      console.error(e);
      setPeriodos([]);
      setError(e?.message || "No se pudieron cargar los periodos.");
      return [];
    } finally {
      setLoadingPeriodos(false);
    }
  }, [tipoPeriodos]);

  const inicializar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([cargarAniosDisponibles(), cargarPeriodos()]);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los datos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [cargarAniosDisponibles, cargarPeriodos]);

  useEffect(() => {
    inicializar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargarPeriodos();
  }, [tipoPeriodos, cargarPeriodos]);

  const periodosPorAnio = useMemo(() => {
    const arr = Array.isArray(periodos) ? periodos : [];
    if (!filtroAnio) return arr;
    return arr.filter((p) => getYearFromPeriodo(p) === String(filtroAnio));
  }, [periodos, filtroAnio]);

  const filasPorPeriodo = useMemo(() => {
    let base = Array.isArray(periodos) ? [...periodos] : [];
    if (filtroAnio) base = base.filter((p) => getYearFromPeriodo(p) === String(filtroAnio));
    if (filtroPeriodoId) base = base.filter((p) => String(p.idPeriodo) === String(filtroPeriodoId));

    // orden por fechaInicio desc
    base.sort((a, b) => {
      const da = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
      const db = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
      return db - da;
    });

    return base;
  }, [periodos, filtroAnio, filtroPeriodoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
        <p className="ml-3 text-slate-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Disponibilidad Médica</h1>
        </div>
        <p className="text-blue-100">
          Selecciona un período <strong>Vigente</strong> o <strong>Activo</strong> para registrar tu disponibilidad.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tabla por Periodo + Filtros */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Períodos de Disponibilidad
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">Fuente: `PeriodoMedicoDisponibilidadController`</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={inicializar}
                className={BUTTON_WHITE_HOVER_CLASS}
                disabled={loadingPeriodos}
              >
                {loadingPeriodos ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
            {/* Tipo periodos */}
            <div className="md:col-span-4">
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
            <div className="md:col-span-5">
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
          </div>

          {filasPorPeriodo.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">No hay periodos para los filtros seleccionados.</div>
          ) : (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Año</th>
                    <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Periodo</th>
                    <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Apertura</th>
                    <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Cierre</th>
                    <th className="px-2 py-2.5 text-left text-xs font-bold text-white">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filasPorPeriodo.map((p) => (
                    <tr key={p.idPeriodo} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-2 text-xs text-slate-700 font-semibold">{getYearFromPeriodo(p) || "—"}</td>
                      <td className="px-2 py-2 text-xs text-slate-700">
                        <div className="font-semibold">{p.descripcion || `Periodo ${p.periodo}`}</div>
                        <div className="text-[10px] text-slate-500">Cód: {p.periodo} · ID: {p.idPeriodo}</div>
                      </td>
                      <td className="px-2 py-2 text-xs text-slate-600">{formatFecha(p.fechaInicio)}</td>
                      <td className="px-2 py-2 text-xs text-slate-600">{formatFecha(p.fechaFin)}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${estadoBadgeClass(
                            p.estado
                          )}`}
                        >
                          {p.estado || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Nota: en esta primera iteración se dejó operativa solo la <strong>carga de periodos</strong> desde el controller de
        disponibilidad. La siguiente parte será integrar el registro de disponibilidad del médico en base a estos periodos.
      </div>
    </div>
  );
}


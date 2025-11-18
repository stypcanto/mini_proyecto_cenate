// ========================================================================
// 📊 DashboardAsegurados.jsx – Dashboard Ejecutivo (CENATE 2025)
// ✅ VERSIÓN FINAL CON GRÁFICOS DE ALTURA DINÁMICA
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  Users, Building2, TrendingUp, Activity, ArrowLeft,
  Network, PieChart as PieChartIcon,
  BarChart3, Shield, Calendar, MapPin, Target, Filter, ChevronDown, Loader
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import aseguradosService from "../../services/aseguradosService";
import ModalListadoAsegurados from "./view/ModalListadoAsegurados";

export default function DashboardAsegurados() {
  const navigate = useNavigate();
  const [idRedSeleccionada, setIdRedSeleccionada] = useState(null);
  const [codIpressSeleccionado, setCodIpressSeleccionado] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [redes, setRedes] = useState([]);
  const [ipressDisponibles, setIpressDisponibles] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [mostrarModalAsegurados, setMostrarModalAsegurados] = useState(false);
  const [asegurados, setAsegurados] = useState([]);
  const [loadingAsegurados, setLoadingAsegurados] = useState(false);
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);

  const COLORS_GENERO = { M: "#3b82f6", F: "#ec4899" };
  const FECHA_ACTUAL = useMemo(() => new Date(), []);

  useEffect(() => { cargarRedes(); }, []);
  useEffect(() => { cargarEstadisticas(); }, [idRedSeleccionada, codIpressSeleccionado]);
  useEffect(() => {
    if (idRedSeleccionada) {
      cargarIpress(idRedSeleccionada);
    } else {
      setIpressDisponibles([]);
      setCodIpressSeleccionado(null);
    }
  }, [idRedSeleccionada]);

  const cargarRedes = async () => {
    try {
      const data = await aseguradosService.getRedes();
      setRedes(data || []);
    } catch (error) {
      console.error("Error al cargar redes:", error);
      toast.error("Error al cargar las redes");
    }
  };

  const cargarIpress = async (idRed) => {
    try {
      setLoadingFiltros(true);
      const data = await aseguradosService.getIpress(idRed);
      setIpressDisponibles(data || []);
    } catch (error) {
      console.error("Error al cargar IPRESS:", error);
      toast.error("Error al cargar IPRESS");
    } finally {
      setLoadingFiltros(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await aseguradosService.getEstadisticasDashboard(
        idRedSeleccionada,
        codIpressSeleccionado
      );
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      toast.error("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  const handleRedChange = (e) => {
    const value = e.target.value;
    setIdRedSeleccionada(value ? parseInt(value) : null);
    setCodIpressSeleccionado(null);
  };

  const handleIpressChange = (e) => {
    const value = e.target.value;
    setCodIpressSeleccionado(value || null);
  };

  const limpiarFiltros = async () => {
    setIdRedSeleccionada(null);
    setCodIpressSeleccionado(null);
    try {
      setLoading(true);
      const data = await aseguradosService.getEstadisticasDashboard(null, null);
      setEstadisticas(data);
      toast.success("Filtros limpiados");
    } catch (error) {
      console.error("Error al recargar estadísticas:", error);
      toast.error("Error al limpiar filtros");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAsegurados = async () => {
    setMostrarModalAsegurados(true);
    setPaginaActual(0);
    await cargarAsegurados(0);
  };

  const cerrarModalAsegurados = () => {
    setMostrarModalAsegurados(false);
    setAsegurados([]);
  };

  const cargarAsegurados = async (pagina) => {
    try {
      setLoadingAsegurados(true);
      let data;
      if (idRedSeleccionada || codIpressSeleccionado) {
        data = await aseguradosService.buscarAsegurados("", idRedSeleccionada, codIpressSeleccionado, pagina, 25);
      } else {
        data = await aseguradosService.getAsegurados(pagina, 25);
      }
      setAsegurados(data.content || []);
      setTotalPaginas(data.totalPages || 0);
      setTotalElementos(data.totalElements || 0);
      setPaginaActual(pagina);
    } catch (error) {
      console.error("Error al cargar asegurados:", error);
      toast.error("Error al cargar la lista de asegurados");
    } finally {
      setLoadingAsegurados(false);
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 0 && nuevaPagina < totalPaginas) {
      cargarAsegurados(nuevaPagina);
    }
  };

  const TOTAL_IPRESS = useMemo(() => {
    return estadisticas?.topIPRESS?.reduce((sum, i) => sum + i.cantidad, 0) || 0;
  }, [estadisticas]);

  const TOTAL_REDES = useMemo(() => {
    return estadisticas?.distribucionPorRed?.reduce((sum, i) => sum + i.cantidad, 0) || 0;
  }, [estadisticas]);

  if (loading && !estadisticas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/asegurados/buscar")} className="p-2 bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all" title="Volver">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="bg-emerald-600 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard de Asegurados</h1>
              <p className="text-sm text-slate-600">Panel ejecutivo con métricas del sistema CENATE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>Actualizado: {FECHA_ACTUAL.toLocaleDateString("es-PE")}</span>
          </div>
        </header>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Filtros y Búsqueda</h2>
              {(idRedSeleccionada || codIpressSeleccionado) && (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Filtros activos</span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${mostrarFiltros ? "rotate-180" : ""}`} />
          </button>

          {mostrarFiltros && (
            <div className="px-6 py-5 border-t border-slate-200 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Network className="w-4 h-4" />Filtrar por Red
                  </label>
                  <select value={idRedSeleccionada || ""} onChange={handleRedChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900">
                    <option value="">Todas las redes</option>
                    {redes.map((red) => (
                      <option key={red.idRed} value={red.idRed}>{red.descRed}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Building2 className="w-4 h-4" />Filtrar por IPRESS
                  </label>
                  <select value={codIpressSeleccionado || ""} onChange={handleIpressChange} disabled={!idRedSeleccionada || loadingFiltros} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                    <option value="">{loadingFiltros ? "Cargando..." : idRedSeleccionada ? "Todas las IPRESS de esta red" : "Selecciona una red primero"}</option>
                    {ipressDisponibles.map((ipress) => (
                      <option key={ipress.codIpress} value={ipress.codIpress}>{ipress.descIpress}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(idRedSeleccionada || codIpressSeleccionado) && (
                <div className="mt-4 flex justify-end">
                  <button onClick={limpiarFiltros} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Limpiar filtros</button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: "Total Asegurados", value: estadisticas?.totalAsegurados || 0, color: "from-blue-500 to-blue-600", icon: <Users className="w-8 h-8 opacity-80" />, sub: "Asegurados registrados", onClick: abrirModalAsegurados, clickable: true },
            { title: "Centros IPRESS", value: estadisticas?.totalIPRESS || 0, color: "from-emerald-500 to-emerald-600", icon: <Building2 className="w-8 h-8 opacity-80" />, sub: codIpressSeleccionado ? "IPRESS seleccionado" : "IPRESS únicos" },
            { title: "Redes Asistenciales", value: estadisticas?.totalRedes || 0, color: "from-purple-500 to-purple-600", icon: <Network className="w-8 h-8 opacity-80" />, sub: idRedSeleccionada ? "Red seleccionada" : "Redes únicas" },
            { title: "Asegurados Titulares", value: estadisticas?.aseguradosTitulares || 0, color: "from-orange-500 to-orange-600", icon: <Shield className="w-8 h-8 opacity-80" />, sub: `${estadisticas?.totalAsegurados > 0 ? ((estadisticas.aseguradosTitulares / estadisticas.totalAsegurados) * 100).toFixed(1) : 0}% del total` }
          ].map((m, i) => (
            <div key={i} onClick={m.clickable ? m.onClick : undefined} className={`bg-gradient-to-br ${m.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all ${m.clickable ? "cursor-pointer transform hover:scale-105" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                {m.icon}
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-sm font-medium opacity-90 mb-1">{m.title}</p>
              <p className="text-4xl font-bold">{m.value.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-2">{m.sub}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">Distribución por Género</h3>
            </div>
            {estadisticas?.porGenero && estadisticas.porGenero.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={estadisticas.porGenero} cx="50%" cy="50%" labelLine={false} label={({ genero, porcentaje }) => `${genero === "M" ? "👨" : "👩"} ${porcentaje.toFixed(1)}%`} outerRadius={80} dataKey="cantidad">
                      {estadisticas.porGenero.map((entry, index) => (
                        <Cell key={index} fill={COLORS_GENERO[entry.genero] || "#888"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => v.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {estadisticas.porGenero.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS_GENERO[item.genero] || "#888" }} />
                        <span className="text-sm text-slate-700">{item.genero === "M" ? "Masculino" : "Femenino"}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{item.cantidad.toLocaleString()} ({item.porcentaje.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-slate-400 py-8">No hay datos disponibles</p>
            )}
          </div>

          {/* ✅ GRÁFICO MEJORADO CON ALTURA DINÁMICA */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">Distribución por Tipo de Paciente</h3>
            </div>
            {estadisticas?.porTipoPaciente && estadisticas.porTipoPaciente.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(300, estadisticas.porTipoPaciente.length * 45)}>
                <BarChart data={estadisticas.porTipoPaciente} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="tipo" type="category" width={180} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => v.toLocaleString()} />
                  <Bar dataKey="cantidad" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-400 py-8">No hay datos disponibles</p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TablaDatos titulo="Top 10 IPRESS con más Asegurados" icono={<Building2 className="w-5 h-5" />} colorCabecera="from-emerald-600 to-emerald-700" datos={estadisticas?.topIPRESS || []} total={TOTAL_IPRESS} />
          <TablaRedes datos={estadisticas?.distribucionPorRed || []} total={TOTAL_REDES} />
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-900">Distribución por Tipo de Seguro</h3>
          </div>
          {estadisticas?.porTipoSeguro && estadisticas.porTipoSeguro.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.porTipoSeguro}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip formatter={(v) => v.toLocaleString()} />
                <Legend />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-slate-400 py-8">No hay datos disponibles</p>
          )}
        </section>

        <footer className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-6 text-white grid grid-cols-1 md:grid-cols-4 gap-4">
          <InfoFooter icon={<Calendar className="w-5 h-5 mb-2 opacity-80" />} label="Última actualización" value={FECHA_ACTUAL.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })} />
          <InfoFooter icon={<Activity className="w-5 h-5 mb-2 opacity-80" />} label="Sistema" value="CENATE - EsSalud Perú" />
          <InfoFooter icon={<MapPin className="w-5 h-5 mb-2 opacity-80" />} label="Cobertura" value="Nacional" />
          <InfoFooter icon={<Target className="w-5 h-5 mb-2 opacity-80" />} label="Periodo Actual" value={FECHA_ACTUAL.getFullYear()} />
        </footer>

        {mostrarModalAsegurados && (
          <ModalListadoAsegurados mostrar={mostrarModalAsegurados} cerrar={cerrarModalAsegurados} asegurados={asegurados} loading={loadingAsegurados} paginaActual={paginaActual} totalPaginas={totalPaginas} totalElementos={totalElementos} onCambiarPagina={cambiarPagina} filtros={{ idRed: idRedSeleccionada, codIpress: codIpressSeleccionado }} />
        )}
      </div>
    </div>
  );
}

const InfoFooter = ({ icon, label, value }) => (
  <div>{icon}<p className="text-sm opacity-80">{label}</p><p className="text-lg font-semibold">{value}</p></div>
);

// Reemplaza los componentes TablaDatos y TablaRedes al final de tu archivo con estas versiones corregidas:

// ✅ REEMPLAZA LOS COMPONENTES TablaDatos y TablaRedes CON ESTOS:

const TablaDatos = ({ titulo, icono, colorCabecera, datos, total }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className={`bg-gradient-to-r ${colorCabecera} px-6 py-4`}>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          {icono} {titulo}
        </h3>
      </div>
      <div className="overflow-x-auto max-h-96">
        {datos && datos.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Centro IPRESS</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Asegurados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {datos.map((item, i) => (
                <tr key={i} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600">{i + 1}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {item.nombreipress || "Sin nombre"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-semibold text-right">
                    {item.cantidad?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan="2" className="px-4 py-3 text-sm font-bold text-slate-900">Total</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">
                  {total.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="text-center text-slate-400 py-8">No hay datos disponibles</p>
        )}
      </div>
    </div>
  );
};

const TablaRedes = ({ datos, total }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Network className="w-5 h-5" /> Distribución por Redes Asistenciales
        </h3>
      </div>
      <div className="overflow-x-auto max-h-96">
        {datos && datos.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Red Asistencial</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Asegurados</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {datos.map((item, i) => (
                <tr key={i} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-600">{i + 1}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {item.nombrered || "Sin nombre"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-semibold text-right">
                    {item.cantidad?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 font-semibold text-right">
                    {item.porcentaje?.toFixed(2) || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan="2" className="px-4 py-3 text-sm font-bold text-slate-900">Total</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">
                  {total.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="text-center text-slate-400 py-8">No hay datos disponibles</p>
        )}
      </div>
    </div>
  );
};
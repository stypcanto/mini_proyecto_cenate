import React, { useState, useEffect } from 'react';
import { X, BarChart3, Download, Loader } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import formularioDiagnosticoService from '../../services/formularioDiagnosticoService';

const COLORS_PIE = ['#10b981', '#ef4444'];

export default function ReporteEstadisticoModal({ isOpen, onClose, idFormulario }) {
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [tabActivo, setTabActivo] = useState('dashboard');

  useEffect(() => {
    if (isOpen && idFormulario) {
      cargarEstadisticas();
    }
  }, [isOpen, idFormulario]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await formularioDiagnosticoService.obtenerEstadisticas(idFormulario);
      console.log('✅ Datos de estadísticas cargados:', data);
      console.log('📊 PreguntosSi:', data?.preguntasSi);
      console.log('📊 PreguntasNo:', data?.preguntasNo);
      console.log('📊 InfraFisica:', data?.infraFisica);
      console.log('📊 EquipamientoResumen:', data?.equipamientoResumen);
      setEstadisticas(data);
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const descargarExcel = async () => {
    try {
      setDescargando(true);
      await formularioDiagnosticoService.descargarExcelReporte(idFormulario);
      toast.success('Reporte Excel descargado correctamente');
    } catch (error) {
      console.error('Error al descargar Excel:', error);
      toast.error('Error al descargar el Excel');
    } finally {
      setDescargando(false);
    }
  };

  if (!isOpen || !idFormulario) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in scale-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Reporte Estadístico Detallado</h2>
                {estadisticas && (
                  <p className="text-amber-100 text-sm">
                    {estadisticas.nombreIpress} - Formulario #{idFormulario}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-amber-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex gap-1 px-6">
            {['dashboard', 'analisis', 'detalle'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActivo(tab)}
                className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                  tabActivo === tab
                    ? 'bg-white text-amber-600 border-t-2 border-amber-600'
                    : 'text-gray-600 hover:text-amber-600'
                }`}
              >
                {tab === 'dashboard' && 'Dashboard'}
                {tab === 'analisis' && 'Análisis por Sección'}
                {tab === 'detalle' && 'Detalle Completo'}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader className="w-12 h-12 text-amber-600 animate-spin" />
                <p className="text-gray-600 font-semibold">Cargando estadísticas...</p>
              </div>
            </div>
          ) : estadisticas ? (
            <>
              {tabActivo === 'dashboard' && <TabDashboard data={estadisticas} />}
              {tabActivo === 'analisis' && <TabAnalisis data={estadisticas} />}
              {tabActivo === 'detalle' && <TabDetalle data={estadisticas} />}
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">
              No hay datos disponibles
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
          <div className="text-sm text-gray-600">
            Generado: {new Date().toLocaleString('es-PE')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={descargarExcel}
              disabled={descargando}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              {descargando ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exportar Excel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTE TAB DASHBOARD ====================
function TabDashboard({ data }) {
  console.log('📈 TabDashboard renderizando con datos:', data ? 'SÍ' : 'NO');
  console.log('📊 Datos completos:', data);

  const kpis = [
    {
      label: 'Infraestructura',
      value: `${Math.round(data.infraFisica?.porcentajeCumplimiento || 0)}%`,
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Equipamiento',
      value: `${data.equipamientoResumen?.equiposDisponibles || 0}/${data.equipamientoResumen?.totalEquipos || 0}`,
      color: 'from-green-50 to-green-100',
      borderColor: 'border-green-200'
    },
    {
      label: 'Servicios',
      value: `${Math.round(data.servicioResumen?.porcentajeDisponibilidad || 0)}%`,
      color: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      label: 'RRHH Capacitados',
      value: `${Math.round(data.rrhh?.porcentajeSi || 0)}%`,
      color: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200'
    }
  ];

  const datosPie = [
    { name: 'Sí', value: data.preguntasSi || 0 },
    { name: 'No', value: data.preguntasNo || 0 }
  ];

  // Separar por tipo si están disponibles, si no usar listas originales
  const equipInf = data.equipamientoInformatico?.length > 0 ? data.equipamientoInformatico : (data.equipamientoInfo?.filter(e => e.tipoEquipamiento === 'INF') || []);
  const equipBio = data.equipamientoBiomedico?.length > 0 ? data.equipamientoBiomedico : (data.equipamientoInfo?.filter(e => e.tipoEquipamiento === 'BIO') || []);

  const datosEquipamiento = [
    {
      nombre: 'Informático',
      disponibles: equipInf?.filter(e => e.disponible)?.length || 0,
      noDisponibles: (equipInf?.length || 0) - (equipInf?.filter(e => e.disponible)?.length || 0)
    },
    {
      nombre: 'Biomédico',
      disponibles: equipBio?.filter(e => e.disponible)?.length || 0,
      noDisponibles: (equipBio?.length || 0) - (equipBio?.filter(e => e.disponible)?.length || 0)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Información General */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-2">Información del Formulario</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-amber-600 font-semibold">IPRESS</p>
            <p className="text-amber-900">{data.nombreIpress}</p>
          </div>
          <div>
            <p className="text-amber-600 font-semibold">Red</p>
            <p className="text-amber-900">{data.nombreRed || 'N/A'}</p>
          </div>
          <div>
            <p className="text-amber-600 font-semibold">Estado</p>
            <p className="text-amber-900">{data.estado}</p>
          </div>
          <div>
            <p className="text-amber-600 font-semibold">Año</p>
            <p className="text-amber-900">{data.anio}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${kpi.color} rounded-xl p-4 border ${kpi.borderColor}`}
          >
            <p className="text-sm text-gray-600 mb-1 font-medium">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PieChart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Respuestas
          </h3>
          {datosPie[0].value + datosPie[1].value > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={datosPie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* BarChart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Equipamiento por Tipo
          </h3>
          {datosEquipamiento.some(d => d.disponibles + d.noDisponibles > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={datosEquipamiento} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="disponibles" fill="#10b981" name="Disponibles" />
                <Bar dataKey="noDisponibles" fill="#ef4444" name="No Disponibles" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500">
              Sin datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Tabla Resumen */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Resumen por Sección</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sección</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Preguntas</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Respuestas Sí</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">% Cumplimiento</th>
              </tr>
            </thead>
            <tbody>
              {data.infraFisica && (
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">Infraestructura Física</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{data.infraFisica.totalPreguntas}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{data.infraFisica.respuestasSi}</td>
                  <td className="px-6 py-3 text-center text-sm font-semibold text-green-600">
                    {Math.round(data.infraFisica.porcentajeCumplimiento)}%
                  </td>
                </tr>
              )}
              {data.infraTec && (
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">Infraestructura Tecnológica</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{data.infraTec.totalPreguntas}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{data.infraTec.respuestasSi}</td>
                  <td className="px-6 py-3 text-center text-sm font-semibold text-green-600">
                    {Math.round(data.infraTec.porcentajeCumplimiento)}%
                  </td>
                </tr>
              )}
              {data.rrhh && (
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">Recursos Humanos</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{data.rrhh.totalPreguntas}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{data.rrhh.respuestasSi}</td>
                  <td className="px-6 py-3 text-center text-sm font-semibold text-green-600">
                    {Math.round(data.rrhh.porcentajeSi)}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTE TAB ANÁLISIS ====================
function TabAnalisis({ data }) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 font-semibold">📊 Análisis por Sección</p>
        <p className="text-yellow-700 text-sm mt-1">
          Vista detallada de cada sección con gráficos y tablas interactivas
        </p>
      </div>

      {/* Resumen de Necesidades */}
      {data.necesidadResumen && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Necesidades</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-600 font-semibold">Prioridad Alta</p>
                <p className="text-2xl font-bold text-red-700">{data.necesidadResumen.necesidadesAlta || 0}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-600 font-semibold">Prioridad Media</p>
                <p className="text-2xl font-bold text-yellow-700">{data.necesidadResumen.necesidadesMedia || 0}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-semibold">Prioridad Baja</p>
                <p className="text-2xl font-bold text-blue-700">{data.necesidadResumen.necesidadesBaja || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 font-semibold">Total</p>
                <p className="text-2xl font-bold text-gray-700">{data.necesidadResumen.totalNecesidades || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de Conectividad */}
      {data.conectividad && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Conectividad</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Internet</p>
                <p className="text-sm text-gray-900 font-semibold mt-0.5">
                  {data.conectividad.tieneInternet ? '✅ Sí' : '❌ No'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Estable</p>
                <p className="text-sm text-gray-900 font-semibold mt-0.5">
                  {data.conectividad.esEstable ? '✅ Sí' : '❌ No'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Tipo</p>
                <p className="text-sm text-gray-900 font-semibold mt-0.5">
                  {data.conectividad.tipoConexion || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Velocidad (Mbps)</p>
                <p className="text-sm text-gray-900 font-semibold mt-0.5">
                  {data.conectividad.velocidadContratada} / {data.conectividad.velocidadReal}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Puntos Red</p>
                <p className="text-sm text-gray-900 font-semibold mt-0.5">
                  {data.conectividad.numPuntosRed}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">WiFi</p>
                <p className="text-sm text-gray-900 font-semibold mt-0.5">
                  {data.conectividad.tieneWifi ? '✅ Sí' : '❌ No'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== COMPONENTE TAB DETALLE ====================
function TabDetalle({ data }) {
  return (
    <div className="space-y-6">
      {/* Equipamiento Informático */}
      {data.equipamientoInformatico && data.equipamientoInformatico.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Equipamiento Informático</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Equipo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Disponible</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Cantidad</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.equipamientoInformatico.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{item.nombreEquipamiento}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        item.disponible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.disponible ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.cantidad || 0}</td>
                    <td className="px-4 py-3 text-gray-700">{item.estado || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipamiento Biomédico */}
      {data.equipamientoBiomedico && data.equipamientoBiomedico.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Equipamiento Biomédico</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Equipo</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Disponible</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Cantidad</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Estado</th>
                </tr>
              </thead>
              <tbody>
                {data.equipamientoBiomedico.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{item.nombreEquipamiento}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        item.disponible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.disponible ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.cantidad || 0}</td>
                    <td className="px-4 py-3 text-gray-700">{item.estado || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Servicios */}
      {data.servicios && data.servicios.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Servicios de Telesalud</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Servicio</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {data.servicios.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{item.nombreServicio}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        item.disponible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.disponible ? 'Sí' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Necesidades */}
      {data.necesidades && data.necesidades.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Necesidades Identificadas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Descripción</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Categoría</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Cantidad Requerida</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {data.necesidades.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{item.descripcion}</td>
                    <td className="px-4 py-3 text-gray-700">{item.categoria || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-700">{item.cantidadRequerida || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        item.prioridad === 'Alta'
                          ? 'bg-red-100 text-red-800'
                          : item.prioridad === 'Media'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.prioridad || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

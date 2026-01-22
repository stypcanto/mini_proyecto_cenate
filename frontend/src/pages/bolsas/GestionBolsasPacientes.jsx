import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, AreaChart, Area } from 'recharts';
import { Users, TrendingUp, AlertCircle, CheckCircle, Download, Activity, Target } from 'lucide-react';

// CSS para animaciones personalizadas
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(13, 91, 169, 0.1);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(13, 91, 169, 0);
    }
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  .animate-slideInLeft {
    animation: slideInLeft 0.4s ease-out forwards;
  }

  .animate-pulseGlow {
    animation: pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .kpi-card:nth-child(1) { animation-delay: 0s; }
  .kpi-card:nth-child(2) { animation-delay: 0.1s; }
  .kpi-card:nth-child(3) { animation-delay: 0.2s; }
  .kpi-card:nth-child(4) { animation-delay: 0.3s; }

  .chart-card:nth-child(1) { animation-delay: 0.4s; }
  .chart-card:nth-child(2) { animation-delay: 0.5s; }
`;

export default function GestionBolsasPacientes() {
  const [activeTab, setActiveTab] = useState('resumen');

  // Inyectar estilos personalizados
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  // Datos para gráficos
  const dataBolsasProduccion = [
    { name: 'Cardiología', bolsas: 38, produccion: 32, asignados: 28 },
    { name: 'Neurología', bolsas: 28, produccion: 24, asignados: 22 },
    { name: 'Oncología', bolsas: 20, produccion: 18, asignados: 18 },
    { name: 'Endocrinología', bolsas: 22, produccion: 20, asignados: 19 },
    { name: 'Psiquiatría', bolsas: 18, produccion: 15, asignados: 14 },
  ];

  const dataGestores = [
    { gestor: 'Dr. Juan Pérez', bolsas: 45, pacientes: 95, asignados: 82, porcentaje: 86 },
    { gestor: 'Dra. María López', bolsas: 32, pacientes: 78, asignados: 72, porcentaje: 92 },
    { gestor: 'Dr. Carlos Ruiz', bolsas: 28, pacientes: 65, asignados: 58, porcentaje: 89 },
    { gestor: 'Dra. Ana García', bolsas: 25, pacientes: 60, asignados: 52, porcentaje: 87 },
    { gestor: 'Dr. Roberto López', bolsas: 20, pacientes: 50, asignados: 43, porcentaje: 86 },
  ];

  const dataIPress = [
    { ipress: 'Essalud Lima', bolsas: 60, pacientes: 180, produccion: 85.5 },
    { ipress: 'Essalud Arequipa', bolsas: 42, pacientes: 120, produccion: 72.4 },
    { ipress: 'Essalud Cusco', bolsas: 35, pacientes: 95, produccion: 68.2 },
    { ipress: 'Essalud Trujillo', bolsas: 28, pacientes: 80, produccion: 64.6 },
    { ipress: 'Essalud Tacna', bolsas: 18, pacientes: 50, produccion: 70.1 },
  ];

  const dataTendencia = [
    { mes: 'Ene', llamadas: 1200, responsables: 950, noResponsables: 250, tasa: 79.2 },
    { mes: 'Feb', llamadas: 1400, responsables: 1100, noResponsables: 300, tasa: 78.6 },
    { mes: 'Mar', llamadas: 1600, responsables: 1350, noResponsables: 250, tasa: 84.4 },
    { mes: 'Abr', llamadas: 1800, responsables: 1600, noResponsables: 200, tasa: 88.9 },
  ];

  // KPIs
  const totalLlamadas = 24441;
  const llamadasResponsables = 24095;
  const llamadasNoResponsables = 9550;
  const tasaConversion = 39.63;

  // Componentes reutilizables - Siguiendo design system
  const KPICard = ({ label, value, change, trend, icon: Icon, borderColor }) => {
    // Mapeo de colores para bordes izquierdos (siguiendo design system)
    const getBorderStyle = (borderColor) => {
      const borderMap = {
        blue: 'border-l-4 border-l-[#0D5BA9]',
        orange: 'border-l-4 border-l-[#F97316]',
        gray: 'border-l-4 border-l-[#6B7280]',
        purple: 'border-l-4 border-l-[#A855F7]',
        red: 'border-l-4 border-l-[#EF4444]'
      };
      return borderMap[borderColor] || borderMap.blue;
    };

    const getIconBg = (borderColor) => {
      const bgMap = {
        blue: 'bg-[#0D5BA9]',
        orange: 'bg-[#F97316]',
        gray: 'bg-[#6B7280]',
        purple: 'bg-[#A855F7]',
        red: 'bg-[#EF4444]'
      };
      return bgMap[borderColor] || bgMap.blue;
    };

    return (
      <div className={'kpi-card bg-white rounded-lg shadow-sm ' + getBorderStyle(borderColor) + ' p-6 animate-fadeInUp cursor-pointer group hover:shadow-md transition-all duration-200 border border-gray-200'}>
        <div className="flex items-start justify-between mb-3">
          <div className={getIconBg(borderColor) + ' p-2 rounded-md'}>
            <Icon size={20} className="text-white" />
          </div>
          <div className={'flex items-center gap-1 text-xs font-semibold ' + (trend === 'up' ? 'text-green-600' : 'text-red-600')}>
            <TrendingUp size={14} />
            {change}
          </div>
        </div>
        <p className="text-gray-600 text-xs font-semibold mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    );
  };

  const TabButton = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={'px-8 py-4 font-semibold text-sm transition-all duration-300 border-b-4 relative group ' + (
        activeTab === tab
          ? 'bg-[#0D5BA9] text-white border-b-[#22C55E] shadow-lg hover:shadow-xl'
          : 'bg-white text-gray-700 border-b-gray-200 hover:bg-gray-50 hover:text-[#0D5BA9] hover:border-b-[#0D5BA9]'
      )}
    >
      {label}
      {activeTab !== tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0D5BA9] via-[#22C55E] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />}
    </button>
  );

  const getTableHeaderClass = (variant) => {
    const classes = {
      blue: 'bg-[#0D5BA9]',
      green: 'bg-[#0D5BA9]',
      purple: 'bg-[#0D5BA9]'
    };
    return classes[variant] || classes.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header CENATE */}
      <div className="bg-gradient-to-r from-[#0D5BA9] via-[#0a4a96] to-[#073d7a] text-white shadow-xl border-b-4 border-[#22C55E] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between animate-slideInLeft">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-[#22C55E] to-emerald-600 p-3 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-pulseGlow">
                  <Activity size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight">Gestión de Bolsas de Pacientes</h1>
                  <p className="text-blue-100 text-xs font-semibold tracking-wider">Dashboard Ejecutivo</p>
                </div>
              </div>
              <p className="text-blue-100 text-sm font-medium mt-2">Centro Nacional de Telemedicina EsSalud • Análisis en Tiempo Real</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 border-2 border-[#22C55E] bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-sm transition-all duration-300 text-[#22C55E] backdrop-blur-sm hover:scale-105 hover:shadow-lg group">
              <Download size={18} className="group-hover:animate-bounce" />
              Exportar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex overflow-x-auto scrollbar-hide">
          <TabButton tab="resumen" label="📊 Resumen Ejecutivo" />
          <TabButton tab="analisis" label="🔍 Análisis Especialidades" />
          <TabButton tab="produccion" label="🏥 Producción IPRESS" />
          <TabButton tab="gestores" label="👥 Gestores de Citas" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* TAB: RESUMEN EJECUTIVO */}
        {activeTab === 'resumen' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Indicadores Clave de Desempeño</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  label="Llamadas Procesadas"
                  value={totalLlamadas.toLocaleString()}
                  change="+5.2%"
                  trend="up"
                  icon={Users}
                  borderColor="blue"
                />
                <KPICard
                  label="No Responsables ⚠️"
                  value={llamadasNoResponsables.toLocaleString()}
                  change="-3.2%"
                  trend="down"
                  icon={AlertCircle}
                  borderColor="orange"
                />
                <KPICard
                  label="Responsables"
                  value={llamadasResponsables.toLocaleString()}
                  change="+2.1%"
                  trend="up"
                  icon={CheckCircle}
                  borderColor="gray"
                />
                <KPICard
                  label="Tasa de Conversión"
                  value={tasaConversion + '%'}
                  change="+2.5%"
                  trend="up"
                  icon={Target}
                  borderColor="purple"
                />
              </div>
            </div>

            {/* Gráficos Premium */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bolsas y Producción */}
              <div className="chart-card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-7 hover:shadow-xl hover:scale-102 transition-all duration-300 animate-fadeInUp backdrop-blur-sm group">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#0D5BA9] to-[#22C55E] rounded-full"></span>
                  Bolsas y Producción por Especialidad
                </h3>
                <div className="group-hover:scale-102 transition-transform duration-300">
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={dataBolsasProduccion} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="bolsas" fill="#1e3a8a" radius={[8, 8, 0, 0]} name="Demanda" />
                      <Bar dataKey="produccion" fill="#86efac" radius={[8, 8, 0, 0]} name="Producción" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tendencia de Llamadas */}
              <div className="chart-card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-7 hover:shadow-xl hover:scale-102 transition-all duration-300 animate-fadeInUp backdrop-blur-sm group">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-[#0D5BA9] to-[#F97316] rounded-full"></span>
                  Tendencia de Llamadas (Últimos 4 Meses)
                </h3>
                <div className="group-hover:scale-102 transition-transform duration-300">
                  <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={dataTendencia} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLlamadas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResponsables" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="mes" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => value.toLocaleString()} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="llamadas" name="Total de Llamadas" stroke="#1e3a8a" fillOpacity={1} fill="url(#colorLlamadas)" strokeWidth={2} />
                    <Area type="monotone" dataKey="responsables" name="Llamadas Responsables" stroke="#22C55E" fillOpacity={1} fill="url(#colorResponsables)" strokeWidth={2} />
                  </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Tabla de Especialidades */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fadeInUp">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Resumen por Especialidad</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0D5BA9] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Especialidad</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Bolsas</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Producción</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Asignados</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Productividad</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Tasa Fallo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dataBolsasProduccion.map((item, idx) => {
                      const porcentaje = Math.round((item.asignados / item.bolsas) * 100);
                      return (
                        <tr key={idx} className="h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-700">{item.bolsas}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-700">{item.produccion}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-700">{item.asignados}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-semibold">
                              {porcentaje}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-semibold">
                              {100 - porcentaje}%
                            </span>
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

        {/* TAB: ANÁLISIS ESPECIALIDADES */}
        {activeTab === 'analisis' && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="chart-card bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-7 hover:shadow-lg transition-all duration-300 backdrop-blur-sm group">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
                Análisis Comparativo de Bolsas, Producción y Asignaciones
              </h3>
              <div className="group-hover:scale-102 transition-transform duration-300">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dataBolsasProduccion} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="bolsas" fill="#1e3a8a" radius={[8, 8, 0, 0]} name="Demanda" />
                    <Bar dataKey="produccion" fill="#22C55E" radius={[8, 8, 0, 0]} name="Producción" />
                    <Bar dataKey="asignados" fill="#86efac" radius={[8, 8, 0, 0]} name="Asignados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fadeInUp">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Detalle por Especialidad</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0D5BA9] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Especialidad</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Bolsas</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Producción</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Asignados</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Tasa Asignación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {dataBolsasProduccion.map((item, idx) => {
                      const porcentaje = Math.round((item.asignados / item.bolsas) * 100);
                      return (
                        <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 group">
                          <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 text-center text-gray-700">{item.bolsas}</td>
                          <td className="px-6 py-4 text-center text-gray-700">{item.produccion}</td>
                          <td className="px-6 py-4 text-center text-gray-700">{item.asignados}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-600" style={{ width: porcentaje + '%' }} />
                              </div>
                              <span className="text-sm font-bold text-gray-900 w-10 text-right">{porcentaje}%</span>
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

        {/* TAB: PRODUCCIÓN IPRESS */}
        {activeTab === 'produccion' && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="chart-card bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-7 hover:shadow-lg transition-all duration-300 backdrop-blur-sm group">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></span>
                Producción por IPRESS (Institución Prestadora de Servicios)
              </h3>
              <div className="group-hover:scale-102 transition-transform duration-300">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dataIPress} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="ipress" angle={-45} textAnchor="end" height={100} stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="bolsas" fill="#1e3a8a" radius={[8, 8, 0, 0]} name="Bolsas" />
                    <Bar dataKey="pacientes" fill="#86efac" radius={[8, 8, 0, 0]} name="Pacientes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fadeInUp">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Análisis Detallado por IPRESS</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0D5BA9] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">IPRESS</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Bolsas</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Pacientes</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Productividad</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Tasa Fallo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dataIPress.map((item, idx) => (
                      <tr key={idx} className="h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.ipress}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">{item.bolsas}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">{item.pacientes}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-semibold">
                            {item.produccion}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs font-semibold">
                            {(100 - item.produccion).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: GESTORES DE CITAS */}
        {activeTab === 'gestores' && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="chart-card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-7 hover:shadow-lg transition-all duration-300 backdrop-blur-sm animate-fadeInUp group">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></span>
                  Volumen de Trabajo por Gestor
                </h3>
                <div className="group-hover:scale-102 transition-transform duration-300">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataGestores} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="gestor" angle={-45} textAnchor="end" height={100} stroke="#9ca3af" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="bolsas" fill="#1e3a8a" radius={[8, 8, 0, 0]} name="Bolsas" />
                    <Bar dataKey="pacientes" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Pacientes" />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 p-7 hover:shadow-lg transition-all duration-300 backdrop-blur-sm animate-fadeInUp group">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-teal-600 to-cyan-600 rounded-full"></span>
                  Tasa de Asignación por Gestor
                </h3>
                <div className="group-hover:scale-102 transition-transform duration-300">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataGestores} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="0" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="gestor" angle={-45} textAnchor="end" height={100} stroke="#9ca3af" style={{ fontSize: '11px' }} />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => value + '%'} />
                    <Bar dataKey="porcentaje" fill="#86efac" radius={[8, 8, 0, 0]} name="Asignación %" />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fadeInUp">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Desempeño Detallado de Gestores de Citas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0D5BA9] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Gestor</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Bolsas</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Pacientes</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Citados</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Asignación</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Tasa Fallo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dataGestores.map((item, idx) => (
                      <tr key={idx} className="h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.gestor}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">{item.bolsas}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">{item.pacientes}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">{item.asignados}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-semibold">
                            {item.porcentaje}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={((100 - item.porcentaje) < 15 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800') + ' px-2 py-1 rounded-md text-xs font-semibold'}>
                            {100 - item.porcentaje}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

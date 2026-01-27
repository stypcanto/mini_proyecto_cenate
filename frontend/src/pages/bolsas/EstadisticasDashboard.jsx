/**
 * 🆕 v2.0.0: EstadisticasDashboard.jsx
 * Dashboard completo con estadísticas, gráficos y KPIs del módulo Bolsas
 *
 * Características:
 * - Resumen ejecutivo (5 tarjetas KPI)
 * - Gráfico de estados (pie/donut)
 * - Tabla de especialidades con ranking
 * - Tabla de IPRESS con ranking
 * - Gráfico de evolución temporal (línea)
 * - Gráfico de tipos de cita (donut)
 * - Indicadores de salud y alertas
 * - Exportar datos
 */

import React, { useState, useEffect } from 'react';
import bolsasService from '../../services/bolsasService';
import './EstadisticasDashboard.css';

export default function EstadisticasDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Datos de estadísticas
  const [estadisticasGenerales, setEstadisticasGenerales] = useState(null);
  const [porEstado, setPorEstado] = useState([]);
  const [porEspecialidad, setPorEspecialidad] = useState([]);
  const [porIpress, setPorIpress] = useState([]);
  const [porTipoCita, setPorTipoCita] = useState([]);
  const [evolucionTemporal, setEvolucionTemporal] = useState([]);
  const [kpis, setKpis] = useState(null);

  // Cargar todas las estadísticas
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [general, estado, especialidad, ipress, tipoCita, temporal, kpisData] = await Promise.all([
        bolsasService.obtenerEstadisticas(),
        bolsasService.obtenerEstadisticasPorEstado(),
        bolsasService.obtenerEstadisticasPorEspecialidad(),
        bolsasService.obtenerEstadisticasPorIpress(),
        bolsasService.obtenerEstadisticasPorTipoCita(),
        bolsasService.obtenerEvolutionTemporal(),
        bolsasService.obtenerKpis(),
      ]);

      setEstadisticasGenerales(general);
      setPorEstado(estado);
      setPorEspecialidad(especialidad);
      setPorIpress(ipress);
      setPorTipoCita(tipoCita);
      setEvolucionTemporal(temporal);
      setKpis(kpisData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setErrorMessage('Error al cargar estadísticas. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // COMPONENTES
  // ========================================================================

  const KPICard = ({ titulo, valor, subtitulo, color, icono }) => (
    <div className="kpi-card bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-semibold mb-1">{titulo}</p>
          <p className="text-3xl font-bold text-gray-800">{valor}</p>
          {subtitulo && <p className="text-xs text-gray-500 mt-2">{subtitulo}</p>}
        </div>
        <div className="text-5xl opacity-20">{icono}</div>
      </div>
    </div>
  );

  const GraficoEstados = () => {
    if (!porEstado.length) return <div className="text-center text-gray-500 p-4">Sin datos</div>;

    const total = porEstado.reduce((sum, item) => sum + item.cantidad, 0);

    return (
      <div className="espacio-central p-4">
        <h3 className="font-bold text-lg mb-4">📊 Distribución por Estado</h3>
        <div className="flex justify-center items-center">
          <div className="w-80 h-80 relative">
            {/* Donut simple */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {porEstado.map((item, index) => {
                const radius = 80;
                const perimeter = 2 * Math.PI * radius;
                const strokeDasharray = (item.cantidad / total) * perimeter;
                const strokeDashoffset = porEstado.slice(0, index).reduce((sum, i) => sum + (i.cantidad / total) * perimeter, 0);

                return (
                  <circle
                    key={index}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="30"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    transform="rotate(-90 100 100)"
                  />
                );
              })}
            </svg>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {porEstado.map((item, idx) => (
            <div key={idx} className="flex items-center text-sm">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: item.color }}></div>
              <span>{item.emoji} {item.estado}: {item.cantidad} ({item.porcentaje}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TablaPorEspecialidad = () => (
    <div className="espacio-central p-4">
      <h3 className="font-bold text-lg mb-4">🏥 Estadísticas por Especialidad</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Especialidad</th>
              <th className="px-4 py-2 text-center">Total</th>
              <th className="px-4 py-2 text-center">Atendidos</th>
              <th className="px-4 py-2 text-center">% Compl.</th>
              <th className="px-4 py-2 text-center">Horas</th>
              <th className="px-4 py-2 text-center">Ranking</th>
            </tr>
          </thead>
          <tbody>
            {porEspecialidad.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{item.especialidad}</td>
                <td className="px-4 py-3 text-center">{item.total}</td>
                <td className="px-4 py-3 text-center text-green-600 font-bold">{item.atendidos}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    item.tasaCompletacion > 75 ? 'bg-green-100 text-green-700' :
                    item.tasaCompletacion > 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.tasaCompletacion}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{item.horasPromedio}h</td>
                <td className="px-4 py-3 text-center font-bold">#{item.ranking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TablaPorIpress = () => (
    <div className="espacio-central p-4">
      <h3 className="font-bold text-lg mb-4">🏛️ Carga por IPRESS (Ranking)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Código</th>
              <th className="px-4 py-2 text-left">IPRESS</th>
              <th className="px-4 py-2 text-left">Red</th>
              <th className="px-4 py-2 text-center">Total</th>
              <th className="px-4 py-2 text-center">Atendidos</th>
              <th className="px-4 py-2 text-center">% Compl.</th>
              <th className="px-4 py-2 text-center">Estado</th>
              <th className="px-4 py-2 text-center">Ranking</th>
            </tr>
          </thead>
          <tbody>
            {porIpress.slice(0, 15).map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-blue-600">{item.codigoIpress}</td>
                <td className="px-4 py-3 font-semibold">{item.nombreIpress || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-600">{item.redAsistencial || 'N/A'}</td>
                <td className="px-4 py-3 text-center font-bold">{item.total}</td>
                <td className="px-4 py-3 text-center text-green-600 font-bold">{item.atendidos}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.tasaCompletacion > 75 ? 'bg-green-100 text-green-700' :
                    item.tasaCompletacion > 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.tasaCompletacion}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-xl">{item.indicador}</td>
                <td className="px-4 py-3 text-center font-bold">#{item.ranking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const GraficoEvolucion = () => {
    if (!evolucionTemporal.length) return <div className="text-center text-gray-500 p-4">Sin datos</div>;

    const maxValue = Math.max(...evolucionTemporal.map(d => Math.max(d.nuevasSolicitudes || 0, d.completadas || 0)));
    const altura = 300;
    const ancho = Math.max(400, evolucionTemporal.length * 30);

    return (
      <div className="espacio-central p-4">
        <h3 className="font-bold text-lg mb-4">📈 Evolución Temporal (Últimos 30 días)</h3>
        <div className="overflow-x-auto">
          <svg width={ancho} height={altura} className="border border-gray-300 rounded">
            {/* Eje Y */}
            <line x1="50" y1="20" x2="50" y2={altura - 40} stroke="#ccc" strokeWidth="1" />
            {/* Eje X */}
            <line x1="50" y1={altura - 40} x2={ancho} y2={altura - 40} stroke="#ccc" strokeWidth="1" />

            {/* Línea de nuevas solicitudes */}
            <polyline
              points={evolucionTemporal.map((d, i) => {
                const x = 50 + i * 30;
                const y = altura - 40 - (d.nuevasSolicitudes / maxValue) * 250;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#0066CC"
              strokeWidth="2"
            />

            {/* Línea de completadas */}
            <polyline
              points={evolucionTemporal.map((d, i) => {
                const x = 50 + i * 30;
                const y = altura - 40 - (d.completadas / maxValue) * 250;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#00AA00"
              strokeWidth="2"
            />

            {/* Leyenda */}
            <text x="60" y="30" fontSize="12" fill="#0066CC">— Nuevas</text>
            <text x="140" y="30" fontSize="12" fill="#00AA00">— Completadas</text>
          </svg>
        </div>
      </div>
    );
  };

  const GraficoTipoCita = () => {
    if (!porTipoCita.length) return <div className="text-center text-gray-500 p-4">Sin datos</div>;

    return (
      <div className="espacio-central p-4">
        <h3 className="font-bold text-lg mb-4">📞 Distribución por Tipo de Cita</h3>
        <div className="grid grid-cols-2 gap-4">
          {porTipoCita.map((item, idx) => (
            <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-2xl mb-2">{item.icono}</p>
              <p className="font-bold text-gray-800">{item.tipoCita || 'Sin especificar'}</p>
              <p className="text-2xl font-bold text-blue-600">{item.total}</p>
              <p className="text-xs text-gray-600 mt-1">{item.porcentaje}% del total</p>
              <p className="text-xs text-green-600 font-bold mt-1">
                Completación: {item.tasaCompletacion}%
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Dashboard de Estadísticas</h1>
          <p className="text-gray-600">Bolsas de Pacientes v2.0.0</p>
          {errorMessage && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}
          <button
            onClick={cargarEstadisticas}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          >
            🔄 Refrescar
          </button>
        </div>

        {/* KPI Cards - Resumen Ejecutivo */}
        {estadisticasGenerales && (
          <div className="grid grid-cols-5 gap-4 mb-8">
            <KPICard
              titulo="Total Solicitudes"
              valor={estadisticasGenerales.totalSolicitudes}
              icono="📋"
              color="#0066CC"
            />
            <KPICard
              titulo="Atendidas"
              valor={estadisticasGenerales.totalAtendidas}
              subtitulo={`${estadisticasGenerales.tasaCompletacion}%`}
              icono="✅"
              color="#00AA00"
            />
            <KPICard
              titulo="Pendientes"
              valor={estadisticasGenerales.totalPendientes}
              subtitulo={`${estadisticasGenerales.pendientesVencidas} vencidas`}
              icono="📌"
              color="#FFAA00"
            />
            <KPICard
              titulo="Canceladas"
              valor={estadisticasGenerales.totalCanceladas}
              subtitulo={`${estadisticasGenerales.tasaAbandono}%`}
              icono="❌"
              color="#FF0000"
            />
            <KPICard
              titulo="Derivadas"
              valor={estadisticasGenerales.totalDerivadas}
              icono="🚀"
              color="#9900FF"
            />
          </div>
        )}

        {/* KPIs Detallados */}
        {kpis && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">🎯 Indicadores Clave de Rendimiento</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Salud General</p>
                <p className="text-3xl font-bold">{kpis.saludGeneral}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Tasa Completación</p>
                <p className="text-3xl font-bold text-green-600">{kpis.tasaCompletacion}%</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Pendientes Vencidas</p>
                <p className="text-3xl font-bold text-yellow-600">{kpis.pendientesVencidas}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Promedio Horas</p>
                <p className="text-3xl font-bold text-purple-600">{kpis.horasPromedioGeneral}h</p>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md">
            <GraficoEstados />
          </div>
          <div className="bg-white rounded-lg shadow-md">
            <GraficoTipoCita />
          </div>
        </div>

        {/* Evolución Temporal */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <GraficoEvolucion />
        </div>

        {/* Tablas */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <TablaPorEspecialidad />
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <TablaPorIpress />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Dashboard de Estadísticas v2.0.0 • Última actualización: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

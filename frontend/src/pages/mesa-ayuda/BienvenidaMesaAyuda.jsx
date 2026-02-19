import React, { useEffect, useState } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Página de bienvenida del Módulo Mesa de Ayuda
 * Muestra KPIs principales y tickets recientes
 *
 * Componentes:
 * - KPI Cards: Total, Abiertos, En Proceso, Resueltos, Cerrados
 * - Tasa de Resolución
 * - Tickets Recientes (tabla con los últimos 5 tickets)
 *
 * @version v1.64.0 (2026-02-18)
 */
function BienvenidaMesaAyuda() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lazy import para evitar problemas de circular dependencies
      const { mesaAyudaService } = await import('../../services/mesaAyudaService');

      const [kpisRes, ticketsRes] = await Promise.all([
        mesaAyudaService.obtenerKPIs(),
        mesaAyudaService.obtenerTodos(0, 5),
      ]);

      setKpis(kpisRes.data);
      setTickets(ticketsRes.data.content || []);
      setError(null);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos de Mesa de Ayuda');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeColor = (estado) => {
    const colors = {
      ABIERTO: 'bg-red-100 text-red-800',
      EN_PROCESO: 'bg-yellow-100 text-yellow-800',
      RESUELTO: 'bg-green-100 text-green-800',
      CERRADO: 'bg-gray-100 text-gray-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadBadgeColor = (prioridad) => {
    const colors = {
      ALTA: 'bg-red-100 text-red-800',
      MEDIA: 'bg-orange-100 text-orange-800',
      BAJA: 'bg-blue-100 text-blue-800',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de Mesa de Ayuda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 size={32} className="text-blue-600" />
          Mesa de Ayuda
        </h1>
        <p className="text-gray-600 mt-2">
          Sistema de soporte y gestión de tickets técnicos para médicos
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Tickets */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total de Tickets</h3>
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{kpis.totalTickets}</p>
            <p className="text-xs text-gray-500 mt-1">Todos los estados</p>
          </div>

          {/* Tickets Abiertos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Abiertos</h3>
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">{kpis.ticketsAbiertos}</p>
            <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
          </div>

          {/* En Proceso */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">En Proceso</h3>
              <Clock size={20} className="text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{kpis.ticketsEnProceso}</p>
            <p className="text-xs text-gray-500 mt-1">Siendo atendidos</p>
          </div>

          {/* Resueltos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Resueltos</h3>
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{kpis.ticketsResueltos}</p>
            <p className="text-xs text-gray-500 mt-1">Completados</p>
          </div>

          {/* Tasa de Resolución */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Tasa de Resolución</h3>
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {kpis.tasaResolucion.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Eficiencia</p>
          </div>
        </div>
      )}

      {/* Tickets Recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Tickets Recientes</h2>
        </div>

        {tickets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No hay tickets para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, idx) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate('/mesa-ayuda/tickets')}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      #{ticket.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {ticket.titulo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ticket.nombreMedico || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadgeColor(ticket.estado)}`}>
                        {ticket.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPrioridadBadgeColor(ticket.prioridad)}`}>
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer con botón */}
        <div className="p-6 border-t border-gray-200 text-center">
          <button
            onClick={() => navigate('/mesa-ayuda/tickets')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Ver Todos los Tickets
          </button>
        </div>
      </div>
    </div>
  );
}

export default BienvenidaMesaAyuda;

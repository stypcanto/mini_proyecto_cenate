import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Loader
} from 'lucide-react';
import { obtenerMiBandeja, cambiarEstado } from '../../services/bolsasService';

/**
 * Componente Mi Bandeja - Panel de gestoras para ver solicitudes asignadas
 * Permite a gestoras (GESTOR_DE_CITAS) ver sus solicitudes asignadas y marcar como atendidas
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
const MiBandeja = () => {
  // ============================================================================
  // ESTADOS
  // ============================================================================
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [modalConfirmacion, setModalConfirmacion] = useState(null);
  const [atendidoEstadoId, setAtendidoEstadoId] = useState(3); // Valor por defecto

  // Estados para los DTOs de consulta de estados
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);

  // ============================================================================
  // EFECTOS
  // ============================================================================
  useEffect(() => {
    cargarDatos();
  }, []);

  // ============================================================================
  // MÉTODOS DE CARGA
  // ============================================================================
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar solicitudes asignadas
      const respuesta = await obtenerMiBandeja();
      console.log('📬 Respuesta Mi Bandeja:', respuesta);

      const solicitudesList = respuesta.solicitudes || respuesta.data?.solicitudes || [];
      setSolicitudes(Array.isArray(solicitudesList) ? solicitudesList : []);

      // Aquí podríamos cargar estados disponibles si fuera necesario
      // Por ahora usamos un ID fijo para "Atendido"

      setIsLoading(false);
    } catch (err) {
      console.error('❌ Error cargando bandeja:', err);
      setError(err.message || 'Error al cargar las solicitudes');
      setIsLoading(false);
    }
  };

  // ============================================================================
  // MÉTODOS DE ACCIÓN
  // ============================================================================
  const marcarComoAtendido = async (solicitud) => {
    try {
      console.log('📬 Marcando como atendido solicitud:', solicitud.idSolicitud);

      // Llamar a API para cambiar estado a "Atendido"
      // El estado ID 3 corresponde a "ATENDIDO" en dim_estados_gestion_citas
      await cambiarEstado(solicitud.idSolicitud, atendidoEstadoId);

      // Actualizar estado local
      setSolicitudes(solicitudes.map(s =>
        s.idSolicitud === solicitud.idSolicitud
          ? { ...s, estadoGestionCitasId: atendidoEstadoId }
          : s
      ));

      setModalConfirmacion(null);

      // Mostrar notificación de éxito (opcional)
      console.log('✅ Solicitud marcada como atendida');
    } catch (err) {
      console.error('❌ Error marcando como atendido:', err);
      setError('Error al marcar como atendido: ' + err.message);
    }
  };

  const abrirModalConfirmacion = (solicitud) => {
    setModalConfirmacion({
      accion: 'marcar_atendido',
      solicitud: solicitud
    });
  };

  const cerrarModalConfirmacion = () => {
    setModalConfirmacion(null);
  };

  // ============================================================================
  // FILTRADO
  // ============================================================================
  const solicitudesFiltradas = solicitudes.filter(s => {
    const coincideBusqueda =
      (s.pacienteNombre && s.pacienteNombre.toLowerCase().includes(filtroBusqueda.toLowerCase())) ||
      (s.pacienteDni && s.pacienteDni.includes(filtroBusqueda)) ||
      (s.especialidad && s.especialidad.toLowerCase().includes(filtroBusqueda.toLowerCase()));

    return coincideBusqueda;
  });

  // ============================================================================
  // UTILIDADES
  // ============================================================================
  const obtenerEstadoColor = (estadoId) => {
    switch (estadoId) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-red-100 text-red-800';
      case 3:
        return 'bg-green-100 text-green-800';
      case 4:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerEstadoLabel = (estadoId) => {
    const estadosMap = {
      1: 'PENDIENTE',
      2: 'CANCELADO',
      3: 'ATENDIDO',
      4: 'DERIVADO'
    };
    return estadosMap[estadoId] || 'DESCONOCIDO';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  // ============================================================================
  // RENDER: LOADING
  // ============================================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando tus solicitudes...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: ERROR
  // ============================================================================
  if (error && solicitudes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-red-800">Error</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={cargarDatos}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: PÁGINA PRINCIPAL
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <CheckCircle className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Mi Bandeja</h1>
          </div>
          <p className="text-gray-600">
            Gestiona las solicitudes de pacientes asignadas a ti
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{solicitudes.length}</div>
            <div className="text-gray-600 text-sm mt-1">Total asignadas</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="text-3xl font-bold text-yellow-600">
              {solicitudes.filter(s => s.estadoGestionCitasId === 1).length}
            </div>
            <div className="text-gray-600 text-sm mt-1">Pendientes</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">
              {solicitudes.filter(s => s.estadoGestionCitasId === 3).length}
            </div>
            <div className="text-gray-600 text-sm mt-1">Atendidas</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">
              {solicitudes.filter(s => s.estadoGestionCitasId === 2).length}
            </div>
            <div className="text-gray-600 text-sm mt-1">Canceladas</div>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <input
            type="text"
            placeholder="🔍 Busca por nombre de paciente, DNI o especialidad..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabla de solicitudes */}
        {solicitudesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {filtroBusqueda
                ? 'No hay solicitudes que coincidan con tu búsqueda'
                : 'No tienes solicitudes asignadas aún'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Fecha Solicitud
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((solicitud) => (
                    <tr key={solicitud.idSolicitud} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          {solicitud.pacienteNombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {solicitud.pacienteDni}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {solicitud.especialidad || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          {solicitud.pacienteTelefono || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {formatearFecha(solicitud.fechaSolicitud)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${obtenerEstadoColor(
                            solicitud.estadoGestionCitasId
                          )}`}
                        >
                          {obtenerEstadoLabel(solicitud.estadoGestionCitasId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {solicitud.estadoGestionCitasId !== 3 ? (
                          <button
                            onClick={() => abrirModalConfirmacion(solicitud)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Marcar Atendido
                          </button>
                        ) : (
                          <span className="text-green-600 text-xs font-semibold">✓ Completado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {modalConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Confirmar acción</h2>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Marcar a <strong>{modalConfirmacion.solicitud.pacienteNombre}</strong> como
              atendido?
            </p>

            <div className="flex gap-4">
              <button
                onClick={cerrarModalConfirmacion}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => marcarComoAtendido(modalConfirmacion.solicitud)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiBandeja;

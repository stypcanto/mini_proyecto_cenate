import React, { useState, useEffect } from 'react';
import { Users, Headphones, Search, Filter, Plus, MoreVertical, AlertCircle, ChevronDown, UserCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getToken } from '../../../constants/auth';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

export default function BolsaPacientesAsignados() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroAsignacion, setFiltroAsignacion] = useState('todas'); // 'todas', 'asignadas', 'sin-asignar'
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [gestores, setGestores] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [selectedGestor, setSelectedGestor] = useState('');
  const [asignando, setAsignando] = useState(false);

  // Estadísticas
  const totalSolicitudes = solicitudes.length;
  const asignadas = solicitudes.filter(s => s.responsable_gestora_id).length;
  const sinAsignar = totalSolicitudes - asignadas;

  // Cargar solicitudes
  useEffect(() => {
    cargarSolicitudes();
    cargarGestores();
  }, [filtroAsignacion]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const token = getToken();

      // Construir query según filtro
      let url = `${API_BASE}/bolsas/solicitudes?activo=true`;
      if (filtroAsignacion === 'asignadas') {
        url += '&tieneAsignacion=true';
      } else if (filtroAsignacion === 'sin-asignar') {
        url += '&tieneAsignacion=false';
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const solicitudesList = Array.isArray(data) ? data : data.solicitudes || data.content || [];
      setSolicitudes(solicitudesList);
      console.log(`✅ Cargadas ${solicitudesList.length} solicitudes (Filtro: ${filtroAsignacion})`);
    } catch (error) {
      console.error('❌ Error al cargar solicitudes:', error);
      toast.error('Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarGestores = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/bolsas/solicitudes/gestoras-disponibles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGestores(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('❌ Error al cargar gestores:', error);
    }
  };

  // Filtrar solicitudes por búsqueda
  const solicitudesFiltradas = solicitudes.filter(s => {
    const coincideBusqueda =
      (s.paciente_nombre?.toLowerCase().includes(busqueda.toLowerCase())) ||
      (s.paciente_dni?.includes(busqueda)) ||
      (s.especialidad?.toLowerCase().includes(busqueda.toLowerCase())) ||
      (s.desc_ipress?.toLowerCase().includes(busqueda.toLowerCase()));

    return coincideBusqueda;
  });

  const asignarSolicitud = async () => {
    if (!selectedGestor) {
      toast.error('Selecciona un gestor');
      return;
    }

    try {
      setAsignando(true);
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/bolsas/solicitudes/${selectedSolicitud.id_solicitud}/asignar?idGestora=${selectedGestor}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        toast.success('✅ Solicitud asignada correctamente');
        setShowAsignarModal(false);
        setSelectedGestor('');
        cargarSolicitudes();
      } else {
        toast.error('Error al asignar solicitud');
      }
    } catch (error) {
      console.error('Error al asignar:', error);
      toast.error('Error al asignar solicitud');
    } finally {
      setAsignando(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Headphones className="w-8 h-8 text-blue-600" />
            Bolsa de Pacientes Asignados
          </h1>
          <p className="text-gray-600 mt-1">Gestiona la asignación de pacientes a gestores de citas</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Solicitudes</p>
              <p className="text-3xl font-bold text-gray-900">{totalSolicitudes}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Asignadas</p>
              <p className="text-3xl font-bold text-gray-900">{asignadas}</p>
            </div>
            <Plus className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sin Asignar</p>
              <p className="text-3xl font-bold text-gray-900">{sinAsignar}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI, especialidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro de Asignación */}
          <div className="w-full lg:w-48">
            <select
              value={filtroAsignacion}
              onChange={(e) => setFiltroAsignacion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas las solicitudes</option>
              <option value="asignadas">Solo asignadas</option>
              <option value="sin-asignar">Sin asignar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-2">Cargando solicitudes...</p>
          </div>
        ) : solicitudesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <Headphones className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No hay solicitudes para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">DNI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Especialidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">IPRESS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Gestor Asignado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {solicitudesFiltradas.map((solicitud) => (
                  <tr key={solicitud.id_solicitud} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{solicitud.paciente_dni}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{solicitud.paciente_nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{solicitud.especialidad}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{solicitud.desc_ipress}</td>
                    <td className="px-6 py-4 text-sm">
                      {solicitud.responsable_gestora ? (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          {solicitud.responsable_gestora}
                        </span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {solicitud.desc_estado_cita || 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedSolicitud(solicitud);
                          setShowAsignarModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Asignar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Asignación */}
      {showAsignarModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Asignar Solicitud</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Paciente:</strong> {selectedSolicitud.paciente_nombre}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Especialidad:</strong> {selectedSolicitud.especialidad}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona un Gestor de Citas
              </label>
              <select
                value={selectedGestor}
                onChange={(e) => setSelectedGestor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Selecciona un gestor --</option>
                {gestores.map((gestor) => (
                  <option key={gestor.id} value={gestor.id}>
                    {gestor.nombre || gestor.nombreCompleto}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAsignarModal(false);
                  setSelectedGestor('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={asignando}
              >
                Cancelar
              </button>
              <button
                onClick={asignarSolicitud}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={asignando || !selectedGestor}
              >
                {asignando ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

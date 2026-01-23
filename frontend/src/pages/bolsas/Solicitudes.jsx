import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, ChevronDown, Circle, Eye, Users, UserPlus, Download, FileText, FolderOpen, ListChecks } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListHeader from '../../components/ListHeader';
import bolsasService from '../../services/bolsasService';

/**
 * 📋 Solicitudes - Recepción de Bolsa
 * v2.0.0 - Redesign con estadísticas y filtros mejorados
 *
 * Características:
 * - Dashboard de estadísticas por estado (Total, Pendientes, Citados, Atendidos, Observados)
 * - Tabla mejorada con IPRESS, Bolsa, Fechas, Estado, Semáforo
 * - Filtros dropdown para Bolsas, Redes, Especialidades, Estados
 * - Indicadores de tráfico (semáforo) por paciente
 * - Acciones: Cambiar celular
 */
export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroBolsa, setFiltroBolsa] = useState('todas');
  const [filtroRed, setFiltroRed] = useState('todas');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Cache de catálogos para evitar N+1 queries
  const [cacheEstados, setCacheEstados] = useState({});
  const [cacheIpress, setCacheIpress] = useState({});
  const [cacheRedes, setCacheRedes] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Cargar solicitudes y catálogos inicialmente
    cargarDatos();
  }, []);

  // Cargar solicitudes y catálogos en paralelo
  const cargarDatos = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Cargar solicitudes y catálogos en paralelo
      const [solicitudesData, estadosData, ipressData, redesData] = await Promise.all([
        bolsasService.obtenerSolicitudes(),
        bolsasService.obtenerEstadosGestion().catch(() => []),
        bolsasService.obtenerIpress().catch(() => []),
        bolsasService.obtenerRedes().catch(() => [])
      ]);

      // Procesar solicitudes y enriquecer con nombres de catálogos
      const solicitudesEnriquecidas = (solicitudesData || []).map(solicitud => {
        return {
          ...solicitud,
          paciente: solicitud.pacienteNombre || '',
          telefono: solicitud.pacienteTelefono || '',
          estado: mapearEstadoAPI(solicitud.estado),
          semaforo: solicitud.recordatorioEnviado ? 'verde' : 'rojo',
          diferimiento: calcularDiferimiento(solicitud.fechaSolicitud),
          especialidad: solicitud.especialidad || 'N/A',
          sexo: 'N/A',
          red: solicitud.responsableGestoraNombre || 'Sin asignar',
          ipress: solicitud.idBolsa ? `Bolsa ${solicitud.idBolsa}` : 'N/A',
          bolsa: solicitud.nombreBolsa || 'Sin clasificar'
        };
      });

      setSolicitudes(solicitudesEnriquecidas);

      // Crear cache de estados, IPRESS y Redes
      if (estadosData && Array.isArray(estadosData)) {
        const estadosMap = {};
        estadosData.forEach(e => { estadosMap[e.id] = e; });
        setCacheEstados(estadosMap);
      }

      if (ipressData && Array.isArray(ipressData)) {
        const ipressMap = {};
        ipressData.forEach(i => { ipressMap[i.id] = i; });
        setCacheIpress(ipressMap);
      }

      if (redesData && Array.isArray(redesData)) {
        const redesMap = {};
        redesData.forEach(r => { redesMap[r.id] = r; });
        setCacheRedes(redesMap);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setErrorMessage('Error al cargar las solicitudes. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Mapear estado API a estado UI
  const mapearEstadoAPI = (estado) => {
    const mapping = {
      'PENDIENTE': 'pendiente',
      'APROBADA': 'citado',
      'RECHAZADA': 'observado',
      'ATENDIDA': 'atendido'
    };
    return mapping[estado] || 'pendiente';
  };

  // Helper: Calcular diferimiento en días desde la fecha de solicitud
  const calcularDiferimiento = (fechaSolicitud) => {
    if (!fechaSolicitud) return 0;
    const fecha = new Date(fechaSolicitud);
    const hoy = new Date();
    const diferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return Math.max(0, diferencia);
  };

  // Calcular estadísticas
  const estadisticas = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
    citados: solicitudes.filter(s => s.estado === 'citado').length,
    atendidos: solicitudes.filter(s => s.estado === 'atendido').length,
    observados: solicitudes.filter(s => s.estado === 'observado').length,
  };

  // Aplicar filtros
  const solicitudesFiltradas = solicitudes.filter(sol => {
    const matchBusqueda = sol.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sol.dni.includes(searchTerm) ||
                         sol.ipress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sol.red.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sol.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBolsa = filtroBolsa === 'todas' || sol.bolsa === filtroBolsa;
    const matchRed = filtroRed === 'todas' || sol.red === filtroRed;
    const matchEspecialidad = filtroEspecialidad === 'todas' || sol.especialidad === filtroEspecialidad;
    const matchEstado = filtroEstado === 'todos' || sol.estado === filtroEstado;

    return matchBusqueda && matchBolsa && matchRed && matchEspecialidad && matchEstado;
  });

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      citado: 'bg-purple-100 text-purple-800 border border-purple-300',
      atendido: 'bg-green-100 text-green-800 border border-green-300',
      observado: 'bg-red-100 text-red-800 border border-red-300'
    };
    return estilos[estado] || estilos.pendiente;
  };

  const getSemaforoColor = (semaforo) => {
    return semaforo === 'rojo' ? 'text-red-500' : 'text-green-500';
  };

  const getBolsaColor = (bolsa) => {
    const colorMap = {
      'BOLSA 107': 'bg-green-100 text-green-700 border border-green-300',
      'BOLSA DENGUE': 'bg-orange-100 text-orange-700 border border-orange-300',
      'BOLSAS ENFERMERIA': 'bg-cyan-100 text-cyan-700 border border-cyan-300',
      'BOLSAS EXPLOTADATOS': 'bg-pink-100 text-pink-700 border border-pink-300',
      'BOLSAS IVR': 'bg-purple-100 text-purple-700 border border-purple-300',
      'BOLSAS REPROGRAMACION': 'bg-blue-100 text-blue-700 border border-blue-300',
      'BOLSA GESTORES TERRITORIAL': 'bg-indigo-100 text-indigo-700 border border-indigo-300'
    };
    return colorMap[bolsa] || 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  const getSexoColor = (sexo) => {
    return sexo === 'Femenino'
      ? 'bg-pink-100 text-pink-700 border border-pink-300'
      : 'bg-blue-100 text-blue-700 border border-blue-300';
  };

  const getRedColor = () => {
    return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
  };

  // Obtener valores únicos para filtros dinámicos
  const redesUnicas = [...new Set(solicitudes.map(s => s.red))].sort();
  const especialidadesUnicas = [...new Set(solicitudes.map(s => s.especialidad))].sort();

  // Manejar selección de filas
  const toggleRowSelection = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === solicitudesFiltradas.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(solicitudesFiltradas.map(s => s.id)));
    }
  };

  // Obtener iniciales del paciente
  const getInitials = (nombre) => {
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  // Obtener color para diferimiento
  const getDiferimiento = (dias) => {
    if (dias >= 20) {
      return 'text-red-600';
    } else if (dias >= 10) {
      return 'text-orange-600';
    } else {
      return 'text-green-600';
    }
  };

  // Descargar selección de bolsas
  const descargarSeleccion = async () => {
    if (selectedRows.size === 0) {
      alert('Selecciona al menos una bolsa para descargar');
      return;
    }

    try {
      const idsSeleccionados = Array.from(selectedRows);
      const csvBlob = await bolsasService.descargarCSV(idsSeleccionados);

      // Descargar archivo
      const element = document.createElement('a');
      const url = URL.createObjectURL(csvBlob);
      element.setAttribute('href', url);
      element.setAttribute('download', `bolsas_${new Date().toISOString().split('T')[0]}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando CSV:', error);
      alert('Error al descargar el archivo. Intenta nuevamente.');
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full">
        {/* Header Reutilizable */}
        <PageHeader
          badge={{
            label: "Recepción de Bolsa",
            bgColor: "bg-blue-100 text-blue-700",
            icon: FolderOpen
          }}
          title="Solicitudes"
          primaryAction={{
            label: "Agregar Paciente",
            onClick: () => {}
          }}
        />

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total Pacientes"
            value={estadisticas.total}
            borderColor="border-blue-500"
            textColor="text-blue-600"
            icon="👥"
          />
          <StatCard
            label="Pendientes"
            value={estadisticas.pendientes}
            borderColor="border-orange-500"
            textColor="text-orange-600"
            icon="⏳"
          />
          <StatCard
            label="Citados"
            value={estadisticas.citados}
            borderColor="border-purple-500"
            textColor="text-purple-600"
            icon="📞"
          />
          <StatCard
            label="Atendidos"
            value={estadisticas.atendidos}
            borderColor="border-green-500"
            textColor="text-green-600"
            icon="✓"
          />
          <StatCard
            label="Observados"
            value={estadisticas.observados}
            borderColor="border-red-500"
            textColor="text-red-600"
            icon="⚠️"
          />
        </div>

        {/* Sección de Lista de Pacientes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* ListHeader Reutilizable */}
          <ListHeader
            title="Lista de Pacientes"
            searchPlaceholder="Buscar paciente, DNI o IPRESS..."
            searchValue={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            filters={[
              {
                name: "Bolsas",
                value: filtroBolsa,
                onChange: (e) => setFiltroBolsa(e.target.value),
                options: [
                  { label: "Todas las bolsas", value: "todas" },
                  { label: "BOLSA 107", value: "BOLSA 107" },
                  { label: "BOLSA DENGUE", value: "BOLSA DENGUE" },
                  { label: "BOLSAS ENFERMERIA", value: "BOLSAS ENFERMERIA" },
                  { label: "BOLSAS EXPLOTADATOS", value: "BOLSAS EXPLOTADATOS" },
                  { label: "BOLSAS IVR", value: "BOLSAS IVR" },
                  { label: "BOLSAS REPROGRAMACION", value: "BOLSAS REPROGRAMACION" },
                  { label: "BOLSA GESTORES TERRITORIAL", value: "BOLSA GESTORES TERRITORIAL" }
                ]
              },
              {
                name: "Redes",
                value: filtroRed,
                onChange: (e) => setFiltroRed(e.target.value),
                options: [
                  { label: "Todas las redes", value: "todas" },
                  ...redesUnicas.map(red => ({ label: red, value: red }))
                ]
              },
              {
                name: "Especialidades",
                value: filtroEspecialidad,
                onChange: (e) => setFiltroEspecialidad(e.target.value),
                options: [
                  { label: "Todas las especialidades", value: "todas" },
                  ...especialidadesUnicas.map(esp => ({ label: esp, value: esp }))
                ]
              }
            ]}
          />

          {/* Botón para descargar selección */}
          {selectedRows.size > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={descargarSeleccion}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                <Download size={22} className="font-bold" />
                Descargar Selección ({selectedRows.size})
              </button>
            </div>
          )}

          {/* Tabla con nuevo diseño visual */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : errorMessage ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-semibold">{errorMessage}</p>
                  <button
                    onClick={() => cargarDatos()}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : solicitudesFiltradas.length > 0 ? (
              <table className="w-full">
                <thead className="bg-[#0D5BA9] text-white sticky top-0">
                  <tr className="border-b-2 border-blue-800">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === solicitudesFiltradas.length && solicitudesFiltradas.length > 0}
                        onChange={toggleAllRows}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">DNI</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Especialidad</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Sexo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Red</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">IPRESS</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Bolsa</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Fecha Cita</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Fecha Asignación</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Diferimiento</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Semáforo</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Acciones</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Usuarios</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((solicitud) => (
                    <tr key={solicitud.id} className="h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(solicitud.id)}
                          onChange={() => toggleRowSelection(solicitud.id)}
                          className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{solicitud.dni}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{solicitud.paciente}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 flex items-center gap-2">
                        <Phone size={18} className="text-blue-500 flex-shrink-0" />
                        {solicitud.telefono}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{solicitud.especialidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{solicitud.sexo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{solicitud.red}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={solicitud.ipress}>{solicitud.ipress}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-semibold ${getBolsaColor(solicitud.bolsa)}`}>
                          {solicitud.bolsa}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{solicitud.fechaCita}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{solicitud.fechaAsignacion}</td>
                      <td className="px-6 py-4">
                        <select
                          defaultValue={solicitud.estado}
                          className={`px-3 py-1 rounded-md text-xs font-semibold border-0 cursor-pointer ${getEstadoBadge(solicitud.estado)}`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="citado">Citado</option>
                          <option value="atendido">Atendido</option>
                          <option value="observado">Observado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${getDiferimiento(solicitud.diferimiento)}`}>
                          {solicitud.diferimiento} días
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Circle size={20} className={`mx-auto ${getSemaforoColor(solicitud.semaforo)}`} fill="currentColor" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 rounded-md text-sm font-semibold transition-colors"
                          title="Cambiar celular"
                        >
                          <Phone size={18} />
                          Cambiar
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
                            title="Ver"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
                            title="Agregar usuario"
                          >
                            <UserPlus size={18} />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
                            title="Usuarios"
                          >
                            <Users size={18} />
                          </button>
                          <button
                            className="p-2 hover:bg-red-100 rounded-md transition-colors text-red-600"
                            title="Compartir"
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-600 font-semibold text-lg">No hay solicitudes para mostrar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, ChevronDown, Circle, Eye, Users, UserPlus, Download, FileText, FolderOpen, ListChecks } from 'lucide-react';

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

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    setIsLoading(true);
    try {
      // TODO: Llamar a API para obtener solicitudes
      // const response = await bolsasService.obtenerSolicitudes();
      // setSolicitudes(response.data);

      // Mock data con estructura mejorada
      setSolicitudes([
        {
          id: 1,
          dni: '12345678',
          paciente: 'María Gonzales Flores',
          telefono: '+51 987654321',
          especialidad: 'Nutrición',
          sexo: 'Femenino',
          red: 'Red Centro',
          ipress: 'Essalud Lima',
          bolsa: 'BOLSA 107',
          estado: 'pendiente',
          diferimiento: 19,
          semaforo: 'rojo',
          fechaCita: '2026-01-25',
          fechaAsignacion: '2026-01-20'
        },
        {
          id: 2,
          dni: '23456789',
          paciente: 'Juan Pérez Rivera',
          telefono: '+51 912345678',
          especialidad: 'Psicología',
          sexo: 'Masculino',
          red: 'Red Norte',
          ipress: 'Essalud Arequipa',
          bolsa: 'BOLSAS ENFERMERIA',
          estado: 'citado',
          diferimiento: 5,
          semaforo: 'verde',
          fechaCita: '2026-01-22',
          fechaAsignacion: '2026-01-18'
        },
        {
          id: 3,
          dni: '34567890',
          paciente: 'Ana Martínez Soto',
          telefono: '+51 998765432',
          especialidad: 'Medicina General',
          sexo: 'Femenino',
          red: 'Red Sur',
          ipress: 'Essalud Trujillo',
          bolsa: 'BOLSAS REPROGRAMACION',
          estado: 'atendido',
          diferimiento: 8,
          semaforo: 'verde',
          fechaCita: '2026-01-20',
          fechaAsignacion: '2026-01-15'
        },
        {
          id: 4,
          dni: '45678901',
          paciente: 'Carlos Rodríguez Vega',
          telefono: '+51 956789012',
          especialidad: 'Endocrinología',
          sexo: 'Masculino',
          red: 'Red Centro',
          ipress: 'Essalud Lima',
          bolsa: 'BOLSA DENGUE',
          estado: 'observado',
          diferimiento: 13,
          semaforo: 'rojo',
          fechaCita: '2026-01-23',
          fechaAsignacion: '2026-01-19'
        },
        {
          id: 5,
          dni: '56789012',
          paciente: 'Laura Sánchez Morales',
          telefono: '+51 945123456',
          especialidad: 'Cardiología',
          sexo: 'Femenino',
          red: 'Red Oriente',
          ipress: 'Essalud Cusco',
          bolsa: 'BOLSAS EXPLOTADATOS',
          estado: 'pendiente',
          diferimiento: 25,
          semaforo: 'rojo',
          fechaCita: '2026-01-26',
          fechaAsignacion: '2026-01-21'
        },
        {
          id: 6,
          dni: '67890123',
          paciente: 'Roberto Torres Gutierrez',
          telefono: '+51 965432109',
          especialidad: 'Nutrición',
          sexo: 'Masculino',
          red: 'Red Este',
          ipress: 'Essalud Tacna',
          bolsa: 'BOLSAS IVR',
          estado: 'citado',
          diferimiento: 3,
          semaforo: 'verde',
          fechaCita: '2026-01-24',
          fechaAsignacion: '2026-01-19'
        },
        {
          id: 7,
          dni: '78901234',
          paciente: 'Sofía López Ramírez',
          telefono: '+51 987123456',
          especialidad: 'Ginecología',
          sexo: 'Femenino',
          red: 'Red Metropolitana',
          ipress: 'Essalud Puno',
          bolsa: 'BOLSA GESTORES TERRITORIAL',
          estado: 'atendido',
          diferimiento: 2,
          semaforo: 'verde',
          fechaCita: '2026-01-19',
          fechaAsignacion: '2026-01-14'
        },
        {
          id: 8,
          dni: '89012345',
          paciente: 'Diego Fernández Castro',
          telefono: '+51 976543210',
          especialidad: 'Psiquiatría',
          sexo: 'Masculino',
          red: 'Red Centro',
          ipress: 'Essalud Lima',
          bolsa: 'BOLSA 107',
          estado: 'citado',
          diferimiento: 11,
          semaforo: 'verde',
          fechaCita: '2026-01-27',
          fechaAsignacion: '2026-01-22'
        },
      ]);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setIsLoading(false);
    }
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
  const descargarSeleccion = () => {
    if (selectedRows.size === 0) {
      alert('Selecciona al menos una bolsa para descargar');
      return;
    }

    const seleccionados = solicitudesFiltradas.filter(s => selectedRows.has(s.id));

    // Crear CSV
    const headers = ['DNI', 'Nombre', 'Teléfono', 'Especialidad', 'Sexo', 'Red', 'IPRESS', 'Bolsa', 'Fecha Cita', 'Fecha Asignación', 'Estado', 'Diferimiento'];
    const csvContent = [
      headers.join(','),
      ...seleccionados.map(s => [
        s.dni,
        `"${s.paciente}"`,
        s.telefono,
        s.especialidad,
        s.sexo,
        s.red,
        `"${s.ipress}"`,
        s.bolsa,
        s.fechaCita,
        s.fechaAsignacion,
        s.estado,
        `${s.diferimiento} días`
      ].join(','))
    ].join('\n');

    // Descargar archivo
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `bolsas_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Tarjeta de estadística reutilizable
  const StatCard = ({ label, value, borderColor, textColor, icon }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
        <div className={`text-2xl ${textColor} opacity-70`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full">
        {/* Header con título y botón */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <FolderOpen size={16} />
              Recepción de Bolsa
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Solicitudes</h1>
          </div>
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={24} className="font-bold" />
            Agregar Paciente
          </button>
        </div>

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
          {/* Encabezado de sección */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Lista de Pacientes</h2>

            {/* Búsqueda y Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Búsqueda */}
              <div className="relative md:col-span-2">
                <Search size={18} className="absolute left-4 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar paciente, DNI o IPRESS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D5BA9] text-sm"
                />
              </div>

              {/* Filtro Bolsas */}
              <div className="relative">
                <select
                  value={filtroBolsa}
                  onChange={(e) => setFiltroBolsa(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D5BA9] text-sm appearance-none cursor-pointer bg-white"
                >
                  <option value="todas">Todas las bolsas</option>
                  <option value="BOLSA 107">BOLSA 107</option>
                  <option value="BOLSA DENGUE">BOLSA DENGUE</option>
                  <option value="BOLSAS ENFERMERIA">BOLSAS ENFERMERIA</option>
                  <option value="BOLSAS EXPLOTADATOS">BOLSAS EXPLOTADATOS</option>
                  <option value="BOLSAS IVR">BOLSAS IVR</option>
                  <option value="BOLSAS REPROGRAMACION">BOLSAS REPROGRAMACION</option>
                  <option value="BOLSA GESTORES TERRITORIAL">BOLSA GESTORES TERRITORIAL</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtro Redes */}
              <div className="relative">
                <select
                  value={filtroRed}
                  onChange={(e) => setFiltroRed(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D5BA9] text-sm appearance-none cursor-pointer bg-white"
                >
                  <option value="todas">Todas las redes</option>
                  {redesUnicas.map((red) => (
                    <option key={red} value={red}>{red}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtro Especialidades */}
              <div className="relative">
                <select
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D5BA9] text-sm appearance-none cursor-pointer bg-white"
                >
                  <option value="todas">Todas las especialidades</option>
                  {especialidadesUnicas.map((especialidad) => (
                    <option key={especialidad} value={especialidad}>{especialidad}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtro Estados */}
              <div className="relative">
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D5BA9] text-sm appearance-none cursor-pointer bg-white"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="citado">Citado</option>
                  <option value="atendido">Atendido</option>
                  <option value="observado">Observado</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

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

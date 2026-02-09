/**
 * 🚑 DashboardCoordinadorTeleurgencias.jsx (v2.0 - Professional Medical UI)
 *
 * Dashboard profesional de coordinación para Teleurgencias
 * Implementa principios médicos de UX/UI:
 * - Accordions con priorización (Carga Activa | Disponibles)
 * - Código de colores médico (Rojo/Ámbar/Verde/Gris)
 * - Barra lateral de alerta en lugar de fondo completo
 * - Tipografía limpia (números negros en negrita)
 * - Status dots en lugar de badges
 * - Columnas reorganizadas según flujo lógico
 * - Executive View con 3 KPIs principales
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Activity,
  Phone,
  X,
  Eye,
  RefreshCw,
  TrendingDown,
  Loader,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function DashboardCoordinadorTeleurgencias() {
  const { user } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [filtrado, setFiltrado] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cargando, setCargando] = useState(true);

  // ✅ v1.65.4: Modal de lista de pacientes por estado
  const [showPacientesList, setShowPacientesList] = useState(false);
  const [filtroEstadoPacientes, setFiltroEstadoPacientes] = useState(null); // 'ATENDIDO', 'PENDIENTE', 'DESERCION'

  // Accordions
  const [acordeones, setAcordiones] = useState({
    activos: true,      // Abierto por defecto
    disponibles: false,  // Cerrado por defecto
  });

  // Cargar datos del backend
  useEffect(() => {
    cargarMedicos();
  }, []);

  const cargarMedicos = async () => {
    try {
      setCargando(true);
      const response = await apiClient.get('/gestion-pacientes/coordinador/medicos-teleurgencias');
      setMedicos(response);
      setFiltrado(response);
      toast.success('Datos sincronizados');
    } catch (error) {
      console.error('Error cargando médicos:', error);
      toast.error('Error al cargar datos de coordinación');
    } finally {
      setCargando(false);
    }
  };

  // Aplicar filtros (búsqueda)
  useEffect(() => {
    let resultado = medicos;

    if (busqueda) {
      resultado = resultado.filter(m =>
        m.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.username?.includes(busqueda)
      );
    }

    setFiltrado(resultado);
  }, [busqueda, medicos]);

  // Helper: Determinar nivel de alerta médico
  const getNivelAlerta = (medico) => {
    const porcentajeDesercion = medico.pacientesAsignados > 0
      ? (medico.desertadas / medico.pacientesAsignados) * 100
      : 0;

    if (porcentajeDesercion > 25 || medico.pendientes > 5) {
      return 'critico'; // Rojo
    } else if (porcentajeDesercion >= 10 && porcentajeDesercion <= 25) {
      return 'advertencia'; // Ámbar
    } else if ((medico.completadas + medico.pendientes) > 0) {
      return 'optimo'; // Verde Esmeralda
    } else {
      return 'inactivo'; // Gris
    }
  };

  // Helper: Colores por nivel de alerta
  const getColoresAlerta = (nivel) => {
    const colores = {
      critico: {
        barra: 'border-l-4 border-red-500',
        bg: 'hover:bg-red-50',
        dot: 'bg-red-600',
        text: 'text-red-600',
      },
      advertencia: {
        barra: 'border-l-4 border-amber-500',
        bg: 'hover:bg-amber-50',
        dot: 'bg-amber-500',
        text: 'text-amber-600',
      },
      optimo: {
        barra: 'border-l-4 border-emerald-500',
        bg: 'hover:bg-emerald-50',
        dot: 'bg-emerald-600',
        text: 'text-emerald-600',
      },
      inactivo: {
        barra: 'border-l-4 border-gray-300',
        bg: 'hover:bg-gray-50',
        dot: 'bg-gray-400',
        text: 'text-gray-600',
      },
    };
    return colores[nivel] || colores.inactivo;
  };

  // Separar médicos en grupos
  const medicosConCarga = filtrado.filter(m => (m.completadas + m.pendientes) > 0);
  const medicosSinCarga = filtrado.filter(m => (m.completadas + m.pendientes) === 0);

  // Contar alertas críticas
  const alertasCriticas = filtrado.filter(m => getNivelAlerta(m) === 'critico').length;
  const pendientesTotales = filtrado.reduce((sum, m) => sum + (m.pendientes || 0), 0);

  // Calcular estadísticas
  const estadisticas = {
    capacidadOperativa: `${medicosConCarga.length} de ${filtrado.length}`,
    alertasAltas: alertasCriticas,
    pendientes: pendientesTotales,
  };

  // Toggle accordion
  const toggleAcordion = (grupo) => {
    setAcordiones(prev => ({
      ...prev,
      [grupo]: !prev[grupo],
    }));
  };

  const abrirDetalles = (medico) => {
    setMedicoSeleccionado(medico);
    setShowModal(true);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando coordinación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Encabezado */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Coordinación Teleurgencias
          </h1>
          <p className="text-gray-600">Supervisión en tiempo real del equipo médico</p>
        </div>
        <button
          onClick={cargarMedicos}
          className="p-2 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-sm font-medium"
          title="Recargar datos"
        >
          <RefreshCw className="w-5 h-5" />
          Actualizar
        </button>
      </div>

      {/* === LEYENDA: Significado de Estados y Alertas === */}
      <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leyenda de Estados */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-3">📍 Estado del Médico:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-gray-700">
                  <span className="font-semibold">En turno</span> = Médico ACTIVO (conectado, disponible ahora)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-700">
                  <span className="font-semibold">Fuera</span> = Médico INACTIVO (no está en turno, desconectado)
                </span>
              </div>
            </div>
          </div>

          {/* Leyenda de Alertas */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-3">🚨 Nivel de Alerta (Barra Lateral):</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-1 h-4 rounded-full bg-red-500" />
                <span className="text-gray-700">
                  <span className="font-semibold text-red-600">Crítico</span> = Deserción &gt;25% o Pendientes &gt;5
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1 h-4 rounded-full bg-amber-500" />
                <span className="text-gray-700">
                  <span className="font-semibold text-amber-600">Advertencia</span> = Deserción 10-25%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1 h-4 rounded-full bg-emerald-500" />
                <span className="text-gray-700">
                  <span className="font-semibold text-emerald-600">Óptimo</span> = Flujo de trabajo al día
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === EXECUTIVE VIEW: 3 KPIs Principales (Premium Design) === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPI 1: Capacidad Operativa - AZUL */}
        <div className="group relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />

          {/* Card */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-650 to-blue-800 rounded-lg p-6 shadow-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-100 group-hover:text-white transition-colors duration-300">
                  Capacidad Operativa
                </h3>
                <Users className="w-5 h-5 text-blue-100 group-hover:text-white transition-all duration-300 transform group-hover:scale-110" />
              </div>
              <div className="text-5xl font-bold mb-2 text-white group-hover:text-blue-50 transition-colors duration-300">
                {estadisticas.capacidadOperativa}
              </div>
              <p className="text-sm text-blue-100 group-hover:text-white transition-colors duration-300">
                Médicos con carga activa
              </p>
            </div>
          </div>
        </div>

        {/* KPI 2: Alertas de Abandono - ROJO/VERDE */}
        <div className="group relative">
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
            estadisticas.alertasAltas > 0
              ? 'bg-gradient-to-br from-red-500 to-red-600'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          }`} />

          {/* Card */}
          <div className={`relative rounded-lg p-6 shadow-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white overflow-hidden bg-gradient-to-br ${
            estadisticas.alertasAltas > 0
              ? 'from-red-600 via-red-650 to-red-800'
              : 'from-emerald-600 via-emerald-650 to-emerald-800'
          }`}>
            {/* Animated Background Pattern */}
            <div className={`absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500 ${
              estadisticas.alertasAltas > 0 ? 'bg-white' : 'bg-white'
            }`} />
            <div className={`absolute bottom-0 left-0 w-32 h-32 opacity-10 rounded-full -ml-16 -mb-16 ${
              estadisticas.alertasAltas > 0 ? 'bg-white' : 'bg-white'
            }`} />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  Alerta de Abandono
                </h3>
                <AlertTriangle className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:animate-pulse" />
              </div>
              <div className="text-5xl font-bold mb-2 group-hover:text-blue-50 transition-colors duration-300">
                {estadisticas.alertasAltas}
              </div>
              <p className="text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                {estadisticas.alertasAltas > 0
                  ? '⚠️ Médicos críticos'
                  : '✓ Sin alertas'}
              </p>
            </div>
          </div>
        </div>

        {/* KPI 3: Pendientes Totales - ÁMBAR/VERDE */}
        <div className="group relative">
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 ${
            estadisticas.pendientes > 0
              ? 'bg-gradient-to-br from-amber-500 to-amber-600'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          }`} />

          {/* Card */}
          <div className={`relative rounded-lg p-6 shadow-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white overflow-hidden bg-gradient-to-br ${
            estadisticas.pendientes > 0
              ? 'from-amber-600 via-amber-650 to-amber-800'
              : 'from-emerald-600 via-emerald-650 to-emerald-800'
          }`}>
            {/* Animated Background Pattern */}
            <div className={`absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500 ${
              estadisticas.pendientes > 0 ? 'bg-white' : 'bg-white'
            }`} />
            <div className={`absolute bottom-0 left-0 w-32 h-32 opacity-10 rounded-full -ml-16 -mb-16 ${
              estadisticas.pendientes > 0 ? 'bg-white' : 'bg-white'
            }`} />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  Pendientes Totales
                </h3>
                <Clock className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 group-hover:animate-spin" />
              </div>
              <div className="text-5xl font-bold mb-2 group-hover:text-blue-50 transition-colors duration-300">
                {estadisticas.pendientes}
              </div>
              <p className="text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                {estadisticas.pendientes > 0
                  ? '⏳ Por gestionar'
                  : '✓ Resueltos'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar médico por nombre o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* === ACCORDIONS: MÉDICOS CON CARGA ACTIVA === */}
      <div className="space-y-4">
        {/* ACCORDION 1: Médicos con Carga Activa */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Encabezado del Accordion - PREMIUM BLUE */}
          <button
            onClick={() => toggleAcordion('activos')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-650 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 group text-white"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-100 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
              <div className="text-left">
                <h2 className="font-bold text-white text-lg">
                  👨‍⚕️ Médicos con Carga Activa
                </h2>
                <p className="text-sm text-blue-100 group-hover:text-white transition-colors duration-300">
                  {medicosConCarga.length} médicos con atenciones en progreso
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-blue-100 group-hover:text-white transition-all duration-300 transform ${
                acordeones.activos ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Contenido del Accordion - ABIERTO */}
          {acordeones.activos && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Médico
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Pac. Asignados
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Completadas
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Pendientes
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                      % Deserción
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {medicosConCarga.map((medico, idx) => {
                    const nivel = getNivelAlerta(medico);
                    const colores = getColoresAlerta(nivel);
                    const porcentajeDesercion = medico.pacientesAsignados > 0
                      ? ((medico.desertadas / medico.pacientesAsignados) * 100).toFixed(1)
                      : '0';

                    return (
                      <tr
                        key={`activo-${idx}`}
                        className={`bg-white border-l-4 ${colores.barra} ${colores.bg}`}
                      >
                        {/* Médico */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full mt-1 ${colores.dot}`} />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {medico.nombreCompleto}
                              </p>
                              <p className="text-xs text-gray-500">
                                {medico.tipoDocumento} {medico.numeroDocumento}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Estado (Status Dot) */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold">
                            <span className={`w-2 h-2 rounded-full ${
                              medico.estado === 'ACTIVO' ? 'bg-green-600' : 'bg-gray-400'
                            }`} />
                            <span className={medico.estado === 'ACTIVO' ? 'text-green-600' : 'text-gray-600'}>
                              {medico.estado === 'ACTIVO' ? 'En turno' : 'Fuera'}
                            </span>
                          </span>
                        </td>

                        {/* Pacientes Asignados */}
                        <td className="px-6 py-4 text-center">
                          <p className="font-bold text-gray-900 text-lg">
                            {medico.pacientesAsignados}
                          </p>
                        </td>

                        {/* Completadas */}
                        <td className="px-6 py-4 text-center">
                          <p className="font-bold text-emerald-600 text-lg">
                            {medico.completadas}
                          </p>
                        </td>

                        {/* Pendientes */}
                        <td className="px-6 py-4 text-center">
                          <p className={`font-bold text-lg ${
                            medico.pendientes > 3 ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {medico.pendientes}
                          </p>
                          {medico.pendientes > 0 && (
                            <p className="text-xs text-gray-500">
                              ⏳ por atender
                            </p>
                          )}
                        </td>

                        {/* % Deserción */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <p className={`font-bold text-lg ${colores.text}`}>
                              {porcentajeDesercion}%
                            </p>
                            {nivel === 'critico' && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            {nivel === 'advertencia' && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </td>

                        {/* Acción */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => abrirDetalles(medico)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ACCORDION 2: Médicos Disponibles / Sin Carga */}
        {medicosSinCarga.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Encabezado del Accordion - PREMIUM EMERALD */}
            <button
              onClick={() => toggleAcordion('disponibles')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-emerald-650 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 group text-white"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-emerald-100 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                <div className="text-left">
                  <h2 className="font-bold text-white text-lg">
                    ⏳ Médicos Disponibles / Sin Carga
                  </h2>
                  <p className="text-sm text-emerald-100 group-hover:text-white transition-colors duration-300">
                    {medicosSinCarga.length} médicos listos para asignar
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-emerald-100 group-hover:text-white transition-all duration-300 transform ${
                  acordeones.disponibles ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Contenido del Accordion - CERRADO POR DEFECTO */}
            {acordeones.disponibles && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Médico
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Pac. Asignados
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Completadas
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Pendientes
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        % Deserción
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {medicosSinCarga.map((medico, idx) => {
                      const nivel = getNivelAlerta(medico);
                      const colores = getColoresAlerta(nivel);
                      const porcentajeDesercion = medico.pacientesAsignados > 0
                        ? ((medico.desertadas / medico.pacientesAsignados) * 100).toFixed(1)
                        : '0';

                      return (
                        <tr
                          key={`sin-carga-${idx}`}
                          className={`bg-white border-l-4 ${colores.barra} ${colores.bg} opacity-75`}
                        >
                          {/* Médico */}
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full mt-1 ${colores.dot}`} />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {medico.nombreCompleto}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {medico.tipoDocumento} {medico.numeroDocumento}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold">
                              <span className={`w-2 h-2 rounded-full ${
                                medico.estado === 'ACTIVO' ? 'bg-green-600' : 'bg-gray-400'
                              }`} />
                              <span className={medico.estado === 'ACTIVO' ? 'text-green-600' : 'text-gray-600'}>
                                {medico.estado === 'ACTIVO' ? 'Disponible' : 'Fuera'}
                              </span>
                            </span>
                          </td>

                          {/* Pacientes Asignados */}
                          <td className="px-6 py-4 text-center">
                            <p className="font-bold text-gray-900 text-lg">
                              {medico.pacientesAsignados}
                            </p>
                          </td>

                          {/* Completadas */}
                          <td className="px-6 py-4 text-center">
                            <p className="font-bold text-emerald-600 text-lg">
                              {medico.completadas}
                            </p>
                          </td>

                          {/* Pendientes */}
                          <td className="px-6 py-4 text-center">
                            <p className="font-bold text-gray-600 text-lg">
                              {medico.pendientes}
                            </p>
                          </td>

                          {/* % Deserción */}
                          <td className="px-6 py-4 text-center">
                            <p className={`font-bold text-lg ${colores.text}`}>
                              {porcentajeDesercion}%
                            </p>
                          </td>

                          {/* Acción */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => abrirDetalles(medico)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showModal && medicoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white flex items-center justify-between sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">{medicoSeleccionado.nombreCompleto}</h2>
                <p className="text-blue-100 text-sm">@{medicoSeleccionado.username}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/20 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6">
              {/* Resumen */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Resumen de Atenciones
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-white border border-gray-200">
                    <p className="text-gray-600 text-sm">Pacientes Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {medicoSeleccionado.pacientesAsignados}
                    </p>
                  </div>

                  {/* ✅ v1.65.4: Completadas - Clickeable */}
                  <button
                    onClick={() => {
                      setFiltroEstadoPacientes('ATENDIDO');
                      setShowPacientesList(true);
                    }}
                    disabled={medicoSeleccionado.completadas === 0}
                    className="text-center p-3 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="text-gray-600 text-sm">Completadas</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {medicoSeleccionado.completadas}
                    </p>
                  </button>

                  {/* ✅ v1.65.4: Pendientes - Clickeable */}
                  <button
                    onClick={() => {
                      setFiltroEstadoPacientes('PENDIENTE');
                      setShowPacientesList(true);
                    }}
                    disabled={medicoSeleccionado.pendientes === 0}
                    className="text-center p-3 rounded-lg bg-white border border-amber-200 hover:bg-amber-50 hover:border-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="text-gray-600 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {medicoSeleccionado.pendientes}
                    </p>
                  </button>

                  {/* ✅ v1.65.4: Desertadas - Clickeable */}
                  <button
                    onClick={() => {
                      setFiltroEstadoPacientes('DESERCION');
                      setShowPacientesList(true);
                    }}
                    disabled={medicoSeleccionado.desertadas === 0}
                    className="text-center p-3 rounded-lg bg-white border border-red-200 hover:bg-red-50 hover:border-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="text-gray-600 text-sm">Desertadas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {medicoSeleccionado.desertadas}
                    </p>
                  </button>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cerrar
                </button>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reasignar
                </button>
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Llamar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ v1.65.4: Modal de Lista de Pacientes por Estado */}
      {showPacientesList && medicoSeleccionado && filtroEstadoPacientes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white flex items-center justify-between sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">
                  {filtroEstadoPacientes === 'ATENDIDO' && '✅ Atenciones Completadas'}
                  {filtroEstadoPacientes === 'PENDIENTE' && '🕐 Atenciones Pendientes'}
                  {filtroEstadoPacientes === 'DESERCION' && '❌ Atenciones Desertadas'}
                </h2>
                <p className="text-blue-100 text-sm">Dr. {medicoSeleccionado.nombreCompleto}</p>
              </div>
              <button
                onClick={() => setShowPacientesList(false)}
                className="p-1 hover:bg-white/20 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {medicoSeleccionado.atenciones && medicoSeleccionado.atenciones.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">ID Solicitud</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Paciente</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Hora</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                        {filtroEstadoPacientes === 'ATENDIDO' && (
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Duración</th>
                        )}
                        {filtroEstadoPacientes === 'PENDIENTE' && (
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Tiempo Espera</th>
                        )}
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Urgente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicoSeleccionado.atenciones
                        .filter(atencion => atencion.estado === filtroEstadoPacientes)
                        .map((atencion, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-gray-900 font-semibold">
                              #{atencion.idSolicitud}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {atencion.paciente}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              <Clock className="w-4 h-4 inline mr-2 text-blue-500" />
                              {atencion.hora || '-'}
                            </td>
                            <td className="px-4 py-3">
                              {atencion.estado === 'ATENDIDO' && (
                                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                                  ✅ Completada
                                </span>
                              )}
                              {atencion.estado === 'PENDIENTE' && (
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                  🕐 Pendiente
                                </span>
                              )}
                              {atencion.estado === 'DESERCION' && (
                                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                  ❌ Desertada
                                </span>
                              )}
                            </td>
                            {filtroEstadoPacientes === 'ATENDIDO' && (
                              <td className="px-4 py-3 text-gray-600">
                                {atencion.duracion || '-'}
                              </td>
                            )}
                            {filtroEstadoPacientes === 'PENDIENTE' && (
                              <td className="px-4 py-3">
                                {atencion.urgente ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                                    <AlertTriangle className="w-4 h-4" />
                                    {atencion.tiempoEspera || '> 45 min'}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">{atencion.tiempoEspera || '< 45 min'}</span>
                                )}
                              </td>
                            )}
                            <td className="px-4 py-3">
                              {atencion.urgente ? (
                                <span className="inline-block w-3 h-3 bg-red-500 rounded-full" title="Urgente"></span>
                              ) : (
                                <span className="inline-block w-3 h-3 bg-gray-300 rounded-full" title="No urgente"></span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500 text-lg">
                    {filtroEstadoPacientes === 'ATENDIDO' && 'No hay atenciones completadas'}
                    {filtroEstadoPacientes === 'PENDIENTE' && 'No hay atenciones pendientes'}
                    {filtroEstadoPacientes === 'DESERCION' && 'No hay atenciones desertadas'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowPacientesList(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

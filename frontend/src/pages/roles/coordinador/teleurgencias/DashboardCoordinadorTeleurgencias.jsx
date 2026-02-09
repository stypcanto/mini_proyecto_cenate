/**
 * 🚑 DashboardCoordinadorTeleurgencias.jsx
 *
 * Dashboard de coordinación para supervisar médicos en Teleurgencias
 * - KPIs principales
 * - Tabla de médicos con atenciones
 * - Modal con detalles de cada médico
 * - Filtros y búsqueda
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
  MoreVertical,
  X,
  Eye,
  RefreshCw,
  TrendingDown,
  Loader,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import apiClient from '../../../../services/apiClient';
import toast from 'react-hot-toast';

export default function DashboardCoordinadorTeleurgencias() {
  const { user } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [filtrado, setFiltrado] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODO');
  const [ordenar, setOrdenar] = useState('DESERCION');
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cargando, setCargando] = useState(true);

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

  // Aplicar filtros
  useEffect(() => {
    let resultado = medicos;

    // Filtrar por búsqueda
    if (busqueda) {
      resultado = resultado.filter(m =>
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.username.includes(busqueda)
      );
    }

    // Filtrar por estado
    if (filtroEstado !== 'TODO') {
      resultado = resultado.filter(m => m.estado === filtroEstado);
    }

    // Ordenar: Primero médicos con atenciones y casos pendientes
    resultado.sort((a, b) => {
      // Calcular si tienen atenciones y casos pendientes
      const aConAtenciones = (a.completadas + a.pendientes) > 0;
      const bConAtenciones = (b.completadas + b.pendientes) > 0;

      // Prioridad 1: Médicos con atenciones van primero
      if (aConAtenciones && !bConAtenciones) return -1;
      if (!aConAtenciones && bConAtenciones) return 1;

      // Si ambos tienen o ambos no tienen atenciones, aplicar ordenamiento secundario
      if (ordenar === 'DESERCION') {
        const porcentajeA = a.pacientesAsignados > 0 ? (a.desertadas / a.pacientesAsignados) * 100 : 0;
        const porcentajeB = b.pacientesAsignados > 0 ? (b.desertadas / b.pacientesAsignados) * 100 : 0;
        return porcentajeB - porcentajeA;
      } else if (ordenar === 'PENDIENTES') {
        return b.pendientes - a.pendientes;
      } else if (ordenar === 'COMPLETADAS') {
        return b.completadas - a.completadas;
      }

      return 0;
    });

    setFiltrado(resultado);
  }, [busqueda, filtroEstado, ordenar, medicos]);

  // Calcular KPIs
  const calcularKPIs = () => {
    const totales = {
      medicosActivos: medicos.filter(m => m.estado === 'ACTIVO').length,
      pacientesTotal: medicos.reduce((sum, m) => sum + (m.pacientesAsignados || 0), 0),
      pendientesTotal: medicos.reduce((sum, m) => sum + (m.pendientes || 0), 0),
      completadasTotal: medicos.reduce((sum, m) => sum + (m.completadas || 0), 0),
      desertadasTotal: medicos.reduce((sum, m) => sum + (m.desertadas || 0), 0),
    };
    const totalAtenciones = totales.completadasTotal + totales.desertadasTotal;
    const tasaDesercion = totalAtenciones > 0 ?
      (totales.desertadasTotal / totalAtenciones * 100).toFixed(1) : '0';
    return { ...totales, tasaDesercion };
  };

  const kpis = calcularKPIs();
  const calcularPorcentajeDesercion = (medico) => {
    if (!medico || !medico.porcentajeDesercion) return '0';
    return medico.porcentajeDesercion.toFixed(1);
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
          <p className="text-gray-600 text-lg">Cargando datos de coordinación...</p>
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
            Panel de Coordinación - Teleurgencias
          </h1>
          <p className="text-gray-600">Supervisión en tiempo real de tu equipo médico</p>
        </div>
        <button
          onClick={cargarMedicos}
          className="p-2 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-sm"
          title="Recargar datos"
        >
          <RefreshCw className="w-5 h-5" />
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* KPI 1: Médicos Activos */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Médicos Activos</p>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.medicosActivos}</p>
          <p className="text-xs text-gray-500 mt-1">del equipo</p>
        </div>

        {/* KPI 2: Pacientes Asignados */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pacientes Hoy</p>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.pacientesTotal}</p>
          <p className="text-xs text-gray-500 mt-1">asignados</p>
        </div>

        {/* KPI 3: Completadas */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completadas</p>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.completadasTotal}</p>
          <p className="text-xs text-gray-500 mt-1">✓ Realizadas</p>
        </div>

        {/* KPI 4: Pendientes */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pendientes</p>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.pendientesTotal}</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">⚠️ Requieren atención</p>
        </div>

        {/* KPI 5: Tasa de Deserción */}
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Deserción</p>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.tasaDesercion}%</p>
          <p className="text-xs text-gray-500 mt-1">promedio</p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="TODO">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>

          {/* Ordenar */}
          <select
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="DESERCION">Ordenar: Mayor Deserción</option>
            <option value="PENDIENTES">Ordenar: Más Pendientes</option>
            <option value="COMPLETADAS">Ordenar: Menos Completadas</option>
          </select>
        </div>
      </div>

      {/* Tabla de Médicos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Médico</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Pac. Asignados</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">✓ Completadas</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">⏳ Pendientes</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">❌ Deserciones</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">% Deserción</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {/* Sección: Médicos con atenciones y casos pendientes */}
              {(() => {
                const medicosActivos = filtrado.filter(m => (m.completadas + m.pendientes) > 0);
                const medicosSinAtenciones = filtrado.filter(m => (m.completadas + m.pendientes) === 0);

                return (
                  <>
                    {medicosActivos.length > 0 && (
                      <>
                        <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                          <td colSpan="8" className="px-6 py-3 text-sm font-bold text-blue-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            👨‍⚕️ MÉDICOS ACTIVOS ({medicosActivos.length}) - Con Atenciones y Casos Pendientes
                          </td>
                        </tr>
                        {medicosActivos.map((medico, idx) => {
                          const porcentajeDesercion = calcularPorcentajeDesercion(medico);
                          const alertaAlta = parseFloat(porcentajeDesercion) > 5;

                          return (
                            <tr
                              key={`activo-${idx}`}
                              className={`border-b border-gray-200 hover:bg-blue-50 transition ${
                                alertaAlta ? 'bg-red-50' : ''
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">{medico.nombreCompleto}</p>
                                  <p className="text-sm text-gray-500">
                                    {medico.tipoDocumento} {medico.numeroDocumento}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                                  {medico.pacientesAsignados}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                                  {medico.completadas}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                                    medico.pendientes > 3
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {medico.pendientes}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full font-semibold text-sm">
                                  {medico.desertadas}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`font-bold text-sm ${
                                    alertaAlta ? 'text-red-700' : 'text-gray-600'
                                  }`}
                                >
                                  {porcentajeDesercion}%
                                  {alertaAlta && (
                                    <AlertCircle className="inline w-4 h-4 ml-1 text-red-700" />
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                    medico.estado === 'ACTIVO'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {medico.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => abrirDetalles(medico)}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition"
                                >
                                  <Eye className="w-4 h-4" />
                                  Detalles
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}

                    {/* Sección: Médicos sin atenciones aún */}
                    {medicosSinAtenciones.length > 0 && (
                      <>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <td colSpan="8" className="px-6 py-3 text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-600" />
                            ⏳ MÉDICOS SIN ATENCIONES ({medicosSinAtenciones.length}) - Por Asignar Casos
                          </td>
                        </tr>
                        {medicosSinAtenciones.map((medico, idx) => {
                          const porcentajeDesercion = calcularPorcentajeDesercion(medico);
                          const alertaAlta = parseFloat(porcentajeDesercion) > 5;

                          return (
                            <tr
                              key={`sin-atencion-${idx}`}
                              className={`border-b border-gray-200 hover:bg-gray-50 transition opacity-75 ${
                                alertaAlta ? 'bg-red-50' : ''
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-900">{medico.nombreCompleto}</p>
                                  <p className="text-sm text-gray-500">
                                    {medico.tipoDocumento} {medico.numeroDocumento}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                                  {medico.pacientesAsignados}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                                  {medico.completadas}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                                    medico.pendientes > 3
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {medico.pendientes}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full font-semibold text-sm">
                                  {medico.desertadas}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`font-bold text-sm ${
                                    alertaAlta ? 'text-red-700' : 'text-gray-600'
                                  }`}
                                >
                                  {porcentajeDesercion}%
                                  {alertaAlta && (
                                    <AlertCircle className="inline w-4 h-4 ml-1 text-red-700" />
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                    medico.estado === 'ACTIVO'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {medico.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => abrirDetalles(medico)}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition"
                                >
                                  <Eye className="w-4 h-4" />
                                  Detalles
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showModal && medicoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white flex items-center justify-between sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">{medicoSeleccionado.nombre}</h2>
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
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Pacientes Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {medicoSeleccionado.pacientesAsignados}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Completadas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {medicoSeleccionado.completadas}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {medicoSeleccionado.pendientes}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Desertadas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {medicoSeleccionado.desertadas}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalle de Atenciones */}
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Detalle de Atenciones
              </h3>
              <div className="space-y-3">
                {medicoSeleccionado.atenciones.map((atencion, idx) => {
                  let bgColor = 'bg-gray-50';
                  let icono = null;
                  let estadoColor = 'text-gray-700';

                  if (atencion.estado === 'ATENDIDO') {
                    bgColor = 'bg-green-50 border-l-4 border-green-500';
                    estadoColor = 'text-green-700';
                    icono = <CheckCircle2 className="w-5 h-5 text-green-500" />;
                  } else if (atencion.estado === 'PENDIENTE') {
                    bgColor = atencion.urgente ? 'bg-red-50 border-l-4 border-red-500' : 'bg-amber-50 border-l-4 border-amber-500';
                    estadoColor = atencion.urgente ? 'text-red-700' : 'text-amber-700';
                    icono = <Clock className={`w-5 h-5 ${atencion.urgente ? 'text-red-500' : 'text-amber-500'}`} />;
                  } else if (atencion.estado === 'DESERCION') {
                    bgColor = 'bg-red-50 border-l-4 border-red-500';
                    estadoColor = 'text-red-700';
                    icono = <AlertCircle className="w-5 h-5 text-red-500" />;
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border border-gray-200 ${bgColor}`}
                    >
                      <div className="flex items-start gap-4">
                        {icono}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-gray-900">{atencion.paciente}</p>
                            <span className={`text-xs font-bold ${estadoColor}`}>
                              {atencion.estado}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Hora: {atencion.hora}</p>
                          {atencion.estado === 'ATENDIDO' && (
                            <p className="text-xs text-gray-500 mt-1">
                              ✓ Duración: {atencion.duracion}
                            </p>
                          )}
                          {atencion.estado === 'PENDIENTE' && (
                            <p className={`text-xs mt-1 ${atencion.urgente ? 'text-red-600 font-bold' : 'text-amber-600'}`}>
                              {atencion.urgente && '🔴 URGENTE - '}
                              Esperando desde {atencion.tiempoEspera}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                  Reasignar Pacientes
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
    </div>
  );
}

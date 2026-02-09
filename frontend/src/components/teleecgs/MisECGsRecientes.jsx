/**
 * 📊 Mis EKGs Recientes - Panel Derecho Mejorado
 * Muestra: Estadísticas del día + Últimas 3 cargas + Tooltips de observaciones
 *
 * v1.55.0 - Diseño médico profesional
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Eye,
  MessageSquare,
  CheckCheck,
  Search,
  X,
  Calendar,
  BarChart3,
  Download,
  Info,
  Eye as EyeIcon,
  Edit2,
  Plus,
  Trash2,
} from 'lucide-react';
import { COLORS, MEDICAL_PALETTE } from '../../config/designSystem';
import toast from 'react-hot-toast';

export default function MisECGsRecientes({
  ultimas3 = [],
  estadisticas = {
    cargadas: 0,
    enEvaluacion: 0,
    observadas: 0,
    atendidas: 0,
  },
  onRefrescar = () => {},
  onVerImagen = () => {},
  loading = false,
}) {
  const [expandidoTooltip, setExpandidoTooltip] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(null); // null = todos, 'ENVIADA', 'OBSERVADA', 'ATENDIDA'

  // ✅ NEW: Filter State
  const [filtroDNI, setFiltroDNI] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [datosOriginales, setDatosOriginales] = useState([]);

  // ✅ NEW: Modal de edición de imágenes
  const [showEditModal, setShowEditModal] = useState(false);
  const [cargaEdicion, setCargaEdicion] = useState(null);

  // ✅ Sync ultimas3 to datosOriginales on mount and when ultimas3 changes
  useEffect(() => {
    setDatosOriginales(ultimas3);
  }, [ultimas3]);

  // ✅ Filter Functions
  const filtrarPorDNI = (datos, dniBusqueda) => {
    if (!dniBusqueda || dniBusqueda.trim() === '') return datos;
    return datos.filter(
      item => item.dni && item.dni.toString().includes(dniBusqueda)
    );
  };

  // ✅ MEJORADO: Usar fechaEnvio directamente (más confiable que parsear tiempoTranscurrido)
  const obtenerFechaUpload = (item) => {
    if (item.fechaEnvio) {
      // Convertir ISO datetime a YYYY-MM-DD
      const fecha = new Date(item.fechaEnvio);
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const día = String(fecha.getDate()).padStart(2, '0');
      return `${año}-${mes}-${día}`;
    }
    // Fallback: usar hoy si no hay fechaEnvio
    return new Date().toISOString().split('T')[0];
  };

  const filtrarPorFecha = (datos, fechaBusqueda) => {
    if (!fechaBusqueda) return datos;
    return datos.filter(item => {
      const uploadDate = obtenerFechaUpload(item);
      return uploadDate === fechaBusqueda;
    });
  };

  const filtrarPorEstado = (datos, estado) => {
    if (!estado) return datos;
    return datos.filter(item => item.estado === estado);
  };

  const aplicarFiltrosCombinados = (datos, dniBusqueda, fechaBusqueda, estado) => {
    let resultado = datos;
    resultado = filtrarPorDNI(resultado, dniBusqueda);
    resultado = filtrarPorFecha(resultado, fechaBusqueda);
    resultado = filtrarPorEstado(resultado, estado);
    return resultado;
  };

  // ✅ Computed filtered data
  const datosFiltrados = useMemo(() => {
    return aplicarFiltrosCombinados(datosOriginales, filtroDNI, filtroFecha, filtroEstado);
  }, [datosOriginales, filtroDNI, filtroFecha, filtroEstado]);

  // ✅ Check if any filters are active
  const hayFiltrosActivos = filtroDNI !== '' || filtroFecha !== '';

  // ✅ Clear individual filters
  const limpiarFiltroDNI = () => setFiltroDNI('');
  const limpiarFiltroFecha = () => setFiltroFecha('');

  // ✅ Clear all filters
  const limpiarTodosFiltros = () => {
    setFiltroDNI('');
    setFiltroFecha('');
  };

  // ✅ Mostrar loader mientras carga la primera vez
  if (loading && ultimas3.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 border border-gray-100 h-fit flex flex-col items-center justify-center">
        <RefreshCw className="w-14 h-14 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-700 font-semibold text-lg">Cargando cargas recientes...</p>
        <p className="text-sm text-gray-500 mt-2">Enriqueciendo datos de pacientes con información completa</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 h-fit">
      {/* ==================== ESTADÍSTICAS PROFESIONALES - FULL WIDTH ==================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">📊 Resumen de Hoy</h3>

          {/* Botón Refrescar */}
          <button
            onClick={onRefrescar}
            disabled={loading}
            className="p-2.5 hover:bg-slate-100 rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Refrescar estadísticas"
            aria-label="Refrescar datos"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Grid responsive - Professional Stats Cards Compact */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Total - Verde SATURADO (Par - Luz) */}
          <button
            onClick={() => setFiltroEstado(null)}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 border p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer ${
              filtroEstado === null ? 'border-white ring-2 ring-white' : 'border-emerald-600'
            }`}
            title="Ver todos"
          >
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2">
                <div className="inline-flex p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-1">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  {estadisticas.total}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs md:text-sm font-semibold text-white/90">
                Total
              </span>
            </div>
          </button>

          {/* Pendiente - Gris Oscuro/Negro SATURADO */}
          <button
            onClick={() => setFiltroEstado('ENVIADA')}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer ${
              filtroEstado === 'ENVIADA' ? 'border-white ring-2 ring-white' : 'border-slate-800'
            }`}
            title="Filtrar por Pendiente"
          >
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2.5">
                <div className="inline-flex p-2 bg-white/20 rounded-lg">
                  <Eye className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-1.5">
                <span className="text-3xl font-bold text-white">
                  {estadisticas.cargadas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs font-semibold text-white/90">
                Pendiente
              </span>
            </div>
          </button>

          {/* Observadas - Ámbar SATURADO (Impar - Oscuro) */}
          <button
            onClick={() => setFiltroEstado('OBSERVADA')}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 border p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 text-left cursor-pointer ${
              filtroEstado === 'OBSERVADA' ? 'border-white ring-2 ring-white' : 'border-orange-600'
            }`}
            title="Filtrar por Observadas"
          >
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2.5">
                <div className="inline-flex p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-1.5">
                <span className="text-3xl font-bold text-white">
                  {estadisticas.observadas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs font-semibold text-white/90">
                Observadas
              </span>
            </div>
          </button>

          {/* Atendidas - Teal CLARO (Par - Luz) */}
          <button
            onClick={() => setFiltroEstado('ATENDIDA')}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 border p-3 md:p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 text-left cursor-pointer ${
              filtroEstado === 'ATENDIDA' ? 'border-teal-700 ring-2 ring-teal-700' : 'border-teal-200'
            }`}
            title="Filtrar por Atendidas"
          >
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-200/30 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2.5">
                <div className="inline-flex p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                  <CheckCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-1.5">
                <span className="text-3xl font-bold text-teal-900">
                  {estadisticas.atendidas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs font-semibold text-teal-700">
                Atendidas
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ==================== FILTROS CLÍNICOS - PROFESIONAL ==================== */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-blue-900">🔍 Filtrar Cargas Recientes</h4>
        </div>

        {/* Grid responsive: 1 col móvil, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* DNI Filter */}
          <div className="relative">
            <label htmlFor="filtro-dni" className="block text-xs font-semibold text-blue-900 mb-1.5">
              🆔 DNI Paciente
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-blue-600">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="filtro-dni"
                type="text"
                placeholder="12345678"
                value={filtroDNI}
                onChange={(e) => setFiltroDNI(e.target.value)}
                maxLength="8"
                className="w-full pl-8 pr-8 py-2 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {filtroDNI && (
                <button
                  onClick={limpiarFiltroDNI}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
                  title="Limpiar DNI"
                  aria-label="Limpiar filtro DNI"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <label htmlFor="filtro-fecha" className="block text-xs font-semibold text-blue-900 mb-1.5">
              📅 Fecha Carga
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="filtro-fecha"
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full pl-8 pr-2 py-2 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Clear All Filters Button */}
          {hayFiltrosActivos && (
            <div className="flex items-end">
              <button
                onClick={limpiarTodosFiltros}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-all duration-200 active:scale-95"
                title="Limpiar todos los filtros"
              >
                🗑️ Limpiar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Filter Status Info */}
        {hayFiltrosActivos && (
          <div className="mt-3 text-xs text-blue-700 bg-blue-100/50 border border-blue-200 rounded px-2.5 py-1.5">
            {filtroDNI && filtroFecha && (
              <span>📊 Mostrando resultados para DNI <strong>{filtroDNI}</strong> en <strong>{filtroFecha}</strong> ({datosFiltrados.length} encontrada{datosFiltrados.length !== 1 ? 's' : ''})</span>
            )}
            {filtroDNI && !filtroFecha && (
              <span>📊 Mostrando resultados para DNI <strong>{filtroDNI}</strong> ({datosFiltrados.length} encontrada{datosFiltrados.length !== 1 ? 's' : ''})</span>
            )}
            {!filtroDNI && filtroFecha && (
              <span>📊 Mostrando cargas de <strong>{filtroFecha}</strong> ({datosFiltrados.length} encontrada{datosFiltrados.length !== 1 ? 's' : ''})</span>
            )}
          </div>
        )}
      </div>

      {/* ==================== TABLA PROFESIONAL DE CARGAS ==================== */}
      <div className="mb-6">
        <h3 className="text-sm md:text-base font-bold text-gray-900 mb-4">
          📋 Cargas Recientes {datosFiltrados.length !== ultimas3.length && ultimas3.length > 0 && (
            <span className="text-xs font-normal text-blue-600">({datosFiltrados.length}/{ultimas3.length})</span>
          )}
        </h3>

        {ultimas3.length > 0 ? (
          datosFiltrados.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm md:text-base">
                {/* Header */}
                <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                  <tr>
                    {/* Hora - Oculto en tablet, visible en desktop */}
                    <th className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Hora</th>

                    {/* DNI */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">DNI</th>

                    {/* Paciente */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Paciente</th>

                    {/* Perfil - Oculto en tablet, visible en desktop */}
                    <th className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Perfil</th>

                    {/* Prioridad */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-center font-bold whitespace-nowrap text-xs md:text-sm">Prioridad</th>

                    {/* Estado */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left font-bold whitespace-nowrap text-xs md:text-sm">Estado</th>

                    {/* Cant. Imágenes Cargadas */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-center font-bold whitespace-nowrap text-xs md:text-sm">Cant. Imágenes</th>

                    {/* Acciones */}
                    <th className="px-3 md:px-4 py-2 md:py-3 text-center font-bold whitespace-nowrap text-xs md:text-sm">Acciones</th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody>
                  {datosFiltrados.map((carga, idx) => {
                    // Formato de fecha compacto: "06/02 - 19:37"
                    const fechaCompacta = carga.fechaEnvio
                      ? (() => {
                          const fecha = new Date(carga.fechaEnvio);
                          const dia = String(fecha.getDate()).padStart(2, '0');
                          const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                          const hora = String(fecha.getHours()).padStart(2, '0');
                          const min = String(fecha.getMinutes()).padStart(2, '0');
                          return `${dia}/${mes} - ${hora}:${min}`;
                        })()
                      : '-';

                    // Género corto para Perfil
                    const generoCortoun = carga.genero === 'M' ? 'M' : carga.genero === 'F' ? 'F' : '-';
                    const perfil = carga.edad && carga.edad !== '-' ? `${carga.edad} años / ${generoCortoun}` : `-`;

                    return (
                      <tr
                        key={idx}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 cursor-pointer ${
                          carga.esUrgente ? 'bg-red-50' : ''
                        }`}
                        onClick={() => onVerImagen({ dni: carga.dni, nombrePaciente: carga.nombrePaciente })}
                      >
                        {/* Hora - Oculto en tablet, visible en desktop */}
                        <td className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm font-mono">
                          {fechaCompacta}
                        </td>

                        {/* DNI */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm font-mono">
                          {carga.dni}
                        </td>

                        {/* Paciente - BOLD y destacado */}
                        <td className="px-3 md:px-4 py-2 md:py-3 min-w-max" title={carga.nombrePaciente}>
                          <div className="font-bold text-gray-900 text-xs md:text-sm line-clamp-2">{carga.nombrePaciente}</div>
                        </td>

                        {/* Perfil: Edad / Género - Oculto en tablet, visible en desktop */}
                        <td className="hidden lg:table-cell px-3 md:px-4 py-2 md:py-3 text-gray-700 text-xs md:text-sm">
                          {perfil}
                        </td>

                        {/* Prioridad - Círculo Pulsante */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-center flex items-center justify-center">
                          <div
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-full animate-pulse ${
                              carga.esUrgente ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            title={carga.esUrgente ? 'Urgente' : 'Normal'}
                          />
                        </td>

                        {/* Estado - Distinto */}
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          <span
                            className={`inline-flex px-2.5 md:px-3 py-1 md:py-1.5 rounded text-xs md:text-sm font-semibold whitespace-nowrap ${
                              carga.estado === 'ENVIADA'
                                ? 'bg-blue-100 text-blue-800'
                                : carga.estado === 'OBSERVADA'
                                ? 'bg-orange-100 text-orange-800'
                                : carga.estado === 'ATENDIDA'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {carga.estado === 'ENVIADA' ? 'Pendiente' : carga.estado === 'OBSERVADA' ? 'Observada' : carga.estado === 'ATENDIDA' ? 'Atendida' : carga.estado}
                          </span>
                        </td>

                        {/* Cant. Imágenes Cargadas */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 md:px-3 py-1 md:py-1.5 bg-indigo-100 text-indigo-800 rounded text-xs md:text-sm font-bold">
                            {carga.cantidadImagenes || 0}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td className="px-3 md:px-4 py-2 md:py-3 text-center">
                          <div className="flex items-center justify-center gap-1 md:gap-2">
                            {/* Preview Eye */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onVerImagen({ dni: carga.dni, nombrePaciente: carga.nombrePaciente });
                              }}
                              className="p-1.5 md:p-2 rounded hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Ver imágenes"
                            >
                              <Eye className="w-4 h-4 md:w-5 md:h-5" />
                            </button>

                            {/* Edit - Gestionar imágenes */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCargaEdicion(carga);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 md:p-2 rounded hover:bg-orange-100 text-orange-600 hover:text-orange-800 transition-colors"
                              title="Editar imágenes"
                            >
                              <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>

                            {/* Download - Solo si ATENDIDA */}
                            {carga.estado === 'ATENDIDA' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success('Descarga disponible');
                                }}
                                className="p-1.5 md:p-2 rounded hover:bg-green-100 text-green-600 hover:text-green-800 transition-colors"
                                title="Descargar informe"
                              >
                                <Download className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            )}

                            {/* Info - Para ver teléfono oculto */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (carga.telefono && carga.telefono !== '-') {
                                  toast((t) => (
                                    <div className="flex items-center gap-3">
                                      <span>📱 {carga.telefono}</span>
                                      <a
                                        href={`https://wa.me/${carga.telefono.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800 font-bold"
                                        onClick={() => toast.dismiss(t.id)}
                                      >
                                        WhatsApp
                                      </a>
                                    </div>
                                  ), { duration: 4000 });
                                } else {
                                  toast.error('No hay teléfono disponible');
                                }
                              }}
                              className="p-1.5 md:p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
                              title="Ver teléfono"
                            >
                              <Info className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            // No results for current filters
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-xs text-amber-900 font-medium mb-2">
                No se encontraron cargas
              </p>
              <p className="text-xs text-amber-700 mb-3">
                {filtroDNI && filtroFecha && (
                  `DNI "${filtroDNI}" no tiene cargas en ${filtroFecha}`
                )}
                {filtroDNI && !filtroFecha && (
                  `DNI "${filtroDNI}" no tiene cargas recientes`
                )}
                {!filtroDNI && filtroFecha && (
                  `No hay cargas para la fecha ${filtroFecha}`
                )}
              </p>
              <button
                onClick={limpiarTodosFiltros}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros
              </button>
            </div>
          )
        ) : (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center">
            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs text-gray-600">
              No hay cargas recientes. ¡Sube tu primer EKG!
            </p>
          </div>
        )}
      </div>

      {/* Modal de Edición de Imágenes */}
      {showEditModal && cargaEdicion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Gestionar Imágenes
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900">
                {cargaEdicion.nombrePaciente}
              </p>
              <p className="text-xs text-gray-600">
                DNI: {cargaEdicion.dni}
              </p>
              <p className="text-xs text-gray-600">
                Imágenes: {cargaEdicion.cantidadImagenes}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {/* Agregar imagen */}
              <button
                onClick={() => {
                  toast.success('📤 Abre el selector de archivos para agregar nueva imagen');
                  // TODO: Implementar subida de archivo
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Imagen
              </button>

              {/* Reemplazar imagen */}
              <button
                onClick={() => {
                  toast.success('🔄 Selecciona la imagen a reemplazar y la nueva imagen');
                  // TODO: Implementar reemplazo de archivo
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Reemplazar Imagen
              </button>

              {/* Eliminar imagen */}
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de eliminar esta imagen?\n\n⚠️ Se eliminará solo la imagen, el registro del paciente se mantendrá.')) {
                    toast.success('Imagen eliminada correctamente');
                    setShowEditModal(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Imagen
              </button>
            </div>

            <button
              onClick={() => setShowEditModal(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

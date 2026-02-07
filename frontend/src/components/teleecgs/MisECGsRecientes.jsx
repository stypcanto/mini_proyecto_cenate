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

  // ✅ NEW: Filter State
  const [filtroDNI, setFiltroDNI] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [datosOriginales, setDatosOriginales] = useState([]);

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

  const parsearTiempoTranscurrido = (tiempoTranscurrido) => {
    // Parse "hace X horas" or "hace X minutos" to determine if it matches selected date
    // For MVP: we check if upload is "today" by looking at time string
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Simple heuristic: if time says "hace X horas" or "hace X minutos", it's today
    if (tiempoTranscurrido && (tiempoTranscurrido.includes('hace') || tiempoTranscurrido.includes('minuto') || tiempoTranscurrido.includes('hora'))) {
      return hoy;
    }

    // If it has a date format, extract it
    const dateMatch = tiempoTranscurrido?.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return dateMatch[1];
    }

    return hoy; // Default to today
  };

  const filtrarPorFecha = (datos, fechaBusqueda) => {
    if (!fechaBusqueda) return datos;
    return datos.filter(item => {
      const uploadDate = parsearTiempoTranscurrido(item.tiempoTranscurrido);
      return uploadDate === fechaBusqueda;
    });
  };

  const aplicarFiltrosCombinados = (datos, dniBusqueda, fechaBusqueda) => {
    let resultado = datos;
    resultado = filtrarPorDNI(resultado, dniBusqueda);
    resultado = filtrarPorFecha(resultado, fechaBusqueda);
    return resultado;
  };

  // ✅ Computed filtered data
  const datosFiltrados = useMemo(() => {
    return aplicarFiltrosCombinados(datosOriginales, filtroDNI, filtroFecha);
  }, [datosOriginales, filtroDNI, filtroFecha]);

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Cargadas - Verde SATURADO (Impar - Oscuro) */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-600 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2.5">
                <div className="inline-flex p-2 bg-white/20 rounded-lg">
                  <CloudUpload className="w-5 h-5 text-white" strokeWidth={2.5} />
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
                Cargados
              </span>
            </div>
          </div>

          {/* En Evaluación - Gris Oscuro/Negro SATURADO */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-800 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
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
                  {estadisticas.enEvaluacion}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs font-semibold text-white/90">
                En Evaluación
              </span>
            </div>
          </div>

          {/* Observadas - Ámbar SATURADO (Impar - Oscuro) */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 border border-orange-600 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
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
          </div>

          {/* Atendidas - Teal CLARO (Par - Luz) */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
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
          </div>
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

      {/* ==================== ÚLTIMAS CARGAS CON TOOLTIPS - COMPACTO ==================== */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          🕐 Últimas Cargas {datosFiltrados.length !== ultimas3.length && ultimas3.length > 0 && (
            <span className="text-xs font-normal text-blue-600">({datosFiltrados.length}/{ultimas3.length})</span>
          )}
        </h3>

        {ultimas3.length > 0 ? (
          datosFiltrados.length > 0 ? (
          <div className="space-y-1.5">
            {datosFiltrados.map((carga, idx) => {
              const esObservacion = carga.estado === 'OBSERVACION';
              const tooltipAbierto = expandidoTooltip === idx;

              return (
                <div
                  key={idx}
                  onClick={() => onVerImagen({ dni: carga.dni, nombrePaciente: carga.nombrePaciente })}
                  className={`relative overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer ${
                    esObservacion
                      ? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:shadow-md hover:border-amber-300'
                      : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:shadow-md hover:border-blue-300'
                  }`}
                >
                  {/* Línea decorativa izquierda - Compacta */}
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${esObservacion ? 'bg-amber-400' : 'bg-blue-400'}`} />

                  <div className="p-2.5 flex items-center justify-between gap-2.5">
                    {/* Lado izquierdo - Info Compacta */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Icono pequeño */}
                      <div className={`flex-shrink-0 p-1.5 rounded-md ${esObservacion ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        {carga.estado === 'ENVIADA' ? (
                          <CheckCircle className={`w-4 h-4 ${esObservacion ? 'text-amber-600' : 'text-blue-600'}`} />
                        ) : (
                          <AlertCircle className={`w-4 h-4 ${esObservacion ? 'text-amber-600' : 'text-blue-600'}`} />
                        )}
                      </div>

                      {/* Info: Nombre, DNI, Tiempo en columna */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-xs truncate">
                          {carga.nombrePaciente}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-600 font-mono truncate">
                            {carga.dni}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {carga.tiempoTranscurrido}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lado derecho - Contador y Botón Compactos */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Badge de cantidad de imágenes - Compacto */}
                      <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                        esObservacion
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        📸 {carga.cantidadImagenes}
                      </span>

                      {/* Botón "Ver" - Pequeño */}
                      <button
                        onClick={() =>
                          window.open(`/teleekgs/listar?dni=${carga.dni}`, '_blank', 'noopener,noreferrer')
                        }
                        className={`flex-shrink-0 p-1.5 rounded-md transition-colors duration-200 ${
                          esObservacion
                            ? 'hover:bg-amber-100 text-amber-600 hover:text-amber-700'
                            : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'
                        }`}
                        title="Ver en nueva pestaña"
                        aria-label={`Ver EKG de ${carga.nombrePaciente} en nueva pestaña`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

    </div>
  );
}

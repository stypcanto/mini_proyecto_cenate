/**
 * 📊 Mis EKGs Recientes - Panel Derecho Mejorado
 * Muestra: Estadísticas del día + Últimas 3 cargas + Tooltips de observaciones
 *
 * v1.55.0 - Diseño médico profesional
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import teleecgService from '../../services/teleecgService';

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
  imagenesPorDni = {}, // ✅ NEW: Pasar imágenes reales por DNI
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
  const [modalMode, setModalMode] = useState('view'); // 'view', 'add', 'replace', 'delete', 'preview'
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(null);
  const [imagenPreviewData, setImagenPreviewData] = useState(null);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [dragActivo, setDragActivo] = useState(false);  // ✅ Para drag-and-drop
  const [esUrgente, setEsUrgente] = useState(false);  // ✅ Checkbox para marcar como urgente
  const fileInputRef = useRef(null);  // ✅ Referencia segura al input file

  // ✅ Sync ultimas3 to datosOriginales on mount and when ultimas3 changes
  useEffect(() => {
    setDatosOriginales(ultimas3);
  }, [ultimas3]);

  // ✅ Cargar imagen cuando se abre preview
  useEffect(() => {
    if (modalMode === 'preview' && previewImageIndex !== null && imagenesPorDni[cargaEdicion?.dni]) {
      const imagen = imagenesPorDni[cargaEdicion.dni][previewImageIndex];
      if (imagen?.idImagen && !imagenPreviewData) {
        setCargandoImagen(true);

        // Llamar al endpoint para obtener la imagen con base64
        teleecgService.verPreview(imagen.idImagen)
          .then((respuesta) => {
            // Combinar datos de la imagen con el contenido base64
            setImagenPreviewData({
              ...imagen,
              ...respuesta, // Incluye contenidoImagen y tipoContenido
            });
            setCargandoImagen(false);
            console.log('✅ Imagen cargada correctamente para preview:', imagen.idImagen);
          })
          .catch((error) => {
            console.error('❌ Error cargando imagen:', error);
            // En caso de error, mostrar fallback con los datos disponibles
            setImagenPreviewData(imagen);
            setCargandoImagen(false);
            toast.error('⚠️ No se pudo cargar la vista previa de la imagen');
          });
      }
    }
  }, [modalMode, previewImageIndex, cargaEdicion, imagenesPorDni, imagenPreviewData]);

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
                Imágenes EKG a analizar
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
                Pacientes pendientes
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

      {/* Modal Rediseñado - Simpler UX */}
      {showEditModal && cargaEdicion && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">🖼️ Gestor de Imágenes EKG</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {cargaEdicion.nombrePaciente} • DNI: {cargaEdicion.dni}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setModalMode('view');
                  setSelectedImageIndex(null);
                  setEsUrgente(false);  // Reset urgency checkbox
                  setArchivoSeleccionado(null);  // Reset selected file
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Vista Principal Simplificada */}
            {modalMode === 'view' && (
              <div className="space-y-6">
                {/* Sección de Imágenes Cargadas */}
                {(() => {
                  const imagenes = imagenesPorDni[cargaEdicion?.dni] || [];
                  return imagenes.length > 0 ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CloudUpload className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Imágenes Cargadas ({imagenes.length})
                        </h3>
                      </div>

                      {/* Grid de Imágenes - SIMPLIFICADO */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagenes.map((_, idx) => (
                        <div
                          key={idx}
                          className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center border border-gray-300 hover:border-blue-500 transition-all hover:shadow-md"
                        >
                          {/* Placeholder de imagen */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center">
                              <CloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-600 font-semibold">Imagen {idx + 1}</p>
                            </div>
                          </div>

                          {/* Botones de acción - SIEMPRE VISIBLES */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            {/* Ver Imagen */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImageIndex(idx);
                                setSelectedImageIndex(idx);
                                setModalMode('preview');
                              }}
                              className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg"
                              title="Ver imagen"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Eliminar Imagen */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(idx);
                                setModalMode('delete');
                              }}
                              className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                              title="Eliminar imagen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                    ) : (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                        <CloudUpload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-blue-900 font-semibold">No hay imágenes cargadas</p>
                        <p className="text-xs text-blue-700 mt-1">Agrega tu primera imagen usando el botón de abajo</p>
                      </div>
                    )
                  })()}

                {/* Zona de Agregar Imagen - PROMINENTE */}
                <div className="border-2 border-dashed border-green-400 rounded-lg p-8 bg-green-50 hover:bg-green-100 transition-all">
                  <Plus className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h4 className="font-bold text-green-900 mb-1 text-lg">Agregar Nueva Imagen</h4>
                  <p className="text-sm text-green-700 mb-4">Arrastra una imagen aquí o haz clic para seleccionar</p>
                  <button
                    onClick={() => setModalMode('add')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all hover:shadow-md active:scale-95"
                  >
                    + Seleccionar Imagen
                  </button>
                </div>
              </div>
            )}

            {/* Modo Agregar - Mejorado con Drag & Drop */}
            {modalMode === 'add' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Agregar Nueva Imagen
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Selecciona un archivo EKG (JPG, PNG, PDF) para agregarlo al registro del paciente</span>
                </div>

                {/* Zona de Drag & Drop Mejorada - Usando Label HTML */}
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActivo(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActivo(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActivo(false);

                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      const archivo = files[0];

                      // Validar tipo de archivo
                      const tiposValidos = ['image/jpeg', 'image/png', 'application/pdf'];
                      if (!tiposValidos.includes(archivo.type)) {
                        toast.error('❌ Tipo de archivo no válido. Usa JPG, PNG o PDF');
                        return;
                      }

                      // Validar tamaño (máximo 10MB)
                      if (archivo.size > 10 * 1024 * 1024) {
                        toast.error('❌ Archivo muy grande. Máximo 10 MB');
                        return;
                      }

                      setArchivoSeleccionado(archivo);
                      toast.success('✅ Archivo listo para subir');
                    }
                  }}
                  className={`block border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    dragActivo
                      ? 'border-green-500 bg-green-100 scale-105'
                      : archivoSeleccionado
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  {archivoSeleccionado ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900 text-lg">Archivo Listo</p>
                        <p className="text-xs text-green-700 mt-1">{archivoSeleccionado.name}</p>
                        <p className="text-xs text-green-600 mt-1">
                          {(archivoSeleccionado.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setArchivoSeleccionado(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="text-xs text-green-700 hover:text-green-900 font-semibold underline cursor-pointer"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <CloudUpload className="w-12 h-12 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {dragActivo ? '📥 Suelta el archivo aquí' : 'Arrastra un archivo aquí'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG o PDF (máximo 10 MB)</p>
                      </div>

                    </div>
                  )}
                </label>

                {/* Input File - Hidden pero accesible para file picker */}
                <input
                  ref={fileInputRef}
                  id={`fileInput-${cargaEdicion?.dni || 'default'}`}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const archivo = e.target.files?.[0];
                    if (archivo) {
                      // Validar tipo de archivo
                      const tiposValidos = ['image/jpeg', 'image/png', 'application/pdf'];
                      if (!tiposValidos.includes(archivo.type)) {
                        toast.error('❌ Tipo de archivo no válido. Usa JPG, PNG o PDF');
                        fileInputRef.current.value = '';
                        return;
                      }

                      // Validar tamaño (máximo 10MB)
                      if (archivo.size > 10 * 1024 * 1024) {
                        toast.error('❌ Archivo muy grande. Máximo 10 MB');
                        fileInputRef.current.value = '';
                        return;
                      }

                      setArchivoSeleccionado(archivo);
                      toast.success('✅ Archivo listo para subir');
                    }
                  }}
                />

                {/* Botón Seleccionar - Label asociado al input file */}
                {modalMode === 'add' && !archivoSeleccionado && (
                  <label
                    htmlFor={`fileInput-${cargaEdicion?.dni || 'default'}`}
                    className="block w-full px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all cursor-pointer text-center"
                  >
                    👆 Seleccionar Archivo
                  </label>
                )}

                {/* Checkbox Urgente */}
                {modalMode === 'add' && archivoSeleccionado && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="urgentCheckbox"
                      checked={esUrgente}
                      onChange={(e) => setEsUrgente(e.target.checked)}
                      className="w-5 h-5 text-red-600 cursor-pointer"
                    />
                    <label htmlFor="urgentCheckbox" className="flex-1 cursor-pointer">
                      <p className="font-semibold text-red-900">🚨 Marcar como URGENTE</p>
                      <p className="text-xs text-red-700 mt-0.5">Se destacará esta imagen con prioridad alta en la lista</p>
                    </label>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={async () => {
                      if (!archivoSeleccionado) {
                        toast.error('❌ Por favor selecciona un archivo primero');
                        return;
                      }
                      if (!cargaEdicion?.dni) {
                        toast.error('❌ Error: Falta información del paciente');
                        console.error('❌ cargaEdicion:', cargaEdicion);
                        return;
                      }

                      setCargandoArchivo(true);
                      try {
                        console.log('📤 Iniciando subida de imagen:', {
                          dni: cargaEdicion.dni,
                          nombreCompleto: cargaEdicion.nombrePaciente,
                          archivo: archivoSeleccionado.name,
                          esUrgente: esUrgente
                        });

                        // Extraer nombres y apellidos de forma segura
                        const nombreCompleto = cargaEdicion.nombrePaciente || 'Sin nombre';
                        const partes = nombreCompleto.trim().split(/\s+/);
                        const nombres = partes[0] || '';
                        const apellidos = partes.slice(1).join(' ') || '';

                        console.log('✅ Partes del nombre:', { nombres, apellidos });

                        const respuesta = await teleecgService.subirImagenECG(
                          archivoSeleccionado,
                          cargaEdicion.dni,
                          nombres,
                          apellidos,
                          esUrgente
                        );

                        console.log('✅ Respuesta del servidor:', respuesta);
                        toast.success('✅ ¡Imagen agregada correctamente!');
                        setModalMode('view');
                        setArchivoSeleccionado(null);
                        setEsUrgente(false);  // Reset urgency checkbox
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }

                        // Esperar un poco antes de refrescar
                        setTimeout(() => {
                          onRefrescar?.();
                        }, 500);
                      } catch (error) {
                        console.error('❌ Error completo al subir imagen:', error);
                        console.error('Mensaje:', error.message);
                        console.error('Detalles:', error.response?.data || error.response || error);

                        // Mensajes de error más amigables
                        let mensajeError = 'Error al subir la imagen';
                        if (error.message?.includes('401')) {
                          mensajeError = 'No tienes permiso para subir imágenes';
                        } else if (error.message?.includes('413')) {
                          mensajeError = 'Archivo muy grande';
                        } else if (error.message?.includes('Network')) {
                          mensajeError = 'Error de conexión. Verifica tu internet';
                        }

                        toast.error('❌ ' + mensajeError);
                      } finally {
                        setCargandoArchivo(false);
                      }
                    }}
                    disabled={cargandoArchivo || !archivoSeleccionado}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all text-base"
                  >
                    {cargandoArchivo ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Subiendo...
                      </span>
                    ) : (
                      '📤 Subir Imagen'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setModalMode('view');
                      setArchivoSeleccionado(null);
                      setEsUrgente(false);  // Reset urgency checkbox
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={cargandoArchivo}
                    className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded-lg font-bold transition-all"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Modo Reemplazar */}
            {modalMode === 'replace' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-orange-600" />
                  Reemplazar Imagen {selectedImageIndex !== null ? selectedImageIndex + 1 : ''}
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  ℹ️ Selecciona el nuevo archivo EKG que reemplazará a la imagen actual
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setArchivoSeleccionado(e.target.files?.[0])}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                />
                {archivoSeleccionado && (
                  <p className="text-xs text-orange-700 font-semibold">
                    ✅ Archivo seleccionado: {archivoSeleccionado.name}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!archivoSeleccionado) {
                        toast.error('Por favor selecciona un archivo');
                        return;
                      }
                      if (selectedImageIndex === null) {
                        toast.error('Error: Selecciona una imagen para reemplazar');
                        return;
                      }

                      setCargandoArchivo(true);
                      try {
                        console.log('🔄 Iniciando reemplazo de imagen');

                        // Obtener la imagen actual para eliminar
                        const imagenActual = imagenesPorDni[cargaEdicion.dni]?.[selectedImageIndex];
                        console.log('Imagen actual a eliminar:', imagenActual);

                        if (imagenActual?.idImagen) {
                          console.log('Eliminando imagen:', imagenActual.idImagen);
                          await teleecgService.eliminarImagen(imagenActual.idImagen);
                          toast.info('✅ Imagen antigua eliminada');
                        }

                        // Extraer nombres y apellidos de forma segura
                        const nombreCompleto = cargaEdicion.nombrePaciente || 'Sin nombre';
                        const partes = nombreCompleto.trim().split(/\s+/);
                        const nombres = partes[0] || '';
                        const apellidos = partes.slice(1).join(' ') || '';

                        // Subir la nueva imagen
                        console.log('Subiendo nueva imagen:', archivoSeleccionado.name);
                        const respuesta = await teleecgService.subirImagenECG(
                          archivoSeleccionado,
                          cargaEdicion.dni,
                          nombres,
                          apellidos
                        );

                        console.log('✅ Respuesta del servidor:', respuesta);
                        toast.success('🔄 Imagen reemplazada correctamente');
                        setModalMode('view');
                        setSelectedImageIndex(null);
                        setArchivoSeleccionado(null);

                        // Esperar un poco antes de refrescar
                        setTimeout(() => {
                          onRefrescar?.();
                        }, 500);
                      } catch (error) {
                        console.error('❌ Error completo al reemplazar imagen:', error);
                        console.error('Mensaje:', error.message);
                        console.error('Detalles:', error.response?.data || error.response || error);
                        toast.error('❌ Error al reemplazar: ' + (error.message || error));
                      } finally {
                        setCargandoArchivo(false);
                      }
                    }}
                    disabled={cargandoArchivo || !archivoSeleccionado}
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {cargandoArchivo ? '🔄 Reemplazando...' : 'Reemplazar'}
                  </button>
                  <button
                    onClick={() => {
                      setModalMode('view');
                      setSelectedImageIndex(null);
                      setArchivoSeleccionado(null);
                    }}
                    disabled={cargandoArchivo}
                    className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Modo Eliminar */}
            {modalMode === 'delete' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Eliminar Imagen {selectedImageIndex !== null ? selectedImageIndex + 1 : ''}
                </h3>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-sm text-red-800">
                  ⚠️ <strong>Advertencia:</strong> Esta acción no se puede deshacer. Se eliminará solo la imagen, el registro del paciente se mantendrá.
                </div>
                <p className="text-gray-700 text-sm">
                  ¿Estás seguro de que deseas eliminar la Imagen {selectedImageIndex !== null ? selectedImageIndex + 1 : ''}?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setCargandoArchivo(true);
                      try {
                        const imagenActual = imagenesPorDni[cargaEdicion.dni]?.[selectedImageIndex];
                        if (imagenActual?.idImagen) {
                          await teleecgService.eliminarImagen(imagenActual.idImagen);
                          toast.success('🗑️ Imagen eliminada correctamente');

                          // ✅ Cerrar modal y resetear estado
                          setModalMode('view');
                          setSelectedImageIndex(null);
                          setPreviewImageIndex(null);

                          // ✅ Esperar a que se actualicen los datos
                          await new Promise(resolve => setTimeout(resolve, 800));
                          onRefrescar?.(); // Refrescar datos si existe la función
                        } else {
                          toast.error('No se encontró el ID de la imagen');
                        }
                      } catch (error) {
                        console.error('Error al eliminar imagen:', error);
                        toast.error('❌ Error al eliminar la imagen: ' + error.message);
                      } finally {
                        setCargandoArchivo(false);
                      }
                    }}
                    disabled={cargandoArchivo}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {cargandoArchivo ? '⏳ Eliminando...' : 'Sí, Eliminar'}
                  </button>
                  <button
                    onClick={() => {
                      setModalMode('view');
                      setSelectedImageIndex(null);
                    }}
                    disabled={cargandoArchivo}
                    className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Modo Preview - Ver imagen en grande */}
            {modalMode === 'preview' && previewImageIndex !== null && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => {
                      setModalMode('view');
                      setPreviewImageIndex(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Volver"
                  >
                    <ChevronUp className="w-5 h-5 rotate-180" />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900">
                    Imagen {previewImageIndex + 1}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                    Vista Previa
                  </span>
                </div>

                {/* Imagen en grande - Usar imágenes reales del paciente */}
                <div className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                  {(() => {
                    if (!imagenPreviewData) {
                      return (
                        <div className="w-full h-96 flex items-center justify-center bg-gray-200">
                          <p className="text-gray-600">Selecciona una imagen</p>
                        </div>
                      );
                    }

                    if (imagenPreviewData?.thumbnail_base64) {
                      // Usar thumbnail si está disponible
                      const url = `data:${imagenPreviewData.mimeType || imagenPreviewData.mime_type || 'image/jpeg'};base64,${imagenPreviewData.thumbnail_base64}`;
                      return (
                        <img
                          src={url}
                          alt={`Imagen ${previewImageIndex + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                          title={`${imagenPreviewData.nombreArchivo || imagenPreviewData.nombre_archivo || 'Imagen'}`}
                        />
                      );
                    }

                    if (imagenPreviewData?.contenidoImagen) {
                      // Imagen real con base64 completo
                      const url = `data:${imagenPreviewData.tipoContenido || 'image/jpeg'};base64,${imagenPreviewData.contenidoImagen}`;
                      return (
                        <img
                          src={url}
                          alt={`Imagen ${previewImageIndex + 1}`}
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      );
                    }

                    // Fallback: Sin vista previa disponible
                    return (
                      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                        <div className="text-center">
                          <CloudUpload className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                          <p className="text-amber-700 font-semibold">Sin vista previa</p>
                          <p className="text-xs text-amber-600 mt-2">ID: {imagenPreviewData?.idImagen || imagenPreviewData?.id_imagen}</p>
                          <p className="text-xs text-amber-500 mt-1">{imagenPreviewData?.nombreArchivo || imagenPreviewData?.nombre_archivo || `Imagen ${previewImageIndex + 1}`}</p>
                          <p className="text-xs text-amber-500 mt-3">Haz click en "Ver" en la tabla para ver la imagen completa</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Información de la imagen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="text-blue-900 font-semibold mb-2">📄 Detalles</p>
                  <div className="space-y-1 text-xs text-blue-800">
                    <p>👤 Paciente: {cargaEdicion.nombrePaciente}</p>
                    <p>🔢 DNI: {cargaEdicion.dni}</p>
                    <p>📅 Imagen: {previewImageIndex + 1} de {cargaEdicion.cantidadImagenes}</p>
                    <p>📝 Fecha carga: 2026-02-09 14:30</p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedImageIndex(previewImageIndex);
                      setModalMode('replace');
                    }}
                    className="py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Reemplazar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImageIndex(previewImageIndex);
                      setModalMode('delete');
                    }}
                    className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>

                <button
                  onClick={() => {
                    setModalMode('view');
                    setPreviewImageIndex(null);
                  }}
                  className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Volver a listado
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

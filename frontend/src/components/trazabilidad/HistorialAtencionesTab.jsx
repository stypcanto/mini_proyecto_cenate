// ========================================================================
// HistorialAtencionesTab.jsx - Historial de Atenciones Clínicas
// ------------------------------------------------------------------------
// CENATE 2026 | Componente para mostrar timeline de atenciones del asegurado
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Calendar,
  User,
  Building2,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Stethoscope,
  ChevronDown,
  Filter,
  X
} from 'lucide-react';
import { atencionesClinicasService } from '../../services/atencionesClinicasService';
import DetalleAtencionModal from './DetalleAtencionModal';
import VitalSignsStatusBadge from '../common/VitalSignsStatusBadge';
import VitalSignBadge from '../common/VitalSignBadge';
import TrendIndicator from '../common/TrendIndicator';
import {
  evaluarPresionArterial,
  evaluarSaturacionO2,
  evaluarTemperatura,
  evaluarFrecuenciaCardiaca
} from '../../utils/vitalSignsUtils';

export default function HistorialAtencionesTab({ pkAsegurado }) {
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [modalDetalle, setModalDetalle] = useState({
    isOpen: false,
    idAtencion: null
  });

  // Estado para comparativos de signos vitales (tendencias)
  const [comparativos, setComparativos] = useState({});

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    fechaAtencion: '',
    especialidad: '',
    medico: ''
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ============================================================
  // Cargar Atenciones
  // ============================================================
  const cargarAtenciones = async () => {
    if (!pkAsegurado) {
      setError('No se proporcionó el identificador del asegurado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await atencionesClinicasService.obtenerPorAsegurado(pkAsegurado, 0, 50);
      console.log('✅ Atenciones cargadas:', response);
      const data = response.data || response;
      setAtenciones(data.content || []);
    } catch (err) {
      console.error('❌ Error al cargar atenciones:', err);
      setError('No se pudieron cargar las atenciones clínicas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAtenciones();
  }, [pkAsegurado]);

  // ============================================================
  // Toggle Expandir/Colapsar + Cargar Comparativo
  // ============================================================
  const toggleExpand = async (idAtencion) => {
    const isExpanding = !expandedItems[idAtencion];

    setExpandedItems(prev => ({
      ...prev,
      [idAtencion]: isExpanding
    }));

    // Si estamos expandiendo y no tenemos comparativo, cargarlo
    if (isExpanding && !comparativos[idAtencion]) {
      try {
        const comparativo = await atencionesClinicasService.obtenerComparativoSignosVitales(idAtencion);
        setComparativos(prev => ({
          ...prev,
          [idAtencion]: comparativo
        }));
      } catch (error) {
        console.error('Error al cargar comparativo de signos vitales:', error);
        // No mostrar error al usuario, simplemente no habrá tendencias
      }
    }
  };

  // ============================================================
  // Formatear Fecha
  // ============================================================
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // ============================================================
  // Extraer fechas, especialidades y médicos únicos
  // ============================================================
  const fechasUnicas = useMemo(() => {
    const fechas = atenciones
      .map(a => a.fechaAtencion)
      .filter(f => f);
    // Ordenar de más reciente a más antigua
    return [...new Set(fechas)].sort((a, b) => new Date(b) - new Date(a));
  }, [atenciones]);

  const especialidadesUnicas = useMemo(() => {
    const especialidades = atenciones
      .map(a => a.nombreEspecialidad)
      .filter(e => e && e.trim() !== '');
    return [...new Set(especialidades)].sort();
  }, [atenciones]);

  const medicosUnicos = useMemo(() => {
    const medicos = atenciones
      .map(a => a.nombreProfesional)
      .filter(m => m && m.trim() !== '');
    return [...new Set(medicos)].sort();
  }, [atenciones]);

  // ============================================================
  // Filtrar Atenciones
  // ============================================================
  const atencionesFiltradas = useMemo(() => {
    return atenciones.filter(atencion => {
      // Filtro por fecha específica
      if (filtros.fechaAtencion && atencion.fechaAtencion !== filtros.fechaAtencion) {
        return false;
      }

      // Filtro por especialidad
      if (filtros.especialidad && atencion.nombreEspecialidad !== filtros.especialidad) {
        return false;
      }

      // Filtro por médico
      if (filtros.medico && atencion.nombreProfesional !== filtros.medico) {
        return false;
      }

      return true;
    });
  }, [atenciones, filtros]);

  // ============================================================
  // Limpiar Filtros
  // ============================================================
  const limpiarFiltros = () => {
    setFiltros({
      fechaAtencion: '',
      especialidad: '',
      medico: ''
    });
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtros.fechaAtencion || filtros.especialidad || filtros.medico;

  // ============================================================
  // Render
  // ============================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-[#084a8a] animate-spin mb-4" />
        <p className="font-medium text-slate-600">Cargando atenciones clínicas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center border-2 border-purple-200 bg-purple-50 rounded-2xl">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-purple-600" />
        <p className="mb-2 font-medium text-purple-700">{ error }</p>
        <button
          onClick={ cargarAtenciones }
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 font-medium text-white transition-all bg-purple-600 hover:bg-purple-700 rounded-xl"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!atenciones || atenciones.length === 0) {
    return (
      <div className="p-12 text-center border-2 bg-slate-50 border-slate-200 rounded-2xl">
        <Activity className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="mb-2 font-medium text-slate-600">
          No se encontraron atenciones clínicas
        </p>
        <p className="text-sm text-slate-500">
          Este asegurado aún no tiene atenciones registradas en el sistema
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */ }
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#084a8a] rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Historial de Atenciones Clínicas
            </h3>
            <p className="text-sm text-slate-500">
              { hayFiltrosActivos ? (
                <>
                  { atencionesFiltradas.length } de { atenciones.length } atenciones
                  { atencionesFiltradas.length === 0 && ' (sin resultados)' }
                </>
              ) : (
                <>
                  { atenciones.length } { atenciones.length === 1 ? 'atención registrada' : 'atenciones registradas' }
                </>
              ) }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={ () => setMostrarFiltros(!mostrarFiltros) }
            className={ `flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${hayFiltrosActivos
              ? 'bg-[#084a8a] text-white hover:bg-[#063d6f]'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } ` }
          >
            <Filter className="w-4 h-4" />
            Filtros
            { hayFiltrosActivos && (
              <span className="ml-1 px-1.5 py-0.5 bg-white text-[#084a8a] rounded-full text-xs font-bold">
                { [filtros.fechaAtencion, filtros.especialidad, filtros.medico].filter(Boolean).length }
              </span>
            ) }
          </button>
          <button
            onClick={ cargarAtenciones }
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Panel de Filtros */ }
      { mostrarFiltros && (
        <div className="bg-gradient-to-r from-slate-50 to-[#084a8a]/5 border-2 border-slate-200 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#084a8a]" />
              <h4 className="font-semibold text-slate-900">Filtrar Atenciones</h4>
            </div>
            { hayFiltrosActivos && (
              <button
                onClick={ limpiarFiltros }
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 transition-all rounded-lg hover:text-purple-700 hover:bg-purple-50"
              >
                <X className="w-3 h-3" />
                Limpiar filtros
              </button>
            ) }
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Fecha de Atención */ }
            <div>
              <label className="block mb-1 text-xs font-medium text-slate-700">
                Fecha de Atención
              </label>
              <select
                value={ filtros.fechaAtencion }
                onChange={ (e) => setFiltros({ ...filtros, fechaAtencion: e.target.value }) }
                className="w-full px-3 py-2 border border-[#084a8a]/30 rounded-lg text-sm focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] transition-all bg-white hover:border-[#084a8a]/50"
              >
                <option value="">Todas las fechas</option>
                { fechasUnicas.map(fecha => (
                  <option key={ fecha } value={ fecha }>
                    { formatearFecha(fecha) }
                  </option>
                )) }
              </select>
            </div>

            {/* Especialidad */ }
            <div>
              <label className="block mb-1 text-xs font-medium text-slate-700">
                Especialidad
              </label>
              <select
                value={ filtros.especialidad }
                onChange={ (e) => setFiltros({ ...filtros, especialidad: e.target.value }) }
                className="w-full px-3 py-2 border border-[#084a8a]/30 rounded-lg text-sm focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] transition-all bg-white hover:border-[#084a8a]/50"
              >
                <option value="">Todas las especialidades</option>
                { especialidadesUnicas.map(esp => (
                  <option key={ esp } value={ esp }>{ esp }</option>
                )) }
              </select>
            </div>

            {/* Médico */ }
            <div>
              <label className="block mb-1 text-xs font-medium text-slate-700">
                Médico
              </label>
              <select
                value={ filtros.medico }
                onChange={ (e) => setFiltros({ ...filtros, medico: e.target.value }) }
                className="w-full px-3 py-2 border border-[#084a8a]/30 rounded-lg text-sm focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] transition-all bg-white hover:border-[#084a8a]/50"
              >
                <option value="">Todos los médicos</option>
                { medicosUnicos.map(med => (
                  <option key={ med } value={ med }>{ med }</option>
                )) }
              </select>
            </div>
          </div>

          {/* Resumen de filtros activos */ }
          { hayFiltrosActivos && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
              { filtros.fechaAtencion && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#084a8a]/10 text-[#084a8a] rounded-md text-xs font-medium border border-[#084a8a]/20">
                  📅 { formatearFecha(filtros.fechaAtencion) }
                  <button
                    onClick={ () => setFiltros({ ...filtros, fechaAtencion: '' }) }
                    className="hover:bg-[#084a8a]/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) }
              { filtros.especialidad && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-md">
                  { filtros.especialidad }
                  <button
                    onClick={ () => setFiltros({ ...filtros, especialidad: '' }) }
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) }
              { filtros.medico && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-md">
                  { filtros.medico }
                  <button
                    onClick={ () => setFiltros({ ...filtros, medico: '' }) }
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) }
            </div>
          ) }
        </div>
      ) }

      {/* Timeline de Atenciones */ }
      { atencionesFiltradas.length === 0 ? (
        <div className="p-8 text-center border-2 border-purple-200 bg-purple-50 rounded-xl">
          <Filter className="w-12 h-12 mx-auto mb-3 text-purple-400" />
          <p className="mb-1 font-semibold text-purple-900">No se encontraron resultados</p>
          <p className="mb-4 text-sm text-purple-700">
            No hay atenciones que coincidan con los filtros seleccionados
          </p>
          <button
            onClick={ limpiarFiltros }
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          { atencionesFiltradas.map((atencion, index) => (
            <div
              key={ atencion.idAtencion }
              className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-[#084a8a] hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icono y línea de timeline */ }
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-[#084a8a] rounded-full">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                  { index < atencionesFiltradas.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-200 mt-2" />
                  ) }
                </div>

                {/* Contenido */ }
                <div className="flex-1">
                  {/* Header clickeable */ }
                  <div className="flex items-start justify-between mb-2 group">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        { atencion.nombreTipoAtencion || 'Atención Clínica' }
                      </h4>
                      <p className="text-sm text-slate-600">
                        { atencion.nombreEspecialidad || 'Sin especialidad' }
                      </p>
                    </div>

                    {/* Botón de expandir/colapsar más intuitivo */ }
                    <button
                      className="group/btn flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-[#084a8a] transition-all duration-200 border border-slate-200 hover:border-[#084a8a] flex-shrink-0 shadow-sm hover:shadow-md"
                      onClick={ () => toggleExpand(atencion.idAtencion) }
                    >
                      <span className="text-xs font-medium transition-colors text-slate-600 group-hover/btn:text-white">
                        { expandedItems[atencion.idAtencion] ? 'Ocultar detalles' : 'Ver detalles' }
                      </span>
                      <ChevronDown
                        className={ `w-4 h-4 text-slate-600 group-hover/btn:text-white transition-all duration-200 ${expandedItems[atencion.idAtencion] ? 'rotate-180' : 'rotate-0'
                          } ` }
                      />
                    </button>
                  </div>

                  {/* Información básica - siempre visible */ }
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-[#084a8a]" />
                      <span>{ formatearFecha(atencion.fechaAtencion) }</span>
                    </div>
                    { atencion.nombreProfesional && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-[#084a8a]" />
                        <span>{ atencion.nombreProfesional }</span>
                      </div>
                    ) }
                  </div>

                  {/* Estrategia - Badge siempre visible */ }
                  { atencion.nombreEstrategia && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#084a8a] text-white shadow-sm">
                        <FileText className="w-3.5 h-3.5" />
                        { atencion.nombreEstrategia }
                      </span>
                    </div>
                  ) }

                  {/* Contenido expandible */ }
                  { expandedItems[atencion.idAtencion] && (
                    <div className="mt-3 space-y-3 duration-200 animate-in slide-in-from-top-2">
                      {/* Información adicional del header */ }
                      { atencion.nombreIpress && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="w-4 h-4 text-[#084a8a]" />
                          <span className="truncate">{ atencion.nombreIpress }</span>
                        </div>
                      ) }

                      {/* Signos Vitales Estructurados - FIX PROBLEMA #1 */ }
                      { (atencion.signosVitales?.presionArterial || atencion.signosVitales?.saturacionO2 || atencion.signosVitales?.temperatura || atencion.signosVitales?.frecuenciaCardiaca) && (
                        <div className="p-4 border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-green-100 rounded">
                              <Activity className="w-4 h-4 text-green-600" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900">Signos Vitales</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                            {/* Presión Arterial */ }
                            { atencion.signosVitales.presionArterial && (
                              <VitalSignBadge
                                label="PA"
                                value={ atencion.signosVitales.presionArterial }
                                unit="mmHg"
                                evaluacion={ evaluarPresionArterial(atencion.signosVitales.presionArterial) }
                              />
                            ) }

                            {/* Saturación O2 */ }
                            { atencion.signosVitales.saturacionO2 !== null && atencion.signosVitales.saturacionO2 !== undefined && (
                              <VitalSignBadge
                                label="SpO₂"
                                value={ atencion.signosVitales.saturacionO2 }
                                unit="%"
                                evaluacion={ evaluarSaturacionO2(atencion.signosVitales.saturacionO2) }
                              />
                            ) }

                            {/* Temperatura */ }
                            { atencion.signosVitales.temperatura && (
                              <VitalSignBadge
                                label="Temp"
                                value={ atencion.signosVitales.temperatura }
                                unit="°C"
                                evaluacion={ evaluarTemperatura(atencion.signosVitales.temperatura) }
                              />
                            ) }

                            {/* Frecuencia Cardíaca */ }
                            { atencion.signosVitales.frecuenciaCardiaca !== null && atencion.signosVitales.frecuenciaCardiaca !== undefined && (
                              <VitalSignBadge
                                label="FC"
                                value={ atencion.signosVitales.frecuenciaCardiaca }
                                unit="lpm"
                                evaluacion={ evaluarFrecuenciaCardiaca(atencion.signosVitales.frecuenciaCardiaca) }
                              />
                            ) }
                          </div>
                        </div>
                      ) }

                      {/* Motivo de Consulta */ }
                      { atencion.motivoConsulta && (
                        <div className="p-3 bg-[#084a8a]/5 border border-[#084a8a]/20 rounded-lg">
                          <p className="text-xs font-semibold text-[#084a8a] mb-1">
                            Motivo de Consulta:
                          </p>
                          <p className="text-sm text-[#084a8a]/90">
                            { atencion.motivoConsulta }
                          </p>
                        </div>
                      ) }

                      {/* 💊 TRATAMIENTO Y RECOMENDACIONES (PRIORIDAD #1) */ }
                      { (atencion.tratamiento || atencion.recomendacionEspecialista) && (
                        <div className="space-y-3">
                          {/* Tratamiento */ }
                          { atencion.tratamiento && (
                            <div className="p-4 border-2 border-green-400 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                              <h4 className="flex items-center gap-2 mb-2 text-sm font-black text-green-900 uppercase">
                                <FileText className="w-4 h-4" />
                                💊 Plan Farmacológico
                              </h4>
                              <pre className="font-sans text-sm font-semibold leading-relaxed text-green-900 whitespace-pre-wrap">
                                { atencion.tratamiento }
                              </pre>
                            </div>
                          ) }

                          {/* Recomendaciones */ }
                          { atencion.recomendacionEspecialista && (
                            <div className="p-4 border-2 border-green-300 bg-green-50 rounded-xl">
                              <h4 className="flex items-center gap-2 mb-2 text-sm font-bold text-green-900">
                                <FileText className="w-4 h-4" />
                                👨‍⚕️ Recomendaciones
                              </h4>
                              <p className="text-sm font-medium leading-relaxed text-green-900 whitespace-pre-wrap">
                                { atencion.recomendacionEspecialista }
                              </p>
                            </div>
                          ) }
                        </div>
                      ) }

                      {/* 📋 CIE-10 Compacto (Contexto administrativo) */ }
                      { (atencion.diagnosticosCie10?.length > 0 || atencion.cie10Codigo) && (
                        <div className="p-3 border rounded-lg bg-slate-50 border-slate-300">
                          <h4 className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wide uppercase text-slate-600">
                            <Stethoscope className="w-3 h-3" />
                            Códigos CIE-10 { atencion.diagnosticosCie10?.length > 0 && `(${atencion.diagnosticosCie10.length})` }
                          </h4>
                          { atencion.diagnosticosCie10?.length > 0 ? (
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              { atencion.diagnosticosCie10.map((diag, index) => (
                                <li key={ index } className="flex items-start gap-2">
                                  <span className={ `px-1.5 py-0.5 rounded font-mono font-bold text-[10px] flex-shrink-0 ${
                                    diag.esPrincipal ? 'bg-purple-600 text-white' : 'bg-slate-300 text-slate-700'
                                  }` }>
                                    { diag.cie10Codigo }
                                  </span>
                                  <span className="leading-tight">
                                    { diag.esPrincipal && <strong>⭐ </strong> }
                                    { diag.cie10Descripcion }
                                  </span>
                                </li>
                              )) }
                            </ul>
                          ) : (
                            atencion.cie10Codigo && (
                              <div className="flex items-start gap-2 text-xs text-slate-700">
                                <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded font-mono font-bold text-[10px]">
                                  { atencion.cie10Codigo }
                                </span>
                                <span className="leading-tight">{ atencion.cie10Descripcion }</span>
                              </div>
                            )
                          ) }
                        </div>
                      ) }

                      {/* Impresión Diagnóstica (texto libre - SIN valores) */ }
                      { atencion.diagnostico && (
                        <div className="p-3 border border-purple-300 rounded-lg bg-purple-50">
                          <h4 className="text-xs font-bold text-purple-900 flex items-center gap-2 mb-1.5">
                            <FileText className="w-3 h-3" />
                            Impresión Diagnóstica
                          </h4>
                          <p className="text-xs leading-relaxed text-purple-800">
                            { atencion.diagnostico }
                          </p>
                        </div>
                      ) }

                      {/* Badges de información adicional */ }
                      <div className="flex flex-wrap gap-2">
                        {/* FIX CRÍTICO: Badge inteligente que evalúa estado real de signos vitales */ }
                        { (atencion.signosVitales?.presionArterial || atencion.signosVitales?.saturacionO2 || atencion.signosVitales?.temperatura || atencion.signosVitales?.frecuenciaCardiaca) && (
                          <VitalSignsStatusBadge
                            presionArterial={ atencion.signosVitales.presionArterial }
                            saturacionO2={ atencion.signosVitales.saturacionO2 }
                            temperatura={ atencion.signosVitales.temperatura }
                            frecuenciaCardiaca={ atencion.signosVitales.frecuenciaCardiaca }
                          />
                        ) }
                        { atencion.tieneInterconsulta && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-md">
                            Interconsulta
                          </span>
                        ) }
                        { atencion.requiereTelemonitoreo && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#084a8a]/10 text-[#084a8a] border border-[#084a8a]/20">
                            Telemonitoreo
                          </span>
                        ) }
                      </div>

                      {/* Botón para ver detalles completos */ }
                      <button
                        onClick={ (e) => {
                          e.stopPropagation();
                          setModalDetalle({ isOpen: true, idAtencion: atencion.idAtencion });
                        } }
                        className="w-full mt-2 px-4 py-2 bg-[#084a8a] hover:bg-[#063d6f] text-white rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Detalles Completos
                      </button>
                    </div>
                  ) }
                </div>
              </div>
            </div>
          )) }
        </div>
      ) }

      {/* Modal de Detalle */ }
      { modalDetalle.isOpen && (
        <DetalleAtencionModal
          idAtencion={ modalDetalle.idAtencion }
          onClose={ () => setModalDetalle({ isOpen: false, idAtencion: null }) }
        />
      ) }
    </div>
  );
}

// ========================================================================
// DetalleAtencionModal.jsx - Modal de Detalle de Atención Clínica
// ------------------------------------------------------------------------
// CENATE 2026 | Modal completo para visualizar toda la información
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Building2,
  FileText,
  Activity,
  Clock,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Stethoscope,
  ClipboardList,
  Users,
  MonitorDot
} from 'lucide-react';
import { atencionesClinicasService } from '../../services/atencionesClinicasService';
import SignosVitalesCard from './SignosVitalesCard';
import InterconsultaCard from './InterconsultaCard';

export default function DetalleAtencionModal({
  isOpen,
  onClose,
  idAtencion,
  onEdit,
  onDelete
}) {
  const [atencion, setAtencion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState('general');

  // ============================================================
  // Cargar Detalle de Atención
  // ============================================================
  const cargarDetalle = async () => {
    if (!idAtencion) return;

    setLoading(true);
    setError(null);
    try {
      const data = await atencionesClinicasService.obtenerDetalle(idAtencion);
      console.log('✅ Detalle de atención cargado:', data);
      setAtencion(data);
    } catch (err) {
      console.error('❌ Error al cargar detalle:', err);
      setError('No se pudo cargar el detalle de la atención');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && idAtencion) {
      cargarDetalle();
      setTabActiva('general'); // Reset a tab general al abrir
    }
  }, [isOpen, idAtencion]);

  // ============================================================
  // Formatear Fecha
  // ============================================================
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      return new Date(fecha).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // ============================================================
  // Handlers
  // ============================================================
  const handleEdit = () => {
    if (onEdit) onEdit(atencion);
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Está seguro de eliminar esta atención clínica?')) return;

    try {
      await atencionesClinicasService.eliminar(idAtencion);
      if (onDelete) onDelete(idAtencion);
      onClose();
    } catch (err) {
      alert('Error al eliminar la atención: ' + err.message);
    }
  };

  if (!isOpen) return null;

  // ============================================================
  // Tabs Configuration
  // ============================================================
  const tabs = [
    { id: 'general', label: 'Información General', icon: FileText },
    { id: 'signos', label: 'Signos Vitales', icon: Activity, badge: atencion?.tieneSignosVitales },
    { id: 'clinico', label: 'Datos Clínicos', icon: Stethoscope },
    { id: 'interconsulta', label: 'Interconsulta', icon: Users, badge: atencion?.tieneOrdenInterconsulta },
    { id: 'seguimiento', label: 'Seguimiento', icon: MonitorDot, badge: atencion?.requiereTelemonitoreo }
  ];

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Detalle de Atención Clínica
              </h2>
              <p className="text-sm text-white/80">
                ID: {idAtencion} | {atencion?.tipoCita || 'Cargando...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {atencion && onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                title="Editar atención"
              >
                <Edit className="w-5 h-5 text-white" />
              </button>
            )}
            {atencion && onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-all"
                title="Eliminar atención"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        {!loading && !error && atencion && (
          <div className="border-b border-slate-200 px-6 bg-slate-50 overflow-x-auto">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap ${
                      tabActiva === tab.id
                        ? 'text-[#0A5BA9] border-b-2 border-[#0A5BA9] bg-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                    {tab.badge && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-[#0A5BA9] animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Cargando detalle de atención...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Content Tabs */}
          {!loading && !error && atencion && (
            <>
              {/* TAB: Información General */}
              {tabActiva === 'general' && (
                <div className="space-y-6">
                  {/* Paciente */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Información del Paciente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Nombre Completo</p>
                        <p className="text-base font-bold text-blue-900">{atencion.pacienteNombre}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-700 uppercase mb-1">ID Asegurado</p>
                        <p className="text-base font-bold text-blue-900">{atencion.pacienteDni || atencion.pacienteId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Atención */}
                  <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Detalles de la Atención
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Fecha de Atención</p>
                        <p className="text-sm font-medium text-slate-900">{formatearFecha(atencion.fechaAtencion)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Tipo de Atención</p>
                        <p className="text-sm font-medium text-slate-900">{atencion.tipoCita}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">IPRESS</p>
                        <p className="text-sm font-medium text-slate-900">{atencion.ipressNombre}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Especialidad</p>
                        <p className="text-sm font-medium text-slate-900">{atencion.especialidad || 'No especificada'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Profesional</p>
                        <p className="text-sm font-medium text-slate-900">{atencion.nombreProfesional}</p>
                      </div>
                      {atencion.nombreEstrategia && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Estrategia</p>
                          <p className="text-sm font-medium text-slate-900">{atencion.nombreEstrategia}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Auditoría */}
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Información de Auditoría
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Creado:</span>{' '}
                        <span className="text-slate-700">{formatearFecha(atencion.fechaSolicitud)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Última actualización:</span>{' '}
                        <span className="text-slate-700">{formatearFecha(atencion.fechaActualizacion)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Signos Vitales */}
              {tabActiva === 'signos' && (
                <SignosVitalesCard signosVitales={atencion.signosVitales} />
              )}

              {/* TAB: Datos Clínicos */}
              {tabActiva === 'clinico' && (
                <div className="space-y-4">
                  {/* ============================================ */}
                  {/* 💊 PLAN DE ACCIÓN CLÍNICA (PRIORIDAD #1) */}
                  {/* ============================================ */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* COLUMNA IZQUIERDA: PLAN TERAPÉUTICO (2/3 del espacio) */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Tratamiento Indicado (LO MÁS IMPORTANTE) */}
                      {atencion.tratamiento && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-500 rounded-xl p-5 shadow-lg">
                          <h3 className="text-lg font-black text-green-900 mb-3 flex items-center gap-2 uppercase">
                            <FileText className="w-5 h-5" />
                            💊 Plan Farmacológico
                          </h3>
                          <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                            <pre className="text-sm text-green-900 font-semibold leading-relaxed whitespace-pre-wrap font-sans">
                              {atencion.tratamiento}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Recomendaciones del Especialista */}
                      {atencion.recomendacionEspecialista && (
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-400 rounded-xl p-5 shadow-md">
                          <h3 className="text-base font-bold text-teal-900 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            👨‍⚕️ Recomendaciones Clínicas
                          </h3>
                          <p className="text-sm text-teal-900 font-medium leading-relaxed whitespace-pre-wrap">
                            {atencion.recomendacionEspecialista}
                          </p>
                        </div>
                      )}

                      {/* Resultados Clínicos / Exámenes */}
                      {atencion.resultadosClinicos && (
                        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-5">
                          <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Resultados de Exámenes
                          </h3>
                          <p className="text-sm text-indigo-800 whitespace-pre-wrap">{atencion.resultadosClinicos}</p>
                        </div>
                      )}
                    </div>

                    {/* COLUMNA DERECHA: CONTEXTO ADMINISTRATIVO (1/3 del espacio) */}
                    <div className="lg:col-span-1 space-y-4">
                      {/* Diagnósticos CIE-10 COMPACTOS */}
                      {(atencion.diagnosticosCie10?.length > 0 || atencion.cie10Codigo) && (
                        <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Códigos CIE-10
                          </h3>
                          {atencion.diagnosticosCie10?.length > 0 ? (
                            <ul className="space-y-2 text-xs text-slate-700">
                              {atencion.diagnosticosCie10.map((diag, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] flex-shrink-0 ${
                                    diag.esPrincipal
                                      ? 'bg-red-600 text-white'
                                      : 'bg-slate-300 text-slate-700'
                                  }`}>
                                    {diag.cie10Codigo}
                                  </span>
                                  <span className="leading-tight">
                                    {diag.esPrincipal && <strong>⭐ </strong>}
                                    {diag.cie10Descripcion}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            atencion.cie10Codigo && (
                              <div className="flex items-start gap-2 text-xs text-slate-700">
                                <span className="px-1.5 py-0.5 bg-red-600 text-white rounded font-mono font-bold text-[10px]">
                                  {atencion.cie10Codigo}
                                </span>
                                <span className="leading-tight">{atencion.cie10Descripcion}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Antecedentes */}
                      {atencion.antecedentes && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Antecedentes
                          </h3>
                          <p className="text-xs text-amber-800 leading-snug whitespace-pre-wrap">{atencion.antecedentes}</p>
                        </div>
                      )}

                      {/* Estrategia CENACRON */}
                      {atencion.nombreEstrategia && (
                        <div className="bg-[#0A5BA9]/5 border-2 border-[#0A5BA9] rounded-xl p-3">
                          <p className="text-[10px] font-semibold text-[#0A5BA9] uppercase mb-1">Estrategia</p>
                          <p className="text-xs font-bold text-slate-900">{atencion.nombreEstrategia}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* 📋 INFORMACIÓN COMPLEMENTARIA */}
                  {/* ============================================ */}

                  {/* Motivo de Consulta */}
                  {atencion.motivoConsulta && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Motivo de Consulta
                      </h3>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">{atencion.motivoConsulta}</p>
                    </div>
                  )}

                  {/* Diagnóstico Clínico (Texto Descriptivo - SIN valores numéricos) */}
                  {atencion.diagnostico && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-purple-900 mb-2 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Impresión Diagnóstica (Texto Libre)
                      </h3>
                      <p className="text-sm text-purple-800 whitespace-pre-wrap font-medium">{atencion.diagnostico}</p>
                    </div>
                  )}

                  {/* Observaciones Generales */}
                  {atencion.observacionesGenerales && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Observaciones Generales
                      </h3>
                      <p className="text-sm text-yellow-800 whitespace-pre-wrap">{atencion.observacionesGenerales}</p>
                    </div>
                  )}

                  {/* Estado Vacío */}
                  {!atencion.tratamiento && !atencion.recomendacionEspecialista && !atencion.motivoConsulta && !atencion.diagnostico && !atencion.observacionesGenerales && (
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-12 text-center">
                      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">No hay datos clínicos registrados</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Interconsulta */}
              {tabActiva === 'interconsulta' && (
                <InterconsultaCard
                  tieneOrdenInterconsulta={atencion.tieneOrdenInterconsulta}
                  idEspecialidadInterconsulta={atencion.idEspecialidadInterconsulta}
                  nombreEspecialidadInterconsulta={atencion.nombreEspecialidadInterconsulta}
                  modalidadInterconsulta={atencion.modalidadInterconsulta}
                />
              )}

              {/* TAB: Seguimiento */}
              {tabActiva === 'seguimiento' && (
                <div className="space-y-4">
                  {atencion.requiereTelemonitoreo ? (
                    <>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-blue-500 rounded-full">
                            <MonitorDot className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-blue-900">
                              Telemonitoreo Activado
                            </h3>
                            <p className="text-sm text-blue-700">
                              Este paciente requiere seguimiento remoto
                            </p>
                          </div>
                        </div>
                      </div>

                      {atencion.datosSeguimiento && (
                        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                          <h3 className="text-sm font-bold text-slate-900 mb-3">Datos de Seguimiento</h3>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{atencion.datosSeguimiento}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-12 text-center">
                      <MonitorDot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">No requiere telemonitoreo</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================================================
// FormularioAtencionModal.jsx - Formulario de Atención Clínica
// ------------------------------------------------------------------------
// CENATE 2026 | Modal para crear y editar atenciones clínicas
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Activity,
  Stethoscope,
  FileText,
  Users,
  MonitorDot,
  Building2,
  Calendar,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  Weight,
  Ruler,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { atencionesClinicasService } from '../../services/atencionesClinicasService';
import { especialidadService } from '../../services/especialidadService';
import { tiposAtencionService } from '../../services/tiposAtencionService';
import { estrategiasService } from '../../services/estrategiasService';

export default function FormularioAtencionModal({
  isOpen,
  onClose,
  pkAsegurado,
  atencionInicial = null,
  onSuccess
}) {
  // ============================================================
  // Estados
  // ============================================================
  const [loading, setLoading] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Catálogos
  const [especialidades, setEspecialidades] = useState([]);
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [estrategias, setEstrategias] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    // Datos de Atención
    pkAsegurado: pkAsegurado || '',
    fechaAtencion: new Date().toISOString().slice(0, 16),
    idIpress: '',
    idEspecialidad: '',
    idServicio: '',

    // Datos Clínicos
    motivoConsulta: '',
    antecedentes: '',
    diagnostico: '',
    resultadosClinicos: '',
    observacionesGenerales: '',
    datosSeguimiento: '',

    // Signos Vitales
    presionArterial: '',
    temperatura: '',
    pesoKg: '',
    tallaCm: '',
    imc: '',
    saturacionO2: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',

    // Etiquetas de Trazabilidad
    idEstrategia: '',
    idTipoAtencion: '',

    // Interconsulta
    tieneOrdenInterconsulta: false,
    idEspecialidadInterconsulta: '',
    modalidadInterconsulta: '',

    // Telemonitoreo
    requiereTelemonitoreo: false
  });

  const isEditMode = !!atencionInicial;

  // ============================================================
  // Efectos
  // ============================================================
  useEffect(() => {
    if (isOpen) {
      cargarCatalogos();
      if (atencionInicial) {
        cargarDatosEdicion();
      }
    } else {
      resetForm();
    }
  }, [isOpen, atencionInicial]);

  // Auto-calcular IMC cuando cambian peso o talla
  useEffect(() => {
    const { pesoKg, tallaCm } = formData;
    if (pesoKg && tallaCm && tallaCm > 0) {
      const pesoNum = parseFloat(pesoKg);
      const tallaM = parseFloat(tallaCm) / 100;
      const imcCalculado = pesoNum / (tallaM * tallaM);
      setFormData(prev => ({
        ...prev,
        imc: imcCalculado.toFixed(2)
      }));
    }
  }, [formData.pesoKg, formData.tallaCm]);

  // ============================================================
  // Funciones de Carga
  // ============================================================
  const cargarCatalogos = async () => {
    setLoadingCatalogos(true);
    try {
      const [espData, tiposData, estData] = await Promise.all([
        especialidadService.obtenerActivas(),
        tiposAtencionService.obtenerActivos(),
        estrategiasService.obtenerActivas()
      ]);

      setEspecialidades(espData || []);
      setTiposAtencion(tiposData || []);
      setEstrategias(estData || []);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
      setError('No se pudieron cargar los catálogos necesarios');
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const cargarDatosEdicion = () => {
    const atencion = atencionInicial;

    setFormData({
      pkAsegurado: atencion.pkAsegurado || pkAsegurado,
      fechaAtencion: atencion.fechaAtencion ? new Date(atencion.fechaAtencion).toISOString().slice(0, 16) : '',
      idIpress: atencion.idIpress || '',
      idEspecialidad: atencion.idEspecialidad || '',
      idServicio: atencion.idServicio || '',

      motivoConsulta: atencion.motivoConsulta || '',
      antecedentes: atencion.antecedentes || '',
      diagnostico: atencion.diagnostico || '',
      resultadosClinicos: atencion.resultadosClinicos || '',
      observacionesGenerales: atencion.observacionesGenerales || '',
      datosSeguimiento: atencion.datosSeguimiento || '',

      presionArterial: atencion.presionArterial || '',
      temperatura: atencion.temperatura || '',
      pesoKg: atencion.pesoKg || '',
      tallaCm: atencion.tallaCm || '',
      imc: atencion.imc || '',
      saturacionO2: atencion.saturacionO2 || '',
      frecuenciaCardiaca: atencion.frecuenciaCardiaca || '',
      frecuenciaRespiratoria: atencion.frecuenciaRespiratoria || '',

      idEstrategia: atencion.idEstrategia || '',
      idTipoAtencion: atencion.idTipoAtencion || '',

      tieneOrdenInterconsulta: atencion.tieneOrdenInterconsulta || false,
      idEspecialidadInterconsulta: atencion.idEspecialidadInterconsulta || '',
      modalidadInterconsulta: atencion.modalidadInterconsulta || '',

      requiereTelemonitoreo: atencion.requiereTelemonitoreo || false
    });
  };

  const resetForm = () => {
    setFormData({
      pkAsegurado: pkAsegurado || '',
      fechaAtencion: new Date().toISOString().slice(0, 16),
      idIpress: '',
      idEspecialidad: '',
      idServicio: '',
      motivoConsulta: '',
      antecedentes: '',
      diagnostico: '',
      resultadosClinicos: '',
      observacionesGenerales: '',
      datosSeguimiento: '',
      presionArterial: '',
      temperatura: '',
      pesoKg: '',
      tallaCm: '',
      imc: '',
      saturacionO2: '',
      frecuenciaCardiaca: '',
      frecuenciaRespiratoria: '',
      idEstrategia: '',
      idTipoAtencion: '',
      tieneOrdenInterconsulta: false,
      idEspecialidadInterconsulta: '',
      modalidadInterconsulta: '',
      requiereTelemonitoreo: false
    });
    setErrors({});
    setError(null);
  };

  // ============================================================
  // Validaciones
  // ============================================================
  const validarFormulario = () => {
    const newErrors = {};

    // Campos obligatorios
    if (!formData.pkAsegurado) newErrors.pkAsegurado = 'El asegurado es obligatorio';
    if (!formData.fechaAtencion) newErrors.fechaAtencion = 'La fecha de atención es obligatoria';
    if (!formData.idTipoAtencion) newErrors.idTipoAtencion = 'El tipo de atención es obligatorio';

    // Validación de interconsulta
    if (formData.tieneOrdenInterconsulta) {
      if (!formData.idEspecialidadInterconsulta) {
        newErrors.idEspecialidadInterconsulta = 'Debe especificar la especialidad de interconsulta';
      }
      if (!formData.modalidadInterconsulta) {
        newErrors.modalidadInterconsulta = 'Debe especificar la modalidad de interconsulta';
      }
    }

    // Validaciones de rangos
    if (formData.temperatura && (formData.temperatura < 30 || formData.temperatura > 45)) {
      newErrors.temperatura = 'La temperatura debe estar entre 30°C y 45°C';
    }
    if (formData.pesoKg && (formData.pesoKg <= 0 || formData.pesoKg > 300)) {
      newErrors.pesoKg = 'El peso debe estar entre 0 y 300 kg';
    }
    if (formData.tallaCm && (formData.tallaCm <= 0 || formData.tallaCm > 250)) {
      newErrors.tallaCm = 'La talla debe estar entre 0 y 250 cm';
    }
    if (formData.saturacionO2 && (formData.saturacionO2 < 0 || formData.saturacionO2 > 100)) {
      newErrors.saturacionO2 = 'La saturación debe estar entre 0% y 100%';
    }
    if (formData.frecuenciaCardiaca && (formData.frecuenciaCardiaca < 30 || formData.frecuenciaCardiaca > 250)) {
      newErrors.frecuenciaCardiaca = 'La frecuencia cardíaca debe estar entre 30 y 250 lpm';
    }
    if (formData.frecuenciaRespiratoria && (formData.frecuenciaRespiratoria < 8 || formData.frecuenciaRespiratoria > 60)) {
      newErrors.frecuenciaRespiratoria = 'La frecuencia respiratoria debe estar entre 8 y 60 rpm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // Handlers
  // ============================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setError('Por favor corrija los errores en el formulario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar datos para envío
      const dataToSend = {
        ...formData,
        // Convertir strings vacíos a null
        idIpress: formData.idIpress || null,
        idEspecialidad: formData.idEspecialidad || null,
        idServicio: formData.idServicio || null,
        idEstrategia: formData.idEstrategia || null,
        idEspecialidadInterconsulta: formData.tieneOrdenInterconsulta ? formData.idEspecialidadInterconsulta : null,
        modalidadInterconsulta: formData.tieneOrdenInterconsulta ? formData.modalidadInterconsulta : null,
        // Convertir números
        temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
        pesoKg: formData.pesoKg ? parseFloat(formData.pesoKg) : null,
        tallaCm: formData.tallaCm ? parseFloat(formData.tallaCm) : null,
        imc: formData.imc ? parseFloat(formData.imc) : null,
        saturacionO2: formData.saturacionO2 ? parseInt(formData.saturacionO2) : null,
        frecuenciaCardiaca: formData.frecuenciaCardiaca ? parseInt(formData.frecuenciaCardiaca) : null,
        frecuenciaRespiratoria: formData.frecuenciaRespiratoria ? parseInt(formData.frecuenciaRespiratoria) : null
      };

      if (isEditMode) {
        await atencionesClinicasService.actualizar(atencionInicial.idAtencion, dataToSend);
      } else {
        await atencionesClinicasService.crear(dataToSend);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar atención:', err);
      setError(err.response?.data?.message || 'Error al guardar la atención clínica');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isEditMode ? 'Editar Atención Clínica' : 'Nueva Atención Clínica'}
              </h2>
              <p className="text-sm text-slate-500">
                {isEditMode ? 'Modificar datos de la atención' : 'Registrar nueva atención médica'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingCatalogos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#0A5BA9] animate-spin" />
              <span className="ml-3 text-slate-600">Cargando formulario...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error General */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* SECCIÓN 1: Datos de Atención */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Datos de Atención</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha de Atención */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Fecha de Atención <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="fechaAtencion"
                      value={formData.fechaAtencion}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                        errors.fechaAtencion ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    {errors.fechaAtencion && (
                      <p className="text-xs text-red-600 mt-1">{errors.fechaAtencion}</p>
                    )}
                  </div>

                  {/* Tipo de Atención */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tipo de Atención <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idTipoAtencion"
                      value={formData.idTipoAtencion}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                        errors.idTipoAtencion ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Seleccione...</option>
                      {tiposAtencion.map(tipo => (
                        <option key={tipo.idTipoAtencion} value={tipo.idTipoAtencion}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idTipoAtencion && (
                      <p className="text-xs text-red-600 mt-1">{errors.idTipoAtencion}</p>
                    )}
                  </div>

                  {/* Especialidad */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Especialidad
                    </label>
                    <select
                      name="idEspecialidad"
                      value={formData.idEspecialidad}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9]"
                    >
                      <option value="">Seleccione...</option>
                      {especialidades.map(esp => (
                        <option key={esp.idEspecialidad} value={esp.idEspecialidad}>
                          {esp.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estrategia */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Estrategia Institucional
                    </label>
                    <select
                      name="idEstrategia"
                      value={formData.idEstrategia}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9]"
                    >
                      <option value="">Seleccione...</option>
                      {estrategias.map(est => (
                        <option key={est.idEstrategia} value={est.idEstrategia}>
                          {est.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: Datos Clínicos */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Datos Clínicos</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Motivo de Consulta */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Motivo de Consulta
                    </label>
                    <textarea
                      name="motivoConsulta"
                      value={formData.motivoConsulta}
                      onChange={handleChange}
                      rows={3}
                      maxLength={5000}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] resize-none"
                      placeholder="Describa el motivo de la consulta..."
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.motivoConsulta.length} / 5000 caracteres
                    </p>
                  </div>

                  {/* Antecedentes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Antecedentes
                    </label>
                    <textarea
                      name="antecedentes"
                      value={formData.antecedentes}
                      onChange={handleChange}
                      rows={3}
                      maxLength={5000}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] resize-none"
                      placeholder="Antecedentes médicos relevantes..."
                    />
                  </div>

                  {/* Diagnóstico */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Diagnóstico
                    </label>
                    <textarea
                      name="diagnostico"
                      value={formData.diagnostico}
                      onChange={handleChange}
                      rows={3}
                      maxLength={5000}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] resize-none"
                      placeholder="Diagnóstico clínico..."
                    />
                  </div>

                  {/* Resultados Clínicos */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Resultados Clínicos
                    </label>
                    <textarea
                      name="resultadosClinicos"
                      value={formData.resultadosClinicos}
                      onChange={handleChange}
                      rows={2}
                      maxLength={5000}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] resize-none"
                      placeholder="Resultados de estudios, exámenes, etc..."
                    />
                  </div>

                  {/* Observaciones Generales */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Observaciones Generales
                    </label>
                    <textarea
                      name="observacionesGenerales"
                      value={formData.observacionesGenerales}
                      onChange={handleChange}
                      rows={2}
                      maxLength={5000}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] resize-none"
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: Signos Vitales */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Signos Vitales</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Presión Arterial */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Heart className="w-4 h-4 inline mr-1" />
                      Presión Arterial
                    </label>
                    <input
                      type="text"
                      name="presionArterial"
                      value={formData.presionArterial}
                      onChange={handleChange}
                      maxLength={20}
                      placeholder="120/80"
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9]"
                    />
                    <p className="text-xs text-slate-500 mt-1">mmHg</p>
                  </div>

                  {/* Temperatura */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Thermometer className="w-4 h-4 inline mr-1" />
                      Temperatura
                    </label>
                    <input
                      type="number"
                      name="temperatura"
                      value={formData.temperatura}
                      onChange={handleChange}
                      step="0.1"
                      min="30"
                      max="45"
                      placeholder="36.5"
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                        errors.temperatura ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    <p className="text-xs text-slate-500 mt-1">°C (30-45)</p>
                    {errors.temperatura && (
                      <p className="text-xs text-red-600 mt-1">{errors.temperatura}</p>
                    )}
                  </div>

                  {/* Saturación O2 */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Droplet className="w-4 h-4 inline mr-1" />
                      Saturación O₂
                    </label>
                    <input
                      type="number"
                      name="saturacionO2"
                      value={formData.saturacionO2}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      placeholder="98"
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                        errors.saturacionO2 ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    <p className="text-xs text-slate-500 mt-1">% (0-100)</p>
                  </div>

                  {/* Frecuencia Cardíaca */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Heart className="w-4 h-4 inline mr-1" />
                      FC
                    </label>
                    <input
                      type="number"
                      name="frecuenciaCardiaca"
                      value={formData.frecuenciaCardiaca}
                      onChange={handleChange}
                      min="30"
                      max="250"
                      placeholder="72"
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                        errors.frecuenciaCardiaca ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    <p className="text-xs text-slate-500 mt-1">lpm (30-250)</p>
                  </div>

                  {/* Frecuencia Respiratoria */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Wind className="w-4 h-4 inline mr-1" />
                      FR
                    </label>
                    <input
                      type="number"
                      name="frecuenciaRespiratoria"
                      value={formData.frecuenciaRespiratoria}
                      onChange={handleChange}
                      min="8"
                      max="60"
                      placeholder="16"
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                        errors.frecuenciaRespiratoria ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    <p className="text-xs text-slate-500 mt-1">rpm (8-60)</p>
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Weight className="w-4 h-4 inline mr-1" />
                      Peso
                    </label>
                    <input
                      type="number"
                      name="pesoKg"
                      value={formData.pesoKg}
                      onChange={handleChange}
                      step="0.1"
                      min="0.01"
                      max="300"
                      placeholder="70"
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                        errors.pesoKg ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    <p className="text-xs text-slate-500 mt-1">kg (0-300)</p>
                  </div>

                  {/* Talla */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      <Ruler className="w-4 h-4 inline mr-1" />
                      Talla
                    </label>
                    <input
                      type="number"
                      name="tallaCm"
                      value={formData.tallaCm}
                      onChange={handleChange}
                      step="0.1"
                      min="0.01"
                      max="250"
                      placeholder="170"
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                        errors.tallaCm ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    />
                    <p className="text-xs text-slate-500 mt-1">cm (0-250)</p>
                  </div>

                  {/* IMC (auto-calculado) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      IMC (auto)
                    </label>
                    <input
                      type="number"
                      name="imc"
                      value={formData.imc}
                      readOnly
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">kg/m²</p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: Interconsulta */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Interconsulta</h3>
                </div>

                {/* Checkbox Interconsulta */}
                <div className="flex items-center gap-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                  <input
                    type="checkbox"
                    name="tieneOrdenInterconsulta"
                    checked={formData.tieneOrdenInterconsulta}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#0A5BA9] border-2 border-slate-300 rounded focus:ring-2 focus:ring-[#0A5BA9]"
                  />
                  <label className="text-sm font-semibold text-orange-900">
                    Requiere orden de interconsulta
                  </label>
                </div>

                {/* Campos condicionales de interconsulta */}
                {formData.tieneOrdenInterconsulta && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                    {/* Especialidad Interconsulta */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Especialidad Destino <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="idEspecialidadInterconsulta"
                        value={formData.idEspecialidadInterconsulta}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                          errors.idEspecialidadInterconsulta ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      >
                        <option value="">Seleccione...</option>
                        {especialidades.map(esp => (
                          <option key={esp.idEspecialidad} value={esp.idEspecialidad}>
                            {esp.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.idEspecialidadInterconsulta && (
                        <p className="text-xs text-red-600 mt-1">{errors.idEspecialidadInterconsulta}</p>
                      )}
                    </div>

                    {/* Modalidad Interconsulta */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Modalidad <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="modalidadInterconsulta"
                        value={formData.modalidadInterconsulta}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] ${
                          errors.modalidadInterconsulta ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-white'
                        }`}
                      >
                        <option value="">Seleccione...</option>
                        <option value="PRESENCIAL">Presencial</option>
                        <option value="VIRTUAL">Virtual</option>
                      </select>
                      {errors.modalidadInterconsulta && (
                        <p className="text-xs text-red-600 mt-1">{errors.modalidadInterconsulta}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 5: Telemonitoreo */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                    <MonitorDot className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Seguimiento y Telemonitoreo</h3>
                </div>

                {/* Checkbox Telemonitoreo */}
                <div className="flex items-center gap-3 p-4 bg-teal-50 border-2 border-teal-200 rounded-xl">
                  <input
                    type="checkbox"
                    name="requiereTelemonitoreo"
                    checked={formData.requiereTelemonitoreo}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#0A5BA9] border-2 border-slate-300 rounded focus:ring-2 focus:ring-[#0A5BA9]"
                  />
                  <label className="text-sm font-semibold text-teal-900">
                    Requiere telemonitoreo
                  </label>
                </div>

                {/* Datos de Seguimiento */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Datos de Seguimiento
                  </label>
                  <textarea
                    name="datosSeguimiento"
                    value={formData.datosSeguimiento}
                    onChange={handleChange}
                    rows={3}
                    maxLength={5000}
                    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5BA9] resize-none"
                    placeholder="Indicaciones para seguimiento del paciente..."
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || loadingCatalogos}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditMode ? 'Actualizar Atención' : 'Guardar Atención'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

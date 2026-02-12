import React, { useState, useEffect } from 'react';
import { X, FileSignature, AlertCircle, CheckCircle, Calendar, Hash, FileText, Save } from 'lucide-react';
import apiClient from '../../../../../../../../../../../lib/apiClient';

// 🆕 v1.15.15: Helper para enviar fechas al backend sin conversión UTC
// IMPORTANTE: Previene el bug donde "02/05/2025" se guarda como "01/05/2025"
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;

  // Si ya está en formato YYYY-MM-DD correcto, retornar tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Si es un objeto Date, formatear manualmente en zona horaria local
  if (dateString instanceof Date) {
    const year = dateString.getFullYear();
    const month = String(dateString.getMonth() + 1).padStart(2, '0');
    const day = String(dateString.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return dateString;
};

/**
 * 🔄 Modal: Actualizar Entrega de Token PENDIENTE
 *
 * Permite registrar la entrega de un token que estaba en estado PENDIENTE.
 * Cambia el estado de PENDIENTE a ENTREGADO y captura:
 * - Número de serie del token
 * - Fecha de entrega
 * - Fechas del certificado
 *
 * @param {Object} firmaDigital - Datos de la firma digital pendiente
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onSuccess - Función llamada al actualizar exitosamente
 * @version 1.14.0
 * @author Ing. Styp Canto Rondon
 */
const ActualizarEntregaTokenModal = ({ firmaDigital, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Estado del formulario
  const [formData, setFormData] = useState({
    numeroSerieToken: '',
    fechaEntregaToken: new Date().toISOString().split('T')[0], // Hoy por defecto
    fechaInicioCertificado: '',
    fechaVencimientoCertificado: '',
    observaciones: ''
  });

  // Pre-llenar observaciones si existen
  useEffect(() => {
    if (firmaDigital?.observaciones) {
      setFormData(prev => ({
        ...prev,
        observaciones: firmaDigital.observaciones
      }));
    }
  }, [firmaDigital]);

  /**
   * Actualiza un campo del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Valida el formulario
   */
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.numeroSerieToken || formData.numeroSerieToken.trim() === '') {
      nuevosErrores.numeroSerieToken = 'El número de serie es obligatorio';
    }

    if (!formData.fechaEntregaToken) {
      nuevosErrores.fechaEntregaToken = 'La fecha de entrega es obligatoria';
    }

    if (!formData.fechaInicioCertificado) {
      nuevosErrores.fechaInicioCertificado = 'La fecha de inicio es obligatoria';
    }

    if (!formData.fechaVencimientoCertificado) {
      nuevosErrores.fechaVencimientoCertificado = 'La fecha de vencimiento es obligatoria';
    }

    // Validar que fecha vencimiento > fecha inicio
    if (formData.fechaInicioCertificado && formData.fechaVencimientoCertificado) {
      if (new Date(formData.fechaVencimientoCertificado) <= new Date(formData.fechaInicioCertificado)) {
        nuevosErrores.fechaVencimientoCertificado = 'Debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Envía el formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.put(
        `/api/firma-digital/${firmaDigital.idFirmaPersonal}/actualizar-entrega`,
        {
          numeroSerieToken: formData.numeroSerieToken.trim().toUpperCase(),
          fechaEntregaToken: formatDateForBackend(formData.fechaEntregaToken),
          fechaInicioCertificado: formatDateForBackend(formData.fechaInicioCertificado),
          fechaVencimientoCertificado: formatDateForBackend(formData.fechaVencimientoCertificado),
          observaciones: formData.observaciones.trim() || null
        }
      );

      if (response.data.status === 200) {
        alert('✅ Entrega de token registrada exitosamente');
        onSuccess && onSuccess();
        onClose();
      } else {
        alert('❌ Error al actualizar: ' + (response.data.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al actualizar entrega:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al registrar entrega';
      alert('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <FileSignature className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Registrar Entrega de Token
                </h2>
                <p className="text-purple-100 text-sm mt-1">
                  Actualizar firma digital pendiente
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información del personal */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Información del Personal
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-semibold text-gray-800">{firmaDigital?.nombreCompleto || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DNI:</span>
                <span className="font-medium text-gray-800">{firmaDigital?.dni || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado Actual:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  PENDIENTE
                </span>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Número de Serie del Token */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4" />
                Número de Serie del Token <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numeroSerieToken"
                value={formData.numeroSerieToken}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 rounded-lg border-2 transition-colors
                  ${errors.numeroSerieToken ? 'border-red-500 bg-red-50' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                `}
                placeholder="Ej: ABC123456789"
                disabled={loading}
              />
              {errors.numeroSerieToken && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.numeroSerieToken}
                </p>
              )}
            </div>

            {/* Fecha de Entrega */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Fecha de Entrega del Token <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fechaEntregaToken"
                value={formData.fechaEntregaToken}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 rounded-lg border-2 transition-colors
                  ${errors.fechaEntregaToken ? 'border-red-500 bg-red-50' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                `}
                disabled={loading}
              />
              {errors.fechaEntregaToken && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fechaEntregaToken}
                </p>
              )}
            </div>

            {/* Fechas del Certificado */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <h4 className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
                <FileSignature className="w-4 h-4" />
                Fechas del Certificado Digital
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha de Inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaInicioCertificado"
                    value={formData.fechaInicioCertificado}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-3 rounded-lg border-2 transition-colors
                      ${errors.fechaInicioCertificado ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                    `}
                    disabled={loading}
                  />
                  {errors.fechaInicioCertificado && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fechaInicioCertificado}
                    </p>
                  )}
                </div>

                {/* Fecha de Vencimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaVencimientoCertificado"
                    value={formData.fechaVencimientoCertificado}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-3 rounded-lg border-2 transition-colors
                      ${errors.fechaVencimientoCertificado ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                    `}
                    disabled={loading}
                  />
                  {errors.fechaVencimientoCertificado && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fechaVencimientoCertificado}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Observaciones <span className="text-gray-400">(Opcional)</span>
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Información adicional sobre la entrega..."
                disabled={loading}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Registrar Entrega
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActualizarEntregaTokenModal;

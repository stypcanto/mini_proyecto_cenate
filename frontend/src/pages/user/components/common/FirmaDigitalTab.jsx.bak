import React from 'react';
import { FileSignature, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * 🖋️ Componente: Pestaña Firma Digital
 *
 * Permite registrar información de firma digital del personal interno (CAS/728).
 *
 * Flujo:
 * 1. Si es LOCADOR → Mensaje informativo (gestiona su propia firma)
 * 2. Si es CAS/728:
 *    a) ¿Entregó token? SÍ → Captura fechas + número de serie
 *    b) ¿Entregó token? NO → Selecciona motivo (YA_TIENE, NO_REQUIERE, PENDIENTE)
 *       - Si motivo = YA_TIENE → Captura fechas del certificado existente
 *
 * @param {Object} formData - Estado del formulario
 * @param {Function} setFormData - Actualizar estado
 * @param {Object} errors - Errores de validación
 * @param {Function} handleChange - Manejador de cambios (no usado aquí)
 * @param {String} regimenLaboral - Descripción del régimen laboral
 * @version 1.14.0
 * @author Ing. Styp Canto Rondon
 */
const FirmaDigitalTab = ({ formData, setFormData, errors, handleChange, regimenLaboral }) => {

  // Detectar si es régimen LOCADOR
  const esLocador = regimenLaboral && regimenLaboral.toUpperCase().includes('LOCADOR');

  // Detectar si es CAS o 728
  const esCAS = regimenLaboral && regimenLaboral.toUpperCase().includes('CAS');
  const es728 = regimenLaboral && regimenLaboral.toUpperCase().includes('728');
  const requiereFirmaDigital = esCAS || es728;

  /**
   * Actualiza campo específico del formulario
   */
  const actualizarCampo = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  /**
   * Maneja el cambio en la opción "¿Entregó token?"
   */
  const manejarCambioEntregoToken = (valor) => {
    setFormData(prev => ({
      ...prev,
      entrego_token: valor,
      // Limpiar campos según la selección
      numero_serie_token: valor === 'SI' ? prev.numero_serie_token : '',
      fecha_entrega_token: valor === 'SI' ? prev.fecha_entrega_token : '',
      fecha_inicio_certificado: '',
      fecha_vencimiento_certificado: '',
      motivo_sin_token: valor === 'NO' ? prev.motivo_sin_token : null,
      observaciones_firma: prev.observaciones_firma
    }));
  };

  /**
   * Maneja el cambio en el motivo sin token
   */
  const manejarCambioMotivo = (motivo) => {
    setFormData(prev => ({
      ...prev,
      motivo_sin_token: motivo,
      // Si el motivo no es YA_TIENE, limpiar fechas
      fecha_inicio_certificado: motivo === 'YA_TIENE' ? prev.fecha_inicio_certificado : '',
      fecha_vencimiento_certificado: motivo === 'YA_TIENE' ? prev.fecha_vencimiento_certificado : ''
    }));
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
          <FileSignature className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Firma Digital
          </h2>
          <p className="text-sm text-gray-600">
            Registro de certificado digital del personal
          </p>
        </div>
      </div>

      {/* Mostrar régimen laboral */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-900">Régimen Laboral</h3>
        </div>
        <p className="text-lg font-medium text-blue-700 ml-8">
          {regimenLaboral || 'No especificado'}
        </p>
      </div>

      {/* Contenido condicional según régimen */}
      {esLocador ? (
        // CASO 1: Usuario LOCADOR - Solo mensaje informativo
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-amber-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Información Importante
              </h3>
              <p className="text-gray-700 leading-relaxed">
                El personal con régimen <span className="font-semibold text-amber-800">LOCADOR</span> gestiona su propia firma digital de forma independiente.
              </p>
              <p className="text-sm text-gray-600 mt-3">
                No es necesario registrar datos de firma digital en este formulario.
              </p>
            </div>
          </div>
        </div>
      ) : requiereFirmaDigital ? (
        // CASO 2: Usuario CAS/728 - Formulario completo
        <div className="space-y-6">
          {/* Pregunta: ¿Entregó token? */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
            <label className="block text-base font-semibold text-gray-700 mb-4">
              ¿El personal entregó el token de firma digital?
            </label>

            <div className="grid grid-cols-2 gap-4">
              {/* Opción: SÍ */}
              <button
                type="button"
                onClick={() => manejarCambioEntregoToken('SI')}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${formData.entrego_token === 'SI'
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle
                    className={`w-12 h-12 ${
                      formData.entrego_token === 'SI' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <span className={`text-lg font-semibold ${
                    formData.entrego_token === 'SI' ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    Sí, entregó token
                  </span>
                  {formData.entrego_token === 'SI' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </button>

              {/* Opción: NO */}
              <button
                type="button"
                onClick={() => manejarCambioEntregoToken('NO')}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${formData.entrego_token === 'NO'
                    ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100'
                    : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <XCircle
                    className={`w-12 h-12 ${
                      formData.entrego_token === 'NO' ? 'text-red-600' : 'text-gray-400'
                    }`}
                  />
                  <span className={`text-lg font-semibold ${
                    formData.entrego_token === 'NO' ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    No entregó token
                  </span>
                  {formData.entrego_token === 'NO' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {errors.entrego_token && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.entrego_token}
              </p>
            )}
          </div>

          {/* SI ENTREGÓ TOKEN: Formulario de certificado + número de serie */}
          {formData.entrego_token === 'SI' && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 space-y-5">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <FileSignature className="w-5 h-5" />
                Datos del Token y Certificado
              </h3>

              {/* Número de serie del token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Serie del Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.numero_serie_token || ''}
                  onChange={(e) => actualizarCampo('numero_serie_token', e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-lg border-2 transition-colors
                    ${errors.numero_serie_token ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                  `}
                  placeholder="Ej: ABC123456789"
                />
                {errors.numero_serie_token && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.numero_serie_token}
                  </p>
                )}
              </div>

              {/* Fecha de entrega del token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Entrega del Token
                </label>
                <input
                  type="date"
                  value={formData.fecha_entrega_token || ''}
                  onChange={(e) => actualizarCampo('fecha_entrega_token', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Opcional - Se registrará automáticamente</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fecha de inicio del certificado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio del Certificado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_inicio_certificado || ''}
                    onChange={(e) => actualizarCampo('fecha_inicio_certificado', e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-lg border-2 transition-colors
                      ${errors.fecha_inicio_certificado ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                    `}
                  />
                  {errors.fecha_inicio_certificado && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fecha_inicio_certificado}
                    </p>
                  )}
                </div>

                {/* Fecha de vencimiento del certificado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Vencimiento del Certificado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_vencimiento_certificado || ''}
                    onChange={(e) => actualizarCampo('fecha_vencimiento_certificado', e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-lg border-2 transition-colors
                      ${errors.fecha_vencimiento_certificado ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                      focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                    `}
                  />
                  {errors.fecha_vencimiento_certificado && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fecha_vencimiento_certificado}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* NO ENTREGÓ TOKEN: Selección de motivo */}
          {formData.entrego_token === 'NO' && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200 space-y-5">
              <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Motivo por el cual no entregó el token
              </h3>

              <div className="space-y-3">
                {/* Opción: YA_TIENE */}
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="radio"
                    name="motivo_sin_token"
                    value="YA_TIENE"
                    checked={formData.motivo_sin_token === 'YA_TIENE'}
                    onChange={(e) => manejarCambioMotivo(e.target.value)}
                    className="mt-1 w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Ya cuenta con certificado digital</span>
                    <p className="text-sm text-gray-600 mt-1">El personal ya tiene su propio token de firma digital</p>
                  </div>
                </label>

                {/* Opción: NO_REQUIERE */}
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all">
                  <input
                    type="radio"
                    name="motivo_sin_token"
                    value="NO_REQUIERE"
                    checked={formData.motivo_sin_token === 'NO_REQUIERE'}
                    onChange={(e) => manejarCambioMotivo(e.target.value)}
                    className="mt-1 w-5 h-5 text-amber-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-800">No requiere firma digital</span>
                    <p className="text-sm text-gray-600 mt-1">Las funciones del personal no requieren firma digital</p>
                  </div>
                </label>

                {/* Opción: PENDIENTE */}
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 bg-white cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                  <input
                    type="radio"
                    name="motivo_sin_token"
                    value="PENDIENTE"
                    checked={formData.motivo_sin_token === 'PENDIENTE'}
                    onChange={(e) => manejarCambioMotivo(e.target.value)}
                    className="mt-1 w-5 h-5 text-purple-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Pendiente de entrega</span>
                    <p className="text-sm text-gray-600 mt-1">El token será entregado posteriormente</p>
                  </div>
                </label>
              </div>

              {errors.motivo_sin_token && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.motivo_sin_token}
                </p>
              )}

              {/* Si motivo = YA_TIENE: Capturar fechas del certificado existente */}
              {formData.motivo_sin_token === 'YA_TIENE' && (
                <div className="mt-5 p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-4">
                    Fechas del Certificado Existente <span className="text-red-500">*</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_inicio_certificado || ''}
                        onChange={(e) => actualizarCampo('fecha_inicio_certificado', e.target.value)}
                        className={`
                          w-full px-4 py-3 rounded-lg border-2 transition-colors
                          ${errors.fecha_inicio_certificado ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        `}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Vencimiento
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_vencimiento_certificado || ''}
                        onChange={(e) => actualizarCampo('fecha_vencimiento_certificado', e.target.value)}
                        className={`
                          w-full px-4 py-3 rounded-lg border-2 transition-colors
                          ${errors.fecha_vencimiento_certificado ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        `}
                      />
                    </div>
                  </div>
                  {errors.fecha_inicio_certificado && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fecha_inicio_certificado}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Campo de observaciones (siempre visible si seleccionó algo) */}
          {formData.entrego_token && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones <span className="text-gray-400">(Opcional)</span>
              </label>
              <textarea
                value={formData.observaciones_firma || ''}
                onChange={(e) => actualizarCampo('observaciones_firma', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Información adicional sobre la firma digital..."
              />
            </div>
          )}
        </div>
      ) : (
        // CASO 3: No se ha seleccionado régimen laboral
        <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Seleccione el régimen laboral en la pestaña "Datos Laborales" para continuar.
          </p>
        </div>
      )}
    </div>
  );
};

export default FirmaDigitalTab;

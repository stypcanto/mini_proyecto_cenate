import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ExamenModal = ({ isOpen, onClose, onSave, examen = null, ipress }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    estado: 'Activo',
    ipressTransferencia: '',
    modalidadAtencion: '',
    nivelAtencion: '',
    tipoExamen: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (examen) {
      // Modo edición
      setFormData({
        codigo: examen.codigo || '',
        nombre: examen.nombre || '',
        estado: examen.estado || 'Activo',
        ipressTransferencia: examen.ipressTransferencia || '',
        modalidadAtencion: examen.modalidadAtencion || '',
        nivelAtencion: examen.nivelAtencion || '',
        tipoExamen: examen.tipoExamen || ''
      });
    } else {
      // Modo creación - reset
      setFormData({
        codigo: '',
        nombre: '',
        estado: 'Activo',
        ipressTransferencia: '',
        modalidadAtencion: '',
        nivelAtencion: '',
        tipoExamen: ''
      });
    }
    setErrors({});
  }, [examen, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.modalidadAtencion) {
      newErrors.modalidadAtencion = 'La modalidad de atención es requerida';
    }
    
    if (!formData.nivelAtencion) {
      newErrors.nivelAtencion = 'El nivel de atención es requerido';
    }
    
    if (!formData.tipoExamen) {
      newErrors.tipoExamen = 'El tipo de examen es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {examen ? 'Editar Examen' : 'Nuevo Examen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Código del Examen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código del Examen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.codigo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 87220"
              />
              {errors.codigo && (
                <p className="text-red-500 text-sm mt-1">{errors.codigo}</p>
              )}
            </div>

            {/* Nombre del Examen */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Examen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: KOH - EXAMEN DE TEJIDOS PARA HONGOS"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Modalidad de Atención */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Modalidad de Atención <span className="text-red-500">*</span>
                </label>
                <select
                  name="modalidadAtencion"
                  value={formData.modalidadAtencion}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.modalidadAtencion ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccione</option>
                  <option value="Ambulatorio">Ambulatorio</option>
                  <option value="Hospitalizado">Hospitalizado</option>
                  <option value="Emergencia">Emergencia</option>
                </select>
                {errors.modalidadAtencion && (
                  <p className="text-red-500 text-sm mt-1">{errors.modalidadAtencion}</p>
                )}
              </div>

              {/* Nivel de Atención */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nivel de Atención <span className="text-red-500">*</span>
                </label>
                <select
                  name="nivelAtencion"
                  value={formData.nivelAtencion}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nivelAtencion ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccione</option>
                  <option value="Nivel I">Nivel I</option>
                  <option value="Nivel II">Nivel II</option>
                  <option value="Nivel III">Nivel III</option>
                </select>
                {errors.nivelAtencion && (
                  <p className="text-red-500 text-sm mt-1">{errors.nivelAtencion}</p>
                )}
              </div>

              {/* Tipo de Examen */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Examen <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipoExamen"
                  value={formData.tipoExamen}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.tipoExamen ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccione</option>
                  <option value="Rutina">Rutina</option>
                  <option value="Especializado">Especializado</option>
                  <option value="Urgencia">Urgencia</option>
                </select>
                {errors.tipoExamen && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipoExamen}</p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            {/* IPRESS de Transferencia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IPRESS de Transferencia
              </label>
              <input
                type="text"
                name="ipressTransferencia"
                value={formData.ipressTransferencia}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: H.N. ALBERTO SABOGAL SOLOGUREN"
              />
            </div>
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              {examen ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamenModal;

// ============================================================================
// ✏️ ModalEditarSolicitud - Formulario para editar solicitud existente
// ============================================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader, AlertCircle } from 'lucide-react';

const ModalEditarSolicitud = ({ horario, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    turnosTotales: '',
    horasTotales: '',
    observaciones: '',
  });

  useEffect(() => {
    if (isOpen && horario) {
      setFormData({
        turnosTotales: horario.turnosTotales || '',
        horasTotales: horario.horasTotales || '',
        observaciones: horario.observaciones || '',
      });
    }
  }, [isOpen, horario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('auth.token');

      const request = {
        periodo: horario.periodo,
        idArea: horario.idArea,
        idPers: horario.idPers,
        idGrupoProg: horario.idGrupoProg,
        idServicio: horario.idServicio,
        idRegLab: horario.idRegLab,
        turnosTotales: parseInt(formData.turnosTotales) || 0,
        horasTotales: parseFloat(formData.horasTotales) || 0,
        observaciones: formData.observaciones,
      };

      const response = await axios.put(`/api/control-horarios/horarios/${horario.idCtrHorario}`, request, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.data.error || 'Error al actualizar solicitud');
      }
    } catch (err) {
      console.error('Error actualizando solicitud:', err);
      setError(err.response?.data?.error || 'Error al actualizar solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !horario) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Editar Solicitud - {horario.nomPers}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Información readonly */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <input
                type="text"
                value={horario.periodo}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Médico
              </label>
              <input
                type="text"
                value={horario.nomPers}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área
              </label>
              <input
                type="text"
                value={horario.descArea}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo Programático
              </label>
              <input
                type="text"
                value={horario.idGrupoProg}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {/* Campos editables */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turnos Totales
              </label>
              <input
                type="number"
                name="turnosTotales"
                value={formData.turnosTotales}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas Totales
              </label>
              <input
                type="number"
                step="0.01"
                name="horasTotales"
                value={formData.horasTotales}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarSolicitud;

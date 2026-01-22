// ========================================================================
// RendimientoHorario.jsx - Gestión de Rendimiento Horario
// ========================================================================
// Módulo para visualizar y configurar la capacidad de atención (pacientes/hora)
// por servicio médico y tipo de turno
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Clock,
  TrendingUp,
  Edit2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Search
} from 'lucide-react';

export default function RendimientoHorario() {
  const [rendimientos, setRendimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newRendimiento, setNewRendimiento] = useState({
    id_servicio: '',
    cod_turno: 'M4',
    pacientes_por_hora: 1,
    minutos_intervalo: 60
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Datos de ejemplo - en producción vendrían de la BD
  const servicios = [
    { id: 1, nombre: 'CARDIOLOGÍA' },
    { id: 2, nombre: 'NEUMOLOGÍA' },
    { id: 3, nombre: 'GASTROENTEROLOGÍA' },
    { id: 4, nombre: 'DERMATOLOGÍA' },
    { id: 5, nombre: 'OFTALMOLOGÍA' }
  ];

  const tiposturno = [
    { cod: 'M4', desc: 'Mañana 4h' },
    { cod: 'T4', desc: 'Tarde 4h' },
    { cod: 'MT8', desc: 'Mixta 8h' }
  ];

  // ============================================================
  // Cargar rendimientos
  // ============================================================
  useEffect(() => {
    cargarRendimientos();
  }, []);

  const cargarRendimientos = async () => {
    setLoading(true);
    try {
      // TODO: Reemplazar con API call real cuando esté disponible
      // const data = await rendimientoService.obtenerTodos();

      // Datos de ejemplo
      const datosEjemplo = [
        {
          id: 1,
          id_servicio: 1,
          nombre_servicio: 'CARDIOLOGÍA',
          cod_turno: 'M4',
          pacientes_por_hora: 4,
          minutos_intervalo: 15,
          activo: true
        },
        {
          id: 2,
          id_servicio: 1,
          nombre_servicio: 'CARDIOLOGÍA',
          cod_turno: 'T4',
          pacientes_por_hora: 3,
          minutos_intervalo: 20,
          activo: true
        },
        {
          id: 3,
          id_servicio: 2,
          nombre_servicio: 'NEUMOLOGÍA',
          cod_turno: 'M4',
          pacientes_por_hora: 3,
          minutos_intervalo: 20,
          activo: true
        },
        {
          id: 4,
          id_servicio: 3,
          nombre_servicio: 'GASTROENTEROLOGÍA',
          cod_turno: 'MT8',
          pacientes_por_hora: 2,
          minutos_intervalo: 30,
          activo: true
        },
        {
          id: 5,
          id_servicio: 4,
          nombre_servicio: 'DERMATOLOGÍA',
          cod_turno: 'M4',
          pacientes_por_hora: 5,
          minutos_intervalo: 12,
          activo: true
        }
      ];

      setRendimientos(datosEjemplo);
    } catch (err) {
      console.error('Error al cargar rendimientos:', err);
      setMessage({ type: 'error', text: 'Error al cargar los rendimientos' });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Búsqueda y filtrado
  // ============================================================
  const rendimientosFiltrados = rendimientos.filter(r =>
    r.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cod_turno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================
  // Edición
  // ============================================================
  const iniciarEdicion = (rendimiento) => {
    setEditingId(rendimiento.id);
    setEditValues({
      pacientes_por_hora: rendimiento.pacientes_por_hora,
      minutos_intervalo: rendimiento.minutos_intervalo
    });
  };

  const guardarEdicion = async (id) => {
    setSaving(true);
    try {
      // TODO: Reemplazar con API call real
      setRendimientos(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, ...editValues }
            : r
        )
      );
      setMessage({ type: 'success', text: 'Rendimiento actualizado exitosamente' });
      setEditingId(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error al guardar:', err);
      setMessage({ type: 'error', text: 'Error al guardar los cambios' });
    } finally {
      setSaving(false);
    }
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setEditValues({});
  };

  // ============================================================
  // Crear nuevo rendimiento
  // ============================================================
  const handleAgregarRendimiento = async () => {
    if (!newRendimiento.id_servicio) {
      setMessage({ type: 'error', text: 'Debe seleccionar un servicio' });
      return;
    }

    setSaving(true);
    try {
      // TODO: Reemplazar con API call real
      const servicio = servicios.find(s => s.id === parseInt(newRendimiento.id_servicio));
      const nuevoRegistro = {
        id: Math.max(...rendimientos.map(r => r.id), 0) + 1,
        ...newRendimiento,
        id_servicio: parseInt(newRendimiento.id_servicio),
        nombre_servicio: servicio.nombre,
        activo: true
      };

      setRendimientos([...rendimientos, nuevoRegistro]);
      setNewRendimiento({
        id_servicio: '',
        cod_turno: 'M4',
        pacientes_por_hora: 1,
        minutos_intervalo: 60
      });
      setShowModal(false);
      setMessage({ type: 'success', text: 'Rendimiento agregado exitosamente' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error al agregar:', err);
      setMessage({ type: 'error', text: 'Error al agregar el rendimiento' });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Eliminar rendimiento
  // ============================================================
  const handleEliminar = async (id) => {
    if (window.confirm('¿Desea eliminar este rendimiento?')) {
      setSaving(true);
      try {
        // TODO: Reemplazar con API call real
        setRendimientos(prev => prev.filter(r => r.id !== id));
        setMessage({ type: 'success', text: 'Rendimiento eliminado exitosamente' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        console.error('Error al eliminar:', err);
        setMessage({ type: 'error', text: 'Error al eliminar el rendimiento' });
      } finally {
        setSaving(false);
      }
    }
  };

  // ============================================================
  // Render
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando rendimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Rendimiento Horario</h1>
        </div>
        <p className="text-gray-600">Gestiona la capacidad de atención (pacientes/hora) por servicio</p>
      </div>

      {/* Mensaje */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por servicio o turno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Rendimiento
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Turno</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Pacientes/Hora</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Minutos Intervalo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rendimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No hay rendimientos registrados
                  </td>
                </tr>
              ) : (
                rendimientosFiltrados.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{r.nombre_servicio}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                        {r.cod_turno}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingId === r.id ? (
                        <input
                          type="number"
                          min="1"
                          value={editValues.pacientes_por_hora}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              pacientes_por_hora: parseInt(e.target.value) || 1
                            })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{r.pacientes_por_hora}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingId === r.id ? (
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={editValues.minutos_intervalo}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              minutos_intervalo: parseInt(e.target.value) || 5
                            })
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">{r.minutos_intervalo} min</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === r.id ? (
                          <>
                            <button
                              onClick={() => guardarEdicion(r.id)}
                              disabled={saving}
                              className="text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={cancelarEdicion}
                              disabled={saving}
                              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => iniciarEdicion(r)}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEliminar(r.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agregar Rendimiento</h2>

            <div className="space-y-4">
              {/* Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                <select
                  value={newRendimiento.id_servicio}
                  onChange={(e) => setNewRendimiento({ ...newRendimiento, id_servicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar servicio...</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Turno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Turno</label>
                <select
                  value={newRendimiento.cod_turno}
                  onChange={(e) => setNewRendimiento({ ...newRendimiento, cod_turno: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposturno.map(t => (
                    <option key={t.cod} value={t.cod}>{t.desc}</option>
                  ))}
                </select>
              </div>

              {/* Pacientes por hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pacientes/Hora</label>
                <input
                  type="number"
                  min="1"
                  value={newRendimiento.pacientes_por_hora}
                  onChange={(e) => setNewRendimiento({ ...newRendimiento, pacientes_por_hora: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Minutos intervalo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minutos Intervalo</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newRendimiento.minutos_intervalo}
                  onChange={(e) => setNewRendimiento({ ...newRendimiento, minutos_intervalo: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarRendimiento}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

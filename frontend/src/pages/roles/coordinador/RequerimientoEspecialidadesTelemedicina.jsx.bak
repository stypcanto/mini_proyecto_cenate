// ========================================================================
// RequerimientoEspecialidadesTelemedicina.jsx - Formulario mensual
// ------------------------------------------------------------------------
// Las IPRESS solicitan turnos por especialidad cada mes
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Save,
  Send,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  X
} from 'lucide-react';
import { solicitudTurnosService } from '../../../services/solicitudTurnosService';
import { especialidadService } from '../../../services/especialidadService';
import { useAuth } from '../../../context/AuthContext';

export default function RequerimientoEspecialidadesTelemedicina() {
  const { user } = useAuth();
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [periodoDescripcion, setPeriodoDescripcion] = useState('');
  const [solicitudExistente, setSolicitudExistente] = useState(null);
  const [formData, setFormData] = useState({
    observacionesGenerales: '',
    detalles: {}
  });
  const [viewMode, setViewMode] = useState(null);

  // ============================================================
  // Cargar especialidades con médicos activos
  // ============================================================
  useEffect(() => {
    loadEspecialidades();
    generarProximoPeriodo();
  }, []);

  const loadEspecialidades = async () => {
    setLoading(true);
    try {
      const data = await especialidadService.obtenerConMedicosActivos();
      setEspecialidades(data);
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
      alert('Error al cargar las especialidades disponibles');
    } finally {
      setLoading(false);
    }
  };

  const generarProximoPeriodo = () => {
    // Generar periodo para febrero 2026 en adelante
    const fecha = new Date(2026, 1, 1); // Febrero 2026
    const periodo = solicitudTurnosService.generarCodigoPeriodo(fecha);
    const descripcion = solicitudTurnosService.generarDescripcionPeriodo(fecha);
    setSelectedPeriodo(periodo);
    setPeriodoDescripcion(descripcion);
  };

  // ============================================================
  // Cargar solicitud existente cuando cambia periodo
  // ============================================================
  useEffect(() => {
    if (selectedPeriodo && user?.idIpress) {
      cargarSolicitudExistente();
    }
  }, [selectedPeriodo, user]);

  const cargarSolicitudExistente = async () => {
    try {
      const solicitud = await solicitudTurnosService.obtenerPorPeriodoYIpress(
        selectedPeriodo,
        user.idIpress
      );
      setSolicitudExistente(solicitud);

      // Cargar datos en formulario
      setFormData({
        observacionesGenerales: solicitud.observacionesGenerales || '',
        detalles: solicitud.detalles.reduce((acc, det) => {
          acc[det.idServicio] = {
            cantidadTurnos: det.cantidadTurnos,
            observaciones: det.observaciones || '',
            horarioPreferido: det.horarioPreferido || 'CUALQUIERA'
          };
          return acc;
        }, {})
      });
    } catch (err) {
      // No existe, dejar formulario vacío
      setSolicitudExistente(null);
      setFormData({
        observacionesGenerales: '',
        detalles: {}
      });
    }
  };

  // ============================================================
  // Handlers
  // ============================================================
  const handleEspecialidadChange = (idServicio, field, value) => {
    setFormData(prev => ({
      ...prev,
      detalles: {
        ...prev.detalles,
        [idServicio]: {
          ...(prev.detalles[idServicio] || {}),
          [field]: value,
          cantidadTurnos: field === 'cantidadTurnos' ? parseInt(value) || 0 : (prev.detalles[idServicio]?.cantidadTurnos || 0)
        }
      }
    }));
  };

  const handleGuardar = async () => {
    // Validar que al menos una especialidad tenga turnos
    const tieneEspecialidades = Object.values(formData.detalles).some(
      det => (det.cantidadTurnos || 0) > 0
    );

    if (!tieneEspecialidades) {
      alert('Debe solicitar al menos una especialidad con cantidad mayor a 0');
      return;
    }

    setSaving(true);
    try {
      const detalles = Object.entries(formData.detalles)
        .filter(([_, det]) => (det.cantidadTurnos || 0) > 0)
        .map(([idServicio, det]) => ({
          idServicio: parseInt(idServicio),
          cantidadTurnos: det.cantidadTurnos,
          observaciones: det.observaciones,
          horarioPreferido: det.horarioPreferido || 'CUALQUIERA'
        }));

      const request = {
        periodo: selectedPeriodo,
        idIpress: user.idIpress,
        observacionesGenerales: formData.observacionesGenerales,
        detalles
      };

      await solicitudTurnosService.guardarSolicitud(request);
      alert('Solicitud guardada como borrador exitosamente');
      cargarSolicitudExistente();
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error al guardar la solicitud');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!solicitudExistente) {
      alert('Primero debe guardar la solicitud como borrador');
      return;
    }

    if (!window.confirm('¿Está seguro de enviar esta solicitud? No podrá modificarla después.')) {
      return;
    }

    setSaving(true);
    try {
      await solicitudTurnosService.enviarSolicitud(solicitudExistente.idSolicitud);
      alert('Solicitud enviada exitosamente');
      cargarSolicitudExistente();
    } catch (err) {
      console.error('Error al enviar:', err);
      alert('Error al enviar la solicitud');
    } finally {
      setSaving(false);
    }
  };

  const totalTurnosSolicitados = Object.values(formData.detalles)
    .reduce((sum, det) => sum + (det.cantidadTurnos || 0), 0);

  const especialidadesSeleccionadas = Object.values(formData.detalles)
    .filter(det => (det.cantidadTurnos || 0) > 0).length;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Calendar className="w-7 h-7 text-[#0A5BA9]" />
              Requerimiento Esp. Telemedicina
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Solicitud mensual de turnos por especialidad - {periodoDescripcion}
            </p>
          </div>
          {solicitudExistente && (
            <div className="flex items-center gap-2">
              {solicitudExistente.estado === 'BORRADOR' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Borrador
                </span>
              )}
              {solicitudExistente.estado === 'ENVIADO' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Enviado
                </span>
              )}
              {solicitudExistente.estado === 'APROBADO' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Aprobado
                </span>
              )}
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Especialidades</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{especialidadesSeleccionadas}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Turnos</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totalTurnosSolicitados}</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-slate-400">Periodo</p>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-400 font-mono">{selectedPeriodo}</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
          <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando especialidades...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Especialidades Disponibles
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {especialidades.map((esp) => (
                <div
                  key={esp.idServicio}
                  className="p-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl hover:border-[#0A5BA9] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={(formData.detalles[esp.idServicio]?.cantidadTurnos || 0) > 0}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          handleEspecialidadChange(esp.idServicio, 'cantidadTurnos', 0);
                        }
                      }}
                      className="w-5 h-5 text-[#0A5BA9] rounded"
                      disabled={solicitudExistente?.estado !== 'BORRADOR' && solicitudExistente?.estado !== undefined}
                    />
                    <label className="text-sm font-semibold text-slate-800 dark:text-white">
                      {esp.descripcion}
                    </label>
                  </div>

                  {((formData.detalles[esp.idServicio]?.cantidadTurnos || 0) > 0 ||
                    !solicitudExistente || solicitudExistente.estado === 'BORRADOR') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-8">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Cantidad de Turnos *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.detalles[esp.idServicio]?.cantidadTurnos || ''}
                          onChange={(e) => handleEspecialidadChange(esp.idServicio, 'cantidadTurnos', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                          placeholder="0"
                          disabled={solicitudExistente?.estado !== 'BORRADOR' && solicitudExistente?.estado !== undefined}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Horario Preferido
                        </label>
                        <select
                          value={formData.detalles[esp.idServicio]?.horarioPreferido || 'CUALQUIERA'}
                          onChange={(e) => handleEspecialidadChange(esp.idServicio, 'horarioPreferido', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                          disabled={solicitudExistente?.estado !== 'BORRADOR' && solicitudExistente?.estado !== undefined}
                        >
                          <option value="CUALQUIERA">Cualquiera</option>
                          <option value="MAÑANA">Mañana</option>
                          <option value="TARDE">Tarde</option>
                          <option value="NOCHE">Noche</option>
                        </select>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Observaciones
                        </label>
                        <input
                          type="text"
                          value={formData.detalles[esp.idServicio]?.observaciones || ''}
                          onChange={(e) => handleEspecialidadChange(esp.idServicio, 'observaciones', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                          placeholder="Opcional"
                          disabled={solicitudExistente?.estado !== 'BORRADOR' && solicitudExistente?.estado !== undefined}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Observaciones Generales */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Observaciones Generales
              </label>
              <textarea
                value={formData.observacionesGenerales}
                onChange={(e) => setFormData({ ...formData, observacionesGenerales: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl resize-none"
                rows={3}
                placeholder="Comentarios adicionales sobre la solicitud..."
                disabled={solicitudExistente?.estado !== 'BORRADOR' && solicitudExistente?.estado !== undefined}
              />
            </div>

            {/* Botones de Acción */}
            {(!solicitudExistente || solicitudExistente.estado === 'BORRADOR') && (
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleGuardar}
                  className="px-5 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Guardar Borrador
                </button>
                {solicitudExistente && (
                  <button
                    onClick={handleEnviar}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Enviar Solicitud
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

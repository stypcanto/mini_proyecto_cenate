// ========================================================================
// FormularioSolicitudTurnos.jsx - Formulario de Solicitud de Turnos
// ------------------------------------------------------------------------
// Permite a usuarios IPRESS solicitar turnos de telemedicina por especialidad
// ========================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Save,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  RefreshCw
} from 'lucide-react';
import { periodoSolicitudService } from '../../../services/periodoSolicitudService';
import { solicitudTurnoService } from '../../../services/solicitudTurnoService';

export default function FormularioSolicitudTurnos() {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Datos del usuario (auto-detectados)
  const [miIpress, setMiIpress] = useState(null);

  // Periodos disponibles
  const [periodosVigentes, setPeriodosVigentes] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);

  // Especialidades y turnos
  const [especialidades, setEspecialidades] = useState([]);
  const [turnosPorEspecialidad, setTurnosPorEspecialidad] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  // Solicitud actual (si existe)
  const [solicitudActual, setSolicitudActual] = useState(null);

  // ============================================================
  // Cargar datos iniciales
  // ============================================================
  const cargarDatosIniciales = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar datos en paralelo
      const [ipressData, periodosData, especialidadesData] = await Promise.all([
        solicitudTurnoService.obtenerMiIpress(),
        periodoSolicitudService.obtenerVigentes(),
        solicitudTurnoService.obtenerEspecialidadesCenate()
      ]);

      setMiIpress(ipressData);
      setPeriodosVigentes(periodosData);
      setEspecialidades(especialidadesData);

      // Inicializar turnos por especialidad
      const turnosInit = {};
      especialidadesData.forEach(esp => {
        turnosInit[esp.idServicio] = {
          turnosSolicitados: 0,
          turnoPreferente: '',
          diaPreferente: '',
          observacion: ''
        };
      });
      setTurnosPorEspecialidad(turnosInit);

      // Si hay un solo periodo vigente, seleccionarlo automaticamente
      if (periodosData.length === 1) {
        setPeriodoSeleccionado(periodosData[0]);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // ============================================================
  // Cargar solicitud existente cuando se selecciona periodo
  // ============================================================
  useEffect(() => {
    const cargarSolicitudExistente = async () => {
      if (!periodoSeleccionado) return;

      try {
        const solicitud = await solicitudTurnoService.obtenerMiSolicitud(periodoSeleccionado.idPeriodo);

        if (solicitud) {
          setSolicitudActual(solicitud);

          // Cargar los detalles en el formulario
          const turnosActualizados = { ...turnosPorEspecialidad };
          solicitud.detalles?.forEach(detalle => {
            if (turnosActualizados[detalle.idServicio]) {
              turnosActualizados[detalle.idServicio] = {
                turnosSolicitados: detalle.turnosSolicitados || 0,
                turnoPreferente: detalle.turnoPreferente || '',
                diaPreferente: detalle.diaPreferente || '',
                observacion: detalle.observacion || ''
              };
            }
          });
          setTurnosPorEspecialidad(turnosActualizados);
        } else {
          setSolicitudActual(null);
          // Resetear formulario
          const turnosReset = {};
          especialidades.forEach(esp => {
            turnosReset[esp.idServicio] = {
              turnosSolicitados: 0,
              turnoPreferente: '',
              diaPreferente: '',
              observacion: ''
            };
          });
          setTurnosPorEspecialidad(turnosReset);
        }
      } catch (err) {
        console.error('Error al cargar solicitud existente:', err);
      }
    };

    cargarSolicitudExistente();
  }, [periodoSeleccionado, especialidades]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleTurnosChange = (idServicio, field, value) => {
    setTurnosPorEspecialidad(prev => ({
      ...prev,
      [idServicio]: {
        ...prev[idServicio],
        [field]: field === 'turnosSolicitados' ? Math.max(0, parseInt(value) || 0) : value
      }
    }));
  };

  const toggleSection = (idServicio) => {
    setExpandedSections(prev => ({
      ...prev,
      [idServicio]: !prev[idServicio]
    }));
  };

  const handleGuardarBorrador = async () => {
    if (!periodoSeleccionado) {
      setError('Debes seleccionar un periodo');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const detalles = solicitudTurnoService.prepararDetalles(turnosPorEspecialidad);
      const solicitudData = {
        idPeriodo: periodoSeleccionado.idPeriodo,
        detalles
      };

      const resultado = await solicitudTurnoService.guardarBorrador(solicitudData);
      setSolicitudActual(resultado);
      setSuccess('Borrador guardado exitosamente');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error al guardar borrador:', err);
      setError(err.message || 'Error al guardar el borrador');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviar = async () => {
    if (!periodoSeleccionado) {
      setError('Debes seleccionar un periodo');
      return;
    }

    const totalTurnos = solicitudTurnoService.calcularTotalTurnos(turnosPorEspecialidad);
    if (totalTurnos === 0) {
      setError('Debes solicitar al menos un turno antes de enviar');
      return;
    }

    // Confirmar envio
    if (!window.confirm('¿Estas seguro de enviar la solicitud? Una vez enviada, no podras modificarla.')) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Primero guardar, luego enviar
      const detalles = solicitudTurnoService.prepararDetalles(turnosPorEspecialidad);
      const solicitudData = {
        idPeriodo: periodoSeleccionado.idPeriodo,
        detalles
      };

      const guardado = await solicitudTurnoService.guardarBorrador(solicitudData);
      const enviado = await solicitudTurnoService.enviar(guardado.idSolicitud);

      setSolicitudActual(enviado);
      setSuccess('Solicitud enviada exitosamente. El coordinador revisara tu solicitud.');
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      setError(err.message || 'Error al enviar la solicitud');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Calculos
  // ============================================================
  const totalTurnos = solicitudTurnoService.calcularTotalTurnos(turnosPorEspecialidad);
  const especialidadesConTurnos = Object.values(turnosPorEspecialidad).filter(t => t.turnosSolicitados > 0).length;

  const esSoloLectura = solicitudActual?.estado === 'ENVIADO' || solicitudActual?.estado === 'REVISADO';

  // ============================================================
  // Render
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0A5BA9]" />
        <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Solicitud de Turnos por Telemedicina</h1>
        </div>
        <p className="text-blue-100">
          Complete el formulario para solicitar turnos de telemedicina para su IPRESS
        </p>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Datos del Usuario (Auto-detectados) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0A5BA9]" />
          Datos de Contacto
          <span className="text-xs font-normal text-slate-500 ml-2">(auto-detectados de su perfil)</span>
        </h2>

        {miIpress ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
                <Building2 className="w-4 h-4" />
                Red / IPRESS
              </div>
              <p className="font-semibold text-slate-800 dark:text-white">
                {miIpress.nombreRed || 'Sin Red'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {miIpress.nombreIpress || 'Sin IPRESS'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
                <User className="w-4 h-4" />
                Coordinador de Telesalud
              </div>
              <p className="font-semibold text-slate-800 dark:text-white">
                {miIpress.nombreCompleto || 'N/A'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                DNI: {miIpress.dniUsuario || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
                <Mail className="w-4 h-4" />
                Contacto
              </div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">
                {miIpress.emailContacto || 'Sin email'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {miIpress.telefonoContacto || 'Sin telefono'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500">
            No se encontraron datos de IPRESS asociados a su cuenta
          </div>
        )}

        {miIpress && !miIpress.datosCompletos && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-800 dark:text-yellow-300 text-sm flex items-center gap-2">
            <Info className="w-4 h-4" />
            {miIpress.mensajeValidacion}
          </div>
        )}
      </div>

      {/* Seleccion de Periodo */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0A5BA9]" />
          Periodo de Solicitud
        </h2>

        {periodosVigentes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay periodos de solicitud activos en este momento.</p>
            <p className="text-sm">Por favor, vuelva mas tarde.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <select
              value={periodoSeleccionado?.idPeriodo || ''}
              onChange={(e) => {
                const periodo = periodosVigentes.find(p => p.idPeriodo === parseInt(e.target.value));
                setPeriodoSeleccionado(periodo);
              }}
              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
              disabled={esSoloLectura}
            >
              <option value="">Seleccione un periodo...</option>
              {periodosVigentes.map(periodo => (
                <option key={periodo.idPeriodo} value={periodo.idPeriodo}>
                  {periodo.descripcion} ({periodo.periodo})
                </option>
              ))}
            </select>

            {periodoSeleccionado && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">Vigencia del periodo</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {new Date(periodoSeleccionado.fechaInicio).toLocaleDateString('es-PE', { dateStyle: 'long' })}
                  {' - '}
                  {new Date(periodoSeleccionado.fechaFin).toLocaleDateString('es-PE', { dateStyle: 'long' })}
                </p>
                {periodoSeleccionado.instrucciones && (
                  <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 italic">
                    {periodoSeleccionado.instrucciones}
                  </p>
                )}
              </div>
            )}

            {solicitudActual && (
              <div className={`p-4 rounded-xl ${
                solicitudActual.estado === 'ENVIADO' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                solicitudActual.estado === 'REVISADO' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300' :
                'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">
                    {solicitudActual.estado === 'ENVIADO' ? 'Solicitud enviada' :
                     solicitudActual.estado === 'REVISADO' ? 'Solicitud revisada' :
                     'Borrador guardado'}
                  </span>
                </div>
                {solicitudActual.fechaEnvio && (
                  <p className="text-sm mt-1">
                    Enviada el {new Date(solicitudActual.fechaEnvio).toLocaleDateString('es-PE', { dateStyle: 'long' })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Especialidades */}
      {periodoSeleccionado && especialidades.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0A5BA9]" />
              Turnos por Especialidad
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                <strong className="text-[#0A5BA9]">{especialidadesConTurnos}</strong> especialidades
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                <strong className="text-[#0A5BA9]">{totalTurnos}</strong> turnos totales
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {especialidades.map(esp => {
              const datos = turnosPorEspecialidad[esp.idServicio] || {};
              const isExpanded = expandedSections[esp.idServicio];
              const tieneTurnos = datos.turnosSolicitados > 0;

              return (
                <div
                  key={esp.idServicio}
                  className={`border-2 rounded-xl transition-all ${
                    tieneTurnos
                      ? 'border-[#0A5BA9] bg-blue-50/50 dark:bg-blue-900/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Header de especialidad */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        {esp.descServicio}
                      </h3>
                      {esp.codServicio && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Codigo: {esp.codServicio}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Input de turnos */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600 dark:text-slate-400">Turnos:</label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={datos.turnosSolicitados || 0}
                          onChange={(e) => handleTurnosChange(esp.idServicio, 'turnosSolicitados', e.target.value)}
                          className="w-20 px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center font-semibold focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
                          disabled={esSoloLectura}
                        />
                      </div>

                      {/* Boton expandir */}
                      <button
                        onClick={() => toggleSection(esp.idServicio)}
                        className="p-2 text-slate-500 hover:text-[#0A5BA9] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title={isExpanded ? 'Ocultar detalles' : 'Mostrar detalles'}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Turno preferente
                          </label>
                          <select
                            value={datos.turnoPreferente || ''}
                            onChange={(e) => handleTurnosChange(esp.idServicio, 'turnoPreferente', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                            disabled={esSoloLectura}
                          >
                            <option value="">Sin preferencia</option>
                            <option value="Mañana">Mañana</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Cualquiera">Cualquiera</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Dias preferentes
                          </label>
                          <input
                            type="text"
                            value={datos.diaPreferente || ''}
                            onChange={(e) => handleTurnosChange(esp.idServicio, 'diaPreferente', e.target.value)}
                            placeholder="Ej: Lunes, Miercoles"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                            disabled={esSoloLectura}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Observacion
                          </label>
                          <input
                            type="text"
                            value={datos.observacion || ''}
                            onChange={(e) => handleTurnosChange(esp.idServicio, 'observacion', e.target.value)}
                            placeholder="Opcional"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                            disabled={esSoloLectura}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumen y Acciones */}
      {periodoSeleccionado && !esSoloLectura && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-slate-600 dark:text-slate-400">
                Total de turnos solicitados: <strong className="text-2xl text-[#0A5BA9]">{totalTurnos}</strong>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                en {especialidadesConTurnos} especialidades
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGuardarBorrador}
                disabled={saving}
                className="px-5 py-2.5 border-2 border-[#0A5BA9] text-[#0A5BA9] font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Guardar Borrador
              </button>

              <button
                onClick={handleEnviar}
                disabled={saving || totalTurnos === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje si ya envio */}
      {esSoloLectura && (
        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            Solicitud {solicitudActual?.estado === 'REVISADO' ? 'Revisada' : 'Enviada'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {solicitudActual?.estado === 'REVISADO'
              ? 'Tu solicitud ha sido revisada por el coordinador.'
              : 'Tu solicitud ha sido enviada y esta pendiente de revision.'}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Total solicitado: {solicitudActual?.totalTurnosSolicitados || totalTurnos} turnos
          </p>
        </div>
      )}
    </div>
  );
}

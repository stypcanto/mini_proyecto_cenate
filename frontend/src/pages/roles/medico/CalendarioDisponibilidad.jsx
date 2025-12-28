import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, Send, Save, AlertCircle, Info } from 'lucide-react';
import disponibilidadService from '../../../services/disponibilidadService';
import api from '../../../services/apiClient';

/**
 * 📅 Componente de Calendario de Disponibilidad para Médicos
 *
 * Permite al médico:
 * - Seleccionar periodo (mes/año)
 * - Seleccionar especialidad
 * - Marcar turnos por día (M, T, MT)
 * - Ver contador de horas en tiempo real
 * - Guardar borrador
 * - Enviar para revisión (si cumple 150 horas)
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
const CalendarioDisponibilidad = () => {
  // ==========================================================
  // ESTADOS
  // ==========================================================
  const [periodo, setPeriodo] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [especialidades, setEspecialidades] = useState([]);
  const [turnos, setTurnos] = useState({}); // { '2026-01-15': 'M', '2026-01-16': 'T' }
  const [totalHoras, setTotalHoras] = useState(0);
  const [horasRequeridas] = useState(150);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [diasDelMes, setDiasDelMes] = useState([]);
  const [regimenLaboral, setRegimenLaboral] = useState(null);
  const [observaciones, setObservaciones] = useState('');

  // Horas por turno según régimen
  const [horasPorTurno, setHorasPorTurno] = useState({
    M: 4,
    T: 4,
    MT: 8
  });

  // ==========================================================
  // EFECTOS
  // ==========================================================

  // Inicializar periodo actual
  useEffect(() => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    setPeriodo(`${year}${month}`);
  }, []);

  // Cargar especialidades del médico
  useEffect(() => {
    cargarEspecialidades();
    cargarRegimenLaboral();
  }, []);

  // Generar días del mes cuando cambia el periodo
  useEffect(() => {
    if (periodo) {
      generarDiasDelMes();
    }
  }, [periodo]);

  // Cargar disponibilidad cuando cambia periodo o especialidad
  useEffect(() => {
    if (periodo && especialidad) {
      cargarDisponibilidad();
    }
  }, [periodo, especialidad]);

  // Calcular total de horas cuando cambian los turnos
  useEffect(() => {
    calcularTotalHoras();
  }, [turnos, horasPorTurno]);

  // ==========================================================
  // FUNCIONES DE CARGA
  // ==========================================================

  const cargarEspecialidades = async () => {
    try {
      // Obtener especialidades del médico desde su perfil
      const response = await api.get('/personal/mi-perfil');
      const personal = response;

      // Obtener especialidades activas
      const especialidadesResponse = await api.get('/especialidades/activas');

      // Filtrar solo las especialidades del médico
      // (en producción, esto debería venir del backend filtrado)
      setEspecialidades(especialidadesResponse);
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
      // Fallback: cargar todas las especialidades
      try {
        const response = await api.get('/especialidades/activas');
        setEspecialidades(response);
      } catch (err) {
        console.error('Error en fallback:', err);
      }
    }
  };

  const cargarRegimenLaboral = async () => {
    try {
      const response = await api.get('/personal/mi-perfil');
      const personal = response;

      if (personal.regimenLaboral) {
        setRegimenLaboral(personal.regimenLaboral);

        // Determinar horas por turno según régimen
        const descRegimen = personal.regimenLaboral.toUpperCase();
        if (descRegimen.includes('LOCADOR')) {
          setHorasPorTurno({ M: 6, T: 6, MT: 12 });
        } else {
          setHorasPorTurno({ M: 4, T: 4, MT: 8 });
        }
      }
    } catch (error) {
      console.error('Error al cargar régimen laboral:', error);
    }
  };

  const cargarDisponibilidad = async () => {
    setLoading(true);
    try {
      const data = await disponibilidadService.obtenerMiDisponibilidad(periodo, especialidad);

      if (data) {
        setDisponibilidad(data);
        setObservaciones(data.observaciones || '');

        // Cargar turnos
        const turnosMap = {};
        if (data.detalles) {
          data.detalles.forEach(detalle => {
            turnosMap[detalle.fecha] = detalle.turno;
          });
        }
        setTurnos(turnosMap);

        // Actualizar horas por turno del backend (por si acaso)
        if (data.horasPorTurnoManana) {
          setHorasPorTurno({
            M: Number(data.horasPorTurnoManana),
            T: Number(data.horasPorTurnoTarde),
            MT: Number(data.horasPorTurnoCompleto)
          });
        }
      } else {
        // No existe disponibilidad, resetear
        setDisponibilidad(null);
        setTurnos({});
        setObservaciones('');
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarDiasDelMes = () => {
    if (!periodo || periodo.length !== 6) return;

    const year = parseInt(periodo.substring(0, 4));
    const month = parseInt(periodo.substring(4, 6)) - 1;

    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const dias = [];

    // Agregar días vacíos al inicio para alinear el calendario
    const diaSemanaInicio = primerDia.getDay();
    const diasVaciosInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;

    for (let i = 0; i < diasVaciosInicio; i++) {
      dias.push(null);
    }

    // Agregar todos los días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(year, month, dia);
      dias.push(fecha);
    }

    setDiasDelMes(dias);
  };

  // ==========================================================
  // FUNCIONES DE CÁLCULO
  // ==========================================================

  const calcularTotalHoras = () => {
    let total = 0;
    Object.values(turnos).forEach(turno => {
      total += horasPorTurno[turno] || 0;
    });
    setTotalHoras(total);
  };

  const getPorcentajeCumplimiento = () => {
    return Math.min((totalHoras / horasRequeridas) * 100, 100);
  };

  const cumpleMinimo = () => {
    return totalHoras >= horasRequeridas;
  };

  // ==========================================================
  // FUNCIONES DE INTERACCIÓN
  // ==========================================================

  const handleDayClick = (fecha) => {
    if (!fecha) return;

    // No permitir editar si está REVISADO
    if (disponibilidad?.estado === 'REVISADO') {
      window.alert('Esta disponibilidad ya fue revisada y no puede modificarse.');
      return;
    }

    const fechaStr = formatearFecha(fecha);
    const turnoActual = turnos[fechaStr];

    // Rotar: null -> M -> T -> MT -> null
    let nuevoTurno;
    if (!turnoActual) {
      nuevoTurno = 'M';
    } else if (turnoActual === 'M') {
      nuevoTurno = 'T';
    } else if (turnoActual === 'T') {
      nuevoTurno = 'MT';
    } else {
      nuevoTurno = null;
    }

    setTurnos(prev => {
      const updated = { ...prev };
      if (nuevoTurno) {
        updated[fechaStr] = nuevoTurno;
      } else {
        delete updated[fechaStr];
      }
      return updated;
    });
  };

  const handleGuardarBorrador = async () => {
    if (!especialidad) {
      window.alert('Por favor seleccione una especialidad');
      return;
    }

    setGuardando(true);
    try {
      // Convertir turnos a formato backend
      const detalles = Object.entries(turnos).map(([fecha, turno]) => ({
        fecha,
        turno
      }));

      const request = {
        periodo,
        idEspecialidad: parseInt(especialidad),
        observaciones,
        detalles
      };

      const response = await disponibilidadService.guardarBorrador(request);
      setDisponibilidad(response);
      window.alert('Borrador guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar borrador:', error);
      window.alert(error.response?.data?.message || 'Error al guardar borrador');
    } finally {
      setGuardando(false);
    }
  };

  const handleEnviar = async () => {
    if (!disponibilidad?.idDisponibilidad) {
      window.alert('Primero debe guardar el borrador');
      return;
    }

    if (!cumpleMinimo()) {
      window.alert(`Debe completar al menos ${horasRequeridas} horas. Actualmente tiene ${totalHoras} horas.`);
      return;
    }

    if (!window.confirm('¿Está seguro de enviar su disponibilidad? Una vez enviada, el coordinador la revisará.')) {
      return;
    }

    setGuardando(true);
    try {
      const response = await disponibilidadService.enviar(disponibilidad.idDisponibilidad);
      setDisponibilidad(response);
      window.alert('Disponibilidad enviada exitosamente');
    } catch (error) {
      console.error('Error al enviar disponibilidad:', error);
      window.alert(error.response?.data?.message || 'Error al enviar disponibilidad');
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================================
  // FUNCIONES AUXILIARES
  // ==========================================================

  const formatearFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNombreMes = () => {
    if (!periodo || periodo.length !== 6) return '';
    const year = periodo.substring(0, 4);
    const month = parseInt(periodo.substring(4, 6));
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[month - 1]} ${year}`;
  };

  const getTurnoColor = (turno) => {
    switch (turno) {
      case 'M': return 'bg-green-100 text-green-800 border-green-300';
      case 'T': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MT': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-white text-gray-700 border-gray-200';
    }
  };

  const getTurnoNombre = (turno) => {
    switch (turno) {
      case 'M': return 'Mañana';
      case 'T': return 'Tarde';
      case 'MT': return 'Completo';
      default: return '';
    }
  };

  const getColorBarra = () => {
    const porcentaje = getPorcentajeCumplimiento();
    if (porcentaje >= 100) return 'bg-green-500';
    if (porcentaje >= 66) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const puedeEditar = () => {
    return !disponibilidad || disponibilidad.estado === 'BORRADOR' || disponibilidad.estado === 'ENVIADO';
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mi Disponibilidad de Turnos</h1>
                <p className="text-gray-600">Gestiona tus turnos mensuales (mínimo 150 horas)</p>
              </div>
            </div>

            {/* Badge de estado */}
            {disponibilidad && (
              <div>
                {disponibilidad.estado === 'BORRADOR' && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    Borrador
                  </span>
                )}
                {disponibilidad.estado === 'ENVIADO' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Enviado
                  </span>
                )}
                {disponibilidad.estado === 'REVISADO' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Revisado
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selectores */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selector de periodo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodo
              </label>
              <input
                type="month"
                value={periodo ? `${periodo.substring(0, 4)}-${periodo.substring(4, 6)}` : ''}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setPeriodo(`${year}${month}`);
                }}
                disabled={disponibilidad?.estado === 'REVISADO'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Selector de especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidad
              </label>
              <select
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                disabled={disponibilidad?.estado === 'REVISADO'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione una especialidad</option>
                {especialidades.map(esp => (
                  <option key={esp.idServicio} value={esp.idServicio}>
                    {esp.descServicio}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Información de régimen */}
          {regimenLaboral && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Régimen Laboral: {regimenLaboral}</p>
                  <p className="text-blue-700">
                    Horas por turno: Mañana = {horasPorTurno.M}h, Tarde = {horasPorTurno.T}h, Completo = {horasPorTurno.MT}h
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contador de horas */}
        {especialidad && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="text-lg font-medium text-gray-900">Total de Horas</span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{totalHoras} h</p>
                  <p className="text-sm text-gray-600">de {horasRequeridas} h requeridas</p>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getColorBarra()}`}
                    style={{ width: `${getPorcentajeCumplimiento()}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {getPorcentajeCumplimiento().toFixed(1)}% completado
                </p>
              </div>

              {/* Alertas */}
              {!cumpleMinimo() && totalHoras > 0 && (
                <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Faltan {horasRequeridas - totalHoras} horas para completar el mínimo requerido.
                  </p>
                </div>
              )}

              {cumpleMinimo() && (
                <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-800">
                    ¡Excelente! Has completado el mínimo de horas requeridas.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendario */}
        {especialidad && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{getNombreMes()}</h2>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-sm text-gray-700">Mañana ({horasPorTurno.M}h)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span className="text-sm text-gray-700">Tarde ({horasPorTurno.T}h)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-100 border-2 border-purple-300 rounded"></div>
                <span className="text-sm text-gray-700">Completo ({horasPorTurno.MT}h)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Clic para rotar turnos</span>
              </div>
            </div>

            {/* Grid del calendario */}
            <div className="grid grid-cols-7 gap-2">
              {/* Cabecera de días */}
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
                <div key={dia} className="text-center text-sm font-medium text-gray-600 py-2">
                  {dia}
                </div>
              ))}

              {/* Días del mes */}
              {diasDelMes.map((fecha, index) => {
                if (!fecha) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const fechaStr = formatearFecha(fecha);
                const turno = turnos[fechaStr];
                const esHoy = new Date().toDateString() === fecha.toDateString();

                return (
                  <button
                    key={fechaStr}
                    onClick={() => handleDayClick(fecha)}
                    disabled={!puedeEditar()}
                    className={`
                      aspect-square border-2 rounded-lg p-2 transition-all
                      ${getTurnoColor(turno)}
                      ${esHoy ? 'ring-2 ring-blue-500' : ''}
                      ${puedeEditar() ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-60'}
                      flex flex-col items-center justify-center
                    `}
                  >
                    <span className="text-sm font-medium">{fecha.getDate()}</span>
                    {turno && (
                      <span className="text-xs font-semibold mt-1">
                        {getTurnoNombre(turno)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {especialidad && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={!puedeEditar()}
              rows={3}
              placeholder="Agregue cualquier observación sobre su disponibilidad..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Botones de acción */}
        {especialidad && puedeEditar() && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleGuardarBorrador}
                disabled={guardando}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                <span>{guardando ? 'Guardando...' : 'Guardar Borrador'}</span>
              </button>

              <button
                onClick={handleEnviar}
                disabled={guardando || !cumpleMinimo() || !disponibilidad}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
                <span>{guardando ? 'Enviando...' : 'Enviar para Revisión'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarioDisponibilidad;

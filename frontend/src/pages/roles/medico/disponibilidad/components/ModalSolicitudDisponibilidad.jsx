// ========================================================================
// ModalSolicitudDisponibilidad.jsx
// ========================================================================
// Modal para registrar/editar disponibilidad del médico
// Incluye calendario y selector de turnos

import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal, Button, Space, Alert, Spin, message, Empty, Card, Badge, Tag,
  Divider, Tooltip, Select
} from 'antd';
import {
  ChevronLeft, ChevronRight, X, Check, Plus, Minus
} from 'lucide-react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isWeekend, isBefore, isAfter,
  isSameMonth, getDaysInMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import horarioService from '../../../../../services/horarioService';

/**
 * Modal para registrar disponibilidad
 * @param {boolean} open - Si el modal está abierto
 * @param {function} onClose - Callback al cerrar
 * @param {object} periodo - Período seleccionado
 * @param {string} mode - 'crear' o 'editar'
 * @param {object} solicitudExistente - Solicitud a editar (si aplica)
 * @param {function} onGuardar - Callback al guardar
 */
export default function ModalSolicitudDisponibilidad({
  open,
  onClose,
  periodo,
  mode = 'crear',
  solicitudExistente = null,
  onGuardar
}) {
  // ============== ESTADOS ==============
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState(new Map()); // Map<fecha, turno>
  const [horarios, setHorarios] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  // ============== EFECTOS ==============
  useEffect(() => {
    if (open) {
      cargarHorarios();
      if (mode === 'editar' && solicitudExistente) {
        cargarDetallesSolicitud();
      } else {
        // Inicializar con mes del período
        if (periodo?.fechaInicio) {
          setCurrentMonth(new Date(periodo.fechaInicio));
        }
        setTurnoSeleccionado(null);
      }
    }
  }, [open, mode, periodo, solicitudExistente]);

  // ============== FUNCIONES ==============

  const cargarHorarios = async () => {
    try {
      setLoadingHorarios(true);
      const data = await horarioService.obtenerTodos();
      setHorarios(Array.isArray(data) ? data : []);
      if (data && data.length > 0) {
        setTurnoSeleccionado(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      message.error('Error al cargar los turnos disponibles');
    } finally {
      setLoadingHorarios(false);
    }
  };

  const cargarDetallesSolicitud = async () => {
    try {
      setLoading(true);
      // Aquí se cargarían los detalles si tenemos un servicio específico
      if (solicitudExistente?.detalles) {
        const mapDetalles = new Map();
        solicitudExistente.detalles.forEach(det => {
          mapDetalles.set(det.fecha, det.turno);
        });
        setSelectedDates(mapDetalles);
      }
      setObservaciones(solicitudExistente?.observacionMedico || '');
    } catch (error) {
      console.error('Error cargando detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============== LÓGICA DE CALENDARIO ==============

  const nextMonth = () => {
    const nextDate = addMonths(currentMonth, 1);
    if (periodo?.fechaFin && isAfter(nextDate, new Date(periodo.fechaFin))) {
      return;
    }
    setCurrentMonth(nextDate);
  };

  const prevMonth = () => {
    const prevDate = subMonths(currentMonth, 1);
    if (periodo?.fechaInicio && isBefore(prevDate, new Date(periodo.fechaInicio))) {
      return;
    }
    setCurrentMonth(prevDate);
  };

  const handleDateClick = (day) => {
    if (!turnoSeleccionado) {
      message.warning('Selecciona un turno primero');
      return;
    }

    const dateStr = format(day, 'yyyy-MM-dd');
    const newDates = new Map(selectedDates);

    if (newDates.has(dateStr)) {
      newDates.delete(dateStr);
    } else {
      newDates.set(dateStr, turnoSeleccionado);
    }

    setSelectedDates(newDates);
  };

  const isDateDisabled = (day) => {
    // Deshabilitar fines de semana
    if (isWeekend(day)) return true;

    // Deshabilitar fechas fuera del período
    if (periodo?.fechaInicio && isBefore(day, new Date(periodo.fechaInicio))) {
      return true;
    }
    if (periodo?.fechaFin && isAfter(day, new Date(periodo.fechaFin))) {
      return true;
    }

    return false;
  };

  const isDateSelected = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return selectedDates.has(dateStr);
  };

  // ============== RENDER CALENDARIO ==============

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener primer día de la semana para alineación
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const totalCells = emptyDays + daysInMonth.length;
  const weeksCount = Math.ceil(totalCells / 5);

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  // ============== RENDER DETALLES ==============

  const renderDetalles = () => {
    if (selectedDates.size === 0) {
      return <Empty description="No hay días seleccionados" />;
    }

    const detalles = Array.from(selectedDates.entries())
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([fecha, turnoId]) => {
        const turno = horarios.find(h => h.id === turnoId);
        return {
          fecha,
          turnoId,
          turnoNombre: turno?.codHorario || 'N/A',
          turnoDesc: turno?.descHorario || 'Sin descripción'
        };
      });

    return (
      <div className="space-y-2">
        {detalles.map((det) => (
          <div
            key={det.fecha}
            className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
          >
            <div>
              <div className="font-medium text-gray-700">
                {format(new Date(det.fecha), 'EEEE, dd MMMM yyyy', { locale: es })}
              </div>
              <div className="text-sm text-gray-500">
                {det.turnoNombre} - {det.turnoDesc}
              </div>
            </div>
            <Button
              type="text"
              danger
              size="small"
              icon={<X size={16} />}
              onClick={() => {
                const newDates = new Map(selectedDates);
                newDates.delete(det.fecha);
                setSelectedDates(newDates);
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // ============== RENDER PRINCIPAL ==============

  if (!periodo) {
    return (
      <Modal
        title="Error"
        open={open}
        onCancel={onClose}
        footer={null}
      >
        <Alert
          type="error"
          message="Error: No se especificó período"
          showIcon
        />
      </Modal>
    );
  }

  return (
    <Modal
      title={`${mode === 'crear' ? 'Registrar' : 'Editar'} Disponibilidad - ${periodo.descripcion}`}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          disabled={selectedDates.size === 0}
          onClick={async () => {
            try {
              setLoading(true);
              const detalles = Array.from(selectedDates.entries()).map(([fecha, turnoId]) => ({
                fecha,
                turno: turnoId,
                estado: 'PROPUESTO'
              }));

              await onGuardar({
                idPeriodo: periodo.idPeriodoRegDisp,
                observacionMedico: observaciones,
                detalles
              });

              onClose();
            } finally {
              setLoading(false);
            }
          }}
        >
          Guardar
        </Button>
      ]}
    >
      <Spin spinning={loadingHorarios}>
        <div className="space-y-4">
          {/* Información del período */}
          <Alert
            type="info"
            message={`Período: ${periodo.descripcion}`}
            description={`Del ${format(new Date(periodo.fechaInicio), 'dd/MM/yyyy')} al ${format(new Date(periodo.fechaFin), 'dd/MM/yyyy')}`}
            showIcon
          />

          {/* Selector de turno */}
          <Card size="small">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Selecciona el Turno
              </label>
              <Select
                value={turnoSeleccionado}
                onChange={setTurnoSeleccionado}
                placeholder="Elige un turno"
                options={horarios.map(h => ({
                  label: `${h.codHorario} - ${h.descHorario}`,
                  value: h.id
                }))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Después selecciona los días en el calendario
              </p>
            </div>
          </Card>

          {/* Calendario */}
          <Card size="small" className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="space-y-3">
              {/* Encabezado */}
              <div className="flex items-center justify-between">
                <Button
                  type="text"
                  size="small"
                  icon={<ChevronLeft size={16} />}
                  onClick={prevMonth}
                />
                <h3 className="font-semibold text-gray-800">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <Button
                  type="text"
                  size="small"
                  icon={<ChevronRight size={16} />}
                  onClick={nextMonth}
                />
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-5 gap-1">
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="text-center font-semibold text-gray-600 text-xs py-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Días vacíos al inicio */}
                {Array(emptyDays).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}

                {/* Días del mes */}
                {daysInMonth.map(day => {
                  const isDisabled = isDateDisabled(day);
                  const isSelected = isDateSelected(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <Tooltip
                      key={format(day, 'yyyy-MM-dd')}
                      title={
                        isDisabled
                          ? 'Fin de semana o fuera del período'
                          : isSelected
                          ? 'Seleccionado'
                          : 'Haz clic para seleccionar'
                      }
                    >
                      <button
                        onClick={() => !isDisabled && handleDateClick(day)}
                        disabled={isDisabled}
                        className={`
                          w-full h-10 rounded text-sm font-medium transition-all
                          ${isDisabled
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:shadow-sm'
                          }
                          ${!isCurrentMonth ? 'opacity-30' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </button>
                    </Tooltip>
                  );
                })}
              </div>

              <Divider className="my-2" />

              {/* Resumen */}
              <div className="text-sm text-gray-600">
                <p>
                  <strong>{selectedDates.size}</strong> día{selectedDates.size !== 1 ? 's' : ''} seleccionado{selectedDates.size !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>

          {/* Detalles de los días seleccionados */}
          <Card size="small" title="Días Registrados">
            {renderDetalles()}
          </Card>

          {/* Observaciones */}
          <Card size="small">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Observaciones (Opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas sobre tu disponibilidad..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </Card>
        </div>
      </Spin>
    </Modal>
  );
}

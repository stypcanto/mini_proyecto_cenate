// ========================================================================
// CalendarioDisponibilidad.jsx - Calendario de Disponibilidad Médica
// ------------------------------------------------------------------------
// CENATE 2026 | Componente para declarar disponibilidad mensual
// ========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Activity,
  Heart,
  TrendingUp
} from 'lucide-react';
import { disponibilidadService } from '../../services/disponibilidadService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function CalendarioDisponibilidad({ idServicio = 1 }) {
  // ============================================================
  // Estado
  // ============================================================
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Estado del calendario
  const [periodoActual, setPeriodoActual] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return year + month;
  });

  // Disponibilidad cargada
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [turnos, setTurnos] = useState({});

  // ============================================================
  // Datos del médico
  // ============================================================
  const regimenLaboral = user?.regimen_laboral || 'CAS';
  const horasPorTurno = useMemo(() => {
    if (regimenLaboral === 'LOCADOR') {
      return { M: 12, T: 12, MT: 24 };
    }
    return { M: 8, T: 8, MT: 16 };
  }, [regimenLaboral]);

  // ============================================================
  // Cargar disponibilidad al montar
  // ============================================================
  useEffect(() => {
    cargarDisponibilidad();
  }, [periodoActual]);

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      const disp = await disponibilidadService.obtenerPorPeriodo(periodoActual);

      if (disp) {
        setDisponibilidad(disp);
        const turnosMap = {};
        disp.detalles?.forEach(det => {
          turnosMap[det.fecha] = det.turno;
        });
        setTurnos(turnosMap);
      } else {
        setDisponibilidad(null);
        setTurnos({});
      }
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      toast.error('Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Calcular días del mes
  // ============================================================
  const diasDelMes = useMemo(() => {
    const year = parseInt(periodoActual.substring(0, 4));
    const month = parseInt(periodoActual.substring(4, 6)) - 1;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dias = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const fecha = new Date(year, month, d);
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const fechaStr = year + '-' + monthStr + '-' + dayStr;

      dias.push({
        numero: d,
        fecha: fechaStr,
        diaSemana: fecha.getDay(),
        esFeriado: false
      });
    }

    return dias;
  }, [periodoActual]);

  // ============================================================
  // Calcular horas totales
  // ============================================================
  const calculos = useMemo(() => {
    let diasTrabajados = 0;
    let horasAsistenciales = 0;
    let horasSanitarias = 0;

    Object.entries(turnos).forEach(([fecha, turno]) => {
      if (turno && horasPorTurno[turno]) {
        diasTrabajados++;
        horasAsistenciales += horasPorTurno[turno];
      }
    });

    if (regimenLaboral !== 'LOCADOR') {
      horasSanitarias = diasTrabajados * 2;
    }

    const horasTotales = horasAsistenciales + horasSanitarias;
    const cumpleMinimo = horasTotales >= 150;
    const porcentaje = Math.min((horasTotales / 150) * 100, 100);

    return {
      diasTrabajados,
      horasAsistenciales,
      horasSanitarias,
      horasTotales,
      cumpleMinimo,
      porcentaje
    };
  }, [turnos, horasPorTurno, regimenLaboral]);

  // ============================================================
  // Manejar clic en turno
  // ============================================================
  const handleTurnoClick = (fecha, turnoNuevo) => {
    if (disponibilidad && disponibilidad.estado !== 'BORRADOR') {
      toast.error('Solo puedes editar disponibilidades en estado BORRADOR');
      return;
    }

    setTurnos(prev => {
      const actual = prev[fecha];

      if (actual === turnoNuevo) {
        const nuevosTurnos = { ...prev };
        delete nuevosTurnos[fecha];
        return nuevosTurnos;
      }

      return { ...prev, [fecha]: turnoNuevo };
    });
  };

  // ============================================================
  // Guardar disponibilidad
  // ============================================================
  const handleGuardar = async () => {
    try {
      setGuardando(true);

      const detalles = Object.entries(turnos).map(([fecha, turno]) => ({
        fecha,
        turno
      }));

      const data = {
        periodo: periodoActual,
        idServicio,
        detalles
      };

      if (disponibilidad) {
        // Actualizar disponibilidad existente con todos los detalles
        await disponibilidadService.actualizarDisponibilidad(disponibilidad.idDisponibilidad, data);
        toast.success('Disponibilidad actualizada correctamente');
      } else {
        const nueva = await disponibilidadService.crearDisponibilidad(data);
        setDisponibilidad(nueva);
        toast.success('Disponibilidad creada correctamente');
      }

      await cargarDisponibilidad();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(error.response?.data?.message || 'Error al guardar disponibilidad');
    } finally {
      setGuardando(false);
    }
  };

  // ============================================================
  // Enviar a revisión
  // ============================================================
  const handleEnviar = async () => {
    if (!disponibilidad) {
      toast.error('Primero debes guardar la disponibilidad');
      return;
    }

    if (!calculos.cumpleMinimo) {
      toast.error('Debes tener al menos 150 horas para enviar');
      return;
    }

    try {
      setEnviando(true);
      await disponibilidadService.enviarDisponibilidad(disponibilidad.idDisponibilidad);
      toast.success('Disponibilidad enviada a revisión correctamente');
      await cargarDisponibilidad();
    } catch (error) {
      console.error('Error al enviar:', error);
      toast.error(error.response?.data?.message || 'Error al enviar disponibilidad');
    } finally {
      setEnviando(false);
    }
  };

  // ============================================================
  // Cambiar periodo
  // ============================================================
  const cambiarPeriodo = (direccion) => {
    const year = parseInt(periodoActual.substring(0, 4));
    const month = parseInt(periodoActual.substring(4, 6));

    let newYear = year;
    let newMonth = month + direccion;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    const newPeriodo = String(newYear) + String(newMonth).padStart(2, '0');
    setPeriodoActual(newPeriodo);
  };

  // ============================================================
  // Render Loading
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  // ============================================================
  // Render Principal
  // ============================================================
  const puedeEditar = !disponibilidad || disponibilidad.estado === 'BORRADOR';
  const esSincronizado = disponibilidad?.estado === 'SINCRONIZADO';

  const year = parseInt(periodoActual.substring(0, 4));
  const month = parseInt(periodoActual.substring(4, 6)) - 1;
  const fechaDisplay = new Date(year, month, 1);
  const nombreMes = fechaDisplay.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-slate-800">
            Mi Disponibilidad Mensual
          </h2>
        </div>

        {esSincronizado && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Sincronizado con Chatbot
            </span>
          </div>
        )}
      </div>

      {/* Selector de Periodo */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => cambiarPeriodo(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="text-center">
            <div className="text-xl font-bold text-slate-800 uppercase">
              {nombreMes}
            </div>
            <div className="text-sm text-slate-500">
              Periodo: {periodoActual}
            </div>
          </div>

          <button
            onClick={() => cambiarPeriodo(1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Panel de Cálculos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Horas Asistenciales</span>
          </div>
          <div className="text-3xl font-bold text-blue-700">
            {calculos.horasAsistenciales}h
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {calculos.diasTrabajados} días trabajados
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Horas Sanitarias</span>
          </div>
          <div className="text-3xl font-bold text-purple-700">
            {calculos.horasSanitarias}h
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {regimenLaboral !== 'LOCADOR' ? '2h por día' : 'No aplica'}
          </div>
        </div>

        <div className={'bg-' + (calculos.cumpleMinimo ? 'green' : 'red') + '-50 border-2 border-' + (calculos.cumpleMinimo ? 'green' : 'red') + '-200 rounded-xl p-5'}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className={'w-5 h-5 text-' + (calculos.cumpleMinimo ? 'green' : 'red') + '-600'} />
            <span className={'text-sm font-medium text-' + (calculos.cumpleMinimo ? 'green' : 'red') + '-900'}>
              Total
            </span>
          </div>
          <div className={'text-3xl font-bold text-' + (calculos.cumpleMinimo ? 'green' : 'red') + '-700'}>
            {calculos.horasTotales}h
          </div>
          <div className="text-xs mt-1">
            <span className={'text-' + (calculos.cumpleMinimo ? 'green' : 'red') + '-600'}>
              Mínimo: 150h
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Progreso hacia 150 horas
          </span>
          <span className="text-sm font-bold text-slate-800">
            {calculos.porcentaje.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className={'h-3 rounded-full transition-all duration-300 bg-' + (calculos.cumpleMinimo ? 'green' : 'red') + '-500'}
            style={{ width: calculos.porcentaje + '%' }}
          />
        </div>
        {!calculos.cumpleMinimo && (
          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Faltan {150 - calculos.horasTotales}h para cumplir el mínimo requerido
          </p>
        )}
      </div>

      {/* Calendario */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
            <div key={dia} className="text-center text-xs font-bold text-slate-600 py-2">
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: diasDelMes[0]?.diaSemana || 0 }).map((_, i) => (
            <div key={'empty-' + i} />
          ))}

          {diasDelMes.map(dia => {
            const turnoActual = turnos[dia.fecha];
            const esFinDeSemana = dia.diaSemana === 0 || dia.diaSemana === 6;

            return (
              <div
                key={dia.fecha}
                className={'border rounded-lg p-2 ' + (esFinDeSemana ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200') + (puedeEditar ? '' : ' opacity-60')}
              >
                <div className="text-center text-xs font-medium text-slate-600 mb-2">
                  {dia.numero}
                </div>

                <div className="flex flex-col gap-1">
                  {['M', 'T', 'MT'].map(turno => (
                    <button
                      key={turno}
                      onClick={() => handleTurnoClick(dia.fecha, turno)}
                      disabled={!puedeEditar}
                      className={'text-xs py-1 rounded transition-colors ' + (turnoActual === turno ? 'bg-primary-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') + (puedeEditar ? ' cursor-pointer' : ' cursor-not-allowed')}
                    >
                      {turno}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Acciones */}
      {puedeEditar && (
        <div className="flex gap-4">
          <button
            onClick={handleGuardar}
            disabled={guardando || Object.keys(turnos).length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {guardando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                Guardar Borrador
              </>
            )}
          </button>

          <button
            onClick={handleEnviar}
            disabled={enviando || !disponibilidad || !calculos.cumpleMinimo}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {enviando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar a Revisión
              </>
            )}
          </button>
        </div>
      )}

      {/* Info Estado */}
      {disponibilidad && disponibilidad.estado !== 'BORRADOR' && (
        <div className={'border-2 rounded-xl p-4 ' + (disponibilidad.estado === 'SINCRONIZADO' ? 'bg-green-50 border-green-200' : disponibilidad.estado === 'REVISADO' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200')}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className={'w-5 h-5 ' + (disponibilidad.estado === 'SINCRONIZADO' ? 'text-green-600' : disponibilidad.estado === 'REVISADO' ? 'text-blue-600' : 'text-amber-600')} />
            <div>
              <div className={'font-medium ' + (disponibilidad.estado === 'SINCRONIZADO' ? 'text-green-900' : disponibilidad.estado === 'REVISADO' ? 'text-blue-900' : 'text-amber-900')}>
                Estado: {disponibilidad.estado}
              </div>
              <div className="text-sm text-slate-600">
                {disponibilidad.estado === 'ENVIADO' && 'Tu disponibilidad está en revisión por el coordinador'}
                {disponibilidad.estado === 'REVISADO' && 'Tu disponibilidad ha sido revisada y aprobada'}
                {disponibilidad.estado === 'SINCRONIZADO' && 'Tu disponibilidad está sincronizada con el sistema de chatbot'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

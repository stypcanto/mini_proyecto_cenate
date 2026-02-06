/**
 * 📊 Producción.jsx - Producción Diaria con Calendario (v1.48.0)
 *
 * Panel que muestra la producción diaria del médico:
 * - Calendario interactivo con días que tienen atenciones
 * - Estadísticas del día seleccionado
 * - Listado de pacientes atendidos ese día
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  FileText,
  Share2,
  Heart,
  RefreshCw,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import gestionPacientesService from '../../../../services/gestionPacientesService';

export default function Produccion() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await gestionPacientesService.obtenerPacientesMedico();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos de producción');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener pacientes atendidos en una fecha específica
  const getPacientesDelDia = (fecha) => {
    return pacientes.filter(p => {
      if (p.condicion !== 'Atendido' || !p.fechaAtencion) return false;
      try {
        const fechaAtencion = new Date(p.fechaAtencion);
        return (
          fechaAtencion.getDate() === fecha.getDate() &&
          fechaAtencion.getMonth() === fecha.getMonth() &&
          fechaAtencion.getFullYear() === fecha.getFullYear()
        );
      } catch {
        return false;
      }
    });
  };

  // Obtener todos los días del mes que tienen atenciones
  const getDiasConAtenciones = () => {
    const diasSet = new Set();
    pacientes.forEach(p => {
      if (p.condicion === 'Atendido' && p.fechaAtencion) {
        try {
          const fecha = new Date(p.fechaAtencion);
          if (fecha.getMonth() === mesActual.getMonth() && fecha.getFullYear() === mesActual.getFullYear()) {
            diasSet.add(fecha.getDate());
          }
        } catch {}
      }
    });
    return diasSet;
  };

  const pacientesDiaSeleccionado = getPacientesDelDia(diaSeleccionado);
  const diasConAtenciones = getDiasConAtenciones();

  // Estadísticas del día
  const statsDelDia = {
    total: pacientesDiaSeleccionado.length,
    recetas: pacientesDiaSeleccionado.filter(p => p.tieneRecita).length,
    interconsultas: pacientesDiaSeleccionado.filter(p => p.tieneInterconsulta).length,
    cronicas: pacientesDiaSeleccionado.filter(p => p.esCronico).length,
  };

  // Generar calendario
  const primerDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
  const ultimoDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
  const diasDelMes = ultimoDiaDelMes.getDate();
  const diaInicialSemana = primerDiaDelMes.getDay();

  const mesAnterior = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1));
  const mesSiguiente = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1));

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      const partes = fecha.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (!partes) return '-';
      return `${partes[3]}/${partes[2]}/${partes[1]}`;
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#0A5BA9] mx-auto mb-4" />
          <p className="text-gray-600">Cargando producción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-[#0A5BA9]" />
            <h1 className="text-3xl font-bold text-gray-900">📊 Producción</h1>
          </div>
          <p className="text-gray-600 font-medium">Visualiza tu producción diaria</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              {/* Navegación de meses */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={mesAnterior}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="font-semibold text-gray-900">
                  {mesActual.toLocaleString('es-PE', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={mesSiguiente}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(dia => (
                  <div key={dia} className="text-center text-xs font-semibold text-gray-600">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-2">
                {/* Espacios vacíos al inicio */}
                {Array.from({ length: diaInicialSemana }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Días del mes */}
                {Array.from({ length: diasDelMes }).map((_, i) => {
                  const dia = i + 1;
                  const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
                  const tieneAtenciones = diasConAtenciones.has(dia);
                  const esSeleccionado =
                    diaSeleccionado.getDate() === dia &&
                    diaSeleccionado.getMonth() === mesActual.getMonth() &&
                    diaSeleccionado.getFullYear() === mesActual.getFullYear();

                  return (
                    <button
                      key={dia}
                      onClick={() => setDiaSeleccionado(fecha)}
                      className={`
                        aspect-square rounded-lg font-semibold text-sm flex items-center justify-center
                        transition-all duration-200
                        ${esSeleccionado
                          ? 'bg-[#0A5BA9] text-white shadow-md'
                          : tieneAtenciones
                          ? 'bg-blue-50 text-[#0A5BA9] border-2 border-[#0A5BA9] hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-600">
                <p className="mb-2">
                  <span className="inline-block w-3 h-3 bg-[#0A5BA9] rounded mr-2"></span>
                  Día seleccionado
                </p>
                <p>
                  <span className="inline-block w-3 h-3 border-2 border-[#0A5BA9] rounded mr-2"></span>
                  Con atenciones
                </p>
              </div>
            </div>
          </div>

          {/* Detalles del día */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPIs del día */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {diaSeleccionado.toLocaleString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                  <p className="text-sm text-gray-600">Pacientes Atendidos</p>
                  <p className="text-2xl font-bold text-[#0A5BA9] mt-1">{statsDelDia.total}</p>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                  <p className="text-sm text-gray-600">Recetas</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{statsDelDia.recetas}</p>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                  <p className="text-sm text-gray-600">Interconsultas</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{statsDelDia.interconsultas}</p>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                  <p className="text-sm text-gray-600">Crónicos</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{statsDelDia.cronicas}</p>
                </div>
              </div>
            </div>

            {/* Listado de pacientes del día */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0A5BA9]" />
                Pacientes atendidos
              </h3>

              {pacientesDiaSeleccionado.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No hay atenciones este día</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pacientesDiaSeleccionado.map((paciente, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{paciente.apellidosNombres}</p>
                          <p className="text-sm text-gray-600">DNI: {paciente.numDoc}</p>
                        </div>
                        <div className="flex gap-2">
                          {paciente.tieneRecita && (
                            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                              📋 Receta
                            </span>
                          )}
                          {paciente.tieneInterconsulta && (
                            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              🔗 Inter
                            </span>
                          )}
                          {paciente.esCronico && (
                            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              ❤️ Crónico
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 text-sm text-gray-600 gap-2">
                        <p>📞 {paciente.telefono || '-'}</p>
                        <p>🏥 {paciente.ipress || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón actualizar */}
        <div className="mt-8 text-center">
          <button
            onClick={cargarDatos}
            className="px-6 py-2 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#083d78] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar datos
          </button>
        </div>
      </div>
    </div>
  );
}

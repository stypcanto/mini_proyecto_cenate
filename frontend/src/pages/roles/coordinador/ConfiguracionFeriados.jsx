// ============================================================================
// 📅 ConfiguracionFeriados - Solicitudes por Periodo (Horarios)
// ----------------------------------------------------------------------------
// Módulo para gestionar solicitudes y registro de horarios por período
// Estado: v1.79.0 - Control de Horarios Médicos
// ============================================================================

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Plus, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import ModalNuevaSolicitud from '../../../components/control_horarios/ModalNuevaSolicitud';
import ModalEditarSolicitud from '../../../components/control_horarios/ModalEditarSolicitud';
import ModalConsultarSolicitud from '../../../components/control_horarios/ModalConsultarSolicitud';

const ConfiguracionFeriados = () => {
  const [periodos, setPeriodos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [periodo, setPeriodo] = useState('todos');
  const [estado, setEstado] = useState('todos');
  
  // Modales
  const [showModalNuevaSolicitud, setShowModalNuevaSolicitud] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalConsultar, setShowModalConsultar] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('auth.token');

      // Obtener períodos
      const periodosResponse = await axios.get('/api/control-horarios/periodos', {
        params: { 
          estados: ['ABIERTO', 'REABIERTO', 'CERRADO'].join(',')
        },
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Períodos obtenidos del API:', JSON.stringify(periodosResponse.data, null, 2));
      setPeriodos(periodosResponse.data || []);

      // Cargar todos los horarios
      if (periodosResponse.data && periodosResponse.data.length > 0) {
        const allHorarios = [];
        for (const p of periodosResponse.data) {
          try {
            const horariosResponse = await axios.get('/api/control-horarios/horarios', {
              params: { periodo: p.periodo },
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
              }
            });
            if (horariosResponse.data) {
              allHorarios.push(...horariosResponse.data);
            }
          } catch (err) {
            console.error(`Error cargando horarios para período ${p.periodo}:`, err);
          }
        }
        setHorarios(allHorarios);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarSolicitud = (p) => {
    setSelectedPeriodo(p);
    setShowModalNuevaSolicitud(true);
  };

  const handleEditarSolicitud = (h) => {
    setSelectedHorario(h);
    setShowModalEditar(true);
  };

  const handleConsultarSolicitud = (h) => {
    setSelectedHorario(h);
    setShowModalConsultar(true);
  };

  const handleModalSuccess = () => {
    setShowModalNuevaSolicitud(false);
    setShowModalEditar(false);
    cargarDatos();
  };

  // Obtener años de los períodos (ascendente)
  const anos = [...new Set(periodos.map(p => p.periodo.substring(0, 4)))].sort();

  // Obtener períodos únicos para un año específico
  const getPeriodosPorAno = (anoSeleccionado) => {
    if (anoSeleccionado === 'todos') {
      return [...new Set(periodos.map(p => p.periodo))].sort();
    }
    return [...new Set(periodos
      .filter(p => p.periodo.substring(0, 4) === anoSeleccionado)
      .map(p => p.periodo))]
      .sort();
  };

  const periodosDelAno = getPeriodosPorAno(anio);

  // Filtrar datos
  const datosFiltrados = periodos.filter(p => {
    // Normalizar valores para comparación
    const periodoAno = p.periodo.substring(0, 4);
    const periodoEstado = p.estado ? p.estado.trim().toUpperCase() : '';
    const estadoFiltro = estado.toUpperCase();
    
    // Aplicar filtros
    const pasaFiltroAno = (anio === 'todos' || periodoAno === anio);
    const pasaFiltroPeriodo = (periodo === 'todos' || p.periodo === periodo);
    const pasaFiltroEstado = (estado === 'todos' || periodoEstado === estadoFiltro);
    
    return pasaFiltroAno && pasaFiltroPeriodo && pasaFiltroEstado;
  });

  // Formatear fecha (YYYY-MM-DD a DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (err) {
      return dateString || '—';
    }
  };

  // Obtener nombre del mes (202602 -> Febrero)
  const getNombreMes = (periodo) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mes = parseInt(periodo.substring(4, 6)) - 1; // Extraer mes (posiciones 4-5) y convertir a índice
    const nombreMes = meses[mes] || 'Inválido';
    return `${nombreMes} (${periodo})`;
  };

  // Badge de estado
  const getEstadoBadge = (est) => {
    const estadoLower = est?.toLowerCase().replace(/\s+/g, '');
    
    const badgeStyles = {
      abierto: {
        container: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-shadow',
        background: 'bg-emerald-500',
        text: 'text-white',
        icon: '✓'
      },
      reabierto: {
        container: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-shadow',
        background: 'bg-amber-500',
        text: 'text-white',
        icon: '↻'
      },
      cerrado: {
        container: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-shadow',
        background: 'bg-slate-500',
        text: 'text-white',
        icon: '◆'
      },
      enviado: {
        container: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-shadow',
        background: 'bg-cyan-500',
        text: 'text-white',
        icon: '→'
      },
      sinsolicitud: {
        container: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-shadow',
        background: 'bg-yellow-500',
        text: 'text-white',
        icon: '!'
      }
    };

    const style = badgeStyles[estadoLower] || badgeStyles.cerrado;

    return (
      <span className={`${style.container} ${style.background} ${style.text}`}>
        <span className="text-base">{style.icon}</span>
        {est}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Azul */}
      <div className="flex items-center justify-between bg-blue-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <div>
            <h1 className="text-xl font-bold">Solicitudes por Periodo</h1>
            <p className="text-blue-100 text-sm">Usa Iniciar para registrar turnos por calendario.</p>
          </div>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-50 disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={anio}
              onChange={(e) => {
                setAnio(e.target.value);
                setPeriodo('todos'); // Reset período cuando cambia el año
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los años</option>
              {anos.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              disabled={anio === 'todos'}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                anio === 'todos' 
                  ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'border-gray-300'
              }`}
            >
              {anio === 'todos' ? (
                <option value="todos">Seleccione un año primero</option>
              ) : (
                <>
                  <option value="todos">Todos los períodos</option>
                  {periodosDelAno.map(p => (
                    <option key={p} value={p}>{getNombreMes(p)}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="ABIERTO">ABIERTO</option>
              <option value="REABIERTO">REABIERTO</option>
              <option value="CERRADO">CERRADO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Tabla */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold">Año</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Periodo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Área</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Solicitud</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fecha Inicio</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fecha Fin</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                datosFiltrados.map((p) => (
                  <tr key={`${p.periodo}-${p.idArea}`} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{p.periodo.substring(0, 4)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.periodo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.descArea || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">—</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(p.fechaInicio)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(p.fechaFin)}</td>
                    <td className="px-6 py-4 text-sm">{getEstadoBadge(p.estado)}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleIniciarSolicitud(p)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Iniciar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Nota al pie */}
      <div className="mt-4 text-xs text-gray-600">
        * Al iniciar/editar, se muestra detalle del período (sin combo) y registro por calendario.
      </div>

      {/* Modales */}
      {showModalNuevaSolicitud && (
        <ModalNuevaSolicitud
          periodo={selectedPeriodo}
          onClose={() => setShowModalNuevaSolicitud(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showModalEditar && selectedHorario && (
        <ModalEditarSolicitud
          horario={selectedHorario}
          onClose={() => setShowModalEditar(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showModalConsultar && selectedHorario && (
        <ModalConsultarSolicitud
          horario={selectedHorario}
          onClose={() => setShowModalConsultar(false)}
        />
      )}
    </div>
  );
};

export default ConfiguracionFeriados;

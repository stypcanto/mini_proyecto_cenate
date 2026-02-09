/**
 * 📊 Producción.jsx - Dashboard Completo de Productividad Médica (v1.61.5)
 *
 * Panel avanzado que muestra:
 * - KPIs totales: Atendidos, Pendientes, Deserciones, Interconsultas
 * - Gráfico de deserciones por motivo
 * - Análisis de productividad y tendencias
 * - Listado de pacientes pendientes
 * - Calendario interactivo con detalles por día (REORGANIZADO v1.61.2)
 * - Tabla compacta de pacientes con scroll (v1.61.4)
 * - Filtro de búsqueda por DNI (v1.61.5)
 * - Soporte para exportación a PDF y Excel
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Share2,
  Heart,
  RefreshCw,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  BarChart3,
  Download,
  FileDown,
  TrendingDown,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import gestionPacientesService from '../../../../services/gestionPacientesService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Produccion() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());
  const [mostrarPeriodoCompleto, setMostrarPeriodoCompleto] = useState(true); // ✅ v1.61.0: Control de vista

  // ✅ v1.60.0: Filtros de período
  const [filtroActual, setFiltroActual] = useState('mes'); // 'semana', 'mes', 'año'

  // ✅ v1.61.5: Filtro de búsqueda por DNI
  const [filtroDNI, setFiltroDNI] = useState('');

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

  // Filtrar pacientes por DNI
  const pacientesFiltrados = pacientesDiaSeleccionado.filter(p => {
    if (!filtroDNI.trim()) return true;
    return p.numDoc && p.numDoc.toString().includes(filtroDNI.trim());
  });

  // ✅ v1.59.0: ESTADÍSTICAS TOTALES (Período completo)
  const statsTotales = {
    atendidos: pacientes.filter(p => p.condicion === 'Atendido').length,
    pendientes: pacientes.filter(p => p.condicion === 'Pendiente').length,
    deserciones: pacientes.filter(p => p.condicion === 'Deserción').length,
    interconsultas: pacientes.filter(p => p.tieneInterconsulta).length,
    cronicas: pacientes.filter(p => p.esCronico).length,
  };

  // ✅ v1.59.0: Análisis de deserciones por motivo
  const deserciones = pacientes.filter(p => p.condicion === 'Deserción');
  const motivosDesercion = {};
  deserciones.forEach(p => {
    if (p.observaciones) {
      const motivo = p.observaciones.split('Razón: ')[1] || 'Otro';
      motivosDesercion[motivo] = (motivosDesercion[motivo] || 0) + 1;
    }
  });

  const datosDeserciones = Object.entries(motivosDesercion).map(([motivo, cantidad]) => ({
    name: motivo,
    value: cantidad
  }));

  // ✅ v1.59.0: Pacientes pendientes (próximos a atender)
  const pacientesPendientes = pacientes.filter(p => p.condicion === 'Pendiente')
    .sort((a, b) => {
      const fechaA = new Date(a.fechaAsignacion || '');
      const fechaB = new Date(b.fechaAsignacion || '');
      return fechaB - fechaA;
    });

  // ✅ v1.59.0: Estadísticas del día seleccionado
  const statsDelDia = {
    total: pacientesDiaSeleccionado.length,
    interconsultas: pacientesDiaSeleccionado.filter(p => p.tieneInterconsulta).length,
    cronicas: pacientesDiaSeleccionado.filter(p => p.esCronico).length,
  };

  // ✅ v1.59.0: Productividad promedio
  const productividadPromedio = statsTotales.atendidos > 0
    ? (statsTotales.atendidos / (diasConAtenciones.size || 1)).toFixed(1)
    : 0;

  // ✅ v1.59.0: Colores para el gráfico de deserciones
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#0ea5e9', '#6366f1'];

  const getColorMotivo = (index) => COLORS[index % COLORS.length];

  // ✅ v1.60.0: Funciones para comparativos y tendencias (con memoización)
  const getDateRange = useCallback((tipo) => {
    const hoy = new Date();
    const inicio = new Date();

    if (tipo === 'semana') {
      inicio.setDate(hoy.getDate() - hoy.getDay());
    } else if (tipo === 'mes') {
      inicio.setDate(1);
    } else if (tipo === 'año') {
      inicio.setMonth(0);
      inicio.setDate(1);
    }

    return { inicio, fin: hoy };
  }, []);

  const getPeriodoAnterior = useCallback((tipo) => {
    const { inicio } = getDateRange(tipo);
    const inicioPrevio = new Date(inicio);

    if (tipo === 'semana') {
      inicioPrevio.setDate(inicioPrevio.getDate() - 7);
    } else if (tipo === 'mes') {
      inicioPrevio.setMonth(inicioPrevio.getMonth() - 1);
    } else if (tipo === 'año') {
      inicioPrevio.setFullYear(inicioPrevio.getFullYear() - 1);
    }

    return { inicio: inicioPrevio, fin: new Date(inicio) };
  }, [getDateRange]);

  const getPacientesEnRango = useCallback((pacientes, inicio, fin) => {
    return pacientes.filter(p => {
      if (!p.fechaAtencion || p.condicion !== 'Atendido') return false;
      const fecha = new Date(p.fechaAtencion);
      return fecha >= inicio && fecha <= fin;
    });
  }, []);

  // ✅ v1.61.0: Estadísticas dinámicas (período vs día específico)
  const estadisticas = useMemo(() => {
    let pacientesActual, pacientesPrevio;

    // Si se seleccionó un día específico, mostrar solo ese día
    if (!mostrarPeriodoCompleto) {
      const inicio = new Date(diaSeleccionado);
      const fin = new Date(diaSeleccionado);
      fin.setHours(23, 59, 59, 999);

      pacientesActual = getPacientesEnRango(pacientes, inicio, fin);

      // Período anterior = día anterior
      const inicioPrevio = new Date(diaSeleccionado);
      inicioPrevio.setDate(inicioPrevio.getDate() - 1);
      const finPrevio = new Date(inicioPrevio);
      finPrevio.setHours(23, 59, 59, 999);

      pacientesPrevio = getPacientesEnRango(pacientes, inicioPrevio, finPrevio);
    } else {
      // Mostrar período completo (Semana/Mes/Año)
      const { inicio: inicioActual, fin: finActual } = getDateRange(filtroActual);
      pacientesActual = getPacientesEnRango(pacientes, inicioActual, finActual);

      const { inicio: inicioPrevio, fin: finPrevio } = getPeriodoAnterior(filtroActual);
      pacientesPrevio = getPacientesEnRango(pacientes, inicioPrevio, finPrevio);
    }

    const statsActual = {
      total: pacientesActual.length,
      interconsultas: pacientesActual.filter(p => p.tieneInterconsulta).length,
      cronicas: pacientesActual.filter(p => p.esCronico).length,
    };

    const statsPrevio = {
      total: pacientesPrevio.length,
      interconsultas: pacientesPrevio.filter(p => p.tieneInterconsulta).length,
    };

    return { statsActual, statsPrevio };
  }, [pacientes, filtroActual, diaSeleccionado, mostrarPeriodoCompleto, getDateRange, getPacientesEnRango, getPeriodoAnterior]);

  const { statsActual, statsPrevio } = estadisticas;

  // Calcular comparativos (%)
  const calcularComparativo = useCallback((actual, anterior) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior * 100).toFixed(1);
  }, []);

  // Datos para gráfico de tendencia (memoizado)
  const datosTendencia = useMemo(() => {
    const ultimos7 = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const diaPacientes = pacientes.filter(p => {
        if (!p.fechaAtencion || p.condicion !== 'Atendido') return false;
        const fechaPaciente = new Date(p.fechaAtencion);
        return fechaPaciente.toDateString() === fecha.toDateString();
      });

      ultimos7.push({
        fecha: fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
        pacientes: diaPacientes.length,
        interconsultas: diaPacientes.filter(p => p.tieneInterconsulta).length
      });
    }
    return ultimos7;
  }, [pacientes]);

  // ✅ v1.60.0: Funciones de exportación (con importación dinámica)
  const exportarPDF = useCallback(async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const fecha = new Date().toLocaleDateString('es-PE');

      // Encabezado
      doc.setFontSize(16);
      doc.text('📊 Reporte de Productividad Médica', 20, 20);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fecha}`, 20, 30);
      doc.text(`Período: ${filtroActual.toUpperCase()}`, 20, 37);

      // Estadísticas
      doc.setFontSize(12);
      doc.text('Estadísticas Actuales:', 20, 50);
      doc.setFontSize(10);
      doc.text(`• Pacientes Atendidos: ${statsActual.total}`, 25, 60);
      doc.text(`• Interconsultas: ${statsActual.interconsultas}`, 25, 67);
      doc.text(`• Pacientes Crónicos: ${statsActual.cronicas}`, 25, 74);

      // Totales
      doc.setFontSize(12);
      doc.text('Totales (Histórico):', 20, 90);
      doc.setFontSize(10);
      doc.text(`• Total Atendidos: ${statsTotales.atendidos}`, 25, 100);
      doc.text(`• Total Pendientes: ${statsTotales.pendientes}`, 25, 107);
      doc.text(`• Total Deserciones: ${statsTotales.deserciones}`, 25, 114);

      doc.save(`Productividad_${fecha.replace(/\//g, '-')}.pdf`);
      toast.success('PDF descargado');
    } catch (error) {
      toast.error('Error al descargar PDF');
      console.error(error);
    }
  }, [statsActual, statsTotales, filtroActual]);

  const exportarExcel = useCallback(async () => {
    try {
      const { default: XLSX } = await import('xlsx');
      const hoy = new Date().toLocaleDateString('es-PE');

      // Crear workbook
      const ws = XLSX.utils.aoa_to_sheet([
        ['REPORTE DE PRODUCTIVIDAD MÉDICA', `Fecha: ${hoy}`],
        [],
        ['PERÍODO ACTUAL', `${filtroActual.toUpperCase()}`],
        ['Pacientes Atendidos', statsActual.total],
        ['Interconsultas', statsActual.interconsultas],
        ['Pacientes Crónicos', statsActual.cronicas],
        [],
        ['PERÍODO ANTERIOR'],
        ['Pacientes Atendidos', statsPrevio.total],
        ['Interconsultas', statsPrevio.interconsultas],
        [],
        ['HISTÓRICO COMPLETO'],
        ['Total Atendidos', statsTotales.atendidos],
        ['Total Pendientes', statsTotales.pendientes],
        ['Total Deserciones', statsTotales.deserciones],
        ['Total Interconsultas', statsTotales.interconsultas],
        ['Total Crónicos', statsTotales.cronicas],
        [],
        ['ÚLTIMOS 7 DÍAS']
      ]);

      // Agregar datos de tendencia
      datosTendencia.forEach(dia => {
        ws['A' + (ws['!ref'].split(':')[1][1] + 1)] = dia.fecha;
        ws['B' + (ws['!ref'].split(':')[1][1])] = dia.pacientes;
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Productividad');
      XLSX.writeFile(wb, `Productividad_${hoy.replace(/\//g, '-')}.xlsx`);
      toast.success('Excel descargado');
    } catch (error) {
      toast.error('Error al descargar Excel');
      console.error(error);
    }
  }, [statsActual, statsPrevio, statsTotales, datosTendencia, filtroActual]);

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
      <div className="max-w-7xl mx-auto">
        {/* Header + Filtros */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#0A5BA9]" />
              <h1 className="text-3xl font-bold text-gray-900">📊 Mi Productividad</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportarPDF}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={exportarExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {/* Filtros de Período */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFiltroActual('semana')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroActual === 'semana'
                  ? 'bg-[#0A5BA9] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setFiltroActual('mes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroActual === 'mes'
                  ? 'bg-[#0A5BA9] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Este Mes
            </button>
            <button
              onClick={() => setFiltroActual('año')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroActual === 'año'
                  ? 'bg-[#0A5BA9] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Este Año
            </button>
          </div>

          <p className="text-gray-600 font-medium">Análisis completo de tu desempeño médico</p>
        </div>

        {/* ✅ v1.60.0: KPIs DEL PERÍODO ACTUAL + COMPARATIVOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Pacientes Atendidos - Período Actual */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Atendidos ({filtroActual})</p>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-4xl font-bold text-emerald-900">{statsActual.total}</p>
            <div className="flex items-center gap-2 mt-3">
              {calcularComparativo(statsActual.total, statsPrevio.total) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${calcularComparativo(statsActual.total, statsPrevio.total) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {calcularComparativo(statsActual.total, statsPrevio.total) >= 0 ? '+' : ''}{calcularComparativo(statsActual.total, statsPrevio.total)}% vs anterior
              </span>
            </div>
          </div>

          {/* Interconsultas */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-purple-700 uppercase tracking-wider">Interconsultas</p>
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-4xl font-bold text-purple-900">{statsActual.interconsultas}</p>
            <p className="text-xs text-purple-700 mt-3">
              Tasa: <span className="font-bold">{statsActual.total > 0 ? ((statsActual.interconsultas / statsActual.total) * 100).toFixed(1) : 0}%</span>
            </p>
          </div>

          {/* Crónicos */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-red-700 uppercase tracking-wider">Crónicos</p>
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-4xl font-bold text-red-900">{statsActual.cronicas}</p>
            <p className="text-xs text-red-700 mt-3">
              Registrados en período
            </p>
          </div>
        </div>

        {/* ✅ v1.61.2: CALENDARIO INTERACTIVO DEBAJO DE CARDS PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Calendario */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-[#0A5BA9] shadow-md rounded-lg p-8 h-full flex flex-col">
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
                    diaSeleccionado.getFullYear() === mesActual.getFullYear() &&
                    !mostrarPeriodoCompleto;

                  return (
                    <button
                      key={dia}
                      onClick={() => {
                        setDiaSeleccionado(fecha);
                        setMostrarPeriodoCompleto(false);
                      }}
                      className={`
                        aspect-square rounded-lg font-semibold text-sm flex items-center justify-center
                        transition-all duration-300 cursor-pointer
                        ${esSeleccionado
                          ? 'bg-[#0A5BA9] text-white shadow-lg scale-105'
                          : tieneAtenciones
                          ? 'bg-blue-50 text-[#0A5BA9] border-2 border-[#0A5BA9] hover:bg-blue-100 hover:shadow-md'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }
                      `}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>

              {/* Leyenda + Botón para periodo completo */}
              <div className="mt-auto pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-4">
                  <p className="mb-2">
                    <span className="inline-block w-3 h-3 bg-[#0A5BA9] rounded mr-2"></span>
                    Día seleccionado
                  </p>
                  <p>
                    <span className="inline-block w-3 h-3 border-2 border-[#0A5BA9] rounded mr-2"></span>
                    Con atenciones
                  </p>
                </div>

                {/* Botón para ver período completo */}
                {!mostrarPeriodoCompleto && (
                  <button
                    onClick={() => setMostrarPeriodoCompleto(true)}
                    className="w-full px-3 py-2 mt-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
                  >
                    ← Ver período completo ({filtroActual})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Detalles - VINCULADO AL CALENDARIO */}
          <div className="lg:col-span-1">
            {/* Encabezado dinámico */}
            <div className="mb-6 bg-gradient-to-r from-[#0A5BA9] to-[#0A5BA9]/80 text-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold capitalize">
                {mostrarPeriodoCompleto
                  ? `${filtroActual.charAt(0).toUpperCase() + filtroActual.slice(1)}`
                  : diaSeleccionado.toLocaleString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
              <p className="text-sm text-white/90 mt-2">
                {mostrarPeriodoCompleto
                  ? `Estadísticas del ${filtroActual}`
                  : pacientesDiaSeleccionado.length === 0
                  ? 'Sin atenciones registradas'
                  : `${pacientesDiaSeleccionado.length} paciente${pacientesDiaSeleccionado.length !== 1 ? 's' : ''} atendido${pacientesDiaSeleccionado.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Listado de pacientes del día */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              {pacientesDiaSeleccionado.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium text-lg">Sin atenciones este día</p>
                  <p className="text-sm text-gray-500 mt-2">Selecciona otro día del calendario para ver los pacientes atendidos</p>
                </div>
              ) : (
                <>
                  {/* Filtro de DNI */}
                  <div className="mb-4 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="🔍 Buscar DNI..."
                      value={filtroDNI}
                      onChange={(e) => setFiltroDNI(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5BA9]"
                    />
                    {filtroDNI && (
                      <button onClick={() => setFiltroDNI('')} className="px-3 py-2 text-gray-500 hover:text-gray-700">✕</button>
                    )}
                    <span className="text-xs text-gray-600">{pacientesFiltrados.length} / {pacientesDiaSeleccionado.length}</span>
                  </div>

                  <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Paciente</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">DNI</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Teléfono</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">IPRESS</th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-700">Tipos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pacientesDiaSeleccionado.map((paciente, idx) => (
                        <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-150`}>
                          <td className="px-3 py-2 text-gray-900 font-medium">{paciente.apellidosNombres}</td>
                          <td className="px-3 py-2 text-gray-600">{paciente.numDoc}</td>
                          <td className="px-3 py-2 text-gray-600">{paciente.telefono || '-'}</td>
                          <td className="px-3 py-2 text-gray-600">{paciente.ipress || '-'}</td>
                          <td className="px-3 py-2">
                            <div className="flex justify-center gap-1 flex-wrap">
                              {paciente.tieneRecita && (
                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">📋</span>
                              )}
                              {paciente.tieneInterconsulta && (
                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">🔗</span>
                              )}
                              {paciente.esCronico && (
                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">❤️</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ✅ v1.60.0: GRÁFICO DE TENDENCIA */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Tendencia - Últimos 7 Días</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosTendencia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pacientes" stroke="#0A5BA9" strokeWidth={2} name="Pacientes Atendidos" />
              <Line type="monotone" dataKey="interconsultas" stroke="#a855f7" strokeWidth={2} name="Interconsultas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* SECCIÓN DE ANÁLISIS DE DESERCIONES Y ESTADÍSTICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Deserciones */}
          {datosDeserciones.length > 0 && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Deserciones por Motivo
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosDeserciones}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => {
                      const total = datosDeserciones.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((value / total) * 100).toFixed(1);
                      return `${percent}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosDeserciones.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorMotivo(index)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => {
                      const total = datosDeserciones.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((value / total) * 100).toFixed(1);
                      return `${value} pacientes (${percent}%)`;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-4 text-center">
                Total de deserciones: <span className="font-bold text-red-600">{statsTotales.deserciones}</span>
              </p>
            </div>
          )}

          {/* Productividad e Interconsultas */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Análisis de Productividad</h2>
            <div className="space-y-6">
              {/* Productividad Promedio */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-gray-600 mb-1">Promedio de pacientes/día</p>
                <p className="text-3xl font-bold text-blue-600">{productividadPromedio}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {diasConAtenciones.size > 0 ? `En ${diasConAtenciones.size} días con atenciones` : 'Sin datos disponibles'}
                </p>
              </div>

              {/* Días Activos */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-sm text-gray-600 mb-1">Días con atenciones</p>
                <p className="text-3xl font-bold text-green-600">{diasConAtenciones.size}</p>
                <p className="text-xs text-gray-500 mt-1">Este mes</p>
              </div>

              {/* Interconsultas Ratio */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="text-sm text-gray-600 mb-1">Tasa de interconsultas</p>
                <p className="text-3xl font-bold text-purple-600">
                  {statsTotales.atendidos > 0
                    ? ((statsTotales.interconsultas / statsTotales.atendidos) * 100).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {statsTotales.interconsultas} de {statsTotales.atendidos} pacientes referidos
                </p>
              </div>

              {/* Crónicos */}
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <p className="text-sm text-gray-600 mb-1">Pacientes crónicos registrados</p>
                <p className="text-3xl font-bold text-red-600">{statsTotales.cronicas}</p>
                <p className="text-xs text-gray-500 mt-1">Con enfermedades crónicas</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE PACIENTES PENDIENTES */}
        {pacientesPendientes.length > 0 && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Pacientes Pendientes de Atender ({pacientesPendientes.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Paciente</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">DNI</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Teléfono</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">IPRESS</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha Asignación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pacientesPendientes.slice(0, 10).map((paciente, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{paciente.apellidosNombres}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{paciente.numDoc}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.telefono || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.ipress || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{formatearFecha(paciente.fechaAsignacion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pacientesPendientes.length > 10 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  ... y {pacientesPendientes.length - 10} más pendientes
                </p>
              )}
            </div>
          </div>
        )}

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

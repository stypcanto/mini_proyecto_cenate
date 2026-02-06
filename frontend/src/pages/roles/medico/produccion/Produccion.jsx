/**
 * 📊 Producción.jsx - Resumen de Atenciones Médicas (v1.47.0)
 *
 * Panel que muestra el resumen general de todas las atenciones
 * realizadas por el médico:
 * - Total de pacientes atendidos
 * - Recetas emitidas
 * - Interconsultas realizadas
 * - Enfermedades crónicas registradas
 * - Tabla de atenciones detalladas
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileText,
  Share2,
  Heart,
  Download,
  RefreshCw,
  AlertCircle,
  Loader,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import gestionPacientesService from '../../../../services/gestionPacientesService';

export default function Produccion() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());

  useEffect(() => {
    cargarDatos();
  }, [filtroMes, filtroAno]);

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

  // Filtrar pacientes atendidos por mes/año
  const pacientesAtendidos = pacientes.filter(p => {
    if (p.condicion !== 'Atendido') return false;
    if (!p.fechaAtencion) return false;

    try {
      const fecha = new Date(p.fechaAtencion);
      return fecha.getMonth() + 1 === filtroMes && fecha.getFullYear() === filtroAno;
    } catch {
      return false;
    }
  });

  // Estadísticas calculadas
  const stats = {
    totalAtendidos: pacientesAtendidos.length,
    recetas: pacientesAtendidos.filter(p => p.tieneRecita).length,
    interconsultas: pacientesAtendidos.filter(p => p.tieneInterconsulta).length,
    cronicas: pacientesAtendidos.filter(p => p.esCronico).length,
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      let año, mes, día, hora, minuto;
      if (fecha.endsWith('Z')) {
        const date = new Date(fecha);
        let peruDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
        año = peruDate.getUTCFullYear();
        mes = String(peruDate.getUTCMonth() + 1).padStart(2, '0');
        día = String(peruDate.getUTCDate()).padStart(2, '0');
        hora = String(peruDate.getUTCHours()).padStart(2, '0');
        minuto = String(peruDate.getUTCMinutes()).padStart(2, '0');
      } else {
        const isoMatch = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (!isoMatch) return '-';
        año = isoMatch[1];
        mes = isoMatch[2];
        día = isoMatch[3];
        hora = isoMatch[4];
        minuto = isoMatch[5];
      }
      return `${día}/${mes}/${año}`;
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#0A5BA9] mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos de producción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-[#0A5BA9]" />
            <h1 className="text-3xl font-bold text-gray-900">📊 Producción</h1>
          </div>
          <p className="text-gray-600 font-medium">Resumen de tus atenciones médicas</p>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/50 focus:border-[#0A5BA9] transition-colors"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                  <option key={mes} value={mes}>
                    {new Date(2024, mes - 1).toLocaleString('es-PE', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
              <select
                value={filtroAno}
                onChange={(e) => setFiltroAno(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/50 focus:border-[#0A5BA9] transition-colors"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={cargarDatos}
                className="w-full px-4 py-2 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#083d78] transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pacientes Atendidos</p>
                <p className="text-3xl font-bold text-[#0A5BA9] mt-2">{stats.totalAtendidos}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#0A5BA9]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Recetas Emitidas</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.recetas}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Interconsultas</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.interconsultas}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Crónicos</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.cronicas}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de atenciones */}
        {pacientesAtendidos.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-gray-600 font-medium">No hay atenciones registradas</p>
            <p className="text-gray-500 text-sm mt-1">Para el período seleccionado</p>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-lg">
            <div className="overflow-x-auto relative">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-semibold text-white uppercase tracking-wider bg-[#0A5BA9] relative z-20">
                  <tr>
                    <th className="px-4 py-3">DNI</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">IPRESS</th>
                    <th className="px-4 py-3">Receta</th>
                    <th className="px-4 py-3">Interconsulta</th>
                    <th className="px-4 py-3">Crónico</th>
                    <th className="px-4 py-3">Fecha Atención</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pacientesAtendidos.map((paciente, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{paciente.numDoc}</td>
                      <td className="px-4 py-3 text-gray-700">{paciente.apellidosNombres}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.telefono || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.ipress || '-'}</td>
                      <td className="px-4 py-3">
                        {paciente.tieneRecita ? (
                          <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Sí
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {paciente.tieneInterconsulta ? (
                          <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            ✓ Sí
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {paciente.esCronico ? (
                          <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            ✓ Sí
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatearFecha(paciente.fechaAtencion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pie */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Período: {new Date(filtroAno, filtroMes - 1).toLocaleString('es-PE', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}

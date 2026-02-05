/**
 * 👨‍⚕️ BienvenidaMedico.jsx - Página de Bienvenida Personalizada para Médicos
 *
 * Panel de bienvenida con estadísticas, acciones rápidas e información
 * relevante para el trabajo diario del médico en CENATE
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Heart,
  ChevronRight,
  Stethoscope,
  TrendingUp,
  AlertCircle,
  Settings,
  Folder,
  ChevronDown,
  BarChart3,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import gestionPacientesService from '../../../services/gestionPacientesService';

export default function BienvenidaMedico() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pacientesAsignados: 0,
    pacientesCitados: 0,
    pacientesAtendidos: 0,
    pacientesPendientes: 0
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const pacientes = await gestionPacientesService.obtenerPacientesMedico();

      if (pacientes && Array.isArray(pacientes)) {
        const estadisticas = {
          pacientesAsignados: pacientes.length,
          pacientesCitados: pacientes.filter(p => p.condicion === 'Citado').length,
          pacientesAtendidos: pacientes.filter(p => p.condicion === 'Atendido').length,
          pacientesPendientes: pacientes.filter(p => p.condicion === 'Pendiente').length
        };
        setStats(estadisticas);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const acciones = [
    {
      titulo: 'Pacientes',
      descripcion: 'Consulta la lista de pacientes asignados, su estado y condición actual.',
      icono: Folder,
      color: 'bg-blue-100 text-blue-600',
      ruta: '/roles/medico/pacientes',
      stat: stats.pacientesAsignados
    },
    {
      titulo: 'Disponibilidad',
      descripcion: 'Registra y gestiona tu horario de atención para telemedicina.',
      icono: Calendar,
      color: 'bg-emerald-100 text-emerald-600',
      ruta: '/roles/medico/disponibilidad',
      stat: null
    },
    {
      titulo: 'Mi Información',
      descripcion: 'Actualiza tu perfil profesional, especialidades y datos de contacto.',
      icono: FileText,
      color: 'bg-purple-100 text-purple-600',
      ruta: '/user/security',
      stat: null
    }
  ];

  const indicadores = [
    {
      label: 'Pacientes Asignados',
      valor: stats.pacientesAsignados,
      icono: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Citados',
      valor: stats.pacientesCitados,
      icono: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Atendidos',
      valor: stats.pacientesAtendidos,
      icono: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      label: 'Pendientes',
      valor: stats.pacientesPendientes,
      icono: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-2 border-white/30 shadow-lg">
            <Stethoscope className="w-12 h-12 text-white" />
          </div>

          {/* Contenido */}
          <div className="flex-1 text-white">
            <h1 className="text-4xl font-bold mb-2">
              Bienvenido(a), Dr(a). {user?.nombreCompleto?.split(' ')[0] || user?.username || 'Médico'}
            </h1>
            <p className="text-white/90 text-lg leading-relaxed mb-4">
              Panel de telemedicina CENATE - Centro Nacional de Telemedicina para atención a {stats.pacientesAsignados} pacientes.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Performance: Excelente</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {indicadores.map((ind, idx) => (
          <div
            key={idx}
            className={`${ind.bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{ind.label}</h3>
              <div className={`p-2 rounded-lg bg-white`}>
                <ind.icono className={`w-5 h-5 ${ind.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : ind.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Panel Médico - Desglosable Expandido */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">Panel Médico</h2>
          </div>
          <ChevronDown className="w-5 h-5 text-white" />
        </div>

        <div className="divide-y divide-gray-200">
          {acciones.map((accion, idx) => (
            <button
              key={idx}
              onClick={() => navigate(accion.ruta)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-2 rounded-lg ${accion.color}`}>
                  <accion.icono className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {accion.titulo}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {accion.descripcion}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {accion.stat !== null && (
                  <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {accion.stat}
                  </div>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* TeleECG - Desglosable Expandido */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">TeleECG</h2>
          </div>
          <ChevronDown className="w-5 h-5 text-white" />
        </div>

        <div className="divide-y divide-gray-200">
          <button
            onClick={() => navigate('/teleecg/recibidas')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 rounded-lg bg-purple-100">
                <Folder className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition">
                  TeleECG Recibidas
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Visualiza y revisa las telemedicinas recibidas
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition flex-shrink-0" />
          </button>

          <button
            onClick={() => navigate('/teleecg/estadisticas')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 rounded-lg bg-purple-100">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition">
                  Estadísticas
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Reportes y análisis de tu actividad
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Sección de Recomendaciones */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-blue-100">
        <div className="flex gap-4">
          <div className="p-3 rounded-lg bg-blue-100 flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">💡 Recomendaciones del Día</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Revisa tus {stats.pacientesPendientes} pacientes pendientes de atención</li>
              <li>✓ Confirma tu disponibilidad para la próxima semana</li>
              <li>✓ Actualiza tu información de contacto si es necesario</li>
              <li>✓ Consulta el estado de tus pacientes citados</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="flex items-center justify-between py-4 border-t border-gray-200 text-sm text-gray-600">
        <p>
          CENATE – Centro Nacional de Telemedicina | Plataforma de Telemedicina 2025 © EsSalud
        </p>
        <button
          onClick={() => navigate('/user/security')}
          className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Seguridad
        </button>
      </div>
    </div>
  );
}

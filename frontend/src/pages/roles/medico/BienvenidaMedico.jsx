/**
 * 👨‍⚕️ BienvenidaMedico.jsx - Dashboard Médico v2.0
 *
 * 3 Preguntas clave:
 * 1. ¿Qué tengo que hacer HOY? → Pacientes Asignados
 * 2. ¿Qué pacientes necesitan atención urgente? → Semáforo de Pendientes
 * 3. ¿Cómo va mi desempeño? → Coordinador de Especialidades
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
  FileText,
  Home,
  User,
  Inbox,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import gestionPacientesService from '../../../services/gestionPacientesService';

export default function BienvenidaMedico() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [stats, setStats] = useState({
    pacientesAsignados: 0,
    pacientesCitados: 0,
    pacientesAtendidos: 0,
    pacientesPendientes: 0
  });
  const [contadorPendientes, setContadorPendientes] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar pacientes asignados del médico
      const data = await gestionPacientesService.obtenerPacientesMedico();
      if (data && Array.isArray(data)) {
        setPacientes(data);
        const estadisticas = {
          pacientesAsignados: data.length,
          pacientesCitados: data.filter(p => p.condicion === 'Citado').length,
          pacientesAtendidos: data.filter(p => p.condicion === 'Atendido').length,
          pacientesPendientes: data.filter(p => p.condicion === 'Pendiente').length
        };
        setStats(estadisticas);
      }

      // Cargar contador de pacientes pendientes (v1.62.0)
      try {
        const contador = await gestionPacientesService.obtenerContadorPendientes();
        setContadorPendientes(contador);
      } catch (error) {
        console.warn('Advertencia al cargar contador pendientes:', error);
        setContadorPendientes(stats.pacientesPendientes);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Semáforo de urgencia para pacientes pendientes
  const pacientesPendientes = pacientes.filter(p => p.condicion === 'Pendiente');
  const semaforoUrgencia = {
    rojo: pacientesPendientes.slice(0, Math.ceil(pacientesPendientes.length / 3)),
    amarillo: pacientesPendientes.slice(Math.ceil(pacientesPendientes.length / 3), Math.ceil(2 * pacientesPendientes.length / 3)),
    verde: pacientesPendientes.slice(Math.ceil(2 * pacientesPendientes.length / 3))
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      {/* SIMPLE WELCOME */}
      <div className="px-4 md:px-6 py-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
          ¡Bienvenido, {user?.nombreCompleto || 'Médico'}!
        </h1>
        <p className="text-base text-slate-600 mb-0.5">
          Centro Nacional de Telemedicina - CENATE
        </p>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full mx-auto px-4 md:px-6">
        {/* SECCIÓN PRINCIPAL: Panel Médico */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-2 right-3 text-5xl opacity-15">🏥</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Panel Médico - Tu Espacio de Trabajo</h2>
            <p className="text-blue-100 text-sm mb-4 leading-snug">
              Accede a tus pacientes, gestiona tu disponibilidad y consulta tus reportes de desempeño en telemedicina CENATE.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
              <span className="text-xs font-semibold">🏥 {user?.username?.toUpperCase() || 'MEDICO'}</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN: Acciones Rápidas */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>⚡</span> Acciones Rápidas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Card 1: Pacientes */}
            <button
              onClick={() => navigate('/roles/medico/pacientes')}
              className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-900 transition text-left group text-white"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:bg-white/30 transition">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Pacientes</h4>
              <div className="mb-2">
                <p className="text-3xl font-bold text-white">{stats.pacientesAsignados}</p>
                <p className="text-xs text-purple-100">pacientes asignados</p>
              </div>
              <p className="text-xs text-purple-200">
                {stats.pacientesCitados} citados • {stats.pacientesAtendidos} atendidos
              </p>
            </button>

            {/* Card 2: Producción */}
            <button
              onClick={() => navigate('/roles/medico/produccion')}
              className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-900 transition text-left group text-white"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:bg-white/30 transition">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Producción</h4>
              <p className="text-xs text-blue-100 mb-2">
                Visualiza tu productividad y desempeño en atenciones
              </p>
              <p className="text-xs text-blue-200">
                KPIs, análisis y tendencias
              </p>
            </button>

            {/* Card 3: Mi Información */}
            <button
              onClick={() => navigate('/user/profile')}
              className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-lg p-4 shadow-lg hover:shadow-xl hover:from-cyan-700 hover:to-cyan-900 transition text-left group text-white"
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:bg-white/30 transition">
                <User className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Mi Información</h4>
              <p className="text-xs text-white font-medium mb-1">
                {user?.nombreCompleto || 'Cargando...'}
              </p>
              <p className="text-xs text-cyan-100">
                Perfil y datos profesionales
              </p>
              <p className="text-xs text-cyan-200 mt-2">
                Usuario: <span className="font-mono text-xs">{user?.username}</span>
              </p>
            </button>
          </div>

          {/* Primary CTA */}
          <div className="text-center">
            <button
              onClick={() => navigate('/roles/medico/pacientes')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition inline-flex items-center gap-2 text-sm"
            >
              Ver mis Pacientes
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            ¿Necesitas ayuda? Contacta al equipo de soporte de CENATE o revisa la documentación en tu panel.
          </p>
        </div>
      </div>
    </div>
  );
}

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

// Estilos de animaciones personalizadas
const animationStyles = `
  @keyframes cardFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  @keyframes cardGlow {
    0%, 100% { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }
    50% { box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes iconPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  .card-hover {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .card-hover:hover {
    transform: translateY(-12px) scale(1.02);
    animation: cardGlow 2s ease-in-out infinite;
  }

  .card-icon-hover {
    transition: all 0.3s ease;
  }

  .card-hover:hover .card-icon-hover {
    animation: iconPulse 0.6s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: no-preference) {
    .card-animate {
      animation: slideUp 0.6s ease-out forwards;
    }

    .card-animate:nth-child(2) {
      animation-delay: 0.1s;
    }

    .card-animate:nth-child(3) {
      animation-delay: 0.2s;
    }
  }
`;

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
      <style>{animationStyles}</style>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            {/* Card 1: Pacientes */}
            <button
              onClick={() => navigate('/roles/medico/pacientes')}
              className="card-animate card-hover bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg text-left text-white overflow-hidden relative group"
            >
              {/* Efecto de luz */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="card-icon-hover w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/40 transition-all duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Pacientes</h4>
                <div className="mb-3">
                  <p className="text-4xl font-bold text-white">{stats.pacientesAsignados}</p>
                  <p className="text-sm text-purple-100 mt-1">pacientes asignados</p>
                </div>
                <p className="text-sm text-purple-200 group-hover:text-white transition-colors duration-300">
                  {stats.pacientesCitados} citados • {stats.pacientesAtendidos} atendidos
                </p>
              </div>
            </button>

            {/* Card 2: Producción */}
            <button
              onClick={() => navigate('/roles/medico/produccion')}
              className="card-animate card-hover bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg text-left text-white overflow-hidden relative group"
            >
              {/* Efecto de luz */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="card-icon-hover w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/40 transition-all duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Producción</h4>
                <p className="text-sm text-blue-100 mb-3 group-hover:text-blue-50 transition-colors duration-300">
                  Visualiza tu productividad y desempeño
                </p>
                <p className="text-sm text-blue-200 group-hover:text-white transition-colors duration-300">
                  KPIs, análisis y tendencias
                </p>
              </div>
            </button>

            {/* Card 3: Mi Información */}
            <button
              onClick={() => navigate('/user/profile')}
              className="card-animate card-hover bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-xl p-6 shadow-lg text-left text-white overflow-hidden relative group"
            >
              {/* Efecto de luz */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="card-icon-hover w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/40 transition-all duration-300">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">Mi Información</h4>
                <p className="text-sm text-white font-medium mb-2">
                  {user?.nombreCompleto || 'Cargando...'}
                </p>
                <p className="text-sm text-cyan-100 group-hover:text-cyan-50 transition-colors duration-300">
                  Perfil y datos profesionales
                </p>
                <p className="text-xs text-cyan-200 mt-3 group-hover:text-white transition-colors duration-300">
                  Usuario: <span className="font-mono">{user?.username}</span>
                </p>
              </div>
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

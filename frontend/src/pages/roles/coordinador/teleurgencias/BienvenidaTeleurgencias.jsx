/**
 * 🚑 BienvenidaTeleurgencias.jsx - Bienvenida Coordinador de Teleurgencias
 *
 * Panel de coordinación con mismo diseño que Médico:
 * - Encabezado personalizado
 * - Card de presentación con gradiente
 * - 4 Cards de acciones principales
 * - Botón CTA al dashboard
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

    .card-animate:nth-child(1) {
      animation-delay: 0s;
    }

    .card-animate:nth-child(2) {
      animation-delay: 0.1s;
    }

    .card-animate:nth-child(3) {
      animation-delay: 0.2s;
    }

    .card-animate:nth-child(4) {
      animation-delay: 0.3s;
    }
  }
`;

export default function BienvenidaTeleurgencias() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const acciones = [
    {
      id: 1,
      titulo: 'Dashboard Supervisión',
      descripcion: 'Monitoreo en tiempo real del equipo',
      icono: BarChart3,
      gradient: 'from-blue-600 to-blue-800',
      ruta: '/roles/coordinador/teleurgencias',
    },
    {
      id: 2,
      titulo: 'Mi Perfil',
      descripcion: 'Ver y editar información personal',
      icono: User,
      gradient: 'from-purple-600 to-purple-800',
      ruta: '/perfil',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      <style>{animationStyles}</style>

      {/* SIMPLE WELCOME */}
      <div className="px-4 md:px-6 py-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
          ¡Bienvenido(a), {user?.nombreCompleto || 'Coordinador'}!
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
        {/* SECCIÓN PRINCIPAL: Panel Coordinación */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-2 right-3 text-5xl opacity-15">🚑</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              Panel de Coordinación - Tu Centro de Control
            </h2>
            <p className="text-blue-100 text-sm mb-4 leading-snug">
              Supervisa tu equipo médico, gestiona pacientes y analiza el desempeño en tiempo real de Teleurgencias y Teletriaje CENATE.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
              <span className="text-xs font-semibold">🚑 {user?.username?.toUpperCase() || 'COORDINADOR'}</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN: Acciones Rápidas */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>⚡</span> Acciones Rápidas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
            {acciones.map((accion) => {
              const Icon = accion.icono;
              return (
                <button
                  key={accion.id}
                  onClick={() => navigate(accion.ruta)}
                  className={`card-animate card-hover bg-gradient-to-br ${accion.gradient} rounded-xl p-6 shadow-lg text-left text-white overflow-hidden relative group`}
                >
                  {/* Efecto de luz */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="relative z-10">
                    <div className="card-icon-hover w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/40 transition-all duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{accion.titulo}</h4>
                    <p className="text-sm text-white/90 group-hover:text-white transition-colors duration-300">
                      {accion.descripcion}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Primary CTA */}
          <div className="text-center">
            <button
              onClick={() => navigate('/roles/coordinador/teleurgencias')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition inline-flex items-center gap-2 text-sm"
            >
              Ir al Dashboard
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

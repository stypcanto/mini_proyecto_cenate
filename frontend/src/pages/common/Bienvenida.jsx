// ========================================================================
// 👋 Bienvenida.jsx – Pantalla de Bienvenida para Usuarios (Rediseño v2)
// ------------------------------------------------------------------------
// Nuevo diseño con banner principal, tarjetas de acción y actividades
// Versión: v2.0.0
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  BarChart3,
  Settings,
  FileText,
  Lock,
  ChevronRight,
  Settings2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Bienvenida() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cenate-600"></div>
      </div>
    );
  }

  const actividades = [
    {
      icon: Users,
      titulo: "Gestión de Usuarios",
      descripcion: "Administra cuentas de usuario, asigna roles y permisos según el sistema MBAC (Module-Based Access Control)."
    },
    {
      icon: Shield,
      titulo: "Control de Permisos",
      descripcion: "Configura permisos modulares, gestiona accesos a páginas y funcionalidades del sistema para cada rol."
    },
    {
      icon: BarChart3,
      titulo: "Auditoría del Sistema",
      descripcion: "Revisa logs de actividad, monitorea acciones críticas y genera reportes de auditoría de seguridad."
    },
    {
      icon: Settings,
      titulo: "Configuración del Sistema",
      descripcion: "Administra módulos del sistema, gestiona firma digital, aprueba solicitudes de usuarios y configura parámetros."
    },
    {
      icon: FileText,
      titulo: "Gestión de Personal",
      descripcion: "Administra datos de personal médico, coordinadores, gestores de citas y personal externo del sistema CENATE."
    },
    {
      icon: Lock,
      titulo: "Seguridad",
      descripcion: "Recuerda actualizar tu contraseña cada 90 días para mantener el acceso seguro al sistema."
    }
  ];

  const tarjetasAccion = [
    {
      titulo: "Mi Perfil",
      descripcion: "Consulta tus datos personales, foto, y roles asignados dentro del sistema.",
      icoBg: "bg-blue-100 dark:bg-blue-900/30",
      icoColor: "text-blue-600 dark:text-blue-400",
      icon: Users
    },
    {
      titulo: "Mi Información",
      descripcion: "Actualiza tus datos institucionales, contactos y área de trabajo.",
      icoBg: "bg-green-100 dark:bg-green-900/30",
      icoColor: "text-green-600 dark:text-green-400",
      icon: FileText
    },
    {
      titulo: "Seguridad y Contraseña",
      descripcion: "Gestiona tu contraseña, sesiones activas y dispositivos confiables.",
      icoBg: "bg-purple-100 dark:bg-purple-900/30",
      icoColor: "text-purple-600 dark:text-purple-400",
      icon: Lock
    }
  ];

  return (
    <div className="space-y-8">
      {/* Banner Principal de Bienvenida */}
      <div className="bg-gradient-to-r from-cenate-600 via-cenate-600 to-emerald-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-8">
          {/* Avatar Circular Grande */}
          <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-2 border-white/30 shadow-lg">
            <span className="text-5xl font-bold text-white">4</span>
          </div>

          {/* Contenido Principal */}
          <div className="flex-1 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Bienvenido(a), {user?.nombreCompleto?.split(' ')[0] || user?.username || "Usuario"}
            </h1>
            <p className="text-white/90 text-base leading-relaxed mb-4">
              Este es tu Centro Personal CENATE, un espacio diseñado para que gestiones tu información, revises tus accesos y mantengas actualizados tus datos institucionales dentro de la Intranet.
            </p>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-semibold">
                Rol: <span className="font-bold">{user?.roles?.[0] || "USER"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Acción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tarjetasAccion.map((tarjeta, idx) => (
          <button
            key={idx}
            onClick={() => {
              // Solo navegar si NO es tarjeta 0 o 1
              if (idx === 2) navigate('/user/security');
            }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg transition-all text-left group hover:shadow-2xl hover:scale-105 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: tarjeta.icoBg.includes('blue') ? 'rgba(191, 219, 254, 0.5)' : tarjeta.icoBg.includes('green') ? 'rgba(187, 247, 208, 0.5)' : 'rgba(218, 165, 255, 0.5)' }}>
              <tarjeta.icon className={`w-6 h-6 ${tarjeta.icoColor}`} />
            </div>
            <h3 className="text-lg font-bold mb-2 transition-colors text-gray-800 dark:text-white group-hover:text-cenate-600 dark:group-hover:text-cenate-400">
              {tarjeta.titulo}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tarjeta.descripcion}
            </p>
          </button>
        ))}
      </div>

      {/* Sección Actividades Administrativas */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Settings2 className="w-6 h-6 text-cenate-600 dark:text-cenate-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Actividades Administrativas
          </h2>
        </div>

        {/* Grid de Actividades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actividades.map((actividad, idx) => (
            <button
              key={idx}
              onClick={() => {
                const rutas = [
                  '/admin/usuarios-permisos',      // 0: Gestión de Usuarios
                  '/admin/permisos',                 // 1: Control de Permisos
                  '/admin/logs',                     // 2: Auditoría del Sistema
                  '/admin/modulos',                  // 3: Configuración del Sistema
                  '/admin/usuarios-permisos',        // 4: Gestión de Personal
                  '/user/security'                   // 5: Seguridad
                ];
                if (rutas[idx]) navigate(rutas[idx]);
              }}
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group text-left w-full"
            >
              <div className="p-2 rounded-lg bg-cenate-100 dark:bg-cenate-900/30 flex-shrink-0 group-hover:bg-cenate-200 dark:group-hover:bg-cenate-800/50 transition-colors">
                <actividad.icon className="w-5 h-5 text-cenate-600 dark:text-cenate-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-cenate-600 dark:group-hover:text-cenate-400 transition-colors">
                  {actividad.titulo}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {actividad.descripcion}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cenate-600 transition-colors flex-shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-6 border-t border-gray-200 dark:border-slate-700 mt-8 text-sm text-gray-600 dark:text-gray-400">
        <p>
          CENATE – Centro Nacional de Telemedicina | Plataforma MBAC 2025 © EsSalud
        </p>
        <button className="text-cenate-600 dark:text-cenate-400 hover:text-cenate-700 dark:hover:text-cenate-300 font-medium flex items-center gap-1 transition-colors">
          <Settings2 className="w-4 h-4" />
          Configurar preferencias
        </button>
      </div>
    </div>
  );
}

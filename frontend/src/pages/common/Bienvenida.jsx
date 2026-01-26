// ========================================================================
// 👋 Bienvenida.jsx – Pantalla de Bienvenida para Usuarios
// ------------------------------------------------------------------------
// Muestra información de la cuenta, roles y función asignada del usuario
// Versión: v1.15.18
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle2,
  Info,
  Sparkles,
  FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Bienvenida() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga con un pequeño delay para UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "—";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "—";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cenate-600"></div>
      </div>
    );
  }

  // 🎯 Determinar saludo según género
  const obtenerSaludo = () => {
    const genero = user?.genero?.toUpperCase() || '';
    // Detectar tanto "F"/"M" como "FEMENINO"/"MASCULINO"
    if (genero === 'F' || genero === 'FEMENINO') return '¡Bienvenida al Sistema CENATE!';
    if (genero === 'M' || genero === 'MASCULINO') return '¡Bienvenido al Sistema CENATE!';
    return '¡Bienvenido(a) al Sistema CENATE!'; // Por defecto
  };

  return (
    <div className="space-y-6">
      {/* Header de Bienvenida */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-cenate-600 dark:text-cenate-400" />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            {obtenerSaludo()}
          </h1>
        </div>
        <p className="text-gray-600 text-lg ml-11">
          {formatearFecha(new Date())}
        </p>
      </div>

      {/* Card Principal - Información del Usuario */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-cenate-600 to-cenate-700 p-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cenate-600 to-cenate-700 flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>

              {/* Información Principal */}
              <div className="flex-1 text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {user?.nombreCompleto || "Usuario"}
                </h2>
                <div className="flex items-center gap-2 text-cenate-100">
                  <Mail className="w-4 h-4" />
                  <span>{user?.username || "—"}</span>
                </div>
              </div>

              {/* Badge de Estado */}
              <div className="bg-white bg-opacity-20 px-6 py-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Cuenta Activa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de la Cuenta */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-white">
            {/* DNI */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cenate-100 dark:bg-cenate-900 rounded-lg">
                <FileText className="w-6 h-6 text-cenate-600 dark:text-cenate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">DNI</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {user?.username || "—"}
                </p>
              </div>
            </div>

            {/* Correo Personal adicional si existe */}
            {user?.email && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cenate-100 dark:bg-cenate-900 rounded-lg">
                  <Mail className="w-6 h-6 text-cenate-600 dark:text-cenate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Correo</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card de Roles y Funciones */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-7 h-7 text-cenate-600 dark:text-cenate-400" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Roles y Funciones Asignadas
            </h3>
          </div>

          {/* Lista de Roles */}
          <div className="space-y-4">
            {user?.roles && user.roles.length > 0 ? (
              user.roles.map((rol, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-cenate-50 to-cenate-100 dark:from-cenate-900/30 dark:to-cenate-800/30 rounded-xl border border-cenate-200 dark:border-cenate-700 focus:ring-2 focus:ring-cenate-600 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cenate-600 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-800 dark:text-white">{rol}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {obtenerDescripcionRol(rol)}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                    <span className="text-xs font-semibold text-cenate-600 dark:text-cenate-400">ACTIVO</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Info className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                <p>No se encontraron roles asignados</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sistema de Telemedicina CENATE – EsSalud {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            v1.15.18 | Para soporte técnico: cenate.analista@essalud.gob.pe
          </p>
      </div>
    </div>
  );
}

// Helper para obtener descripción del rol
function obtenerDescripcionRol(rol) {
  const descripciones = {
    "SUPERADMIN": "Acceso completo al sistema y configuración",
    "ADMIN": "Gestión de usuarios y configuración general",
    "MEDICO": "Atención de pacientes y gestión de consultas",
    "COORDINADOR": "Coordinación de agendas y asignaciones",
    "COORDINADOR_RED": "Coordinación de red de IPRESS",
    "EXTERNO": "Acceso desde institución externa",
    "INSTITUCION_EX": "Acceso desde institución externa",
    "GESTOR DE CITAS": "Gestión y administración de citas médicas",
    "GESTOR_CITAS": "Gestión y administración de citas médicas",
    "ENFERMERIA": "Apoyo en atención y seguimiento de pacientes",
    "USER": "Usuario básico del sistema"
  };

  return descripciones[rol] || "Usuario del sistema CENATE";
}

// ========================================================================
// DescripcionRBAC.jsx - Documentación del Sistema RBAC CENATE 2025
// ------------------------------------------------------------------------
// Página informativa que describe el funcionamiento del sistema RBAC
// ========================================================================

import React from 'react';
import {
  Shield,
  Layers,
  FileText,
  Users,
  UserCheck,
  Key,
  ArrowRight,
  CheckCircle,
  Database,
  Settings,
  BookOpen,
  AlertCircle,
  Info
} from 'lucide-react';

export default function DescripcionRBAC() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="w-full">

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-2xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                Sistema RBAC - Control de Acceso
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Role-Based Access Control - Documentación y funcionamiento
              </p>
            </div>
          </div>
        </div>

        {/* Introducción */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                ¿Qué es RBAC?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>RBAC (Role-Based Access Control)</strong> es un sistema de control de acceso que restringe
                el acceso al sistema basándose en los roles asignados a cada usuario. En lugar de asignar permisos
                directamente a cada usuario, los permisos se asignan a roles, y luego los usuarios reciben uno o más roles.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                Este enfoque simplifica la administración de permisos, especialmente en organizaciones grandes,
                ya que solo necesitas modificar los permisos del rol para que todos los usuarios con ese rol
                reciban automáticamente los cambios.
              </p>
            </div>
          </div>
        </div>

        {/* Arquitectura Visual */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-[#0A5BA9]" />
            Arquitectura del Sistema
          </h2>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-slate-700 dark:text-slate-300">
{`┌─────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE MÓDULOS (Master)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. MÓDULOS (/admin/modulos)                                     │
│     └── Crear, editar, eliminar módulos del sistema              │
│         Tabla: dim_modulos_sistema                               │
│                                                                  │
│  2. PÁGINAS (/admin/paginas)                                     │
│     └── Crear, editar, eliminar páginas dentro de cada módulo    │
│         Tabla: dim_paginas_modulo                                │
│                                                                  │
│  3. CONTROL MBAC (/admin/mbac)                                   │
│     └── Asignar permisos de módulos a roles                      │
│         Tabla: segu_permisos_rol_modulo                          │
│     └── Asignar permisos de páginas a roles                      │
│         Tabla: segu_permisos_rol_pagina                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE USUARIOS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  4. Crear usuario → Asignar ROL(es)                              │
│     └── El usuario hereda los permisos del rol                   │
│     └── Ve solo los módulos/páginas que su rol permite           │
│         Tabla: rel_user_roles                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </div>

        {/* Tablas del Sistema */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Layers className="w-6 h-6 text-[#0A5BA9]" />
            Tablas de Base de Datos
          </h2>

          <div className="space-y-4">
            {/* dim_modulos_sistema */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">dim_modulos_sistema</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                Almacena los módulos principales del sistema (menú de navegación).
              </p>
              <div className="flex flex-wrap gap-2">
                {['id_modulo', 'nombre_modulo', 'icono', 'ruta_base', 'descripcion', 'activo', 'orden'].map(campo => (
                  <span key={campo} className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-lg font-mono">
                    {campo}
                  </span>
                ))}
              </div>
            </div>

            {/* dim_paginas_modulo */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">dim_paginas_modulo</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                Almacena las páginas/submenús dentro de cada módulo.
              </p>
              <div className="flex flex-wrap gap-2">
                {['id_pagina', 'id_modulo', 'nombre_pagina', 'ruta_pagina', 'descripcion', 'activo', 'orden'].map(campo => (
                  <span key={campo} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-lg font-mono">
                    {campo}
                  </span>
                ))}
              </div>
            </div>

            {/* dim_roles */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">dim_roles</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                Define los roles del sistema (SUPERADMIN, ADMIN, MEDICO, etc.).
              </p>
              <div className="flex flex-wrap gap-2">
                {['id_rol', 'desc_rol', 'descripcion', 'activo'].map(campo => (
                  <span key={campo} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded-lg font-mono">
                    {campo}
                  </span>
                ))}
              </div>
            </div>

            {/* segu_permisos_rol_modulo */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">segu_permisos_rol_modulo</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                Controla qué roles pueden ver qué módulos.
              </p>
              <div className="flex flex-wrap gap-2">
                {['id_rol', 'id_modulo', 'puede_ver', 'activo'].map(campo => (
                  <span key={campo} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg font-mono">
                    {campo}
                  </span>
                ))}
              </div>
            </div>

            {/* segu_permisos_rol_pagina */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                  <UserCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">segu_permisos_rol_pagina</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                Permisos granulares: qué acciones puede realizar cada rol en cada página.
              </p>
              <div className="flex flex-wrap gap-2">
                {['id_rol', 'id_pagina', 'puede_ver', 'puede_crear', 'puede_editar', 'puede_eliminar', 'puede_exportar', 'activo'].map(campo => (
                  <span key={campo} className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-xs rounded-lg font-mono">
                    {campo}
                  </span>
                ))}
              </div>
            </div>

            {/* rel_user_roles */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">rel_user_roles</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                Relación muchos a muchos entre usuarios y roles.
              </p>
              <div className="flex flex-wrap gap-2">
                {['id_user', 'id_rol'].map(campo => (
                  <span key={campo} className="px-2 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 text-xs rounded-lg font-mono">
                    {campo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Flujo de Funcionamiento */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-[#0A5BA9]" />
            Flujo de Funcionamiento
          </h2>

          <div className="space-y-4">
            {[
              {
                paso: 1,
                titulo: 'Usuario inicia sesión',
                descripcion: 'El usuario ingresa sus credenciales y el sistema valida su identidad.',
                color: 'blue'
              },
              {
                paso: 2,
                titulo: 'Sistema obtiene roles del usuario',
                descripcion: 'Se consulta la tabla rel_user_roles para obtener los roles asignados al usuario.',
                color: 'purple'
              },
              {
                paso: 3,
                titulo: 'Se filtran módulos accesibles',
                descripcion: 'Usando segu_permisos_rol_modulo, se determinan qué módulos puede ver según sus roles.',
                color: 'emerald'
              },
              {
                paso: 4,
                titulo: 'Se filtran páginas con permisos',
                descripcion: 'Para cada módulo, segu_permisos_rol_pagina determina qué páginas puede ver y qué acciones puede realizar.',
                color: 'amber'
              },
              {
                paso: 5,
                titulo: 'Se renderiza el sidebar dinámico',
                descripcion: 'El menú lateral muestra solo los módulos y páginas que el usuario tiene permiso de ver.',
                color: 'rose'
              },
              {
                paso: 6,
                titulo: 'Validación en cada acción',
                descripcion: 'Al intentar crear, editar o eliminar, el sistema verifica los permisos granulares del usuario.',
                color: 'cyan'
              }
            ].map((item) => (
              <div key={item.paso} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center`}>
                  <span className={`text-${item.color}-600 dark:text-${item.color}-400 font-bold`}>{item.paso}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.titulo}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{item.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ejemplo Práctico */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            Ejemplo Práctico: Crear un Nuevo Módulo
          </h2>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Paso 1: Crear el módulo</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                Ir a <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">/admin/modulos</code> y crear "Reportes Médicos" con icono BarChart3
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Paso 2: Crear páginas</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Ir a <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">/admin/paginas</code> y crear: "Dashboard", "Exportar", "Histórico"
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Paso 3: Asignar permisos</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Ir a <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">/admin/mbac</code> y asignar el módulo y páginas al rol "MEDICO" con permisos de ver y exportar
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Paso 4: Asignar rol a usuario</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Ir a Gestión de Usuarios y asignar el rol "MEDICO" al usuario deseado
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Resultado</h3>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm">
                El usuario con rol MEDICO verá el módulo "Reportes Médicos" en su sidebar con las 3 páginas,
                y podrá ver y exportar pero NO crear, editar ni eliminar.
              </p>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            Solución de Problemas
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">El módulo no aparece en el sidebar</h3>
              <ul className="text-slate-600 dark:text-slate-400 text-sm mt-2 space-y-1">
                <li>• Verificar que el módulo tenga <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">activo = true</code></li>
                <li>• Verificar permiso en <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">segu_permisos_rol_modulo</code></li>
                <li>• Verificar que tenga al menos una página con permiso</li>
              </ul>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">El icono muestra Folder por defecto</h3>
              <ul className="text-slate-600 dark:text-slate-400 text-sm mt-2 space-y-1">
                <li>• Verificar que el nombre del icono sea exacto (case-sensitive)</li>
                <li>• Iconos válidos: Settings, Users, Building2, CalendarCheck, Hospital, etc.</li>
              </ul>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">La página da error 404</h3>
              <ul className="text-slate-600 dark:text-slate-400 text-sm mt-2 space-y-1">
                <li>• Verificar que la ruta en <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">ruta_pagina</code> coincida con App.js</li>
                <li>• Verificar que el componente esté importado en App.js</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Iconos Disponibles */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#0A5BA9]" />
            Iconos Disponibles para Módulos
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              'Settings', 'Users', 'Building2', 'CalendarCheck', 'UserCog', 'Hospital',
              'ClipboardList', 'Stethoscope', 'BarChart3', 'Search', 'HeartPulse', 'UsersRound',
              'UserCheck', 'ClipboardCheck', 'FileSearch', 'FileBarChart', 'Folder', 'Shield',
              'Lock', 'Database', 'Server', 'Layers', 'FileText', 'Eye'
            ].map(icono => (
              <div key={icono} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                <code className="text-xs text-slate-700 dark:text-slate-300">{icono}</code>
              </div>
            ))}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 text-center">
            Usar estos nombres exactos en el campo "icono" de dim_modulos_sistema
          </p>
        </div>

      </div>
    </div>
  );
}

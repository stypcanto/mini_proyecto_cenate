// ========================================================================
// 📋 Component Registry - Sistema de Registro de Componentes Dinámicos
// ------------------------------------------------------------------------
// Centraliza el registro de componentes y sus rutas para evitar modificar
// App.js cada vez que se crea una nueva página.
//
// CÓMO USAR:
// 1. Importar componente aquí usando lazy() para code-splitting
// 2. Agregar entrada en el objeto componentRegistry con:
//    - path: Ruta exacta (ej: "/admin/users")
//    - component: Componente lazy-loaded
//    - requiredAction: Acción MBAC requerida (ej: "ver")
//    - requiredRoles: (Opcional) Array de roles específicos
//
// EJEMPLO:
// '/admin/nueva-pagina': {
//   component: lazy(() => import('../pages/admin/NuevaPagina')),
//   requiredAction: 'ver',
//   requiredRoles: ['SUPERADMIN'] // Opcional
// }
// ========================================================================

import { lazy } from 'react';

export const componentRegistry = {
  // ========================================================================
  // 🧭 PANEL ADMINISTRATIVO
  // ========================================================================
  '/admin/dashboard': {
    component: lazy(() => import('../pages/AdminDashboard')),
    requiredAction: 'ver',
  },

  '/admin/users': {
    component: lazy(() => import('../pages/user/UsersManagement')),
    requiredAction: 'ver',
  },

  '/admin/permisos': {
    component: lazy(() => import('../pages/admin/PermisosPage')),
    requiredAction: 'ver',
  },

  '/admin/mbac': {
    component: lazy(() => import('../pages/admin/MBACControl')),
    requiredAction: 'ver',
    requiredRoles: ['SUPERADMIN'],
  },

  '/admin/usuarios-permisos': {
    component: lazy(() => import('../pages/admin/GestionUsuariosPermisos')),
    requiredAction: 'ver',
  },

  '/admin/logs': {
    component: lazy(() => import('../pages/admin/LogsDelSistema')),
    requiredAction: 'ver',
  },

  '/admin/dashboard-medico/cms': {
    component: lazy(() => import('../pages/admin/DashboardMedicoCMS')),
    requiredAction: 'ver',
  },

  '/admin/solicitudes': {
    component: lazy(() => import('../pages/admin/AprobacionSolicitudes')),
    requiredAction: 'ver',
  },

  '/admin/usuarios-pendientes-rol': {
    component: lazy(() => import('../pages/admin/UsuariosPendientesRol')),
    requiredAction: 'ver',
  },

  '/admin/control-firma-digital': {
    component: lazy(() => import('../pages/admin/ControlFirmaDigital')),
    requiredAction: 'ver',
  },

  '/admin/gestion-modulos/descripcion': {
    component: lazy(() => import('../pages/admin/DescripcionRBAC')),
    requiredAction: 'ver',
  },

  '/admin/modulos': {
    component: lazy(() => import('../pages/admin/ModulosManagement')),
    requiredAction: 'ver',
  },

  '/admin/paginas': {
    component: lazy(() => import('../pages/admin/PaginasManagement')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 👤 ÁREA DE USUARIO
  // ========================================================================
  '/user/dashboard': {
    component: lazy(() => import('../pages/user/UserDashboard')),
    requiredAction: 'ver',
  },

  '/user/profile': {
    component: lazy(() => import('../pages/user/Profile')),
    requiredAction: 'ver',
  },

  '/user/detail/:id': {
    component: lazy(() => import('../pages/user/UserDetail')),
    requiredAction: 'ver',
    pathMatch: '/user/detail', // Para MBAC, usar path sin parámetros
  },

  '/user/security': {
    component: lazy(() => import('../pages/user/UserSecurity')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 👨‍⚕️ MÓDULO MÉDICO
  // ========================================================================
  '/roles/medico/dashboard': {
    component: lazy(() => import('../pages/roles/medico/DashboardMedico')),
    requiredAction: 'ver',
  },

  '/roles/medico/pacientes': {
    component: lazy(() => import('../pages/roles/medico/ModuloPacientes')),
    requiredAction: 'ver',
  },

  '/roles/medico/disponibilidad': {
    component: lazy(() => import('../pages/roles/medico/CalendarioDisponibilidad')),
    requiredAction: 'ver',
  },

  '/roles/medico/citas': {
    component: lazy(() => import('../pages/roles/medico/ModuloCitas')),
    requiredAction: 'ver',
  },

  '/roles/medico/indicadores': {
    component: lazy(() => import('../pages/roles/medico/ModuloIndicadores')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📊 MÓDULO COORDINADOR
  // ========================================================================
  '/roles/coordinador/dashboard': {
    component: lazy(() => import('../pages/roles/coordinador/DashboardCoordinador')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/agenda': {
    component: lazy(() => import('../pages/roles/coordinador/ModuloAgenda')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/asignacion': {
    component: lazy(() => import('../pages/roles/coordinador/AsignarGestorMedico')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/sistema-coordinacion': {
    component: lazy(() => import('../pages/roles/coordinador/SistemaCoordinacionMedica')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/gestion-periodos': {
    component: lazy(() => import('../pages/roles/coordinador/GestionPeriodosTurnos')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/revision-disponibilidad': {
    component: lazy(() => import('../pages/roles/coordinador/RevisionDisponibilidad')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 🌐 MÓDULO EXTERNO
  // ========================================================================
  '/roles/externo/dashboard': {
    component: lazy(() => import('../pages/roles/externo/DashboardExterno')),
    requiredAction: 'ver',
  },

  '/roles/externo/reportes': {
    component: lazy(() => import('../pages/roles/externo/ModuloReportes')),
    requiredAction: 'ver',
  },

  '/roles/externo/formulario-diagnostico': {
    component: lazy(() => import('../pages/roles/externo/FormularioDiagnostico')),
    requiredAction: 'ver',
  },

  '/roles/externo/solicitud-turnos': {
    component: lazy(() => import('../pages/roles/externo/FormularioSolicitudTurnos')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📅 MÓDULO CITAS
  // ========================================================================
  '/citas/dashboard': {
    component: lazy(() => import('../pages/roles/citas/DashboardCitas')),
    requiredAction: 'ver',
  },

  '/citas/gestion-pacientes': {
    component: lazy(() => import('../pages/roles/citas/GestionPacientes')),
    requiredAction: 'ver',
  },

  '/citas/gestion-asegurado': {
    component: lazy(() => import('../pages/roles/citas/GestionAsegurado')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📋 COORDINADOR DE GESTIÓN DE CITAS
  // ========================================================================
  '/roles/coordcitas/107': {
    component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
    requiredAction: 'ver',
  },

  '/roles/coordcitas/pacientes-107': {
    component: lazy(() => import('../pages/roles/coordcitas/PacientesDe107')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📋 LINEAMIENTOS
  // ========================================================================
  '/lineamientos/ipress': {
    component: lazy(() => import('../pages/roles/lineamientos/LineamientosIpress')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 🏥 MÓDULO IPRESS
  // ========================================================================
  '/ipress/listado': {
    component: lazy(() => import('../pages/ipress/ListadoIpress')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 👥 MÓDULO DE ASEGURADOS (Sin MBAC - Rutas abiertas)
  // ========================================================================
  '/asegurados/buscar': {
    component: lazy(() => import('../pages/asegurados/BuscarAsegurado')),
    requiredAction: null, // Sin protección MBAC
  },

  '/asegurados/dashboard': {
    component: lazy(() => import('../pages/asegurados/DashboardAsegurados')),
    requiredAction: null, // Sin protección MBAC
  },

  // ========================================================================
  // 🤖 MÓDULO CHATBOT DE CITAS
  // ========================================================================
  '/chatbot/cita': {
    component: lazy(() => import('../pages/chatbot/ChatbotCita')),
    requiredAction: 'ver',
  },

  '/chatbot/busqueda': {
    component: lazy(() => import('../pages/chatbot/ChatbotBusqueda')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 🗺️ GESTIÓN TERRITORIAL
  // ========================================================================
  '/roles/gestionterritorial/diagnosticoipress': {
    component: lazy(() => import('../pages/roles/gestionterritorial/DiagnosticoIpress')),
    requiredAction: 'ver',
  },

  '/roles/gestionterritorial/dashboardredes': {
    component: lazy(() => import('../pages/roles/gestionterritorial/DashboardPorRedes')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 🌐 MÓDULO DE RED - COORDINADORES DE RED
  // ========================================================================
  '/red/dashboard': {
    component: lazy(() => import('../pages/red/RedDashboard')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📊 MÓDULO PROGRAMACIÓN CENATE
  // ========================================================================
  '/programacion/dashboard': {
    component: lazy(() => import('../pages/programacion/ProgramacionCenateDashboard')),
    requiredAction: 'ver',
  },

  '/programacion/detalle/:idPeriodo': {
    component: lazy(() => import('../pages/programacion/ProgramacionCenateDetalle')),
    requiredAction: 'ver',
    pathMatch: '/programacion/detalle', // Para MBAC, usar path sin parámetros
  },
};

// ========================================================================
// 🔧 FUNCIONES HELPER
// ========================================================================

/**
 * Obtiene la información de una ruta registrada
 * @param {string} path - Ruta a buscar
 * @returns {object|null} - Información de la ruta o null si no existe
 */
export const getRouteConfig = (path) => {
  return componentRegistry[path] || null;
};

/**
 * Lista todas las rutas registradas
 * @returns {string[]} - Array de rutas
 */
export const getAllRoutes = () => {
  return Object.keys(componentRegistry);
};

/**
 * Verifica si una ruta está registrada
 * @param {string} path - Ruta a verificar
 * @returns {boolean} - true si existe, false si no
 */
export const isRouteRegistered = (path) => {
  return path in componentRegistry;
};

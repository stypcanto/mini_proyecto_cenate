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
  '/admin/bienvenida': {
    component: lazy(() => import('../pages/common/Bienvenida')),
    requiredAction: 'ver',
  },

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

  '/admin/email-audit': {
    component: lazy(() => import('../pages/admin/EmailAuditLogs')),
    requiredAction: 'ver',
    requiredRoles: ['SUPERADMIN', 'ADMIN'],
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

  '/admin/solicitudes-diagnostico': {
    component: lazy(() => import('../pages/admin/GestionSolicitudesDiagnostico')),
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
  // 🩺 MÓDULO PROFESIONAL DE SALUD (antes: Panel Médico)
  // ========================================================================
  '/roles/profesionaldesalud/bienvenida': {
    component: lazy(() => import('../pages/roles/medico/BienvenidaMedico')),
    requiredAction: 'ver',
  },


  '/roles/profesionaldesalud/disponibilidad': {
    component: lazy(() => import('../pages/roles/medico/disponibilidad/FormularioDisponibilidad')),
    requiredAction: 'ver',
  },

  '/roles/profesionaldesalud/pacientes': {
    component: lazy(() => import('../pages/roles/medico/pacientes/MisPacientes')),
    requiredAction: 'ver',
  },

  '/roles/profesionaldesalud/produccion': {
    component: lazy(() => import('../pages/roles/medico/produccion/Produccion')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📊 MÓDULO COORDINADOR
  // ========================================================================
  '/roles/coordinador/bienvenida': {
    component: lazy(() => import('../pages/common/Bienvenida')),
    requiredAction: 'ver',
  },

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
    component: lazy(() => import('../pages/roles/coordinador/gestion-periodos/GestionPeriodosTurnos')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/revision-disponibilidad': {
    component: lazy(() => import('../pages/roles/coordinador/RevisionDisponibilidad')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/comparativo-disponibilidad': {
    component: lazy(() => import('../pages/roles/coordinador/ComparativoDisponibilidad')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/rendimiento-horario': {
    component: lazy(() => import('../pages/roles/coordinador/RendimientoHorario')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/configuracion-feriados': {
    component: lazy(() => import('../pages/roles/coordinador/ConfiguracionFeriados')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/periodo-disponibilidad-medica': {
    component: lazy(() => import('../pages/roles/coordinador/gestion-periodos-disponibilidad/GestionPeriodosDisponibilidad')),
    requiredAction: 'ver',
  },

  '/roles/coordinador/dashboard-medico': {
    component: lazy(() => import('../pages/roles/coordinador/dashboard-medico/DashboardCoordinadorMedico')),
    requiredAction: 'ver',
    requiredRoles: ['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN'],
  },

  '/roles/coordinador/teleurgencias/bienvenida': {
    component: lazy(() => import('../pages/roles/coordinador/teleurgencias/BienvenidaTeleurgencias')),
    requiredAction: 'ver',
    requiredRoles: ['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN'],
  },

  '/roles/coordinador/teleurgencias': {
    component: lazy(() => import('../pages/roles/coordinador/teleurgencias/DashboardCoordinadorTeleurgencias')),
    requiredAction: 'ver',
    requiredRoles: ['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN'],
  },

  '/roles/coordinador/teleurgencias/estadisticas': {
    component: lazy(() => import('../pages/roles/coordinador/teleurgencias/EstadisticasTeleurgencias')),
    requiredAction: 'ver',
    requiredRoles: ['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN'],
  },

  '/roles/coordinador/teleurgencias/reasignar': {
    component: lazy(() => import('../pages/roles/coordinador/dashboard-medico/DashboardCoordinadorMedico')),
    requiredAction: 'editar',
    requiredRoles: ['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN'],
  },

  '/roles/coordinador/teleurgencias/exportar': {
    component: lazy(() => import('../pages/roles/coordinador/dashboard-medico/DashboardCoordinadorMedico')),
    requiredAction: 'exportar',
    requiredRoles: ['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN'],
  },

  // ========================================================================
  // 🌐 MÓDULO EXTERNO
  // ========================================================================
  '/roles/externo/bienvenida': {
    component: lazy(() => import('../pages/roles/externo/BienvenidaExterno')),
    requiredAction: 'ver',
  },

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
    component: lazy(() => import('../pages/roles/externo/solicitud-turnos/FormularioSolicitudTurnos')),
    requiredAction: 'ver',
  },

  '/roles/externo/gestion-modalidad': {
    component: lazy(() => import('../pages/roles/externo/GestionModalidadAtencion')),
    requiredAction: 'ver',
  },

  '/roles/externo/seguimiento-lecturas': {
    component: lazy(() => import('../pages/roles/externo/SeguimientoLecturasExterno')),
    requiredAction: 'ver',
  },

  '/roles/externo/teleekgs': {
    component: lazy(() => import('../pages/roles/externo/TeleEKGDashboard')),
    requiredAction: 'ver',
    pathMatch: '/roles/externo/teleekgs',
  },

  // ✅ NUEVO v1.66.1: Teleconsulta IPRESS externas
  '/roles/externo/teleconsulta/listado': {
    component: lazy(() => import('../pages/roles/externo/teleconsulta/TeleconsultaListado')),
    requiredAction: 'ver',
  },

  '/roles/externo/teleconsulta/estadisticas': {
    component: lazy(() => import('../pages/roles/externo/teleconsulta/TeleconsultaEstadisticas')),
    requiredAction: 'ver',
  },

  // ✅ NUEVO v1.52.0: IPRESSWorkspace - Split View/Tabs (Upload + Listar) integrados
  '/teleekgs/ipress-workspace': {
    component: lazy(() => import('../pages/roles/externo/teleecgs/IPRESSWorkspace')),
    requiredAction: 'ver',
    requiredRoles: ['EXTERNO', 'INSTITUCION_EX'],
  },

  // ⚠️ DEPRECATED: Rutas antiguas mantenidas para backward compatibility
  // → Redirigen a /teleekgs/ipress-workspace vía App.js redirect
  '/teleekgs/upload': {
    component: lazy(() => import('../pages/roles/externo/teleecgs/IPRESSWorkspace')),
    requiredAction: 'ver',
    requiredRoles: ['EXTERNO', 'INSTITUCION_EX'],
  },

  '/teleekgs/listar': {
    component: lazy(() => import('../pages/roles/externo/teleecgs/IPRESSWorkspace')),
    requiredAction: 'ver',
    requiredRoles: ['EXTERNO', 'INSTITUCION_EX'],
  },

  '/teleekgs/dashboard': {
    component: lazy(() => import('../pages/roles/externo/teleecgs/TeleECGDashboard')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📅 MÓDULO CITAS
  // ========================================================================
  '/citas/bienvenida': {
    component: lazy(() => import('../pages/roles/citas/BienvenidaCitas')),
    requiredAction: 'ver',
  },

  '/citas/dashboard': {
    component: lazy(() => import('../pages/roles/citas/DashboardCitas')),
    requiredAction: 'ver',
  },

  '/citas/gestion-pacientes': {
    component: lazy(() => import('../pages/roles/citas/GestionPacientes')),
    requiredAction: 'ver',
  },

  // ✅ v1.77.0: Renombrado de Gestionar Citas → Citas Pendientes
  '/citas/citas-pendientes': {
    component: lazy(() => import('../pages/roles/citas/GestionAsegurado')),
    requiredAction: 'ver',
  },
  // Alias para compatibilidad con enlaces existentes
  '/citas/gestion-asegurado': {
    component: lazy(() => import('../pages/roles/citas/GestionAsegurado')),
    requiredAction: 'ver',
  },

  '/citas/bolsa-pacientes': {
    component: lazy(() => import('../pages/roles/citas/BolsaPacientesAsignados')),
    requiredAction: 'ver',
  },

  '/citas/citas-agendadas': {
    component: lazy(() => import('../pages/roles/citas/CitasAgendadas')),
    requiredAction: 'ver',
  },

  '/citas/carga-masiva-pacientes': {
    component: lazy(() => import('../pages/roles/citas/CargaMasivaPacientes')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📋 COORDINADOR DE GESTIÓN DE CITAS
  // ========================================================================
  '/roles/coordcitas/bienvenida': {
    component: lazy(() => import('../pages/roles/coordcitas/BienvenidaCoordCitas')),
    requiredAction: 'ver',
  },

  // 📋 PERSONAL 107
  // ========================================================================
  '/roles/personal107/bienvenida': {
    component: lazy(() => import('../pages/roles/personal107/BienvenidaPersonal107')),
    requiredAction: 'ver',
  },

  // ⚠️ DEPRECATED: Rutas de Módulo 107 movidas a /bolsas/modulo107/*
  // Ver sección "MÓDULO 107 (Integración con Bolsas)" para nuevas rutas

  // ========================================================================
  // 👤 ADMISION
  // ========================================================================
  '/roles/admision/asignacion-pacientes': {
    component: lazy(() => import('../pages/roles/admision/AsignacionDePacientes')),
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

  '/ipress/redes': {
    component: lazy(() => import('../pages/ipress/ListadoRedes')),
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

  '/asegurados/duplicados': {
    component: lazy(() => import('../pages/asegurados/RevisarDuplicados')),
    requiredAction: null, // Sin protección MBAC
  },

  '/asegurados/bajas-cenacron': {
    component: lazy(() => import('../pages/asegurados/BajasCenacron')),
    requiredAction: null, // Sin protección MBAC adicional
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

  '/roles/gestionterritorial/respuestas-solicitudes': {
    component: lazy(() => import('../pages/roles/gestionterritorial/RespuestasSolicitudes')),
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

  // MÓDULO ENFERMERÍA eliminado (v1.72.1) — integrado en Panel Profesional de Salud

  // ========================================================================
  // 🫀 MÓDULO TELEECG (ADMIN - Vista Consolidada)
  // ========================================================================
  '/teleecg/recibidas': {
    component: lazy(() => import('../pages/teleecg/TeleECGRecibidas')),
    requiredAction: 'ver',
    requiredRoles: ['ADMIN', 'COORDINADOR', 'COORDINADOR_GESTION_CITAS', 'MEDICO', 'SUPERADMIN'], // ✅ Excluye usuarios EXTERNO
  },

  '/teleecg/estadisticas': {
    component: lazy(() => import('../pages/teleecg/TeleECGEstadisticas')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📊 MÓDULO BOLSAS
  // ========================================================================
  '/bolsas/cargar-excel': {
    component: lazy(() => import('../pages/bolsas/CargarDesdeExcel')),
    requiredAction: 'ver',
  },

  '/bolsas/solicitudespendientes': {
    component: lazy(() => import('../pages/bolsas/Solicitudes')),
    requiredAction: 'ver',
  },

  '/bolsas/solicitudesatendidas': {
    component: lazy(() => import('../pages/bolsas/SolicitudesAtendidas')),
    requiredAction: 'ver',
  },

  '/bolsas/pacientes-rechazados': {
    component: lazy(() => import('../pages/bolsas/PacientesRechazados')),
    requiredAction: 'ver',
  },

  '/bolsas/bolsa-x-medico': {
    component: lazy(() => import('../pages/bolsas/BolsaXMedico')),
    requiredAction: 'ver',
  },

  '/modulos/bolsas/bolsa-x-medico': {
    component: lazy(() => import('../pages/bolsas/BolsaXMedico')),
    requiredAction: 'ver',
  },

  '/bolsas/mi-bandeja': {
    component: lazy(() => import('../pages/bolsas/MiBandeja')),
    requiredAction: 'ver',
    requiredRoles: ['GESTOR_DE_CITAS'],
  },

  '/bolsas/errores-importacion': {
    component: lazy(() => import('../pages/bolsas/ErroresImportacion')),
    requiredAction: 'ver',
  },

  '/bolsas/estadisticas': {
    component: lazy(() => import('../pages/bolsas/EstadisticasDashboard')),
    requiredAction: 'ver',
  },

  '/bolsas/bolsa-x-gestor': {
    component: lazy(() => import('../pages/bolsas/BolsaXGestor')),
    requiredAction: 'ver',
    requiredRoles: ['SUPERADMIN', 'COORDINADOR_GESTION_CITAS', 'GESTOR DE CITAS', 'COORD. GESTION CITAS'],
  },

  '/bolsas/historial': {
    component: lazy(() => import('../pages/bolsas/GestionBolsas')),
    requiredAction: 'ver',
  },

  // ⚠️ DEPRECATED: Rutas antiguas mantenidas para compatibilidad backward
  '/bolsas/gestion-pacientes': {
    component: lazy(() => import('../pages/bolsas/GestionBolsasPacientes')),
    requiredAction: 'ver',
  },

  '/bolsas/gestion': {
    component: lazy(() => import('../pages/bolsas/GestionBolsas')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 🦟 MÓDULO DENGUE (Integración con Bolsas)
  // ========================================================================
  '/dengue/dashboard': {
    component: lazy(() => import('../pages/dengue/DengueDashboard')),
    requiredAction: 'ver',
  },

  '/dengue/cargar-excel': {
    component: lazy(() => import('../pages/dengue/DengueUploadForm')),
    requiredAction: 'crear',
  },

  '/dengue/listar-casos': {
    component: lazy(() => import('../pages/dengue/DengueCasosList')),
    requiredAction: 'ver',
  },

  '/dengue/buscar': {
    component: lazy(() => import('../pages/dengue/DengueCasosList')),
    requiredAction: 'ver',
  },

  '/dengue/resultados': {
    component: lazy(() => import('../pages/dengue/DengueValidationReport')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📋 MÓDULO 107 (Integración con Bolsas)
  // v3.0.0: Migración de módulo independiente a integración dentro de Bolsas
  // ========================================================================
  '/bolsas/modulo107/bienvenida': {
    component: lazy(() => import('../pages/roles/coordcitas/Modulo107Bienvenida')),
    requiredAction: 'ver',
  },

  '/bolsas/modulo107/atenciones-clínicas': {
    component: lazy(() => import('../pages/roles/coordcitas/Modulo107AtencionesClinics')),
    requiredAction: 'ver',
  },

  '/bolsas/modulo107/carga-de-pacientes-107': {
    component: lazy(() => import('../pages/roles/coordcitas/Modulo107CargaPacientes')),
    requiredAction: 'crear',
  },

  '/bolsas/modulo107/pacientes-de-107': {
    component: lazy(() => import('../pages/roles/coordcitas/Modulo107PacientesList')),
    requiredAction: 'ver',
  },

  '/bolsas/modulo107/estadisticas': {
    component: lazy(() => import('../pages/roles/coordcitas/Modulo107EstadisticasAtencion')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 🎧 MÓDULO MESA DE AYUDA (v1.64.0)
  // ========================================================================

  '/mesa-ayuda/bienvenida': {
    component: lazy(() => import('../pages/mesa-ayuda/BienvenidaMesaAyuda')),
    requiredAction: 'ver',
  },

  '/mesa-ayuda/tickets': {
    component: lazy(() => import('../pages/mesa-ayuda/ListaTickets')),
    requiredAction: 'ver',
  },

  '/mesa-ayuda/tickets-pendientes': {
    component: lazy(() => import('../pages/mesa-ayuda/ListaTickets')),
    requiredAction: 'ver',
  },

  '/mesa-ayuda/tickets-atendidos': {
    component: lazy(() => import('../pages/mesa-ayuda/ListaTickets')),
    requiredAction: 'ver',
  },

  '/mesa-ayuda/faqs': {
    component: lazy(() => import('../pages/mesa-ayuda/FAQsMesaAyuda')),
    requiredAction: 'ver',
  },

  '/mesa-ayuda/estadisticas': {
    component: lazy(() => import('../pages/mesa-ayuda/EstadisticasMesaAyuda')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 👩‍⚕️ ENFERMERÍA
  // ========================================================================
  '/enfermeria/trazabilidad-recitas': {
    component: lazy(() => import('../pages/enfermeria/TrazabilidadRecitasInterconsultas')),
    requiredAction: 'ver',
  },
  '/enfermeria/rescatar-paciente': {
    component: lazy(() => import('../pages/enfermeria/RescatarPacienteEnfermeria')),
    requiredAction: 'ver',
  },
  '/enfermeria/total-pacientes-enfermeria': {
    component: lazy(() => import('../pages/enfermeria/TotalPacientesEnfermeria')),
    requiredAction: 'ver',
  },

  // ========================================================================
  // 📊 ESTADÍSTICAS DE PROGRAMACIÓN
  // ========================================================================
  '/estadisticas/programacion': {
    component: lazy(() => import('../pages/estadisticas/EstadisticasProgramacion')),
    requiredAction: 'ver',
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

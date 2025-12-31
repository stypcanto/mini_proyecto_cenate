// ========================================================================
// 📚 auditoriaDiccionario.js – Diccionario de Auditoría CENATE (2025)
// ------------------------------------------------------------------------
// Mapeo completo de módulos y acciones del sistema de auditoría
// Para referencia y visualización clara en la interfaz
// ========================================================================

/**
 * 📋 DICCIONARIO DE MÓDULOS
 * Descripción detallada de cada módulo del sistema
 */
export const MODULOS_AUDITORIA = {
  // 🔐 Autenticación y Seguridad
  AUTH: {
    nombre: "Autenticación",
    descripcion: "Inicio de sesión, cierre de sesión y gestión de sesiones",
    color: "blue",
    icono: "🔐"
  },
  SECURITY: {
    nombre: "Seguridad",
    descripcion: "Gestión de permisos, roles y accesos",
    color: "purple",
    icono: "🛡️"
  },

  // 👥 Gestión de Usuarios
  USUARIOS: {
    nombre: "Gestión de Usuarios",
    descripcion: "Creación, edición, activación y desactivación de usuarios",
    color: "green",
    icono: "👥"
  },
  ACCOUNT_REQUESTS: {
    nombre: "Solicitudes de Cuenta",
    descripcion: "Aprobación y rechazo de solicitudes de registro",
    color: "yellow",
    icono: "📝"
  },

  // 🏥 Módulos Médicos
  DISPONIBILIDAD: {
    nombre: "Disponibilidad Médica",
    descripcion: "Gestión de turnos y disponibilidad de médicos",
    color: "teal",
    icono: "📅"
  },
  SOLICITUD_TURNOS: {
    nombre: "Solicitud de Turnos",
    descripcion: "Solicitudes de turnos médicos por coordinadores",
    color: "cyan",
    icono: "🕐"
  },
  PERIODO_SOLICITUD: {
    nombre: "Períodos de Solicitud",
    descripcion: "Gestión de períodos para solicitudes de turnos",
    color: "indigo",
    icono: "📆"
  },

  // 📄 Firma Digital
  FIRMA_DIGITAL: {
    nombre: "Firma Digital",
    descripcion: "Gestión de tokens y certificados digitales",
    color: "orange",
    icono: "✍️"
  },

  // ⚙️ Sistema
  SYSTEM: {
    nombre: "Sistema",
    descripcion: "Operaciones generales del sistema",
    color: "gray",
    icono: "⚙️"
  },
  CLEANUP: {
    nombre: "Limpieza de Datos",
    descripcion: "Mantenimiento y limpieza de registros huérfanos",
    color: "red",
    icono: "🧹"
  }
};

/**
 * 🎯 DICCIONARIO DE ACCIONES
 * Descripción detallada de cada acción del sistema
 */
export const ACCIONES_AUDITORIA = {
  // 🔐 Autenticación
  LOGIN: {
    nombre: "Inicio de Sesión",
    descripcion: "Usuario inició sesión en el sistema",
    nivel: "INFO",
    categoria: "autenticacion"
  },
  LOGIN_FAILED: {
    nombre: "Intento de Login Fallido",
    descripcion: "Intento de inicio de sesión sin éxito (credenciales incorrectas)",
    nivel: "WARNING",
    categoria: "autenticacion"
  },
  LOGOUT: {
    nombre: "Cierre de Sesión",
    descripcion: "Usuario cerró sesión del sistema",
    nivel: "INFO",
    categoria: "autenticacion"
  },
  PASSWORD_CHANGE: {
    nombre: "Cambio de Contraseña",
    descripcion: "Usuario cambió su contraseña",
    nivel: "INFO",
    categoria: "autenticacion"
  },
  PASSWORD_RESET: {
    nombre: "Recuperación de Contraseña",
    descripcion: "Solicitud de recuperación de contraseña enviada",
    nivel: "INFO",
    categoria: "autenticacion"
  },

  // 👥 Gestión de Usuarios
  CREATE_USER: {
    nombre: "Crear Usuario",
    descripcion: "Nuevo usuario creado en el sistema",
    nivel: "INFO",
    categoria: "usuarios"
  },
  UPDATE_USER: {
    nombre: "Actualizar Usuario",
    descripcion: "Datos de usuario actualizados",
    nivel: "INFO",
    categoria: "usuarios"
  },
  DELETE_USER: {
    nombre: "Eliminar Usuario",
    descripcion: "Usuario eliminado del sistema",
    nivel: "WARNING",
    categoria: "usuarios"
  },
  ACTIVATE_USER: {
    nombre: "Activar Usuario",
    descripcion: "Usuario activado para uso del sistema",
    nivel: "INFO",
    categoria: "usuarios"
  },
  DEACTIVATE_USER: {
    nombre: "Desactivar Usuario",
    descripcion: "Usuario desactivado (no puede iniciar sesión)",
    nivel: "WARNING",
    categoria: "usuarios"
  },
  UNLOCK_USER: {
    nombre: "Desbloquear Usuario",
    descripcion: "Usuario desbloqueado tras múltiples intentos fallidos",
    nivel: "INFO",
    categoria: "usuarios"
  },

  // 📝 Solicitudes de Cuenta
  APPROVE_REQUEST: {
    nombre: "Aprobar Solicitud",
    descripcion: "Solicitud de cuenta aprobada por administrador",
    nivel: "INFO",
    categoria: "solicitudes"
  },
  REJECT_REQUEST: {
    nombre: "Rechazar Solicitud",
    descripcion: "Solicitud de cuenta rechazada",
    nivel: "WARNING",
    categoria: "solicitudes"
  },
  DELETE_PENDING_USER: {
    nombre: "Eliminar Usuario Pendiente",
    descripcion: "Usuario en estado pendiente eliminado",
    nivel: "WARNING",
    categoria: "solicitudes"
  },

  // 📅 Disponibilidad Médica
  CREATE_DISPONIBILIDAD: {
    nombre: "Crear Disponibilidad",
    descripcion: "Nueva disponibilidad de turnos creada",
    nivel: "INFO",
    categoria: "disponibilidad"
  },
  UPDATE_DISPONIBILIDAD: {
    nombre: "Actualizar Disponibilidad",
    descripcion: "Disponibilidad de turnos actualizada",
    nivel: "INFO",
    categoria: "disponibilidad"
  },
  SUBMIT_DISPONIBILIDAD: {
    nombre: "Enviar Disponibilidad",
    descripcion: "Disponibilidad enviada para revisión",
    nivel: "INFO",
    categoria: "disponibilidad"
  },
  DELETE_DISPONIBILIDAD: {
    nombre: "Eliminar Disponibilidad",
    descripcion: "Disponibilidad eliminada",
    nivel: "WARNING",
    categoria: "disponibilidad"
  },
  REVIEW_DISPONIBILIDAD: {
    nombre: "Revisar Disponibilidad",
    descripcion: "Disponibilidad marcada como revisada",
    nivel: "INFO",
    categoria: "disponibilidad"
  },
  ADJUST_DISPONIBILIDAD: {
    nombre: "Ajustar Disponibilidad",
    descripcion: "Turnos de disponibilidad ajustados",
    nivel: "INFO",
    categoria: "disponibilidad"
  },

  // 🕐 Solicitud de Turnos
  CREATE_SOLICITUD: {
    nombre: "Crear Solicitud de Turno",
    descripcion: "Nueva solicitud de turno creada",
    nivel: "INFO",
    categoria: "solicitudes_turnos"
  },
  UPDATE_SOLICITUD: {
    nombre: "Actualizar Solicitud",
    descripcion: "Solicitud de turno actualizada",
    nivel: "INFO",
    categoria: "solicitudes_turnos"
  },
  ENVIAR_SOLICITUD: {
    nombre: "Enviar Solicitud",
    descripcion: "Solicitud de turno enviada para aprobación",
    nivel: "INFO",
    categoria: "solicitudes_turnos"
  },
  REVISAR_SOLICITUD: {
    nombre: "Revisar Solicitud",
    descripcion: "Solicitud de turno revisada",
    nivel: "INFO",
    categoria: "solicitudes_turnos"
  },
  DELETE_SOLICITUD: {
    nombre: "Eliminar Solicitud",
    descripcion: "Solicitud de turno eliminada",
    nivel: "WARNING",
    categoria: "solicitudes_turnos"
  },

  // 📆 Períodos de Solicitud
  CREATE_PERIODO: {
    nombre: "Crear Período",
    descripcion: "Nuevo período de solicitud creado",
    nivel: "INFO",
    categoria: "periodos"
  },
  UPDATE_PERIODO: {
    nombre: "Actualizar Período",
    descripcion: "Período de solicitud actualizado",
    nivel: "INFO",
    categoria: "periodos"
  },
  DELETE_PERIODO: {
    nombre: "Eliminar Período",
    descripcion: "Período de solicitud eliminado",
    nivel: "WARNING",
    categoria: "periodos"
  },
  CAMBIO_ESTADO_PERIODO: {
    nombre: "Cambiar Estado de Período",
    descripcion: "Estado del período modificado (activo/inactivo)",
    nivel: "INFO",
    categoria: "periodos"
  },

  // ✍️ Firma Digital
  CREATE_FIRMA_DIGITAL: {
    nombre: "Registrar Firma Digital",
    descripcion: "Nueva firma digital (token/certificado) registrada",
    nivel: "INFO",
    categoria: "firma_digital"
  },
  UPDATE_FIRMA_DIGITAL: {
    nombre: "Actualizar Firma Digital",
    descripcion: "Datos de firma digital actualizados",
    nivel: "INFO",
    categoria: "firma_digital"
  },
  UPDATE_ENTREGA_TOKEN: {
    nombre: "Registrar Entrega de Token",
    descripcion: "Entrega de token PENDIENTE completada",
    nivel: "INFO",
    categoria: "firma_digital"
  },
  DELETE_FIRMA_DIGITAL: {
    nombre: "Eliminar Firma Digital",
    descripcion: "Registro de firma digital eliminado",
    nivel: "WARNING",
    categoria: "firma_digital"
  },

  // 🧹 Limpieza y Mantenimiento
  CLEANUP_ORPHAN_DATA: {
    nombre: "Limpieza de Datos Huérfanos",
    descripcion: "Registros huérfanos eliminados del sistema",
    nivel: "WARNING",
    categoria: "mantenimiento"
  }
};

/**
 * 📊 NIVELES DE SEVERIDAD
 * Mapeo de niveles con colores y descripciones
 */
export const NIVELES_AUDITORIA = {
  INFO: {
    nombre: "Información",
    descripcion: "Operación normal del sistema",
    color: "blue",
    icono: "ℹ️"
  },
  WARNING: {
    nombre: "Advertencia",
    descripcion: "Operación que requiere atención",
    color: "yellow",
    icono: "⚠️"
  },
  ERROR: {
    nombre: "Error",
    descripcion: "Error en una operación",
    color: "red",
    icono: "❌"
  },
  CRITICAL: {
    nombre: "Crítico",
    descripcion: "Error crítico del sistema",
    color: "red",
    icono: "🚨"
  }
};

/**
 * 🎨 COLORES POR CATEGORÍA
 * Esquema de colores para visualización
 */
export const COLORES_CATEGORIA = {
  autenticacion: {
    light: "bg-blue-50 text-blue-700 border-blue-200",
    medium: "bg-blue-500",
    dark: "text-blue-600"
  },
  usuarios: {
    light: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-green-500",
    dark: "text-green-600"
  },
  solicitudes: {
    light: "bg-yellow-50 text-yellow-700 border-yellow-200",
    medium: "bg-yellow-500",
    dark: "text-yellow-600"
  },
  disponibilidad: {
    light: "bg-teal-50 text-teal-700 border-teal-200",
    medium: "bg-teal-500",
    dark: "text-teal-600"
  },
  solicitudes_turnos: {
    light: "bg-cyan-50 text-cyan-700 border-cyan-200",
    medium: "bg-cyan-500",
    dark: "text-cyan-600"
  },
  periodos: {
    light: "bg-indigo-50 text-indigo-700 border-indigo-200",
    medium: "bg-indigo-500",
    dark: "text-indigo-600"
  },
  firma_digital: {
    light: "bg-orange-50 text-orange-700 border-orange-200",
    medium: "bg-orange-500",
    dark: "text-orange-600"
  },
  mantenimiento: {
    light: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-red-500",
    dark: "text-red-600"
  }
};

/**
 * 🔍 FUNCIONES HELPER
 */

/**
 * Obtiene el nombre legible de un módulo
 * @param {string} modulo - Código del módulo
 * @returns {string} Nombre legible del módulo
 */
export const obtenerNombreModulo = (modulo) => {
  return MODULOS_AUDITORIA[modulo]?.nombre || modulo;
};

/**
 * Obtiene la descripción de un módulo
 * @param {string} modulo - Código del módulo
 * @returns {string} Descripción del módulo
 */
export const obtenerDescripcionModulo = (modulo) => {
  return MODULOS_AUDITORIA[modulo]?.descripcion || "Módulo del sistema";
};

/**
 * Obtiene el icono de un módulo
 * @param {string} modulo - Código del módulo
 * @returns {string} Emoji icono del módulo
 */
export const obtenerIconoModulo = (modulo) => {
  return MODULOS_AUDITORIA[modulo]?.icono || "📋";
};

/**
 * Obtiene el nombre legible de una acción
 * @param {string} accion - Código de la acción
 * @returns {string} Nombre legible de la acción
 */
export const obtenerNombreAccion = (accion) => {
  return ACCIONES_AUDITORIA[accion]?.nombre || accion;
};

/**
 * Obtiene la descripción de una acción
 * @param {string} accion - Código de la acción
 * @returns {string} Descripción de la acción
 */
export const obtenerDescripcionAccion = (accion) => {
  return ACCIONES_AUDITORIA[accion]?.descripcion || "Acción del sistema";
};

/**
 * Obtiene la categoría de una acción
 * @param {string} accion - Código de la acción
 * @returns {string} Categoría de la acción
 */
export const obtenerCategoriaAccion = (accion) => {
  return ACCIONES_AUDITORIA[accion]?.categoria || "general";
};

/**
 * Obtiene el color Tailwind para una categoría
 * @param {string} categoria - Categoría de la acción
 * @param {string} variant - Variante del color ('light', 'medium', 'dark')
 * @returns {string} Clases Tailwind CSS
 */
export const obtenerColorCategoria = (categoria, variant = "light") => {
  return COLORES_CATEGORIA[categoria]?.[variant] || COLORES_CATEGORIA.general?.[variant] || "";
};

/**
 * Obtiene lista de módulos únicos
 * @returns {Array} Lista de módulos con nombre y código
 */
export const obtenerListaModulos = () => {
  return Object.keys(MODULOS_AUDITORIA).map(codigo => ({
    codigo,
    nombre: MODULOS_AUDITORIA[codigo].nombre,
    descripcion: MODULOS_AUDITORIA[codigo].descripcion
  }));
};

/**
 * Obtiene lista de acciones únicas
 * @returns {Array} Lista de acciones con nombre y código
 */
export const obtenerListaAcciones = () => {
  return Object.keys(ACCIONES_AUDITORIA).map(codigo => ({
    codigo,
    nombre: ACCIONES_AUDITORIA[codigo].nombre,
    descripcion: ACCIONES_AUDITORIA[codigo].descripcion,
    categoria: ACCIONES_AUDITORIA[codigo].categoria
  }));
};

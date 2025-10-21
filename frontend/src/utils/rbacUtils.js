/**
 * ==========================================================
 * 🌐 RBAC Utilities – Sistema de Roles y Permisos (Frontend)
 * ==========================================================
 * Este módulo centraliza:
 *  - Constantes de acciones y módulos
 *  - Mapeos de rutas legibles
 *  - Funciones helper para gestión de permisos
 *  - Utilidades de filtrado y visualización
 *  - Mapeo ruta → módulo/acción (para usePermissions)
 * ==========================================================
 */

// ----------------------------------------------------------
// 🧩 Constantes de acciones
// ----------------------------------------------------------
export const ACCIONES = {
  VER: 'ver',
  CREAR: 'crear',
  EDITAR: 'editar',
  ELIMINAR: 'eliminar',
  EXPORTAR: 'exportar',
  APROBAR: 'aprobar',
};

// ----------------------------------------------------------
// 🧱 Constantes de módulos
// ----------------------------------------------------------
export const MODULOS = {
  CITAS: 'Gestión de Citas',
  COORDINADORES: 'Gestión de Coordinadores',
  EXTERNO: 'Gestión de Personal Externo',
  LINEAMIENTOS: 'Lineamientos IPRESS',
  MEDICO: 'Panel Médico',
};

// ----------------------------------------------------------
// 🗺️ Mapeo de rutas → nombres legibles
// ----------------------------------------------------------
export const RUTAS_NOMBRES = {
  '/roles/medico/dashboard': 'Dashboard Médico',
  '/roles/medico/citas': 'Citas del Médico',
  '/roles/medico/pacientes': 'Pacientes',
  '/roles/medico/indicadores': 'Indicadores',
  '/roles/citas/dashboard': 'Dashboard de Citas',
  '/roles/citas/agenda': 'Agenda Médica',
  '/roles/coordinador/dashboard': 'Dashboard Coordinador',
  '/roles/coordinador/agenda': 'Módulo de Agenda',
  '/roles/externo/dashboard': 'Dashboard Externo',
  '/roles/externo/reportes': 'Reportes',
  '/roles/lineamientos/dashboard': 'Dashboard Lineamientos',
  '/roles/lineamientos/registro': 'Registro de Lineamientos',
};

// ----------------------------------------------------------
// 🎯 Funciones principales de validación y filtrado
// ----------------------------------------------------------

export const tienePermisosRequeridos = (
  permisos,
  rutaPagina,
  accionesRequeridas = ['ver']
) => {
  const paginaPermiso = permisos.find((p) => p.rutaPagina === rutaPagina);
  if (!paginaPermiso) return false;
  return accionesRequeridas.every((accion) => paginaPermiso.permisos[accion] === true);
};

export const getPermisosDisponibles = (permisos, rutaPagina) => {
  const paginaPermiso = permisos.find((p) => p.rutaPagina === rutaPagina);
  return paginaPermiso ? paginaPermiso.permisos : {};
};

export const filtrarRutasPermitidas = (permisos, accionRequerida = 'ver') => {
  return permisos
    .filter((p) => p.permisos[accionRequerida])
    .map((p) => ({
      ruta: p.rutaPagina,
      nombre: p.pagina,
      modulo: p.modulo,
    }));
};

export const agruparPorModulo = (permisos) => {
  return permisos.reduce((acc, permiso) => {
    const modulo = permiso.modulo;
    if (!acc[modulo]) acc[modulo] = [];
    acc[modulo].push(permiso);
    return acc;
  }, {});
};

export const tieneAccesoModulo = (permisos, nombreModulo) => {
  return permisos.some((p) => p.modulo === nombreModulo && p.permisos.ver === true);
};

export const getPrimeraRutaDisponible = (permisos) => {
  const rutaPermitida = permisos.find((p) => p.permisos.ver);
  return rutaPermitida ? rutaPermitida.rutaPagina : '/dashboard';
};

export const formatearAccion = (accion) => {
  const nombres = {
    ver: 'Ver',
    crear: 'Crear',
    editar: 'Editar',
    eliminar: 'Eliminar',
    exportar: 'Exportar',
    aprobar: 'Aprobar',
  };
  return nombres[accion] || accion;
};

// ----------------------------------------------------------
// 🧭 Breadcrumbs y visualización
// ----------------------------------------------------------

export const generarBreadcrumbs = (rutaActual, permisos) => {
  const segmentos = rutaActual.split('/').filter(Boolean);
  const breadcrumbs = [{ nombre: 'Inicio', ruta: '/dashboard' }];
  let rutaAcumulada = '';

  segmentos.forEach((segmento) => {
    rutaAcumulada += `/${segmento}`;
    const permiso = permisos.find((p) => p.rutaPagina === rutaAcumulada);
    if (permiso) {
      breadcrumbs.push({ nombre: permiso.pagina, ruta: rutaAcumulada });
    }
  });

  return breadcrumbs;
};

export const getColorModulo = (nombreModulo) => {
  const colores = {
    'Gestión de Citas': 'teal',
    'Gestión de Coordinadores': 'blue',
    'Gestión de Personal Externo': 'purple',
    'Lineamientos IPRESS': 'amber',
    'Panel Médico': 'green',
  };
  return colores[nombreModulo] || 'slate';
};

// ----------------------------------------------------------
// 🧰 Validaciones y transformaciones
// ----------------------------------------------------------

export const esPermisoValido = (permiso) => {
  return (
    permiso &&
    typeof permiso === 'object' &&
    'rutaPagina' in permiso &&
    'permisos' in permiso
  );
};

export const transformarPermisos = (permisosBackend) => {
  if (!Array.isArray(permisosBackend)) return [];
  return permisosBackend
    .filter(esPermisoValido)
    .map((permiso) => ({
      ...permiso,
      tienePermisoCompleto: Object.values(permiso.permisos).every((v) => v === true),
      cantidadPermisos: Object.values(permiso.permisos).filter((v) => v === true).length,
    }));
};

// ----------------------------------------------------------
// 🔗 Nuevo: Mapeo de ruta → módulo / acción
// ----------------------------------------------------------

/**
 * Mapea una ruta de la app a su módulo y acción RBAC.
 * Usado por usePermissions().verificarPermiso()
 */
export const mapRutaAPermiso = (ruta, accion = 'ver') => {
  if (!ruta) return null;

  const path = ruta.toLowerCase().trim();

  const entry = Object.entries(RUTAS_NOMBRES).find(([key]) =>
    path.startsWith(key.toLowerCase())
  );

  if (!entry) {
    console.warn(`[RBAC] Ruta no mapeada en RUTAS_NOMBRES: ${ruta}`);
    return null;
  }

  const [rutaBase, nombrePagina] = entry;
  let modulo = null;

  if (rutaBase.includes('/medico')) modulo = MODULOS.MEDICO;
  else if (rutaBase.includes('/citas')) modulo = MODULOS.CITAS;
  else if (rutaBase.includes('/coordinador')) modulo = MODULOS.COORDINADORES;
  else if (rutaBase.includes('/externo')) modulo = MODULOS.EXTERNO;
  else if (rutaBase.includes('/lineamientos')) modulo = MODULOS.LINEAMIENTOS;

  return { ruta: rutaBase, modulo, accion, nombrePagina };
};

// ----------------------------------------------------------
// 📦 Export global
// ----------------------------------------------------------
export default {
  ACCIONES,
  MODULOS,
  RUTAS_NOMBRES,
  tienePermisosRequeridos,
  getPermisosDisponibles,
  filtrarRutasPermitidas,
  agruparPorModulo,
  tieneAccesoModulo,
  getPrimeraRutaDisponible,
  formatearAccion,
  generarBreadcrumbs,
  getColorModulo,
  esPermisoValido,
  transformarPermisos,
  mapRutaAPermiso,
};
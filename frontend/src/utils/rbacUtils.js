// ========================================================================
// 🧩 rbacUtils.js – Utilidades RBAC / MBAC para CENATE Frontend
// ------------------------------------------------------------------------
// Transforma permisos, filtra rutas y evalúa roles del usuario autenticado
// ========================================================================

export function transformarPermisos(permisos = []) {
  return permisos.map(p => p.toLowerCase());
}

export function tienePermisosRequeridos(userPerms = [], required = []) {
  if (!required.length) return true;
  const normalizados = userPerms.map(p => p.toLowerCase());
  return required.every(p => normalizados.includes(p.toLowerCase()));
}

export function filtrarRutasPermitidas(rutas = [], userPerms = []) {
  return rutas.filter(r => tienePermisosRequeridos(userPerms, r.permisos || []));
}

export function agruparPorModulo(permisos = []) {
  const grupos = {};
  permisos.forEach(p => {
    const [modulo, accion] = p.split(":");
    if (!grupos[modulo]) grupos[modulo] = [];
    grupos[modulo].push(accion || "ver");
  });
  return grupos;
}
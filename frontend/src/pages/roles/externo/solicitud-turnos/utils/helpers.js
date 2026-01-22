/**
 * =======================================================================
 * Funciones Helper para Solicitud de Turnos
 * =======================================================================
 */

/**
 * Formatea una fecha ISO a formato legible en español
 * @param {string} fechaIso - Fecha en formato ISO
 * @returns {string} Fecha formateada (dd/MM/yyyy, HH:mm)
 */
export function formatFecha(fechaIso) {
  if (!fechaIso) return "—";
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return "—";
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio}, ${hora}:${minuto}`;
}

/**
 * Formatea solo la fecha (sin hora) en español
 * @param {string} fechaIso - Fecha en formato ISO
 * @returns {string} Fecha formateada (dd/MM/yyyy)
 */
export function formatSoloFecha(fechaIso) {
  if (!fechaIso) return "—";
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return "—";
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

/**
 * Agrega ceros a la izquierda
 * @param {number} n - Número a formatear
 * @returns {string} Número con dos dígitos
 */
export function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Convierte una fecha a formato ISO YYYY-MM-DD
 * @param {Date} d - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export function isoDateYMD(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Extrae el año de un periodo
 * @param {Object} p - Objeto periodo
 * @returns {string} Año extraído
 */
export function getYearFromPeriodo(p) {
  const f = p?.fechaInicio || p?.fechaFin;
  if (f) {
    const d = new Date(f);
    if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
  }
  const txt = `${p?.descripcion || ""} ${p?.periodo || ""}`;
  const m = txt.match(/\b(2025|2026|2027)\b/);
  return m ? m[1] : "";
}

/**
 * Retorna la clase CSS para el badge según el estado
 * @param {string} estado - Estado de la solicitud
 * @returns {string} Clases CSS
 */
export function estadoBadgeClass(estado) {
  if (estado === "ENVIADO") return "bg-green-100 text-green-700 border-green-300";
  if (estado === "REVISADO") return "bg-purple-100 text-purple-700 border-purple-300";
  if (estado === "APROBADA") return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (estado === "RECHAZADA") return "bg-red-100 text-red-700 border-red-300";
  if (estado === "SIN_SOLICITUD") return "bg-gray-100 text-gray-600 border-gray-300";
  return "bg-yellow-100 text-yellow-800 border-yellow-300"; // BORRADOR u otro
}

/**
 * Retorna el nombre completo del turno
 * @param {string} turno - 'M' o 'T'
 * @returns {string} Nombre del turno
 */
export function nombreTurno(turno) {
  return turno === "M" ? "Mañana" : "Tarde";
}

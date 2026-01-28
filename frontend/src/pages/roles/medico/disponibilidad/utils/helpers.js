/**
 * =======================================================================
 * Helpers - Disponibilidad (Rol Médico)
 * =======================================================================
 * Basado en: roles/externo/solicitud-turnos/utils/helpers.js
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
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, "0");
  const minuto = String(d.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${anio}, ${hora}:${minuto}`;
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
  const m = txt.match(/\b(2020|2021|2022|2023|2024|2025|2026|2027|2028|2029|2030)\b/);
  return m ? m[1] : "";
}

/**
 * Retorna la clase CSS para el badge según el estado
 * @param {string} estado - Estado del periodo
 * @returns {string} Clases CSS
 */
export function estadoBadgeClass(estado) {
  if (estado === "ACTIVO") return "bg-green-100 text-green-700 border-green-300";
  if (estado === "VIGENTE") return "bg-blue-100 text-blue-700 border-blue-300";
  if (estado === "CERRADO") return "bg-orange-100 text-orange-800 border-orange-300";
  if (estado === "BORRADOR") return "bg-yellow-100 text-yellow-800 border-yellow-300";
  if (estado === "ANULADO") return "bg-red-100 text-red-700 border-red-300";
  return "bg-gray-100 text-gray-600 border-gray-300";
}


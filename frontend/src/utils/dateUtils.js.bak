/**
 * Utilidades para manejo de fechas con zona horaria de Lima, Perú (UTC-5)
 */

const TIMEZONE = "America/Lima";
const LOCALE = "es-PE";

/**
 * Formatea una fecha completa con hora
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada o "N/A"
 */
export const formatearFechaHora = (fecha) => {
  if (!fecha) return "N/A";
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "N/A";
  }
};

/**
 * Formatea solo la fecha (sin hora)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada o "N/A"
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "N/A";
  }
};

/**
 * Formatea solo la hora
 * @param {string|Date} fecha - Fecha/hora a formatear
 * @returns {string} Hora formateada o "N/A"
 */
export const formatearHora = (fecha) => {
  if (!fecha) return "N/A";
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Error al formatear hora:", error);
    return "N/A";
  }
};

/**
 * Formatea fecha en formato largo (ej: "4 de diciembre de 2025")
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada o "N/A"
 */
export const formatearFechaLarga = (fecha) => {
  if (!fecha) return "N/A";
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error al formatear fecha larga:", error);
    return "N/A";
  }
};

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param {string|Date} fechaHora - Fecha a comparar
 * @returns {string} Tiempo relativo (ej: "Hace 5 minutos")
 */
export const formatearTiempoRelativo = (fechaHora) => {
  if (!fechaHora) return "Hace un momento";

  try {
    const now = new Date();
    const fecha = new Date(fechaHora);
    if (isNaN(fecha.getTime())) return "Hace un momento";

    const diffMs = now - fecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    if (diffDays < 30) return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;

    return formatearFecha(fecha);
  } catch (error) {
    console.error("Error al calcular tiempo relativo:", error);
    return "Hace un momento";
  }
};

/**
 * Obtiene la fecha actual en Lima, Perú
 * @returns {Date} Fecha actual
 */
export const obtenerFechaActual = () => {
  return new Date();
};

/**
 * Convierte una fecha a formato ISO con zona horaria de Lima
 * @param {Date} fecha - Fecha a convertir
 * @returns {string} Fecha en formato ISO
 */
export const toISOStringLima = (fecha) => {
  if (!fecha) return null;
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch (error) {
    console.error("Error al convertir a ISO:", error);
    return null;
  }
};

/**
 * Formatea fecha para inputs de tipo date (YYYY-MM-DD)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatearParaInput = (fecha) => {
  if (!fecha) return "";
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error al formatear para input:", error);
    return "";
  }
};

export default {
  formatearFechaHora,
  formatearFecha,
  formatearHora,
  formatearFechaLarga,
  formatearTiempoRelativo,
  obtenerFechaActual,
  toISOStringLima,
  formatearParaInput,
  TIMEZONE,
  LOCALE,
};

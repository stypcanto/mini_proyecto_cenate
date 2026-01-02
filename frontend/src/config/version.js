/**
 * Configuración de versión del proyecto CENATE
 * Actualizar este archivo cada vez que se haga un release
 */

export const VERSION = {
  number: "1.15.2",
  name: "Módulo Pacientes de 107 + Mejoras UX",
  date: "2026-01-02",
  description: "Nuevo módulo para gestión de pacientes importados desde Bolsa 107. Mejoras de UX en búsqueda de usuarios (spinner de carga). Fix de compilación backend (Map.of() límite)."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};

export default VERSION;

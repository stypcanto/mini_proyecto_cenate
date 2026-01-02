/**
 * Configuración de versión del proyecto CENATE
 * Actualizar este archivo cada vez que se haga un release
 */

export const VERSION = {
  number: "1.15.3",
  name: "Fix Permisos Pacientes de 107",
  date: "2026-01-02",
  description: "Corrección de permisos para acceso a la página 'Pacientes de 107'. Agregados permisos para SUPERADMIN, ADMIN y COORDINADOR."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};

export default VERSION;

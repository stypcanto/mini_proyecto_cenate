/**
 * Configuración de versión del proyecto CENATE
 * Actualizar este archivo cada vez que se haga un release
 */

export const VERSION = {
  number: "1.12.1",
  name: "Configuración SMTP Corporativo EsSalud",
  date: "2025-12-29",
  description: "Migración del servidor SMTP de Gmail a servidor corporativo de EsSalud (172.20.0.227). Los correos ahora se envían desde cenate.contacto@essalud.gob.pe, resolviendo problemas de bloqueo a correos corporativos."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};

export default VERSION;

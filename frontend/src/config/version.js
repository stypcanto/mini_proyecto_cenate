/**
 * Configuración de versión del proyecto CENATE
 * Actualizar este archivo cada vez que se haga un release
 */

export const VERSION = {
  number: "1.15.8",
  name: "Fix Asignación de Macroregiones",
  date: "2026-01-02",
  description: "Corrección de asignación de 33 redes a sus macroregiones correctas. Todas estaban en LIMA ORIENTE, ahora distribuidas en CENTRO (6), LIMA ORIENTE (6), NORTE (13) y SUR (8)."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};

export default VERSION;

/**
 * Configuración de versión del proyecto CENATE
 * Actualizar este archivo cada vez que se haga un release
 */

export const VERSION = {
  number: "1.37.4",
  name: "Performance Optimization + Deduplicación Automática + Foto Header + SMTP EsSalud",
  date: "2026-01-28",
  description: "Sistema de Telemedicina - EsSalud | v1.37.4: (1) Performance Optimization 100 usuarios concurrentes, (2) Módulo Bolsas v2.2.0 con deduplicación automática KEEP_FIRST, (3) Avatar con foto de perfil en header, (4) SMTP Relay EsSalud configurado, (5) Endpoint /api/health/smtp-test para pruebas de correo."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};

export default VERSION;

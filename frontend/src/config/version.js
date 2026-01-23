/**
 * Configuración de versión del proyecto CENATE
 * Actualizar este archivo cada vez que se haga un release
 */

export const VERSION = {
  number: "1.34.0",
  name: "Solicitudes de Bolsa v1.6.0 + Cargar Excel Mejorado",
  date: "2026-01-23",
  description: "Actualizado módulo de Solicitudes de Bolsa a v1.6.0 con: (1) Integración con dim_estados_gestion_citas (estado inicial PENDIENTE_CITA), (2) Página Cargar desde Excel rediseñada con UX/UI mejorado, (3) Descarga de plantilla Excel, (4) Información clara de campos obligatorios/opcionales, (5) 26 campos en dim_solicitud_bolsa con 8 Foreign Keys. Estados Gestión Citas v1.33.0. Tele-ECG v1.24.0."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};

export default VERSION;

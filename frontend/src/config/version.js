/**
 * Configuración de versión del proyecto CENATE
 * Actualizar este archivo cada vez que se haga un release
 */

export const VERSION = {
  number: "1.34.1",
  name: "Solicitudes de Bolsa v1.6.0 (Cargar desde Excel Mejorado) + Estados Gestión Citas v1.33.0 + Tele-ECG v1.24.0 + Filtros Avanzados Usuarios Pendientes v1.0.0",
  date: "2026-01-23",
  description: "Sistema de Telemedicina - EsSalud | Módulo Solicitudes Bolsa v1.6.0: (1) Integración con dim_estados_gestion_citas (estado inicial PENDIENTE_CITA), (2) Cargar desde Excel con UX/UI mejorado, (3) Descarga plantilla Excel, (4) 26 campos en dim_solicitud_bolsa con 8 Foreign Keys. Estados Gestión Citas v1.33.0: CRUD completo 8 endpoints, 10 estados de gestión. Tele-ECG v1.24.0: Optimización UI v3.2.0 (12 bugs resueltos, performance mejorado). Filtros Avanzados Usuarios Pendientes v1.0.0: Backend-driven filtering (Macrorregión, Red Asistencial, IPRESS, Fechas)."
};

export const APP_INFO = {
  name: "CENATE - Sistema de Telemedicina",
  organization: "EsSalud",
  year: new Date().getFullYear()
};

export default VERSION;

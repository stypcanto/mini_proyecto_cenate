import apiClient from '../lib/apiClient';

const BASE = '/pendientes-mensuales';

/** KPIs globales filtrados por turno */
export const obtenerKpis = async (turno = 'MAÑANA') => {
  const data = await apiClient.get(`${BASE}/kpis?turno=${encodeURIComponent(turno)}`, true);
  return data?.data ?? data;
};

/**
 * Consolidado por médico (paginado + filtros)
 * @param {Object} params - { turno, servicio, subactividad, fechaDesde, fechaHasta, page, size }
 */
export const obtenerConsolidado = async (params = {}) => {
  const qs = new URLSearchParams();
  qs.append('turno', params.turno ?? 'MAÑANA');
  if (params.servicio)      qs.append('servicio', params.servicio);
  if (params.subactividad)  qs.append('subactividad', params.subactividad);
  if (params.fechaDesde)    qs.append('fechaDesde', params.fechaDesde);
  if (params.fechaHasta)    qs.append('fechaHasta', params.fechaHasta);
  qs.append('page', params.page ?? 0);
  qs.append('size', params.size ?? 20);

  const data = await apiClient.get(`${BASE}/consolidado?${qs}`, true);
  return data?.data ?? data;
};

/**
 * Detalle nominal (paginado + filtros + búsqueda)
 * @param {Object} params - { turno, servicio, subactividad, busqueda, fechaDesde, fechaHasta, page, size }
 */
export const obtenerDetalle = async (params = {}) => {
  const qs = new URLSearchParams();
  qs.append('turno', params.turno ?? 'MAÑANA');
  if (params.servicio)      qs.append('servicio', params.servicio);
  if (params.subactividad)  qs.append('subactividad', params.subactividad);
  if (params.busqueda)      qs.append('busqueda', params.busqueda);
  if (params.fechaDesde)    qs.append('fechaDesde', params.fechaDesde);
  if (params.fechaHasta)    qs.append('fechaHasta', params.fechaHasta);
  qs.append('page', params.page ?? 0);
  qs.append('size', params.size ?? 20);

  const data = await apiClient.get(`${BASE}/detalle?${qs}`, true);
  return data?.data ?? data;
};

/**
 * Detalle de pacientes de un médico específico
 * @param {string} dniMedico
 * @param {string} turno
 */
/** Conteos de pacientes por fecha para el calendario */
export const obtenerCalendario = async (turno = 'MAÑANA') => {
  const data = await apiClient.get(
    `/pendientes-mensuales/calendar?turno=${encodeURIComponent(turno)}`, true
  );
  return data?.data ?? data;
};

export const obtenerDetallePorMedico = async (dniMedico, turno = 'MAÑANA') => {
  const data = await apiClient.get(
    `${BASE}/detalle/${dniMedico}?turno=${encodeURIComponent(turno)}`, true
  );
  return data?.data ?? data;
};

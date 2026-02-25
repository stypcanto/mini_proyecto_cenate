import apiClient from '../lib/apiClient';

const BASE = '/pendientes-mensuales';

/**
 * KPIs globales: total médicos, pacientes, abandonos, por subactividad, top servicios
 */
export const obtenerKpis = async () => {
  const data = await apiClient.get(`${BASE}/kpis`, true);
  return data?.data ?? data;
};

/**
 * Consolidado por médico (paginado + filtros)
 * @param {Object} params - { servicio, subactividad, fechaDesde, fechaHasta, page, size }
 */
export const obtenerConsolidado = async (params = {}) => {
  const qs = new URLSearchParams();
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
 * @param {Object} params - { servicio, subactividad, busqueda, fechaDesde, fechaHasta, page, size }
 */
export const obtenerDetalle = async (params = {}) => {
  const qs = new URLSearchParams();
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
 */
export const obtenerDetallePorMedico = async (dniMedico) => {
  const data = await apiClient.get(`${BASE}/detalle/${dniMedico}`, true);
  return data?.data ?? data;
};

import apiClient from '../lib/apiClient';

const BASE = '/gestion-pacientes/coordinador/teleurgencias';

const buildQs = (params) => {
  const entries = Object.entries(params).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
};

/**
 * Servicio frontend para el módulo "Total Pacientes Teleurgencias"
 * Patrón idéntico al de enfermería — v1.79.0
 */
const teleurgenciasService = {
  estadisticasPorMedico: (fecha, turno) =>
    apiClient.get(`${BASE}/estadisticas/por-medico${buildQs({ fecha, turno })}`, true),

  pacientesPorMedico: (idMedico, fecha, turno) =>
    apiClient.get(`${BASE}/pacientes/por-medico${buildQs({ idMedico, fecha, turno })}`, true),

  medicos: () =>
    apiClient.get(`${BASE}/medicos`, true),

  fechasDisponibles: () =>
    apiClient.get(`${BASE}/estadisticas/fechas-disponibles`, true),

  fechasPorMedico: (idMedico) =>
    apiClient.get(`${BASE}/estadisticas/fechas-por-medico?idMedico=${idMedico}`, true),

  reasignarMasivo: (body) =>
    apiClient.put(`${BASE}/reasignar-masivo`, body, true),
};

export default teleurgenciasService;

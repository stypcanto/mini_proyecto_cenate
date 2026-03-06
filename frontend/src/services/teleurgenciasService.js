import apiClient from '../lib/apiClient';

const BASE = '/gestion-pacientes/coordinador/teleurgencias';

const buildQs = (params) => {
  const entries = Object.entries(params).filter(([, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
};

// ─── Función de logging detallado ─────────────────────────────────
const logAPI = (metodo, url, params, respuesta) => {
  console.log('═════════════════════════════════════════════════════════════');
  console.log(`📡 API CALL - ${metodo}`);
  console.log('═════════════════════════════════════════════════════════════');
  console.log(`🔗 URL: ${url}`);
  if (params && Object.keys(params).length > 0) {
    console.log(`📤 PARÁMETROS ENVIADOS:`, params);
  }
  console.log(`📥 RESPUESTA RECIBIDA:`, respuesta);
  console.log('═════════════════════════════════════════════════════════════');
};

/**
 * Servicio frontend para el módulo "Total Pacientes Teleurgencias"
 * Patrón idéntico al de enfermería — v1.79.0
 */
const teleurgenciasService = {
  estadisticasPorMedico: async (fecha, turno) => {
    const params = { fecha, turno };
    const url = `${BASE}/estadisticas/por-medico${buildQs(params)}`;
    const res = await apiClient.get(url, true);
    logAPI('estadisticasPorMedico', url, params, res);
    return res;
  },

  pacientesPorMedico: async (idMedico, fecha, turno) => {
    const params = { idMedico, fecha, turno };
    const url = `${BASE}/pacientes/por-medico${buildQs(params)}`;
    const res = await apiClient.get(url, true);
    logAPI('pacientesPorMedico', url, params, res);
    return res;
  },

  medicos: async () => {
    const url = `${BASE}/medicos`;
    const res = await apiClient.get(url, true);
    logAPI('medicos', url, {}, res);
    return res;
  },

  fechasDisponibles: async () => {
    const url = `${BASE}/estadisticas/fechas-disponibles`;
    const res = await apiClient.get(url, true);
    logAPI('fechasDisponibles', url, {}, res);
    return res;
  },

  fechasPorMedico: async (idMedico) => {
    const params = { idMedico };
    const url = `${BASE}/estadisticas/fechas-por-medico?idMedico=${idMedico}`;
    const res = await apiClient.get(url, true);
    logAPI('fechasPorMedico', url, params, res);
    return res;
  },

  buscarPacientes: async (q, fecha, turno) => {
    const params = { q, fecha, turno };
    const url = `${BASE}/pacientes/buscar${buildQs(params)}`;
    const res = await apiClient.get(url, true);
    logAPI('buscarPacientes', url, params, res);
    return res;
  },

  reasignarMasivo: async (body) => {
    const url = `${BASE}/reasignar-masivo`;
    const res = await apiClient.put(url, body, true);
    logAPI('reasignarMasivo (PUT)', url, body, res);
    return res;
  },
};

export default teleurgenciasService;

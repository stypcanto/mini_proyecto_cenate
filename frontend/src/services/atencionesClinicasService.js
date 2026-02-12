// ========================================================================
// atencionesClinicasService.js - Servicio para gestión de atenciones clínicas
// ------------------------------------------------------------------------
// CENATE 2026 | Servicio para comunicación con API de trazabilidad clínica
// Módulo 107 - Atenciones Clínicas
// ========================================================================

import api from '../../lib/apiClient';

const BASE_URL = '/atenciones-clinicas-107';

export const atencionesClinicasService = {

  /**
   * Listar atenciones clínicas con filtros avanzados
   * @param {Object} filtros - Filtros a aplicar
   * @param {number} pageNumber - Número de página (default: 0)
   * @param {number} pageSize - Tamaño de página (default: 25)
   */
  listarConFiltros: async (filtros = {}, pageNumber = 0, pageSize = 25) => {
    try {
      const params = new URLSearchParams();
      
      // Agregar parámetros de paginación
      params.append('pageNumber', pageNumber.toString());
      params.append('pageSize', pageSize.toString());
      
      // Filtro de Bolsa (OBLIGATORIO: siempre 1 para Módulo 107)
      params.append('idBolsa', '1');
      
      // Agregar filtros si existen y no son valores por defecto
      if (filtros.estado && filtros.estado !== "todos") {
        params.append('estado', filtros.estado);
      }
      
      if (filtros.estadoGestionCitasId && filtros.estadoGestionCitasId !== "todos") {
        params.append('estadoGestionCitasId', filtros.estadoGestionCitasId);
      }
      
      if (filtros.tipoDocumento && filtros.tipoDocumento !== "todos") {
        params.append('tipoDocumento', filtros.tipoDocumento);
      }
      
      if (filtros.pacienteDni) {
        params.append('pacienteDni', filtros.pacienteDni);
      }
      
      if (filtros.fechaDesde) {
        params.append('fechaDesde', filtros.fechaDesde);
      }
      
      if (filtros.fechaHasta) {
        params.append('fechaHasta', filtros.fechaHasta);
      }
      
      if (filtros.idIpress) {
        params.append('idIpress', filtros.idIpress);
      }
      
      // 🆕 Filtros de ubicación geográfica
      if (filtros.macrorregion && filtros.macrorregion !== "todas") {
        params.append('macrorregion', filtros.macrorregion);
      }
      
      if (filtros.red && filtros.red !== "todas") {
        params.append('red', filtros.red);
      }
      
      // Derivación Interna (filtro corregido: nombre del parámetro en backend es 'derivacion')
      if (filtros.derivacionInterna && filtros.derivacionInterna !== "todas") {
        params.append('derivacion', filtros.derivacionInterna);
      }
      
      if (filtros.especialidad && filtros.especialidad !== "todas") {
        params.append('especialidad', filtros.especialidad);
      }
      
      if (filtros.tipoCita && filtros.tipoCita !== "todas") {
        params.append('tipoCita', filtros.tipoCita);
      }
      
      if (filtros.searchTerm) {
        params.append('searchTerm', filtros.searchTerm);
      }
      
      // 🆕 Condición Médica (Pendiente, Atendido, Deserción)
      if (filtros.condicionMedica && filtros.condicionMedica !== "todos") {
        params.append('condicionMedica', filtros.condicionMedica);
      }
      
      const url = `${BASE_URL}/listar?${params.toString()}`;
      const data = await api.get(url);
      return data;
    } catch (error) {
      console.error('Error al listar atenciones clínicas con filtros:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de atenciones clínicas
   */
  obtenerEstadisticas: async () => {
    try {
      const data = await api.get(`${BASE_URL}/estadisticas`);
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  /**
   * 🆕 Obtener estadísticas basadas en condición médica (Pendiente, Atendido, Deserción)
   */
  obtenerEstadisticasCondicionMedica: async () => {
    try {
      const data = await api.get(`${BASE_URL}/estadisticas-condicion-medica`);
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas de condición médica:', error);
      throw error;
    }
  },

  /**
   * Obtener atenciones de un asegurado (paginado)
   * @param {string} pkAsegurado - PK del asegurado
   * @param {number} page - Número de página (default: 0)
   * @param {number} size - Tamaño de página (default: 20)
   */
  obtenerPorAsegurado: async (pkAsegurado, page = 0, size = 20) => {
    try {
      const data = await api.get(`${BASE_URL}/asegurado/${pkAsegurado}?page=${page}&size=${size}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener atenciones del asegurado ${pkAsegurado}:`, error);
      throw error;
    }
  },

  /**
   * Obtener detalle completo de una atención
   * @param {number} idAtencion - ID de la atención
   */
  obtenerDetalle: async (idAtencion) => {
    try {
      const data = await api.get(`${BASE_URL}/${idAtencion}`);
      return data;
    } catch (error) {
      console.error(`Error al obtener detalle de atención ${idAtencion}:`, error);
      throw error;
    }
  },

  /**
   * Obtener las atenciones creadas por el médico actual
   * @param {number} page - Número de página (default: 0)
   * @param {number} size - Tamaño de página (default: 20)
   */
  obtenerMisAtenciones: async (page = 0, size = 20) => {
    try {
      const data = await api.get(`${BASE_URL}/mis-atenciones?page=${page}&size=${size}`);
      return data;
    } catch (error) {
      console.error('Error al obtener mis atenciones:', error);
      throw error;
    }
  },

  /**
   * Crear nueva atención clínica
   * @param {Object} atencionData - Datos de la atención a crear
   */
  crear: async (atencionData) => {
    try {
      const data = await api.post(BASE_URL, atencionData);
      return data;
    } catch (error) {
      console.error('Error al crear atención clínica:', error);
      throw error;
    }
  },

  /**
   * Actualizar atención existente
   * @param {number} idAtencion - ID de la atención
   * @param {Object} atencionData - Datos a actualizar
   */
  actualizar: async (idAtencion, atencionData) => {
    try {
      const data = await api.put(`${BASE_URL}/${idAtencion}`, atencionData);
      return data;
    } catch (error) {
      console.error(`Error al actualizar atención ${idAtencion}:`, error);
      throw error;
    }
  },

  /**
   * Agregar observación de enfermería a una atención
   * @param {number} idAtencion - ID de la atención
   * @param {Object} observacionData - Datos de la observación
   */
  agregarObservacionEnfermeria: async (idAtencion, observacionData) => {
    try {
      const data = await api.put(`${BASE_URL}/${idAtencion}/observacion-enfermeria`, observacionData);
      return data;
    } catch (error) {
      console.error(`Error al agregar observación de enfermería a atención ${idAtencion}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar atención clínica
   * @param {number} idAtencion - ID de la atención a eliminar
   */
  eliminar: async (idAtencion) => {
    try {
      const data = await api.delete(`${BASE_URL}/${idAtencion}`);
      return data;
    } catch (error) {
      console.error(`Error al eliminar atención ${idAtencion}:`, error);
      throw error;
    }
  },

  /**
   * Obtener comparativo de signos vitales con atención anterior
   * Permite visualizar tendencias (mejorando/empeorando/estable)
   * @param {number} idAtencion - ID de la atención actual
   */
  obtenerComparativoSignosVitales: async (idAtencion) => {
    try {
      const data = await api.get(`${BASE_URL}/${idAtencion}/comparativo-signos-vitales`);
      return data;
    } catch (error) {
      console.error(`Error al obtener comparativo de signos vitales para atención ${idAtencion}:`, error);
      throw error;
    }
  },

  // ========================================================================
  // 📊 NUEVOS MÉTODOS DE ESTADÍSTICAS AVANZADAS
  // ========================================================================

  /**
   * 📈 Obtener estadísticas de resumen general
   */
  obtenerEstadisticasResumen: async () => {
    try {
      const data = await api.get(`${BASE_URL}/estadisticas-resumen`);
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas de resumen:', error);
      throw error;
    }
  },

  /**
   * 📅 Obtener estadísticas mensuales
   */
  obtenerEstadisticasMensuales: async () => {
    try {
      const data = await api.get(`${BASE_URL}/estadisticas-mensuales`);
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas mensuales:', error);
      throw error;
    }
  },

  /**
   * 🏥 Obtener estadísticas por IPRESS (Top N)
   * @param {number} limit - Número máximo de resultados (opcional, default: 10)
   */
  obtenerEstadisticasIpress: async (limit = 10) => {
    try {
      const data = await api.get(`${BASE_URL}/estadisticas-ipress?limit=${limit}`);
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas IPRESS:', error);
      throw error;
    }
  },

  /**
   * 🩺 Obtener estadísticas por especialidad
   */
  obtenerEstadisticasEspecialidad: async () => {
    try {
      const data = await api.get(`${BASE_URL}/estadisticas-especialidad`);
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas especialidad:', error);
      throw error;
    }
  },

  /**
   * 📞 Obtener estadísticas por tipo de cita
   */
  obtenerEstadisticasTipoCita: async () => {
    try {
      const data = await api.get(`${BASE_URL}/estadisticas-tipo-cita`);
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas tipo cita:', error);
      throw error;
    }
  }
};

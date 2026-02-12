// ========================================================================
// 👥 ASEGURADOS SERVICE - CENATE 2025
// ========================================================================
// Servicio para interactuar con endpoints de asegurados
// ========================================================================

import apiClient from '../../lib/apiClient';

const aseguradosService = {
  /**
   * Obtener todas las redes disponibles
   */
  getRedes: async () => {
    try {
      return await apiClient.get('/asegurados/filtros/redes');
    } catch (error) {
      console.error('❌ Error al obtener redes:', error);
      throw error;
    }
  },

  /**
   * Obtener IPRESS, opcionalmente filtradas por red
   * @param {number|null} idRed - ID de la red (opcional)
   */
  getIpress: async (idRed = null) => {
    try {
      const endpoint = idRed 
        ? `/asegurados/filtros/ipress?idRed=${idRed}`
        : '/asegurados/filtros/ipress';
      return await apiClient.get(endpoint);
    } catch (error) {
      console.error('❌ Error al obtener IPRESS:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas del dashboard
   * @param {number|null} idRed - ID de la red (opcional)
   * @param {string|null} codIpress - Código de IPRESS (opcional)
   */
  getEstadisticasDashboard: async (idRed = null, codIpress = null) => {
    try {
      const params = new URLSearchParams();
      if (idRed) params.append('idRed', idRed);
      if (codIpress) params.append('codIpress', codIpress);
      
      const queryString = params.toString();
      const endpoint = `/asegurados/dashboard/estadisticas${queryString ? '?' + queryString : ''}`;
      
      return await apiClient.get(endpoint);
    } catch (error) {
      console.error('❌ Error al obtener estadísticas del dashboard:', error);
      throw error;
    }
  },

  /**
   * Listar asegurados con paginación
   * @param {number} page - Número de página
   * @param {number} size - Tamaño de página
   */
  getAsegurados: async (page = 0, size = 25) => {
    try {
      return await apiClient.get(`/asegurados?page=${page}&size=${size}`);
    } catch (error) {
      console.error('❌ Error al listar asegurados:', error);
      throw error;
    }
  },

  /**
   * Buscar asegurado por documento
   * @param {string} docPaciente - Documento del paciente
   */
  getByDocumento: async (docPaciente) => {
    try {
      return await apiClient.get(`/asegurados/doc/${docPaciente}`);
    } catch (error) {
      console.error('❌ Error al buscar asegurado por documento:', error);
      throw error;
    }
  },

  /**
   * Buscar asegurados por nombre con filtros
   * @param {string} q - Término de búsqueda
   * @param {number|null} idRed - ID de red (opcional)
   * @param {string|null} codIpress - Código IPRESS (opcional)
   * @param {number} page - Número de página
   * @param {number} size - Tamaño de página
   */
  buscarAsegurados: async (q, idRed = null, codIpress = null, page = 0, size = 25) => {
    try {
      const params = new URLSearchParams({ q, page, size });
      if (idRed) params.append('idRed', idRed);
      if (codIpress) params.append('codIpress', codIpress);
      
      return await apiClient.get(`/asegurados/buscar?${params.toString()}`);
    } catch (error) {
      console.error('❌ Error al buscar asegurados:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle completo de un asegurado
   * @param {string} pkAsegurado - PK del asegurado
   */
  getDetalle: async (pkAsegurado) => {
    try {
      return await apiClient.get(`/asegurados/detalle/${pkAsegurado}`);
    } catch (error) {
      console.error('❌ Error al obtener detalle del asegurado:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo asegurado
   * @param {Object} aseguradoData - Datos del asegurado
   */
  crear: async (aseguradoData) => {
    try {
      return await apiClient.post('/asegurados', aseguradoData);
    } catch (error) {
      console.error('❌ Error al crear asegurado:', error);
      throw error;
    }
  },

  /**
   * Actualizar un asegurado existente
   * @param {string} pkAsegurado - PK del asegurado
   * @param {Object} aseguradoData - Datos actualizados
   */
  actualizar: async (pkAsegurado, aseguradoData) => {
    try {
      return await apiClient.put(`/asegurados/${pkAsegurado}`, aseguradoData);
    } catch (error) {
      console.error('❌ Error al actualizar asegurado:', error);
      throw error;
    }
  },

  /**
   * Eliminar un asegurado
   * @param {string} pkAsegurado - PK del asegurado
   */
  eliminar: async (pkAsegurado) => {
    try {
      return await apiClient.delete(`/asegurados/${pkAsegurado}`);
    } catch (error) {
      console.error('❌ Error al eliminar asegurado:', error);
      throw error;
    }
  },

  /**
   * Crear asegurado desde módulo TeleEKG
   * @param {Object} datos - {numDoc, nombres, apellidos, fechaNacimiento, genero, telefono, email}
   */
  crearDesdeTelukg: async (datos) => {
    try {
      return await apiClient.post('/asegurados/crear-desde-teleekgs', datos);
    } catch (error) {
      console.error('❌ Error al crear asegurado desde TeleEKG:', error);
      throw error;
    }
  }
};

export default aseguradosService;

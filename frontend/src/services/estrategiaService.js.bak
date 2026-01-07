/**
 * 📋 Servicio de API para gestión de estrategias de pacientes
 * Maneja todas las llamadas REST para asignación de estrategias
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */

import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Crear instancia de axios con configuración por defecto
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Servicio de Estrategia
 */
const EstrategiaService = {
  /**
   * Asigna una estrategia a un paciente
   * @param {Object} request - Datos de asignación
   * @param {string} request.pkAsegurado - ID del paciente
   * @param {number} request.idEstrategia - ID de la estrategia
   * @param {number} request.idAtencionAsignacion - ID de atención (opcional)
   * @param {string} request.observacion - Observación (opcional)
   * @returns {Promise<Object>} Respuesta con los datos de la asignación
   */
  asignarEstrategia: async (request) => {
    try {
      const response = await apiClient.post("/paciente-estrategia", request);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Desasigna (desvincla) una estrategia de un paciente
   * @param {number} idAsignacion - ID de la asignación
   * @param {Object} request - Datos de desasignación
   * @param {string} request.nuevoEstado - INACTIVO o COMPLETADO
   * @param {string} request.observacionDesvinculacion - Observación (opcional)
   * @returns {Promise<Object>} Respuesta con los datos actualizados
   */
  desasignarEstrategia: async (idAsignacion, request) => {
    try {
      const response = await apiClient.put(
        `/paciente-estrategia/${idAsignacion}/desasignar`,
        request
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Obtiene una asignación específica
   * @param {number} idAsignacion - ID de la asignación
   * @returns {Promise<Object>} Datos de la asignación
   */
  obtenerAsignacion: async (idAsignacion) => {
    try {
      const response = await apiClient.get(`/paciente-estrategia/${idAsignacion}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  /**
   * Obtiene todas las estrategias activas de un paciente
   * @param {string} pkAsegurado - ID del paciente
   * @returns {Promise<Array>} Lista de estrategias activas
   */
  obtenerEstrategiasActivas: async (pkAsegurado) => {
    try {
      const response = await apiClient.get(
        `/paciente-estrategia/paciente/${pkAsegurado}/activas`
      );
      console.log("✅ Estrategias activas obtenidas:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Error obteniendo estrategias activas:", error);
      console.error("   Status:", error.response?.status);
      console.error("   Error:", error.response?.data);
      return [];
    }
  },

  /**
   * Obtiene el historial completo de estrategias de un paciente
   * @param {string} pkAsegurado - ID del paciente
   * @param {number} page - Número de página (default: 0)
   * @param {number} size - Tamaño de página (default: 10)
   * @returns {Promise<Object>} Historial de estrategias con paginación
   */
  obtenerHistorialEstrategias: async (pkAsegurado, page = 0, size = 10) => {
    try {
      const response = await apiClient.get(
        `/paciente-estrategia/paciente/${pkAsegurado}/historial?page=${page}&size=${size}`
      );
      console.log("✅ Historial de estrategias obtenido:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo historial:", error);
      console.error("   Status:", error.response?.status);
      console.error("   Error:", error.response?.data);
      return { data: [], total: 0 };
    }
  },

  /**
   * Obtiene los pacientes activos de una estrategia
   * @param {number} idEstrategia - ID de la estrategia
   * @param {number} page - Número de página (default: 0)
   * @param {number} size - Tamaño de página (default: 10)
   * @returns {Promise<Object>} Lista de pacientes con paginación
   */
  obtenerPacientesPorEstrategia: async (idEstrategia, page = 0, size = 10) => {
    try {
      const response = await apiClient.get(
        `/paciente-estrategia/estrategia/${idEstrategia}?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error("Error obteniendo pacientes:", error);
      return { data: [], total: 0 };
    }
  },

  /**
   * Verifica si un paciente tiene asignación activa a una estrategia
   * @param {string} pkAsegurado - ID del paciente
   * @param {number} idEstrategia - ID de la estrategia
   * @returns {Promise<boolean>} true si tiene asignación activa
   */
  verificarAsignacionActiva: async (pkAsegurado, idEstrategia) => {
    try {
      const response = await apiClient.get(
        `/paciente-estrategia/paciente/${pkAsegurado}/verificar/${idEstrategia}`
      );
      return response.data.tieneAsignacionActiva || false;
    } catch (error) {
      console.error("Error verificando asignación:", error);
      return false;
    }
  },

  /**
   * Cuenta los pacientes activos de una estrategia
   * @param {number} idEstrategia - ID de la estrategia
   * @returns {Promise<number>} Cantidad de pacientes activos
   */
  contarPacientesActivos: async (idEstrategia) => {
    try {
      const response = await apiClient.get(
        `/paciente-estrategia/estrategia/${idEstrategia}/contar`
      );
      return response.data.totalPacientesActivos || 0;
    } catch (error) {
      console.error("Error contando pacientes:", error);
      return 0;
    }
  },
};

export default EstrategiaService;

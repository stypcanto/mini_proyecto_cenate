/**
 * Servicio para gestionar Lineamientos e Información IPRESS
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Instancia de axios con configuración por defecto
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================================
// SERVICIOS DE LINEAMIENTOS
// ============================================================================

export const lineamientoService = {
  /**
   * Crear nuevo lineamiento
   */
  crearLineamiento: (data) =>
    api.post('/lineamientos', data),

  /**
   * Actualizar lineamiento
   */
  actualizarLineamiento: (id, data) =>
    api.put(`/lineamientos/${id}`, data),

  /**
   * Obtener lineamiento por ID
   */
  obtenerLineamiento: (id) =>
    api.get(`/lineamientos/${id}`),

  /**
   * Obtener lineamiento por código
   */
  obtenerLineamientoPorCodigo: (codigo) =>
    api.get(`/lineamientos/codigo/${codigo}`),

  /**
   * Listar todos los lineamientos
   */
  listarLineamientos: (page = 0, size = 10) =>
    api.get('/lineamientos', { params: { page, size } }),

  /**
   * Listar lineamientos activos
   */
  listarLineamientosActivos: () =>
    api.get('/lineamientos/activos'),

  /**
   * Buscar lineamientos por categoría
   */
  buscarPorCategoria: (categoria, page = 0, size = 10) =>
    api.get(`/lineamientos/categoria/${categoria}`, { params: { page, size } }),

  /**
   * Cambiar estado de lineamiento
   */
  cambiarEstado: (id, nuevoEstado) =>
    api.patch(`/lineamientos/${id}/estado`, null, { params: { nuevoEstado } }),

  /**
   * Eliminar lineamiento
   */
  eliminarLineamiento: (id) =>
    api.delete(`/lineamientos/${id}`),

  /**
   * Contar lineamientos por estado
   */
  contarPorEstado: (estado) =>
    api.get(`/lineamientos/estadisticas/contar/${estado}`)
};

// ============================================================================
// SERVICIOS DE INFORMACIÓN IPRESS
// ============================================================================

export const informacionIpressService = {
  /**
   * Crear nueva información IPRESS
   */
  crearInformacionIpress: (data) =>
    api.post('/informacion-ipress', data),

  /**
   * Actualizar información IPRESS
   */
  actualizarInformacionIpress: (id, data) =>
    api.put(`/informacion-ipress/${id}`, data),

  /**
   * Obtener información IPRESS por ID
   */
  obtenerInformacionIpress: (id) =>
    api.get(`/informacion-ipress/${id}`),

  /**
   * Obtener informaciones por lineamiento
   */
  obtenerPorLineamiento: (idLineamiento) =>
    api.get(`/informacion-ipress/lineamiento/${idLineamiento}`),

  /**
   * Obtener informaciones por IPRESS
   */
  obtenerPorIpress: (idIpress) =>
    api.get(`/informacion-ipress/ipress/${idIpress}`),

  /**
   * Listar todas las informaciones IPRESS
   */
  listarInformacionesIpress: (page = 0, size = 10) =>
    api.get('/informacion-ipress', { params: { page, size } }),

  /**
   * Cambiar estado de cumplimiento
   */
  cambiarEstadoCumplimiento: (id, nuevoEstado) =>
    api.patch(`/informacion-ipress/${id}/cumplimiento`, null, { params: { nuevoEstado } }),

  /**
   * Eliminar información IPRESS
   */
  eliminarInformacionIpress: (id) =>
    api.delete(`/informacion-ipress/${id}`),

  /**
   * Obtener estadísticas - Contar informaciones que cumplen
   */
  contarCumple: () =>
    api.get('/informacion-ipress/estadisticas/cumple'),

  /**
   * Obtener estadísticas - Contar informaciones de una IPRESS que cumplen
   */
  contarCumpleByIpress: (idIpress) =>
    api.get(`/informacion-ipress/estadisticas/cumple/${idIpress}`)
};

export default {
  lineamientoService,
  informacionIpressService
};

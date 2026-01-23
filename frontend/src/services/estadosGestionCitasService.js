/**
 * 📦 Servicio de API para Estados de Gestión de Citas
 * v1.33.0 - Cliente API para módulo Estados Gestión Citas
 *
 * Base URL: /api/admin/estados-gestion-citas
 *
 * Endpoints:
 * - GET    /api/admin/estados-gestion-citas/todos          → Listar todos
 * - GET    /api/admin/estados-gestion-citas/{id}           → Obtener por ID
 * - GET    /api/admin/estados-gestion-citas/buscar         → Buscar con filtros
 * - POST   /api/admin/estados-gestion-citas                → Crear nuevo
 * - PUT    /api/admin/estados-gestion-citas/{id}           → Actualizar
 * - PATCH  /api/admin/estados-gestion-citas/{id}/estado    → Cambiar estado
 * - DELETE /api/admin/estados-gestion-citas/{id}           → Eliminar
 */

import { apiClient } from '../lib/apiClient';

const BASE_URL = '/api/admin/estados-gestion-citas';

/**
 * Clase de servicio para gestión de estados de citas
 */
class EstadosGestionCitasService {
  /**
   * Obtener todos los estados activos (sin paginación)
   * Útil para llenar selects y dropdowns
   *
   * @returns {Promise<Array>} Array de estados activos
   */
  async obtenerTodos() {
    try {
      const data = await apiClient.get(`${BASE_URL}/todos`, true);
      console.log('✅ Estados de citas cargados:', data?.length || 0);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ Error al obtener estados de citas:', error);
      throw error;
    }
  }

  /**
   * Buscar estados con paginación y filtros
   *
   * @param {string} busqueda - Término de búsqueda (código o descripción)
   * @param {string} estado - Filtro por estado ('A' o 'I')
   * @param {number} page - Número de página (0-indexed)
   * @param {number} size - Cantidad de registros por página
   * @returns {Promise<Object>} Página de resultados con meta-información
   */
  async buscar(busqueda = null, estado = null, page = 0, size = 30) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });

      if (busqueda && busqueda.trim()) {
        params.append('busqueda', busqueda.trim());
      }
      if (estado && estado.trim()) {
        params.append('estado', estado.trim());
      }

      const data = await apiClient.get(`${BASE_URL}/buscar?${params.toString()}`, true);

      // Fallback: si backend devuelve array (error), convertir a Page
      if (Array.isArray(data)) {
        console.warn('⚠️ Backend devolvió array, construyendo objeto Page');
        return {
          content: data.slice(page * size, (page + 1) * size),
          totalElements: data.length,
          totalPages: Math.ceil(data.length / size),
          size: size,
          number: page,
          numberOfElements: Math.min(size, data.length - (page * size)),
          first: page === 0,
          last: page >= Math.ceil(data.length / size) - 1,
          empty: data.length === 0
        };
      }

      console.log('✅ Estados paginados cargados:', data?.content?.length || 0, 'de', data?.totalElements || 0);
      return data;
    } catch (error) {
      console.error('❌ Error al buscar estados de citas:', error);
      throw error;
    }
  }

  /**
   * Obtener un estado por ID
   *
   * @param {number} id - ID del estado
   * @returns {Promise<Object>} Datos del estado
   */
  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`${BASE_URL}/${id}`, true);
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener estado ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo estado
   *
   * @param {Object} estadoData - Datos del estado
   * @param {string} estadoData.codEstadoCita - Código único del estado
   * @param {string} estadoData.descEstadoCita - Descripción del estado
   * @returns {Promise<Object>} Estado creado
   */
  async crear(estadoData) {
    try {
      const response = await apiClient.post(BASE_URL, estadoData, true);
      console.log('✅ Estado de cita creado:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al crear estado de cita:', error);
      throw error;
    }
  }

  /**
   * Actualizar un estado existente
   *
   * @param {number} id - ID del estado a actualizar
   * @param {Object} estadoData - Nuevos datos del estado
   * @param {string} estadoData.codEstadoCita - Código del estado
   * @param {string} estadoData.descEstadoCita - Nueva descripción
   * @returns {Promise<Object>} Estado actualizado
   */
  async actualizar(id, estadoData) {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}`, estadoData, true);
      console.log(`✅ Estado ${id} actualizado:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error al actualizar estado ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cambiar el estado de actividad (A ↔ I)
   *
   * @param {number} id - ID del estado
   * @param {string} nuevoEstado - 'A' (activo) o 'I' (inactivo)
   * @returns {Promise<Object>} Estado actualizado
   */
  async cambiarEstado(id, nuevoEstado) {
    try {
      const response = await apiClient.patch(
        `${BASE_URL}/${id}/estado?nuevoEstado=${nuevoEstado}`,
        {},
        true
      );
      console.log(`✅ Estado ${id} cambiado a ${nuevoEstado}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error al cambiar estado ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar (inactivar) un estado
   *
   * @param {number} id - ID del estado a eliminar
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    try {
      await apiClient.delete(`${BASE_URL}/${id}`, true);
      console.log(`✅ Estado ${id} eliminado`);
    } catch (error) {
      console.error(`❌ Error al eliminar estado ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del módulo
   *
   * @returns {Promise<Object>} Estadísticas (total, activos, inactivos)
   */
  async obtenerEstadisticas() {
    try {
      const data = await apiClient.get(`${BASE_URL}/estadisticas`, true);
      console.log('✅ Estadísticas cargadas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

export const estadosGestionCitasService = new EstadosGestionCitasService();
export default estadosGestionCitasService;

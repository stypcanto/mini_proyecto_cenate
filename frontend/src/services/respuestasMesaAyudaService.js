/**
 * Servicio de API para Respuestas Predefinidas de Mesa de Ayuda
 * v1.65.10 - Cliente API para módulo Respuestas Mesa de Ayuda
 *
 * Base URL: /api/admin/respuestas-mesa-ayuda
 */

import { apiClient } from '../lib/apiClient';

const BASE_URL = '/api/admin/respuestas-mesa-ayuda';

class RespuestasMesaAyudaService {
  async obtenerTodos() {
    try {
      const data = await apiClient.get(`${BASE_URL}/todos`, true);
      console.log('Respuestas mesa ayuda cargadas:', data?.length || 0);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener respuestas mesa ayuda:', error);
      throw error;
    }
  }

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

      if (Array.isArray(data)) {
        console.warn('Backend devolvio array, construyendo objeto Page');
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

      console.log('Respuestas paginadas cargadas:', data?.content?.length || 0, 'de', data?.totalElements || 0);
      return data;
    } catch (error) {
      console.error('Error al buscar respuestas mesa ayuda:', error);
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`${BASE_URL}/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener respuesta ${id}:`, error);
      throw error;
    }
  }

  async crear(data) {
    try {
      const response = await apiClient.post(BASE_URL, data, true);
      console.log('Respuesta mesa ayuda creada:', response);
      return response;
    } catch (error) {
      console.error('Error al crear respuesta mesa ayuda:', error);
      throw error;
    }
  }

  async actualizar(id, data) {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}`, data, true);
      console.log(`Respuesta ${id} actualizada:`, response);
      return response;
    } catch (error) {
      console.error(`Error al actualizar respuesta ${id}:`, error);
      throw error;
    }
  }

  async cambiarEstado(id, nuevoEstado) {
    try {
      const response = await apiClient.patch(
        `${BASE_URL}/${id}/estado?nuevoEstado=${nuevoEstado}`,
        {},
        true
      );
      console.log(`Respuesta ${id} cambiada a ${nuevoEstado}:`, response);
      return response;
    } catch (error) {
      console.error(`Error al cambiar estado respuesta ${id}:`, error);
      throw error;
    }
  }

  async eliminar(id) {
    try {
      await apiClient.delete(`${BASE_URL}/${id}`, true);
      console.log(`Respuesta ${id} eliminada`);
    } catch (error) {
      console.error(`Error al eliminar respuesta ${id}:`, error);
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const data = await apiClient.get(`${BASE_URL}/estadisticas`, true);
      console.log('Estadisticas respuestas cargadas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener estadisticas:', error);
      throw error;
    }
  }
}

export const respuestasMesaAyudaService = new RespuestasMesaAyudaService();
export default respuestasMesaAyudaService;

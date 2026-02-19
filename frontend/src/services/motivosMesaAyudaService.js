/**
 * Servicio de API para Motivos de Mesa de Ayuda
 * v1.65.0 - Cliente API para módulo Motivos Mesa de Ayuda
 *
 * Base URL: /api/admin/motivos-mesa-ayuda
 */

import { apiClient } from '../lib/apiClient';

const BASE_URL = '/api/admin/motivos-mesa-ayuda';

class MotivosMesaAyudaService {
  async obtenerTodos() {
    try {
      const data = await apiClient.get(`${BASE_URL}/todos`, true);
      console.log('Motivos mesa ayuda cargados:', data?.length || 0);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener motivos mesa ayuda:', error);
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

      console.log('Motivos paginados cargados:', data?.content?.length || 0, 'de', data?.totalElements || 0);
      return data;
    } catch (error) {
      console.error('Error al buscar motivos mesa ayuda:', error);
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      const data = await apiClient.get(`${BASE_URL}/${id}`, true);
      return data;
    } catch (error) {
      console.error(`Error al obtener motivo ${id}:`, error);
      throw error;
    }
  }

  async crear(motivoData) {
    try {
      const response = await apiClient.post(BASE_URL, motivoData, true);
      console.log('Motivo mesa ayuda creado:', response);
      return response;
    } catch (error) {
      console.error('Error al crear motivo mesa ayuda:', error);
      throw error;
    }
  }

  async actualizar(id, motivoData) {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}`, motivoData, true);
      console.log(`Motivo ${id} actualizado:`, response);
      return response;
    } catch (error) {
      console.error(`Error al actualizar motivo ${id}:`, error);
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
      console.log(`Motivo ${id} cambiado a ${nuevoEstado}:`, response);
      return response;
    } catch (error) {
      console.error(`Error al cambiar estado motivo ${id}:`, error);
      throw error;
    }
  }

  async eliminar(id) {
    try {
      await apiClient.delete(`${BASE_URL}/${id}`, true);
      console.log(`Motivo ${id} eliminado`);
    } catch (error) {
      console.error(`Error al eliminar motivo ${id}:`, error);
      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const data = await apiClient.get(`${BASE_URL}/estadisticas`, true);
      console.log('Estadisticas motivos cargadas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener estadisticas:', error);
      throw error;
    }
  }
}

export const motivosMesaAyudaService = new MotivosMesaAyudaService();
export default motivosMesaAyudaService;

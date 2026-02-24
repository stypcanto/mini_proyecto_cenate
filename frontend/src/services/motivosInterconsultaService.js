/**
 * Servicio de API para Motivos de Interconsulta
 * v1.0.0 - Cliente API para módulo Motivos Interconsulta
 *
 * Base URL: /api/admin/motivos-interconsulta
 */

import { apiClient } from '../lib/apiClient';

const BASE_URL = '/api/admin/motivos-interconsulta';

class MotivosInterconsultaService {
  async obtenerTodos() {
    const data = await apiClient.get(`${BASE_URL}/todos`, true);
    return Array.isArray(data) ? data : [];
  }

  async buscar(busqueda = null, estado = null, page = 0, size = 30) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (busqueda && busqueda.trim()) params.append('busqueda', busqueda.trim());
    if (estado && estado.trim()) params.append('estado', estado.trim());

    const data = await apiClient.get(`${BASE_URL}/buscar?${params.toString()}`, true);

    if (Array.isArray(data)) {
      return {
        content: data.slice(page * size, (page + 1) * size),
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil(data.length / size) - 1,
        empty: data.length === 0
      };
    }
    return data;
  }

  async obtenerPorId(id) {
    return await apiClient.get(`${BASE_URL}/${id}`, true);
  }

  async crear(data) {
    return await apiClient.post(BASE_URL, data, true);
  }

  async actualizar(id, data) {
    return await apiClient.put(`${BASE_URL}/${id}`, data, true);
  }

  async cambiarEstado(id, nuevoEstado) {
    return await apiClient.patch(`${BASE_URL}/${id}/estado?nuevoEstado=${nuevoEstado}`, {}, true);
  }

  async eliminar(id) {
    await apiClient.delete(`${BASE_URL}/${id}`, true);
  }

  async obtenerEstadisticas() {
    return await apiClient.get(`${BASE_URL}/estadisticas`, true);
  }
}

export const motivosInterconsultaService = new MotivosInterconsultaService();
export default motivosInterconsultaService;

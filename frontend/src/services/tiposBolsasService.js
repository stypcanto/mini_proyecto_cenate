/**
 * 📦 Servicio de API para Tipos de Bolsas
 *
 * Endpoints:
 * - GET    /api/admin/tipos-bolsas/todos          → Listar todos
 * - GET    /api/admin/tipos-bolsas/{id}           → Obtener por ID
 * - GET    /api/admin/tipos-bolsas/buscar         → Buscar con filtros
 * - POST   /api/admin/tipos-bolsas                → Crear nuevo
 * - PUT    /api/admin/tipos-bolsas/{id}           → Actualizar
 * - PATCH  /api/admin/tipos-bolsas/{id}/estado    → Cambiar estado
 * - DELETE /api/admin/tipos-bolsas/{id}           → Eliminar
 */

import { apiClient } from '../lib/apiClient';

const BASE_URL = '/tipos-bolsas';

class TiposBolsasService {
    /**
     * Obtener todos los tipos de bolsas activos (sin paginación)
     * @returns {Promise<Array>} Lista de tipos de bolsas
     */
    async obtenerTodos() {
        try {
            const data = await apiClient.get(`${BASE_URL}/todos`, true);
            console.log('✅ Tipos de bolsas cargados:', data?.length || 0);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error al obtener tipos de bolsas:', error);
            throw error;
        }
    }

    /**
     * Buscar tipos de bolsas con paginación y filtros
     * @param {string} busqueda - Búsqueda por código o descripción (opcional)
     * @param {string} estado - Filtro por estado 'A' o 'I' (opcional)
     * @param {number} page - Número de página (0-indexed)
     * @param {number} size - Tamaño de página
     * @returns {Promise<Object>} Objeto Page con content, totalElements, totalPages, etc.
     */
    async buscar(busqueda = null, estado = null, page = 0, size = 30) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });

            // Agregar filtros de búsqueda si existen
            if (busqueda && busqueda.trim()) {
                params.append('busqueda', busqueda.trim());
            }
            if (estado && estado.trim()) {
                params.append('estado', estado.trim());
            }

            const data = await apiClient.get(`${BASE_URL}/buscar?${params.toString()}`, true);

            // Manejar respuesta: puede ser un array o un objeto Page
            if (Array.isArray(data)) {
                // Si es un array, construir objeto Page manualmente
                console.warn('⚠️ Backend devolvió array en lugar de Page, construyendo objeto Page manualmente');
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

            console.log('✅ Tipos de bolsas paginados cargados:', data?.content?.length || 0, 'de', data?.totalElements || 0);
            return data;
        } catch (error) {
            console.error('Error al buscar tipos de bolsas:', error);
            throw error;
        }
    }

    /**
     * Obtener un tipo de bolsa por ID
     * @param {number} id - ID del tipo de bolsa
     * @returns {Promise<Object>} Tipo de bolsa encontrado
     */
    async obtenerPorId(id) {
        try {
            const data = await apiClient.get(`${BASE_URL}/${id}`, true);
            return data;
        } catch (error) {
            console.error(`Error al obtener tipo de bolsa ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear un nuevo tipo de bolsa
     * @param {Object} tipoBolsaData - Datos del tipo de bolsa
     * @param {string} tipoBolsaData.codTipoBolsa - Código del tipo de bolsa
     * @param {string} tipoBolsaData.descTipoBolsa - Descripción del tipo de bolsa
     * @returns {Promise<Object>} Tipo de bolsa creado
     */
    async crear(tipoBolsaData) {
        try {
            const response = await apiClient.post(BASE_URL, tipoBolsaData, true);
            console.log('✅ Tipo de bolsa creado:', response);
            return response;
        } catch (error) {
            console.error('Error al crear tipo de bolsa:', error);
            throw error;
        }
    }

    /**
     * Actualizar un tipo de bolsa existente
     * @param {number} id - ID del tipo de bolsa
     * @param {Object} tipoBolsaData - Datos actualizados
     * @returns {Promise<Object>} Tipo de bolsa actualizado
     */
    async actualizar(id, tipoBolsaData) {
        try {
            const response = await apiClient.put(`${BASE_URL}/${id}`, tipoBolsaData, true);
            console.log(`✅ Tipo de bolsa ${id} actualizado:`, response);
            return response;
        } catch (error) {
            console.error(`Error al actualizar tipo de bolsa ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cambiar el estado de un tipo de bolsa (A <-> I)
     * @param {number} id - ID del tipo de bolsa
     * @param {string} nuevoEstado - Nuevo estado ('A' o 'I')
     * @returns {Promise<Object>} Tipo de bolsa actualizado
     */
    async cambiarEstado(id, nuevoEstado) {
        try {
            const response = await apiClient.patch(
                `${BASE_URL}/${id}/estado?nuevoEstado=${nuevoEstado}`,
                {},
                true
            );
            console.log(`✅ Estado del tipo de bolsa ${id} cambiado a ${nuevoEstado}:`, response);
            return response;
        } catch (error) {
            console.error(`Error al cambiar estado del tipo de bolsa ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar un tipo de bolsa
     * @param {number} id - ID del tipo de bolsa
     * @returns {Promise<void>}
     */
    async eliminar(id) {
        try {
            await apiClient.delete(`${BASE_URL}/${id}`, true);
            console.log(`✅ Tipo de bolsa ${id} eliminado`);
        } catch (error) {
            console.error(`Error al eliminar tipo de bolsa ${id}:`, error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de tipos de bolsas
     * @returns {Promise<Object>} Estadísticas
     */
    async obtenerEstadisticas() {
        try {
            const data = await apiClient.get(`${BASE_URL}/estadisticas`, true);
            console.log('✅ Estadísticas de tipos de bolsas cargadas:', data);
            return data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
}

export const tiposBolsasService = new TiposBolsasService();
export default tiposBolsasService;

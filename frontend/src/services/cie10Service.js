/**
 * 🏥 Servicio de API para CIE10 (dim_cie10)
 * 
 * Endpoints:
 * - GET    /api/admin/cie10           → Listar todos
 * - GET    /api/admin/cie10/{id}      → Obtener por ID
 * - POST   /api/admin/cie10           → Crear nuevo
 * - PUT    /api/admin/cie10/{id}      → Actualizar
 * - DELETE /api/admin/cie10/{id}      → Eliminar
 */

import { apiClient } from '../lib/apiClient';

const BASE_URL = '/admin/cie10';

class Cie10Service {
    /**
     * Obtener todos los CIE10 (sin paginación)
     * @returns {Promise<Array>} Lista de CIE10
     */
    async obtenerTodos() {
        try {
            const data = await apiClient.get(BASE_URL, true);
            console.log('✅ CIE10 cargados:', data?.length || 0);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error al obtener CIE10:', error);
            throw error;
        }
    }

    /**
     * Obtener CIE10 paginados con búsqueda opcional
     * @param {number} page - Número de página (0-indexed)
     * @param {number} size - Tamaño de página
     * @param {string} sortBy - Campo de ordenamiento (default: 'idCie10')
     * @param {string} direction - Dirección de ordenamiento ('asc' o 'desc', default: 'asc')
     * @param {string} codigo - Filtro por código (opcional)
     * @param {string} descripcion - Filtro por descripción (opcional)
     * @returns {Promise<Object>} Objeto con content, totalElements, totalPages, etc.
     */
    async obtenerTodosPaginados(page = 0, size = 30, sortBy = 'idCie10', direction = 'asc', codigo = null, descripcion = null) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sortBy: sortBy,
                direction: direction
            });
            
            // Agregar filtros de búsqueda si existen
            if (codigo && codigo.trim()) {
                params.append('codigo', codigo.trim());
            }
            if (descripcion && descripcion.trim()) {
                params.append('descripcion', descripcion.trim());
            }
            
            const data = await apiClient.get(`/admin/cie10?${params.toString()}`, true);
            
            // Manejar respuesta: puede ser un array (sin paginación) o un objeto Page
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
            
            // Si es un objeto Page, usarlo directamente
            console.log('✅ CIE10 paginados cargados:', data?.content?.length || 0, 'de', data?.totalElements || 0);
            return data;
        } catch (error) {
            console.error('Error al obtener CIE10 paginados:', error);
            throw error;
        }
    }

    /**
     * Obtener un CIE10 por ID
     * @param {number} id - ID del CIE10
     * @returns {Promise<Object>} CIE10 encontrado
     */
    async obtenerPorId(id) {
        try {
            const data = await apiClient.get(`/admin/cie10/${id}`, true);
            return data;
        } catch (error) {
            console.error(`Error al obtener CIE10 ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear un nuevo CIE10
     * @param {Object} cie10Data - Datos del CIE10
     * @returns {Promise<Object>} CIE10 creado
     */
    async crear(cie10Data) {
        try {
            const response = await apiClient.post('/admin/cie10', cie10Data, true);
            console.log('✅ CIE10 creado:', response);
            return response;
        } catch (error) {
            console.error('Error al crear CIE10:', error);
            throw error;
        }
    }

    /**
     * Actualizar un CIE10 existente
     * @param {number} id - ID del CIE10
     * @param {Object} cie10Data - Datos actualizados
     * @returns {Promise<Object>} CIE10 actualizado
     */
    async actualizar(id, cie10Data) {
        try {
            const response = await apiClient.put(`/admin/cie10/${id}`, cie10Data, true);
            console.log(`✅ CIE10 ${id} actualizado:`, response);
            return response;
        } catch (error) {
            console.error(`Error al actualizar CIE10 ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar un CIE10
     * @param {number} id - ID del CIE10
     * @returns {Promise<void>}
     */
    async eliminar(id) {
        try {
            await apiClient.delete(`/admin/cie10/${id}`, true);
            console.log(`✅ CIE10 ${id} eliminado`);
        } catch (error) {
            console.error(`Error al eliminar CIE10 ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cambiar el estado de un CIE10 (activo/inactivo)
     * @param {number} id - ID del CIE10
     * @param {boolean} activo - Nuevo estado (true o false)
     * @returns {Promise<Object>} CIE10 actualizado
     */
    async cambiarEstado(id, activo) {
        try {
            const cie10 = await this.obtenerPorId(id);
            cie10.activo = activo;
            return await this.actualizar(id, cie10);
        } catch (error) {
            console.error(`Error al cambiar estado del CIE10 ${id}:`, error);
            throw error;
        }
    }
}

export const cie10Service = new Cie10Service();
export default cie10Service;

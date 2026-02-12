/**
 * 🏥 Servicio de API para Procedimientos CPMS (dim_proced)
 * 
 * Endpoints:
 * - GET    /api/admin/procedimientos           → Listar todos
 * - GET    /api/admin/procedimientos/{id}      → Obtener por ID
 * - POST   /api/admin/procedimientos           → Crear nuevo
 * - PUT    /api/admin/procedimientos/{id}      → Actualizar
 * - DELETE /api/admin/procedimientos/{id}      → Eliminar
 */

import { apiClient } from '../../lib/apiClient';

const BASE_URL = '/admin/procedimientos';

class ProcedimientosService {
    /**
     * Obtener todos los procedimientos (sin paginación)
     * @returns {Promise<Array>} Lista de procedimientos
     */
    async obtenerTodos() {
        try {
            const data = await apiClient.get(BASE_URL, true);
            console.log('✅ Procedimientos cargados:', data?.length || 0);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error al obtener procedimientos:', error);
            throw error;
        }
    }

    /**
     * Obtener procedimientos paginados con búsqueda opcional
     * @param {number} page - Número de página (0-indexed)
     * @param {number} size - Tamaño de página
     * @param {string} sortBy - Campo de ordenamiento (default: 'idProced')
     * @param {string} direction - Dirección de ordenamiento ('asc' o 'desc', default: 'asc')
     * @param {string} codProced - Filtro por código (opcional)
     * @param {string} descProced - Filtro por descripción (opcional)
     * @returns {Promise<Object>} Objeto con content, totalElements, totalPages, etc.
     */
    async obtenerTodosPaginados(page = 0, size = 30, sortBy = 'idProced', direction = 'asc', codProced = null, descProced = null) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sortBy: sortBy,
                direction: direction
            });
            
            // Agregar filtros de búsqueda si existen
            if (codProced && codProced.trim()) {
                params.append('codProced', codProced.trim());
            }
            if (descProced && descProced.trim()) {
                params.append('descProced', descProced.trim());
            }
            
            const data = await apiClient.get(`/admin/procedimientos?${params.toString()}`, true);
            
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
            console.log('✅ Procedimientos paginados cargados:', data?.content?.length || 0, 'de', data?.totalElements || 0);
            return data;
        } catch (error) {
            console.error('Error al obtener procedimientos paginados:', error);
            throw error;
        }
    }

    /**
     * Obtener un procedimiento por ID
     * @param {number} id - ID del procedimiento
     * @returns {Promise<Object>} Procedimiento encontrado
     */
    async obtenerPorId(id) {
        try {
            const data = await apiClient.get(`/admin/procedimientos/${id}`, true);
            return data;
        } catch (error) {
            console.error(`Error al obtener procedimiento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear un nuevo procedimiento
     * @param {Object} procedimientoData - Datos del procedimiento
     * @param {string} procedimientoData.codProced - Código CPMS del procedimiento
     * @param {string} procedimientoData.descProced - Descripción del procedimiento
     * @param {string} procedimientoData.statProced - Estado (A = Activo, I = Inactivo)
     * @returns {Promise<Object>} Procedimiento creado
     */
    async crear(procedimientoData) {
        try {
            const response = await apiClient.post('/admin/procedimientos', procedimientoData, true);
            console.log('✅ Procedimiento creado:', response);
            return response;
        } catch (error) {
            console.error('Error al crear procedimiento:', error);
            throw error;
        }
    }

    /**
     * Actualizar un procedimiento existente
     * @param {number} id - ID del procedimiento
     * @param {Object} procedimientoData - Datos actualizados
     * @returns {Promise<Object>} Procedimiento actualizado
     */
    async actualizar(id, procedimientoData) {
        try {
            const response = await apiClient.put(`/admin/procedimientos/${id}`, procedimientoData, true);
            console.log(`✅ Procedimiento ${id} actualizado:`, response);
            return response;
        } catch (error) {
            console.error(`Error al actualizar procedimiento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar un procedimiento
     * @param {number} id - ID del procedimiento
     * @returns {Promise<void>}
     */
    async eliminar(id) {
        try {
            await apiClient.delete(`/admin/procedimientos/${id}`, true);
            console.log(`✅ Procedimiento ${id} eliminado`);
        } catch (error) {
            console.error(`Error al eliminar procedimiento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cambiar el estado de un procedimiento (A <-> I)
     * @param {number} id - ID del procedimiento
     * @param {string} nuevoEstado - Nuevo estado ('A' o 'I')
     * @returns {Promise<Object>} Procedimiento actualizado
     */
    async cambiarEstado(id, nuevoEstado) {
        try {
            const procedimiento = await this.obtenerPorId(id);
            procedimiento.statProced = nuevoEstado;
            return await this.actualizar(id, procedimiento);
        } catch (error) {
            console.error(`Error al cambiar estado del procedimiento ${id}:`, error);
            throw error;
        }
    }
}

export const procedimientosService = new ProcedimientosService();
export default procedimientosService;

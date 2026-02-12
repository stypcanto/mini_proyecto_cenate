/**
 * 💊 Servicio de API para Medicamentos (Petitorio)
 *
 * Endpoints:
 * - GET    /api/admin/medicamentos           → Listar todos
 * - GET    /api/admin/medicamentos/{id}      → Obtener por ID
 * - POST   /api/admin/medicamentos           → Crear nuevo
 * - PUT    /api/admin/medicamentos/{id}      → Actualizar
 * - DELETE /api/admin/medicamentos/{id}      → Eliminar
 */

import { apiClient } from '../../lib/apiClient';

const BASE_URL = '/admin/medicamentos';

class MedicamentosService {
    /**
     * Obtener todos los medicamentos (sin paginación)
     * @returns {Promise<Array>} Lista de medicamentos
     */
    async obtenerTodos() {
        try {
            const data = await apiClient.get(BASE_URL, true);
            console.log('✅ Medicamentos cargados:', data?.length || 0);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error al obtener medicamentos:', error);
            throw error;
        }
    }

    /**
     * Obtener medicamentos paginados con búsqueda opcional
     * @param {number} page - Número de página (0-indexed)
     * @param {number} size - Tamaño de página
     * @param {string} sortBy - Campo de ordenamiento (default: 'idMedicamento')
     * @param {string} direction - Dirección de ordenamiento ('asc' o 'desc', default: 'asc')
     * @param {string} codMedicamento - Filtro por código (opcional)
     * @param {string} descMedicamento - Filtro por descripción (opcional)
     * @returns {Promise<Object>} Objeto con content, totalElements, totalPages, etc.
     */
    async obtenerTodosPaginados(page = 0, size = 30, sortBy = 'idMedicamento', direction = 'asc', codMedicamento = null, descMedicamento = null) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sortBy: sortBy,
                direction: direction
            });

            // Agregar filtros de búsqueda si existen
            if (codMedicamento && codMedicamento.trim()) {
                params.append('codMedicamento', codMedicamento.trim());
            }
            if (descMedicamento && descMedicamento.trim()) {
                params.append('descMedicamento', descMedicamento.trim());
            }

            const data = await apiClient.get(`/admin/medicamentos?${params.toString()}`, true);

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
            console.log('✅ Medicamentos paginados cargados:', data?.content?.length || 0, 'de', data?.totalElements || 0);
            return data;
        } catch (error) {
            console.error('Error al obtener medicamentos paginados:', error);
            throw error;
        }
    }

    /**
     * Obtener un medicamento por ID
     * @param {number} id - ID del medicamento
     * @returns {Promise<Object>} Medicamento encontrado
     */
    async obtenerPorId(id) {
        try {
            const data = await apiClient.get(`/admin/medicamentos/${id}`, true);
            return data;
        } catch (error) {
            console.error(`Error al obtener medicamento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Crear un nuevo medicamento
     * @param {Object} medicamentoData - Datos del medicamento
     * @param {string} medicamentoData.codMedicamento - Código del medicamento
     * @param {string} medicamentoData.descMedicamento - Descripción del medicamento
     * @param {string} medicamentoData.statMedicamento - Estado (A = Activo, I = Inactivo)
     * @returns {Promise<Object>} Medicamento creado
     */
    async crear(medicamentoData) {
        try {
            const response = await apiClient.post('/admin/medicamentos', medicamentoData, true);
            console.log('✅ Medicamento creado:', response);
            return response;
        } catch (error) {
            console.error('Error al crear medicamento:', error);
            throw error;
        }
    }

    /**
     * Actualizar un medicamento existente
     * @param {number} id - ID del medicamento
     * @param {Object} medicamentoData - Datos actualizados
     * @returns {Promise<Object>} Medicamento actualizado
     */
    async actualizar(id, medicamentoData) {
        try {
            const response = await apiClient.put(`/admin/medicamentos/${id}`, medicamentoData, true);
            console.log(`✅ Medicamento ${id} actualizado:`, response);
            return response;
        } catch (error) {
            console.error(`Error al actualizar medicamento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Eliminar un medicamento
     * @param {number} id - ID del medicamento
     * @returns {Promise<void>}
     */
    async eliminar(id) {
        try {
            await apiClient.delete(`/admin/medicamentos/${id}`, true);
            console.log(`✅ Medicamento ${id} eliminado`);
        } catch (error) {
            console.error(`Error al eliminar medicamento ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cambiar el estado de un medicamento (A <-> I)
     * @param {number} id - ID del medicamento
     * @param {string} nuevoEstado - Nuevo estado ('A' o 'I')
     * @returns {Promise<Object>} Medicamento actualizado
     */
    async cambiarEstado(id, nuevoEstado) {
        try {
            const medicamento = await this.obtenerPorId(id);
            medicamento.statMedicamento = nuevoEstado;
            return await this.actualizar(id, medicamento);
        } catch (error) {
            console.error(`Error al cambiar estado del medicamento ${id}:`, error);
            throw error;
        }
    }
}

export const medicamentosService = new MedicamentosService();
export default medicamentosService;

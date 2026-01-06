/**
 * 🏥 Servicio de API para Procedimientos CPT (dim_proced)
 * 
 * Endpoints:
 * - GET    /api/admin/procedimientos           → Listar todos
 * - GET    /api/admin/procedimientos/{id}      → Obtener por ID
 * - POST   /api/admin/procedimientos           → Crear nuevo
 * - PUT    /api/admin/procedimientos/{id}      → Actualizar
 * - DELETE /api/admin/procedimientos/{id}      → Eliminar
 */

import api from './apiClient';

const BASE_URL = '/admin/procedimientos';

export const procedimientosService = {
    /**
     * Obtener todos los procedimientos
     */
    async obtenerTodos() {
        try {
            const response = await api.get(BASE_URL);
            console.log('✅ Procedimientos cargados:', response.data?.length || 0);
            return response.data;
        } catch (error) {
            console.error('Error al obtener procedimientos:', error);
            throw error;
        }
    },

    /**
     * Obtener un procedimiento por ID
     */
    async obtenerPorId(id) {
        try {
            const response = await api.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener procedimiento ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crear un nuevo procedimiento
     */
    async crear(procedimiento) {
        try {
            const response = await api.post(BASE_URL, procedimiento);
            console.log('✅ Procedimiento creado:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error al crear procedimiento:', error);
            throw error;
        }
    },

    /**
     * Actualizar un procedimiento existente
     */
    async actualizar(id, procedimiento) {
        try {
            const response = await api.put(`${BASE_URL}/${id}`, procedimiento);
            console.log('✅ Procedimiento actualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar procedimiento ${id}:`, error);
            throw error;
        }
    },

    /**
     * Eliminar un procedimiento
     */
    async eliminar(id) {
        try {
            await api.delete(`${BASE_URL}/${id}`);
            console.log(`✅ Procedimiento ${id} eliminado`);
        } catch (error) {
            console.error(`Error al eliminar procedimiento ${id}:`, error);
            throw error;
        }
    },

    /**
     * Cambiar el estado de un procedimiento (A <-> I)
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
};

export default procedimientosService;

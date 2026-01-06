// ========================================================================
// cpmsService.js - Servicio para gestión de CPMS (Tipos de Procedimiento)
// ------------------------------------------------------------------------
// CENATE 2026 | Servicio para comunicación con API de tipos de procedimiento
// ========================================================================

import api from './apiClient';

const BASE_URL = '/admin/tipos-procedimiento';

export const cpmsService = {
    /**
     * Obtener todos los tipos de procedimiento
     */
    obtenerTodos: async () => {
        try {
            const data = await api.get(BASE_URL);
            return data;
        } catch (error) {
            console.error('Error al obtener tipos de procedimiento:', error);
            throw error;
        }
    },

    /**
     * Obtener tipo de procedimiento por ID
     */
    obtenerPorId: async (id) => {
        try {
            const data = await api.get(`${BASE_URL}/${id}`);
            return data;
        } catch (error) {
            console.error(`Error al obtener tipo de procedimiento ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crear nuevo tipo de procedimiento
     */
    crear: async (tipoProcedimiento) => {
        try {
            const data = await api.post(BASE_URL, tipoProcedimiento);
            return data;
        } catch (error) {
            console.error('Error al crear tipo de procedimiento:', error);
            throw error;
        }
    },

    /**
     * Actualizar tipo de procedimiento existente
     */
    actualizar: async (id, tipoProcedimiento) => {
        try {
            const data = await api.put(`${BASE_URL}/${id}`, tipoProcedimiento);
            return data;
        } catch (error) {
            console.error(`Error al actualizar tipo de procedimiento ${id}:`, error);
            throw error;
        }
    },

    /**
     * Eliminar tipo de procedimiento
     */
    eliminar: async (id) => {
        try {
            const data = await api.delete(`${BASE_URL}/${id}`);
            return data;
        } catch (error) {
            console.error(`Error al eliminar tipo de procedimiento ${id}:`, error);
            throw error;
        }
    }
};

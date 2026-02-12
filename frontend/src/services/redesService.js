// ========================================================================
// 🌐 redesService.js – Servicio de Gestión de Redes Asistenciales
// ------------------------------------------------------------------------
// Maneja todas las operaciones CRUD de redes asistenciales
// ========================================================================

import apiClient from '../lib/apiClient';

export const redesService = {
    /**
     * Obtener todas las redes activas
     */
    obtenerTodas: async () => {
        try {
            const response = await apiClient.get('/redes');
            return response;
        } catch (error) {
            console.error('Error al obtener todas las redes:', error);
            throw error;
        }
    },

    /**
     * Obtener una red por ID
     */
    obtenerPorId: async (idRed) => {
        try {
            const response = await apiClient.get(`/redes/${idRed}`);
            return response;
        } catch (error) {
            console.error(`Error al obtener red ${idRed}:`, error);
            throw error;
        }
    },

    /**
     * Crear una nueva red
     */
    crear: async (redData) => {
        try {
            const response = await apiClient.post('/redes', redData);
            return response;
        } catch (error) {
            console.error('Error al crear red:', error);
            throw error;
        }
    },

    /**
     * Actualizar una red existente
     */
    actualizar: async (idRed, redData) => {
        try {
            const response = await apiClient.put(`/redes/${idRed}`, redData);
            return response;
        } catch (error) {
            console.error(`Error al actualizar red ${idRed}:`, error);
            throw error;
        }
    },

    /**
     * Eliminar una red
     */
    eliminar: async (idRed) => {
        try {
            const response = await apiClient.delete(`/redes/${idRed}`);
            return response;
        } catch (error) {
            console.error(`Error al eliminar red ${idRed}:`, error);
            throw error;
        }
    },

    /**
     * Obtener todas las macrorregiones
     */
    obtenerMacrorregiones: async () => {
        try {
            const response = await apiClient.get('/macrorregiones');
            return response;
        } catch (error) {
            console.error('Error al obtener macrorregiones:', error);
            throw error;
        }
    }
};

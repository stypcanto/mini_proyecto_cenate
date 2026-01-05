// ========================================================================
// evolucionCronicaService.js - Servicio para dashboard de pacientes crónicos
// ------------------------------------------------------------------------
// CENATE 2026 | Dashboard CENACRON para HTA/DM
// ========================================================================

import api from './apiClient';

const BASE_URL = '/evolucion-cronica';

export const evolucionCronicaService = {
    /**
     * Obtener evolución de paciente crónico CENACRON
     * @param {string} pkAsegurado - ID del paciente
     * @param {number} meses - Meses hacia atrás (default: 6)
     */
    obtenerEvolucion: async (pkAsegurado, meses = 6) => {
        try {
            const data = await api.get(`${BASE_URL}/paciente/${pkAsegurado}?meses=${meses}`);
            return data;
        } catch (error) {
            console.error(`Error al obtener evolución del paciente ${pkAsegurado}:`, error);
            throw error;
        }
    },

    /**
     * Verificar si el paciente es elegible para dashboard crónico
     * @param {string} pkAsegurado - ID del paciente
     */
    verificarElegibilidad: async (pkAsegurado) => {
        try {
            const data = await api.get(`${BASE_URL}/verificar-elegibilidad/${pkAsegurado}`);
            return data;
        } catch (error) {
            console.error(`Error al verificar elegibilidad del paciente ${pkAsegurado}:`, error);
            throw error;
        }
    }
};

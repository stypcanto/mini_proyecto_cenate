// ========================================================================
// Servicio de Telemedicina - Jitsi JaaS - CENATE
// ========================================================================

import apiClient from '../lib/apiClient';

const BASE_ENDPOINT = '/telemedicina';

const telemedicinaService = {
    /**
     * Crea una nueva sala de videollamada
     * @param {Object} datos - Datos de la sala
     * @param {string} datos.nombrePaciente - Nombre del paciente
     * @param {string} datos.dniPaciente - DNI del paciente
     * @param {number} datos.idUsuarioMedico - ID del usuario médico
     * @param {string} datos.nombreMedico - Nombre del médico
     * @param {number} [datos.idCita] - ID de la cita (opcional)
     * @param {string} [datos.motivoConsulta] - Motivo de consulta (opcional)
     * @returns {Promise<Object>} Información de la sala creada
     */
    crearSala: async (datos) => {
        return await apiClient.post(`${BASE_ENDPOINT}/crear-sala`, datos);
    },

    /**
     * Genera un token adicional para un usuario
     * @param {string} roomName - Nombre de la sala
     * @param {string} userName - Nombre del usuario
     * @param {string} [userEmail] - Email del usuario (opcional)
     * @param {boolean} [isModerator=false] - Si el usuario es moderador
     * @param {number} [expirationHours=24] - Horas de expiración
     * @returns {Promise<Object>} Token generado
     */
    generarToken: async (roomName, userName, userEmail = null, isModerator = false, expirationHours = 24) => {
        const params = new URLSearchParams({
            roomName,
            userName,
            isModerator: isModerator.toString(),
            expirationHours: expirationHours.toString()
        });
        
        if (userEmail) {
            params.append('userEmail', userEmail);
        }

        return await apiClient.post(`${BASE_ENDPOINT}/generar-token?${params.toString()}`);
    }
};

export default telemedicinaService;

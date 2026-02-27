// ========================================================================
// 🤖 chatbotTrazabilidadService.js — Chatbot Trazabilidad CENATE v1.70.0
// ========================================================================
// Servicio para el Chatbot de Trazabilidad interno (solo personal CENATE).
// Requiere autenticación JWT.
// ========================================================================

import { apiClient } from '../lib/apiClient';

const chatbotTrazabilidadService = {
  /**
   * Envía un mensaje al asistente de trazabilidad y obtiene la respuesta.
   * @param {string} mensaje - Pregunta del usuario en lenguaje natural
   * @returns {Promise<{respuesta: string, timestamp: string}>}
   */
  chat: async (mensaje) => {
    return apiClient.post('/v1/chatbot/trazabilidad/chat', { mensaje }, true);
  },

  /**
   * Obtiene la tarjeta clínica enriquecida de un paciente por DNI.
   * Devuelve PatientCardDTO con datos de contacto, registros y alerta de deserción.
   * @param {string} dni - DNI de 8 dígitos del asegurado
   * @returns {Promise<PatientCardDTO>}
   */
  getPatientCard: async (dni) => {
    return apiClient.get(`/v1/chatbot/trazabilidad/paciente/${dni}`, true);
  },
};

export default chatbotTrazabilidadService;

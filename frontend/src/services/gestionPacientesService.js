// ========================================================================
// Servicio de Gestión de Pacientes - CENATE
// ========================================================================

import apiClient from './apiClient';

const BASE_ENDPOINT = '/gestion-pacientes';

const gestionPacientesService = {
    // ========================================================================
    // CRUD Básico
    // ========================================================================

    /**
     * Listar todos los pacientes
     */
    listar: async () => {
        return await apiClient.get(BASE_ENDPOINT);
    },

    /**
     * Obtener pacientes asignados al médico actual
     */
    obtenerPacientesMedico: async () => {
        return await apiClient.get(`${BASE_ENDPOINT}/medico/asignados`);
    },

    /**
     * Obtener paciente por ID
     */
    obtenerPorId: async (id) => {
        return await apiClient.get(`${BASE_ENDPOINT}/${id}`);
    },

    /**
     * Crear nuevo paciente
     */
    crear: async (paciente) => {
        return await apiClient.post(BASE_ENDPOINT, paciente);
    },

    /**
     * Actualizar paciente existente
     */
    actualizar: async (id, paciente) => {
        return await apiClient.put(`${BASE_ENDPOINT}/${id}`, paciente);
    },

    /**
     * Eliminar paciente
     */
    eliminar: async (id) => {
        return await apiClient.delete(`${BASE_ENDPOINT}/${id}`);
    },

    // ========================================================================
    // Búsquedas específicas
    // ========================================================================

    /**
     * Buscar por número de documento
     */
    buscarPorDocumento: async (numDoc) => {
        return await apiClient.get(`${BASE_ENDPOINT}/documento/${numDoc}`);
    },

    /**
     * Buscar por condición
     */
    buscarPorCondicion: async (condicion) => {
        return await apiClient.get(`${BASE_ENDPOINT}/condicion/${encodeURIComponent(condicion)}`);
    },

    /**
     * Buscar por gestora
     */
    buscarPorGestora: async (gestora) => {
        return await apiClient.get(`${BASE_ENDPOINT}/gestora/${encodeURIComponent(gestora)}`);
    },

    /**
     * Buscar por red asistencial
     */
    buscarPorRedAsistencial: async (redAsistencial) => {
        return await apiClient.get(`${BASE_ENDPOINT}/red/${encodeURIComponent(redAsistencial)}`);
    },

    /**
     * Buscar por IPRESS
     */
    buscarPorIpress: async (ipress) => {
        return await apiClient.get(`${BASE_ENDPOINT}/ipress/${encodeURIComponent(ipress)}`);
    },

    // ========================================================================
    // Búsqueda de Asegurados (tabla asegurados - 5M+ registros)
    // ========================================================================

    /**
     * Buscar asegurado por DNI (para agregar a gestión)
     * Retorna datos del asegurado desde la tabla asegurados
     */
    buscarAseguradoPorDni: async (dni) => {
        return await apiClient.get(`${BASE_ENDPOINT}/asegurado/${dni}`);
    },

    /**
     * Autocompletar asegurados (busca por DNI o nombre)
     * Retorna lista de asegurados que coinciden con el término de búsqueda
     */
    autocompletarAsegurados: async (query, limit = 10) => {
        const response = await apiClient.get(`/asegurados/buscar?q=${encodeURIComponent(query)}&size=${limit}`);
        return response.content || [];
    },

    // ========================================================================
    // Gestión de Telemedicina
    // ========================================================================

    /**
     * Listar pacientes seleccionados para telemedicina
     */
    listarSeleccionadosTelemedicina: async () => {
        return await apiClient.get(`${BASE_ENDPOINT}/telemedicina`);
    },

    /**
     * Seleccionar/deseleccionar un paciente para telemedicina
     */
    seleccionarParaTelemedicina: async (id, seleccionado) => {
        return await apiClient.put(`${BASE_ENDPOINT}/${id}/telemedicina`, { seleccionado });
    },

    /**
     * Seleccionar/deseleccionar múltiples pacientes para telemedicina
     */
    seleccionarMultiplesParaTelemedicina: async (ids, seleccionado) => {
        return await apiClient.put(`${BASE_ENDPOINT}/telemedicina/multiple`, { ids, seleccionado });
    },

    // ========================================================================
    // Actualización de Condición
    // ========================================================================

    /**
     * Actualizar condición de un paciente
     */
    actualizarCondicion: async (id, condicion, observaciones = null) => {
        return await apiClient.put(`${BASE_ENDPOINT}/${id}/condicion`, { condicion, observaciones });
    },

    // ========================================================================
    // Generar enlace de WhatsApp
    // ========================================================================

    /**
     * Generar enlace de WhatsApp para enviar mensaje
     */
    generarEnlaceWhatsApp: (telefono, mensaje = '') => {
        // Limpiar el teléfono (quitar espacios, guiones, etc.)
        const telefonoLimpio = telefono.replace(/\D/g, '');

        // Agregar código de país si no lo tiene (Perú: 51)
        const telefonoCompleto = telefonoLimpio.startsWith('51')
            ? telefonoLimpio
            : `51${telefonoLimpio}`;

        // Codificar el mensaje para URL
        const mensajeCodificado = encodeURIComponent(mensaje);

        return `https://wa.me/${telefonoCompleto}${mensaje ? `?text=${mensajeCodificado}` : ''}`;
    }
};

export default gestionPacientesService;

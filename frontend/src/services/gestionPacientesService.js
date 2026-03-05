// ========================================================================
// Servicio de Gestión de Pacientes - CENATE
// ========================================================================

import apiClient from '../lib/apiClient';

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
        return await apiClient.get(`${BASE_ENDPOINT}/medico/asignados`, true);
    },

    /**
     * ⭐ v1.62.0: Obtener contador de pacientes pendientes del médico actual
     * Utilizado por notificaciones para mostrar campanita
     * Polling cada 60 segundos
     */
    obtenerContadorPendientes: async () => {
        const response = await apiClient.get(`${BASE_ENDPOINT}/medico/contador-pendientes`, true);
        return response?.pendientes || 0;
    },

    /**
     * ⭐ v1.78.0: Obtener información del médico logueado (nombre + especialidad)
     * Retorna Map con "nombre" y "especialidad" del doctor autenticado
     */
    obtenerInfoMedicoActual: async () => {
        return await apiClient.get(`${BASE_ENDPOINT}/medico/info`, true);
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
        return await apiClient.put(`${BASE_ENDPOINT}/${id}/condicion`, { condicion, observaciones }, true);
    },

    // ========================================================================
    // ✅ v1.47.0: Registro de Atención Médica
    // ========================================================================

    /**
     * Obtener especialidades disponibles para interconsulta
     */
    obtenerEspecialidades: async () => {
        return await apiClient.get(`${BASE_ENDPOINT}/especialidades`, true);
    },

    /**
     * Registrar atención médica completa (Recita + Interconsulta + Crónico)
     */
    atenderPaciente: async (id, atenderPacienteRequest) => {
        return await apiClient.post(`${BASE_ENDPOINT}/${id}/atendido`, atenderPacienteRequest, true);
    },

    // ========================================================================
    // ✅ v1.78.3: Datos de EKG (endpoint separado sin afectar transacción)
    // ========================================================================

    /**
     * Obtener datos de EKG para un paciente (transacción separada)
     * Permite cargar datos básicos primero, luego EKG en paralelo
     * Sin afectar la transacción principal ni el módulo de tele-ekg
     */
    obtenerDatosEKGPaciente: async (dni) => {
        try {
            return await apiClient.get(`${BASE_ENDPOINT}/paciente/${dni}/ekg`, true);
        } catch (error) {
            console.warn(`Error obteniendo datos EKG para DNI ${dni}:`, error);
            return { fechaTomaEKG: null, esUrgente: false };
        }
    },

    obtenerControlesEnfermeria: async (dni) => {
        try {
            return await apiClient.get(`${BASE_ENDPOINT}/paciente/${dni}/controles-enfermeria`, true);
        } catch (error) {
            console.warn(`Error obteniendo controles enfermería para DNI ${dni}:`, error);
            return [];
        }
    },

    actualizarControlEnfermeria: async (idAtencion, datos) => {
        return await apiClient.put(`${BASE_ENDPOINT}/atencion/${idAtencion}/enfermeria`, datos, true);
    },

    obtenerInfoAsegurado: async (dni) => {
        try {
            return await apiClient.get(`/asegurados/por-dni/${dni}`, true);
        } catch (error) {
            console.warn(`Error obteniendo info asegurado DNI ${dni}:`, error);
            return {};
        }
    },

    // ========================================================================
    // Generar enlace de WhatsApp
    // ========================================================================

    /**
     * ✅ v1.89.8: BATCH endpoint - Obtener TODOS los ECGs del médico en UNA sola llamada
     * ⭐ OPTIMIZACIÓN: Reduce 21 llamadas → 1 llamada
     *
     * Retorna: {dni1: [ecg1, ecg2, ...], dni2: [ecg1, ...]}
     */
    obtenerECGsBatch: async () => {
        try {
            console.log('🚀 [v1.89.8] Obteniendo ECGs en BATCH...');
            const response = await apiClient.get(`${BASE_ENDPOINT}/medico/ecgs-batch`, true);
            console.log('✅ [v1.89.8] Batch retornado:', Object.keys(response).length, 'pacientes');
            return response || {};
        } catch (error) {
            console.warn('⚠️ [v1.89.8] Error obteniendo batch de ECGs:', error);
            return {};
        }
    },

    /**
     * v1.0.0: Obtener motivos de interconsulta predefinidos (para rol ENFERMERÍA)
     */
    obtenerMotivosInterconsulta: async () => {
        return await apiClient.get(`${BASE_ENDPOINT}/motivos-interconsulta`, true);
    },

    /**
     * Generar enlace de WhatsApp para enviar mensaje
     */
    /**
     * ⭐ CENACRON: Dar de baja a un paciente del programa CENACRON
     * PUT /api/paciente-estrategia/baja-cenacron/{pkAsegurado}
     * Registra el usuario que solicitó el retiro (auditoría)
     */
    bajaCenacron: async (pkAsegurado, tipoBaja, motivoBaja) => {
        return await apiClient.put(
            `/paciente-estrategia/baja-cenacron/${pkAsegurado}`,
            { tipoBaja, motivoBaja },
            true
        );
    },

    /**
     * ⭐ CENACRON: Inscribir a un paciente al programa CENACRON
     * POST /api/paciente-estrategia
     */
    inscribirCenacron: async (pkAsegurado) => {
        return await apiClient.post(
            `/paciente-estrategia`,
            { pkAsegurado, idEstrategia: 1 },
            true
        );
    },

    /**
     * ⭐ v1.103.11: Obtener atenciones generadas (RECITA/INTERCONSULTA) desde una solicitud padre
     * GET /api/bolsas/solicitudes/{idSolicitudPadre}/atenciones-generadas
     */
    obtenerAtencionesGeneradas: async (idSolicitudPadre) => {
        return await apiClient.get(`/bolsas/solicitudes/${idSolicitudPadre}/atenciones-generadas`, true);
    },

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

import api from './apiClient';

/**
 * Servicio para gestionar el formulario de diagnóstico situacional de Telesalud
 */
const formularioDiagnosticoService = {

    /**
     * Guardar borrador del formulario
     * @param {Object} formData - Datos del formulario desde el frontend
     * @param {number} idIpress - ID de la IPRESS
     * @param {string} username - Usuario que registra
     * @returns {Promise} - Respuesta del servidor
     */
    guardarBorrador: async (formData, idIpress, username) => {
        const request = transformarParaBackend(formData, idIpress);
        return api.post('/formulario-diagnostico/borrador', request);
    },

    /**
     * Actualizar formulario existente
     * @param {number} idFormulario - ID del formulario
     * @param {Object} formData - Datos del formulario
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise}
     */
    actualizar: async (idFormulario, formData, idIpress) => {
        const request = transformarParaBackend(formData, idIpress);
        request.idFormulario = idFormulario;
        return api.put(`/formulario-diagnostico/${idFormulario}`, request);
    },

    /**
     * Enviar formulario (cambia estado a ENVIADO)
     * @param {number} idFormulario - ID del formulario
     * @returns {Promise}
     */
    enviar: async (idFormulario) => {
        return api.post(`/formulario-diagnostico/${idFormulario}/enviar`);
    },

    /**
     * Obtener formulario por ID
     * @param {number} idFormulario - ID del formulario
     * @returns {Promise}
     */
    obtenerPorId: async (idFormulario) => {
        const response = await api.get(`/formulario-diagnostico/${idFormulario}`);
        return transformarParaFrontend(response.data);
    },

    /**
     * Obtener borrador (en proceso) por IPRESS
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise}
     */
    obtenerBorradorPorIpress: async (idIpress) => {
        try {
            const response = await api.get(`/formulario-diagnostico/borrador/ipress/${idIpress}`);
            if (response.data) {
                return transformarParaFrontend(response.data);
            }
            return null;
        } catch (error) {
            if (error.response && error.response.status === 204) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Listar todos los formularios
     * @returns {Promise}
     */
    listarTodos: async () => {
        return api.get('/formulario-diagnostico');
    },

    /**
     * Listar formularios por IPRESS
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise}
     */
    listarPorIpress: async (idIpress) => {
        return api.get(`/formulario-diagnostico/ipress/${idIpress}`);
    },

    /**
     * Listar formularios por Red
     * @param {number} idRed - ID de la Red
     * @returns {Promise}
     */
    listarPorRed: async (idRed) => {
        return api.get(`/formulario-diagnostico/red/${idRed}`);
    },

    /**
     * Eliminar formulario (solo si está en proceso)
     * @param {number} idFormulario - ID del formulario
     * @returns {Promise}
     */
    eliminar: async (idFormulario) => {
        return api.delete(`/formulario-diagnostico/${idFormulario}`);
    },

    /**
     * Verificar si existe formulario en proceso para el año actual
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise<boolean>}
     */
    existeEnProcesoActual: async (idIpress) => {
        const response = await api.get(`/formulario-diagnostico/existe-en-proceso/ipress/${idIpress}`);
        return response.data;
    }
};

// ==================== MAPEO DE EQUIPAMIENTO ====================
// Mapeo de índices del frontend a id_equipamiento de la BD

const EQUIP_INFORMATICO_IDS = {
    0: 1,   // Computadora de escritorio
    1: 2,   // Computadora portátil
    2: 3,   // Monitor
    3: 4,   // Cable HDMI
    4: 5,   // Cámara web HD 1080p
    5: 6,   // Micrófono
    6: 7,   // Parlantes/audífonos
    7: 8,   // Impresora
    8: 9,   // Escáner
    9: 10,  // Router/Switch de red
};

const EQUIP_BIOMEDICO_IDS = {
    0: 11,  // Estetoscopio digital
    1: 12,  // Otoscopio digital
    2: 13,  // Dermatoscopio digital
    3: 14,  // Monitor de signos vitales
    4: 15,  // Tensiómetro digital
    5: 16,  // Termómetro infrarrojo
    6: 17,  // Pulsioxímetro
    7: 18,  // Glucómetro
    8: 19,  // Electrocardiografo
    9: 20,  // Ecógrafo portátil
    10: 21, // Oftalmoscopio
    11: 22, // Balanza digital
    12: 23, // Tallímetro
    13: 24, // Cinta métrica
};

// Mapeo de estados a id_estado_equipo
const ESTADO_EQUIPO_IDS = {
    'Bueno': 1,
    'Regular': 2,
    'Malo': 3,
};

// Mapeo de servicios a id_servicio
const SERVICIOS_IDS = {
    'incorporadoOficial': 1,
    'teleconsulta': 2,
    'teleorientacion': 3,
    'telemonitoreo': 4,
    'teleinterconsulta': 5,
    'televigilancia': 6,
    'teletriage': 7,
};

// Mapeo de prioridades
const PRIORIDAD_IDS = {
    'Alta': 1,
    'Media': 2,
    'Baja': 3,
};

// ==================== FUNCIONES DE TRANSFORMACIÓN ====================

/**
 * Transforma los datos del formulario del frontend al formato del backend
 */
function transformarParaBackend(formData, idIpress) {
    const request = {
        idIpress: idIpress,
        anio: new Date().getFullYear(),
    };

    // Datos Generales
    if (formData.datosGenerales) {
        const dg = formData.datosGenerales;
        request.datosGenerales = {
            directorNombre: dg.directorNombreCompleto || dg.directorNombre || '',
            directorCorreo: dg.directorCorreo || '',
            directorTelefono: dg.directorTelefono || '',
            responsableNombre: dg.responsableNombre || dg.respTelesaludNombre || '',
            responsableCorreo: dg.responsableCorreo || dg.respTelesaludCorreo || '',
            responsableTelefono: dg.responsableTelefono || dg.respTelesaludTelefono || '',
            poblacionAdscrita: parseInt(dg.poblacionAdscrita) || null,
            atencionesMenuales: parseInt(dg.atencionesMenuales) || null,
        };
    }

    // Recursos Humanos
    if (formData.recursosHumanos) {
        const rh = formData.recursosHumanos;
        request.recursosHumanos = {
            coordTelesalud: toBool(rh.coordTelesalud),
            coordNombreCompleto: rh.coordNombreCompleto || '',
            coordCorreo: rh.coordCorreo || '',
            coordCelular: rh.coordCelular || '',
            personalApoyo: toBool(rh.personalApoyo),
            capacitacionTic: toBool(rh.capacitacionTic),
            normativa: toBool(rh.normativa),
            alfabetizacion: toBool(rh.alfabetizacion),
            planCapacitacion: toBool(rh.planCapacitacion),
            capacitacionesAnio: parseInt(rh.capacitacionesAnio) || null,
            necesidadesCapacitacion: rh.necesidadesCapacitacion || '',
        };
    }

    // Infraestructura
    if (formData.infraestructura) {
        const inf = formData.infraestructura;
        request.infraestructura = {
            espacioFisico: toBool(inf.espacioFisico),
            privacidad: toBool(inf.privacidad),
            escritorio: toBool(inf.escritorio),
            sillas: toBool(inf.sillas),
            estantes: toBool(inf.estantes),
            archivero: toBool(inf.archivero),
            iluminacion: toBool(inf.iluminacion),
            ventilacion: toBool(inf.ventilacion),
            aireAcondicionado: toBool(inf.aireAcondicionado),
            numAmbientes: parseInt(inf.numAmbientes) || null,
            hardware: toBool(inf.hardware),
            software: toBool(inf.software),
            redes: toBool(inf.redes),
            almacenamiento: toBool(inf.almacenamiento),
            serviciosTec: toBool(inf.serviciosTec),
        };
    }

    // Equipamiento - transformar a lista con IDs de catálogo
    if (formData.equipamiento) {
        const equip = formData.equipamiento;
        const equipamientoList = [];

        // Equipamiento Informático (índices 0-9)
        for (let i = 0; i < 10; i++) {
            const disponible = equip[`equipInfo${i}_disponible`];
            if (disponible !== undefined && disponible !== '') {
                const idEquipamiento = EQUIP_INFORMATICO_IDS[i];
                if (idEquipamiento) {
                    const estadoStr = equip[`equipInfo${i}_estado`];
                    equipamientoList.push({
                        idEquipamiento: idEquipamiento,
                        disponible: toBool(disponible),
                        cantidad: parseInt(equip[`equipInfo${i}_cantidad`]) || 0,
                        idEstadoEquipo: ESTADO_EQUIPO_IDS[estadoStr] || null,
                        observaciones: equip[`equipInfo${i}_observaciones`] || '',
                    });
                }
            }
        }

        // Equipamiento Biomédico (índices 0-13)
        for (let i = 0; i < 14; i++) {
            const disponible = equip[`equipBio${i}_disponible`];
            if (disponible !== undefined && disponible !== '') {
                const idEquipamiento = EQUIP_BIOMEDICO_IDS[i];
                if (idEquipamiento) {
                    const estadoStr = equip[`equipBio${i}_estado`];
                    equipamientoList.push({
                        idEquipamiento: idEquipamiento,
                        disponible: toBool(disponible),
                        cantidad: parseInt(equip[`equipBio${i}_cantidad`]) || 0,
                        idEstadoEquipo: ESTADO_EQUIPO_IDS[estadoStr] || null,
                        observaciones: equip[`equipBio${i}_observaciones`] || '',
                    });
                }
            }
        }

        request.equipamiento = equipamientoList;
    }

    // Conectividad
    if (formData.conectividad) {
        const con = formData.conectividad;
        request.conectividad = {
            internet: toBool(con.internet),
            estable: toBool(con.estable),
            energiaAlt: toBool(con.energiaAlt),
            puntosRed: toBool(con.puntosRed),
            wifi: toBool(con.wifi),
            tipoConexion: con.tipoConexion || '',
            proveedor: con.proveedor || '',
            velocidadContratada: parseInt(con.velocidadContratada) || null,
            velocidadReal: parseInt(con.velocidadReal) || null,
            numPuntosRed: parseInt(con.numPuntosRed) || null,
            essi: toBool(con.essi),
            pacs: toBool(con.pacs),
            anatpat: toBool(con.anatpat),
            videoconferencia: toBool(con.videoconferencia),
            citasLinea: toBool(con.citasLinea),
            otroSistema: con.otroSistema || '',
            confidencialidad: toBool(con.confidencialidad),
            integridad: toBool(con.integridad),
            disponibilidad: toBool(con.disponibilidad),
            contingencia: toBool(con.contingencia),
            backup: toBool(con.backup),
            consentimiento: toBool(con.consentimiento),
            ley29733: toBool(con.ley29733),
        };
    }

    // Servicios
    if (formData.servicios) {
        const serv = formData.servicios;
        const serviciosList = [];

        Object.keys(SERVICIOS_IDS).forEach(key => {
            const disponible = serv[key];
            if (disponible !== undefined && disponible !== '') {
                serviciosList.push({
                    idServicio: SERVICIOS_IDS[key],
                    disponible: toBool(disponible),
                    observaciones: serv[`${key}_observaciones`] || '',
                });
            }
        });

        request.servicios = serviciosList;
    }

    // Necesidades
    if (formData.necesidades) {
        const nec = formData.necesidades;
        request.necesidades = {
            necesidades: [],
            capacitacion: [],
        };

        // Necesidades de infraestructura y equipamiento
        if (nec.necesidadesItems && Array.isArray(nec.necesidadesItems)) {
            request.necesidades.necesidades = nec.necesidadesItems.map(item => ({
                idNecesidad: item.idNecesidad,
                cantidadRequerida: parseInt(item.cantidadRequerida) || 0,
                idPrioridad: PRIORIDAD_IDS[item.prioridad] || null,
            }));
        }

        // Necesidades de capacitación
        if (nec.capacitacion && Array.isArray(nec.capacitacion)) {
            request.necesidades.capacitacion = nec.capacitacion.map(cap => ({
                temaCapacitacion: cap.temaCapacitacion || cap.tema || '',
                poblacionObjetivo: cap.poblacionObjetivo || '',
                numParticipantes: parseInt(cap.numParticipantes) || 0,
                idPrioridad: PRIORIDAD_IDS[cap.prioridad] || null,
            }));
        }
    }

    return request;
}

/**
 * Transforma la respuesta del backend al formato del frontend
 */
function transformarParaFrontend(response) {
    if (!response) return null;

    const formData = {
        idFormulario: response.idFormulario,
        estado: response.estado,
        fechaCreacion: response.fechaCreacion,
        fechaEnvio: response.fechaEnvio,
        datosGenerales: {},
        recursosHumanos: {},
        infraestructura: {},
        equipamiento: {},
        conectividad: {},
        servicios: {},
        necesidades: {},
    };

    // Datos Generales
    if (response.datosGenerales) {
        const dg = response.datosGenerales;
        formData.datosGenerales = {
            directorNombreCompleto: dg.directorNombre || '',
            directorCorreo: dg.directorCorreo || '',
            directorTelefono: dg.directorTelefono || '',
            responsableNombre: dg.responsableNombre || '',
            responsableCorreo: dg.responsableCorreo || '',
            responsableTelefono: dg.responsableTelefono || '',
            poblacionAdscrita: dg.poblacionAdscrita || '',
            atencionesMenuales: dg.atencionesMenuales || '',
        };
    }

    // Recursos Humanos
    if (response.recursosHumanos) {
        const rh = response.recursosHumanos;
        formData.recursosHumanos = {
            coordTelesalud: fromBool(rh.coordTelesalud),
            coordNombreCompleto: rh.coordNombreCompleto || '',
            coordCorreo: rh.coordCorreo || '',
            coordCelular: rh.coordCelular || '',
            personalApoyo: fromBool(rh.personalApoyo),
            capacitacionTic: fromBool(rh.capacitacionTic),
            normativa: fromBool(rh.normativa),
            alfabetizacion: fromBool(rh.alfabetizacion),
            planCapacitacion: fromBool(rh.planCapacitacion),
            capacitacionesAnio: rh.capacitacionesAnio || '',
            necesidadesCapacitacion: rh.necesidadesCapacitacion || '',
        };
    }

    // Infraestructura
    if (response.infraestructura) {
        const inf = response.infraestructura;
        formData.infraestructura = {
            espacioFisico: fromBool(inf.espacioFisico),
            privacidad: fromBool(inf.privacidad),
            escritorio: fromBool(inf.escritorio),
            sillas: fromBool(inf.sillas),
            estantes: fromBool(inf.estantes),
            archivero: fromBool(inf.archivero),
            iluminacion: fromBool(inf.iluminacion),
            ventilacion: fromBool(inf.ventilacion),
            aireAcondicionado: fromBool(inf.aireAcondicionado),
            numAmbientes: inf.numAmbientes || '',
            hardware: fromBool(inf.hardware),
            software: fromBool(inf.software),
            redes: fromBool(inf.redes),
            almacenamiento: fromBool(inf.almacenamiento),
            serviciosTec: fromBool(inf.serviciosTec),
        };
    }

    // Equipamiento - transformar de lista a campos individuales
    if (response.equipamiento && Array.isArray(response.equipamiento)) {
        response.equipamiento.forEach(eq => {
            const idEquip = eq.idEquipamiento;
            let prefix = '';
            let index = -1;

            // Buscar si es informático
            for (let i = 0; i < 10; i++) {
                if (EQUIP_INFORMATICO_IDS[i] === idEquip) {
                    prefix = 'equipInfo';
                    index = i;
                    break;
                }
            }

            // Buscar si es biomédico
            if (index === -1) {
                for (let i = 0; i < 14; i++) {
                    if (EQUIP_BIOMEDICO_IDS[i] === idEquip) {
                        prefix = 'equipBio';
                        index = i;
                        break;
                    }
                }
            }

            if (index !== -1) {
                formData.equipamiento[`${prefix}${index}_disponible`] = fromBool(eq.disponible);
                formData.equipamiento[`${prefix}${index}_cantidad`] = eq.cantidad || '';
                formData.equipamiento[`${prefix}${index}_estado`] = eq.estado || '';
                formData.equipamiento[`${prefix}${index}_observaciones`] = eq.observaciones || '';
            }
        });
    }

    // Conectividad
    if (response.conectividad) {
        const con = response.conectividad;
        formData.conectividad = {
            internet: fromBool(con.internet),
            estable: fromBool(con.estable),
            energiaAlt: fromBool(con.energiaAlt),
            puntosRed: fromBool(con.puntosRed),
            wifi: fromBool(con.wifi),
            tipoConexion: con.tipoConexion || '',
            proveedor: con.proveedor || '',
            velocidadContratada: con.velocidadContratada || '',
            velocidadReal: con.velocidadReal || '',
            numPuntosRed: con.numPuntosRed || '',
            essi: fromBool(con.essi),
            pacs: fromBool(con.pacs),
            anatpat: fromBool(con.anatpat),
            videoconferencia: fromBool(con.videoconferencia),
            citasLinea: fromBool(con.citasLinea),
            otroSistema: con.otroSistema || '',
            confidencialidad: fromBool(con.confidencialidad),
            integridad: fromBool(con.integridad),
            disponibilidad: fromBool(con.disponibilidad),
            contingencia: fromBool(con.contingencia),
            backup: fromBool(con.backup),
            consentimiento: fromBool(con.consentimiento),
            ley29733: fromBool(con.ley29733),
        };
    }

    // Servicios - transformar de lista a campos individuales
    if (response.servicios && Array.isArray(response.servicios)) {
        // Crear mapeo inverso de idServicio a clave
        const ID_TO_SERVICIO = {};
        Object.keys(SERVICIOS_IDS).forEach(key => {
            ID_TO_SERVICIO[SERVICIOS_IDS[key]] = key;
        });

        response.servicios.forEach(serv => {
            const key = ID_TO_SERVICIO[serv.idServicio];
            if (key) {
                formData.servicios[key] = fromBool(serv.disponible);
                formData.servicios[`${key}_observaciones`] = serv.observaciones || '';
            }
        });
    }

    // Necesidades
    if (response.necesidades) {
        const nec = response.necesidades;
        formData.necesidades = {
            necesidadesItems: [],
            capacitacion: [],
        };

        // Necesidades de infraestructura
        if (nec.necesidades && Array.isArray(nec.necesidades)) {
            formData.necesidades.necesidadesItems = nec.necesidades.map(n => ({
                idNecesidad: n.idNecesidad,
                nombreNecesidad: n.nombreNecesidad || '',
                categoria: n.categoria || '',
                cantidadRequerida: n.cantidadRequerida || '',
                prioridad: n.prioridad || '',
            }));
        }

        // Necesidades de capacitación
        if (nec.capacitacion && Array.isArray(nec.capacitacion)) {
            formData.necesidades.capacitacion = nec.capacitacion.map(c => ({
                id: c.id,
                temaCapacitacion: c.temaCapacitacion || '',
                poblacionObjetivo: c.poblacionObjetivo || '',
                numParticipantes: c.numParticipantes || '',
                prioridad: c.prioridad || '',
            }));
        }
    }

    return formData;
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Convierte "si"/"no" o boolean a boolean
 */
function toBool(value) {
    if (value === 'si' || value === true || value === 'true') return true;
    if (value === 'no' || value === false || value === 'false') return false;
    return null;
}

/**
 * Convierte boolean a "si"/"no"
 */
function fromBool(value) {
    if (value === true) return 'si';
    if (value === false) return 'no';
    return '';
}

export default formularioDiagnosticoService;

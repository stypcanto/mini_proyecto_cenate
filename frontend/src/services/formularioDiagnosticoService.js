import api from '../lib/apiClient';

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
    guardarBorrador: async (request) => {
        return api.post('/formulario-diagnostico/borrador', request, true);
    },

    /**
     * Actualizar formulario existente
     * @param {number} idFormulario - ID del formulario
     * @param {Object} formData - Datos del formulario
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise}
     */
    actualizar: async (idFormulario, formData, idIpress) => {
        const request = transformarParaBackendInterno(formData, idIpress, idFormulario);
        return api.put(`/formulario-diagnostico/${idFormulario}`, request, true);
    },

    /**
     * Enviar formulario (cambia estado a ENVIADO)
     * @param {number} idFormulario - ID del formulario
     * @returns {Promise}
     */
    enviar: async (idFormulario) => {
        return api.post(`/formulario-diagnostico/${idFormulario}/enviar`, {}, true);
    },

    /**
     * Obtener formulario por ID
     * @param {number} idFormulario - ID del formulario
     * @returns {Promise}
     */
    obtenerPorId: async (idFormulario) => {
        const response = await api.get(`/formulario-diagnostico/${idFormulario}`, true);
        return transformarParaFrontend(response);
    },

    /**
     * Obtener borrador (en proceso) por IPRESS
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise}
     */
    obtenerBorradorPorIpress: async (idIpress) => {
        try {
            const response = await api.get(`/formulario-diagnostico/borrador/ipress/${idIpress}`, true);
            if (response) {
                return transformarParaFrontend(response);
            }
            return null;
        } catch (error) {
            if (error.message && error.message.includes('204')) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Obtener el último formulario por IPRESS (cualquier estado)
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise}
     */
    obtenerUltimoPorIpress: async (idIpress) => {
        try {
            const response = await api.get(`/formulario-diagnostico/ultimo/ipress/${idIpress}`, true);
            if (response) {
                return transformarParaFrontend(response);
            }
            return null;
        } catch (error) {
            if (error.message && error.message.includes('204')) {
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
        return api.get('/formulario-diagnostico', true);
    },

    /**
     * Listar formularios por IPRESS
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise}
     */
    listarPorIpress: async (idIpress) => {
        return api.get(`/formulario-diagnostico/ipress/${idIpress}`, true);
    },

    /**
     * Listar formularios por Red
     * @param {number} idRed - ID de la Red
     * @returns {Promise}
     */
    listarPorRed: async (idRed) => {
        return api.get(`/formulario-diagnostico/red/${idRed}`, true);
    },

    /**
     * Eliminar formulario (solo si está en proceso)
     * @param {number} idFormulario - ID del formulario
     * @returns {Promise}
     */
    eliminar: async (idFormulario) => {
        return api.delete(`/formulario-diagnostico/${idFormulario}`, true);
    },

    /**
     * Verificar si existe formulario en proceso para el año actual
     * @param {number} idIpress - ID de la IPRESS
     * @returns {Promise<boolean>}
     */
    existeEnProcesoActual: async (idIpress) => {
        const response = await api.get(`/formulario-diagnostico/existe-en-proceso/ipress/${idIpress}`, true);
        return response.data;
    },

    /**
     * Obtener estadísticas detalladas de un formulario
     * @param {number} idFormulario - ID del formulario
     * @returns {Promise}
     */
    obtenerEstadisticas: async (idFormulario) => {
        return api.get(`/formulario-diagnostico/${idFormulario}/estadisticas`, true);
    },

    /**
     * Descargar reporte Excel con estadísticas del formulario
     * @param {number} idFormulario - ID del formulario
     * @returns {Promise}
     */
    descargarExcelReporte: async (idFormulario) => {
        try {
            const token = localStorage.getItem('auth.token');
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

            const response = await fetch(`${baseUrl}/formulario-diagnostico/${idFormulario}/excel-reporte`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_estadistico_formulario_${idFormulario}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando Excel:', error);
            throw error;
        }
    },

    /**
     * Transforma datos del frontend al formato del backend
     * @param {Object} formData - Datos del formulario
     * @param {number} idIpress - ID de la IPRESS
     * @param {number} idFormulario - ID del formulario (opcional)
     * @returns {Object} - Request para el backend
     */
    transformarParaBackend: (formData, idIpress, idFormulario = null) => {
        return transformarParaBackendInterno(formData, idIpress, idFormulario);
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
    'incorporoServicios': 1,
    'teleconsulta': 2,
    'teleorientacion': 3,
    'telemonitoreo': 4,
    'teleinterconsulta': 5,
    'teleurgencia': 6,
    'teletriaje': 7,
    'telerradiografia': 8,
    'telemamografia': 9,
    'teletomografia': 10,
    'telecapacitacion': 11,
    'teleiec': 12,
};

// Mapeo de prioridades
const PRIORIDAD_IDS = {
    'Alta': 1,
    'Media': 2,
    'Baja': 3,
};

// Mapeo de prioridades desde valores en minúsculas
const PRIORIDAD_IDS_LOWER = {
    'alta': 1,
    'media': 2,
    'baja': 3,
};

// ==================== MAPEO DE NECESIDADES A IDs DE CATÁLOGO ====================

// 7.2 Infraestructura Tecnológica (IDs 9-13)
const NECESIDAD_INF_TEC_IDS = {
    'equipoComputo': 9,
    'equiposRed': 10,
    'softwareAtencion': 11,
    'aplicacionesMonitoreo': 12,
    'serviciosSoporte': 13,
};

// 7.3 Equipamiento Informático (IDs 14-23)
const NECESIDAD_EQUIP_INFO_IDS = {
    'computadora': 14,
    'laptop': 15,
    'monitor': 16,
    'cableHdmi': 17,
    'camaraWeb': 18,
    'microfono': 19,
    'parlantes': 20,
    'impresora': 21,
    'escaner': 22,
    'router': 23,
};

// 7.4 Equipamiento Biomédico (IDs 201-214)
const NECESIDAD_EQUIP_BIO_IDS = {
    'pulsioximetro': 201,
    'dermatoscopio': 202,
    'ecografo': 203,
    'electrocardiografo': 204,
    'gasesArteriales': 205,
    'estetoscopio': 206,
    'fonendoscopio': 207,
    'monitorVitales': 208,
    'otoscopio': 209,
    'oximetro': 210,
    'retinografo': 211,
    'tensiometro': 212,
    'videocolposcopio': 213,
    'estacionMovil': 214,
};

// 7.6 Recursos Humanos (IDs 42-53)
const NECESIDAD_RRHH_IDS = {
    'medicosEspecialistas': 42,
    'medicosGenerales': 43,
    'enfermeras': 44,
    'obstetras': 45,
    'tecnologosMedicos': 46,
    'psicologos': 47,
    'nutricionistas': 48,
    'trabajadoresSociales': 49,
    'otrosProfesionales': 50,
    'personalTecnico': 51,
    'personalTic': 52,
    'personalAdmin': 53,
};

// 7.5 Conectividad (IDs 38-41)
const NECESIDAD_CONECT_IDS = {
    'instalacionInternet': 38,
    'puntosRed': 39,
    'modemWifi': 40,
    'internetSatelital': 41,
};

// 7.7 Capacitación para Telesalud (IDs 54-56)
const NECESIDAD_CAPAC_IDS = {
    'usoPlataformas': 54,
    'seguridadInfo': 55,
    'protocolosClinicos': 56,
};

// ==================== FUNCIONES DE TRANSFORMACIÓN ====================

/**
 * Transforma los datos del formulario del frontend al formato del backend
 */
function transformarParaBackendInterno(formData, idIpress, idFormulario = null) {
    const request = {
        idIpress: idIpress,
        anio: new Date().getFullYear(),
        idFormulario: idFormulario,
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
                    observaciones: serv[`${key}_obs`] || '',
                });
            }
        });

        request.servicios = serviciosList;
    }

    // Necesidades
    if (formData.necesidades) {
        const nec = formData.necesidades;
        const necesidadesList = [];

        // 7.2 Infraestructura Tecnológica
        Object.keys(NECESIDAD_INF_TEC_IDS).forEach(key => {
            const cant = nec[`infraTec_${key}_cant`];
            const prior = nec[`infraTec_${key}_prior`];
            if (cant || prior) {
                necesidadesList.push({
                    idNecesidad: NECESIDAD_INF_TEC_IDS[key],
                    cantidadRequerida: parseInt(cant) || 0,
                    idPrioridad: PRIORIDAD_IDS_LOWER[prior] || null,
                });
            }
        });

        // 7.3 Equipamiento Informático
        Object.keys(NECESIDAD_EQUIP_INFO_IDS).forEach(key => {
            const cant = nec[`equip_${key}_cant`];
            const prior = nec[`equip_${key}_prior`];
            if (cant || prior) {
                necesidadesList.push({
                    idNecesidad: NECESIDAD_EQUIP_INFO_IDS[key],
                    cantidadRequerida: parseInt(cant) || 0,
                    idPrioridad: PRIORIDAD_IDS_LOWER[prior] || null,
                });
            }
        });

        // 7.4 Equipamiento Biomédico
        Object.keys(NECESIDAD_EQUIP_BIO_IDS).forEach(key => {
            const cant = nec[`bio_${key}_cant`];
            const prior = nec[`bio_${key}_prior`];
            if (cant || prior) {
                necesidadesList.push({
                    idNecesidad: NECESIDAD_EQUIP_BIO_IDS[key],
                    cantidadRequerida: parseInt(cant) || 0,
                    idPrioridad: PRIORIDAD_IDS_LOWER[prior] || null,
                });
            }
        });

        // 7.6 Recursos Humanos
        Object.keys(NECESIDAD_RRHH_IDS).forEach(key => {
            const cant = nec[`rrhh_${key}_cant`];
            const prior = nec[`rrhh_${key}_prior`];
            if (cant || prior) {
                necesidadesList.push({
                    idNecesidad: NECESIDAD_RRHH_IDS[key],
                    cantidadRequerida: parseInt(cant) || 0,
                    idPrioridad: PRIORIDAD_IDS_LOWER[prior] || null,
                });
            }
        });

        // 7.5 Conectividad
        Object.keys(NECESIDAD_CONECT_IDS).forEach(key => {
            const cant = nec[`conect_${key}_cant`];
            const prior = nec[`conect_${key}_prior`];
            if (cant || prior) {
                necesidadesList.push({
                    idNecesidad: NECESIDAD_CONECT_IDS[key],
                    cantidadRequerida: parseInt(cant) || 0,
                    idPrioridad: PRIORIDAD_IDS_LOWER[prior] || null,
                });
            }
        });

        // 7.7 Capacitación para Telesalud
        Object.keys(NECESIDAD_CAPAC_IDS).forEach(key => {
            const cant = nec[`capac_${key}_cant`];
            const prior = nec[`capac_${key}_prior`];
            if (cant || prior) {
                necesidadesList.push({
                    idNecesidad: NECESIDAD_CAPAC_IDS[key],
                    cantidadRequerida: parseInt(cant) || 0,
                    idPrioridad: PRIORIDAD_IDS_LOWER[prior] || null,
                });
            }
        });

        request.necesidades = {
            necesidades: necesidadesList,
            capacitacion: [],
            necesidadesConectividad: nec.necesidadesConectividad || '',
            necesidadesCapacitacion: nec.necesidadesCapacitacion || '',
            observacionesGenerales: nec.observacionesGenerales || nec.observacionesFinales || '',
            // Campos de suficiencia
            infraFisicaSuficiente: nec.infraFisicaSuficiente || '',
            infraFisicaObservaciones: nec.infraFisicaObservaciones || '',
            infraTecAdecuada: nec.infraTecAdecuada || '',
            equipInfoAdecuado: nec.equipInfoAdecuado || '',
            equipBioAdecuado: nec.equipBioAdecuado || '',
        };

        // También agregar necesidadesItems si ya viene en formato array (compatibilidad)
        if (nec.necesidadesItems && Array.isArray(nec.necesidadesItems)) {
            nec.necesidadesItems.forEach(item => {
                if (item.idNecesidad && !necesidadesList.find(n => n.idNecesidad === item.idNecesidad)) {
                    necesidadesList.push({
                        idNecesidad: item.idNecesidad,
                        cantidadRequerida: parseInt(item.cantidadRequerida) || 0,
                        idPrioridad: PRIORIDAD_IDS[item.prioridad] || PRIORIDAD_IDS_LOWER[item.prioridad] || null,
                    });
                }
            });
        }

        // Necesidades de capacitación
        if (nec.capacitacion && Array.isArray(nec.capacitacion)) {
            request.necesidades.capacitacion = nec.capacitacion.map(cap => ({
                temaCapacitacion: cap.temaCapacitacion || cap.tema || '',
                poblacionObjetivo: cap.poblacionObjetivo || '',
                numParticipantes: parseInt(cap.numParticipantes) || 0,
                idPrioridad: PRIORIDAD_IDS[cap.prioridad] || PRIORIDAD_IDS_LOWER[cap.prioridad] || null,
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
            // Nombres usados en la vista previa
            directorNombre: dg.directorNombre || '',
            directorNombreCompleto: dg.directorNombre || '',
            directorCorreo: dg.directorCorreo || '',
            directorTelefono: dg.directorTelefono || '',
            responsableNombre: dg.responsableNombre || '',
            responsableCorreo: dg.responsableCorreo || '',
            responsableTelefono: dg.responsableTelefono || '',
            poblacionAdscrita: dg.poblacionAdscrita || '',
            promedioAtenciones: dg.atencionesMenuales || '',
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
            proveedorSeleccionado: getProveedorSeleccionado(con.proveedor),
            proveedorOtro: getProveedorOtro(con.proveedor),
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
                formData.servicios[`${key}_obs`] = serv.observaciones || '';
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

        // Mapeo de nombreNecesidad a campos del frontend
        const NECESIDAD_FIELD_MAP = {
            // Infraestructura Física
            'Espacio físico': 'infra_espacioFisico',
            'Espacio físico para Teleconsultorio': 'infra_espacioFisico',
            'Escritorio': 'infra_escritorio',
            'Escritorio ergonómico': 'infra_escritorio',
            'Sillas': 'infra_sillas',
            'Sillas ergonómicas': 'infra_sillas',
            'Estantes': 'infra_estantes',
            'Estantes para equipos': 'infra_estantes',
            'Archivero': 'infra_archivero',
            'Archivero con llave': 'infra_archivero',
            'Luz eléctrica': 'infra_luzElectrica',
            'Instalación de luz eléctrica': 'infra_luzElectrica',
            'Ventilación': 'infra_ventilacion',
            'Sistema de ventilación': 'infra_ventilacion',
            'Aire acondicionado': 'infra_aireAcond',
            'Aire acond.': 'infra_aireAcond',
            // Equipamiento Informático
            'Computadora': 'equip_computadora',
            'Computadora de escritorio': 'equip_computadora',
            'Laptop': 'equip_laptop',
            'Computadora portátil': 'equip_laptop',
            'Computadora portátil (laptop)': 'equip_laptop',
            'Monitor': 'equip_monitor',
            'Cable HDMI': 'equip_cableHdmi',
            'Cámara web': 'equip_camaraWeb',
            'Cámara web HD': 'equip_camaraWeb',
            'Cámara web HD (1080p)': 'equip_camaraWeb',
            'Cámara web HD (resolución mínima 1080p)': 'equip_camaraWeb',
            'Micrófono': 'equip_microfono',
            'Parlantes': 'equip_parlantes',
            'Parlantes/Audífonos': 'equip_parlantes',
            'Impresora': 'equip_impresora',
            'Escáner': 'equip_escaner',
            'Router': 'equip_router',
            'Router/Switch de red': 'equip_router',
            // Equipamiento Biomédico
            'Pulsioxímetro': 'bio_pulsioximetro',
            'Pulsioxímetro digital': 'bio_pulsioximetro',
            'Estetoscopio': 'bio_estetoscopio',
            'Estetoscopio digital': 'bio_estetoscopio',
            'Tensiómetro': 'bio_tensiometro',
            'Tensiómetro digital': 'bio_tensiometro',
            'Otoscopio': 'bio_otoscopio',
            'Otoscopio digital': 'bio_otoscopio',
            'Dermatoscopio': 'bio_dermatoscopio',
            'Dermatoscopio digital': 'bio_dermatoscopio',
            'Electrocardiógrafo': 'bio_electrocardiografo',
            'Electrocardiógrafo digital': 'bio_electrocardiografo',
            'Ecógrafo': 'bio_ecografo',
            'Ecógrafo digital': 'bio_ecografo',
            'Equipo de gases arteriales digital': 'bio_gasesArteriales',
            'Fonendoscopio digital': 'bio_fonendoscopio',
            'Monitor de funciones vitales': 'bio_monitorVitales',
            'Oxímetro digital': 'bio_oximetro',
            'Retinógrafo digital': 'bio_retinografo',
            'Videocolposcopio': 'bio_videocolposcopio',
            'Estación móvil': 'bio_estacionMovil',
            'Estación móvil de telemedicina': 'bio_estacionMovil',
            // Infraestructura Tecnológica
            'Equipo de Computo': 'infraTec_equipoComputo',
            'Equipo de cómputo': 'infraTec_equipoComputo',
            'Equipos de red': 'infraTec_equiposRed',
            'Equipos de red (routers, switches)': 'infraTec_equiposRed',
            'Software de atención': 'infraTec_softwareAtencion',
            'Software necesario para la gestión y ejecución de la teleconsulta': 'infraTec_softwareAtencion',
            'Software necesario para la gestión y ejecución de la atención': 'infraTec_softwareAtencion',
            'Aplicaciones de monitoreo': 'infraTec_aplicacionesMonitoreo',
            'Aplicaciones para el seguimiento y monitoreo de los servicios': 'infraTec_aplicacionesMonitoreo',
            'Aplicaciones para el seguimiento y monitoreo de los pacientes': 'infraTec_aplicacionesMonitoreo',
            'Servicios de soporte': 'infraTec_serviciosSoporte',
            'Servicios de soporte que garantizan el funcionamiento': 'infraTec_serviciosSoporte',
            'Servicios de soporte que garanticen el funcionamiento óptimo': 'infraTec_serviciosSoporte',
            // Recursos Humanos
            'Médicos especialistas': 'rrhh_medicosEspecialistas',
            'Médicos generales': 'rrhh_medicosGenerales',
            'Enfermeras(os)': 'rrhh_enfermeras',
            'Obstetras': 'rrhh_obstetras',
            'Tecnólogos médicos': 'rrhh_tecnologosMedicos',
            'Psicólogos': 'rrhh_psicologos',
            'Nutricionistas': 'rrhh_nutricionistas',
            'Trabajadores sociales': 'rrhh_trabajadoresSociales',
            'Otros profesionales de salud': 'rrhh_otrosProfesionales',
            'Personal técnico de salud': 'rrhh_personalTecnico',
            'Personal de soporte TIC': 'rrhh_personalTic',
            'Personal administrativo': 'rrhh_personalAdmin',
            // Conectividad
            'Instalación de internet': 'conect_instalacionInternet',
            'Puntos de red': 'conect_puntosRed',
            'Módem WiFi': 'conect_modemWifi',
            'Internet satelital': 'conect_internetSatelital',
            // Capacitación para Telesalud
            'Uso de plataformas de telesalud': 'capac_usoPlataformas',
            'Seguridad de la información': 'capac_seguridadInfo',
            'Protocolos clínicos': 'capac_protocolosClinicos',
        };

        // Mapeo por ID de catálogo (más confiable)
        const NECESIDAD_ID_MAP = {
            // INF_TEC (9-13)
            9: 'infraTec_equipoComputo',
            10: 'infraTec_equiposRed',
            11: 'infraTec_softwareAtencion',
            12: 'infraTec_aplicacionesMonitoreo',
            13: 'infraTec_serviciosSoporte',
            // EQUIP_INFO (14-23)
            14: 'equip_computadora',
            15: 'equip_laptop',
            16: 'equip_monitor',
            17: 'equip_cableHdmi',
            18: 'equip_camaraWeb',
            19: 'equip_microfono',
            20: 'equip_parlantes',
            21: 'equip_impresora',
            22: 'equip_escaner',
            23: 'equip_router',
            // EQUIP_BIO (201-214)
            201: 'bio_pulsioximetro',
            202: 'bio_dermatoscopio',
            203: 'bio_ecografo',
            204: 'bio_electrocardiografo',
            205: 'bio_gasesArteriales',
            206: 'bio_estetoscopio',
            207: 'bio_fonendoscopio',
            208: 'bio_monitorVitales',
            209: 'bio_otoscopio',
            210: 'bio_oximetro',
            211: 'bio_retinografo',
            212: 'bio_tensiometro',
            213: 'bio_videocolposcopio',
            214: 'bio_estacionMovil',
            // RRHH (42-53)
            42: 'rrhh_medicosEspecialistas',
            43: 'rrhh_medicosGenerales',
            44: 'rrhh_enfermeras',
            45: 'rrhh_obstetras',
            46: 'rrhh_tecnologosMedicos',
            47: 'rrhh_psicologos',
            48: 'rrhh_nutricionistas',
            49: 'rrhh_trabajadoresSociales',
            50: 'rrhh_otrosProfesionales',
            51: 'rrhh_personalTecnico',
            52: 'rrhh_personalTic',
            53: 'rrhh_personalAdmin',
            // CONECT (38-41)
            38: 'conect_instalacionInternet',
            39: 'conect_puntosRed',
            40: 'conect_modemWifi',
            41: 'conect_internetSatelital',
            // CAPAC (54-56)
            54: 'capac_usoPlataformas',
            55: 'capac_seguridadInfo',
            56: 'capac_protocolosClinicos',
        };

        // Necesidades de infraestructura y equipamiento
        if (nec.necesidades && Array.isArray(nec.necesidades)) {
            formData.necesidades.necesidadesItems = nec.necesidades.map(n => ({
                idNecesidad: n.idNecesidad,
                nombreNecesidad: n.nombreNecesidad || '',
                categoria: n.categoria || '',
                cantidadRequerida: n.cantidadRequerida || '',
                prioridad: n.prioridad || '',
            }));

            // Mapear a campos individuales para el formulario y vista previa
            nec.necesidades.forEach(n => {
                // Primero intentar mapear por ID (más confiable)
                let fieldBase = NECESIDAD_ID_MAP[n.idNecesidad];
                // Si no se encuentra por ID, intentar por nombre
                if (!fieldBase && n.nombreNecesidad) {
                    fieldBase = NECESIDAD_FIELD_MAP[n.nombreNecesidad];
                }
                if (fieldBase) {
                    formData.necesidades[`${fieldBase}_cant`] = n.cantidadRequerida || '';
                    formData.necesidades[`${fieldBase}_prior`] = (n.prioridad || '').toLowerCase();
                }
            });
        }

        // Campos de texto de necesidades
        if (nec.necesidadesConectividad) {
            formData.necesidades.necesidadesConectividad = nec.necesidadesConectividad;
        }
        if (nec.necesidadesCapacitacion) {
            formData.necesidades.necesidadesCapacitacion = nec.necesidadesCapacitacion;
        }
        if (nec.observacionesGenerales) {
            formData.necesidades.observacionesGenerales = nec.observacionesGenerales;
        }

        // Campos de suficiencia
        formData.necesidades.infraFisicaSuficiente = nec.infraFisicaSuficiente || '';
        formData.necesidades.infraFisicaObservaciones = nec.infraFisicaObservaciones || '';
        formData.necesidades.infraTecAdecuada = nec.infraTecAdecuada || '';
        formData.necesidades.equipInfoAdecuado = nec.equipInfoAdecuado || '';
        formData.necesidades.equipBioAdecuado = nec.equipBioAdecuado || '';

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

// Lista de proveedores conocidos de internet en Perú
const PROVEEDORES_CONOCIDOS = [
    'Movistar',
    'Claro',
    'Entel',
    'Bitel',
    'WiNet',
    'Optical Networks',
    'Fiberlux',
    'GTD Perú',
    'Netline',
    'StarGlobal',
    'CableMás',
    'HughesNet',
    'DirectTV',
    'América Móvil Perú',
    'Telecable',
    'Cable Perú',
    'Cableonda',
    'Red Científica Peruana'
];

/**
 * Determina si el proveedor es uno conocido o "Otro"
 */
function getProveedorSeleccionado(proveedor) {
    if (!proveedor) return '';
    if (PROVEEDORES_CONOCIDOS.includes(proveedor)) {
        return proveedor;
    }
    return 'Otro';
}

/**
 * Retorna el valor del proveedor si es "Otro"
 */
function getProveedorOtro(proveedor) {
    if (!proveedor) return '';
    if (PROVEEDORES_CONOCIDOS.includes(proveedor)) {
        return '';
    }
    return proveedor;
}

export default formularioDiagnosticoService;

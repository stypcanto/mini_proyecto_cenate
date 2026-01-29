import apiClient from './apiClient';

/**
 * 📊 Servicio de API - Módulo Bolsas
 * v1.0.0 - Gestión de bolsas de pacientes, importación y solicitudes
 */

const API_BASE_URL = '/bolsas';

// ========================================================================
// 🔄 BOLSAS - Gestión de Bolsas de Pacientes
// ========================================================================

/**
 * Obtiene todas las bolsas de pacientes
 * @returns {Promise<Array>} - Listado de bolsas
 */
export const obtenerBolsas = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}`);
    return response;
  } catch (error) {
    console.error('Error al obtener bolsas:', error);
    throw error;
  }
};

/**
 * Obtiene una bolsa por ID
 * @param {number} id - ID de la bolsa
 * @returns {Promise<Object>} - Detalles de la bolsa
 */
export const obtenerBolsaPorId = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener bolsa ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva bolsa
 * @param {Object} dataBolsa - Datos de la bolsa a crear
 * @returns {Promise<Object>} - Bolsa creada
 */
export const crearBolsa = async (dataBolsa) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}`, dataBolsa);
    return response;
  } catch (error) {
    console.error('Error al crear bolsa:', error);
    throw error;
  }
};

/**
 * Actualiza una bolsa existente
 * @param {number} id - ID de la bolsa
 * @param {Object} dataBolsa - Datos a actualizar
 * @returns {Promise<Object>} - Bolsa actualizada
 */
export const actualizarBolsa = async (id, dataBolsa) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}/${id}`, dataBolsa);
    return response;
  } catch (error) {
    console.error(`Error al actualizar bolsa ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una bolsa
 * @param {number} id - ID de la bolsa
 * @returns {Promise<void>}
 */
export const eliminarBolsa = async (id) => {
  try {
    await apiClient.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error al eliminar bolsa ${id}:`, error);
    throw error;
  }
};

// ========================================================================
// 📤 IMPORTACIÓN - Cargar desde Excel
// ========================================================================

/**
 * Importa bolsas desde un archivo Excel
 * @param {FormData} formData - Formulario con el archivo
 * @returns {Promise<Object>} - Resultado de la importación
 */
export const importarDesdeExcel = async (formData) => {
  try {
    const response = await apiClient.uploadFile(`${API_BASE_URL}/importar/excel`, formData);
    return response;
  } catch (error) {
    console.error('Error al importar desde Excel:', error);
    throw error;
  }
};

/**
 * Obtiene el historial de importaciones
 * @returns {Promise<Array>} - Listado de importaciones
 */
export const obtenerHistorialImportaciones = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/importaciones/historial`);
    return response;
  } catch (error) {
    console.error('Error al obtener historial de importaciones:', error);
    throw error;
  }
};

// ========================================================================
// 📋 SOLICITUDES - Gestión de Solicitudes de Bolsas
// ========================================================================

/**
 * Importa solicitudes de bolsa desde un archivo Excel (v1.6.0)
 * Requiere selectores de Tipo Bolsa y Especialidad
 * Excel debe tener columnas: DNI, Código Adscripción
 *
 * @param {FormData} formData - Contiene: file, idTipoBolsa, idServicio
 * @returns {Promise<Object>} - Resultado con filas_ok, filas_error, errores
 */
export const importarSolicitudesDesdeExcel = async (formData) => {
  try {
    const response = await apiClient.uploadFile(`${API_BASE_URL}/solicitudes/importar`, formData);
    return response;
  } catch (error) {
    console.error('Error al importar solicitudes desde Excel:', error);
    throw error;
  }
};

/**
 * Obtiene todas las solicitudes de bolsas
 * @returns {Promise<Array>} - Listado de solicitudes
 */
export const obtenerSolicitudes = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes`);
    return response;
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    throw error;
  }
};

/**
 * Obtiene una solicitud por ID
 * @param {number} id - ID de la solicitud
 * @returns {Promise<Object>} - Detalles de la solicitud
 */
export const obtenerSolicitudPorId = async (id) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva solicitud de bolsa
 * @param {Object} dataSolicitud - Datos de la solicitud
 * @returns {Promise<Object>} - Solicitud creada
 */
export const crearSolicitud = async (dataSolicitud) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/solicitudes`, dataSolicitud);
    return response;
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    throw error;
  }
};

/**
 * Actualiza una solicitud existente
 * @param {number} id - ID de la solicitud
 * @param {Object} dataSolicitud - Datos a actualizar
 * @returns {Promise<Object>} - Solicitud actualizada
 */
export const actualizarSolicitud = async (id, dataSolicitud) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}/solicitudes/${id}`, dataSolicitud);
    return response;
  } catch (error) {
    console.error(`Error al actualizar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Aprueba una solicitud
 * @param {number} id - ID de la solicitud
 * @param {number} responsableId - ID del responsable
 * @param {string} responsableNombre - Nombre del responsable
 * @param {Object} params - Parámetros adicionales
 * @returns {Promise<Object>} - Solicitud aprobada
 */
export const aprobarSolicitud = async (id, responsableId, responsableNombre, params = {}) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}/solicitudes/${id}/aprobar`, {}, {
      params: {
        responsableId,
        responsableNombre,
        ...params
      }
    });
    return response;
  } catch (error) {
    console.error(`Error al aprobar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Rechaza una solicitud
 * @param {number} id - ID de la solicitud
 * @param {number} responsableId - ID del responsable
 * @param {string} responsableNombre - Nombre del responsable
 * @param {string} razon - Razón del rechazo
 * @returns {Promise<Object>} - Solicitud rechazada
 */
export const rechazarSolicitud = async (id, responsableId, responsableNombre, razon = '') => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}/solicitudes/${id}/rechazar`, {}, {
      params: {
        responsableId,
        responsableNombre,
        razon
      }
    });
    return response;
  } catch (error) {
    console.error(`Error al rechazar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una solicitud
 * @param {number} id - ID de la solicitud
 * @returns {Promise<void>}
 */
export const eliminarSolicitud = async (id) => {
  try {
    await apiClient.delete(`${API_BASE_URL}/solicitudes/${id}`);
  } catch (error) {
    console.error(`Error al eliminar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina múltiples solicitudes (soft delete en lote)
 * @param {Array<number>} ids - IDs de solicitudes a eliminar
 * @returns {Promise<Object>} - Estadísticas de borrado
 */
export const eliminarMultiplesSolicitudes = async (ids) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/solicitudes/borrar`, {
      ids: ids
    });
    return response;
  } catch (error) {
    console.error('Error al eliminar múltiples solicitudes:', error);
    throw error;
  }
};

// ========================================================================
// 📊 ESTADÍSTICAS - Métricas del módulo Bolsas
// ========================================================================

/**
 * 🆕 v2.0.0: Obtiene estadísticas generales del módulo
 * @returns {Promise<Object>} - Estadísticas
 */
export const obtenerEstadisticas = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/resumen`);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// ========================================================================
// 🆕 v2.0.0: NUEVOS ENDPOINTS DE ESTADÍSTICAS
// ========================================================================

/**
 * Obtiene estadísticas del día actual
 */
export const obtenerEstadisticasDelDia = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/del-dia`);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas del día:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por estado de cita
 */
export const obtenerEstadisticasPorEstado = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-estado`);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por estado:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por especialidad
 */
export const obtenerEstadisticasPorEspecialidad = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-especialidad`);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por especialidad:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por IPRESS
 */
export const obtenerEstadisticasPorIpress = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-ipress`);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por IPRESS:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por tipo de cita
 */
export const obtenerEstadisticasPorTipoCita = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-tipo-cita`);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por tipo de cita:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por tipo de bolsa
 */
export const obtenerEstadisticasPorTipoBolsa = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-tipo-bolsa`);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por tipo de bolsa:', error);
    throw error;
  }
};

/**
 * Obtiene evolución temporal (últimos 30 días)
 */
export const obtenerEvolutionTemporal = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/evolucion-temporal`);
    return response;
  } catch (error) {
    console.error('Error al obtener evolución temporal:', error);
    throw error;
  }
};

/**
 * Obtiene KPIs detallados
 */
export const obtenerKpis = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/kpis`);
    return response;
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    throw error;
  }
};

/**
 * Obtiene dashboard completo con todas las estadísticas
 */
export const obtenerDashboardCompleto = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/dashboard-completo`);
    return response;
  } catch (error) {
    console.error('Error al obtener dashboard completo:', error);
    throw error;
  }
};

/**
 * Exporta listado de bolsas a Excel
 * @param {Object} filtros - Filtros opcionales
 * @returns {Promise<Blob>} - Archivo Excel
 */
export const exportarBolsas = async (filtros = {}) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/exportar/excel`, { params: filtros });
    return response;
  } catch (error) {
    console.error('Error al exportar bolsas:', error);
    throw error;
  }
};

// ========================================================================
// 📂 HISTORIAL DE CARGAS - Gestión de cargas históricas
// ========================================================================

/**
 * Obtiene el listado de bolsas (historial completo)
 * GET /api/bolsas/cargas - Endpoint semántico para Historial de Bolsas v1.11.0
 * @returns {Promise<Array>} - Listado de bolsas
 */
export const obtenerListaCargas = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/importaciones/historial`);
    console.log('📋 Historial importaciones cargadas:', response);
    return response;
  } catch (error) {
    console.error('Error al obtener historial de importaciones:', error);
    throw error;
  }
};

/**
 * Obtiene los datos detallados de una bolsa específica
 * GET /api/bolsas/cargas/{id}
 * @param {number} idCarga - ID de la bolsa
 * @returns {Promise<Object>} - Datos completos de la bolsa
 */
export const obtenerDatosCarga = async (idCarga) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/cargas/${idCarga}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener datos de bolsa ${idCarga}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva bolsa
 * POST /api/bolsas/cargas
 * @param {Object} dataBolsa - Datos de la bolsa a crear
 * @returns {Promise<Object>} - Bolsa creada
 */
export const crearCargaBolsa = async (dataBolsa) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/cargas`, dataBolsa);
    return response;
  } catch (error) {
    console.error('Error al crear bolsa:', error);
    throw error;
  }
};

/**
 * Actualiza una bolsa existente
 * PUT /api/bolsas/cargas/{id}
 * @param {number} idCarga - ID de la bolsa
 * @param {Object} dataBolsa - Datos a actualizar
 * @returns {Promise<Object>} - Bolsa actualizada
 */
export const actualizarCargaBolsa = async (idCarga, dataBolsa) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}/cargas/${idCarga}`, dataBolsa);
    return response;
  } catch (error) {
    console.error(`Error al actualizar bolsa ${idCarga}:`, error);
    throw error;
  }
};

/**
 * Exporta una bolsa a Excel
 * @param {number} idCarga - ID de la bolsa a exportar
 * @returns {Promise<Blob>} - Archivo Excel con los datos de la bolsa
 */
export const exportarCargaExcel = async (idCarga) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/cargas/${idCarga}/exportar`);
    return response;
  } catch (error) {
    console.error(`Error al exportar bolsa ${idCarga}:`, error);
    throw error;
  }
};

/**
 * Elimina una bolsa (soft delete)
 * DELETE /api/bolsas/cargas/{id}
 * @param {number} idCarga - ID de la bolsa a eliminar
 * @returns {Promise<void>}
 */
export const eliminarCarga = async (idCarga) => {
  try {
    await apiClient.delete(`${API_BASE_URL}/cargas/${idCarga}`);
  } catch (error) {
    console.error(`Error al eliminar bolsa ${idCarga}:`, error);
    throw error;
  }
};

// ========================================================================
// 👤 ASIGNACIÓN A GESTORA - NUEVOS ENDPOINTS FASE 1
// ========================================================================

/**
 * Asigna una solicitud a una gestora de citas
 * @param {number} id - ID de la solicitud
 * @param {number} gestoraId - ID de la gestora
 * @param {string} gestoraNombre - Nombre de la gestora
 * @returns {Promise<Object>} - Solicitud actualizada
 */
export const asignarAGestora = async (id, gestoraId, gestoraNombre) => {
  try {
    const response = await apiClient.patch(`${API_BASE_URL}/solicitudes/${id}/asignar?idGestora=${gestoraId}`, {
      gestoraId,
      gestoraNombre
    });
    return response;
  } catch (error) {
    console.error(`Error al asignar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene lista de gestoras disponibles (rol GESTOR_DE_CITAS)
 * @returns {Promise<Object>} - Lista de gestoras con id, nombre, activo
 */
export const obtenerGestorasDisponibles = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/gestoras-disponibles`);
    return response;
  } catch (error) {
    console.error('Error al obtener gestoras disponibles:', error);
    throw error;
  }
};

/**
 * Cambia el teléfono de un paciente en una solicitud
 * @param {number} id - ID de la solicitud
 * @param {string} nuevoTelefono - Nuevo teléfono
 * @returns {Promise<Object>} - Solicitud actualizada
 */
export const cambiarTelefono = async (id, nuevoTelefono) => {
  try {
    const response = await apiClient.put(`${API_BASE_URL}/solicitudes/${id}`, {
      pacienteTelefono: nuevoTelefono
    });
    return response;
  } catch (error) {
    console.error(`Error al cambiar teléfono solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Cambia el tipo de bolsa de una solicitud
 * ⚠️ SOLO SUPERADMIN
 * @param {number} id - ID de la solicitud
 * @param {number} idBolsaNueva - ID de la nueva bolsa
 * @returns {Promise<Object>} - Solicitud actualizada
 */
export const cambiarTipoBolsa = async (id, idBolsaNueva) => {
  try {
    const response = await apiClient.patch(`${API_BASE_URL}/solicitudes/${id}/cambiar-bolsa`, {}, {
      params: {
        idBolsaNueva
      }
    });
    return response;
  } catch (error) {
    console.error(`Error al cambiar tipo de bolsa solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Exporta solicitudes a CSV
 * @param {Array<number>} ids - IDs de solicitudes a exportar
 * @returns {Promise<Blob>} - Archivo CSV
 */
export const descargarCSV = async (ids = []) => {
  try {
    const params = ids && ids.length > 0 ? { ids } : {};
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/exportar`, { params });
    return response;
  } catch (error) {
    console.error('Error al descargar CSV:', error);
    throw error;
  }
};

/**
 * Envía recordatorio de cita al paciente
 * @param {number} id - ID de la solicitud
 * @param {string} tipo - Tipo: 'WHATSAPP' o 'EMAIL'
 * @param {string} mensaje - Mensaje personalizado (opcional)
 * @returns {Promise<Object>} - Solicitud actualizada
 */
export const enviarRecordatorio = async (id, tipo, mensaje = '') => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/solicitudes/${id}/recordatorio`, {
      tipo,
      mensaje
    });
    return response;
  } catch (error) {
    console.error(`Error al enviar recordatorio solicitud ${id}:`, error);
    throw error;
  }
};

// ========================================================================
// 🔍 CATÁLOGOS - Estados, IPRESS, Redes (endpoints existentes)
// ========================================================================

/**
 * Obtiene todos los estados de gestión de citas
 * @returns {Promise<Array>} - Listado de estados
 */
export const obtenerEstadosGestion = async () => {
  try {
    const response = await apiClient.get('/admin/estados-gestion-citas/todos');
    return response;
  } catch (error) {
    console.error('Error al obtener estados de gestión:', error);
    throw error;
  }
};

/**
 * Obtiene todos los IPRESS
 * @returns {Promise<Array>} - Listado de IPRESS
 */
export const obtenerIpress = async () => {
  try {
    const response = await apiClient.get('/ipress');
    return response;
  } catch (error) {
    console.error('Error al obtener IPRESS:', error);
    throw error;
  }
};

/**
 * Obtiene un IPRESS por ID
 * @param {number} id - ID del IPRESS
 * @returns {Promise<Object>} - Detalles del IPRESS
 */
export const obtenerIpressPorId = async (id) => {
  try {
    const response = await apiClient.get(`/ipress/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener IPRESS ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las Redes
 * @returns {Promise<Array>} - Listado de Redes
 */
export const obtenerRedes = async () => {
  try {
    const response = await apiClient.get('/redes');
    return response;
  } catch (error) {
    console.error('Error al obtener redes:', error);
    throw error;
  }
};

/**
 * Obtiene una Red por ID
 * @param {number} id - ID de la Red
 * @returns {Promise<Object>} - Detalles de la Red
 */
export const obtenerRedPorId = async (id) => {
  try {
    const response = await apiClient.get(`/redes/${id}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener red ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene datos de un asegurado por DNI
 * @param {string} dni - DNI del asegurado
 * @returns {Promise<Object>} - Detalles del asegurado o null
 */
export const obtenerAseguradoPorDni = async (dni) => {
  try {
    const response = await apiClient.get(`/gestion-pacientes/asegurado/${dni}`);
    return response;
  } catch (error) {
    // 404 es esperado si no existe
    if (error.message && error.message.includes('404')) {
      return null;
    }
    console.error(`Error al obtener asegurado ${dni}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo asegurado
 * @param {Object} datosAsegurado - Datos del asegurado
 * @returns {Promise<Object>} - Asegurado creado
 */
export const crearAsegurado = async (datosAsegurado) => {
  try {
    const response = await apiClient.post('/gestion-pacientes', datosAsegurado);
    return response;
  } catch (error) {
    console.error('Error al crear asegurado:', error);
    throw error;
  }
};

// ========================================================================
// 🔴 ERRORES DE IMPORTACIÓN (v2.1.0) - Auditoría de errores
// ========================================================================

/**
 * Obtiene todos los errores de importación registrados
 * GET /api/bolsas/errores-importacion
 * @returns {Promise<Array>} - Lista de errores de importación
 */
export const obtenerErroresImportacion = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/errores-importacion`);
    return Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error('Error al obtener errores de importación:', error);
    throw error;
  }
};

/**
 * Exporta los errores de importación en formato CSV
 * GET /api/bolsas/errores-importacion/exportar
 * @returns {Promise<Blob>} - Archivo CSV descargable
 */
export const exportarErroresImportacion = async () => {
  try {
    const response = await fetch('/api/bolsas/errores-importacion/exportar', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth.token')}`
      }
    });

    if (!response.ok) throw new Error('Error descargando reporte');

    return await response.blob();
  } catch (error) {
    console.error('Error al exportar errores de importación:', error);
    throw error;
  }
};

export default {
  // Bolsas
  obtenerBolsas,
  obtenerBolsaPorId,
  crearBolsa,
  actualizarBolsa,
  eliminarBolsa,

  // Importación
  importarDesdeExcel,
  obtenerHistorialImportaciones,

  // Solicitudes
  importarSolicitudesDesdeExcel,
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  crearSolicitud,
  actualizarSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  eliminarSolicitud,
  eliminarMultiplesSolicitudes,

  // Estadísticas
  obtenerEstadisticas,
  obtenerEstadisticasDelDia,
  obtenerEstadisticasPorEstado,
  obtenerEstadisticasPorEspecialidad,
  obtenerEstadisticasPorIpress,
  obtenerEstadisticasPorTipoCita,
  obtenerEstadisticasPorTipoBolsa,
  obtenerEvolutionTemporal,
  obtenerKpis,
  obtenerDashboardCompleto,
  exportarBolsas,

  // Historial de Cargas / Bolsas (v1.11.0 - renamed for semantic alignment)
  obtenerListaCargas,
  obtenerDatosCarga,
  crearCargaBolsa,
  actualizarCargaBolsa,
  exportarCargaExcel,
  eliminarCarga,

  // NUEVOS - Fase 1
  asignarAGestora,
  cambiarTelefono,
  cambiarTipoBolsa,
  descargarCSV,
  enviarRecordatorio,
  obtenerEstadosGestion,
  obtenerIpress,
  obtenerIpressPorId,
  obtenerRedes,
  obtenerRedPorId,
  obtenerAseguradoPorDni,
  crearAsegurado,

  // ERRORES DE IMPORTACIÓN (v2.1.0)
  obtenerErroresImportacion,
  exportarErroresImportacion,
};

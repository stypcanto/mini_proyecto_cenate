import apiClient from '../lib/apiClient';

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
    const response = await apiClient.get(`${API_BASE_URL}`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/${id}`, true);
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
    const response = await apiClient.post(`${API_BASE_URL}`, dataBolsa, true);
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
    const response = await apiClient.put(`${API_BASE_URL}/${id}`, dataBolsa, true);
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
    await apiClient.delete(`${API_BASE_URL}/${id}`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/importaciones/historial`, true);
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
    const response = await apiClient.post(`${API_BASE_URL}/solicitudes/importar`, formData, true);
    return response;
  } catch (error) {
    console.error('Error al importar solicitudes desde Excel:', error);
    throw error;
  }
};

/**
 * 🚀 v1.79.1: Obtiene TODOS los registros gestionados (SolicitudesAtendidas)
 * Endpoint optimizado sin subconsultas correlacionadas.
 * @returns {Promise<Array>} - Lista completa de registros gestionados
 */
export const obtenerGestionados = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/gestionados`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener gestionados:', error);
    throw error;
  }
};

/**
 * Obtiene todas las solicitudes de bolsas (sin paginación)
 * DEPRECATED: Usar obtenerSolicitudesPaginado() para nuevas implementaciones
 * @returns {Promise<Array>} - Listado de solicitudes
 */
export const obtenerSolicitudes = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    throw error;
  }
};

/**
 * Obtiene solicitudes paginadas CON SOPORTE PARA FILTROS (v2.6.0)
 * UX: Filtrado server-side integrado con paginación
 * Cuando el usuario selecciona cualquier filtro, recibe resultados al instante
 *
 * @param {number} page - Número de página (0-based)
 * @param {number} size - Registros por página (default: 25)
 * @param {Long} idBolsa - ID bolsa (null/"todas" = todas)
 * @param {string} macrorregion - Descripción macrorregión (null/"todas" = todas)
 * @param {string} red - Descripción red (null/"todas" = todas)
 * @param {string} ipress - Descripción IPRESS (null/"todas" = todas)
 * @param {string} especialidad - Especialidad (null/"todas" = todas)
 * @param {Long} estadoId - ID estado cita (null = todos)
 * @param {string} tipoCita - Tipo cita (null/"todas" = todos)
 * @param {string} busqueda - Búsqueda libre: paciente/DNI/IPRESS (null = ignorar)
 * @returns {Promise<Object>} - Página con solicitudes filtradas
 */
export const obtenerSolicitudesPaginado = async (
  page = 0,
  size = 25,
  bolsa = null,
  macrorregion = null,
  red = null,
  ipress = null,
  especialidad = null,
  estado = null,
  ipressAtencion = null,
  tipoCita = null,
  asignacion = null,
  busqueda = null,
  fechaInicio = null,
  fechaFin = null,
  condicionMedica = null,          // v1.74.0: Filtro por condicion_medica (PADOMI)
  gestoraId = null,                // v1.70.x: Filtro por gestora asignada (ID)
  estadoBolsa = null,              // Filtro por estado de bolsa (PENDIENTE, APROBADA, RECHAZADA)
  categoriaEspecialidad = null,    // 'medicina_general' | 'enfermeria' | 'especialidades' | null
  estrategia = null                // 'CENACRON' | 'MARATON' | null (todos)
) => {
  try {
    // Construir query string dinámico
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);

    // Agregar filtros solo si están definidos y no son "todas"/"todos"
    if (bolsa && bolsa !== 'todas') params.append('bolsa', bolsa);
    if (macrorregion && macrorregion !== 'todas') params.append('macrorregion', macrorregion);
    if (red && red !== 'todas') params.append('red', red);
    if (ipress && ipress !== 'todas') params.append('ipress', ipress);
    if (especialidad && especialidad !== 'todas') params.append('especialidad', especialidad);
    if (estado && estado !== 'todos') params.append('estado', estado);
    if (ipressAtencion && ipressAtencion.trim()) params.append('ipressAtencion', ipressAtencion.trim());
    if (tipoCita && tipoCita !== 'todas') params.append('tipoCita', tipoCita);
    if (asignacion && asignacion !== 'todos') {
      console.log('🔍 Agregando filtro asignacion:', asignacion);
      params.append('asignacion', asignacion);
    }
    if (busqueda && busqueda.trim()) params.append('busqueda', busqueda.trim());
    if (fechaInicio && fechaInicio.trim()) params.append('fechaInicio', fechaInicio.trim());
    if (fechaFin && fechaFin.trim()) params.append('fechaFin', fechaFin.trim());
    if (condicionMedica && condicionMedica.trim()) params.append('condicionMedica', condicionMedica.trim());
    if (gestoraId !== null && gestoraId !== undefined) params.append('gestoraId', gestoraId);
    if (estadoBolsa && estadoBolsa !== 'todos') params.append('estadoBolsa', estadoBolsa);
    if (categoriaEspecialidad) params.append('categoriaEspecialidad', categoriaEspecialidad);
    if (estrategia && estrategia !== 'todos') params.append('estrategia', estrategia);

    const finalUrl = `${API_BASE_URL}/solicitudes?${params.toString()}`;
    console.log('🌐 URL de solicitud:', finalUrl);
    const response = await apiClient.get(finalUrl, true);
    return response;
  } catch (error) {
    console.error('Error al obtener solicitudes paginadas:', error);
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
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/${id}`, true);
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
    const response = await apiClient.post(`${API_BASE_URL}/solicitudes`, dataSolicitud, true);
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
    const response = await apiClient.put(`${API_BASE_URL}/solicitudes/${id}`, dataSolicitud, true);
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
    const queryParams = new URLSearchParams({
      responsableId,
      responsableNombre,
      ...params
    });
    const response = await apiClient.put(
      `${API_BASE_URL}/solicitudes/${id}/aprobar?${queryParams.toString()}`,
      {},
      true
    );
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
    const queryParams = new URLSearchParams({
      responsableId,
      responsableNombre,
      razon
    });
    const response = await apiClient.put(
      `${API_BASE_URL}/solicitudes/${id}/rechazar?${queryParams.toString()}`,
      {},
      true
    );
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
    await apiClient.delete(`${API_BASE_URL}/solicitudes/${id}`, true);
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
    }, true);
    return response;
  } catch (error) {
    console.error('Error al eliminar múltiples solicitudes:', error);
    throw error;
  }
};

/**
 * v1.81.5 - Devuelve solicitudes al estado PENDIENTE_CITA con motivo de devolución
 * @param {number[]} ids - IDs de solicitudes a devolver
 * @param {string} motivo - Motivo de la devolución
 */
export const devolverAPendientes = async (ids, motivo) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/solicitudes/devolver-a-pendientes`, {
      ids,
      motivo,
    }, true);
    return response;
  } catch (error) {
    console.error('Error al devolver solicitudes a pendientes:', error);
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
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/resumen`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/del-dia`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas del día:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por estado de cita
 * @param {string} ipressAtencion - Filtro opcional por IPRESS Atención (ej: 'PADOMI')
 */
/** Estadísticas por condicion_medica para bolsa PADOMI (v1.73.1) */
export const obtenerEstadisticasCondicionMedicaPadomi = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-condicion-medica-padomi`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas condicion_medica PADOMI:', error);
    throw error;
  }
};

export const obtenerEstadisticasPorEstado = async (ipressAtencion = null) => {
  try {
    const url = ipressAtencion
      ? `${API_BASE_URL}/estadisticas/por-estado?ipressAtencion=${encodeURIComponent(ipressAtencion)}`
      : `${API_BASE_URL}/estadisticas/por-estado`;
    const response = await apiClient.get(url, true);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por estado:', error);
    throw error;
  }
};

/** v1.85.8: Citados por segmento MARATÓN (CENACRON vs ESPECIALIDADES) */
export const obtenerEstadisticasMaratonSegmentos = async () => {
  try {
    return await apiClient.get(`${API_BASE_URL}/estadisticas/maraton-segmentos`, true);
  } catch (error) {
    console.error('Error al obtener estadísticas MARATÓN segmentos:', error);
    throw error;
  }
};

/** v1.85.9: KPI MARATÓN con pacientes únicos (DISTINCT ON) — suma exacta al universo */
export const obtenerKpiMaraton = async () => {
  try {
    return await apiClient.get(`${API_BASE_URL}/estadisticas/maraton-kpi`, true);
  } catch (error) {
    console.error('Error al obtener KPI MARATÓN:', error);
    throw error;
  }
};

/** v1.85.9: Desglose completo de estados por segmento MARATÓN (CENACRON / ESPECIALIDADES) */
export const obtenerDesgloseMaratonSegmentos = async () => {
  try {
    return await apiClient.get(`${API_BASE_URL}/estadisticas/maraton-desglose`, true);
  } catch (error) {
    console.error('Error al obtener desglose MARATÓN por segmento:', error);
    throw error;
  }
};

/** v1.85.9: Lista paginada de pacientes MARATÓN por categoría del embudo */
export const obtenerPacientesMaratonCategoria = async (categoria, busqueda = '', page = 0, size = 50, filtros = {}) => {
  try {
    const params = new URLSearchParams({ categoria, page, size });
    if (busqueda) params.append('busqueda', busqueda);
    if (filtros.sexo)           params.append('sexo', filtros.sexo);
    if (filtros.estadoGestion)  params.append('estadoGestion', filtros.estadoGestion);
    if (filtros.edadMin != null && filtros.edadMin !== '') params.append('edadMin', filtros.edadMin);
    if (filtros.edadMax != null && filtros.edadMax !== '') params.append('edadMax', filtros.edadMax);
    if (filtros.ipressFiltro)   params.append('ipressFiltro', filtros.ipressFiltro);
    if (filtros.redFiltro)      params.append('redFiltro', filtros.redFiltro);
    if (filtros.macrorredFiltro) params.append('macrorredFiltro', filtros.macrorredFiltro);
    return await apiClient.get(`${API_BASE_URL}/estadisticas/maraton-pacientes?${params.toString()}`, true);
  } catch (error) {
    console.error('Error al obtener pacientes MARATÓN:', error);
    throw error;
  }
};

/** v1.85.26: Totales brutos MARATÓN — para nota de doble conteo */
export const obtenerTotalesBrutosMaraton = async () => {
  try {
    return await apiClient.get(`${API_BASE_URL}/estadisticas/maraton-totales-brutos`, true);
  } catch (error) {
    console.error('Error al obtener totales brutos MARATÓN:', error);
    return { totalRegistros: 0, pacientesUnicos: 0, registrosExtra: 0, pacientesMultiplesCitas: 0 };
  }
};

/** v1.85.35: Atendidos por segmento y condicion_medica — Maratón 2026 */
export const obtenerAtendidosMaraton = async () => {
  try {
    return await apiClient.get(`${API_BASE_URL}/estadisticas/maraton-atendidos`, true);
  } catch (error) {
    console.error('Error al obtener atendidos MARATÓN:', error);
    return [];
  }
};

/** v1.85.9: Opciones únicas de filtros para el modal de pacientes MARATÓN */
export const obtenerOpcionesFiltrosMaraton = async (categoria) => {
  try {
    return await apiClient.get(`${API_BASE_URL}/estadisticas/maraton-filtros-opciones?categoria=${categoria}`, true);
  } catch (error) {
    console.error('Error al obtener opciones filtros MARATÓN:', error);
    return { macrorredes: [], redes: [], ipress: [] };
  }
};

/** v1.85.30: Dashboard territorial Maratón — avances por macrorregión, red e IPRESS */
export const obtenerDashboardTerritorialMaraton = async () => {
  try {
    return await apiClient.get(`${API_BASE_URL}/estadisticas/maraton-territorial`, true);
  } catch (error) {
    console.error('Error al obtener dashboard territorial MARATÓN:', error);
    return { porMacrorregion: [], porRed: [], porIpress: [] };
  }
};

/** v1.78.3: KPI filtrados — mismos parámetros que el listado de solicitudes */
export const obtenerKpiConFiltros = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v != null && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    const url = qs
      ? `${API_BASE_URL}/estadisticas/kpi-con-filtros?${qs}`
      : `${API_BASE_URL}/estadisticas/kpi-con-filtros`;
    return await apiClient.get(url, true);
  } catch (error) {
    console.error('Error al obtener KPI con filtros:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por especialidad
 * @param {string} ipressAtencion - Filtro opcional por IPRESS atención (ej: 'PADOMI')
 */
export const obtenerEstadisticasPorEspecialidad = async (ipressAtencion = null) => {
  try {
    const url = ipressAtencion
      ? `${API_BASE_URL}/estadisticas/por-especialidad?ipressAtencion=${encodeURIComponent(ipressAtencion)}`
      : `${API_BASE_URL}/estadisticas/por-especialidad`;
    const response = await apiClient.get(url, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-ipress`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por IPRESS:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por IPRESS de Atención
 * @param {Object} params - Filtros opcionales: bolsaNombre, categoriaEspecialidad, estadoCodigo
 */
export const obtenerEstadisticasPorIpressAtencion = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.bolsaNombre) query.set('bolsaNombre', params.bolsaNombre);
    if (params.categoriaEspecialidad) query.set('categoriaEspecialidad', params.categoriaEspecialidad);
    if (params.estadoCodigo) query.set('estadoCodigo', params.estadoCodigo);
    const qs = query.toString();
    const url = `${API_BASE_URL}/estadisticas/por-ipress-atencion${qs ? '?' + qs : ''}`;
    const response = await apiClient.get(url, true);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por IPRESS Atención:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas por tipo de cita
 */
export const obtenerEstadisticasPorTipoCita = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-tipo-cita`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/por-tipo-bolsa`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/evolucion-temporal`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/kpis`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    throw error;
  }
};

/**
 * 🆕 v3.0.0 - Obtiene estadísticas consolidadas para filtros (optimización)
 * Una sola llamada en lugar de 7 separadas
 *
 * Antes: 7 llamadas al iniciar la página de Solicitudes
 * Ahora: 1 llamada con todos los datos para los dropdowns
 *
 * Retorna un objeto con:
 * - por_tipo_bolsa: estadísticas para dropdown Bolsas
 * - por_macrorregion: estadísticas para dropdown Macrorregión
 * - por_red: estadísticas para dropdown Redes
 * - por_ipress: estadísticas para dropdown IPRESS
 * - por_especialidad: estadísticas para dropdown Especialidades
 * - por_tipo_cita: estadísticas para dropdown Tipo Cita
 * - por_estado: estadísticas para dropdown Estado
 */
export const obtenerEstadisticasFiltros = async () => {
  try {
    console.log('🔍 [obtenerEstadisticasFiltros] Iniciando llamada a /estadisticas/filtros');
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/filtros`, true);
    console.log('✅ Respuesta recibida:', response);
    console.log('✅ Tipo de respuesta:', typeof response);
    console.log('✅ Keys de respuesta:', Object.keys(response));
    console.log('✅ Estadísticas consolidadas cargadas (1 llamada = 7 antiguas)');
    return response;
  } catch (error) {
    console.error('❌ [obtenerEstadisticasFiltros] Error completo:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    throw error;
  }
};

/**
 * Obtiene dashboard completo con todas las estadísticas
 */
export const obtenerDashboardCompleto = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/estadisticas/dashboard-completo`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/exportar/excel`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/importaciones/historial`, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/cargas/${idCarga}`, true);
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
    const response = await apiClient.post(`${API_BASE_URL}/cargas`, dataBolsa, true);
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
    const response = await apiClient.put(`${API_BASE_URL}/cargas/${idCarga}`, dataBolsa, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/cargas/${idCarga}/exportar`, true);
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
    await apiClient.delete(`${API_BASE_URL}/cargas/${idCarga}`, true);
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
    // Construir URL dinámicamente: solo incluir parámetro si gestoraId es válido
    const url = gestoraId !== null && gestoraId !== undefined
      ? `${API_BASE_URL}/solicitudes/${id}/asignar?idGestora=${gestoraId}`
      : `${API_BASE_URL}/solicitudes/${id}/asignar`;

    const response = await apiClient.patch(url, {
      gestoraId: gestoraId || null,
      gestoraNombre: gestoraNombre || null
    }, true);
    return response;
  } catch (error) {
    console.error(`Error al asignar solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Asigna una gestora a múltiples solicitudes en una sola llamada HTTP (bulk)
 * @param {number[]} ids      - Lista de IDs de solicitudes
 * @param {number}  gestoraId - ID de la gestora a asignar
 * @returns {Promise<Object>} - { actualizados, mensaje }
 */
export const asignarGestoraMasivo = async (ids, gestoraId) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/solicitudes/asignar-gestora-masivo`,
      { ids, idGestora: gestoraId },
      true
    );
    return response;
  } catch (error) {
    console.error('Error en asignación masiva de gestora:', error);
    throw error;
  }
};

/**
 * Obtiene lista de gestoras disponibles (rol GESTOR_DE_CITAS)
 * @returns {Promise<Object>} - Lista de gestoras con id, nombre, activo
 */
export const obtenerGestorasDisponibles = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/gestoras-disponibles`, true);
    return response;
  } catch (error) {
    console.warn('No se pudieron cargar gestoras disponibles:', error?.message || error);
    return [];
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
    }, true);
    return response;
  } catch (error) {
    console.error(`Error al cambiar teléfono solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza ambos teléfonos (principal y alterno) de una solicitud
 * v2.4.3: Permite actualizar uno, el otro o ambos
 * @param {number} id - ID de la solicitud
 * @param {string} telefonoPrincipal - Nuevo teléfono principal (puede ser null)
 * @param {string} telefonoAlterno - Nuevo teléfono alterno (puede ser null)
 * @returns {Promise<Object>} - Solicitud actualizada
 */
export const actualizarTelefonos = async (id, telefonoPrincipal, telefonoAlterno) => {
  try {
    const params = new URLSearchParams();
    if (telefonoPrincipal) {
      params.append('pacienteTelefono', telefonoPrincipal);
    }
    if (telefonoAlterno) {
      params.append('pacienteTelefonoAlterno', telefonoAlterno);
    }

    const response = await apiClient.put(
      `${API_BASE_URL}/solicitudes/${id}?${params.toString()}`,
      null,
      true
    );
    return response;
  } catch (error) {
    console.error(`Error al actualizar teléfonos solicitud ${id}:`, error);
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
    const response = await apiClient.patch(
      `${API_BASE_URL}/solicitudes/${id}/cambiar-bolsa?idBolsaNueva=${idBolsaNueva}`,
      {},
      true
    );
    return response;
  } catch (error) {
    console.error(`Error al cambiar tipo de bolsa solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Exporta solicitudes a CSV
 * @param {Array<number>} ids - IDs de solicitudes a exportar
 * @returns {Promise<Blob>} - Archivo CSV como Blob
 */
export const descargarCSV = async (ids = []) => {
  try {
    const token = localStorage.getItem('auth.token');
    const idsParam = ids && ids.length > 0 ? ids.join(',') : '';
    const url = `${API_BASE_URL}/solicitudes/exportar?ids=${idsParam}`;

    console.log(`📥 Descargando CSV desde: ${url}`);

    // ✅ Usar fetch directamente para obtener Blob
    // (apiClient convierte todo a texto)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Obtener como Blob (NO convertir a texto)
    const blob = await response.blob();
    console.log(`✅ CSV descargado como Blob:`, blob.type, blob.size, 'bytes');
    return blob;
  } catch (error) {
    console.error('❌ Error al descargar CSV:', error);
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
    }, true);
    return response;
  } catch (error) {
    console.error(`Error al enviar recordatorio solicitud ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene la bandeja de la gestora actual (Mi Bandeja)
 * GET /api/bolsas/solicitudes/mi-bandeja
 * Solo usuarios con rol GESTOR_DE_CITAS pueden acceder
 * @returns {Promise<Object>} - Lista de solicitudes asignadas a la gestora
 */
export const obtenerMiBandeja = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/mi-bandeja`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener Mi Bandeja:', error);
    throw error;
  }
};

/**
 * Cambia el estado de una solicitud
 * PATCH /api/bolsas/solicitudes/{id}/estado
 * @param {number} id - ID de la solicitud
 * @param {number} nuevoEstadoId - ID del nuevo estado
 * @returns {Promise<Object>} - Solicitud actualizada
 */
export const cambiarEstado = async (id, nuevoEstadoId) => {
  try {
    const response = await apiClient.patch(
      `${API_BASE_URL}/solicitudes/${id}/estado?nuevoEstadoId=${nuevoEstadoId}`,
      {},
      true
    );
    return response;
  } catch (error) {
    console.error(`Error al cambiar estado solicitud ${id}:`, error);
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
    const response = await apiClient.get('/admin/estados-gestion-citas/todos', true);
    return response;
  } catch (error) {
    console.error('Error al obtener estados de gestión:', error);
    throw error;
  }
};

/**
 * ✅ v1.105.0: Actualiza la IPRESS de Atención de una solicitud
 * @param {number} idSolicitud - ID de la solicitud
 * @param {number|null} idIpressAtencion - ID de la nueva IPRESS (null para limpiar)
 */
export const actualizarIpressAtencion = async (idSolicitud, idIpressAtencion) => {
  try {
    const params = idIpressAtencion ? `?idIpressAtencion=${idIpressAtencion}` : '';
    const response = await apiClient.patch(`/bolsas/solicitudes/${idSolicitud}/ipress-atencion${params}`, {}, true);
    return response;
  } catch (error) {
    console.error(`Error al actualizar IPRESS Atención de solicitud ${idSolicitud}:`, error);
    throw error;
  }
};

/**
 * Actualiza la IPRESS de Adscripción (id_ipress) de una solicitud
 * @param {number} idSolicitud - ID de la solicitud
 * @param {number} idIpress - ID de la nueva IPRESS
 */
export const actualizarIpressAdscripcion = async (idSolicitud, idIpress) => {
  try {
    const params = idIpress ? `?idIpress=${idIpress}` : '';
    const response = await apiClient.patch(`/bolsas/solicitudes/${idSolicitud}/ipress-adscripcion${params}`, {}, true);
    return response;
  } catch (error) {
    console.error(`Error al actualizar IPRESS Adscripción de solicitud ${idSolicitud}:`, error);
    throw error;
  }
};

/**
 * Actualiza la fecha preferida de una solicitud
 * @param {number} idSolicitud - ID de la solicitud
 * @param {string|null} fecha - Fecha en formato YYYY-MM-DD (null para limpiar)
 */
export const actualizarFechaPreferida = async (idSolicitud, fecha) => {
  try {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await apiClient.patch(`/bolsas/solicitudes/${idSolicitud}/fecha-preferida${params}`, {}, true);
    return response;
  } catch (error) {
    console.error(`Error al actualizar fecha preferida de solicitud ${idSolicitud}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los IPRESS
 * @returns {Promise<Array>} - Listado de IPRESS
 */
export const obtenerIpress = async () => {
  try {
    const response = await apiClient.get('/ipress', true);
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
    const response = await apiClient.get(`/ipress/${id}`, true);
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
    const response = await apiClient.get('/redes', true);
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
    const response = await apiClient.get(`/redes/${id}`, true);
    return response;
  } catch (error) {
    console.error(`Error al obtener red ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de pacientes agrupados por gestora de citas
 * GET /api/bolsas/solicitudes/estadisticas/por-gestora
 * Solo accesible para SUPERADMIN y COORD. GESTION CITAS
 * @returns {Promise<Array>} - Lista de BolsaXGestoraDTO
 */
export const obtenerEstadisticasPorGestora = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/estadisticas/por-gestora`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener estadísticas por gestora:', error);
    throw error;
  }
};

/**
 * 🔎 Obtiene todas las especialidades únicas pobladas en la tabla (v1.42.0)
 * GET /api/bolsas/solicitudes/especialidades
 * Usado para llenar dinámicamente el filtro de especialidades
 * @returns {Promise<Object>} - { total: number, especialidades: Array, mensaje: string }
 * @example
 * const response = await obtenerEspecialidadesUnicas();
 * // { total: 9, especialidades: ["CARDIOLOGIA", ...], mensaje: "9 especialidades encontradas" }
 */
export const obtenerEspecialidadesUnicas = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/solicitudes/especialidades`, true);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener especialidades únicas:', error);
    throw error;
  }
};

/**
 * v1.84.2: Agrupación inteligente — GROUP BY server-side.
 * Devuelve [{ipress, especialidad, total, grupos, ids[]}] solo para múltiplos de 4.
 * ~100x más rápido que cargar size=9999.
 */
export const agruparPorIpressAtencion = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.bolsaNombre)           params.append('bolsa',                filtros.bolsaNombre);
  if (filtros.macrorregion)          params.append('macrorregion',         filtros.macrorregion);
  if (filtros.red)                   params.append('red',                  filtros.red);
  if (filtros.ipress)                params.append('ipress',               filtros.ipress);
  if (filtros.especialidad)          params.append('especialidad',         filtros.especialidad);
  if (filtros.estadoCodigo)          params.append('estado',               filtros.estadoCodigo);
  if (filtros.ipressAtencion)        params.append('ipressAtencion',       filtros.ipressAtencion);
  if (filtros.tipoCita)              params.append('tipoCita',             filtros.tipoCita);
  if (filtros.asignacion)            params.append('asignacion',           filtros.asignacion);
  if (filtros.busqueda)              params.append('busqueda',             filtros.busqueda);
  if (filtros.fechaInicio)           params.append('fechaInicio',          filtros.fechaInicio);
  if (filtros.fechaFin)              params.append('fechaFin',             filtros.fechaFin);
  if (filtros.gestoraId)             params.append('gestoraId',            filtros.gestoraId);
  if (filtros.estadoBolsa)           params.append('estadoBolsa',          filtros.estadoBolsa);
  if (filtros.categoriaEspecialidad) params.append('categoriaEspecialidad',filtros.categoriaEspecialidad);
  const url = `${API_BASE_URL}/solicitudes/agrupar-por-ipress-atencion?${params.toString()}`;
  const response = await apiClient.get(url, true);
  return Array.isArray(response) ? response : [];
};

/**
 * Obtiene todos los tipos de bolsas activos (público)
 * GET /api/bolsas/tipos-bolsas/activos
 * @returns {Promise<Array>} - Listado de tipos de bolsas
 */
export const obtenerTiposBolsasActivosPublic = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/tipos-bolsas/activos`, true);
    return response;
  } catch (error) {
    console.error('Error al obtener tipos de bolsas activos:', error);
    throw error;
  }
};

/**
 * Obtiene especialidades activas de CENATE
 * GET /api/servicio-essi/activos-cenate
 * @returns {Promise<Array>} - Listado de especialidades activas
 */
export const obtenerEspecialidadesActivasCenate = async () => {
  try {
    const response = await apiClient.get('/servicio-essi/activos-cenate', true);
    return response;
  } catch (error) {
    console.error('Error al obtener especialidades activas CENATE:', error);
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
    const response = await apiClient.get(`/gestion-pacientes/asegurado/${dni}`, true);
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
    const response = await apiClient.post('/gestion-pacientes', datosAsegurado, true);
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
    const response = await apiClient.get(`${API_BASE_URL}/errores-importacion`, true);
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

/**
 * Sincroniza teléfonos desde la tabla asegurados hacia dim_solicitud_bolsa.
 * Completa teléfonos faltantes buscando en la BD de asegurados por DNI.
 * POST /api/bolsas/sincronizar-telefonos
 */
const sincronizarTelefonos = async () => {
  try {
    const response = await apiClient.post('/bolsas/solicitudes/sincronizar-telefonos', {}, true);
    return response;
  } catch (error) {
    console.error('Error al sincronizar teléfonos:', error);
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
  obtenerGestionados,          // v1.79.1: Endpoint optimizado para SolicitudesAtendidas
  obtenerSolicitudesPaginado, // NEW v2.5.1: Paginación server-side
  obtenerSolicitudPorId,
  crearSolicitud,
  actualizarSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
  eliminarSolicitud,
  eliminarMultiplesSolicitudes,
  devolverAPendientes,

  // Estadísticas
  obtenerEstadisticas,
  obtenerEstadisticasDelDia,
  obtenerEstadisticasPorEstado,
  obtenerKpiMaraton,
  obtenerEstadisticasMaratonSegmentos,
  obtenerDesgloseMaratonSegmentos,
  obtenerKpiConFiltros,
  obtenerEstadisticasPorEspecialidad,
  obtenerEstadisticasPorIpress,
  obtenerEstadisticasPorIpressAtencion,
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
  asignarGestoraMasivo, // v1.65.0: Asignación bulk (1 sola llamada HTTP)
  obtenerGestorasDisponibles, // NEW v2.4.0: Lista de gestoras disponibles
  cambiarTelefono,
  actualizarTelefonos, // NEW v2.5.0: Actualizar teléfono principal y/o alterno
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
  obtenerTiposBolsasActivosPublic,
  obtenerEspecialidadesActivasCenate,

  // ERRORES DE IMPORTACIÓN (v2.1.0)
  obtenerErroresImportacion,
  exportarErroresImportacion,

  // MI BANDEJA - Para gestoras (v2.5.0)
  obtenerMiBandeja, // NEW: Obtener solicitudes asignadas a la gestora
  cambiarEstado, // NEW: Cambiar estado de una solicitud

  // FILTROS DINÁMICOS (v1.42.0)
  obtenerEspecialidadesUnicas, // NEW: Obtener todas las especialidades únicas de la tabla

  // BOLSA X GESTOR
  obtenerEstadisticasPorGestora,

  // SINCRONIZACIÓN DE TELÉFONOS
  sincronizarTelefonos,

  // AGRUPACIÓN INTELIGENTE (v1.84.2)
  agruparPorIpressAtencion,

  // EDICIÓN IPRESS
  actualizarIpressAtencion,
  actualizarIpressAdscripcion,
};

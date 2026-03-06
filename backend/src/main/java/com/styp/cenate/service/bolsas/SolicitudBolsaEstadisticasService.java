package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.estadisticas.*;

import java.util.List;

/**
 * 🆕 v2.0.0: Servicio de Estadísticas del módulo Bolsas
 * Calcula y proporciona métricas clave de rendimiento
 *
 * Responsabilidades:
 * - Obtener estadísticas por estado de cita
 * - Obtener estadísticas por especialidad
 * - Obtener estadísticas por IPRESS
 * - Obtener estadísticas por tipo de cita
 * - Calcular evolución temporal
 * - Calcular KPIs generales
 * - Enriquecer datos con colores, emojis, indicadores
 */
public interface SolicitudBolsaEstadisticasService {

    /**
     * Obtiene estadísticas generales resumidas
     * Incluye: total, atendidas, pendientes, canceladas, tasas, KPIs principales
     *
     * @return EstadisticasGeneralesDTO con resumen ejecutivo
     */
    EstadisticasGeneralesDTO obtenerEstadisticasGenerales();

    /**
     * Obtiene estadísticas agrupadas por estado de cita
     * Estados: PENDIENTE, CITADO, ATENDIDO, CANCELADO, DERIVADO, etc.
     *
     * @return Lista de EstadisticasPorEstadoDTO ordenada por cantidad
     */
    List<EstadisticasPorEstadoDTO> obtenerEstadisticasPorEstado();

    List<EstadisticasPorEstadoDTO> obtenerEstadisticasPorEstadoFiltrado(String ipressAtencion);

    /** v1.78.3: KPI filtrados — mismos parámetros que el listado de solicitudes */
    List<EstadisticasPorEstadoDTO> obtenerKpiConFiltros(
            String bolsaNombre, String macrorregion, String red, String ipress,
            String especialidad, String estadoCodigo, String ipressAtencion,
            String tipoCita, String asignacion, String busqueda,
            String fechaInicio, String fechaFin, Long gestoraId, String estadoBolsa,
            String categoriaEspecialidad, String estrategia);

    /**
     * Obtiene estadísticas agrupadas por especialidad médica
     * Incluye tasas de completación y tiempo promedio
     *
     * @return Lista de EstadisticasPorEspecialidadDTO ordenada por volumen
     */
    List<EstadisticasPorEspecialidadDTO> obtenerEstadisticasPorEspecialidad();

    List<EstadisticasPorEspecialidadDTO> obtenerEstadisticasPorEspecialidadFiltrado(String ipressAtencion);

    /**
     * Obtiene estadísticas agrupadas por IPRESS (institución)
     * Incluye ranking y carga de trabajo comparativa
     *
     * @return Lista de EstadisticasPorIpressDTO ordenada por ranking
     */
    List<EstadisticasPorIpressDTO> obtenerEstadisticasPorIpress();

    /**
     * Obtiene estadísticas agrupadas por IPRESS de Atención (id_ipress_atencion)
     * Solo incluye registros que tienen IPRESS de Atención asignada
     *
     * @return Lista de EstadisticasPorIpressDTO con nombreIpress y total
     */
    List<EstadisticasPorIpressDTO> obtenerEstadisticasPorIpressAtencion();

    List<EstadisticasPorIpressDTO> obtenerEstadisticasPorIpressAtencionFiltrado(String bolsaNombre, String categoriaEspecialidad, String estadoCodigo);

    /**
     * Obtiene estadísticas agrupadas por tipo de cita
     * Tipos: PRESENCIAL, TELECONSULTA, VIDEOCONFERENCIA
     *
     * @return Lista de EstadisticasPorTipoCitaDTO ordenada por cantidad
     */
    List<EstadisticasPorTipoCitaDTO> obtenerEstadisticasPorTipoCita();

    /**
     * Obtiene estadísticas agrupadas por tipo de bolsa
     * Tipos: ORDINARIA, EXTRAORDINARIA, ESPECIAL, URGENTE, etc.
     *
     * @return Lista de EstadisticasPorTipoBolsaDTO ordenada por cantidad
     */
    List<EstadisticasPorTipoBolsaDTO> obtenerEstadisticasPorTipoBolsa();

    /**
     * Obtiene evolución temporal de solicitudes
     * Últimos 30 días con nuevas, completadas, pendientes y acumulativo
     *
     * @return Lista de EvolutionTemporalDTO ordenada por fecha desc
     */
    List<EvolutionTemporalDTO> obtenerEvolutionTemporal();

    /**
     * Obtiene KPIs detallados y alertas
     * Incluye: tasas, promedios, indicadores de salud, criticidad
     *
     * @return KpisDTO con métricas detalladas
     */
    KpisDTO obtenerKpis();

    /**
     * Obtiene estadísticas del día actual (últimas 24h)
     * Para comparaciones rápidas y alertas diarias
     *
     * @return EstadisticasGeneralesDTO específicas del día
     */
    EstadisticasGeneralesDTO obtenerEstadisticasDelDia();

    /**
     * 🆕 v3.0.0: Obtiene estadísticas consolidadas para filtros (optimización)
     * Una sola llamada en lugar de 7 separadas
     *
     * Incluye todas las estadísticas necesarias para los dropdowns de:
     * - Bolsas, Macrorregión, Redes, IPRESS, Especialidades, Tipo Cita, Estado
     *
     * @return Map con por_tipo_bolsa, por_macrorregion, por_red, por_ipress,
     *         por_especialidad, por_tipo_cita, por_estado
     */
    java.util.Map<String, Object> obtenerEstadisticasFiltros();

    /**
     * Obtiene un dashboard completo con todas las estadísticas
     * Útil para export o visualización integrada
     *
     * @return Map con todos los datos: general, estado, especialidad, ipress, etc.
     */
    java.util.Map<String, Object> obtenerDashboardCompleto();
}

package com.styp.cenate.service.security;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * 📊 Servicio de Dashboard de Seguridad
 *
 * Proporciona métricas ejecutivas y estadísticas de seguridad:
 * - Resumen de alertas activas y críticas
 * - Estadísticas de sesiones activas
 * - Top usuarios con más alertas
 * - Distribución de alertas por tipo y severidad
 * - Tendencias y gráficos temporales
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
public interface SecurityDashboardService {

    /**
     * Obtiene resumen ejecutivo de seguridad
     *
     * @return Map con métricas clave (total alertas, críticas, activas, etc.)
     */
    Map<String, Object> obtenerResumenEjecutivo();

    /**
     * Obtiene estadísticas detalladas de alertas
     *
     * @return Map con distribución por tipo, severidad, estado
     */
    Map<String, Object> obtenerEstadisticasAlertas();

    /**
     * Obtiene estadísticas de sesiones activas
     *
     * @return Map con sesiones activas, concurrentes, por dispositivo, etc.
     */
    Map<String, Object> obtenerEstadisticasSesiones();

    /**
     * Obtiene top N usuarios con más alertas
     *
     * @param limit Cantidad de usuarios a retornar
     * @return List de Maps con usuario y cantidad de alertas
     */
    List<Map<String, Object>> obtenerTopUsuariosConAlertas(int limit);

    /**
     * Obtiene distribución de alertas por hora del día
     * (para detectar patrones temporales)
     *
     * @return List de Maps con hora y cantidad de alertas
     */
    List<Map<String, Object>> obtenerDistribucionAlertasPorHora();

    /**
     * Obtiene alertas críticas activas (requieren atención inmediata)
     *
     * @param page Número de página
     * @param size Tamaño de página
     * @return Page con alertas críticas
     */
    Page<Map<String, Object>> obtenerAlertasCriticasActivas(int page, int size);

    /**
     * Obtiene tendencias de alertas (últimos 7 días)
     *
     * @return List de Maps con fecha y cantidad de alertas por día
     */
    List<Map<String, Object>> obtenerTendenciasAlertas();

    /**
     * Obtiene métricas de integridad de logs
     *
     * @return Map con total logs, con hash, manipulados, porcentaje integridad
     */
    Map<String, Object> obtenerMetricasIntegridad();

    /**
     * Obtiene reporte de actividad reciente (últimas 24 horas)
     *
     * @return Map con resumen de actividad de seguridad
     */
    Map<String, Object> obtenerActividadReciente();
}

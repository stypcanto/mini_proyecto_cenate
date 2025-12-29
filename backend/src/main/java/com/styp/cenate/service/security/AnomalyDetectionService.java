package com.styp.cenate.service.security;

import java.util.Map;

/**
 * 🔍 Servicio de Detección de Anomalías de Seguridad
 *
 * Detecta patrones sospechosos y actividad anómala en el sistema:
 * - Intentos de fuerza bruta (múltiples logins fallidos)
 * - Sesiones concurrentes desde diferentes IPs
 * - Acceso desde ubicaciones inusuales
 * - Acceso fuera de horario laboral
 * - Exportaciones masivas de datos
 * - Cambios sospechosos de permisos
 * - Actividad inusual (patrones atípicos)
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
public interface AnomalyDetectionService {

    /**
     * Detecta intentos de fuerza bruta para un usuario
     *
     * @param username Usuario a verificar
     * @return true si se detecta patrón de fuerza bruta
     */
    boolean detectarBruteForce(String username);

    /**
     * Detecta sesiones concurrentes sospechosas
     *
     * @param username Usuario a verificar
     * @param currentIp IP actual del usuario
     * @return true si hay sesiones concurrentes desde IPs diferentes
     */
    boolean detectarSesionesConcurrentesSospechosas(String username, String currentIp);

    /**
     * Detecta acceso desde ubicación inusual
     * (IP nunca vista antes para este usuario)
     *
     * @param username Usuario a verificar
     * @param ipAddress IP de acceso
     * @return true si es una IP nueva/inusual
     */
    boolean detectarUbicacionInusual(String username, String ipAddress);

    /**
     * Detecta acceso fuera de horario laboral
     * (antes de 7am, después de 7pm, o fines de semana)
     *
     * @param username Usuario a verificar
     * @return true si está fuera de horario laboral
     */
    boolean detectarAccesoFueraHorario(String username);

    /**
     * Detecta exportación masiva de datos
     * (múltiples exportaciones en corto periodo)
     *
     * @param username Usuario a verificar
     * @return true si se detecta exportación masiva
     */
    boolean detectarExportacionMasiva(String username);

    /**
     * Detecta cambios sospechosos de permisos
     * (múltiples cambios de permisos en corto periodo)
     *
     * @param username Usuario que realiza los cambios
     * @return true si se detecta patrón sospechoso
     */
    boolean detectarCambiosPermisosSospechosos(String username);

    /**
     * Detecta actividad inusual general
     * (múltiples acciones en corto periodo, patrones atípicos)
     *
     * @param username Usuario a verificar
     * @return true si se detecta actividad inusual
     */
    boolean detectarActividadInusual(String username);

    /**
     * Ejecuta análisis completo de anomalías para un usuario
     *
     * @param username Usuario a analizar
     * @return Map con resultados de todos los análisis
     */
    Map<String, Boolean> analizarUsuarioCompleto(String username);

    /**
     * Ejecuta análisis automático de anomalías en el sistema
     * (ejecutado por scheduled job)
     *
     * @return Cantidad de alertas generadas
     */
    int ejecutarAnalisisAutomatico();

    /**
     * Verifica integridad de logs de auditoría
     * (detecta logs manipulados comparando hashes)
     *
     * @return Cantidad de logs manipulados detectados
     */
    int verificarIntegridadLogs();
}

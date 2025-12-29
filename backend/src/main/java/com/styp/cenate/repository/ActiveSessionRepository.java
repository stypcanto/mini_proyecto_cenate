package com.styp.cenate.repository;

import com.styp.cenate.model.ActiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para gestión de sesiones activas
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Repository
public interface ActiveSessionRepository extends JpaRepository<ActiveSession, Long> {

    /**
     * Busca una sesión activa por su ID de sesión
     */
    Optional<ActiveSession> findBySessionId(String sessionId);

    /**
     * Encuentra todas las sesiones activas de un usuario
     */
    List<ActiveSession> findByUsernameAndIsActiveTrue(String username);

    /**
     * Encuentra todas las sesiones activas de un usuario por ID
     */
    List<ActiveSession> findByUserIdAndIsActiveTrue(Long userId);

    /**
     * Cuenta el número de sesiones activas
     */
    Long countByIsActiveTrue();

    /**
     * Cuenta sesiones activas de un usuario específico
     */
    Long countByUsernameAndIsActiveTrue(String username);

    /**
     * Encuentra todas las sesiones activas
     */
    List<ActiveSession> findByIsActiveTrueOrderByLastActivityDesc();

    /**
     * Encuentra sesiones inactivas (sin actividad por más de X minutos)
     */
    List<ActiveSession> findByIsActiveTrueAndLastActivityBefore(LocalDateTime threshold);

    /**
     * Encuentra sesiones de un usuario desde una IP específica
     */
    List<ActiveSession> findByUsernameAndIpAddressAndIsActiveTrue(String username, String ipAddress);

    /**
     * Encuentra todas las sesiones de un usuario (activas e inactivas)
     */
    List<ActiveSession> findByUsernameOrderByLoginTimeDesc(String username);

    /**
     * Cuenta usuarios únicos conectados actualmente
     */
    @Query("SELECT COUNT(DISTINCT s.username) FROM ActiveSession s WHERE s.isActive = TRUE")
    Long countDistinctActiveUsers();

    /**
     * Obtiene usuarios con sesiones concurrentes (más de una sesión activa)
     */
    @Query("""
        SELECT s.username, COUNT(s) as sessionCount
        FROM ActiveSession s
        WHERE s.isActive = TRUE
        GROUP BY s.username
        HAVING COUNT(s) > 1
        """)
    List<Object[]> findUsersWithConcurrentSessions();

    /**
     * Obtiene sesiones activas por tipo de dispositivo
     */
    @Query("""
        SELECT s.deviceType, COUNT(s)
        FROM ActiveSession s
        WHERE s.isActive = TRUE
        GROUP BY s.deviceType
        ORDER BY COUNT(s) DESC
        """)
    List<Object[]> countSessionsByDeviceType();

    /**
     * Obtiene sesiones activas por navegador
     */
    @Query("""
        SELECT s.browser, COUNT(s)
        FROM ActiveSession s
        WHERE s.isActive = TRUE
        GROUP BY s.browser
        ORDER BY COUNT(s) DESC
        """)
    List<Object[]> countSessionsByBrowser();

    /**
     * Obtiene duración promedio de sesiones cerradas en las últimas 24 horas
     */
    @Query("""
        SELECT AVG(TIMESTAMPDIFF(MINUTE, s.loginTime, s.logoutTime))
        FROM ActiveSession s
        WHERE s.isActive = FALSE
          AND s.logoutTime IS NOT NULL
          AND s.logoutTime > :since
        """)
    Double getAverageSessionDuration(@Param("since") LocalDateTime since);

    /**
     * Elimina sesiones cerradas antiguas (más de X días)
     */
    void deleteByIsActiveFalseAndLogoutTimeBefore(LocalDateTime threshold);

    /**
     * Encuentra sesiones por rango de fechas
     */
    List<ActiveSession> findByLoginTimeBetweenOrderByLoginTimeDesc(
        LocalDateTime start,
        LocalDateTime end
    );

    /**
     * Busca sesiones activas de una IP específica
     */
    List<ActiveSession> findByIpAddressAndIsActiveTrueOrderByLoginTimeDesc(String ipAddress);

    /**
     * Obtiene las últimas N sesiones de un usuario
     */
    List<ActiveSession> findTop10ByUsernameOrderByLoginTimeDesc(String username);

    /**
     * Verifica si existe una sesión activa para un usuario
     */
    Boolean existsByUsernameAndIsActiveTrue(String username);

    /**
     * Encuentra sesiones que podrían ser sospechosas (mismo usuario, diferentes IPs, activas simultáneamente)
     */
    @Query("""
        SELECT s
        FROM ActiveSession s
        WHERE s.username = :username
          AND s.isActive = TRUE
          AND s.ipAddress != :currentIp
        """)
    List<ActiveSession> findSuspiciousSessions(
        @Param("username") String username,
        @Param("currentIp") String currentIp
    );

    // ============================================================
    // MÉTODOS PARA DASHBOARD DE SEGURIDAD
    // ============================================================

    /**
     * Alias para countSessionsByDeviceType (compatibilidad con SecurityDashboardService)
     */
    @Query("""
        SELECT s.deviceType, COUNT(s)
        FROM ActiveSession s
        WHERE s.isActive = TRUE
        GROUP BY s.deviceType
        ORDER BY COUNT(s) DESC
        """)
    List<Object[]> countByDeviceType();

    /**
     * Alias para countSessionsByBrowser (compatibilidad con SecurityDashboardService)
     */
    @Query("""
        SELECT s.browser, COUNT(s)
        FROM ActiveSession s
        WHERE s.isActive = TRUE
        GROUP BY s.browser
        ORDER BY COUNT(s) DESC
        """)
    List<Object[]> countByBrowser();

    /**
     * Cuenta sesiones iniciadas en un rango de tiempo
     * Usado para: estadísticas de actividad reciente
     */
    long countByLoginTimeBetween(LocalDateTime inicio, LocalDateTime fin);
}

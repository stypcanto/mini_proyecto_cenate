package com.styp.cenate.repository;

import com.styp.cenate.model.SecurityAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 🚨 Repositorio para gestión de alertas de seguridad
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Repository
public interface SecurityAlertRepository extends JpaRepository<SecurityAlert, Long> {

    // ============================================================
    // CONSULTAS POR ESTADO
    // ============================================================

    /**
     * Obtiene todas las alertas activas (NUEVA o EN_REVISION)
     */
    @Query("SELECT a FROM SecurityAlert a WHERE a.estado IN ('NUEVA', 'EN_REVISION') ORDER BY " +
           "CASE a.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, " +
           "a.fechaDeteccion DESC")
    List<SecurityAlert> findAlertasActivas();

    /**
     * Obtiene alertas activas paginadas
     */
    @Query("SELECT a FROM SecurityAlert a WHERE a.estado IN ('NUEVA', 'EN_REVISION') ORDER BY " +
           "CASE a.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, " +
           "a.fechaDeteccion DESC")
    Page<SecurityAlert> findAlertasActivas(Pageable pageable);

    /**
     * Cuenta alertas por estado
     */
    long countByEstado(String estado);

    /**
     * Obtiene alertas críticas activas
     */
    @Query("SELECT a FROM SecurityAlert a WHERE a.severity = 'CRITICAL' AND a.estado IN ('NUEVA', 'EN_REVISION') " +
           "ORDER BY a.fechaDeteccion DESC")
    List<SecurityAlert> findAlertasCriticasActivas();

    // ============================================================
    // CONSULTAS POR TIPO
    // ============================================================

    /**
     * Busca alertas por tipo
     */
    List<SecurityAlert> findByAlertTypeOrderByFechaDeteccionDesc(String alertType);

    /**
     * Busca alertas por tipo y estado
     */
    List<SecurityAlert> findByAlertTypeAndEstadoOrderByFechaDeteccionDesc(String alertType, String estado);

    /**
     * Cuenta alertas por tipo
     */
    long countByAlertType(String alertType);

    // ============================================================
    // CONSULTAS POR USUARIO
    // ============================================================

    /**
     * Busca alertas de un usuario específico
     */
    List<SecurityAlert> findByUsuarioOrderByFechaDeteccionDesc(String usuario);

    /**
     * Busca alertas activas de un usuario
     */
    @Query("SELECT a FROM SecurityAlert a WHERE a.usuario = :usuario AND a.estado IN ('NUEVA', 'EN_REVISION') " +
           "ORDER BY a.fechaDeteccion DESC")
    List<SecurityAlert> findAlertasActivasPorUsuario(@Param("usuario") String usuario);

    /**
     * Cuenta alertas de un usuario
     */
    long countByUsuario(String usuario);

    // ============================================================
    // CONSULTAS POR RANGO DE FECHAS
    // ============================================================

    /**
     * Busca alertas en un rango de fechas
     */
    List<SecurityAlert> findByFechaDeteccionBetweenOrderByFechaDeteccionDesc(
            LocalDateTime inicio, LocalDateTime fin);

    /**
     * Cuenta alertas en las últimas N horas
     */
    @Query("SELECT COUNT(a) FROM SecurityAlert a WHERE a.fechaDeteccion >= :desde")
    long countAlertasRecientes(@Param("desde") LocalDateTime desde);

    /**
     * Alertas de hoy
     */
    @Query("SELECT a FROM SecurityAlert a WHERE CAST(a.fechaDeteccion AS date) = CURRENT_DATE " +
           "ORDER BY a.fechaDeteccion DESC")
    List<SecurityAlert> findAlertasDeHoy();

    /**
     * Alertas de la última semana
     */
    @Query("SELECT a FROM SecurityAlert a WHERE a.fechaDeteccion >= :desde ORDER BY a.fechaDeteccion DESC")
    List<SecurityAlert> findAlertasUltimaSemana(@Param("desde") LocalDateTime desde);

    // ============================================================
    // CONSULTAS POR SEVERIDAD
    // ============================================================

    /**
     * Busca alertas por severidad
     */
    List<SecurityAlert> findBySeverityOrderByFechaDeteccionDesc(String severity);

    /**
     * Cuenta alertas por severidad
     */
    long countBySeverity(String severity);

    /**
     * Alertas críticas y altas activas
     */
    @Query("SELECT a FROM SecurityAlert a WHERE a.severity IN ('CRITICAL', 'HIGH') " +
           "AND a.estado IN ('NUEVA', 'EN_REVISION') ORDER BY " +
           "CASE a.severity WHEN 'CRITICAL' THEN 1 ELSE 2 END, a.fechaDeteccion DESC")
    List<SecurityAlert> findAlertasPrioritarias();

    // ============================================================
    // BÚSQUEDA AVANZADA
    // ============================================================

    /**
     * Búsqueda avanzada con filtros opcionales
     */
    @Query("SELECT a FROM SecurityAlert a WHERE " +
           "(:alertType IS NULL OR a.alertType = :alertType) AND " +
           "(:severity IS NULL OR a.severity = :severity) AND " +
           "(:usuario IS NULL OR a.usuario LIKE %:usuario%) AND " +
           "(:estado IS NULL OR a.estado = :estado) AND " +
           "(:fechaInicio IS NULL OR a.fechaDeteccion >= :fechaInicio) AND " +
           "(:fechaFin IS NULL OR a.fechaDeteccion <= :fechaFin) " +
           "ORDER BY a.fechaDeteccion DESC")
    Page<SecurityAlert> busquedaAvanzada(
            @Param("alertType") String alertType,
            @Param("severity") String severity,
            @Param("usuario") String usuario,
            @Param("estado") String estado,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            Pageable pageable);

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================

    /**
     * Alertas agrupadas por tipo
     */
    @Query("SELECT a.alertType, COUNT(a) FROM SecurityAlert a GROUP BY a.alertType ORDER BY COUNT(a) DESC")
    List<Object[]> contarPorTipo();

    /**
     * Alertas agrupadas por severidad
     */
    @Query("SELECT a.severity, COUNT(a) FROM SecurityAlert a GROUP BY a.severity")
    List<Object[]> contarPorSeveridad();

    /**
     * Tasa de resolución (porcentaje de alertas resueltas)
     */
    @Query("SELECT " +
           "COUNT(*) FILTER (WHERE a.estado = 'RESUELTA') * 100.0 / NULLIF(COUNT(*), 0) " +
           "FROM SecurityAlert a WHERE a.fechaDeteccion >= :desde")
    Double calcularTasaResolucion(@Param("desde") LocalDateTime desde);

    /**
     * Top 10 usuarios con más alertas
     */
    @Query("SELECT a.usuario, COUNT(a) FROM SecurityAlert a WHERE a.usuario IS NOT NULL " +
           "GROUP BY a.usuario ORDER BY COUNT(a) DESC")
    List<Object[]> findTopUsuariosConAlertas(Pageable pageable);

    /**
     * Alertas por hora del día (para detectar patrones)
     */
    @Query("SELECT EXTRACT(HOUR FROM a.fechaDeteccion), COUNT(a) FROM SecurityAlert a " +
           "GROUP BY EXTRACT(HOUR FROM a.fechaDeteccion) ORDER BY EXTRACT(HOUR FROM a.fechaDeteccion)")
    List<Object[]> contarPorHoraDelDia();

    // ============================================================
    // DETECCIÓN DE PATRONES
    // ============================================================

    /**
     * Detectar múltiples alertas del mismo usuario en corto periodo
     */
    @Query("SELECT a.usuario, COUNT(a) FROM SecurityAlert a " +
           "WHERE a.fechaDeteccion >= :desde AND a.usuario IS NOT NULL " +
           "GROUP BY a.usuario HAVING COUNT(a) > :umbral ORDER BY COUNT(a) DESC")
    List<Object[]> detectarUsuariosConMultiplesAlertas(
            @Param("desde") LocalDateTime desde,
            @Param("umbral") long umbral);

    /**
     * Detectar IPs con múltiples alertas
     */
    @Query("SELECT a.ipAddress, COUNT(a) FROM SecurityAlert a " +
           "WHERE a.fechaDeteccion >= :desde AND a.ipAddress IS NOT NULL " +
           "GROUP BY a.ipAddress HAVING COUNT(a) > :umbral ORDER BY COUNT(a) DESC")
    List<Object[]> detectarIPsConMultiplesAlertas(
            @Param("desde") LocalDateTime desde,
            @Param("umbral") long umbral);

    // ============================================================
    // PREVENCIÓN DE DUPLICADOS
    // ============================================================

    /**
     * Cuenta alertas de un tipo y usuario después de una fecha
     * Usado para: evitar duplicados de alertas recientes
     */
    long countByAlertTypeAndUsuarioAndFechaDeteccionAfter(
            String alertType, String usuario, LocalDateTime fechaDeteccion);
}

package com.styp.cenate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // ============================================================
    // 🔍 BÚSQUEDAS BÁSICAS
    // ============================================================
    Page<AuditLog> findByUsuario(String usuario, Pageable pageable);
    Page<AuditLog> findByAction(String action, Pageable pageable);
    Page<AuditLog> findByModulo(String modulo, Pageable pageable);
    Page<AuditLog> findByNivel(String nivel, Pageable pageable);
    Page<AuditLog> findByEstado(String estado, Pageable pageable);

    // Faltante (para compatibilidad con AuditLogServiceImpl)
    Page<AuditLog> findByUsuarioContainingIgnoreCase(String usuario, Pageable pageable);

    // ============================================================
    // ⏱️ RANGOS DE FECHAS
    // ============================================================
    Page<AuditLog> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin, Pageable pageable);
    Page<AuditLog> findByUsuarioAndFechaHoraBetween(String usuario, LocalDateTime inicio, LocalDateTime fin, Pageable pageable);

    // ============================================================
    // 📊 ESTADÍSTICAS Y RESÚMENES
    // ============================================================
    Long countByUsuario(String usuario);
    Long countByAction(String action);
    long countByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
    long countByActionAndFechaHoraBetween(String action, LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT a.modulo, COUNT(a) FROM AuditLog a GROUP BY a.modulo")
    List<Object[]> countByModulo();

    @Query("SELECT a.usuario, COUNT(a) FROM AuditLog a " +
            "WHERE a.fechaHora >= :fechaInicio " +
            "GROUP BY a.usuario ORDER BY COUNT(a) DESC")
    List<Object[]> getActividadUsuarios(@Param("fechaInicio") LocalDateTime fechaInicio);

    // ============================================================
    // 🧾 ÚLTIMOS EVENTOS / ERRORES
    // ============================================================
    List<AuditLog> findTop10ByOrderByFechaHoraDesc();

    // ✅ Faltante para AuditLogServiceImpl
    AuditLog findTop1ByOrderByFechaHoraDesc();

    @Query("SELECT a FROM AuditLog a WHERE a.estado = 'FAILURE' ORDER BY a.fechaHora DESC")
    List<AuditLog> findRecentErrors(Pageable pageable);

    // ============================================================
    // 🔎 BÚSQUEDA AVANZADA
    // ============================================================
    @Query("SELECT a FROM AuditLog a WHERE " +
            "(:usuario IS NULL OR LOWER(a.usuario) LIKE LOWER(CONCAT('%', :usuario, '%'))) AND " +
            "(:action IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', :action, '%'))) AND " +
            "(:modulo IS NULL OR LOWER(a.modulo) LIKE LOWER(CONCAT('%', :modulo, '%'))) AND " +
            "(:nivel IS NULL OR a.nivel = :nivel) AND " +
            "(:estado IS NULL OR a.estado = :estado) AND " +
            "(:fechaInicio IS NULL OR a.fechaHora >= :fechaInicio) AND " +
            "(:fechaFin IS NULL OR a.fechaHora <= :fechaFin)")
    Page<AuditLog> busquedaAvanzada(
            @Param("usuario") String usuario,
            @Param("action") String action,
            @Param("modulo") String modulo,
            @Param("nivel") String nivel,
            @Param("estado") String estado,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            Pageable pageable
    );

    // ============================================================
    // 🚨 MÉTODOS PARA DETECCIÓN DE ANOMALÍAS
    // ============================================================

    /**
     * Cuenta logs de un usuario con una acción específica después de una fecha
     * Usado para: detección de brute force (LOGIN_FAILED)
     */
    long countByUsuarioAndActionAndFechaHoraAfter(
            String usuario, String action, LocalDateTime fechaHora);

    /**
     * Busca logs de un usuario con una acción específica después de una fecha
     */
    List<AuditLog> findByUsuarioAndActionAndFechaHoraAfter(
            String usuario, String action, LocalDateTime fechaHora);

    /**
     * Cuenta logs de un usuario con acción que contiene un texto después de una fecha
     * Usado para: detección de exportaciones masivas (action LIKE '%EXPORT%')
     */
    long countByUsuarioAndActionContainingAndFechaHoraAfter(
            String usuario, String actionContaining, LocalDateTime fechaHora);

    /**
     * Cuenta logs de un usuario con acciones específicas después de una fecha
     * Usado para: detección de cambios de permisos sospechosos
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.usuario = :usuario " +
           "AND a.action IN :actions AND a.fechaHora > :fechaHora")
    long countByUsuarioAndActionInAndFechaHoraAfter(
            @Param("usuario") String usuario,
            @Param("actions") List<String> actions,
            @Param("fechaHora") LocalDateTime fechaHora);

    /**
     * Cuenta total de acciones de un usuario después de una fecha
     * Usado para: detección de actividad inusual
     */
    long countByUsuarioAndFechaHoraAfter(String usuario, LocalDateTime fechaHora);

    /**
     * Obtiene lista de usuarios únicos con actividad después de una fecha
     * Usado para: análisis automático del sistema
     */
    @Query("SELECT DISTINCT a.usuario FROM AuditLog a WHERE a.fechaHora > :fechaHora")
    List<String> findDistinctUsuariosByFechaHoraAfter(@Param("fechaHora") LocalDateTime fechaHora);

    /**
     * Busca logs en un rango de fechas (sin paginación)
     * Usado para: verificación de integridad de logs
     */
    List<AuditLog> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);
}

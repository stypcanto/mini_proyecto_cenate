package styp.com.cenate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Buscar por usuario
    Page<AuditLog> findByUsuario(String usuario, Pageable pageable);

    // Buscar por acción
    Page<AuditLog> findByAction(String action, Pageable pageable);

    // Buscar por módulo
    Page<AuditLog> findByModulo(String modulo, Pageable pageable);

    // Buscar por nivel
    Page<AuditLog> findByNivel(String nivel, Pageable pageable);

    // Buscar por estado
    Page<AuditLog> findByEstado(String estado, Pageable pageable);

    // Buscar por rango de fechas
    Page<AuditLog> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin, Pageable pageable);

    // Buscar logs de un usuario en un rango de fechas
    Page<AuditLog> findByUsuarioAndFechaHoraBetween(
            String usuario, 
            LocalDateTime inicio, 
            LocalDateTime fin, 
            Pageable pageable
    );

    // Contar logs por usuario
    Long countByUsuario(String usuario);

    // Contar logs por acción
    Long countByAction(String action);

    // Contar por rango de fechas
    long countByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    // Contar por acción y rango de fechas
    long countByActionAndFechaHoraBetween(String action, LocalDateTime inicio, LocalDateTime fin);

    // Obtener últimos logs
    List<AuditLog> findTop10ByOrderByFechaHoraDesc();

    // Obtener logs de errores recientes
    @Query("SELECT a FROM AuditLog a WHERE a.estado = 'FAILURE' ORDER BY a.fechaHora DESC")
    List<AuditLog> findRecentErrors(Pageable pageable);

    // Estadísticas por módulo
    @Query("SELECT a.modulo, COUNT(a) FROM AuditLog a GROUP BY a.modulo")
    List<Object[]> countByModulo();

    // Actividad por usuario (últimos 30 días)
    @Query("SELECT a.usuario, COUNT(a) FROM AuditLog a " +
           "WHERE a.fechaHora >= :fechaInicio " +
           "GROUP BY a.usuario ORDER BY COUNT(a) DESC")
    List<Object[]> getActividadUsuarios(@Param("fechaInicio") LocalDateTime fechaInicio);

    // Búsqueda avanzada
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:usuario IS NULL OR a.usuario LIKE %:usuario%) AND " +
           "(:action IS NULL OR a.action LIKE %:action%) AND " +
           "(:modulo IS NULL OR a.modulo LIKE %:modulo%) AND " +
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
}

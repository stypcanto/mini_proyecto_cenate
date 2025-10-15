package styp.com.cenate.repository.mbac;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.view.AuditoriaModularView;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para consultar la vista vw_auditoria_modular_detallada.
 * Esta vista proporciona auditoría detallada de los cambios en permisos modulares.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Repository
public interface AuditoriaModularViewRepository extends JpaRepository<AuditoriaModularView, Long> {

    /**
     * Obtiene toda la auditoría modular ordenada por fecha descendente.
     */
    @Query(value = "SELECT * FROM vw_auditoria_modular_detallada ORDER BY fecha_hora DESC", 
           nativeQuery = true)
    Page<AuditoriaModularView> findAllOrderByFechaHoraDesc(Pageable pageable);

    /**
     * Obtiene auditoría por usuario.
     */
    @Query(value = "SELECT * FROM vw_auditoria_modular_detallada WHERE id_user = :userId ORDER BY fecha_hora DESC", 
           nativeQuery = true)
    Page<AuditoriaModularView> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Obtiene auditoría por nombre de usuario.
     */
    @Query(value = "SELECT * FROM vw_auditoria_modular_detallada WHERE username = :username ORDER BY fecha_hora DESC", 
           nativeQuery = true)
    Page<AuditoriaModularView> findByUsername(@Param("username") String username, Pageable pageable);

    /**
     * Obtiene auditoría por módulo.
     */
    @Query(value = "SELECT * FROM vw_auditoria_modular_detallada WHERE modulo = :modulo ORDER BY fecha_hora DESC", 
           nativeQuery = true)
    Page<AuditoriaModularView> findByModulo(@Param("modulo") String modulo, Pageable pageable);

    /**
     * Obtiene auditoría por acción.
     */
    @Query(value = "SELECT * FROM vw_auditoria_modular_detallada WHERE accion = :accion ORDER BY fecha_hora DESC", 
           nativeQuery = true)
    Page<AuditoriaModularView> findByAccion(@Param("accion") String accion, Pageable pageable);

    /**
     * Obtiene auditoría en un rango de fechas.
     */
    @Query(value = """
        SELECT * FROM vw_auditoria_modular_detallada 
        WHERE fecha_hora BETWEEN :fechaInicio AND :fechaFin 
        ORDER BY fecha_hora DESC
    """, nativeQuery = true)
    Page<AuditoriaModularView> findByFechaHoraBetween(@Param("fechaInicio") LocalDateTime fechaInicio,
                                                       @Param("fechaFin") LocalDateTime fechaFin,
                                                       Pageable pageable);

    /**
     * Obtiene auditoría por usuario y rango de fechas.
     */
    @Query(value = """
        SELECT * FROM vw_auditoria_modular_detallada 
        WHERE id_user = :userId 
        AND fecha_hora BETWEEN :fechaInicio AND :fechaFin 
        ORDER BY fecha_hora DESC
    """, nativeQuery = true)
    Page<AuditoriaModularView> findByUserIdAndFechaHoraBetween(@Param("userId") Long userId,
                                                                @Param("fechaInicio") LocalDateTime fechaInicio,
                                                                @Param("fechaFin") LocalDateTime fechaFin,
                                                                Pageable pageable);

    /**
     * Obtiene auditoría por módulo y acción.
     */
    @Query(value = """
        SELECT * FROM vw_auditoria_modular_detallada 
        WHERE modulo = :modulo AND accion = :accion 
        ORDER BY fecha_hora DESC
    """, nativeQuery = true)
    Page<AuditoriaModularView> findByModuloAndAccion(@Param("modulo") String modulo,
                                                      @Param("accion") String accion,
                                                      Pageable pageable);

    /**
     * Cuenta eventos por tipo de evento.
     */
    @Query(value = """
        SELECT tipo_evento, COUNT(*) as total 
        FROM vw_auditoria_modular_detallada 
        GROUP BY tipo_evento
    """, nativeQuery = true)
    List<Object[]> countByTipoEvento();

    /**
     * Obtiene los últimos N eventos de auditoría.
     */
    @Query(value = "SELECT * FROM vw_auditoria_modular_detallada ORDER BY fecha_hora DESC LIMIT :limit", 
           nativeQuery = true)
    List<AuditoriaModularView> findTopNOrderByFechaHoraDesc(@Param("limit") int limit);

    /**
     * Busca en la auditoría por texto en el detalle.
     */
    @Query(value = """
        SELECT * FROM vw_auditoria_modular_detallada 
        WHERE detalle ILIKE %:searchText% 
        ORDER BY fecha_hora DESC
    """, nativeQuery = true)
    Page<AuditoriaModularView> searchByDetalle(@Param("searchText") String searchText, Pageable pageable);
}

package com.styp.cenate.repository.mbac;

import com.styp.cenate.model.view.AuditoriaModularView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditoriaModularViewRepository extends JpaRepository<AuditoriaModularView, Long> {

    // =============================================================
    // 🔹 Auditoría general ordenada por fecha descendente
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> findAllOrderByFechaHoraDesc(Pageable pageable);

    // =============================================================
    // 🔹 Auditoría filtrada por ID de usuario
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a WHERE a.idUser = :userId ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // =============================================================
    // 🔹 Auditoría filtrada por username
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a WHERE a.username = :username ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> findByUsername(@Param("username") String username, Pageable pageable);

    // =============================================================
    // 🔹 Auditoría filtrada por módulo
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a WHERE a.modulo = :modulo ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> findByModulo(@Param("modulo") String modulo, Pageable pageable);

    // =============================================================
    // 🔹 Auditoría filtrada por acción
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a WHERE a.accion = :accion ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> findByAccion(@Param("accion") String accion, Pageable pageable);

    // =============================================================
    // 🔹 Auditoría filtrada por rango de fechas
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a WHERE a.fechaHora BETWEEN :fechaInicio AND :fechaFin ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> findByFechaHoraBetween(
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            Pageable pageable
    );

    // =============================================================
    // 🔹 Auditoría de un usuario en un rango de fechas
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a WHERE a.idUser = :userId AND a.fechaHora BETWEEN :fechaInicio AND :fechaFin ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> findByUserIdAndFechaHoraBetween(
            @Param("userId") Long userId,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            Pageable pageable
    );

    // =============================================================
    // 🔹 Auditoría filtrada por módulo y acción
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a WHERE a.modulo = :modulo AND a.accion = :accion ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> findByModuloAndAccion(
            @Param("modulo") String modulo,
            @Param("accion") String accion,
            Pageable pageable
    );

    // =============================================================
    // 🔹 Resumen por tipo de evento
    // =============================================================
    @Query("SELECT a.tipoEvento, COUNT(a) FROM AuditoriaModularView a GROUP BY a.tipoEvento")
    List<Object[]> countByTipoEvento();

    // =============================================================
    // 🔹 Últimos N eventos
    // =============================================================
    @Query(value = "SELECT * FROM vw_auditoria_modular_detallada ORDER BY fecha_hora DESC LIMIT :limit", nativeQuery = true)
    List<AuditoriaModularView> findTopNOrderByFechaHoraDesc(@Param("limit") int limit);

    // =============================================================
    // 🔹 Buscar texto en detalle
    // =============================================================
    @Query("SELECT a FROM AuditoriaModularView a WHERE LOWER(a.detalle) LIKE LOWER(CONCAT('%', :searchText, '%')) ORDER BY a.fechaHora DESC")
    Page<AuditoriaModularView> searchByDetalle(@Param("searchText") String searchText, Pageable pageable);
}
package com.styp.cenate.repository;

import com.styp.cenate.model.DimBolsa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 📊 Repository para gestión de Bolsas
 * v1.0.0 - Acceso a datos de dim_bolsa
 */
@Repository
public interface BolsaRepository extends JpaRepository<DimBolsa, Long> {

    /**
     * Obtiene todas las bolsas activas
     */
    List<DimBolsa> findByEstadoAndActivo(String estado, Boolean activo);

    /**
     * Obtiene bolsa por nombre
     */
    Optional<DimBolsa> findByNombreBolsaIgnoreCase(String nombreBolsa);

    /**
     * Obtiene bolsas por especialidad
     */
    List<DimBolsa> findByEspecialidadIdAndActivo(Long especialidadId, Boolean activo);

    /**
     * Obtiene bolsas por responsable
     */
    List<DimBolsa> findByResponsableIdAndActivo(Long responsableId, Boolean activo);

    /**
     * Búsqueda paginada con filtros
     */
    @Query("SELECT b FROM DimBolsa b WHERE " +
           "(:nombre IS NULL OR LOWER(b.nombreBolsa) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
           "(:estado IS NULL OR b.estado = :estado) AND " +
           "(:activo IS NULL OR b.activo = :activo) AND " +
           "b.activo = true")
    Page<DimBolsa> buscarBolsas(@Param("nombre") String nombre,
                                @Param("estado") String estado,
                                @Param("activo") Boolean activo,
                                Pageable pageable);

    /**
     * Cuenta bolsas por estado
     */
    Long countByEstadoAndActivo(String estado, Boolean activo);

    /**
     * Obtiene bolsas creadas en un rango de fechas
     */
    @Query("SELECT b FROM DimBolsa b WHERE " +
           "b.fechaCreacion BETWEEN :fechaInicio AND :fechaFin AND " +
           "b.activo = true " +
           "ORDER BY b.fechaCreacion DESC")
    List<DimBolsa> findByFechaCreacionBetween(
        @Param("fechaInicio") OffsetDateTime fechaInicio,
        @Param("fechaFin") OffsetDateTime fechaFin);

    /**
     * Obtiene bolsas por rango de porcentaje de asignación
     */
    @Query(value = "SELECT b.* FROM dim_bolsa b WHERE " +
                   "CASE WHEN b.total_pacientes > 0 " +
                   "THEN (b.pacientes_asignados::FLOAT / b.total_pacientes) * 100 >= :porcentajeMin " +
                   "ELSE FALSE " +
                   "END AND b.activo = true",
           nativeQuery = true)
    List<DimBolsa> findByPorcentajeAsignacionMin(@Param("porcentajeMin") Double porcentajeMin);

    /**
     * Obtiene todas las bolsas activas ordenadas por fecha
     */
    @Query("SELECT b FROM DimBolsa b WHERE b.estado = 'ACTIVA' AND b.activo = true ORDER BY b.fechaCreacion DESC")
    List<DimBolsa> findAllBolosasActivas();

    /**
     * Cuenta bolsas activas
     */
    Long countByActivo(Boolean activo);

    /**
     * Obtiene todas las bolsas activas ordenadas por fecha de creación
     */
    List<DimBolsa> findByActivoOrderByFechaCreacionDesc(Boolean activo);
}

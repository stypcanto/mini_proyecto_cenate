package com.styp.cenate.repository;

import com.styp.cenate.model.HistorialImportacionBolsa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * 📥 Repository para Historial de Importaciones de Bolsas
 * v1.0.0 - Auditoría de importaciones
 */
@Repository
public interface HistorialImportacionBolsaRepository extends JpaRepository<HistorialImportacionBolsa, Long> {

    /**
     * Obtiene historial de importaciones de un usuario
     */
    List<HistorialImportacionBolsa> findByUsuarioIdAndActivoOrderByFechaImportacionDesc(Long usuarioId, Boolean activo);

    /**
     * Búsqueda paginada del historial
     */
    @Query("SELECT h FROM HistorialImportacionBolsa h WHERE " +
           "(:nombreArchivo IS NULL OR LOWER(h.nombreArchivo) LIKE LOWER(CONCAT('%', :nombreArchivo, '%'))) AND " +
           "(:estado IS NULL OR h.estadoImportacion = :estado) AND " +
           "h.activo = true " +
           "ORDER BY h.fechaImportacion DESC")
    Page<HistorialImportacionBolsa> buscarHistorial(
        @Param("nombreArchivo") String nombreArchivo,
        @Param("estado") String estado,
        Pageable pageable);

    /**
     * Obtiene importaciones en un rango de fechas
     */
    @Query("SELECT h FROM HistorialImportacionBolsa h WHERE " +
           "h.fechaImportacion BETWEEN :fechaInicio AND :fechaFin AND " +
           "h.activo = true " +
           "ORDER BY h.fechaImportacion DESC")
    List<HistorialImportacionBolsa> findByFechaImportacionBetween(
        @Param("fechaInicio") OffsetDateTime fechaInicio,
        @Param("fechaFin") OffsetDateTime fechaFin);

    /**
     * Obtiene importaciones completadas
     */
    List<HistorialImportacionBolsa> findByEstadoImportacionAndActivoOrderByFechaImportacionDesc(String estado, Boolean activo);

    /**
     * Obtiene estadísticas de importaciones exitosas
     */
    @Query(value = "SELECT COUNT(*) as total, " +
                   "SUM(registros_exitosos) as total_exitosos, " +
                   "SUM(registros_fallidos) as total_fallidos, " +
                   "SUM(bolsas_importadas) as total_bolsas, " +
                   "SUM(solicitudes_importadas) as total_solicitudes " +
                   "FROM dim_historial_importacion_bolsa " +
                   "WHERE estado_importacion = 'COMPLETADA' AND activo = true",
           nativeQuery = true)
    Object obtenerEstadisticasImportaciones();

    /**
     * Obtiene importaciones por usuario
     */
    @Query("SELECT COUNT(h) FROM HistorialImportacionBolsa h WHERE " +
           "h.usuarioId = :usuarioId AND " +
           "h.activo = true")
    Long countByUsuario(@Param("usuarioId") Long usuarioId);

    /**
     * Obtiene última importación de un usuario
     */
    @Query("SELECT h FROM HistorialImportacionBolsa h WHERE " +
           "h.usuarioId = :usuarioId AND " +
           "h.activo = true " +
           "ORDER BY h.fechaImportacion DESC " +
           "LIMIT 1")
    HistorialImportacionBolsa findLastImportacionByUsuario(@Param("usuarioId") Long usuarioId);

    /**
     * Obtiene importaciones activas ordenadas por fecha
     */
    List<HistorialImportacionBolsa> findByActivoOrderByFechaImportacionDesc(Boolean activo);
}

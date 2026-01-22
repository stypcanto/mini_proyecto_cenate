package com.styp.cenate.repository;

import com.styp.cenate.model.SolicitudBolsa;
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
 * 📋 Repository para gestión de Solicitudes de Bolsas
 * v1.0.0 - Acceso a datos de dim_solicitud_bolsa
 */
@Repository
public interface SolicitudBolsaRepository extends JpaRepository<SolicitudBolsa, Long> {

    /**
     * Obtiene solicitud por número
     */
    Optional<SolicitudBolsa> findByNumeroSolicitud(String numeroSolicitud);

    /**
     * Obtiene solicitudes por bolsa
     */
    List<SolicitudBolsa> findByBolsaIdBolsaAndActivo(Long bolsaId, Boolean activo);

    /**
     * Obtiene solicitudes por paciente
     */
    List<SolicitudBolsa> findByPacienteDniAndActivo(String pacienteDni, Boolean activo);

    /**
     * Obtiene solicitudes por estado
     */
    List<SolicitudBolsa> findByEstadoAndActivo(String estado, Boolean activo);

    /**
     * Búsqueda paginada con filtros
     */
    @Query("SELECT s FROM SolicitudBolsa s WHERE " +
           "(:nombrePaciente IS NULL OR LOWER(s.pacienteNombre) LIKE LOWER(CONCAT('%', :nombrePaciente, '%'))) AND " +
           "(:dni IS NULL OR s.pacienteDni = :dni) AND " +
           "(:estado IS NULL OR s.estado = :estado) AND " +
           "(:numeroSolicitud IS NULL OR LOWER(s.numeroSolicitud) LIKE LOWER(CONCAT('%', :numeroSolicitud, '%'))) AND " +
           "(:activo IS NULL OR s.activo = :activo)")
    Page<SolicitudBolsa> buscarSolicitudes(
        @Param("nombrePaciente") String nombrePaciente,
        @Param("dni") String dni,
        @Param("estado") String estado,
        @Param("numeroSolicitud") String numeroSolicitud,
        @Param("activo") Boolean activo,
        Pageable pageable);

    /**
     * Cuenta solicitudes por estado
     */
    Long countByEstadoAndActivo(String estado, Boolean activo);

    /**
     * Obtiene solicitudes pendientes
     */
    @Query("SELECT s FROM SolicitudBolsa s WHERE s.estado = 'PENDIENTE' AND s.activo = true " +
           "ORDER BY s.fechaSolicitud ASC")
    List<SolicitudBolsa> findSolicitudesPendientes();

    /**
     * Obtiene solicitudes creadas por un usuario
     */
    List<SolicitudBolsa> findBySolicitanteIdAndActivo(Long solicitanteId, Boolean activo);

    /**
     * Obtiene solicitudes en un rango de fechas
     */
    @Query("SELECT s FROM SolicitudBolsa s WHERE " +
           "s.fechaSolicitud BETWEEN :fechaInicio AND :fechaFin AND " +
           "s.activo = true " +
           "ORDER BY s.fechaSolicitud DESC")
    List<SolicitudBolsa> findByFechaSolicitudBetween(
        @Param("fechaInicio") OffsetDateTime fechaInicio,
        @Param("fechaFin") OffsetDateTime fechaFin);

    /**
     * Obtiene solicitudes pendientes de más de X días
     */
    @Query(value = "SELECT s.* FROM dim_solicitud_bolsa s WHERE " +
                   "s.estado = 'PENDIENTE' AND " +
                   "s.activo = true AND " +
                   "EXTRACT(DAY FROM NOW() - s.fecha_solicitud) >= :dias " +
                   "ORDER BY s.fecha_solicitud ASC",
           nativeQuery = true)
    List<SolicitudBolsa> findSolicitudesPendientesAntiguasDias(@Param("dias") Integer dias);

    /**
     * Conta solicitudes aprobadas en un rango de fechas
     */
    @Query("SELECT COUNT(s) FROM SolicitudBolsa s WHERE " +
           "s.estado = 'APROBADA' AND " +
           "s.fechaAprobacion BETWEEN :fechaInicio AND :fechaFin")
    Long countAprobadas(
        @Param("fechaInicio") OffsetDateTime fechaInicio,
        @Param("fechaFin") OffsetDateTime fechaFin);

    /**
     * Cuenta solicitudes activas
     */
    Long countByActivo(Boolean activo);

    /**
     * Obtiene solicitudes por bolsa (alias para findByBolsaIdBolsaAndActivo)
     */
    default List<SolicitudBolsa> findByIdBolsaAndActivo(Long idBolsa, Boolean activo) {
        return findByBolsaIdBolsaAndActivo(idBolsa, activo);
    }

    /**
     * Obtiene solicitudes activas ordenadas por fecha
     */
    List<SolicitudBolsa> findByActivoOrderByFechaSolicitudDesc(Boolean activo);

    /**
     * Obtiene solicitudes pendientes ordenadas por fecha ascendente
     */
    List<SolicitudBolsa> findByEstadoAndActivoOrderByFechaSolicitudAsc(String estado, Boolean activo);
}

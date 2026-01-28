package com.styp.cenate.repository.disponibilidad;

import com.styp.cenate.model.SolicitudDisponibilidadMedicoDet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de SolicitudDisponibilidadMedicoDet
 */
@Repository
public interface SolicitudDisponibilidadDetRepository extends JpaRepository<SolicitudDisponibilidadMedicoDet, Long> {

    /**
     * Obtiene todos los detalles de una solicitud
     */
    @Query("SELECT d FROM SolicitudDisponibilidadMedicoDet d WHERE d.solicitud.idSolicitud = :idSolicitud ORDER BY d.fecha ASC")
    List<SolicitudDisponibilidadMedicoDet> findByIdSolicitud(@Param("idSolicitud") Long idSolicitud);

    /**
     * Obtiene detalles por solicitud y rango de fechas
     */
    @Query("SELECT d FROM SolicitudDisponibilidadMedicoDet d WHERE d.solicitud.idSolicitud = :idSolicitud AND d.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY d.fecha ASC")
    List<SolicitudDisponibilidadMedicoDet> findByIdSolicitudAndFechaBetween(
            @Param("idSolicitud") Long idSolicitud,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);

    /**
     * Obtiene detalle por solicitud y fecha
     */
    @Query("SELECT d FROM SolicitudDisponibilidadMedicoDet d WHERE d.solicitud.idSolicitud = :idSolicitud AND d.fecha = :fecha")
    Optional<SolicitudDisponibilidadMedicoDet> findByIdSolicitudAndFecha(
            @Param("idSolicitud") Long idSolicitud,
            @Param("fecha") LocalDate fecha);

    /**
     * Obtiene detalles por estado
     */
    @Query("SELECT d FROM SolicitudDisponibilidadMedicoDet d WHERE d.solicitud.idSolicitud = :idSolicitud AND d.estado = :estado ORDER BY d.fecha ASC")
    List<SolicitudDisponibilidadMedicoDet> findByIdSolicitudAndEstado(
            @Param("idSolicitud") Long idSolicitud,
            @Param("estado") String estado);

    /**
     * Obtiene detalles por turno
     */
    @Query("SELECT d FROM SolicitudDisponibilidadMedicoDet d WHERE d.solicitud.idSolicitud = :idSolicitud AND d.turno = :turno ORDER BY d.fecha ASC")
    List<SolicitudDisponibilidadMedicoDet> findByIdSolicitudAndTurno(
            @Param("idSolicitud") Long idSolicitud,
            @Param("turno") String turno);

    /**
     * Cuenta detalles por solicitud
     */
    @Query("SELECT COUNT(d) FROM SolicitudDisponibilidadMedicoDet d WHERE d.solicitud.idSolicitud = :idSolicitud")
    Long countByIdSolicitud(@Param("idSolicitud") Long idSolicitud);
}

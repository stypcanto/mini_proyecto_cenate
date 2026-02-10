package com.styp.cenate.repository.teleconsultorio;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.teleconsultorio.SolicitudTurnoIpressTeleconsultorioTurnoHora;

/**
 * Repositorio para gestionar horas de turnos de teleconsultorio
 */
@Repository
public interface SolicitudTurnoIpressTeleconsultorioTurnoHoraRepository 
    extends JpaRepository<SolicitudTurnoIpressTeleconsultorioTurnoHora, Long> {

    /**
     * Encuentra todas las horas activas para un turno
     */
    @Query("SELECT h FROM SolicitudTurnoIpressTeleconsultorioTurnoHora h " +
           "WHERE h.turno.idTurno = :idTurno AND h.activo = true " +
           "ORDER BY h.hora")
    List<SolicitudTurnoIpressTeleconsultorioTurnoHora> findByTurnoIdAndActivoTrue(@Param("idTurno") Long idTurno);

    /**
     * Encuentra una hora específica para un turno
     */
    @Query("SELECT h FROM SolicitudTurnoIpressTeleconsultorioTurnoHora h " +
           "WHERE h.turno.idTurno = :idTurno AND h.hora = :hora AND h.activo = true")
    Optional<SolicitudTurnoIpressTeleconsultorioTurnoHora> findByTurnoIdAndHoraAndActivoTrue(
        @Param("idTurno") Long idTurno, @Param("hora") LocalTime hora);

    /**
     * Encuentra todas las horas para una solicitud (a través del turno)
     */
    @Query("SELECT h FROM SolicitudTurnoIpressTeleconsultorioTurnoHora h " +
           "WHERE h.turno.solicitud.idSolicitud = :idSolicitud AND h.activo = true " +
           "ORDER BY h.turno.turno, h.hora")
    List<SolicitudTurnoIpressTeleconsultorioTurnoHora> findBySolicitudIdAndActivoTrue(@Param("idSolicitud") Long idSolicitud);

    /**
     * Cuenta las horas activas para un turno
     */
    @Query("SELECT COUNT(h) FROM SolicitudTurnoIpressTeleconsultorioTurnoHora h " +
           "WHERE h.turno.idTurno = :idTurno AND h.activo = true")
    Long countByTurnoIdAndActivoTrue(@Param("idTurno") Long idTurno);

    /**
     * Cuenta las horas totales activas para una solicitud
     */
    @Query("SELECT COUNT(h) FROM SolicitudTurnoIpressTeleconsultorioTurnoHora h " +
           "WHERE h.turno.solicitud.idSolicitud = :idSolicitud AND h.activo = true")
    Long countBySolicitudIdAndActivoTrue(@Param("idSolicitud") Long idSolicitud);

    /**
     * Elimina (marca como inactivo) todas las horas de un turno
     */
    @Modifying
    @Query("UPDATE SolicitudTurnoIpressTeleconsultorioTurnoHora h SET h.activo = false " +
           "WHERE h.turno.idTurno = :idTurno")
    void desactivarPorTurnoId(@Param("idTurno") Long idTurno);

    /**
     * Elimina (marca como inactivo) todas las horas de una solicitud
     */
    @Modifying
    @Query("UPDATE SolicitudTurnoIpressTeleconsultorioTurnoHora h SET h.activo = false " +
           "WHERE h.turno.solicitud.idSolicitud = :idSolicitud")
    void desactivarPorSolicitudId(@Param("idSolicitud") Long idSolicitud);

    /**
     * Elimina físicamente todas las horas de un turno
     */
    @Modifying
    @Query("DELETE FROM SolicitudTurnoIpressTeleconsultorioTurnoHora h " +
           "WHERE h.turno.idTurno = :idTurno")
    void deleteByTurnoId(@Param("idTurno") Long idTurno);

    /**
     * Elimina físicamente todas las horas de una solicitud
     */
    @Modifying
    @Query("DELETE FROM SolicitudTurnoIpressTeleconsultorioTurnoHora h " +
           "WHERE h.turno.solicitud.idSolicitud = :idSolicitud")
    void deleteBySolicitudId(@Param("idSolicitud") Long idSolicitud);

    /**
     * Verifica si existe una hora específica para un turno
     */
    boolean existsByTurnoIdTurnoAndHoraAndActivoTrue(Long idTurno, LocalTime hora);
}
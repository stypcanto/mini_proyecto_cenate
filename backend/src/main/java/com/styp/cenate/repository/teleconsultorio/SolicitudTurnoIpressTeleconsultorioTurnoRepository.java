package com.styp.cenate.repository.teleconsultorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.teleconsultorio.SolicitudTurnoIpressTeleconsultorioTurno;

/**
 * Repositorio para gestionar turnos de teleconsultorio
 */
@Repository
public interface SolicitudTurnoIpressTeleconsultorioTurnoRepository 
    extends JpaRepository<SolicitudTurnoIpressTeleconsultorioTurno, Long> {

    /**
     * Encuentra todos los turnos activos para una solicitud
     */
    @Query("SELECT t FROM SolicitudTurnoIpressTeleconsultorioTurno t " +
           "WHERE t.solicitud.idSolicitud = :idSolicitud AND t.activo = true " +
           "ORDER BY t.turno")
    List<SolicitudTurnoIpressTeleconsultorioTurno> findBySolicitudIdAndActivoTrue(@Param("idSolicitud") Long idSolicitud);

    /**
     * Encuentra un turno específico para una solicitud
     */
    @Query("SELECT t FROM SolicitudTurnoIpressTeleconsultorioTurno t " +
           "WHERE t.solicitud.idSolicitud = :idSolicitud AND t.turno = :turno AND t.activo = true")
    Optional<SolicitudTurnoIpressTeleconsultorioTurno> findBySolicitudIdAndTurnoAndActivoTrue(
        @Param("idSolicitud") Long idSolicitud, @Param("turno") String turno);

    /**
     * Cuenta los turnos activos para una solicitud
     */
    @Query("SELECT COUNT(t) FROM SolicitudTurnoIpressTeleconsultorioTurno t " +
           "WHERE t.solicitud.idSolicitud = :idSolicitud AND t.activo = true")
    Long countBySolicitudIdAndActivoTrue(@Param("idSolicitud") Long idSolicitud);

    /**
     * Obtiene turnos con sus horas para una solicitud
     */
    @Query("SELECT DISTINCT t FROM SolicitudTurnoIpressTeleconsultorioTurno t " +
           "LEFT JOIN FETCH t.horas h " +
           "WHERE t.solicitud.idSolicitud = :idSolicitud AND t.activo = true " +
           "AND (h IS NULL OR h.activo = true) " +
           "ORDER BY t.turno")
    List<SolicitudTurnoIpressTeleconsultorioTurno> findBySolicitudIdWithHoras(@Param("idSolicitud") Long idSolicitud);

    /**
     * Elimina (marca como inactivo) todos los turnos de una solicitud
     */
    @Modifying
    @Query("UPDATE SolicitudTurnoIpressTeleconsultorioTurno t SET t.activo = false " +
           "WHERE t.solicitud.idSolicitud = :idSolicitud")
    void desactivarPorSolicitudId(@Param("idSolicitud") Long idSolicitud);

    /**
     * Elimina físicamente todos los turnos de una solicitud
     */
    @Modifying
    @Query("DELETE FROM SolicitudTurnoIpressTeleconsultorioTurno t " +
           "WHERE t.solicitud.idSolicitud = :idSolicitud")
    void deleteBySolicitudId(@Param("idSolicitud") Long idSolicitud);

    /**
     * Verifica si existe un turno específico para una solicitud
     */
    boolean existsBySolicitudIdSolicitudAndTurnoAndActivoTrue(Long idSolicitud, String turno);
}
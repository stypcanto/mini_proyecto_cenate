package com.styp.cenate.repository.teleconsultorio;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.teleconsultorio.SolicitudTurnoIpressTeleconsultorioDia;

/**
 * Repositorio para gestionar días de teleconsultorio
 */
@Repository
public interface SolicitudTurnoIpressTeleconsultorioDiaRepository 
    extends JpaRepository<SolicitudTurnoIpressTeleconsultorioDia, Long> {

    /**
     * Encuentra todos los días activos para una solicitud
     */
    @Query("SELECT d FROM SolicitudTurnoIpressTeleconsultorioDia d " +
           "WHERE d.solicitud.idSolicitud = :idSolicitud AND d.activo = true " +
           "ORDER BY d.diaSemana")
    List<SolicitudTurnoIpressTeleconsultorioDia> findBySolicitudIdAndActivoTrue(@Param("idSolicitud") Long idSolicitud);

    /**
     * Encuentra un día específico para una solicitud
     */
    @Query("SELECT d FROM SolicitudTurnoIpressTeleconsultorioDia d " +
           "WHERE d.solicitud.idSolicitud = :idSolicitud AND d.diaSemana = :diaSemana AND d.activo = true")
    Optional<SolicitudTurnoIpressTeleconsultorioDia> findBySolicitudIdAndDiaSemanaAndActivoTrue(
        @Param("idSolicitud") Long idSolicitud, @Param("diaSemana") Integer diaSemana);

    /**
     * Cuenta los días activos para una solicitud
     */
    @Query("SELECT COUNT(d) FROM SolicitudTurnoIpressTeleconsultorioDia d " +
           "WHERE d.solicitud.idSolicitud = :idSolicitud AND d.activo = true")
    Long countBySolicitudIdAndActivoTrue(@Param("idSolicitud") Long idSolicitud);

    /**
     * Elimina (marca como inactivo) todos los días de una solicitud
     */
    @Modifying
    @Query("UPDATE SolicitudTurnoIpressTeleconsultorioDia d SET d.activo = false " +
           "WHERE d.solicitud.idSolicitud = :idSolicitud")
    void desactivarPorSolicitudId(@Param("idSolicitud") Long idSolicitud);

    /**
     * Elimina físicamente todos los días de una solicitud
     */
    @Modifying
    @Query("DELETE FROM SolicitudTurnoIpressTeleconsultorioDia d " +
           "WHERE d.solicitud.idSolicitud = :idSolicitud")
    void deleteBySolicitudId(@Param("idSolicitud") Long idSolicitud);

    /**
     * Verifica si existe un día específico para una solicitud
     */
    boolean existsBySolicitudIdSolicitudAndDiaSemanaAndActivoTrue(Long idSolicitud, Integer diaSemana);
}
package com.styp.cenate.repository;

import com.styp.cenate.model.DetalleSolicitudTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para gestionar detalles de solicitudes de turnos.
 */
@Repository
public interface DetalleSolicitudTurnoRepository extends JpaRepository<DetalleSolicitudTurno, Long> {

    /**
     * Busca detalles por solicitud (usar findBySolicitudWithEspecialidad para ordenar por nombre)
     */
    List<DetalleSolicitudTurno> findBySolicitudIdSolicitud(Long idSolicitud);

    /**
     * Busca detalles por especialidad
     */
    List<DetalleSolicitudTurno> findByEspecialidadIdServicio(Long idServicio);

    /**
     * Elimina detalles de una solicitud
     */
    void deleteBySolicitudIdSolicitud(Long idSolicitud);

    /**
     * Suma total de turnos solicitados por especialidad en un periodo
     */
    @Query("SELECT d.especialidad.idServicio, d.especialidad.descServicio, SUM(d.turnosSolicitados) " +
           "FROM DetalleSolicitudTurno d " +
           "WHERE d.solicitud.periodo.idPeriodo = :idPeriodo " +
           "AND d.solicitud.estado IN ('ENVIADO', 'REVISADO') " +
           "GROUP BY d.especialidad.idServicio, d.especialidad.descServicio " +
           "ORDER BY SUM(d.turnosSolicitados) DESC")
    List<Object[]> sumTurnosByEspecialidadAndPeriodo(@Param("idPeriodo") Long idPeriodo);

    /**
     * Suma total de turnos solicitados por Red en un periodo
     */
    @Query("SELECT d.solicitud.personal.ipress.red.id, d.solicitud.personal.ipress.red.descripcion, SUM(d.turnosSolicitados) " +
           "FROM DetalleSolicitudTurno d " +
           "WHERE d.solicitud.periodo.idPeriodo = :idPeriodo " +
           "AND d.solicitud.estado IN ('ENVIADO', 'REVISADO') " +
           "GROUP BY d.solicitud.personal.ipress.red.id, d.solicitud.personal.ipress.red.descripcion " +
           "ORDER BY SUM(d.turnosSolicitados) DESC")
    List<Object[]> sumTurnosByRedAndPeriodo(@Param("idPeriodo") Long idPeriodo);

    /**
     * Suma total de turnos solicitados por IPRESS en un periodo
     */
    @Query("SELECT d.solicitud.personal.ipress.idIpress, d.solicitud.personal.ipress.descIpress, SUM(d.turnosSolicitados) " +
           "FROM DetalleSolicitudTurno d " +
           "WHERE d.solicitud.periodo.idPeriodo = :idPeriodo " +
           "AND d.solicitud.estado IN ('ENVIADO', 'REVISADO') " +
           "GROUP BY d.solicitud.personal.ipress.idIpress, d.solicitud.personal.ipress.descIpress " +
           "ORDER BY SUM(d.turnosSolicitados) DESC")
    List<Object[]> sumTurnosByIpressAndPeriodo(@Param("idPeriodo") Long idPeriodo);

    /**
     * Total de turnos solicitados en un periodo
     */
    @Query("SELECT COALESCE(SUM(d.turnosSolicitados), 0) " +
           "FROM DetalleSolicitudTurno d " +
           "WHERE d.solicitud.periodo.idPeriodo = :idPeriodo " +
           "AND d.solicitud.estado IN ('ENVIADO', 'REVISADO')")
    long sumTotalTurnosByPeriodo(@Param("idPeriodo") Long idPeriodo);

    /**
     * Cuenta especialidades distintas solicitadas en un periodo
     */
    @Query("SELECT COUNT(DISTINCT d.especialidad.idServicio) " +
           "FROM DetalleSolicitudTurno d " +
           "WHERE d.solicitud.periodo.idPeriodo = :idPeriodo " +
           "AND d.solicitud.estado IN ('ENVIADO', 'REVISADO') " +
           "AND d.turnosSolicitados > 0")
    long countEspecialidadesDistintasByPeriodo(@Param("idPeriodo") Long idPeriodo);

    /**
     * Obtiene detalles con especialidad cargada
     */
    @Query("SELECT d FROM DetalleSolicitudTurno d " +
           "JOIN FETCH d.especialidad " +
           "WHERE d.solicitud.idSolicitud = :idSolicitud " +
           "ORDER BY d.especialidad.descServicio")
    List<DetalleSolicitudTurno> findBySolicitudWithEspecialidad(@Param("idSolicitud") Long idSolicitud);
}

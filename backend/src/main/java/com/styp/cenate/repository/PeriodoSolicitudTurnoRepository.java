package com.styp.cenate.repository;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.PeriodoSolicitudTurno;

/**
 * Repository para gestionar periodos de solicitud de turnos.
 */
@Repository
public interface PeriodoSolicitudTurnoRepository extends JpaRepository<PeriodoSolicitudTurno, Long> {

    /**
     * Busca periodos por estado
     */
    List<PeriodoSolicitudTurno> findByEstadoOrderByPeriodoDesc(String estado);

    /**
     * Busca periodos activos
     */
    default List<PeriodoSolicitudTurno> findActivos() {
        return findByEstadoOrderByPeriodoDesc("ACTIVO");
    }

    /**
     * Busca un periodo por codigo de periodo (YYYYMM)
     */
    Optional<PeriodoSolicitudTurno> findByPeriodo(String periodo);

    /**
     * Verifica si existe un periodo con el mismo codigo
     */
    boolean existsByPeriodo(String periodo);

    /**
     * Busca periodos vigentes (activos y dentro del rango de fechas)
     */
    @Query("SELECT p FROM PeriodoSolicitudTurno p " +
           "WHERE p.estado = 'ACTIVO' " +
           "AND p.fechaInicio <= :ahora " +
           "AND p.fechaFin >= :ahora " +
           "ORDER BY p.periodo DESC")
    List<PeriodoSolicitudTurno> findVigentes(@Param("ahora") LocalDateTime  ahora);

    /**
     * Busca periodos vigentes (usando fecha actual)
     */
    default List<PeriodoSolicitudTurno> findVigentes() {
        return findVigentes(LocalDateTime.now());
    }

    /**
     * Lista todos los periodos ordenados por periodo descendente
     */
    List<PeriodoSolicitudTurno> findAllByOrderByPeriodoDesc();

    /**
     * Cuenta solicitudes por periodo
     */
    @Query("SELECT COUNT(s) FROM SolicitudTurnoIpress s WHERE s.periodo.idPeriodo = :idPeriodo")
    long countSolicitudesByPeriodo(@Param("idPeriodo") Long idPeriodo);

    /**
     * Cuenta solicitudes enviadas por periodo
     */
    @Query("SELECT COUNT(s) FROM SolicitudTurnoIpress s " +
           "WHERE s.periodo.idPeriodo = :idPeriodo AND s.estado = 'ENVIADO'")
    long countSolicitudesEnviadasByPeriodo(@Param("idPeriodo") Long idPeriodo);
}

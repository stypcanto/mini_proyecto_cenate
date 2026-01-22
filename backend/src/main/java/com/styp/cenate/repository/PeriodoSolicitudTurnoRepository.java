package com.styp.cenate.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoResumenView;
import com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoRow;
import com.styp.cenate.model.PeriodoSolicitudTurno;

/**
 * Repository para gestionar periodos de solicitud de turnos.
 */
@Repository
public interface PeriodoSolicitudTurnoRepository
		extends JpaRepository<PeriodoSolicitudTurno, Long>, JpaSpecificationExecutor<PeriodoSolicitudTurno> {

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
	@Query("SELECT p FROM PeriodoSolicitudTurno p " + "WHERE p.estado = 'ACTIVO' " + "AND p.fechaInicio <= :ahora "
			+ "AND p.fechaFin >= :ahora " + "ORDER BY p.periodo DESC")
	List<PeriodoSolicitudTurno> findVigentes(@Param("ahora") LocalDateTime ahora);

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
	@Query("SELECT COUNT(s) FROM SolicitudTurnoIpress s "
			+ "WHERE s.periodo.idPeriodo = :idPeriodo AND s.estado = 'ENVIADO'")
	long countSolicitudesEnviadasByPeriodo(@Param("idPeriodo") Long idPeriodo);

	@Query("""
			    SELECT DISTINCT EXTRACT(YEAR FROM p.fechaInicio)
			    FROM PeriodoSolicitudTurno p
			    ORDER BY EXTRACT(YEAR FROM p.fechaInicio) DESC
			""")
	List<Integer> listarAniosDisponibles();

	@Query("""
			    SELECT new com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoRow(
			        p.idPeriodo,
			        p.periodo,
			        p.descripcion,
			        p.fechaInicio,
			        p.fechaFin,
			        p.estado,
			        p.createdAt,
			        p.updatedAt,
			        COUNT(s.idSolicitud)
			    )
			    FROM PeriodoSolicitudTurno p
			    LEFT JOIN p.solicitudes s
			    WHERE (:estado IS NULL OR :estado = '' OR :estado = 'TODOS' OR UPPER(p.estado) = UPPER(:estado))
			      AND (:anio IS NULL OR FUNCTION('date_part','year', p.fechaInicio) = :anio)
			    GROUP BY p.idPeriodo, p.periodo, p.descripcion, p.fechaInicio, p.fechaFin, p.estado, p.createdAt, p.updatedAt
			""")
	Page<PeriodoSolicitudTurnoRow> listarConConteoSolicitudes(@Param("estado") String estado,
			@Param("anio") Integer anio, Pageable pageable);
	
	
	@Query("""
		    SELECT
		        p.idPeriodo AS idPeriodo,
		        p.periodo AS periodo,
		        p.descripcion AS descripcion,
		        p.fechaInicio AS fechaInicio,
		        p.fechaFin AS fechaFin,
		        p.estado AS estado,
		        p.createdAt AS createdAt,
		        p.updatedAt AS updatedAt,

		        COUNT(s.idSolicitud) AS totalSolicitudes,

		        SUM(CASE WHEN UPPER(s.estado) = 'ENVIADO' THEN 1 ELSE 0 END) AS solicitudesEnviadas,
		        SUM(CASE WHEN UPPER(s.estado) = 'INICIADO' THEN 1 ELSE 0 END) AS solicitudesIniciadas

		    FROM PeriodoSolicitudTurno p
		    LEFT JOIN p.solicitudes s
		    WHERE (:estado IS NULL OR :estado = '' OR :estado = 'TODOS' OR UPPER(p.estado) = UPPER(:estado))
		      AND (:anio IS NULL OR FUNCTION('date_part','year', p.fechaInicio) = :anio)
		    GROUP BY p.idPeriodo, p.periodo, p.descripcion, p.fechaInicio, p.fechaFin, p.estado, p.createdAt, p.updatedAt
		""")
		Page<PeriodoSolicitudTurnoResumenView> listarConResumen(
		        @Param("estado") String estado,
		        @Param("anio") Integer anio,
		        Pageable pageable
		);

	
	
	
	

}

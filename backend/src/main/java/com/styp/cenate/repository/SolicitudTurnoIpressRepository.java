package com.styp.cenate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.dto.solicitudturno.SolicitudTurnoIpressListadoRow;
import com.styp.cenate.model.DetalleSolicitudTurno;
import com.styp.cenate.model.SolicitudTurnoIpress;

/**
 * Repository para gestionar solicitudes de turnos de IPRESS.
 */
@Repository
public interface SolicitudTurnoIpressRepository extends JpaRepository<SolicitudTurnoIpress, Long> {

    /**
     * Busca solicitudes por periodo
     */
    List<SolicitudTurnoIpress> findByPeriodoIdPeriodoOrderByCreatedAtDesc(Long idPeriodo);

    /**
     * Busca solicitudes por usuario (personal)
     */
    List<SolicitudTurnoIpress> findByPersonalIdPersOrderByCreatedAtDesc(Long idPers);

    /**
     * Busca una solicitud especifica por periodo y usuario
     */
    Optional<SolicitudTurnoIpress> findByPeriodoIdPeriodoAndPersonalIdPers(Long idPeriodo, Long idPers);

    /**
     * Verifica si existe una solicitud para un periodo y usuario
     */
    boolean existsByPeriodoIdPeriodoAndPersonalIdPers(Long idPeriodo, Long idPers);

    /**
     * Busca solicitudes por estado
     */
    List<SolicitudTurnoIpress> findByEstadoOrderByCreatedAtDesc(String estado);

    /**
     * Busca solicitudes por IPRESS (a traves de personal)
     */
    @Query("SELECT s FROM SolicitudTurnoIpress s " +
           "WHERE s.personal.ipress.idIpress = :idIpress " +
           "ORDER BY s.createdAt DESC")
    List<SolicitudTurnoIpress> findByIpress(@Param("idIpress") Long idIpress);

    /**
     * Busca solicitudes por Red (a traves de personal > ipress > red)
     */
    @Query("SELECT s FROM SolicitudTurnoIpress s " +
           "WHERE s.personal.ipress.red.id = :idRed " +
           "ORDER BY s.createdAt DESC")
    List<SolicitudTurnoIpress> findByRed(@Param("idRed") Long idRed);

    /**
     * Busca solicitudes por periodo y Red
     */
    @Query("SELECT s FROM SolicitudTurnoIpress s " +
           "WHERE s.periodo.idPeriodo = :idPeriodo " +
           "AND s.personal.ipress.red.id = :idRed " +
           "ORDER BY s.personal.ipress.descIpress")
    List<SolicitudTurnoIpress> findByPeriodoAndRed(
            @Param("idPeriodo") Long idPeriodo,
            @Param("idRed") Long idRed);

    /**
     * Busca solicitudes por periodo y IPRESS
     */
    @Query("SELECT s FROM SolicitudTurnoIpress s " +
           "WHERE s.periodo.idPeriodo = :idPeriodo " +
           "AND s.personal.ipress.idIpress = :idIpress")
    Optional<SolicitudTurnoIpress> findByPeriodoAndIpress(
            @Param("idPeriodo") Long idPeriodo,
            @Param("idIpress") Long idIpress);

    /**
     * Cuenta solicitudes enviadas por periodo
     */
    @Query("SELECT COUNT(s) FROM SolicitudTurnoIpress s " +
           "WHERE s.periodo.idPeriodo = :idPeriodo AND s.estado = 'ENVIADO'")
    long countEnviadasByPeriodo(@Param("idPeriodo") Long idPeriodo);

    /**
     * Cuenta IPRESS distintas que han respondido en un periodo
     */
    @Query("SELECT COUNT(DISTINCT s.personal.ipress.idIpress) FROM SolicitudTurnoIpress s " +
           "WHERE s.periodo.idPeriodo = :idPeriodo AND s.estado IN ('ENVIADO', 'REVISADO')")
    long countIpressDistintasByPeriodo(@Param("idPeriodo") Long idPeriodo);

    /**
     * Obtiene solicitud con detalles cargados
     */
    @Query("SELECT DISTINCT s FROM SolicitudTurnoIpress s " +
           "LEFT JOIN FETCH s.detalles d " +
           "LEFT JOIN FETCH d.especialidad " +
           "WHERE s.idSolicitud = :id")
    Optional<SolicitudTurnoIpress> findByIdWithDetalles(@Param("id") Long id);

    /**
     * Obtiene solicitudes de un periodo con datos de IPRESS y Red
     */
    @Query("SELECT DISTINCT s FROM SolicitudTurnoIpress s " +
           "LEFT JOIN FETCH s.personal p " +
           "LEFT JOIN FETCH p.ipress i " +
           "LEFT JOIN FETCH i.red " +
           "WHERE s.periodo.idPeriodo = :idPeriodo " +
           "ORDER BY s.createdAt DESC")
    List<SolicitudTurnoIpress> findByPeriodoWithIpress(@Param("idPeriodo") Long idPeriodo);
    
    
    
    
    @Query("""
    		SELECT new com.styp.cenate.dto.solicitudturno.SolicitudTurnoIpressListadoRow(
    		    s.idSolicitud,
    		    p.idPeriodo,
    		    s.estado,
    		    s.fechaEnvio,
    		    s.createdAt,
    		    s.updatedAt,
    		    i.descIpress
    		)
    		FROM SolicitudTurnoIpress s
    		JOIN s.periodo p
    		JOIN s.personal per
    		JOIN per.ipress i
    		WHERE (:estado IS NULL OR :estado = '' OR s.estado = :estado)
    		  AND (:idPeriodo IS NULL OR p.idPeriodo = :idPeriodo)
    		ORDER BY s.createdAt DESC
    		""")
        List<SolicitudTurnoIpressListadoRow> listarResumen(
                @Param("idPeriodo") Long idPeriodo,
                @Param("estado") String estado
        );
    
    @Query("""
    	    SELECT new com.styp.cenate.dto.solicitudturno.SolicitudTurnoIpressListadoRow(
    	        s.idSolicitud,
    	        p.idPeriodo,
    	        s.estado,
    	        s.fechaEnvio,
    	        s.createdAt,
    	        s.updatedAt,
    	        i.descIpress
    	    )
    	    FROM SolicitudTurnoIpress s
    	    JOIN s.periodo p
    	    JOIN s.personal per
    	    JOIN per.ipress i
    	    JOIN i.red r
    	    JOIN r.macroregion m
    	    WHERE (:estado IS NULL OR :estado = '' OR UPPER(s.estado) = UPPER(:estado))
    	      AND (:idPeriodo IS NULL OR p.idPeriodo = :idPeriodo)
    	      AND (:ipressId IS NULL OR i.idIpress = :ipressId)
    	      AND (:redId IS NULL OR r.id = :redId)
    	      AND (:macroId IS NULL OR m.idMacro = :macroId)
    	    ORDER BY s.createdAt DESC
    	""")
    	List<SolicitudTurnoIpressListadoRow> listarResumen(
    	        @Param("idPeriodo") Long idPeriodo,
    	        @Param("estado") String estado,
    	        @Param("macroId") Long macroId,
    	        @Param("redId") Long redId,
    	        @Param("ipressId") Long ipressId
    	);
    
    
    
    

    
    @Query("""
    		  SELECT DISTINCT s
    		  FROM SolicitudTurnoIpress s
    		  LEFT JOIN FETCH s.periodo p
    		  LEFT JOIN FETCH s.personal per
    		  LEFT JOIN FETCH per.ipress i
    		  LEFT JOIN FETCH per.usuario u
    		  LEFT JOIN FETCH s.detalles d
    		  LEFT JOIN FETCH d.especialidad esp
    		  WHERE s.idSolicitud = :id
    		""")
    		Optional<SolicitudTurnoIpress> findByIdFull(@Param("id") Long id);
    		
    @Query("""
    		  SELECT DISTINCT d
    		  FROM DetalleSolicitudTurno d
    		  LEFT JOIN FETCH d.fechasDetalle fd
    		  WHERE d.solicitud.idSolicitud = :idSolicitud
    		""")
    		List<DetalleSolicitudTurno> findDetallesWithFechasBySolicitudId(@Param("idSolicitud") Long idSolicitud);
    
    
    
    boolean existsByPeriodo_IdPeriodo(Long idPeriodo);

    long countByPeriodo_IdPeriodo(Long idPeriodo);
    
    
    
    
}

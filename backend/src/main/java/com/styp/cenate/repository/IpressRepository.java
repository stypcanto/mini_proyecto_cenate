package com.styp.cenate.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.dto.filtros.IpressOptionDTO;
import com.styp.cenate.model.Ipress;

@Repository
public interface IpressRepository extends JpaRepository<Ipress, Long> {

	/**
	 * Buscar IPRESS por código
	 */
	Optional<Ipress> findByCodIpress(String codIpress);

	/**
	 * Buscar IPRESS activas
	 */
	List<Ipress> findByStatIpress(String estado);

	/**
	 * Buscar IPRESS por nombre (búsqueda parcial)
	 */
	List<Ipress> findByDescIpressContainingIgnoreCase(String nombre);

	/**
	 * Verificar si existe IPRESS con ese código
	 */
	boolean existsByCodIpress(String codIpress);

	/**
	 * Buscar IPRESS activas ordenadas por descripción
	 */
	@Query("SELECT i FROM Ipress i WHERE i.statIpress = :estado ORDER BY i.descIpress ASC")
	List<Ipress> findByStatIpressOrderByDescIpressAsc(@Param("estado") String estado);

	/**
	 * Buscar IPRESS por distrito
	 */
	@Query("SELECT i FROM Ipress i WHERE i.idDist = :idDistrito AND i.statIpress = :estado ORDER BY i.descIpress ASC")
	List<Ipress> findByIdDistAndStatIpressOrderByDescIpressAsc(@Param("idDistrito") Long idDistrito,
			@Param("estado") String estado);

	/**
	 * Buscar IPRESS por RED y estado
	 */
	List<Ipress> findByRed_IdAndStatIpress(Long idRed, String estado);

	/**
	 * Contar IPRESS por Red
	 */
	Long countByRed_Id(Long idRed);

	@Query("""
			    SELECT new com.styp.cenate.dto.filtros.IpressOptionDTO(
			        i.idIpress,
			        i.codIpress,
			        i.descIpress,
			        i.red.id
			    )
			    FROM Ipress i
			    WHERE i.red.id = :redId
			    ORDER BY i.descIpress
			""")
	List<IpressOptionDTO> listarPorRed(@Param("redId") Long redId);

	@Query(value = """
		    WITH ip AS (
		      SELECT di.id_ipress
		      FROM public.dim_ipress di
		      WHERE di.cod_ipress = :codIpress
		      LIMIT 1
		    ),
		    cfg AS (
		      SELECT c.id_cfg_ipress
		      FROM public.cfg_ipress_servicios c
		      JOIN ip ON ip.id_ipress = c.id_ipress
		      WHERE c.estado = 'A'
		      LIMIT 1
		    )
		    SELECT
		      s.id_servicio,
		      s.desc_servicio,
		      COALESCE(d.teleconsulta, FALSE)    AS teleconsulta,
		      COALESCE(d.teleconsultorio, FALSE) AS teleconsultorio
		    FROM public.dim_servicio_essi s
		    LEFT JOIN cfg ON TRUE
		    LEFT JOIN public.cfg_ipress_servicio_det d
		      ON d.id_servicio   = s.id_servicio
		     AND d.id_cfg_ipress = cfg.id_cfg_ipress
		     AND d.estado = 'A'
		    WHERE s.estado = 'A'
		      AND s.es_cenate = TRUE
		    ORDER BY s.desc_servicio
		""", nativeQuery = true)
	List<Object[]> listarServiciosActivosConConfig(@Param("codIpress") String codIpress);

}

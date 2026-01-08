package com.styp.cenate.repository.horario;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.styp.cenate.dto.horario.RendimientoHorarioListadoRow;
import com.styp.cenate.model.horario.RendimientoHorario;

public interface RendimientoHorarioRepo extends JpaRepository<RendimientoHorario, Long> {
	
	

	
	/*
	Documentacion : countQuery
	Cuando devuelves Page<>, Spring necesita: 
	- La lista (page actual)
	- El total de filas que cumplen los filtros (para totalPages)
	Como tiene activado sql nativo, Spring no puede deducir el count. Por eso se le pasa:
	value → trae los registros
	countQuery → cuenta cuantos existen
	 */
	@Query(
			  value = """
			    select r.*
			    from rendimiento_horario r
			    where
			      (
			        :q is null
			        or r.id_rendimiento::text    ilike '%' || CAST(:q AS text) || '%'
			        or r.id_area_hosp::text      ilike '%' || CAST(:q AS text) || '%'
			        or r.id_servicio::text       ilike '%' || CAST(:q AS text) || '%'
			        or r.id_actividad::text      ilike '%' || CAST(:q AS text) || '%'
			        or r.id_subactividad::text   ilike '%' || CAST(:q AS text) || '%'
			      )
			      and (:idAreaHosp is null or r.id_area_hosp = :idAreaHosp)
			      and (:idServicio is null or r.id_servicio = :idServicio)
			      and (:idActividad is null or r.id_actividad = :idActividad)
			      and (:estado is null or r.estado = :estado)
			      and (:pacMin is null or r.pacientes_por_hora >= :pacMin)
			      and (:pacMax is null or r.pacientes_por_hora <= :pacMax)
			    """,
			  countQuery = """
			    select count(1)
			    from rendimiento_horario r
			    where
			      (
			        :q is null
			        or r.id_rendimiento::text    ilike '%' || CAST(:q AS text) || '%'
			        or r.id_area_hosp::text      ilike '%' || CAST(:q AS text) || '%'
			        or r.id_servicio::text       ilike '%' || CAST(:q AS text) || '%'
			        or r.id_actividad::text      ilike '%' || CAST(:q AS text) || '%'
			        or r.id_subactividad::text   ilike '%' || CAST(:q AS text) || '%'
			      )
			      and (:idAreaHosp is null or r.id_area_hosp = :idAreaHosp)
			      and (:idServicio is null or r.id_servicio = :idServicio)
			      and (:idActividad is null or r.id_actividad = :idActividad)
			      and (:estado is null or r.estado = :estado)
			      and (:pacMin is null or r.pacientes_por_hora >= :pacMin)
			      and (:pacMax is null or r.pacientes_por_hora <= :pacMax)
			    """,
			  nativeQuery = true
			)
			Page<RendimientoHorario> buscar(
			    @Param("q") String q,
			    @Param("idAreaHosp") Long idAreaHosp,
			    @Param("idServicio") Long idServicio,
			    @Param("idActividad") Long idActividad,
			    @Param("estado") String estado,
			    @Param("pacMin") Integer pacMin,
			    @Param("pacMax") Integer pacMax,
			    Pageable pageable
			);

	
//	CONSTRAINT rendimiento_horario_id_actividad_fkey FOREIGN KEY (id_actividad) REFERENCES public.dim_actividad_essi(id_actividad),
//  Entidad: 	ActividadEssi
//	CONSTRAINT rendimiento_horario_id_area_hosp_fkey FOREIGN KEY (id_area_hosp) REFERENCES public.dim_area_hosp(id_area_hosp),
//  Entidad: 	AreaHospitalaria
//	CONSTRAINT rendimiento_horario_id_servicio_fkey FOREIGN KEY (id_servicio) REFERENCES public.dim_servicio_essi(id_servicio),
//  Entidad: 	DimServicioEssi	
//	CONSTRAINT rendimiento_horario_id_subactividad_fkey FOREIGN KEY (id_subactividad) REFERENCES public.dim_subactividad_essi(id_subactividad)
//  Entidad: 	SubactividadEssi
	
	
	@Query("""
	        select new com.styp.cenate.dto.horario.RendimientoHorarioListadoRow(
	            rh.idRendimiento,
	            rh.idAreaHosp, ah.descripcion,
	            rh.idServicio, se.descServicio,
	            rh.idActividad, ac.descActividad,
	            rh.idSubactividad, sa.descSubactividad,
	            rh.pacientesPorHora,
	            rh.adicional,
	            rh.estado,
	            rh.fechaRegistro
	        )
	        from RendimientoHorario rh
	        join AreaHospitalaria ah on ah.id = rh.idAreaHosp
	        join DimServicioEssi se on se.idServicio = rh.idServicio
	        join ActividadEssi ac on ac.idActividad = rh.idActividad
	        join SubactividadEssi sa on sa.idSubactividad = rh.idSubactividad
	        where
	            (:idAreaHosp is null or rh.idAreaHosp = :idAreaHosp)
	        and (:idServicio is null or rh.idServicio = :idServicio)
	        and (:idActividad is null or rh.idActividad = :idActividad)
	        and (:estado is null or rh.estado = :estado)
	        and (:pacMin is null or rh.pacientesPorHora >= :pacMin)
	        and (:pacMax is null or rh.pacientesPorHora <= :pacMax)
	        and (
	              :q = ''
	           or cast(rh.idRendimiento as string) like concat('%', :q, '%')
	           or cast(rh.idAreaHosp as string) like concat('%', :q, '%')
	           or cast(rh.idServicio as string) like concat('%', :q, '%')
	           or cast(rh.idActividad as string) like concat('%', :q, '%')
	           or cast(rh.idSubactividad as string) like concat('%', :q, '%')
	           or lower(ah.descripcion) like concat('%', lower(:q), '%')
	           or lower(se.descServicio) like concat('%', lower(:q), '%')
	           or lower(ac.descActividad) like concat('%', lower(:q), '%')
	           or lower(sa.descSubactividad) like concat('%', lower(:q), '%')
	        )
	        """)
	    Page<RendimientoHorarioListadoRow> buscarConDescripciones(
	            @Param("q") String q,
	            @Param("idAreaHosp") Long idAreaHosp,
	            @Param("idServicio") Long idServicio,
	            @Param("idActividad") Long idActividad,
	            @Param("estado") String estado,
	            @Param("pacMin") Integer pacMin,
	            @Param("pacMax") Integer pacMax,
	            Pageable pageable
	    );
  
	
	
}

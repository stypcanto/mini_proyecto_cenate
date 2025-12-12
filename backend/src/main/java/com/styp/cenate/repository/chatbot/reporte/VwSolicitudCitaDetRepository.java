package com.styp.cenate.repository.chatbot.reporte;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.styp.cenate.dto.chatbot.reporte.LabelTotalProjection;
import com.styp.cenate.model.chatbot.VwSolicitudCitaDet;

public interface VwSolicitudCitaDetRepository extends JpaRepository<VwSolicitudCitaDet, Integer> {

    // KPIs
    @Query(value = """
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE v.fecha_cita = CURRENT_DATE) AS hoy,
          COUNT(*) FILTER (WHERE v.desc_estado_paciente = 'ATENDIDO') AS atendidas,
          COUNT(*) FILTER (WHERE v.desc_estado_paciente = 'CANCELADO') AS canceladas,
          COUNT(*) FILTER (WHERE v.desc_estado_paciente = 'PENDIENTE') AS pendientes
        FROM vw_solicitud_cita_det v
        WHERE (:fi IS NULL OR v.fecha_cita >= :fi)
          AND (:ff IS NULL OR v.fecha_cita <= :ff)
          AND (:areaHosp IS NULL OR v.area_hospitalaria = :areaHosp)
          AND (:servicio IS NULL OR v.cod_servicio = :servicio OR v.id_servicio::text = :servicio)
        """, nativeQuery = true)
    Object[] kpis(
        @Param("fi") LocalDate fi,
        @Param("ff") LocalDate ff,
        @Param("areaHosp") String areaHosp,
        @Param("servicio") String servicio
    );

    // Estado paciente 
    @Query(value = """
        SELECT v.desc_estado_paciente AS label, COUNT(*) AS total
        FROM vw_solicitud_cita_det v
        WHERE (:fi IS NULL OR v.fecha_cita >= :fi)
          AND (:ff IS NULL OR v.fecha_cita <= :ff)
          AND (:areaHosp IS NULL OR v.area_hospitalaria = :areaHosp)
          AND (:servicio IS NULL OR v.cod_servicio = :servicio OR v.id_servicio::text = :servicio)
        GROUP BY v.desc_estado_paciente
        ORDER BY total DESC
        """, nativeQuery = true)
    List<LabelTotalProjection> estadoPaciente(
        @Param("fi") LocalDate fi,
        @Param("ff") LocalDate ff,
        @Param("areaHosp") String areaHosp,
        @Param("servicio") String servicio
    );

    // Top servicios
    @Query(value = """
        SELECT v.desc_servicio AS label, COUNT(*) AS total
        FROM vw_solicitud_cita_det v
        WHERE (:fi IS NULL OR v.fecha_cita >= :fi)
          AND (:ff IS NULL OR v.fecha_cita <= :ff)
          AND (:areaHosp IS NULL OR v.area_hospitalaria = :areaHosp)
        GROUP BY v.desc_servicio
        ORDER BY total DESC
        LIMIT 10
        """, nativeQuery = true)
    List<LabelTotalProjection> topServicios(
        @Param("fi") LocalDate fi,
        @Param("ff") LocalDate ff,
        @Param("areaHosp") String areaHosp
    );

    // Evolución por día
    @Query(value = """
        SELECT v.fecha_cita::text AS label, COUNT(*) AS total
        FROM vw_solicitud_cita_det v
        WHERE (:fi IS NULL OR v.fecha_cita >= :fi)
          AND (:ff IS NULL OR v.fecha_cita <= :ff)
          AND (:areaHosp IS NULL OR v.area_hospitalaria = :areaHosp)
          AND (:servicio IS NULL OR v.cod_servicio = :servicio OR v.id_servicio::text = :servicio)
        GROUP BY v.fecha_cita
        ORDER BY v.fecha_cita
        """, nativeQuery = true)
    List<LabelTotalProjection> evolucion(
        @Param("fi") LocalDate fi,
        @Param("ff") LocalDate ff,
        @Param("areaHosp") String areaHosp,
        @Param("servicio") String servicio
    );

    // Top profesionales
    @Query(value = """
        SELECT v.profesional AS label, COUNT(*) AS total
        FROM vw_solicitud_cita_det v
        WHERE (:fi IS NULL OR v.fecha_cita >= :fi)
          AND (:ff IS NULL OR v.fecha_cita <= :ff)
          AND (:areaHosp IS NULL OR v.area_hospitalaria = :areaHosp)
          AND (:servicio IS NULL OR v.cod_servicio = :servicio OR v.id_servicio::text = :servicio)
        GROUP BY v.profesional
        ORDER BY total DESC
        LIMIT 10
        """, nativeQuery = true)
    List<LabelTotalProjection> topProfesionales(
        @Param("fi") LocalDate fi,
        @Param("ff") LocalDate ff,
        @Param("areaHosp") String areaHosp,
        @Param("servicio") String servicio
    );

    // BÚSQUEDA con filtros (tabla)
    @Query(value = """
    	    SELECT *
    	    FROM vw_solicitud_cita_det v
    	    WHERE
    	      v.fecha_cita >= COALESCE(:fi, v.fecha_cita)
    	      AND v.fecha_cita <= COALESCE(:ff, v.fecha_cita)
    	      AND v.periodo = COALESCE(:periodo, v.periodo)
    	      AND v.doc_paciente = COALESCE(:docPaciente, v.doc_paciente)
    	      AND v.num_doc_pers = COALESCE(:numDocPers, v.num_doc_pers)
    	      AND v.area_hospitalaria = COALESCE(:areaHosp, v.area_hospitalaria)
    	      AND (
    	         :servicio IS NULL OR v.cod_servicio = :servicio OR v.id_servicio::text = :servicio
    	      )
    	      AND (
    	         :estadoPaciente IS NULL OR v.desc_estado_paciente = :estadoPaciente OR v.cod_estado_cita = :estadoPaciente
    	      )
    	    ORDER BY v.fecha_cita DESC, v.hora_cita DESC
    	    LIMIT 200
    	""", nativeQuery = true)
    	List<VwSolicitudCitaDet> buscar(
    	    @Param("fi") LocalDate fi,
    	    @Param("ff") LocalDate ff,
    	    @Param("periodo") String periodo,
    	    @Param("docPaciente") String docPaciente,
    	    @Param("numDocPers") String numDocPers,
    	    @Param("areaHosp") String areaHosp,
    	    @Param("servicio") String servicio,
    	    @Param("estadoPaciente") String estadoPaciente
    	);
}

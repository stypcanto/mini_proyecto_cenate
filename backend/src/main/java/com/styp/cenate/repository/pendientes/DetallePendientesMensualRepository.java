package com.styp.cenate.repository.pendientes;

import com.styp.cenate.model.DetallePendientesMensual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DetallePendientesMensualRepository extends JpaRepository<DetallePendientesMensual, Long> {

    List<DetallePendientesMensual> findByDniMedico(String dniMedico);

    @Query(
        value = """
            SELECT d.*
            FROM detalle_pendientes_mensual d
            WHERE (:servicio IS NULL OR d.servicio ILIKE '%' || CAST(:servicio AS text) || '%')
              AND (:subactividad IS NULL OR d.subactividad ILIKE '%' || CAST(:subactividad AS text) || '%')
              AND (:busqueda IS NULL OR d.doc_paciente ILIKE '%' || CAST(:busqueda AS text) || '%'
                                    OR d.paciente ILIKE '%' || CAST(:busqueda AS text) || '%')
              AND (:fechaDesde IS NULL OR d.fecha_cita >= CAST(:fechaDesde AS date))
              AND (:fechaHasta IS NULL OR d.fecha_cita <= CAST(:fechaHasta AS date))
            """,
        countQuery = """
            SELECT COUNT(1)
            FROM detalle_pendientes_mensual d
            WHERE (:servicio IS NULL OR d.servicio ILIKE '%' || CAST(:servicio AS text) || '%')
              AND (:subactividad IS NULL OR d.subactividad ILIKE '%' || CAST(:subactividad AS text) || '%')
              AND (:busqueda IS NULL OR d.doc_paciente ILIKE '%' || CAST(:busqueda AS text) || '%'
                                    OR d.paciente ILIKE '%' || CAST(:busqueda AS text) || '%')
              AND (:fechaDesde IS NULL OR d.fecha_cita >= CAST(:fechaDesde AS date))
              AND (:fechaHasta IS NULL OR d.fecha_cita <= CAST(:fechaHasta AS date))
            """,
        nativeQuery = true
    )
    Page<DetallePendientesMensual> buscarConFiltros(
        @Param("servicio") String servicio,
        @Param("subactividad") String subactividad,
        @Param("busqueda") String busqueda,
        @Param("fechaDesde") LocalDate fechaDesde,
        @Param("fechaHasta") LocalDate fechaHasta,
        Pageable pageable
    );

    @Query("""
        SELECT COUNT(DISTINCT d.docPaciente)
        FROM DetallePendientesMensual d
        """)
    Long countDistinctPacientes();
}

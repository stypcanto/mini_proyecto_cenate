package com.styp.cenate.repository.pendientes;

import com.styp.cenate.model.ConsolidadoPendientesMensual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ConsolidadoPendientesMensualRepository extends JpaRepository<ConsolidadoPendientesMensual, Long> {

    List<ConsolidadoPendientesMensual> findByDniMedico(String dniMedico);

    @Query(
        value = """
            SELECT c.*
            FROM consolidado_pendientes_mensual c
            WHERE (:servicio IS NULL OR c.servicio ILIKE '%' || CAST(:servicio AS text) || '%')
              AND (:subactividad IS NULL OR c.subactividad ILIKE '%' || CAST(:subactividad AS text) || '%')
              AND (:fechaDesde IS NULL OR c.fecha_cita >= CAST(:fechaDesde AS date))
              AND (:fechaHasta IS NULL OR c.fecha_cita <= CAST(:fechaHasta AS date))
            """,
        countQuery = """
            SELECT COUNT(1)
            FROM consolidado_pendientes_mensual c
            WHERE (:servicio IS NULL OR c.servicio ILIKE '%' || CAST(:servicio AS text) || '%')
              AND (:subactividad IS NULL OR c.subactividad ILIKE '%' || CAST(:subactividad AS text) || '%')
              AND (:fechaDesde IS NULL OR c.fecha_cita >= CAST(:fechaDesde AS date))
              AND (:fechaHasta IS NULL OR c.fecha_cita <= CAST(:fechaHasta AS date))
            """,
        nativeQuery = true
    )
    Page<ConsolidadoPendientesMensual> buscarConFiltros(
        @Param("servicio") String servicio,
        @Param("subactividad") String subactividad,
        @Param("fechaDesde") LocalDate fechaDesde,
        @Param("fechaHasta") LocalDate fechaHasta,
        Pageable pageable
    );

    @Query("""
        SELECT COUNT(DISTINCT c.dniMedico)
        FROM ConsolidadoPendientesMensual c
        """)
    Long countDistinctMedicos();

    @Query("""
        SELECT SUM(c.abandono)
        FROM ConsolidadoPendientesMensual c
        """)
    Long sumTotalAbandonos();

    @Query("""
        SELECT c.subactividad, COUNT(DISTINCT c.dniMedico), SUM(c.abandono)
        FROM ConsolidadoPendientesMensual c
        GROUP BY c.subactividad
        ORDER BY SUM(c.abandono) DESC
        """)
    List<Object[]> resumenPorSubactividad();

    @Query("""
        SELECT c.servicio, COUNT(DISTINCT c.dniMedico), SUM(c.abandono)
        FROM ConsolidadoPendientesMensual c
        GROUP BY c.servicio
        ORDER BY SUM(c.abandono) DESC
        """)
    List<Object[]> resumenPorServicio(Pageable pageable);
}

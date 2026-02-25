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

    List<ConsolidadoPendientesMensual> findByDniMedicoAndTurno(String dniMedico, String turno);

    @Query(
        value = """
            SELECT c.*
            FROM consolidado_pendientes_mensual c
            WHERE c.turno = CAST(:turno AS text)
              AND (:servicio IS NULL OR c.servicio ILIKE '%' || CAST(:servicio AS text) || '%')
              AND (:subactividad IS NULL OR c.subactividad ILIKE '%' || CAST(:subactividad AS text) || '%')
              AND (CAST(:fechaDesde AS text) IS NULL OR c.fecha_cita >= CAST(CAST(:fechaDesde AS text) AS date))
              AND (CAST(:fechaHasta AS text) IS NULL OR c.fecha_cita <= CAST(CAST(:fechaHasta AS text) AS date))
            """,
        countQuery = """
            SELECT COUNT(1)
            FROM consolidado_pendientes_mensual c
            WHERE c.turno = CAST(:turno AS text)
              AND (:servicio IS NULL OR c.servicio ILIKE '%' || CAST(:servicio AS text) || '%')
              AND (:subactividad IS NULL OR c.subactividad ILIKE '%' || CAST(:subactividad AS text) || '%')
              AND (CAST(:fechaDesde AS text) IS NULL OR c.fecha_cita >= CAST(CAST(:fechaDesde AS text) AS date))
              AND (CAST(:fechaHasta AS text) IS NULL OR c.fecha_cita <= CAST(CAST(:fechaHasta AS text) AS date))
            """,
        nativeQuery = true
    )
    Page<ConsolidadoPendientesMensual> buscarConFiltros(
        @Param("turno") String turno,
        @Param("servicio") String servicio,
        @Param("subactividad") String subactividad,
        @Param("fechaDesde") LocalDate fechaDesde,
        @Param("fechaHasta") LocalDate fechaHasta,
        Pageable pageable
    );

    @Query("""
        SELECT COUNT(DISTINCT c.dniMedico)
        FROM ConsolidadoPendientesMensual c
        WHERE c.turno = :turno
        """)
    Long countDistinctMedicos(@Param("turno") String turno);

    @Query("""
        SELECT SUM(c.abandono)
        FROM ConsolidadoPendientesMensual c
        WHERE c.turno = :turno
        """)
    Long sumTotalAbandonos(@Param("turno") String turno);

    @Query("""
        SELECT c.subactividad, COUNT(DISTINCT c.dniMedico), SUM(c.abandono)
        FROM ConsolidadoPendientesMensual c
        WHERE c.turno = :turno
        GROUP BY c.subactividad
        ORDER BY SUM(c.abandono) DESC
        """)
    List<Object[]> resumenPorSubactividad(@Param("turno") String turno);

    @Query("""
        SELECT c.servicio, COUNT(DISTINCT c.dniMedico), SUM(c.abandono)
        FROM ConsolidadoPendientesMensual c
        WHERE c.turno = :turno
        GROUP BY c.servicio
        ORDER BY SUM(c.abandono) DESC
        """)
    List<Object[]> resumenPorServicio(@Param("turno") String turno, Pageable pageable);
}

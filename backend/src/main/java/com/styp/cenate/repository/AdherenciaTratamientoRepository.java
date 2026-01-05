package com.styp.cenate.repository;

import com.styp.cenate.model.AdherenciaTratamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Repository para gestionar adherencia al tratamiento
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Repository
public interface AdherenciaTratamientoRepository extends JpaRepository<AdherenciaTratamiento, Long> {

    /**
     * Obtener todos los registros de adherencia de un paciente
     */
    List<AdherenciaTratamiento> findByPkAseguradoOrderByFechaProgramadaDesc(String pkAsegurado);

    /**
     * Obtener registros de adherencia de una atención específica
     */
    List<AdherenciaTratamiento> findByIdAtencionOrderByFechaProgramadaDesc(Long idAtencion);

    /**
     * Obtener registros de adherencia de un paciente en un rango de fechas
     */
    @Query("SELECT a FROM AdherenciaTratamiento a " +
            "WHERE a.pkAsegurado = :pkAsegurado " +
            "AND a.fechaProgramada BETWEEN :fechaInicio AND :fechaFin " +
            "ORDER BY a.fechaProgramada DESC")
    List<AdherenciaTratamiento> findByPkAseguradoAndFechaRange(
            @Param("pkAsegurado") String pkAsegurado,
            @Param("fechaInicio") OffsetDateTime fechaInicio,
            @Param("fechaFin") OffsetDateTime fechaFin);

    /**
     * Calcular porcentaje de adherencia de un paciente en un período
     * Retorna: [total_dosis, dosis_tomadas]
     */
    @Query("SELECT COUNT(a), SUM(CASE WHEN a.tomoMedicamento = true THEN 1 ELSE 0 END) " +
            "FROM AdherenciaTratamiento a " +
            "WHERE a.pkAsegurado = :pkAsegurado " +
            "AND a.fechaProgramada BETWEEN :fechaInicio AND :fechaFin")
    Object[] calcularAdherencia(
            @Param("pkAsegurado") String pkAsegurado,
            @Param("fechaInicio") OffsetDateTime fechaInicio,
            @Param("fechaFin") OffsetDateTime fechaFin);

    /**
     * Calcular adherencia para una atención específica
     */
    @Query("SELECT COUNT(a), SUM(CASE WHEN a.tomoMedicamento = true THEN 1 ELSE 0 END) " +
            "FROM AdherenciaTratamiento a " +
            "WHERE a.idAtencion = :idAtencion")
    Object[] calcularAdherenciaPorAtencion(@Param("idAtencion") Long idAtencion);

    /**
     * Contar registros de adherencia de un paciente
     */
    long countByPkAsegurado(String pkAsegurado);
}

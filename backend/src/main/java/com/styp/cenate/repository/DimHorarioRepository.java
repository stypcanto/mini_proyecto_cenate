package com.styp.cenate.repository;

import com.styp.cenate.model.DimHorario;
import com.styp.cenate.model.RegimenLaboral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ⏰ Repositorio para gestionar catálogo de horarios.
 * Tabla: dim_horario
 *
 * CRÍTICO para sincronización:
 * - Mapea códigos de turno (M/T/MT) a horarios (158/131/200A)
 * - Cada código tiene 3 variantes según régimen laboral
 * - Busca el horario correcto para crear ctr_horario_det
 *
 * Ejemplos de mapeo:
 * - M + 728 → código "158" (mañana 4h)
 * - T + CAS → código "131" (tarde 4h)
 * - MT + LOCADOR → código "200A" (completo 12h)
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Repository
public interface DimHorarioRepository extends JpaRepository<DimHorario, Long> {

    /**
     * CRÍTICO: Busca horario por código y régimen laboral.
     * Usado durante sincronización para mapear turnos correctamente.
     *
     * Ejemplo de uso:
     * - Turno "M" + Régimen "728" → buscar cod_horario="158" con id_reg_lab de 728
     * - Turno "MT" + Régimen "LOCADOR" → buscar cod_horario="200A" con id_reg_lab de LOCADOR
     *
     * @param codHorario Código del horario (158, 131, 200A, etc.)
     * @param regimenLaboral Régimen laboral del personal
     * @return Horario si existe, empty() si no
     */
    @Query("""
        SELECT h FROM DimHorario h
        WHERE h.codHorario = :codHorario
          AND h.regimenLaboral = :regimenLaboral
          AND h.statHorario = 'A'
    """)
    Optional<DimHorario> findByCodHorarioAndRegimenLaboral(
        @Param("codHorario") String codHorario,
        @Param("regimenLaboral") RegimenLaboral regimenLaboral
    );

    /**
     * Busca todos los horarios de un código.
     * Retorna las 3 variantes (728, CAS, LOCADOR).
     *
     * @param codHorario Código del horario (158, 131, 200A)
     * @return Lista de horarios con ese código
     */
    @Query("""
        SELECT h FROM DimHorario h
        WHERE h.codHorario = :codHorario
          AND h.statHorario = 'A'
        ORDER BY h.regimenLaboral.idRegLab
    """)
    List<DimHorario> findByCodHorario(@Param("codHorario") String codHorario);

    /**
     * Busca horarios de un régimen laboral.
     *
     * @param regimenLaboral Régimen laboral
     * @return Lista de horarios del régimen
     */
    @Query("""
        SELECT h FROM DimHorario h
        WHERE h.regimenLaboral = :regimenLaboral
          AND h.statHorario = 'A'
        ORDER BY h.codHorario
    """)
    List<DimHorario> findByRegimenLaboral(@Param("regimenLaboral") RegimenLaboral regimenLaboral);

    /**
     * Busca por código (cualquier régimen).
     * Útil para verificar existencia del código.
     *
     * @param codHorario Código del horario
     * @return Lista de horarios (puede retornar 3)
     */
    List<DimHorario> findByCodHorarioOrderByRegimenLaboralIdRegLabAsc(String codHorario);

    /**
     * Lista todos los horarios activos.
     * Ordenados por código y régimen.
     *
     * @return Lista de horarios activos
     */
    @Query("""
        SELECT h FROM DimHorario h
        WHERE h.statHorario = 'A'
        ORDER BY h.codHorario, h.regimenLaboral.idRegLab
    """)
    List<DimHorario> findAllActivos();

    /**
     * Verifica si existe horario para código y régimen.
     *
     * @param codHorario Código del horario
     * @param idRegLab ID del régimen laboral
     * @return true si existe, false si no
     */
    @Query("""
        SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END
        FROM DimHorario h
        WHERE h.codHorario = :codHorario
          AND h.regimenLaboral.idRegLab = :idRegLab
          AND h.statHorario = 'A'
    """)
    boolean existsByCodHorarioAndRegimenLaboral(
        @Param("codHorario") String codHorario,
        @Param("idRegLab") Long idRegLab
    );

    /**
     * Busca horario por código visual.
     * Códigos visuales son alternativos al código principal.
     *
     * @param codHorarioVisual Código visual
     * @return Horario si existe, empty() si no
     */
    Optional<DimHorario> findByCodHorarioVisualAndStatHorario(
        String codHorarioVisual,
        String statHorario
    );
}

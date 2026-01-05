package com.styp.cenate.repository;

import com.styp.cenate.model.DimTipoTurno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 🔖 Repositorio para gestionar tipos de turno.
 * Tabla: dim_tipo_turno
 *
 * CRÍTICO para sincronización:
 * - Busca tipo TRN_CHATBOT para marcar turnos generados
 * - Diferencia turnos automáticos de manuales
 * - Permite auditar origen de cada detalle
 *
 * Tipos comunes:
 * - TRN_CHATBOT: Turno generado desde disponibilidad médica
 * - TRN_MANUAL: Turno ingresado manualmente por coordinador
 * - TRN_MODIFICADO: Turno ajustado después de creación
 * - TRN_REEMPLAZO: Turno de reemplazo
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Repository
public interface DimTipoTurnoRepository extends JpaRepository<DimTipoTurno, Long> {

    /**
     * CRÍTICO: Busca tipo de turno TRN_CHATBOT.
     * Usado durante sincronización para marcar turnos generados.
     *
     * Este tipo identifica turnos creados automáticamente
     * desde disponibilidad_medica vs turnos manuales.
     *
     * @param codTipTurno Código del tipo de turno (TRN_CHATBOT)
     * @return Tipo de turno si existe, empty() si no
     */
    @Query("""
        SELECT tt FROM DimTipoTurno tt
        WHERE tt.codTipTurno = :codTipTurno
          AND tt.statTipTurno = 'A'
    """)
    Optional<DimTipoTurno> findByCodTipTurno(@Param("codTipTurno") String codTipTurno);

    /**
     * Busca tipo de turno por código (sin validar estado).
     * Útil para consultas generales.
     *
     * @param codTipTurno Código del tipo de turno
     * @return Tipo de turno si existe, empty() si no
     */
    Optional<DimTipoTurno> findByCodTipTurnoIgnoreCase(String codTipTurno);

    /**
     * Lista todos los tipos de turno activos.
     *
     * @return Lista de tipos activos
     */
    @Query("""
        SELECT tt FROM DimTipoTurno tt
        WHERE tt.statTipTurno = 'A'
        ORDER BY tt.codTipTurno
    """)
    List<DimTipoTurno> findAllActivos();

    /**
     * Verifica si existe tipo de turno con código específico.
     *
     * @param codTipTurno Código del tipo de turno
     * @return true si existe, false si no
     */
    boolean existsByCodTipTurno(String codTipTurno);

    /**
     * Cuenta tipos de turno activos.
     *
     * @return Cantidad de tipos activos
     */
    @Query("""
        SELECT COUNT(tt) FROM DimTipoTurno tt
        WHERE tt.statTipTurno = 'A'
    """)
    long countActivos();

    /**
     * Lista tipos de turno por descripción parcial.
     * Útil para búsquedas.
     *
     * @param descripcion Texto a buscar en descripción
     * @return Lista de tipos que coinciden
     */
    @Query("""
        SELECT tt FROM DimTipoTurno tt
        WHERE LOWER(tt.descTipTurno) LIKE LOWER(CONCAT('%', :descripcion, '%'))
          AND tt.statTipTurno = 'A'
        ORDER BY tt.codTipTurno
    """)
    List<DimTipoTurno> findByDescripcionContaining(@Param("descripcion") String descripcion);
}

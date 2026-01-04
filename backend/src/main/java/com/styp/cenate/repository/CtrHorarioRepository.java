package com.styp.cenate.repository;

import com.styp.cenate.model.Area;
import com.styp.cenate.model.CtrHorario;
import com.styp.cenate.model.PersonalCnt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 📊 Repositorio para gestionar horarios mensuales del chatbot.
 * Tabla: ctr_horario
 *
 * Proporciona métodos para:
 * - Buscar horarios por periodo, personal y área
 * - Verificar existencia antes de sincronización
 * - Listar horarios de un periodo específico
 *
 * CRÍTICO para sincronización desde disponibilidad_medica.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Repository
public interface CtrHorarioRepository extends JpaRepository<CtrHorario, Long> {

    /**
     * CRÍTICO: Busca horario por periodo, personal y área.
     * Usado antes de sincronizar para verificar si ya existe.
     *
     * @param periodo Periodo en formato AAAAMM (ej: "202601")
     * @param idPers ID del personal
     * @param idArea ID del área
     * @return Horario si existe, empty() si no
     */
    @Query("""
        SELECT h FROM CtrHorario h
        WHERE h.periodo = :periodo
          AND h.personal.idPers = :idPers
          AND h.area.idArea = :idArea
    """)
    Optional<CtrHorario> findByPeriodoAndPersonalAndArea(
        @Param("periodo") String periodo,
        @Param("idPers") Long idPers,
        @Param("idArea") Long idArea
    );

    /**
     * Busca todos los horarios de un periodo específico.
     *
     * @param periodo Periodo en formato AAAAMM
     * @return Lista de horarios del periodo
     */
    List<CtrHorario> findByPeriodoOrderByPersonalIdPersAsc(String periodo);

    /**
     * Busca horarios de un personal en un periodo.
     *
     * @param periodo Periodo en formato AAAAMM
     * @param personal Personal a buscar
     * @return Lista de horarios del personal en ese periodo
     */
    List<CtrHorario> findByPeriodoAndPersonalOrderByAreaDescAreaAsc(
        String periodo,
        PersonalCnt personal
    );

    /**
     * Busca horarios de un área en un periodo.
     *
     * @param periodo Periodo en formato AAAAMM
     * @param area Área a buscar
     * @return Lista de horarios del área en ese periodo
     */
    List<CtrHorario> findByPeriodoAndAreaOrderByPersonalIdPersAsc(
        String periodo,
        Area area
    );

    /**
     * Cuenta cuántos horarios tiene un personal en un periodo.
     * Útil para validaciones de carga.
     *
     * @param periodo Periodo en formato AAAAMM
     * @param idPers ID del personal
     * @return Cantidad de horarios
     */
    @Query("""
        SELECT COUNT(h) FROM CtrHorario h
        WHERE h.periodo = :periodo
          AND h.personal.idPers = :idPers
    """)
    long countByPeriodoAndPersonal(
        @Param("periodo") String periodo,
        @Param("idPers") Long idPers
    );

    /**
     * Verifica si existe horario para la combinación periodo-personal-área.
     *
     * @param periodo Periodo en formato AAAAMM
     * @param idPers ID del personal
     * @param idArea ID del área
     * @return true si existe, false si no
     */
    @Query("""
        SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END
        FROM CtrHorario h
        WHERE h.periodo = :periodo
          AND h.personal.idPers = :idPers
          AND h.area.idArea = :idArea
    """)
    boolean existsByPeriodoAndPersonalAndArea(
        @Param("periodo") String periodo,
        @Param("idPers") Long idPers,
        @Param("idArea") Long idArea
    );

    /**
     * Busca horarios por IDs de personal (bulk query).
     * Útil para reportes y estadísticas.
     *
     * @param periodo Periodo en formato AAAAMM
     * @param idsPersonal Lista de IDs de personal
     * @return Lista de horarios
     */
    @Query("""
        SELECT h FROM CtrHorario h
        WHERE h.periodo = :periodo
          AND h.personal.idPers IN :idsPersonal
        ORDER BY h.personal.idPers, h.area.descArea
    """)
    List<CtrHorario> findByPeriodoAndPersonalIn(
        @Param("periodo") String periodo,
        @Param("idsPersonal") List<Long> idsPersonal
    );
}

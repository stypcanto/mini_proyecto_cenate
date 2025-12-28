package com.styp.cenate.repository;

import com.styp.cenate.model.DisponibilidadMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 🗄️ Repository para la entidad DisponibilidadMedica.
 *
 * Proporciona métodos especializados para:
 * - Buscar disponibilidades por médico, periodo y especialidad
 * - Verificar existencia de disponibilidades
 * - Obtener disponibilidades con JOIN FETCH para optimización
 * - Listar disponibilidades enviadas para revisión del coordinador
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Repository
public interface DisponibilidadMedicaRepository extends JpaRepository<DisponibilidadMedica, Long> {

    // ==========================================================
    // BÚSQUEDAS POR MÉDICO
    // ==========================================================

    /**
     * Busca todas las disponibilidades de un médico, ordenadas por periodo descendente
     *
     * @param idPers ID del médico (PersonalCnt)
     * @return Lista de disponibilidades
     */
    List<DisponibilidadMedica> findByPersonalIdPersOrderByPeriodoDesc(Long idPers);

    /**
     * Busca la disponibilidad de un médico para un periodo y especialidad específicos
     *
     * @param idPers ID del médico
     * @param periodo Periodo en formato YYYYMM
     * @param idServicio ID de la especialidad
     * @return Optional con la disponibilidad si existe
     */
    Optional<DisponibilidadMedica> findByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
            Long idPers, String periodo, Long idServicio);

    /**
     * Verifica si existe una disponibilidad para un médico, periodo y especialidad
     *
     * @param idPers ID del médico
     * @param periodo Periodo en formato YYYYMM
     * @param idServicio ID de la especialidad
     * @return true si existe, false en caso contrario
     */
    boolean existsByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
            Long idPers, String periodo, Long idServicio);

    // ==========================================================
    // BÚSQUEDAS POR PERIODO
    // ==========================================================

    /**
     * Busca todas las disponibilidades de un periodo
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de disponibilidades
     */
    List<DisponibilidadMedica> findByPeriodo(String periodo);

    /**
     * Busca todas las disponibilidades de un periodo y estado específicos
     *
     * @param periodo Periodo en formato YYYYMM
     * @param estado Estado (BORRADOR, ENVIADO, REVISADO)
     * @return Lista de disponibilidades
     */
    List<DisponibilidadMedica> findByPeriodoAndEstado(String periodo, String estado);

    // ==========================================================
    // BÚSQUEDAS POR ESPECIALIDAD
    // ==========================================================

    /**
     * Busca todas las disponibilidades de una especialidad en un periodo
     *
     * @param idServicio ID de la especialidad
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de disponibilidades
     */
    List<DisponibilidadMedica> findByEspecialidadIdServicioAndPeriodo(Long idServicio, String periodo);

    // ==========================================================
    // QUERIES CON JOIN FETCH (OPTIMIZACIÓN)
    // ==========================================================

    /**
     * Busca una disponibilidad por ID con JOIN FETCH para optimización.
     * Carga eager: personal, especialidad y regimenLaboral del personal
     *
     * @param id ID de la disponibilidad
     * @return Optional con la disponibilidad si existe
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "JOIN FETCH d.personal p " +
           "JOIN FETCH d.especialidad e " +
           "LEFT JOIN FETCH p.regimenLaboral " +
           "WHERE d.idDisponibilidad = :id")
    Optional<DisponibilidadMedica> findByIdWithDetails(@Param("id") Long id);

    /**
     * Busca todas las disponibilidades ENVIADAS de un periodo con JOIN FETCH.
     * Útil para el coordinador que revisa las solicitudes.
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de disponibilidades enviadas, ordenadas por fecha de envío
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "JOIN FETCH d.personal p " +
           "JOIN FETCH d.especialidad e " +
           "LEFT JOIN FETCH p.regimenLaboral " +
           "WHERE d.periodo = :periodo AND d.estado = 'ENVIADO' " +
           "ORDER BY d.fechaEnvio ASC")
    List<DisponibilidadMedica> findEnviadasByPeriodo(@Param("periodo") String periodo);

    /**
     * Busca todas las disponibilidades de un periodo con JOIN FETCH.
     * Útil para reportes y estadísticas.
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de disponibilidades con relaciones cargadas
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "JOIN FETCH d.personal p " +
           "JOIN FETCH d.especialidad e " +
           "LEFT JOIN FETCH p.regimenLaboral " +
           "WHERE d.periodo = :periodo " +
           "ORDER BY e.descServicio ASC, p.apePaterPers ASC, p.apeMaterPers ASC")
    List<DisponibilidadMedica> findByPeriodoWithDetails(@Param("periodo") String periodo);

    /**
     * Busca disponibilidades de un médico con JOIN FETCH
     *
     * @param idPers ID del médico
     * @return Lista de disponibilidades con relaciones cargadas
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "JOIN FETCH d.personal p " +
           "JOIN FETCH d.especialidad e " +
           "LEFT JOIN FETCH p.regimenLaboral " +
           "WHERE p.idPers = :idPers " +
           "ORDER BY d.periodo DESC")
    List<DisponibilidadMedica> findByPersonalIdPersWithDetails(@Param("idPers") Long idPers);

    // ==========================================================
    // ESTADÍSTICAS
    // ==========================================================

    /**
     * Cuenta el total de disponibilidades por estado
     *
     * @param estado Estado (BORRADOR, ENVIADO, REVISADO)
     * @return Cantidad de disponibilidades
     */
    long countByEstado(String estado);

    /**
     * Cuenta el total de disponibilidades de un periodo
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Cantidad de disponibilidades
     */
    long countByPeriodo(String periodo);

    /**
     * Cuenta el total de disponibilidades de un médico
     *
     * @param idPers ID del médico
     * @return Cantidad de disponibilidades
     */
    long countByPersonalIdPers(Long idPers);

    /**
     * Busca todas las disponibilidades con estado específico
     *
     * @param estado Estado (BORRADOR, ENVIADO, REVISADO)
     * @return Lista de disponibilidades
     */
    List<DisponibilidadMedica> findByEstado(String estado);
}

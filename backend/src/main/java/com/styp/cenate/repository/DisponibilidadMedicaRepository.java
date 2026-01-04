package com.styp.cenate.repository;

import com.styp.cenate.model.DisponibilidadMedica;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository para DisponibilidadMedica.
 * Incluye consultas para gestión de disponibilidad, sincronización y reportes.
 * 
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Repository
public interface DisponibilidadMedicaRepository extends JpaRepository<DisponibilidadMedica, Long> {

    // ==========================================================
    // 🔍 Búsquedas básicas
    // ==========================================================

    /**
     * Buscar disponibilidad por médico y periodo
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.personal.idPers = :idPers AND d.periodo = :periodo")
    List<DisponibilidadMedica> findByPersonalAndPeriodo(
        @Param("idPers") Long idPers,
        @Param("periodo") String periodo
    );

    /**
     * Buscar disponibilidad única por médico, periodo y servicio
     */
    Optional<DisponibilidadMedica> findByPersonal_IdPersAndPeriodoAndServicio_IdServicio(
        Long idPers,
        String periodo,
        Long idServicio
    );

    /**
     * Buscar disponibilidades por periodo
     */
    List<DisponibilidadMedica> findByPeriodo(String periodo);

    /**
     * Buscar disponibilidades por periodo con paginación
     */
    Page<DisponibilidadMedica> findByPeriodo(String periodo, Pageable pageable);

    /**
     * Buscar disponibilidades por estado
     */
    List<DisponibilidadMedica> findByEstado(String estado);

    /**
     * Buscar disponibilidades por estado con paginación
     */
    Page<DisponibilidadMedica> findByEstado(String estado, Pageable pageable);

    /**
     * Buscar disponibilidades por médico
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.personal.idPers = :idPers " +
           "ORDER BY d.periodo DESC")
    List<DisponibilidadMedica> findByPersonal(@Param("idPers") Long idPers);

    /**
     * Buscar disponibilidades por médico con paginación
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.personal.idPers = :idPers " +
           "ORDER BY d.periodo DESC")
    Page<DisponibilidadMedica> findByPersonal(@Param("idPers") Long idPers, Pageable pageable);

    /**
     * Buscar disponibilidades por servicio
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.servicio.idServicio = :idServicio " +
           "ORDER BY d.periodo DESC")
    List<DisponibilidadMedica> findByServicio(@Param("idServicio") Long idServicio);

    // ==========================================================
    // 📊 Consultas de reportes y estadísticas
    // ==========================================================

    /**
     * Buscar disponibilidades por periodo y estado
     */
    List<DisponibilidadMedica> findByPeriodoAndEstado(String periodo, String estado);

    /**
     * Contar disponibilidades por periodo
     */
    long countByPeriodo(String periodo);

    /**
     * Contar disponibilidades por periodo y estado
     */
    long countByPeriodoAndEstado(String periodo, String estado);

    /**
     * Buscar disponibilidades que cumplen horas requeridas
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.periodo = :periodo " +
           "AND d.totalHoras >= d.horasRequeridas")
    List<DisponibilidadMedica> findByPeriodoAndCumpleHoras(@Param("periodo") String periodo);

    /**
     * Buscar disponibilidades que NO cumplen horas requeridas
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.periodo = :periodo " +
           "AND d.totalHoras < d.horasRequeridas")
    List<DisponibilidadMedica> findByPeriodoAndNoCumpleHoras(@Param("periodo") String periodo);

    /**
     * Calcular total de horas declaradas por periodo
     */
    @Query("SELECT COALESCE(SUM(d.totalHoras), 0) FROM DisponibilidadMedica d " +
           "WHERE d.periodo = :periodo")
    BigDecimal sumTotalHorasByPeriodo(@Param("periodo") String periodo);

    /**
     * Calcular total de horas asistenciales por periodo
     */
    @Query("SELECT COALESCE(SUM(d.horasAsistenciales), 0) FROM DisponibilidadMedica d " +
           "WHERE d.periodo = :periodo")
    BigDecimal sumHorasAsistencialesByPeriodo(@Param("periodo") String periodo);

    /**
     * Calcular total de horas sanitarias por periodo
     */
    @Query("SELECT COALESCE(SUM(d.horasSanitarias), 0) FROM DisponibilidadMedica d " +
           "WHERE d.periodo = :periodo")
    BigDecimal sumHorasSanitariasByPeriodo(@Param("periodo") String periodo);

    // ==========================================================
    // 🔄 Sincronización con chatbot
    // ==========================================================

    /**
     * Buscar disponibilidades REVISADAS pendientes de sincronización
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.estado = 'REVISADO' " +
           "AND d.idCtrHorarioGenerado IS NULL " +
           "ORDER BY d.fechaRevision ASC")
    List<DisponibilidadMedica> findPendientesSincronizacion();

    /**
     * Buscar disponibilidades sincronizadas
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.idCtrHorarioGenerado IS NOT NULL " +
           "ORDER BY d.fechaSincronizacion DESC")
    List<DisponibilidadMedica> findSincronizadas();

    /**
     * Buscar disponibilidades sincronizadas por periodo
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.periodo = :periodo " +
           "AND d.idCtrHorarioGenerado IS NOT NULL " +
           "ORDER BY d.fechaSincronizacion DESC")
    List<DisponibilidadMedica> findSincronizadasByPeriodo(@Param("periodo") String periodo);

    /**
     * Verificar si existe disponibilidad para médico, periodo y servicio
     */
    boolean existsByPersonal_IdPersAndPeriodoAndServicio_IdServicio(
        Long idPers,
        String periodo,
        Long idServicio
    );

    // ==========================================================
    // 🧮 Validación y auditoría
    // ==========================================================

    /**
     * Buscar disponibilidades con diferencia significativa vs chatbot
     * (más de 10 horas de diferencia)
     */
    @Query(value = """
        SELECT d.*
        FROM disponibilidad_medica d
        WHERE d.id_ctr_horario_generado IS NOT NULL
        AND ABS(
            d.total_horas - 
            COALESCE((
                SELECT SUM(CASE 
                    WHEN dh.cod_horario = '158' THEN 6
                    WHEN dh.cod_horario = '131' THEN 6
                    WHEN dh.cod_horario = '200A' THEN 12
                    ELSE 0 END)
                FROM ctr_horario ch
                INNER JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario
                INNER JOIN dim_horario dh ON dh.id_horario = chd.id_horario
                WHERE ch.periodo = d.periodo
                AND ch.id_pers = d.id_pers
                AND ch.id_servicio = d.id_servicio
            ), 0)
        ) > 10
        """, nativeQuery = true)
    List<DisponibilidadMedica> findConDiferenciasSignificativasChatbot();

    /**
     * Buscar disponibilidades por rango de horas totales
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "WHERE d.totalHoras >= :horasMin " +
           "AND d.totalHoras <= :horasMax " +
           "ORDER BY d.totalHoras DESC")
    List<DisponibilidadMedica> findByTotalHorasBetween(
        @Param("horasMin") BigDecimal horasMin,
        @Param("horasMax") BigDecimal horasMax
    );

    /**
     * Buscar últimas disponibilidades actualizadas
     */
    @Query("SELECT d FROM DisponibilidadMedica d " +
           "ORDER BY d.updatedAt DESC")
    Page<DisponibilidadMedica> findRecentlyUpdated(Pageable pageable);
}

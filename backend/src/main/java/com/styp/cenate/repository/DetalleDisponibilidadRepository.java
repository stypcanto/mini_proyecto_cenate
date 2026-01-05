package com.styp.cenate.repository;

import com.styp.cenate.model.DetalleDisponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository para DetalleDisponibilidad.
 * Incluye consultas para gestión de turnos diarios.
 * 
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Repository
public interface DetalleDisponibilidadRepository extends JpaRepository<DetalleDisponibilidad, Long> {

    // ==========================================================
    // 🔍 Búsquedas básicas
    // ==========================================================

    /**
     * Buscar detalles por disponibilidad
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findByDisponibilidadMedica(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Buscar detalle por disponibilidad y fecha
     */
    Optional<DetalleDisponibilidad> findByDisponibilidadMedica_IdDisponibilidadAndFecha(
        Long idDisponibilidad,
        LocalDate fecha
    );

    /**
     * Buscar detalles por tipo de turno
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad " +
           "AND d.turno = :turno " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findByDisponibilidadAndTurno(
        @Param("idDisponibilidad") Long idDisponibilidad,
        @Param("turno") String turno
    );

    /**
     * Buscar detalles por rango de fechas
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad " +
           "AND d.fecha BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findByDisponibilidadAndFechaBetween(
        @Param("idDisponibilidad") Long idDisponibilidad,
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );

    // ==========================================================
    // 📊 Estadísticas y reportes
    // ==========================================================

    /**
     * Contar turnos por disponibilidad
     */
    long countByDisponibilidadMedica_IdDisponibilidad(Long idDisponibilidad);

    /**
     * Contar turnos por tipo
     */
    @Query("SELECT COUNT(d) FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad " +
           "AND d.turno = :turno")
    long countByDisponibilidadAndTurno(
        @Param("idDisponibilidad") Long idDisponibilidad,
        @Param("turno") String turno
    );

    /**
     * Sumar total de horas por disponibilidad
     */
    @Query("SELECT COALESCE(SUM(d.horas), 0) FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad")
    BigDecimal sumHorasByDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Obtener estadísticas de turnos por tipo
     */
    @Query("""
        SELECT d.turno as tipo, 
               COUNT(d) as cantidad, 
               COALESCE(SUM(d.horas), 0) as totalHoras
        FROM DetalleDisponibilidad d
        WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad
        GROUP BY d.turno
        ORDER BY d.turno
        """)
    List<Object[]> getEstadisticasPorTurno(@Param("idDisponibilidad") Long idDisponibilidad);

    // ==========================================================
    // 🛠️ Auditoría de ajustes
    // ==========================================================

    /**
     * Buscar detalles ajustados por un coordinador
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.ajustadoPorPersonal.idPers = :idCoordinador " +
           "ORDER BY d.createdAt DESC")
    List<DetalleDisponibilidad> findAjustadosPorCoordinador(@Param("idCoordinador") Long idCoordinador);

    /**
     * Buscar detalles que fueron ajustados
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad " +
           "AND d.ajustadoPorPersonal IS NOT NULL " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findAjustadosByDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Contar ajustes realizados por coordinador
     */
    long countByAjustadoPorPersonal_IdPers(Long idCoordinador);

    // ==========================================================
    // 🔍 Validaciones
    // ==========================================================

    /**
     * Verificar si existe detalle para una fecha específica
     */
    boolean existsByDisponibilidadMedica_IdDisponibilidadAndFecha(
        Long idDisponibilidad,
        LocalDate fecha
    );

    /**
     * Buscar detalles con horas inválidas para su tipo de turno
     */
    @Query("""
        SELECT d FROM DetalleDisponibilidad d
        WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad
        AND (
            (d.turno = 'M' AND d.horas NOT IN (4, 6)) OR
            (d.turno = 'T' AND d.horas NOT IN (4, 6)) OR
            (d.turno = 'MT' AND d.horas NOT IN (8, 12))
        )
        """)
    List<DetalleDisponibilidad> findHorasInvalidasByDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Buscar turnos completos (MT) por disponibilidad
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad " +
           "AND d.turno = 'MT' " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findTurnosCompletosByDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Buscar turnos de mañana (M) por disponibilidad
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad " +
           "AND d.turno = 'M' " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findTurnosMananaByDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Buscar turnos de tarde (T) por disponibilidad
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidadMedica.idDisponibilidad = :idDisponibilidad " +
           "AND d.turno = 'T' " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findTurnosTardeByDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Eliminar todos los detalles de una disponibilidad
     * (Usada al regenerar turnos)
     */
    void deleteByDisponibilidadMedica_IdDisponibilidad(Long idDisponibilidad);
}

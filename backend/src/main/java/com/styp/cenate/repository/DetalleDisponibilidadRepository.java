package com.styp.cenate.repository;

import com.styp.cenate.model.DetalleDisponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 🗄️ Repository para la entidad DetalleDisponibilidad.
 *
 * Proporciona métodos especializados para:
 * - Buscar detalles de una disponibilidad
 * - Calcular total de horas
 * - Eliminar detalles en cascada
 * - Buscar detalles ajustados por coordinadores
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Repository
public interface DetalleDisponibilidadRepository extends JpaRepository<DetalleDisponibilidad, Long> {

    // ==========================================================
    // OPERACIONES DE ELIMINACIÓN
    // ==========================================================

    /**
     * Elimina todos los detalles de una disponibilidad.
     * Útil cuando se actualiza completamente la disponibilidad.
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     */
    @Modifying
    @Query("DELETE FROM DetalleDisponibilidad d WHERE d.disponibilidad.idDisponibilidad = :idDisponibilidad")
    void deleteByDisponibilidadIdDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);

    // ==========================================================
    // BÚSQUEDAS POR DISPONIBILIDAD
    // ==========================================================

    /**
     * Busca todos los detalles de una disponibilidad, ordenados por fecha ascendente
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @return Lista de detalles ordenados por fecha
     */
    List<DetalleDisponibilidad> findByDisponibilidadIdDisponibilidadOrderByFechaAsc(Long idDisponibilidad);

    /**
     * Cuenta la cantidad de detalles (turnos) de una disponibilidad
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @return Cantidad de turnos registrados
     */
    long countByDisponibilidadIdDisponibilidad(Long idDisponibilidad);

    // ==========================================================
    // CÁLCULO DE HORAS
    // ==========================================================

    /**
     * Calcula el total de horas de una disponibilidad sumando las horas de todos sus detalles.
     * Retorna 0 si no hay detalles.
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @return Total de horas (0 si no hay detalles)
     */
    @Query("SELECT COALESCE(SUM(d.horas), 0) FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidad.idDisponibilidad = :idDisponibilidad")
    BigDecimal sumHorasByDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);

    // ==========================================================
    // BÚSQUEDAS POR FECHA
    // ==========================================================

    /**
     * Busca detalles de una disponibilidad en una fecha específica
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @param fecha Fecha del turno
     * @return Optional con el detalle si existe
     */
    Optional<DetalleDisponibilidad> findByDisponibilidadIdDisponibilidadAndFecha(
            Long idDisponibilidad, LocalDate fecha);

    /**
     * Busca todos los detalles dentro de un rango de fechas
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @param fechaInicio Fecha de inicio del rango
     * @param fechaFin Fecha de fin del rango
     * @return Lista de detalles en el rango
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidad.idDisponibilidad = :idDisponibilidad " +
           "AND d.fecha BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findByDisponibilidadAndFechaRange(
            @Param("idDisponibilidad") Long idDisponibilidad,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin);

    // ==========================================================
    // BÚSQUEDAS POR TIPO DE TURNO
    // ==========================================================

    /**
     * Busca detalles por tipo de turno
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @param turno Tipo de turno (M, T, MT)
     * @return Lista de detalles con ese tipo de turno
     */
    List<DetalleDisponibilidad> findByDisponibilidadIdDisponibilidadAndTurno(
            Long idDisponibilidad, String turno);

    /**
     * Cuenta la cantidad de turnos por tipo
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @param turno Tipo de turno (M, T, MT)
     * @return Cantidad de turnos de ese tipo
     */
    long countByDisponibilidadIdDisponibilidadAndTurno(Long idDisponibilidad, String turno);

    // ==========================================================
    // BÚSQUEDAS DE AJUSTES
    // ==========================================================

    /**
     * Busca detalles que fueron ajustados por coordinadores
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @return Lista de detalles ajustados
     */
    @Query("SELECT d FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidad.idDisponibilidad = :idDisponibilidad " +
           "AND d.ajustadoPor IS NOT NULL " +
           "ORDER BY d.fecha ASC")
    List<DetalleDisponibilidad> findDetallesAjustados(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Cuenta la cantidad de detalles ajustados por coordinadores
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @return Cantidad de turnos ajustados
     */
    @Query("SELECT COUNT(d) FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidad.idDisponibilidad = :idDisponibilidad " +
           "AND d.ajustadoPor IS NOT NULL")
    long countDetallesAjustados(@Param("idDisponibilidad") Long idDisponibilidad);

    /**
     * Busca todos los detalles ajustados por un coordinador específico
     *
     * @param idCoordinador ID del coordinador
     * @return Lista de detalles ajustados por ese coordinador
     */
    List<DetalleDisponibilidad> findByAjustadoPorIdPers(Long idCoordinador);

    // ==========================================================
    // ESTADÍSTICAS
    // ==========================================================

    /**
     * Obtiene estadísticas agrupadas por tipo de turno para una disponibilidad
     *
     * @param idDisponibilidad ID de la disponibilidad padre
     * @return Lista de Object[] con estructura: [turno, cantidad, totalHoras]
     */
    @Query("SELECT d.turno, COUNT(d), SUM(d.horas) " +
           "FROM DetalleDisponibilidad d " +
           "WHERE d.disponibilidad.idDisponibilidad = :idDisponibilidad " +
           "GROUP BY d.turno " +
           "ORDER BY d.turno")
    List<Object[]> getEstadisticasPorTurno(@Param("idDisponibilidad") Long idDisponibilidad);
}

package com.styp.cenate.repository;

import com.styp.cenate.model.CtrHorario;
import com.styp.cenate.model.CtrHorarioDet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 📅 Repositorio para gestionar detalles diarios de horarios.
 * Tabla: ctr_horario_det
 *
 * Proporciona métodos para:
 * - Buscar detalles de un horario específico
 * - Buscar por fecha específica
 * - Listar turnos de chatbot generados
 * - Verificar existencia de días
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Repository
public interface CtrHorarioDetRepository extends JpaRepository<CtrHorarioDet, Long> {

    /**
     * Busca todos los detalles de un horario.
     * Ordenados por fecha ascendente.
     *
     * @param horario Horario padre
     * @return Lista de detalles del horario
     */
    List<CtrHorarioDet> findByHorarioOrderByFechaDiaAsc(CtrHorario horario);

    /**
     * Busca detalle específico por horario y fecha.
     * Útil para verificar si un día ya existe.
     *
     * @param horario Horario padre
     * @param fechaDia Fecha del día
     * @return Detalle si existe, empty() si no
     */
    Optional<CtrHorarioDet> findByHorarioAndFechaDia(CtrHorario horario, LocalDate fechaDia);

    /**
     * Verifica si existe un día en el horario.
     *
     * @param horario Horario padre
     * @param fechaDia Fecha del día
     * @return true si existe, false si no
     */
    boolean existsByHorarioAndFechaDia(CtrHorario horario, LocalDate fechaDia);

    /**
     * Cuenta detalles de un horario.
     *
     * @param horario Horario padre
     * @return Cantidad de días/detalles
     */
    long countByHorario(CtrHorario horario);

    /**
     * Busca detalles de un horario que tienen turno asignado.
     * Excluye días sin horario (horarioDia = NULL).
     *
     * @param horario Horario padre
     * @return Lista de detalles con horario asignado
     */
    @Query("""
        SELECT d FROM CtrHorarioDet d
        WHERE d.horario = :horario
          AND d.horarioDia IS NOT NULL
        ORDER BY d.fechaDia ASC
    """)
    List<CtrHorarioDet> findByHorarioConHorarioAsignado(@Param("horario") CtrHorario horario);

    /**
     * CRÍTICO: Busca detalles generados desde chatbot.
     * Identifica turnos creados por sincronización.
     *
     * @param horario Horario padre
     * @return Lista de detalles tipo TRN_CHATBOT
     */
    @Query("""
        SELECT d FROM CtrHorarioDet d
        JOIN d.tipoTurno tt
        WHERE d.horario = :horario
          AND tt.codTipTurno = 'TRN_CHATBOT'
        ORDER BY d.fechaDia ASC
    """)
    List<CtrHorarioDet> findByHorarioTurnoChatbot(@Param("horario") CtrHorario horario);

    /**
     * Busca detalles de un horario en un rango de fechas.
     *
     * @param horario Horario padre
     * @param fechaInicio Fecha inicial (inclusive)
     * @param fechaFin Fecha final (inclusive)
     * @return Lista de detalles en el rango
     */
    @Query("""
        SELECT d FROM CtrHorarioDet d
        WHERE d.horario = :horario
          AND d.fechaDia BETWEEN :fechaInicio AND :fechaFin
        ORDER BY d.fechaDia ASC
    """)
    List<CtrHorarioDet> findByHorarioAndFechaDiaBetween(
        @Param("horario") CtrHorario horario,
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );

    /**
     * Elimina todos los detalles de un horario usando JPQL explícito.
     * Usado antes de resincronizar.
     *
     * IMPORTANTE: Usa @Query con JPQL DELETE en lugar de deleteBy*.
     * Esto evita problemas de transacción con constraints y cascadas.
     *
     * @param horario Horario padre
     * @return Cantidad de registros eliminados
     */
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM CtrHorarioDet d WHERE d.horario = :horario")
    int deleteByHorario(@Param("horario") CtrHorario horario);

    /**
     * Cuenta detalles con horario asignado.
     *
     * @param horario Horario padre
     * @return Cantidad de días con horario
     */
    @Query("""
        SELECT COUNT(d) FROM CtrHorarioDet d
        WHERE d.horario = :horario
          AND d.horarioDia IS NOT NULL
    """)
    long countByHorarioConHorarioAsignado(@Param("horario") CtrHorario horario);
}

package com.styp.cenate.repository.mesaayuda;

import com.styp.cenate.model.mesaayuda.TicketMesaAyuda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para la entidad TicketMesaAyuda
 * Proporciona métodos de acceso a datos para tickets de Mesa de Ayuda
 *
 * Métodos principales:
 * - findAll: obtener todos los tickets (para Mesa de Ayuda)
 * - findByIdMedico: obtener tickets de un médico específico
 * - findByEstado: obtener tickets por estado
 * - findActiveTickets: obtener tickets no cerrados
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18)
 */
@Repository
public interface TicketMesaAyudaRepository extends JpaRepository<TicketMesaAyuda, Long> {

    /**
     * Obtener todos los tickets ordenados por fecha de creación descendente
     * (más recientes primero)
     */
    List<TicketMesaAyuda> findAllByDeletedAtIsNullOrderByFechaCreacionDesc();

    /**
     * Obtener todos los tickets con paginación
     * Solo tickets no eliminados (deletedAt IS NULL)
     */
    Page<TicketMesaAyuda> findByDeletedAtIsNull(Pageable pageable);

    /**
     * Obtener tickets de un médico específico
     * Ordenados por fecha de creación descendente
     */
    List<TicketMesaAyuda> findByIdMedicoAndDeletedAtIsNullOrderByFechaCreacionDesc(Long idMedico);

    /**
     * Obtener tickets de un médico con paginación
     */
    Page<TicketMesaAyuda> findByIdMedicoAndDeletedAtIsNull(Long idMedico, Pageable pageable);

    /**
     * Obtener tickets por estado
     * @param estado: ABIERTO, EN_PROCESO, RESUELTO, CERRADO
     */
    List<TicketMesaAyuda> findByEstadoAndDeletedAtIsNullOrderByPrioridadDescFechaCreacionDesc(
        String estado
    );

    /**
     * Obtener tickets por estado con paginación
     */
    Page<TicketMesaAyuda> findByEstadoAndDeletedAtIsNull(String estado, Pageable pageable);

    /**
     * Obtener tickets con múltiples filtros
     * Estados que NO sean CERRADO (tickets abiertos/en proceso/resueltos)
     */
    @Query("""
        SELECT t FROM TicketMesaAyuda t
        WHERE t.deletedAt IS NULL
        AND t.estado IN ('ABIERTO', 'EN_PROCESO', 'RESUELTO')
        ORDER BY t.prioridad DESC, t.fechaCreacion DESC
    """)
    List<TicketMesaAyuda> findActiveTickets();

    /**
     * Obtener tickets activos (no cerrados) con paginación
     */
    @Query("""
        SELECT t FROM TicketMesaAyuda t
        WHERE t.deletedAt IS NULL
        AND t.estado IN ('ABIERTO', 'EN_PROCESO', 'RESUELTO')
        ORDER BY t.prioridad DESC, t.fechaCreacion DESC
    """)
    Page<TicketMesaAyuda> findActiveTickets(Pageable pageable);

    /**
     * Obtener tickets abiertos (sin responder)
     */
    List<TicketMesaAyuda> findByEstadoAndDeletedAtIsNullOrderByFechaCreacionDesc(
        String estado
    );

    /**
     * Obtener tickets por prioridad
     */
    List<TicketMesaAyuda> findByPrioridadAndDeletedAtIsNullOrderByFechaCreacionDesc(
        String prioridad
    );

    /**
     * Obtener un ticket específico (si no está eliminado)
     */
    Optional<TicketMesaAyuda> findByIdAndDeletedAtIsNull(Long id);

    /**
     * Obtener tickets del médico con filtro de estado
     */
    @Query("""
        SELECT t FROM TicketMesaAyuda t
        WHERE t.idMedico = :idMedico
        AND t.deletedAt IS NULL
        AND (:estado IS NULL OR t.estado = :estado)
        ORDER BY t.fechaCreacion DESC
    """)
    List<TicketMesaAyuda> findTicketsMedico(
        @Param("idMedico") Long idMedico,
        @Param("estado") String estado
    );

    /**
     * Obtener tickets creados en un rango de fechas
     */
    @Query("""
        SELECT t FROM TicketMesaAyuda t
        WHERE t.deletedAt IS NULL
        AND t.fechaCreacion BETWEEN :fechaInicio AND :fechaFin
        ORDER BY t.fechaCreacion DESC
    """)
    List<TicketMesaAyuda> findTicketsByDateRange(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * Contar tickets por estado
     */
    Long countByEstadoAndDeletedAtIsNull(String estado);

    /**
     * Contar tickets abiertos (para KPIs)
     */
    Long countByEstadoInAndDeletedAtIsNull(List<String> estados);

    /**
     * Obtener tickets sin respuesta (estado ABIERTO)
     */
    List<TicketMesaAyuda> findByEstadoAndFechaRespuestaIsNullAndDeletedAtIsNullOrderByFechaCreacionDesc(
        String estado
    );
}

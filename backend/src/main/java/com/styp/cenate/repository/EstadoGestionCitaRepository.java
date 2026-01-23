package com.styp.cenate.repository;

import com.styp.cenate.model.EstadoGestionCita;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 📋 Repository para Estados de Gestión de Citas
 * v1.33.0 - Acceso a datos de estados de citas
 *
 * Tabla: public.dim_estados_gestion_citas
 */
@Repository
public interface EstadoGestionCitaRepository extends JpaRepository<EstadoGestionCita, Long> {

    /**
     * Busca estado por código exacto
     *
     * @param codEstadoCita código del estado
     * @return Optional con el estado encontrado
     */
    Optional<EstadoGestionCita> findByCodEstadoCita(String codEstadoCita);

    /**
     * Obtiene todos los estados activos ordenados por descripción
     *
     * @param stat estado del registro ('A' = Activo)
     * @return Lista de estados activos ordenados
     */
    @Query("SELECT e FROM EstadoGestionCita e WHERE e.statEstadoCita = :stat ORDER BY e.descEstadoCita ASC")
    List<EstadoGestionCita> findByStatEstadoCitaOrderByDescEstadoCitaAsc(@Param("stat") String stat);

    /**
     * Búsqueda paginada de estados con filtros
     * Busca en código y descripción
     *
     * @param busqueda término de búsqueda (case-insensitive)
     * @param estado estado del registro ('A' o 'I', null para ambos)
     * @param pageable paginación (size, page, sort)
     * @return Página de estados
     */
    @Query("SELECT e FROM EstadoGestionCita e WHERE " +
           "(:busqueda IS NULL OR LOWER(e.codEstadoCita) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(e.descEstadoCita) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
           "(:estado IS NULL OR e.statEstadoCita = :estado) " +
           "ORDER BY e.descEstadoCita ASC")
    Page<EstadoGestionCita> buscarEstadosGestionCitas(
        @Param("busqueda") String busqueda,
        @Param("estado") String estado,
        Pageable pageable
    );

    /**
     * Verifica si existe estado con código (case-insensitive)
     * Útil para validar duplicados
     *
     * @param codEstadoCita código del estado
     * @return Optional con el estado encontrado
     */
    Optional<EstadoGestionCita> findByCodEstadoCitaIgnoreCase(String codEstadoCita);

    /**
     * Obtiene cantidad de estados por estado
     *
     * @param stat estado del registro ('A' o 'I')
     * @return cantidad de estados
     */
    Long countByStatEstadoCita(String stat);
}

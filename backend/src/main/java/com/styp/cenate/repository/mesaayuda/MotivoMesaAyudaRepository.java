package com.styp.cenate.repository.mesaayuda;

import com.styp.cenate.model.mesaayuda.DimMotivosMesaAyuda;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestionar motivos de Mesa de Ayuda
 *
 * @author Styp Canto Rondón
 * @version v1.65.0 (2026-02-19)
 */
@Repository
public interface MotivoMesaAyudaRepository extends JpaRepository<DimMotivosMesaAyuda, Long> {

    /**
     * Obtener todos los motivos activos ordenados por orden
     * Utilizado para llenar el combo de selección en el modal de creación de tickets
     */
    List<DimMotivosMesaAyuda> findByActivoTrueOrderByOrdenAsc();

    /**
     * Obtener motivo por código
     */
    Optional<DimMotivosMesaAyuda> findByCodigo(String codigo);

    /**
     * Búsqueda paginada de motivos con filtros
     */
    @Query(value = "SELECT * FROM public.dim_motivos_mesadeayuda m WHERE " +
           "(:busqueda IS NULL OR LOWER(m.codigo) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
           "(:estado IS NULL OR " +
           " (:estado = 'A' AND m.activo = true) OR " +
           " (:estado = 'I' AND m.activo = false)) " +
           "ORDER BY m.orden ASC",
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM public.dim_motivos_mesadeayuda m WHERE " +
           "(:busqueda IS NULL OR LOWER(m.codigo) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
           "(:estado IS NULL OR " +
           " (:estado = 'A' AND m.activo = true) OR " +
           " (:estado = 'I' AND m.activo = false))")
    Page<DimMotivosMesaAyuda> buscar(
        @Param("busqueda") String busqueda,
        @Param("estado") String estado,
        Pageable pageable
    );

    long countByActivoTrue();

    long countByActivoFalse();

}

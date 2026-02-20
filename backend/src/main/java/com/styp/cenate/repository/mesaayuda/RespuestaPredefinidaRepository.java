package com.styp.cenate.repository.mesaayuda;

import com.styp.cenate.model.mesaayuda.DimRespuestasPredefinidas;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestionar respuestas predefinidas de Mesa de Ayuda
 *
 * @author Styp Canto Rondón
 * @version v1.65.10 (2026-02-19)
 */
@Repository
public interface RespuestaPredefinidaRepository extends JpaRepository<DimRespuestasPredefinidas, Long> {

    List<DimRespuestasPredefinidas> findByActivoTrueOrderByOrdenAsc();

    Optional<DimRespuestasPredefinidas> findByCodigo(String codigo);

    @Query(value = "SELECT * FROM public.dim_respuestas_predefinidas_mesa_ayuda r WHERE " +
           "(:busqueda IS NULL OR LOWER(r.codigo) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(r.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
           "(:estado IS NULL OR " +
           " (:estado = 'A' AND r.activo = true) OR " +
           " (:estado = 'I' AND r.activo = false)) " +
           "ORDER BY r.orden ASC",
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM public.dim_respuestas_predefinidas_mesa_ayuda r WHERE " +
           "(:busqueda IS NULL OR LOWER(r.codigo) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(r.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
           "(:estado IS NULL OR " +
           " (:estado = 'A' AND r.activo = true) OR " +
           " (:estado = 'I' AND r.activo = false))")
    Page<DimRespuestasPredefinidas> buscar(
        @Param("busqueda") String busqueda,
        @Param("estado") String estado,
        Pageable pageable
    );

    long countByActivoTrue();

    long countByActivoFalse();

}

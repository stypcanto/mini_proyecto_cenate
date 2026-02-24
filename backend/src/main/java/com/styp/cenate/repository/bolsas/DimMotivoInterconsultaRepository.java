package com.styp.cenate.repository.bolsas;

import com.styp.cenate.model.bolsas.DimMotivoInterconsulta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DimMotivoInterconsultaRepository extends JpaRepository<DimMotivoInterconsulta, Long> {

    List<DimMotivoInterconsulta> findByActivoTrueOrderByOrdenAsc();

    Optional<DimMotivoInterconsulta> findByCodigo(String codigo);

    @Query(value = "SELECT * FROM public.dim_motivo_interconsulta m WHERE " +
           "(:busqueda IS NULL OR LOWER(m.codigo) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
           "(:estado IS NULL OR " +
           " (:estado = 'A' AND m.activo = true) OR " +
           " (:estado = 'I' AND m.activo = false)) " +
           "ORDER BY m.orden ASC",
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM public.dim_motivo_interconsulta m WHERE " +
           "(:busqueda IS NULL OR LOWER(m.codigo) LIKE LOWER(CONCAT('%', :busqueda, '%')) " +
           "OR LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND " +
           "(:estado IS NULL OR " +
           " (:estado = 'A' AND m.activo = true) OR " +
           " (:estado = 'I' AND m.activo = false))")
    Page<DimMotivoInterconsulta> buscar(
        @Param("busqueda") String busqueda,
        @Param("estado") String estado,
        Pageable pageable
    );

    long countByActivoTrue();

    long countByActivoFalse();
}

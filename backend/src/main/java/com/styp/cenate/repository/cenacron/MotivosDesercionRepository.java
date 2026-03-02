package com.styp.cenate.repository.cenacron;

import com.styp.cenate.model.cenacron.DimMotivosDesercion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para Motivos de Deserción
 * @version v1.84.0 - 2026-03-02
 */
@Repository
public interface MotivosDesercionRepository extends JpaRepository<DimMotivosDesercion, Long> {

    List<DimMotivosDesercion> findByActivoTrueOrderByOrdenAsc();

    Optional<DimMotivosDesercion> findByCodigo(String codigo);

    long countByActivoTrue();
    long countByActivoFalse();

    @Query(value = """
        SELECT * FROM dim_motivos_desercion
        WHERE (:busqueda IS NULL OR codigo ILIKE '%' || :busqueda || '%'
                               OR descripcion ILIKE '%' || :busqueda || '%'
                               OR categoria   ILIKE '%' || :busqueda || '%')
          AND (:estado IS NULL
               OR (:estado = 'activo'   AND activo = TRUE)
               OR (:estado = 'inactivo' AND activo = FALSE))
        ORDER BY orden ASC
        """,
        countQuery = """
        SELECT COUNT(*) FROM dim_motivos_desercion
        WHERE (:busqueda IS NULL OR codigo ILIKE '%' || :busqueda || '%'
                               OR descripcion ILIKE '%' || :busqueda || '%'
                               OR categoria   ILIKE '%' || :busqueda || '%')
          AND (:estado IS NULL
               OR (:estado = 'activo'   AND activo = TRUE)
               OR (:estado = 'inactivo' AND activo = FALSE))
        """,
        nativeQuery = true)
    Page<DimMotivosDesercion> buscar(
            @Param("busqueda") String busqueda,
            @Param("estado")   String estado,
            Pageable pageable);
}

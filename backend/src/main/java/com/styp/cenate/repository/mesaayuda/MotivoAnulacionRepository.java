package com.styp.cenate.repository.mesaayuda;

import com.styp.cenate.model.mesaayuda.DimMotivoAnulacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para Motivos de Anulación de Citas
 * @version v1.85.27 - 2026-03-06
 */
@Repository
public interface MotivoAnulacionRepository extends JpaRepository<DimMotivoAnulacion, Long> {

    List<DimMotivoAnulacion> findByActivoTrueOrderByOrdenAsc();

    Optional<DimMotivoAnulacion> findByCodigo(String codigo);

    long countByActivoTrue();
    long countByActivoFalse();

    @Query(value = """
        SELECT * FROM dim_motivo_anulacion
        WHERE (:busqueda IS NULL OR codigo      ILIKE '%' || :busqueda || '%'
                               OR descripcion  ILIKE '%' || :busqueda || '%')
          AND (:estado IS NULL
               OR (:estado = 'activo'   AND activo = TRUE)
               OR (:estado = 'inactivo' AND activo = FALSE))
        ORDER BY orden ASC
        """,
        countQuery = """
        SELECT COUNT(*) FROM dim_motivo_anulacion
        WHERE (:busqueda IS NULL OR codigo      ILIKE '%' || :busqueda || '%'
                               OR descripcion  ILIKE '%' || :busqueda || '%')
          AND (:estado IS NULL
               OR (:estado = 'activo'   AND activo = TRUE)
               OR (:estado = 'inactivo' AND activo = FALSE))
        """,
        nativeQuery = true)
    Page<DimMotivoAnulacion> buscar(
            @Param("busqueda") String busqueda,
            @Param("estado")   String estado,
            Pageable pageable);
}

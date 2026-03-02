package com.styp.cenate.repository.cenacron;

import com.styp.cenate.model.cenacron.DimMotivosBajaCenacron;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MotivosBajaCenacronRepository extends JpaRepository<DimMotivosBajaCenacron, Long> {

    List<DimMotivosBajaCenacron> findByActivoTrueOrderByOrdenAsc();

    Optional<DimMotivosBajaCenacron> findByCodigo(String codigo);

    @Query(value = """
        SELECT * FROM dim_motivos_baja_cenacron m
        WHERE (:busqueda IS NULL
               OR LOWER(m.codigo)      LIKE LOWER(CONCAT('%', :busqueda, '%'))
               OR LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%')))
          AND (:estado IS NULL
               OR (:estado = 'A' AND m.activo = true)
               OR (:estado = 'I' AND m.activo = false))
        ORDER BY m.orden ASC
        """,
        countQuery = """
        SELECT COUNT(*) FROM dim_motivos_baja_cenacron m
        WHERE (:busqueda IS NULL
               OR LOWER(m.codigo)      LIKE LOWER(CONCAT('%', :busqueda, '%'))
               OR LOWER(m.descripcion) LIKE LOWER(CONCAT('%', :busqueda, '%')))
          AND (:estado IS NULL
               OR (:estado = 'A' AND m.activo = true)
               OR (:estado = 'I' AND m.activo = false))
        """,
        nativeQuery = true)
    Page<DimMotivosBajaCenacron> buscar(
        @Param("busqueda") String busqueda,
        @Param("estado")   String estado,
        Pageable pageable
    );

    long countByActivoTrue();
    long countByActivoFalse();
}

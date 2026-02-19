package com.styp.cenate.repository.mesaayuda;

import com.styp.cenate.model.mesaayuda.DimMotivosMesaAyuda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestionar motivos de Mesa de Ayuda
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18)
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

}

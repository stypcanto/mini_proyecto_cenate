package com.styp.cenate.repository.mesaayuda;

import com.styp.cenate.model.mesaayuda.DimRespuestasPredefinidas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para respuestas predefinidas de Mesa de Ayuda
 *
 * @version v1.65.10 (2026-02-19)
 */
@Repository
public interface RespuestasPredefinidasRepository extends JpaRepository<DimRespuestasPredefinidas, Long> {

    List<DimRespuestasPredefinidas> findByActivoTrueOrderByOrdenAsc();
}

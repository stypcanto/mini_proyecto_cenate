package com.styp.cenate.repository.bolsas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.bolsas.HistorialCargaBolsas;
import java.util.List;

/**
 * Repositorio para HistorialCargaBolsas
 * Tabla: dim_historial_carga_bolsas
 */
@Repository
public interface HistorialCargaBolsasRepository extends JpaRepository<HistorialCargaBolsas, Long> {
    
    // Obtener historial ordenado por fecha descendente
    List<HistorialCargaBolsas> findAllByOrderByFechaReporteDesc();
}

package com.styp.cenate.repository.bolsas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.bolsas.HistorialCargaBolsas;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para HistorialCargaBolsas
 * Tabla: dim_historial_carga_bolsas
 */
@Repository
public interface HistorialCargaBolsasRepository extends JpaRepository<HistorialCargaBolsas, Long> {

    // Obtener historial ordenado por fecha descendente
    List<HistorialCargaBolsas> findAllByOrderByFechaReporteDesc();

    // ✅ v1.40.0: Validar si un archivo ya fue cargado por su hash SHA-256
    Optional<HistorialCargaBolsas> findByHashArchivo(String hashArchivo);
}

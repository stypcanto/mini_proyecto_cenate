package com.styp.cenate.repository.bolsas;

import com.styp.cenate.model.bolsas.DimEstadosGestionCitas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * Repositorio para gestión de Estados de Gestión de Citas
 * Proporciona acceso a datos de dim_estados_gestion_citas
 *
 * @version v1.0.0
 * @since 2026-01-30
 */
@Repository
public interface DimEstadosGestionCitasRepository extends JpaRepository<DimEstadosGestionCitas, Long> {

    /**
     * Busca un estado por su código
     * @param codigoEstado código del estado (ej: PENDIENTE_CITA, CITADO)
     * @return Optional con el estado encontrado
     */
    Optional<DimEstadosGestionCitas> findByCodigoEstado(String codigoEstado);

    /**
     * Obtiene todos los estados activos
     * @return lista de estados activos
     */
    List<DimEstadosGestionCitas> findByStatusEstado(String statusEstado);
}

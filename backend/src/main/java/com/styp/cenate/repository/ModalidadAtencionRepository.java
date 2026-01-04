package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.ModalidadAtencion;

import java.util.List;
import java.util.Optional;

/**
 * 🏥 Repositorio para gestionar Modalidades de Atención
 * (TELECONSULTA, TELECONSULTORIO, AMBOS, NO SE BRINDA SERVICIO)
 */
@Repository
public interface ModalidadAtencionRepository extends JpaRepository<ModalidadAtencion, Long> {

    /**
     * Obtener modalidades activas
     */
    List<ModalidadAtencion> findByStatModAten(String statModAten);

    /**
     * Buscar por descripción (ignorando mayúsculas/minúsculas)
     */
    Optional<ModalidadAtencion> findByDescModAtenIgnoreCase(String descModAten);

    /**
     * Validar si existe una modalidad por descripción
     */
    boolean existsByDescModAtenIgnoreCase(String descModAten);
}

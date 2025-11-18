package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.TipoIpress;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad TipoIpress.
 */
@Repository
public interface TipoIpressRepository extends JpaRepository<TipoIpress, Long> {

    /**
     * Obtiene todos los tipos de IPRESS con un estado específico.
     * Ejemplo: findByEstadoIgnoreCase("A")
     */
    List<TipoIpress> findByEstadoIgnoreCase(String estado);

    /**
     * Busca un tipo de IPRESS por descripción (ignora mayúsculas/minúsculas).
     */
    Optional<TipoIpress> findByDescripcionIgnoreCase(String descripcion);

    /**
     * Verifica si existe un tipo de IPRESS con la misma descripción.
     */
    boolean existsByDescripcionIgnoreCase(String descripcion);
}
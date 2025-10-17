package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.NivelAtencion;

import java.util.List;

@Repository
public interface NivelAtencionRepository extends JpaRepository<NivelAtencion, Long> {

    /**
     * 🔹 Filtra niveles de atención activos o inactivos (campo: estado)
     */
    List<NivelAtencion> findByEstadoIgnoreCase(String estado);

    /**
     * 🔹 Verifica si existe un nivel de atención por su descripción (campo: descripcion)
     */
    boolean existsByDescripcionIgnoreCase(String descripcion);
}
package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.Area;

import java.util.List;
import java.util.Optional;

@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {

    // 🔹 Obtener todas las áreas por estado (A = activas, I = inactivas)
    List<Area> findByStatArea(String statArea);

    // 🔹 Buscar por descripción (ignorando mayúsculas/minúsculas)
    Optional<Area> findByDescAreaIgnoreCase(String descArea);

    // 🔹 Validar si ya existe una descripción (para evitar duplicados)
    boolean existsByDescAreaIgnoreCase(String descArea);
}

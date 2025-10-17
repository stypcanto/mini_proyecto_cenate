package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.Permiso;

import java.util.List;

@Repository
public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    // 🔍 Permisos asociados a un rol específico (útil si lo necesitas en el futuro)
    List<Permiso> findByRol_IdRol(Integer idRol);

    // 🔍 Validar si un permiso ya existe dentro de un rol (para no duplicar)
    boolean existsByRol_IdRolAndDescPermiso(Integer idRol, String descPermiso);
}
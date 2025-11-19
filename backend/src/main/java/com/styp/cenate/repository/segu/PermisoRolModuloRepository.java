package com.styp.cenate.repository.segu;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.segu.SeguPermisosRolModulo;

@Repository
public interface PermisoRolModuloRepository extends JpaRepository<SeguPermisosRolModulo, Integer> {
    Optional<SeguPermisosRolModulo> findByIdRolAndIdModulo(Integer idRol, Integer idModulo);
}
package com.styp.cenate.repository.segu;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.segu.SeguPermisosRolPagina;

@Repository
public interface PermisoRolPaginaRepository extends JpaRepository<SeguPermisosRolPagina, Integer> {
    Optional<SeguPermisosRolPagina> findByIdRolAndIdPagina(Integer idRol, Integer idPagina);
}
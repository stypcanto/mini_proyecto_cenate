package com.styp.cenate.repository.segu;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.segu.SeguPermisosRolPagina;

@Repository
public interface PermisoRolPaginaRepository extends JpaRepository<SeguPermisosRolPagina, Integer> {
    Optional<SeguPermisosRolPagina> findByIdRolAndIdPagina(Integer idRol, Integer idPagina);

    /** Obtiene todos los permisos predeterminados para un rol específico */
    List<SeguPermisosRolPagina> findByIdRolAndActivoTrue(Integer idRol);

    /** Obtiene todos los permisos predeterminados para múltiples roles */
    @Query("SELECT p FROM SeguPermisosRolPagina p WHERE p.idRol IN :roleIds AND p.activo = true")
    List<SeguPermisosRolPagina> findByIdRolInAndActivoTrue(@Param("roleIds") List<Integer> roleIds);

    /** Elimina todos los permisos asociados a una página */
    void deleteByIdPagina(Integer idPagina);
}
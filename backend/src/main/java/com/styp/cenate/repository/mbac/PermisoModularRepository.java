package com.styp.cenate.repository.mbac;

import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.model.PermisoModular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 🧩 Repositorio para la gestión de permisos modulares (MBAC)
 * Gestiona las asociaciones entre roles, páginas y módulos.
 */
@Repository
public interface PermisoModularRepository extends JpaRepository<PermisoModular, Integer> {

    // ===========================================================
    // 🔹 Buscar permisos activos de un rol
    // ===========================================================
    @Query("SELECT p FROM PermisoModular p WHERE p.rol.idRol = :idRol AND p.activo = true")
    List<PermisoModular> findByRolIdAndActivoTrue(@Param("idRol") Integer idRol);

    // ===========================================================
    // 🔹 Buscar permisos activos de una página
    // ===========================================================
    @Query("SELECT p FROM PermisoModular p WHERE p.pagina.idPagina = :idPagina AND p.activo = true")
    List<PermisoModular> findByPaginaIdAndActivoTrue(@Param("idPagina") Integer idPagina);

    // ===========================================================
    // 🔹 Buscar permiso específico por rol y página
    // ===========================================================
    @Query("SELECT p FROM PermisoModular p WHERE p.rol.idRol = :idRol AND p.pagina.idPagina = :idPagina")
    Optional<PermisoModular> findByRolIdAndPaginaId(@Param("idRol") Integer idRol, @Param("idPagina") Integer idPagina);

    // ===========================================================
    // 🔹 Buscar permisos activos por rol y página
    // ===========================================================
    @Query("SELECT p FROM PermisoModular p WHERE p.rol.idRol = :idRol AND p.pagina.idPagina = :idPagina AND p.activo = true")
    Optional<PermisoModular> findByRolIdAndPaginaIdAndActivoTrue(@Param("idRol") Integer idRol, @Param("idPagina") Integer idPagina);

    // ===========================================================
    // 🔹 Verificar si existe permiso para rol y página
    // ===========================================================
    boolean existsByRolIdRolAndPaginaIdPagina(Integer idRol, Integer idPagina);

    // ===========================================================
    // 🔹 Obtener todos los permisos con detalles (rol + módulo + página)
    // ===========================================================
    @Query("""
        SELECT p FROM PermisoModular p
        JOIN FETCH p.rol
        JOIN FETCH p.pagina pg
        JOIN FETCH pg.modulo
        WHERE p.activo = true
    """)
    List<PermisoModular> findAllPermisosWithDetails();

    // ===========================================================
    // 🔹 Obtener permisos de un rol con todos los detalles
    // ===========================================================
    @Query("""
        SELECT p FROM PermisoModular p
        JOIN FETCH p.rol r
        JOIN FETCH p.pagina pg
        JOIN FETCH pg.modulo
        WHERE r.idRol = :idRol AND p.activo = true
    """)
    List<PermisoModular> findByRolIdWithDetails(@Param("idRol") Integer idRol);

    // ===========================================================
    // 🧠 Obtener permisos asignados a un usuario (a través del rol)
    // ===========================================================
    @Query("""
        SELECT new com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO(
            pm.idPermisoModular,
            pg.rutaPagina,
            pg.nombrePagina,
            m.nombreModulo,
            pm.ver,
            pm.crear,
            pm.editar,
            pm.eliminar,
            pm.exportar,
            pm.aprobar
        )
        FROM PermisoModular pm
        JOIN pm.pagina pg
        JOIN pg.modulo m
        JOIN pm.rol r
        JOIN Usuario u ON u.rol.idRol = r.idRol
        WHERE u.idUser = :idUser
    """)
    List<PermisoUsuarioResponseDTO> findPermisosPorUsuarioId(@Param("idUser") Long idUser);
}
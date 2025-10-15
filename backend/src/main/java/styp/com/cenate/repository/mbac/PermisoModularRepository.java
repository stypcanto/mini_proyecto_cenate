package styp.com.cenate.repository.mbac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.PermisoModular;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de permisos modulares.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Repository
public interface PermisoModularRepository extends JpaRepository<PermisoModular, Integer> {

    /**
     * Busca todos los permisos activos de un rol.
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.rol.idRol = :idRol AND p.activo = true")
    List<PermisoModular> findByRolIdAndActivoTrue(@Param("idRol") Integer idRol);

    /**
     * Busca todos los permisos activos de una página.
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.pagina.idPagina = :idPagina AND p.activo = true")
    List<PermisoModular> findByPaginaIdAndActivoTrue(@Param("idPagina") Integer idPagina);

    /**
     * Busca un permiso específico por rol y página.
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.rol.idRol = :idRol AND p.pagina.idPagina = :idPagina")
    Optional<PermisoModular> findByRolIdAndPaginaId(@Param("idRol") Integer idRol, @Param("idPagina") Integer idPagina);

    /**
     * Busca permisos activos por rol y página.
     */
    @Query("SELECT p FROM PermisoModular p WHERE p.rol.idRol = :idRol AND p.pagina.idPagina = :idPagina AND p.activo = true")
    Optional<PermisoModular> findByRolIdAndPaginaIdAndActivoTrue(@Param("idRol") Integer idRol, @Param("idPagina") Integer idPagina);

    /**
     * Verifica si existe un permiso para un rol y página específicos.
     */
    boolean existsByRolIdRolAndPaginaIdPagina(Integer idRol, Integer idPagina);

    /**
     * Obtiene todos los permisos con información de rol, página y módulo.
     */
    @Query("SELECT p FROM PermisoModular p " +
           "JOIN FETCH p.rol " +
           "JOIN FETCH p.pagina pg " +
           "JOIN FETCH pg.modulo " +
           "WHERE p.activo = true")
    List<PermisoModular> findAllPermisosWithDetails();

    /**
     * Obtiene permisos de un rol con todos los detalles.
     */
    @Query("SELECT p FROM PermisoModular p " +
           "JOIN FETCH p.rol r " +
           "JOIN FETCH p.pagina pg " +
           "JOIN FETCH pg.modulo " +
           "WHERE r.idRol = :idRol AND p.activo = true")
    List<PermisoModular> findByRolIdWithDetails(@Param("idRol") Integer idRol);
}

package styp.com.cenate.repository.mbac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import styp.com.cenate.model.view.PermisoActivoView;

import java.util.List;

/**
 * Repositorio para consultar la vista vw_permisos_activos.
 * Esta vista es de solo lectura y proporciona una consulta optimizada
 * de permisos activos por usuario.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Repository
public interface PermisoActivoViewRepository extends JpaRepository<PermisoActivoView, Long> {

    /**
     * Obtiene todos los permisos activos de un usuario.
     */
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE id_user = :userId", nativeQuery = true)
    List<PermisoActivoView> findByUserId(@Param("userId") Long userId);

    /**
     * Obtiene los permisos de un usuario para una página específica.
     */
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE id_user = :userId AND ruta_pagina = :rutaPagina", 
           nativeQuery = true)
    List<PermisoActivoView> findByUserIdAndRutaPagina(@Param("userId") Long userId, 
                                                        @Param("rutaPagina") String rutaPagina);

    /**
     * Obtiene los permisos de un usuario para un módulo específico.
     */
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE id_user = :userId AND id_modulo = :idModulo", 
           nativeQuery = true)
    List<PermisoActivoView> findByUserIdAndModuloId(@Param("userId") Long userId, 
                                                     @Param("idModulo") Integer idModulo);

    /**
     * Obtiene los permisos de un usuario por nombre de usuario.
     */
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE usuario = :username", nativeQuery = true)
    List<PermisoActivoView> findByUsername(@Param("username") String username);

    /**
     * Verifica si un usuario tiene un permiso específico en una página.
     */
    @Query(value = """
        SELECT CASE 
            WHEN :accion = 'ver' THEN COALESCE(MAX(puede_ver::int), 0)
            WHEN :accion = 'crear' THEN COALESCE(MAX(puede_crear::int), 0)
            WHEN :accion = 'editar' THEN COALESCE(MAX(puede_editar::int), 0)
            WHEN :accion = 'eliminar' THEN COALESCE(MAX(puede_eliminar::int), 0)
            WHEN :accion = 'exportar' THEN COALESCE(MAX(puede_exportar::int), 0)
            WHEN :accion = 'aprobar' THEN COALESCE(MAX(puede_aprobar::int), 0)
            ELSE 0
        END as tiene_permiso
        FROM vw_permisos_activos 
        WHERE id_user = :userId AND ruta_pagina = :rutaPagina
    """, nativeQuery = true)
    Integer checkPermiso(@Param("userId") Long userId, 
                        @Param("rutaPagina") String rutaPagina, 
                        @Param("accion") String accion);

    /**
     * Obtiene todos los módulos únicos a los que un usuario tiene acceso.
     */
    @Query(value = "SELECT DISTINCT modulo FROM vw_permisos_activos WHERE id_user = :userId ORDER BY modulo", 
           nativeQuery = true)
    List<String> findModulosByUserId(@Param("userId") Long userId);

    /**
     * Obtiene todas las páginas de un módulo a las que un usuario tiene acceso.
     */
    @Query(value = """
        SELECT DISTINCT pagina 
        FROM vw_permisos_activos 
        WHERE id_user = :userId AND id_modulo = :idModulo 
        ORDER BY pagina
    """, nativeQuery = true)
    List<String> findPaginasByUserIdAndModuloId(@Param("userId") Long userId, 
                                                 @Param("idModulo") Integer idModulo);
}

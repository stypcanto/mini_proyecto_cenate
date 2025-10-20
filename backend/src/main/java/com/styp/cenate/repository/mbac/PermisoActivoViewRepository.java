package com.styp.cenate.repository.mbac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.view.PermisoActivoView;

import java.util.List;

/**
 * 📘 Repositorio para consultar la vista {@code vw_permisos_activos}.
 * Vista de solo lectura que optimiza la obtención de permisos activos por usuario.
 *
 * @author CENATE
 * @version 3.0
 */
@Repository
public interface PermisoActivoViewRepository extends JpaRepository<PermisoActivoView, Long> {

    // ---------------------------------------------------------
    // 🔹 1. Permisos por usuario
    // ---------------------------------------------------------
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE id_user = :userId", nativeQuery = true)
    List<PermisoActivoView> findByUserId(@Param("userId") Long userId);

    // ---------------------------------------------------------
    // 🔹 2. Permisos por usuario y ruta
    // ---------------------------------------------------------
    @Query(value = """
        SELECT * 
        FROM vw_permisos_activos 
        WHERE id_user = :userId 
          AND LOWER(ruta_pagina) = LOWER(:rutaPagina)
    """, nativeQuery = true)
    List<PermisoActivoView> findByUserIdAndRutaPagina(
            @Param("userId") Long userId,
            @Param("rutaPagina") String rutaPagina
    );

    // ---------------------------------------------------------
    // 🔹 3. Permisos por usuario y módulo
    // ---------------------------------------------------------
    @Query(value = """
        SELECT * 
        FROM vw_permisos_activos 
        WHERE id_user = :userId 
          AND id_modulo = :idModulo
    """, nativeQuery = true)
    List<PermisoActivoView> findByUserIdAndModuloId(
            @Param("userId") Long userId,
            @Param("idModulo") Integer idModulo
    );

    // ---------------------------------------------------------
    // 🔹 4. Permisos por username
    // ---------------------------------------------------------
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE LOWER(usuario) = LOWER(:username)", nativeQuery = true)
    List<PermisoActivoView> findByUsername(@Param("username") String username);

    // ---------------------------------------------------------
    // 🔹 5. Verificar si un usuario tiene un permiso específico
    // ---------------------------------------------------------
    @Query(value = """
        SELECT CASE 
            WHEN COUNT(*) > 0 THEN 1 
            ELSE 0 
        END
        FROM vw_permisos_activos pav
        WHERE pav.id_user = :userId
          AND LOWER(pav.ruta_pagina) = LOWER(:rutaPagina)
          AND (
              (:accion = 'ver' AND pav.puede_ver = TRUE) OR
              (:accion = 'crear' AND pav.puede_crear = TRUE) OR
              (:accion = 'editar' AND pav.puede_editar = TRUE) OR
              (:accion = 'eliminar' AND pav.puede_eliminar = TRUE) OR
              (:accion = 'exportar' AND pav.puede_exportar = TRUE) OR
              (:accion = 'aprobar' AND pav.puede_aprobar = TRUE)
          )
    """, nativeQuery = true)
    Integer checkPermiso(
            @Param("userId") Long userId,
            @Param("rutaPagina") String rutaPagina,
            @Param("accion") String accion
    );

    // ---------------------------------------------------------
    // 🔹 6. Módulos accesibles
    // ---------------------------------------------------------
    @Query(value = """
        SELECT DISTINCT modulo 
        FROM vw_permisos_activos 
        WHERE id_user = :userId 
        ORDER BY modulo
    """, nativeQuery = true)
    List<String> findModulosByUserId(@Param("userId") Long userId);

    // ---------------------------------------------------------
    // 🔹 7. Páginas accesibles por módulo
    // ---------------------------------------------------------
    @Query(value = """
        SELECT DISTINCT pagina 
        FROM vw_permisos_activos 
        WHERE id_user = :userId 
          AND id_modulo = :idModulo 
        ORDER BY pagina
    """, nativeQuery = true)
    List<String> findPaginasByUserIdAndModuloId(
            @Param("userId") Long userId,
            @Param("idModulo") Integer idModulo
    );
}
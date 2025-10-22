package com.styp.cenate.repository.view;

import com.styp.cenate.dto.mbac.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 🧭 Repositorio conectado directamente a la vista PostgreSQL `vw_permisos_activos`.
 * --------------------------------------------------------------
 * Desde aquí se consulta y valida toda la lógica MBAC (roles, módulos, páginas).
 *
 * Autor: CENATE Development Team
 * Versión: 1.3 (2025)
 */
@Repository
public interface PermisoActivoViewRepository extends JpaRepository<PermisoUsuarioResponseDTO, Long> {

    // 🔹 Permisos por usuario (ID)
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE id_user = :userId", nativeQuery = true)
    List<PermisoUsuarioResponseDTO> findPermisosByUserId(Long userId);

    // 🔹 Permisos por nombre de usuario
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE usuario = :username", nativeQuery = true)
    List<PermisoUsuarioResponseDTO> findPermisosByUsername(String username);

    // 🔹 Permisos por usuario y módulo
    @Query(value = "SELECT * FROM vw_permisos_activos WHERE id_user = :userId AND id_modulo = :idModulo", nativeQuery = true)
    List<PermisoUsuarioResponseDTO> findPermisosByUserIdAndModulo(Long userId, Integer idModulo);

    // 🔹 Módulos accesibles
    @Query(value = """
        SELECT DISTINCT id_modulo AS idModulo,
               modulo AS nombreModulo
        FROM vw_permisos_activos
        WHERE id_user = :userId
          AND id_modulo IS NOT NULL
        ORDER BY modulo
    """, nativeQuery = true)
    List<ModuloSistemaResponse> findModulosAccesiblesPorUsuario(Long userId);

    // 🔹 Páginas accesibles
    @Query(value = """
        SELECT DISTINCT id_pagina AS idPagina,
               pagina AS nombrePagina,
               ruta_pagina AS rutaPagina
        FROM vw_permisos_activos
        WHERE id_user = :userId
          AND id_modulo = :idModulo
        ORDER BY pagina
    """, nativeQuery = true)
    List<PaginaModuloResponse> findPaginasAccesiblesPorUsuario(Long userId, Integer idModulo);

    // 🔹 Validación dinámica (MBACPermissionAspect)
    @Query(value = """
        SELECT COUNT(*) > 0
        FROM vw_permisos_activos
        WHERE id_user = :userId
          AND ruta_pagina = :rutaPagina
          AND (
              (:accion = 'VER' AND puede_ver = true) OR
              (:accion = 'CREAR' AND puede_crear = true) OR
              (:accion = 'ACTUALIZAR' AND puede_actualizar = true) OR
              (:accion = 'ELIMINAR' AND puede_eliminar = true) OR
              (:accion = 'EDITAR' AND puede_editar = true) OR
              (:accion = 'EXPORTAR' AND puede_exportar = true) OR
              (:accion = 'APROBAR' AND puede_aprobar = true)
          )
    """, nativeQuery = true)
    boolean existePermisoActivo(Long userId, String rutaPagina, String accion);
}